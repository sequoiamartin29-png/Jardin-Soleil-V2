const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const PLANT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";
export const MAX_PLANT_IMAGE_INPUT_BYTES = 15 * 1024 * 1024;
// Four processed case photos must remain comfortably below common local-storage quotas.
export const MAX_PLANT_IMAGE_OUTPUT_BYTES = 700 * 1024;
export const MAX_PLANT_IMAGE_DIMENSION = 1800;

export class PlantImageError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PlantImageError";
    this.code = code;
  }
}

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new PlantImageError("processing-failed", "This image could not be prepared. Try another photograph."));
  }, type, quality);
});

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ""));
  reader.onerror = () => reject(new PlantImageError("processing-failed", "This image could not be prepared. Try another photograph."));
  reader.readAsDataURL(blob);
});

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation:"from-image" });
      return {
        source:bitmap,
        width:bitmap.width,
        height:bitmap.height,
        release:() => bitmap.close?.(),
      };
    } catch {
      // Older browsers can reject imageOrientation even when they support createImageBitmap.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new PlantImageError("invalid-image", "This file is not a readable JPEG, PNG, or WebP image."));
      element.src = objectUrl;
    });
    return {
      source:image,
      width:image.naturalWidth,
      height:image.naturalHeight,
      release:() => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

export async function preparePlantImage(file) {
  if (!(file instanceof Blob)) throw new PlantImageError("missing-image", "Choose or take a plant photograph first.");
  const type = String(file.type || "").toLocaleLowerCase();
  if (type === "image/heic" || type === "image/heif" || /\.(heic|heif)$/i.test(file.name || "")) {
    throw new PlantImageError("unsupported-type", "This photo format could not be processed. Please choose JPEG, PNG, or WebP, or change your camera format.");
  }
  if (!SUPPORTED_IMAGE_TYPES.has(type)) {
    throw new PlantImageError("unsupported-type", "This photo format could not be processed. Please choose JPEG, PNG, or WebP, or change your camera format.");
  }
  if (!file.size || file.size > MAX_PLANT_IMAGE_INPUT_BYTES) {
    throw new PlantImageError("oversized-image", "This image is too large. Choose a photograph smaller than 15 MB.");
  }

  const decoded = await decodeImage(file);
  try {
    if (!decoded.width || !decoded.height) throw new PlantImageError("invalid-image", "This image does not contain readable picture data.");

    const initialScale = Math.min(1, MAX_PLANT_IMAGE_DIMENSION / Math.max(decoded.width, decoded.height));
    let width = Math.max(1, Math.round(decoded.width * initialScale));
    let height = Math.max(1, Math.round(decoded.height * initialScale));
    let quality = 0.88;
    let blob;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const drawing = canvas.getContext("2d", { alpha:false });
      if (!drawing) throw new PlantImageError("processing-failed", "This browser could not prepare the image.");
      drawing.fillStyle = "#fff";
      drawing.fillRect(0, 0, width, height);
      drawing.imageSmoothingEnabled = true;
      drawing.imageSmoothingQuality = "high";
      drawing.drawImage(decoded.source, 0, 0, width, height);
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
      if (blob.size <= MAX_PLANT_IMAGE_OUTPUT_BYTES) break;
      quality = Math.max(0.68, quality - 0.07);
      width = Math.max(1, Math.round(width * 0.88));
      height = Math.max(1, Math.round(height * 0.88));
    }

    if (!blob || blob.size > MAX_PLANT_IMAGE_OUTPUT_BYTES) {
      throw new PlantImageError("oversized-image", "This image could not be reduced enough for secure analysis. Try a closer crop.");
    }

    return {
      dataUrl:await blobToDataUrl(blob),
      fileName:String(file.name || "plant-photo.jpg").replace(/\.[^.]+$/, "") + ".jpg",
      mimeType:"image/jpeg",
      bytes:blob.size,
      originalBytes:file.size,
      width,
      height,
    };
  } finally {
    decoded.release();
  }
}
