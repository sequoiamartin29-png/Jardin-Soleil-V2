const PHOTO_ANALYSIS_ENDPOINT = "/.netlify/functions/plant-health";
const externalPhotoAnalysisEnabled = import.meta.env.VITE_PLANT_HEALTH_PHOTO_ANALYSIS === "true";
const PHOTO_ANALYSIS_TIMEOUT_MS = 15_000;

export function isExternalPhotoAnalysisConfigured() {
  return externalPhotoAnalysisEnabled;
}

export async function analyzePlantPhoto({ image, plant, affectedArea }) {
  if (!externalPhotoAnalysisEnabled) {
    return {
      configured:false,
      analyzed:false,
      message:"External photo analysis is not configured. The photo was preserved locally and the symptom wizard will be used instead.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PHOTO_ANALYSIS_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(PHOTO_ANALYSIS_ENDPOINT, { method:"POST", signal:controller.signal, headers:{ "content-type":"application/json" }, body:JSON.stringify({ image, affectedArea, plant:plant ? { id:plant.id, name:plant.name, type:plant.type, category:plant.category } : null }) });
  } catch (error) {
    const next = new Error(error?.name === "AbortError" ? "Photo review timed out. Your draft is still safe." : "Photo review is temporarily unavailable. Your draft is still safe.");
    next.code = error?.name === "AbortError" ? "PROVIDER_TIMEOUT" : "PROVIDER_UNAVAILABLE";
    throw next;
  } finally { clearTimeout(timer); }
  if (!response.ok) { const error = new Error("Photo review is temporarily unavailable. Your draft is still safe."); error.code="PROVIDER_UNAVAILABLE"; throw error; }
  const text = await response.text();
  let result;
  try { result = text ? JSON.parse(text) : null; } catch { result = null; }
  if (!result || typeof result !== "object") { const error = new Error("The photo service returned no useful result. Continue with observed symptoms."); error.code="NO_USEFUL_RESULT"; throw error; }
  return {
    configured:true,
    analyzed:true,
    ...result,
    limitation:result.limitation || "Image findings are possible visual matches only and cannot confirm a diagnosis from a photo alone.",
  };
}
