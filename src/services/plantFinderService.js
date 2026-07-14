const PHOTO_IDENTIFICATION_ENDPOINT = "/.netlify/functions/plant-finder";
const externalPhotoIdentificationEnabled = import.meta.env.VITE_PLANT_FINDER_PHOTO_IDENTIFICATION === "true";

export function isPlantFinderPhotoProviderConfigured() {
  return externalPhotoIdentificationEnabled;
}

export async function identifyPlantPhoto({ image, subject, context = {} }) {
  if (!externalPhotoIdentificationEnabled) {
    return {
      configured:false,
      analyzed:false,
      message:"Secure photo identification is not configured. Your photograph has been retained in the existing Jardin Soleil photo collection; continue with the Manual Wizard.",
    };
  }

  const response = await fetch(PHOTO_IDENTIFICATION_ENDPOINT, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body:JSON.stringify({ image, subject, context:{ country:context.country || "", region:context.region || "", season:context.season || "" } }),
  });
  if (!response.ok) throw new Error("Secure photo identification is unavailable.");
  const result = await response.json();
  return {
    configured:true,
    analyzed:true,
    matches:Array.isArray(result.matches) ? result.matches.slice(0, 5) : [],
    limitation:result.limitation || "Photo matches are visual possibilities, not confirmed identifications.",
  };
}

