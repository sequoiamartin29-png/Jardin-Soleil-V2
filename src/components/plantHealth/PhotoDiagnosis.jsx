import React, { useEffect, useRef, useState } from "react";
import { useGarden } from "../../context/GardenContext";
import PlantSelectorWithCreate from "../PlantSelectorWithCreate";
import { analyzePlantPhoto, isExternalPhotoAnalysisConfigured } from "../../services/plantHealthService";
import { PLANT_IMAGE_ACCEPT, PlantImageError, preparePlantImage } from "../../utils/plantImageProcessing";

const areas = ["leaves", "stems", "fruit", "flowers", "bark", "roots", "whole plant"];
const labels = ["Whole plant", "Affected leaf", "Leaf underside", "Stem, fruit, soil, or pest close-up"];
const messages = {
  "unsupported-type":"This photo format could not be processed. Please choose JPEG, PNG, or WebP, or change your camera format.",
  "oversized-image":"This image is too large. Choose a photo under 15 MB or use a closer crop.",
  "invalid-image":"We couldn’t decode this photo. Try another image or continue with manual symptoms.",
  "processing-failed":"We couldn’t prepare this photo. Try another image or continue with manual symptoms.",
};

export default function PhotoDiagnosis({ initialDraft = {}, onDraftChange, onFallback, onExternalResult }) {
  const { plants, photos, addPhotos, deletePhoto } = useGarden();
  const [plantId, setPlantId] = useState(initialDraft.plantId || "");
  const [affectedArea, setAffectedArea] = useState(initialDraft.affectedArea || "leaves");
  const [photoIds, setPhotoIds] = useState(initialDraft.photoIds || []);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef(null); const libraryRef = useRef(null); const operationRef = useRef(0); const triggerRef = useRef(null);
  const selectedPhotos = photoIds.map((id) => photos.find((photo) => photo.id === id)).filter(Boolean);

  useEffect(() => { onDraftChange?.({ plantId, affectedArea, photoIds, currentStep:"photos" }); }, [plantId, affectedArea, photoIds]);
  useEffect(() => () => { operationRef.current += 1; }, []);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0]; event.target.value="";
    if (!file || busy || photoIds.length >= 4) return;
    const operation = ++operationRef.current;
    setBusy(true); setError(""); setStatus("Preparing photo…"); setProgress(20);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      setStatus("Compressing photo…"); setProgress(55);
      const prepared = await preparePlantImage(file);
      if (operation !== operationRef.current) return;
      const id=`health-photo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      addPhotos([{ id, plantId, name:prepared.fileName, date:new Date().toISOString(), url:prepared.dataUrl, source:"Plant Health Center", stage:"Diagnosis", label:labels[photoIds.length], width:prepared.width, height:prepared.height, bytes:prepared.bytes }]);
      setPhotoIds((current) => [...current, id]); setProgress(100); setStatus("Photo ready");
    } catch (nextError) {
      if (operation !== operationRef.current) return;
      const code = nextError instanceof PlantImageError ? nextError.code : "processing-failed";
      setError(messages[code] || messages["processing-failed"]); setStatus("Unable to process photo");
    } finally { if (operation === operationRef.current) setBusy(false); }
  };
  const cancel = () => { operationRef.current += 1; setBusy(false); setProgress(0); setStatus("Photo preparation cancelled. Your draft is still safe."); triggerRef.current?.focus(); };
  const remove = (id) => { deletePhoto(id); setPhotoIds((current) => current.filter((item) => item !== id)); };

  const continueDiagnosis = async (event) => {
    event.preventDefault();
    if (!plantId) { setError("Select a plant before continuing."); return; }
    if (!photoIds.length) { setError("Add a photo, or continue with manual symptoms."); return; }
    const plant=plants.find((item)=>item.id===plantId); const first=selectedPhotos[0];
    setBusy(true); setProgress(35); setStatus("Reviewing visible symptoms…"); setError("");
    try {
      const analysis=await analyzePlantPhoto({ image:first?.url, plant, affectedArea });
      if (analysis.analyzed) onExternalResult?.({ plantId, affectedArea, photoIds, analysis });
      else onFallback({ ...initialDraft, plantId, affectedArea, photoIds, photoMode:"photo-fallback", currentStep:"symptoms", notice:analysis.message });
    } catch (nextError) {
      setError(nextError?.message || "We couldn’t finish the photo review. Your draft is still safe."); setStatus("Unable to finish photo review");
    } finally { setBusy(false); setProgress(0); triggerRef.current?.focus(); }
  };

  return <form className="js-health-photo js-health-ledger" onSubmit={continueDiagnosis} aria-busy={busy}>
    <header><p>New Plant Health Check</p><h2>Add and review photos</h2><span>For the clearest health check, include one photo of the whole plant and one close-up of the affected area.</span></header>
    <PlantSelectorWithCreate value={plantId} onChange={setPlantId} label="Affected plant" required createLabel="+ Create New Plant" createTitle="Create Plant for Health Record" />
    <label>Affected area<select value={affectedArea} onChange={(event)=>setAffectedArea(event.target.value)}>{areas.map((area)=><option key={area}>{area}</option>)}</select></label>
    <div className="js-health-photo__capture"><button ref={triggerRef} type="button" onClick={()=>cameraRef.current?.click()} disabled={busy || photoIds.length>=4}>Take a Photo</button><button type="button" onClick={()=>libraryRef.current?.click()} disabled={busy || photoIds.length>=4}>Choose Existing Photo</button><input ref={cameraRef} className="js-visually-hidden" type="file" accept={PLANT_IMAGE_ACCEPT} capture="environment" onChange={chooseFile}/><input ref={libraryRef} className="js-visually-hidden" type="file" accept={PLANT_IMAGE_ACCEPT} onChange={chooseFile}/></div>
    {busy && <section className="js-health-processing" role="dialog" aria-modal="true" aria-labelledby="photo-processing-title"><h3 id="photo-processing-title">{status}</h3><progress max="100" value={progress}>{progress}%</progress><p>This panel will close when processing finishes. Your navigation remains available.</p><button type="button" onClick={cancel}>Cancel</button></section>}
    <p className="js-health-photo__status" aria-live="polite">{status}</p>{error && <div className="js-health-friendly-error" role="alert"><strong>{error}</strong><div><button type="button" onClick={()=>{setError("");libraryRef.current?.click();}}>Retry with another photo</button><button type="button" onClick={()=>onFallback({ ...initialDraft, plantId, affectedArea, photoIds, currentStep:"symptoms" })}>Continue with manual symptoms</button></div></div>}
    {selectedPhotos.length>0 && <div className="js-health-photo__grid">{selectedPhotos.map((photo,index)=><figure key={photo.id}><img src={photo.url} alt={`${photo.label || labels[index]} plant health photo`}/><figcaption><strong>{photo.label || labels[index]}</strong><span>Photo ready</span><button type="button" aria-label={`Remove ${photo.label || labels[index]} photo`} onClick={()=>remove(photo.id)}>Remove</button><button type="button" onClick={()=>{remove(photo.id);cameraRef.current?.click();}}>Retake</button></figcaption></figure>)}</div>}
    <aside className="js-health-photo__provider"><strong>{isExternalPhotoAnalysisConfigured()?"Secure photo review enabled":"Guided local review"}</strong><p>{isExternalPhotoAnalysisConfigured()?"A minimized image and plant context are sent through the existing secure function.":"The photo documents evidence; you will confirm visible symptoms next. Photo guidance is not a certain diagnosis."}</p></aside>
    <div className="js-health-wizard__actions"><button type="button" onClick={()=>onFallback({ ...initialDraft, plantId, affectedArea, photoIds, currentStep:"symptoms" })}>Add observed symptoms</button><button className="js-health-primary" type="submit" disabled={busy || !photoIds.length || !plantId}>Analyze evidence</button></div>
  </form>;
}
