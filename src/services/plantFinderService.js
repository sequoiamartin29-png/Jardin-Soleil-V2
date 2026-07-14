export const PHOTO_IDENTIFICATION_ENDPOINT = "/.netlify/functions/identify-plant";

const REQUEST_TIMEOUT_MS = 32_000;

const friendlyErrors = {
  "not-configured":{
    providerStatus:"not-configured",
    message:"Photo identification is not configured yet.",
  },
  "function-unavailable":{
    providerStatus:"local-fallback",
    message:"Photo analysis is unavailable in this local session.",
  },
  "rate-limited":{
    providerStatus:"unavailable",
    message:"Photo analysis is busy. Please wait a few minutes and try again.",
  },
  "invalid-image":{
    providerStatus:"unavailable",
    message:"This image could not be read. Choose a clear JPEG, PNG, or WebP photograph.",
  },
  "unsupported-type":{
    providerStatus:"unavailable",
    message:"Choose a JPEG, PNG, or WebP photograph.",
  },
  "oversized-image":{
    providerStatus:"unavailable",
    message:"This image is too large for photo analysis. Try a closer crop or another photograph.",
  },
  "provider-timeout":{
    providerStatus:"unavailable",
    message:"Photo analysis took too long. Please try again or continue with Guided Identification.",
  },
  "malformed-response":{
    providerStatus:"unavailable",
    message:"Photo analysis returned an unreadable result. No identification was generated.",
  },
  "provider-unavailable":{
    providerStatus:"unavailable",
    message:"Photo analysis is temporarily unavailable.",
  },
};

const createFallback = (reason, message) => ({
  configured:reason !== "not-configured" && reason !== "function-unavailable",
  analyzed:false,
  providerStatus:friendlyErrors[reason]?.providerStatus || "unavailable",
  reason,
  message:message || friendlyErrors[reason]?.message || "Photo analysis is temporarily unavailable.",
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
  };
};

const safeJson = async (response) => {
  try { return await response.json(); }
  catch { return null; }
};

const isValidSuccess = (result) => result?.status === "success"
  && ["good", "limited", "unusable"].includes(result.imageQuality)
  && Array.isArray(result.candidates)
  && typeof result.safetyNote === "string";

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
        ? result.code
        : response.status === 404 ? "function-unavailable"
          : response.status === 413 ? "oversized-image"
            : response.status === 429 ? "rate-limited"
              : "provider-unavailable";
      return createFallback(reason);
    }
    if (!isValidSuccess(result)) return createFallback("malformed-response");

    const matches = result.candidates.slice(0, 5).map(normalizeMatch);
    const noReliableMatch = !matches.length;
    return {
      configured:true,
      analyzed:true,
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
    };
  } catch (error) {
    if (error?.name === "AbortError") return createFallback("provider-timeout");
    return createFallback("function-unavailable");
  } finally {
    clearTimeout(timeout);
  }
}
