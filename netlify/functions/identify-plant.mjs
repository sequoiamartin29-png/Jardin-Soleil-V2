const PLANTNET_ENDPOINT = "https://my-api.plantnet.org/v2/identify/k-world-flora";
const PLANTNET_STATUS_ENDPOINT = "https://my-api.plantnet.org/v2/_status";
const MAX_REQUEST_BYTES = 4.5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_REQUESTS = 12;
const PROVIDER_TIMEOUT_MS = 25_000;
const STATUS_TIMEOUT_MS = 5_000;
const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
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
  NOT_CONFIGURED:"Photo identification is not configured yet.",
  INVALID_API_KEY:"The Pl@ntNet credentials are invalid.",
  QUOTA_EXCEEDED:"The Pl@ntNet daily identification quota has been reached.",
  RATE_LIMITED:"Photo analysis is temporarily busy. Please try again shortly.",
  INVALID_IMAGE:"This photograph could not be processed. Try a JPEG or PNG image.",
  IMAGE_TOO_LARGE:"This image is too large for photo analysis. Try a closer crop or smaller photograph.",
  PROVIDER_TIMEOUT:"Photo analysis took too long. Try a smaller or clearer photograph.",
  NO_RELIABLE_MATCH:"Pl@ntNet did not return a reliable plant match for this photograph.",
  MALFORMED_PROVIDER_RESPONSE:"Photo analysis returned an unreadable result. No identification was generated.",
  INVALID_REQUEST:"The photo request could not be processed.",
  INTERNAL_ERROR:"Photo identification encountered an internal error. Guided Identification is still available.",
  METHOD_NOT_ALLOWED:"Use POST for plant photo identification.",
};

const errorResponse = (code, status, requestId) => json({
  status:"error",
  provider:"plantnet",
  code,
  message:publicErrors[code] || publicErrors.INTERNAL_ERROR,
  requestId,
}, status);

const cleanText = (value, limit) => String(value || "")
  .replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, limit);
