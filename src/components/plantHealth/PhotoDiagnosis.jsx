import React, { useState } from "react";
import { useGarden } from "../../context/GardenContext";
import PlantSelectorWithCreate from "../PlantSelectorWithCreate";
import { analyzePlantPhoto, isExternalPhotoAnalysisConfigured } from "../../services/plantHealthService";

const areas = ["leaves", "stems", "fruit", "flowers", "bark", "roots", "whole plant"];
const fileToDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });

export default function PhotoDiagnosis({ initialPlantId = "", onFallback, onExternalResult }) {
  const { plants, addPhotos } = useGarden();
  const [plantId, setPlantId] = useState(initialPlantId);
  const [affectedArea, setAffectedArea] = useState("leaves");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const chooseFile = async (event) => {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setPreview(next ? await fileToDataUrl(next) : "");
    setStatus("");
  };

  const continueDiagnosis = async (event) => {
    event.preventDefault();
    if (!file || !plantId) { setStatus("Choose a plant and photo before continuing."); return; }
    setBusy(true);
    const plant = plants.find((item) => item.id === plantId);
    const photoId = `health-photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    addPhotos([{ id:photoId, plantId, name:file.name, date:new Date().toISOString(), url:preview, source:"Plant Health Center", stage:"Diagnosis" }]);
    try {
      const analysis = await analyzePlantPhoto({ image:preview, plant, affectedArea });
      if (analysis.analyzed) onExternalResult?.({ plantId, affectedArea, photoIds:[photoId], analysis });
      else {
        setStatus(analysis.message);
        onFallback({ plantId, affectedArea, photoIds:[photoId], photoMode:"photo-fallback", notice:analysis.message });
      }
    } catch {
      const message = "Secure photo analysis is unavailable. The photo was preserved locally; continue with the symptom wizard instead.";
      setStatus(message);
      onFallback({ plantId, affectedArea, photoIds:[photoId], photoMode:"photo-fallback", notice:message });
    } finally { setBusy(false); }
  };

  return (
    <form className="js-health-photo js-health-ledger" onSubmit={continueDiagnosis}>
      <header><p>Pressed specimen plate</p><h2>Photo diagnosis</h2><span>A photo can document visible evidence, but it cannot guarantee a diagnosis.</span></header>
      <PlantSelectorWithCreate value={plantId} onChange={setPlantId} label="Affected plant" required createLabel="+ Create New Plant" createTitle="Create Plant for Health Record" />
      <label>Affected area<select value={affectedArea} onChange={(event) => setAffectedArea(event.target.value)}>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
      <label className="js-health-photo__upload">Photo<input type="file" accept="image/*" capture="environment" onChange={chooseFile} /></label>
      {preview && <figure><img src={preview} alt="Plant symptom preview" /><figcaption>{file?.name}<button type="button" onClick={() => { setFile(null); setPreview(""); }}>Remove photo</button></figcaption></figure>}
      <aside className="js-health-photo__provider"><strong>{isExternalPhotoAnalysisConfigured() ? "Secure photo service enabled" : "Local diagnostic mode"}</strong><p>{isExternalPhotoAnalysisConfigured() ? "Only this selected image and minimized plant context will be sent through a Netlify Function." : "No external provider is configured. The photo will remain in the existing local gallery and the symptom wizard will determine ranked possibilities."}</p></aside>
      {status && <p role="status">{status}</p>}
      <button className="js-health-primary" type="submit" disabled={busy}>{busy ? "Preparing case file…" : "Continue diagnosis"}</button>
    </form>
  );
}

