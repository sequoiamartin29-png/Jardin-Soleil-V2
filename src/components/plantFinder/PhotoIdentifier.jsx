import React, { useState } from "react";
import { useGarden } from "../../context/GardenContext";
import { identifyPlantPhoto, isPlantFinderPhotoProviderConfigured } from "../../services/plantFinderService";
import { plantFinderSubjects } from "../../utils/plantFinderRules";

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function PhotoIdentifier({ onContinue, onCancel }) {
  const { addPhotos } = useGarden();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [subject, setSubject] = useState("Unknown");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const chooseFile = async (event) => {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setPreview(next ? await fileToDataUrl(next) : "");
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file || !preview) {
      setMessage("Choose or take a clear plant photograph before continuing.");
      return;
    }
    setBusy(true);
    const photoId = `plant-finder-photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    addPhotos([{ id:photoId, plantId:null, name:file.name, date:new Date().toISOString(), url:preview, source:"Plant Finder", stage:"Field identification", subject }]);
    try {
      const analysis = await identifyPlantPhoto({ image:preview, subject });
      onContinue({ photoId, photo:{ id:photoId, name:file.name, url:preview }, subject, analysis });
    } catch {
      onContinue({
        photoId,
        photo:{ id:photoId, name:file.name, url:preview },
        subject,
        analysis:{ configured:false, analyzed:false, message:"Secure photo identification is unavailable. Your photograph was retained in the existing Jardin Soleil photo collection; continue with the Manual Wizard." },
      });
    } finally {
      setBusy(false);
    }
  };

  const providerConfigured = isPlantFinderPhotoProviderConfigured();
  return (
    <form className="js-finder-ledger js-finder-photo" onSubmit={submit}>
      <header>
        <p>Field specimen plate</p>
        <h2>Photo Identification</h2>
        <span>Preserve what you observed, then compare visible structures carefully.</span>
      </header>
      <label className="js-finder-photo__subject">
        <span>What is the main subject?</span>
        <select value={subject} onChange={(event) => setSubject(event.target.value)}>
          {plantFinderSubjects.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="js-finder-photo__upload">
        <strong>Take a photo or choose an image</strong>
        <span>Use a sharp, well-lit view and avoid including people or private documents.</span>
        <input type="file" accept="image/*" capture="environment" onChange={chooseFile} />
      </label>
      {preview && (
        <figure>
          <img src={preview} alt={`Preview of the unknown plant’s ${subject.toLocaleLowerCase()}`} />
          <figcaption><span>{file?.name}</span><button type="button" onClick={() => { setFile(null); setPreview(""); setMessage(""); }}>Remove or replace</button></figcaption>
        </figure>
      )}
      <aside className="js-finder-provider" aria-label="Photo identification availability">
        <strong>{providerConfigured ? "Secure photo provider enabled" : "Local field-key mode"}</strong>
        <p>{providerConfigured
          ? "Only the selected image, subject, and minimal location context are sent through the secure server function. Results remain possible visual matches."
          : "No photo provider is configured. The image will be retained through the existing photo workflow and the Manual Wizard will continue the identification—no result will be invented."}</p>
      </aside>
      {message && <p className="js-finder-validation" role="alert">{message}</p>}
      <div className="js-finder-actions">
        <button type="button" className="is-quiet" onClick={onCancel}>Back</button>
        <button type="submit" className="is-primary" disabled={busy}>{busy ? "Preparing specimen…" : providerConfigured ? "Analyze photograph" : "Save photo & continue"}</button>
      </div>
    </form>
  );
}