const requestId = () => globalThis.crypto?.randomUUID?.() || `plant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const diagnosticLog = (event, details = {}) => console.info(JSON.stringify({ scope:"identify-plant", provider:"plantnet", event, ...details }));

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
  return false;
}

function validateImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(dataUrl || ""));
  if (!match || !SUPPORTED_MIME_TYPES.has(match[1])) return { error:"unsupported-type" };
  let buffer;
  try {
    buffer = Buffer.from(match[2], "base64");
  } catch {
    return { error:"invalid-image" };
  }
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) return { error:buffer.length ? "oversized-image" : "invalid-image" };
  if (!hasExpectedMagicBytes(buffer, match[1])) return { error:"invalid-image" };
  return {
    buffer,
    mimeType:match[1],
    bytes:buffer.length,
    fileName:match[1] === "image/png" ? "plant-observation.png" : "plant-observation.jpg",
  };
}

const subjectToOrgan = new Map([
  ["leaf", "leaf"],
  ["flower", "flower"],
  ["fruit", "fruit"],
  ["bark", "bark"],
  ["whole plant", "auto"],
  ["tree shape", "auto"],
  ["seed pod", "fruit"],
  ["unknown", "auto"],
]);

function normalizeOrgan(subject) {
  const normalized = cleanText(subject, 60).toLocaleLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  return subjectToOrgan.get(normalized) || "auto";
}

function providerErrorCategory(status, payload) {
  const providerCode = cleanText(payload?.error?.code || payload?.code, 100).toLocaleLowerCase();
  const providerMessage = cleanText(payload?.error?.message || payload?.message, 300).toLocaleLowerCase();
  const categoryText = `${providerCode} ${providerMessage}`;
  if (status === 401 || status === 403 || /invalid.*api.*key|unauthorized|forbidden|authentication/.test(categoryText)) return "INVALID_API_KEY";
  if (status === 429 && /daily|quota|exhaust|maximum.*request|limit.*reached/.test(categoryText)) return "QUOTA_EXCEEDED";
  if (status === 429) return "RATE_LIMITED";
  if (status === 413) return "IMAGE_TOO_LARGE";
  if (status === 408 || status === 504) return "PROVIDER_TIMEOUT";
  if ([400, 415, 422].includes(status)) return "INVALID_IMAGE";
  if (status >= 500) return "INTERNAL_ERROR";
  return "INTERNAL_ERROR";
}

const providerStatusCode = (category) => ({
  INVALID_API_KEY:401,
  QUOTA_EXCEEDED:429,
  RATE_LIMITED:429,
  INVALID_IMAGE:400,
  IMAGE_TOO_LARGE:413,
  PROVIDER_TIMEOUT:504,
  NO_RELIABLE_MATCH:422,
  MALFORMED_PROVIDER_RESPONSE:502,
  INTERNAL_ERROR:500,
}[category] || 500);

const familyName = (family) => cleanText(
  family?.scientificNameWithoutAuthor || family?.scientificName || family?.scientificNameAuthorship,
  140,
);

function referenceImageUrl(image) {
  const url = image?.url;
  if (typeof url === "string") return cleanText(url, 800);
  return cleanText(url?.m || url?.o || url?.s, 800);
}

function normalizeReferenceImages(images) {
  if (!Array.isArray(images)) return [];
  return images.slice(0, 3).map((image) => ({
    url:referenceImageUrl(image),
    author:cleanText(image?.author, 160),
    license:cleanText(image?.license, 120),
    citation:cleanText(image?.citation, 280),
  })).filter((image) => /^https:\/\//i.test(image.url));
}

function normalizeCandidate(result) {
  const species = result?.species;
  if (!species || typeof species !== "object") return null;
  const botanicalName = cleanText(species.scientificNameWithoutAuthor || species.scientificName, 180);
  const commonNames = Array.isArray(species.commonNames) ? species.commonNames : [];
  const commonName = cleanText(commonNames.find((name) => typeof name === "string") || botanicalName, 160);
  const score = Number(result?.score);
  const confidence = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score * 100))) : 0;
  if (!commonName || !botanicalName || confidence <= 0) return null;
  return {
    commonName,
    botanicalName,
    family:familyName(species.family),
    confidence,
    visibleEvidence:[
      "Image characteristics were consistent with this candidate.",
      "Pl@ntNet ranked this among the closest matches.",
    ],
    conflictingEvidence:[],
    inspectNext:["Leaf arrangement", "Flower structure", "Fruit", "Bark", "Whole-plant habit"],
    referenceImages:normalizeReferenceImages(result.images),
  };
}

function normalizeProviderResult(payload) {
  if (!payload || !Array.isArray(payload.results)) return null;
  const candidates = payload.results.slice(0, 5).map(normalizeCandidate).filter(Boolean);
  return {
    status:"success",
    provider:"plantnet",
    imageQuality:(candidates[0]?.confidence || 0) >= 65 ? "good" : "limited",
    candidates,
    safetyNote:"Never eat, brew, or medically use a wild plant based only on an app identification. Confirm with a qualified local expert.",
    remainingIdentificationRequests:Number.isFinite(Number(payload.remainingIdentificationRequests))
      ? Number(payload.remainingIdentificationRequests)
      : null,
  };
}

async function checkProviderStatus(apiKey, requestIdValue, startedAt) {
  if (!apiKey) {
    diagnosticLog("diagnostic-check", { requestId:requestIdValue, providerStatus:"NOT_CONFIGURED", apiKeyPresent:false, durationMs:Date.now() - startedAt });
    return json({
      status:"ok",
      provider:"plantnet",
      providerStatus:"NOT_CONFIGURED",
      checks:{ functionReachable:true, apiKeyPresent:false, endpointReachable:false },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STATUS_TIMEOUT_MS);
  try {
    const statusUrl = new URL(PLANTNET_STATUS_ENDPOINT);
    statusUrl.searchParams.set("api-key", apiKey);
    const response = await fetch(statusUrl, {
      method:"GET",
      headers:{ accept:"application/json" },
      signal:controller.signal,
    });
    let providerPayload = null;
    if (!response.ok) {
      try { providerPayload = await response.json(); }
      catch { providerPayload = null; }
    }
    const endpointReachable = response.status > 0 && response.status < 500;
    const errorCategory = response.ok ? null : providerErrorCategory(response.status, providerPayload);
    const providerStatus = response.ok ? "READY"
      : ["INVALID_API_KEY", "QUOTA_EXCEEDED", "RATE_LIMITED"].includes(errorCategory) ? errorCategory
        : "TEMPORARILY_UNAVAILABLE";
    diagnosticLog("diagnostic-check", { requestId:requestIdValue, providerStatus, apiKeyPresent:true, endpointReachable, providerHttpStatus:response.status, durationMs:Date.now() - startedAt });
    return json({
      status:"ok",
      provider:"plantnet",
      providerStatus,
      checks:{ functionReachable:true, apiKeyPresent:true, endpointReachable },
    });
  } catch (error) {
    const providerStatus = "TEMPORARILY_UNAVAILABLE";
    diagnosticLog("diagnostic-check", { requestId:requestIdValue, providerStatus, apiKeyPresent:true, endpointReachable:false, timeout:error?.name === "AbortError", durationMs:Date.now() - startedAt });
    return json({
      status:"ok",
      provider:"plantnet",
      providerStatus,
      checks:{ functionReachable:true, apiKeyPresent:true, endpointReachable:false },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request) {
  const startedAt = Date.now();
  const id = requestId();
  const apiKey = String(process.env.PLANTNET_API_KEY || "").trim();
  diagnosticLog("request-received", { requestId:id, method:request.method });

  if (request.method === "GET") return checkProviderStatus(apiKey, id, startedAt);
  if (request.method !== "POST") return errorResponse("METHOD_NOT_ALLOWED", 405, id);
  if (!apiKey) return errorResponse("NOT_CONFIGURED", 503, id);
  if (!consumeRateLimit(getClientAddress(request))) {
    diagnosticLog("request-rejected", { requestId:id, errorCategory:"RATE_LIMITED", source:"function", durationMs:Date.now() - startedAt });
    return errorResponse("RATE_LIMITED", 429, id);
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse("INVALID_REQUEST", 400, id);
  }
  if (!rawBody || Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) return errorResponse("IMAGE_TOO_LARGE", 413, id);

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

  const organ = normalizeOrgan(input.subject);
  diagnosticLog("image-validated", { requestId:id, imageMimeType:image.mimeType, imageBytes:image.bytes, organ });

  const providerUrl = new URL(PLANTNET_ENDPOINT);
  providerUrl.searchParams.set("api-key", apiKey);
  providerUrl.searchParams.set("nb-results", "5");
  providerUrl.searchParams.set("lang", "en");
  providerUrl.searchParams.set("include-related-images", "true");
  const form = new FormData();
  form.append("images", new Blob([image.buffer], { type:image.mimeType }), image.fileName);
  form.append("organs", organ);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  const providerStartedAt = Date.now();
  try {
    const providerResponse = await fetch(providerUrl, {
      method:"POST",
      body:form,
      signal:controller.signal,
    });

    let providerPayload = null;
    let providerJsonParsed = true;
    try {
      providerPayload = await providerResponse.json();
    } catch {
      providerJsonParsed = false;
    }
    const category = providerResponse.ok
      ? providerJsonParsed ? "SUCCESS" : "MALFORMED_PROVIDER_RESPONSE"
      : providerErrorCategory(providerResponse.status, providerPayload);
    diagnosticLog("provider-response", {
      requestId:id,
      providerHttpStatus:providerResponse.status,
      providerErrorCategory:category,
      responseJsonParsed:providerJsonParsed,
      durationMs:Date.now() - providerStartedAt,
    });

    if (!providerResponse.ok) return errorResponse(category, providerStatusCode(category), id);
    if (!providerJsonParsed) return errorResponse("MALFORMED_PROVIDER_RESPONSE", 502, id);
    const result = normalizeProviderResult(providerPayload);
    if (!result) return errorResponse("MALFORMED_PROVIDER_RESPONSE", 502, id);
    if (!result.candidates.length) return errorResponse("NO_RELIABLE_MATCH", 422, id);

    diagnosticLog("response-mapped", {
      requestId:id,
      candidateCount:result.candidates.length,
      imageQuality:result.imageQuality,
      durationMs:Date.now() - startedAt,
    });
    return json(result);
  } catch (error) {
    const category = error?.name === "AbortError" ? "PROVIDER_TIMEOUT" : "INTERNAL_ERROR";
    diagnosticLog("provider-exception", { requestId:id, providerErrorCategory:category, durationMs:Date.now() - startedAt });
    return errorResponse(category, providerStatusCode(category), id);
  } finally {
    clearTimeout(timeout);
  }
}
