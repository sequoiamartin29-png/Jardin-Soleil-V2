const PHOTO_ANALYSIS_ENDPOINT = "/.netlify/functions/plant-health";
const externalPhotoAnalysisEnabled = import.meta.env.VITE_PLANT_HEALTH_PHOTO_ANALYSIS === "true";

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

  const response = await fetch(PHOTO_ANALYSIS_ENDPOINT, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body:JSON.stringify({
      image,
      affectedArea,
      plant:plant ? { id:plant.id, name:plant.name, type:plant.type, category:plant.category } : null,
    }),
  });
  if (!response.ok) throw new Error("Secure photo analysis is unavailable.");
  const result = await response.json();
  return {
    configured:true,
    analyzed:true,
    ...result,
    limitation:result.limitation || "Image findings are possible visual matches only and cannot confirm a diagnosis from a photo alone.",
  };
}

