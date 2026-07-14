const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const MAX_REQUEST_BYTES = 4.5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_REQUESTS = 12;
const PROVIDER_TIMEOUT_MS = 25_000;
const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const requestBuckets = new Map();

const responseHeaders = {
  "cache-control":"no-store",
  "content-type":"application/json; charset=utf-8",
  "x-content-type-options":"nosniff",
};

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers:{ ...responseHeaders, ...headers },
});

const publicErrors = {
  NOT_CONFIGURED:"Photo identification credentials need attention.",
  INVALID_API_KEY:"Photo identification credentials need attention.",
  BILLING_OR_QUOTA:"Photo identification needs active API billing or available API credit.",
  RATE_LIMITED:"Photo analysis is temporarily busy. Please try again shortly.",
  MODEL_NOT_AVAILABLE:"The configured vision model is unavailable.",
  INVALID_IMAGE:"This photograph could not be processed. Try JPEG, PNG, or WebP.",
  IMAGE_TOO_LARGE:"This image is too large for photo analysis. Try a closer crop or smaller photograph.",
  PROVIDER_TIMEOUT:"Photo analysis took too long. Try a smaller or clearer photograph.",
  MALFORMED_PROVIDER_RESPONSE:"Photo analysis returned an unreadable result. No identification was generated.",
  PROVIDER_UNAVAILABLE:"Photo identification is temporarily unavailable. Guided Identification is still available.",
  INVALID_REQUEST:"The photo request could not be processed.",
  INTERNAL_ERROR:"Photo identification encountered an internal error. Guided Identification is still available.",
  METHOD_NOT_ALLOWED:"Use POST for plant photo identification.",
};

