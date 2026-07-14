const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const DEFAULT_VISION_MODEL = "gpt-5.6";
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

const errorResponse = (code, message, status) => json({ status:"error", code, message }, status);
const cleanText = (value, limit) => String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);

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
  if (request.method !== "POST") return errorResponse("method-not-allowed", "Use POST for plant photo identification.", 405);
  if (!consumeRateLimit(getClientAddress(request))) {
    return errorResponse("rate-limited", "Photo analysis is busy. Please wait a few minutes and try again.", 429);
  }

  const apiKey = cleanText(process.env.OPENAI_API_KEY, 500);
  if (!apiKey) return errorResponse("not-configured", "Photo identification is not configured yet.", 503);
  const model = cleanText(process.env.OPENAI_VISION_MODEL, 120) || DEFAULT_VISION_MODEL;

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse("invalid-request", "The photo request could not be read.", 400);
  }
  if (!rawBody || Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
    return errorResponse("oversized-image", "The prepared image is too large for analysis.", 413);
  }

  let input;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return errorResponse("invalid-request", "The photo request is invalid.", 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) return errorResponse("invalid-request", "The photo request is invalid.", 400);
  const extraKeys = Object.keys(input).filter((key) => !["image", "subject", "context"].includes(key));
  if (extraKeys.length || (input.context != null && (typeof input.context !== "object" || Array.isArray(input.context)))) {
    return errorResponse("invalid-request", "The photo request contains unsupported fields.", 400);
  }
  const contextKeys = Object.keys(input.context || {}).filter((key) => !["region", "season"].includes(key));
  if (contextKeys.length) return errorResponse("invalid-request", "The photo context contains unsupported fields.", 400);

  const image = validateImage(input.image);
  if (image.error === "unsupported-type") return errorResponse("unsupported-type", "Choose a JPEG, PNG, or WebP photograph.", 415);
  if (image.error === "oversized-image") return errorResponse("oversized-image", "The prepared image is too large for analysis.", 413);
  if (image.error) return errorResponse("invalid-image", "The selected image could not be read.", 400);

  const subject = cleanText(input.subject, 60);
  const region = cleanText(input.context?.region, 120);
  const season = cleanText(input.context?.season, 40);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

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

    if (providerResponse.status === 429) return errorResponse("rate-limited", "Photo analysis is busy. Please wait a few minutes and try again.", 429);
    if (!providerResponse.ok) return errorResponse("provider-unavailable", "Photo analysis is temporarily unavailable.", 502);

    let providerPayload;
    try {
      providerPayload = await providerResponse.json();
    } catch {
      return errorResponse("malformed-response", "Photo analysis returned an unreadable result.", 502);
    }
    let parsed;
    try {
      parsed = JSON.parse(extractOutputText(providerPayload));
    } catch {
      return errorResponse("malformed-response", "Photo analysis returned an unreadable result.", 502);
    }
    const result = normalizeProviderResult(parsed);
    if (!result) return errorResponse("malformed-response", "Photo analysis returned an unreadable result.", 502);
    return json(result);
  } catch (error) {
    if (error?.name === "AbortError") return errorResponse("provider-timeout", "Photo analysis took too long. Please try again.", 504);
    return errorResponse("provider-unavailable", "Photo analysis is temporarily unavailable.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
