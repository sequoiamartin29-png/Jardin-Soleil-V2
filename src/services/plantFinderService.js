export const PHOTO_IDENTIFICATION_ENDPOINT = "/.netlify/functions/identify-plant";

const REQUEST_TIMEOUT_MS = 32_000;
const DIAGNOSTIC_TIMEOUT_MS = 8_000;

const friendlyErrors = {
  NOT_CONFIGURED:{
    providerStatus:"credentials-missing",
    message:"Photo identification is not configured yet.",
  },
  INVALID_API_KEY:{
    providerStatus:"invalid-credentials",
    message:"The Pl@ntNet credentials are invalid.",
  },
  QUOTA_EXCEEDED:{
    providerStatus:"daily-quota",
    message:"The Pl@ntNet daily identification quota has been reached.",
  },
  RATE_LIMITED:{
    providerStatus:"temporarily-unavailable",
    message:"Photo analysis is temporarily busy. Please try again shortly.",
  },
  INVALID_IMAGE:{
    providerStatus:"guided-only",
    message:"This photograph could not be processed. Try JPEG, PNG, or WebP.",
  },
  IMAGE_TOO_LARGE:{
    providerStatus:"guided-only",
    message:"This image is too large for photo analysis. Try a closer crop or smaller photograph.",
  },
  PROVIDER_TIMEOUT:{
    providerStatus:"temporarily-unavailable",
    message:"Photo analysis took too long. Try a smaller or clearer photograph.",
  },
  NO_RELIABLE_MATCH:{
    providerStatus:"guided-only",
    message:"Pl@ntNet did not return a reliable plant match for this photograph.",
  },
  MALFORMED_PROVIDER_RESPONSE:{
    providerStatus:"temporarily-unavailable",
    message:"Photo analysis returned an unreadable result. No identification was generated.",
  },
  INTERNAL_ERROR:{
    providerStatus:"temporarily-unavailable",
    message:"Photo identification encountered an internal error. Guided Identification is still available.",
  },
  FUNCTION_UNAVAILABLE:{
    providerStatus:"guided-only",
    message:"Photo analysis is unavailable in this local session.",
  },
};

const legacyErrorCodes = {
  "not-configured":"NOT_CONFIGURED",
  "function-unavailable":"FUNCTION_UNAVAILABLE",
  "rate-limited":"RATE_LIMITED",
  "invalid-image":"INVALID_IMAGE",
  "unsupported-type":"INVALID_IMAGE",
  "oversized-image":"IMAGE_TOO_LARGE",
  "provider-timeout":"PROVIDER_TIMEOUT",
  "malformed-response":"MALFORMED_PROVIDER_RESPONSE",
  "provider-unavailable":"INTERNAL_ERROR",
  "invalid-request":"INVALID_IMAGE",
};

const normalizeErrorCode = (value) => {
  const raw = String(value || "").trim();
  if (friendlyErrors[raw]) return raw;
  return legacyErrorCodes[raw.toLocaleLowerCase()] || "INTERNAL_ERROR";
};

export const plantPhotoProviderLabels = {
  ready:"Ready",
  "credentials-missing":"Not configured",
  "invalid-credentials":"Invalid credentials",
  "daily-quota":"Daily quota reached",
  "temporarily-unavailable":"Provider Temporarily Unavailable",
  "guided-only":"Guided identification only",
  checking:"Checking provider status",
};

export const getPlantPhotoProviderLabel = (status) => plantPhotoProviderLabels[status] || plantPhotoProviderLabels["guided-only"];

const createFallback = (reason, message) => ({
  configured:!["NOT_CONFIGURED", "FUNCTION_UNAVAILABLE"].includes(normalizeErrorCode(reason)),
  analyzed:false,
  providerStatus:friendlyErrors[normalizeErrorCode(reason)]?.providerStatus || "temporarily-unavailable",
  reason:normalizeErrorCode(reason),
  message:message || friendlyErrors[normalizeErrorCode(reason)]?.message || friendlyErrors.INTERNAL_ERROR.message,
});

const confidenceDetails = (value) => {
  let score = Number(value);
  if (!Number.isFinite(score)) score = 0;
  if (score > 0 && score <= 1) score *= 100;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, label:score >= 75 ? "High" : score >= 45 ? "Moderate" : "Low" };
};

const normalizeStringList = (value) => Array.isArray(value)
  ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8)
  : [];