const errorResponse = (code, status, requestId) => json({ status:"error", code, message:publicErrors[code] || publicErrors.INTERNAL_ERROR, requestId }, status);
const cleanText = (value, limit) => String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);
const requestId = () => globalThis.crypto?.randomUUID?.() || `plant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const diagnosticLog = (event, details = {}) => console.info(JSON.stringify({ scope:"identify-plant", event, ...details }));

function providerErrorCategory(status, payload) {
  const providerCode = cleanText(payload?.error?.code, 100).toLocaleLowerCase();
  const providerType = cleanText(payload?.error?.type, 100).toLocaleLowerCase();
  const providerMessage = cleanText(payload?.error?.message, 300).toLocaleLowerCase();
  const categoryText = `${providerCode} ${providerType} ${providerMessage}`;
  if (status === 401 || /invalid.*api.*key|authentication/.test(categoryText)) return "INVALID_API_KEY";
  if (/insufficient_quota|billing|credit|hard_limit|exceeded.*quota/.test(categoryText)) return "BILLING_OR_QUOTA";
  if (status === 429) return "RATE_LIMITED";
  if (status === 404 || /model.*not.*found|model.*does not support|unsupported.*model|image.*not.*supported|model_not_available/.test(categoryText)) return "MODEL_NOT_AVAILABLE";
  if (status === 413) return "IMAGE_TOO_LARGE";
  if (status === 408 || status === 504) return "PROVIDER_TIMEOUT";
  if (status === 400 && /image|image_url|invalid_value/.test(categoryText)) return "INVALID_IMAGE";
  if (status >= 500) return "PROVIDER_UNAVAILABLE";
  return "INTERNAL_ERROR";
}

const providerStatusCode = (category) => ({
  INVALID_API_KEY:401,
  BILLING_OR_QUOTA:402,
  RATE_LIMITED:429,
  MODEL_NOT_AVAILABLE:503,
  INVALID_IMAGE:400,
  IMAGE_TOO_LARGE:413,
  PROVIDER_TIMEOUT:504,
  PROVIDER_UNAVAILABLE:503,
  INTERNAL_ERROR:500,
}[category] || 500);

const outputSchema = {
  type:"object",
  additionalProperties:false,
  properties:{
    status:{ type:"string", enum:["success"] },
    imageQuality:{ type:"string", enum:["good", "limited", "unusable"] },
    candidates:{
      type:"array",
      maxItems:5,
      items:{
        type:"object",
        additionalProperties:false,
        properties:{
          commonName:{ type:"string" },
          botanicalName:{ type:"string" },
          family:{ type:"string" },
          confidence:{ type:"integer", minimum:0, maximum:100 },
          visibleEvidence:{ type:"array", maxItems:8, items:{ type:"string" } },
          conflictingEvidence:{ type:"array", maxItems:8, items:{ type:"string" } },
          inspectNext:{ type:"array", maxItems:8, items:{ type:"string" } },
        },
        required:["commonName", "botanicalName", "family", "confidence", "visibleEvidence", "conflictingEvidence", "inspectNext"],
      },
    },
    safetyNote:{ type:"string" },
  },
  required:["status", "imageQuality", "candidates", "safetyNote"],
};

function getClientAddress(request) {
  return cleanText(
    request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
    80,
  );
}

function consumeRateLimit(address) {
  const now = Date.now();
  const current = requestBuckets.get(address);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestBuckets.set(address, { startedAt:now, count:1 });
    return true;
  }
  if (current.count >= RATE_LIMIT_REQUESTS) return false;
  current.count += 1;
  if (requestBuckets.size > 500) {
    for (const [key, bucket] of requestBuckets) {
      if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) requestBuckets.delete(key);
    }
  }
  return true;
}

function hasExpectedMagicBytes(bytes, mimeType) {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

function validateImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(dataUrl || ""));
  if (!match || !SUPPORTED_MIME_TYPES.has(match[1])) return { error:"unsupported-type" };
  let bytes;
  try {
    bytes = Buffer.from(match[2], "base64");
  } catch {
    return { error:"invalid-image" };
  }
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) return { error:bytes.length ? "oversized-image" : "invalid-image" };
  if (!hasExpectedMagicBytes(bytes, match[1])) return { error:"invalid-image" };
  return { dataUrl:`data:${match[1]};base64,${match[2]}`, mimeType:match[1], bytes:bytes.length };
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function cleanList(value) {
  return Array.isArray(value) ? value.map((item) => cleanText(item, 280)).filter(Boolean).slice(0, 8) : [];
}

function normalizeProviderResult(value) {
  if (!value || value.status !== "success" || !["good", "limited", "unusable"].includes(value.imageQuality) || !Array.isArray(value.candidates)) return null;
  const candidates = value.candidates.slice(0, 5).map((candidate) => ({
    commonName:cleanText(candidate?.commonName, 160),
    botanicalName:cleanText(candidate?.botanicalName, 180),
    family:cleanText(candidate?.family, 140),
    confidence:Math.max(0, Math.min(100, Math.round(Number(candidate?.confidence) || 0))),
    visibleEvidence:cleanList(candidate?.visibleEvidence),
    conflictingEvidence:cleanList(candidate?.conflictingEvidence),
    inspectNext:cleanList(candidate?.inspectNext),
  })).filter((candidate) => candidate.commonName && candidate.confidence > 0);

  return {
    status:"success",
    imageQuality:value.imageQuality,
    candidates,
    safetyNote:cleanText(value.safetyNote, 500) || "Do not eat, brew, or medicinally use a wild plant based only on image identification; confirm it with a qualified local expert.",
  };
}

function buildPrompt({ subject, region, season }) {
  const observationContext = JSON.stringify({ visibleSubject:subject || "Unknown", region:region || "Not supplied", season:season || "Not supplied" });
  return [
    "Answer only this question: What plant might this be?",
    "Return at most five cautious visual candidates. Never claim certainty and never invent a botanical name; use an empty string when a botanical name or family is not supportable.",
    "Use only visible image evidence plus the minimal context below. If the image lacks identifying detail, set imageQuality to limited or unusable and return an empty candidates array.",
    "Visible evidence must name structures actually visible. Conflicting evidence must describe visible mismatches or uncertainty. Inspect next must be concrete traits that can distinguish the candidates.",
    "Do not diagnose pests, disease, deficiencies, or plant health. Always warn against eating, brewing, or medicinal use from image identification alone.",
    `Minimal observation context: ${observationContext}`,
  ].join("\n");
}

export default async function handler(request) {
  const startedAt = Date.now();
  const id = requestId();
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const model = cleanText(process.env.OPENAI_VISION_MODEL, 120);
  diagnosticLog("request-received", { requestId:id, method:request.method });

  if (request.method === "GET") {
    const providerStatus = !apiKey ? "CREDENTIALS_MISSING" : !model ? "MODEL_CONFIGURATION_ERROR" : "READY";
    diagnosticLog("diagnostic-check", {
      requestId:id,
      providerStatus,
      apiKeyPresent:Boolean(apiKey),
      modelConfigured:Boolean(model),
      durationMs:Date.now() - startedAt,
    });
    return json({
      status:"ok",
      providerStatus,
      checks:{ functionReachable:true, apiKeyPresent:Boolean(apiKey), modelConfigured:Boolean(model) },
    });
  }

  if (request.method !== "POST") return errorResponse("METHOD_NOT_ALLOWED", 405, id);
  if (!apiKey) return errorResponse("NOT_CONFIGURED", 503, id);
  if (!model) return errorResponse("MODEL_NOT_AVAILABLE", 503, id);
  if (!consumeRateLimit(getClientAddress(request))) {
    diagnosticLog("request-rejected", { requestId:id, errorCategory:"RATE_LIMITED", source:"function", durationMs:Date.now() - startedAt });
    return errorResponse("RATE_LIMITED", 429, id);
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    diagnosticLog("request-validation", { requestId:id, success:false, errorCategory:"INVALID_REQUEST", durationMs:Date.now() - startedAt });
    return errorResponse("INVALID_REQUEST", 400, id);
  }
  if (!rawBody || Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
    diagnosticLog("request-validation", { requestId:id, success:false, errorCategory:"IMAGE_TOO_LARGE", durationMs:Date.now() - startedAt });
    return errorResponse("IMAGE_TOO_LARGE", 413, id);
  }

  let input;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return errorResponse("INVALID_REQUEST", 400, id);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) return errorResponse("INVALID_REQUEST", 400, id);
  const extraKeys = Object.keys(input).filter((key) => !["image", "subject", "context"].includes(key));
  if (extraKeys.length || (input.context != null && (typeof input.context !== "object" || Array.isArray(input.context)))) {
    return errorResponse("INVALID_REQUEST", 400, id);
  }
  const contextKeys = Object.keys(input.context || {}).filter((key) => !["region", "season"].includes(key));
  if (contextKeys.length) return errorResponse("INVALID_REQUEST", 400, id);

  const image = validateImage(input.image);
  if (image.error === "oversized-image") return errorResponse("IMAGE_TOO_LARGE", 413, id);
  if (image.error) return errorResponse("INVALID_IMAGE", image.error === "unsupported-type" ? 415 : 400, id);

  diagnosticLog("image-validated", {
    requestId:id,
    imageMimeType:image.mimeType,
    imageBytes:image.bytes,
    model,
  });

  const subject = cleanText(input.subject, 60);
  const region = cleanText(input.context?.region, 120);
  const season = cleanText(input.context?.season, 40);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  const providerStartedAt = Date.now();

  try {
    const providerResponse = await fetch(OPENAI_RESPONSES_ENDPOINT, {
      method:"POST",
      headers:{
        authorization:`Bearer ${apiKey}`,
        "content-type":"application/json",
      },
      body:JSON.stringify({
        model,
        store:false,
        input:[
          { role:"system", content:"You are a cautious botanical field-identification assistant. Follow the response schema exactly." },
          {
            role:"user",
            content:[
              { type:"input_text", text:buildPrompt({ subject, region, season }) },
              { type:"input_image", image_url:image.dataUrl, detail:"high" },
            ],
          },
        ],
        text:{
          format:{
            type:"json_schema",
            name:"plant_photo_identification",
            strict:true,
            schema:outputSchema,
          },
        },
        max_output_tokens:2600,
      }),
      signal:controller.signal,
    });

    let providerPayload = null;
    let providerJsonParsed = true;
    try {
      providerPayload = await providerResponse.json();
    } catch {
      providerJsonParsed = false;
    }

    const providerCategory = providerResponse.ok
      ? providerJsonParsed ? "SUCCESS" : "MALFORMED_PROVIDER_RESPONSE"
      : providerErrorCategory(providerResponse.status, providerPayload);
    diagnosticLog("provider-response", {
      requestId:id,
      model,
      providerHttpStatus:providerResponse.status,
      providerErrorCategory:providerCategory,
      responseJsonParsed:providerJsonParsed,
      durationMs:Date.now() - providerStartedAt,
    });

    if (!providerResponse.ok) return errorResponse(providerCategory, providerStatusCode(providerCategory), id);
    if (!providerJsonParsed) return errorResponse("MALFORMED_PROVIDER_RESPONSE", 502, id);

    let parsed;
    try {
      const outputText = extractOutputText(providerPayload);
      if (!outputText) throw new Error("missing-output-text");
      parsed = JSON.parse(outputText);
    } catch {
      diagnosticLog("response-parsing", { requestId:id, success:false, errorCategory:"MALFORMED_PROVIDER_RESPONSE", durationMs:Date.now() - startedAt });
      return errorResponse("MALFORMED_PROVIDER_RESPONSE", 502, id);
    }
    const result = normalizeProviderResult(parsed);
    if (!result) {
      diagnosticLog("response-parsing", { requestId:id, success:false, errorCategory:"MALFORMED_PROVIDER_RESPONSE", durationMs:Date.now() - startedAt });
      return errorResponse("MALFORMED_PROVIDER_RESPONSE", 502, id);
    }
    diagnosticLog("response-parsing", {
      requestId:id,
      success:true,
      candidateCount:result.candidates.length,
      imageQuality:result.imageQuality,
      durationMs:Date.now() - startedAt,
    });
    return json(result);
  } catch (error) {
    const category = error?.name === "AbortError" ? "PROVIDER_TIMEOUT" : "PROVIDER_UNAVAILABLE";
    diagnosticLog("provider-exception", { requestId:id, providerErrorCategory:category, durationMs:Date.now() - startedAt });
    return errorResponse(category, providerStatusCode(category), id);
  } finally {
    clearTimeout(timeout);
  }
}
