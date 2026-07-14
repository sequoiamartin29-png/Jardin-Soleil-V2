import React, { useRef, useState } from "react";
import { useGarden } from "../../context/GardenContext";
import { identifyPlantPhoto, isPlantFinderPhotoProviderConfigured } from "../../services/plantFinderService";
import { plantFinderSubjects } from "../../utils/plantFinderRules";

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const flowSteps = ["Photo Selected", "Analyzing", "Results or Provider Unavailable", "Confirm Match / Guided Follow-Up", "Save Identification", "Add to My Estate"];

export default function PhotoIdentifier({ context = {}, onContinue, onGuided, onCancel }) {
  const { addPhotos } = useGarden();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [subject, setSubject] = useState("Unknown");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("selected");
  const [message, setMessage] = useState("");
  const [savedPhoto, setSavedPhoto] = useState(null);
  const [providerResult, setProviderResult] = useState(null);

  const chooseFile = async (event) => {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setPreview(next ? await fileToDataUrl(next) : "");
    setSavedPhoto(null);
    setProviderResult(null);
    setPhase("selected");
    setMessage("");
  };

  const clearPhoto = () => {
    setFile(null);
    setPreview("");
    setSavedPhoto(null);
    setProviderResult(null);
    setPhase("selected");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const retainPhoto = () => {
    if (savedPhoto) return savedPhoto;
    const record = {
      id:`plant-finder-photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      plantId:null,
      name:file.name,
      date:new Date().toISOString(),
      url:preview,
      source:"Plant Finder",
      stage:"Field identification",
      subject,
    };
    addPhotos([record]);
    setSavedPhoto(record);
    return record;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file || !preview) {
      setMessage("Choose or take a clear plant photograph before continuing.");
      return;
    }

    setBusy(true);
    setPhase("analyzing");
    setMessage("Analyzing photo…");
    const photo = retainPhoto();

    try {
      const [analysis] = await Promise.all([
        identifyPlantPhoto({ image:preview, subject, context }),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);
      if (analysis.analyzed) {
        onContinue({ photoId:photo.id, photo, subject, analysis });
        return;
      }
      setProviderResult(analysis);
      setPhase("unavailable");
      setMessage(analysis.message || "Photo identification is not configured yet.");
    } catch {
      const analysis = {
        configured:false,
        analyzed:false,
        reason:"temporarily-unavailable",
        message:"Photo analysis is temporarily unavailable.",
      };
      setProviderResult(analysis);
      setPhase("unavailable");
      setMessage(analysis.message);
    } finally {
      setBusy(false);
    }
  };

  const continueGuided = () => {
    if (!savedPhoto) return;
    onGuided({ photoId:savedPhoto.id, photo:savedPhoto, subject, analysis:providerResult });
  };

  const providerConfigured = isPlantFinderPhotoProviderConfigured();
  const flowIndex = phase === "analyzing" ? 1 : phase === "unavailable" ? 2 : 0;

  return (
    <form className="js-finder-ledger js-finder-photo" onSubmit={submit}>
      <header>
        <p>Field specimen plate</p>
        <h2>Photo Identification</h2>
        <span>Preserve what you observed, then attempt secure photo analysis before adding manual traits.</span>
      </header>
      <label className="js-finder-photo__subject">
        <span>What is the main subject?</span>
        <select value={subject} onChange={(event) => setSubject(event.target.value)} disabled={busy}>
          {plantFinderSubjects.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="js-finder-photo__upload">
        <strong>Take a photo or choose an image</strong>
        <span>Use a sharp, well-lit view and avoid including people or private documents.</span>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={chooseFile} disabled={busy} />
      </label>
      {preview && (
        <>
          <figure>
            <img src={preview} alt={`Preview of the unknown plant’s ${subject.toLocaleLowerCase()}`} />
            <figcaption><span>{file?.name}</span><button type="button" onClick={clearPhoto} disabled={busy}>Remove or replace</button></figcaption>
          </figure>
          <ol className="js-finder-photo-flow" aria-label="Photo identification progress">
            {flowSteps.map((step, index) => <li key={step} className={index === flowIndex ? "is-current" : index < flowIndex ? "is-complete" : ""}><span>{index + 1}</span><small>{step}</small></li>)}
          </ol>
        </>
      )}

      {phase === "analyzing" && (
        <aside className="js-finder-provider is-analyzing" role="status" aria-live="polite">
          <span className="js-finder-provider__spinner" aria-hidden="true" />
          <div><strong>Analyzing photo…</strong><p>Checking the secure Plant Finder provider. No GardenContext data or browser API key is being sent.</p></div>
        </aside>
      )}

      {phase === "unavailable" && (
        <aside className="js-finder-provider is-unavailable" role="status">
          <strong>{message}</strong>
          <p>{providerResult?.reason === "not-configured"
            ? "The photograph was saved in Jardin Soleil, but it cannot currently be analyzed automatically. No photo-based identification was generated."
            : "The photograph was saved in Jardin Soleil, but the secure analysis service could not respond. No photo-based identification was generated."}</p>
        </aside>
      )}

      {phase === "selected" && preview && providerConfigured && (
        <aside className="js-finder-provider" aria-label="Photo identification availability"><strong>Secure photo provider enabled</strong><p>Only this selected image, its subject, and minimal optional region or season context will be sent through the Netlify Function.</p></aside>
      )}

      {message && phase === "selected" && <p className="js-finder-validation" role="alert">{message}</p>}

      {phase === "unavailable" ? (
        <div className="js-finder-actions js-finder-photo__unavailable-actions">
          <button type="button" className="is-primary" onClick={continueGuided}>Continue with Guided Identification</button>
          <button type="button" className="is-quiet" onClick={clearPhoto}>Choose Another Photo</button>
          <button type="button" className="is-quiet" onClick={onCancel}>Cancel</button>
        </div>
      ) : (
        <div className="js-finder-actions">
          <button type="button" className="is-quiet" onClick={onCancel} disabled={busy}>Back</button>
          <button type="submit" className="is-primary" disabled={busy || !preview}>{busy ? "Analyzing photo…" : "Analyze Photo"}</button>
        </div>
      )}
    </form>
  );
}
