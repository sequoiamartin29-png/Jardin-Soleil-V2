const PHOTO_IDENTIFICATION_ENDPOINT = "/.netlify/functions/plant-finder";
const externalPhotoIdentificationEnabled = import.meta.env.VITE_PLANT_FINDER_PHOTO_IDENTIFICATION === "true";

const normalizeConfidence = (value) => {
  if (typeof value === "number") return value >= .75 ? "High" : value >= .45 ? "Moderate" : "Low";
  const normalized = String(value || "").toLocaleLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "moderate" || normalized === "medium") return "Moderate";
  return "Low";
};

const normalizeMatch = (match = {}, index) => ({
  ...match,
  id:match.id || `photo-candidate-${index}`,
  commonName:match.commonName || "Possible visual match",
  botanicalName:match.botanicalName || "Unknown",
  confidence:normalizeConfidence(match.confidence),
  why:Array.isArray(match.visibleEvidence) ? match.visibleEvidence : Array.isArray(match.why) ? match.why : ["The secure provider reported visual similarity."],
  conflicts:Array.isArray(match.conflicts) ? match.conflicts : [],
  inspectNext:match.inspectNext || "Compare leaf attachment, reproductive structures, stem, and habitat before confirming.",
});

export function isPlantFinderPhotoProviderConfigured() {
  return externalPhotoIdentificationEnabled;
}

export async function identifyPlantPhoto({ image, subject, context = {} }) {
  if (!externalPhotoIdentificationEnabled) {
    return {
      configured:false,
      analyzed:false,
      reason:"not-configured",
      message:"Photo identification is not configured yet.",
    };
  }

  const response = await fetch(PHOTO_IDENTIFICATION_ENDPOINT, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body:JSON.stringify({ image, subject, context:{ country:context.country || "", region:context.region || "", season:context.season || "" } }),
  });
  if (!response.ok) throw new Error("Secure photo identification is unavailable.");
  const result = await response.json();
  const matches = Array.isArray(result.matches) ? result.matches.slice(0, 5).map(normalizeMatch) : [];
  return {
    configured:true,
    analyzed:true,
    matches,
    inferredTraits:result.inferredTraits && typeof result.inferredTraits === "object" ? result.inferredTraits : {},
    requiresFollowUp:typeof result.requiresFollowUp === "boolean" ? result.requiresFollowUp : !matches.length || matches[0]?.confidence === "Low",
    limitation:result.limitation || "Photo matches are visual possibilities, not confirmed identifications.",
  };
}