const normalizeMatch = (match = {}, index) => {
  const confidence = confidenceDetails(match.confidence);
  return {
    id:`photo-candidate-${index}`,
    commonName:String(match.commonName || "Possible visual match").trim(),
    botanicalName:String(match.botanicalName || "").trim(),
    family:String(match.family || "").trim(),
    confidence:confidence.label,
    confidenceScore:confidence.score,
    why:normalizeStringList(match.visibleEvidence),
    conflicts:normalizeStringList(match.conflictingEvidence),
    inspectNext:normalizeStringList(match.inspectNext),
    referenceImages:Array.isArray(match.referenceImages) ? match.referenceImages.slice(0, 3).map((image) => ({
      url:String(image?.url || "").trim(),
      author:String(image?.author || "").trim(),
      license:String(image?.license || "").trim(),
      citation:String(image?.citation || "").trim(),
    })).filter((image) => /^https:\/\//i.test(image.url)) : [],
    provider:"plantnet",
  };
};

const safeJson = async (response) => {
  try { return await response.json(); }
  catch { return null; }
};

const isValidSuccess = (result) => result?.status === "success"
  && result?.provider === "plantnet"
  && ["good", "limited", "unusable"].includes(result.imageQuality)
  && Array.isArray(result.candidates)
  && typeof result.safetyNote === "string";

export async function getPlantPhotoProviderStatus() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DIAGNOSTIC_TIMEOUT_MS);
  try {
    const response = await fetch(PHOTO_IDENTIFICATION_ENDPOINT, {
      method:"GET",
      headers:{ accept:"application/json" },
      signal:controller.signal,
    });
    if (!response.headers.get("content-type")?.toLocaleLowerCase().includes("application/json")) {
      return { providerStatus:"guided-only", label:getPlantPhotoProviderLabel("guided-only"), message:"Photo analysis is unavailable in this local session." };
    }
    const result = await safeJson(response);
    const diagnosticStatus = {
      READY:"ready",
      NOT_CONFIGURED:"credentials-missing",
      INVALID_API_KEY:"invalid-credentials",
      QUOTA_EXCEEDED:"daily-quota",
      RATE_LIMITED:"temporarily-unavailable",
      TEMPORARILY_UNAVAILABLE:"temporarily-unavailable",
    }[result?.providerStatus] || friendlyErrors[normalizeErrorCode(result?.code)]?.providerStatus || "guided-only";
    const diagnosticMessage = {
      ready:"The secure function can reach Pl@ntNet and its server-side credential is present.",
      "credentials-missing":"The secure function is reachable, but PLANTNET_API_KEY is not configured.",
      "invalid-credentials":"The secure function is reachable, but the Pl@ntNet credential is invalid.",
      "daily-quota":"The Pl@ntNet daily identification quota has been reached.",
      "temporarily-unavailable":"The secure function is reachable, but Pl@ntNet is temporarily unavailable or rate limited.",
    }[diagnosticStatus] || "Photo analysis is unavailable in this local session. Guided Identification remains ready.";
    return {
      providerStatus:diagnosticStatus,
      label:getPlantPhotoProviderLabel(diagnosticStatus),
      message:diagnosticMessage,
      checks:result?.checks || null,
    };
  } catch {
    return { providerStatus:"guided-only", label:getPlantPhotoProviderLabel("guided-only"), message:"Photo analysis is unavailable in this local session. Guided Identification remains ready." };
  } finally {
    clearTimeout(timeout);
  }
}

export async function identifyPlantPhoto({ image, subject, context = {} }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(PHOTO_IDENTIFICATION_ENDPOINT, {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body:JSON.stringify({
        image,
        subject:String(subject || "Unknown").slice(0, 60),
        context:{
          region:String(context.region || "").slice(0, 120),
          season:String(context.season || "").slice(0, 40),
        },
      }),
      signal:controller.signal,
    });

    const isJsonResponse = response.headers.get("content-type")?.toLocaleLowerCase().includes("application/json");
    if (!isJsonResponse) return createFallback("function-unavailable");
    const result = await safeJson(response);
    if (!response.ok) {
      const reason = typeof result?.code === "string"
        ? normalizeErrorCode(result.code)
        : response.status === 404 ? "FUNCTION_UNAVAILABLE"
          : response.status === 401 ? "INVALID_API_KEY"
            : response.status === 413 ? "IMAGE_TOO_LARGE"
              : response.status === 429 ? "RATE_LIMITED"
                : response.status === 504 ? "PROVIDER_TIMEOUT"
                  : "INTERNAL_ERROR";
      return createFallback(reason);
    }
    if (!isValidSuccess(result)) return createFallback("MALFORMED_PROVIDER_RESPONSE");

    const matches = result.candidates.slice(0, 5).map(normalizeMatch);
    const noReliableMatch = !matches.length;
    return {
      configured:true,
      analyzed:true,
      provider:"plantnet",
      providerStatus:"ready",
      imageQuality:result.imageQuality,
      matches,
      inferredTraits:{},
      requiresFollowUp:noReliableMatch || result.imageQuality !== "good" || (matches[0]?.confidenceScore || 0) < 65,
      reason:noReliableMatch ? "no-reliable-match" : "success",
      message:noReliableMatch ? "This image does not show enough identifying detail." : "Secure photo analysis completed.",
      limitation:noReliableMatch
        ? "Try photographing a leaf, flower, fruit, or the whole plant in natural light."
        : "These are visual possibilities, not confirmed identifications.",
      safetyNote:result.safetyNote,
      remainingIdentificationRequests:result.remainingIdentificationRequests ?? null,
    };
  } catch (error) {
    if (error?.name === "AbortError") return createFallback("PROVIDER_TIMEOUT");
    return createFallback("FUNCTION_UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}
