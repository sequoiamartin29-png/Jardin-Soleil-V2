import React, { useRef, useState } from "react";
import { identifyPlantPhoto } from "../../services/plantFinderService";
import { PLANT_IMAGE_ACCEPT, PlantImageError, preparePlantImage } from "../../utils/plantImageProcessing";
import { plantFinderSubjects } from "../../utils/plantFinderRules";

const flowSteps = ["Photo Selected", "Compress image", "Analyzing", "Results", "Confirm Match / Guided Follow-Up", "Save Identification", "Add to My Estate"];

const formatBytes = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function PhotoIdentifier({ context = {}, onContinue, onGuided, onCancel }) {
  const fileInputRef = useRef(null);
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [subject, setSubject] = useState("Unknown");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState("");
  const [providerResult, setProviderResult] = useState(null);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0] || null;
    setProcessedPhoto(null);
    setProviderResult(null);
    setMessage("");
    if (!file) {
      setPhase("idle");
      return;
    }

    setBusy(true);
    setPhase("compressing");
    try {
      const prepared = await preparePlantImage(file);
      setProcessedPhoto(prepared);
      setPhase("prepared");
    } catch (error) {
      setPhase("idle");
      setMessage(error instanceof PlantImageError ? error.message : "This image could not be prepared. Try another photograph.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setBusy(false);
    }
  };

  const clearPhoto = () => {
    setProcessedPhoto(null);
    setProviderResult(null);
    setPhase("idle");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createSessionPhoto = () => ({
    id:`plant-finder-photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    plantId:null,
    name:processedPhoto.fileName,
    date:new Date().toISOString(),
    url:processedPhoto.dataUrl,
    source:"Plant Finder",
    stage:"Field identification",
    subject,
    width:processedPhoto.width,
    height:processedPhoto.height,
    bytes:processedPhoto.bytes,
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!processedPhoto?.dataUrl) {
      setMessage("Choose or take a clear plant photograph before continuing.");
      return;
    }

    setBusy(true);
    setPhase("analyzing");
    setMessage("Analyzing photo…");
    const photo = createSessionPhoto();

    try {
      const [analysis] = await Promise.all([
        identifyPlantPhoto({ image:processedPhoto.dataUrl, subject, context }),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);
      if (analysis.analyzed) {
        onContinue({ photoId:photo.id, photo, subject, analysis });
        return;
      }
      setProviderResult(analysis);
      setPhase("unavailable");
      setMessage(analysis.message || "Photo analysis is temporarily unavailable.");
    } catch {
      const analysis = {
        configured:false,
        analyzed:false,
        providerStatus:"unavailable",
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
    if (!processedPhoto) return;
    const photo = createSessionPhoto();
    onGuided({ photoId:photo.id, photo, subject, analysis:providerResult });
  };

  const flowIndex = phase === "compressing" ? 1 : phase === "analyzing" ? 2 : phase === "unavailable" ? 3 : processedPhoto ? 1 : 0;
  const providerHeading = providerResult?.providerStatus === "not-configured"
    ? "Provider status · Not configured"
    : providerResult?.providerStatus === "local-fallback"
      ? "Provider status · Local fallback"
      : "Provider status · Unavailable";

  return (
    <form className="js-finder-ledger js-finder-photo" onSubmit={submit}>
      <header>
        <p>Field specimen plate</p>
        <h2>Photo Identification</h2>
        <span>Select one clear photograph. Jardin Soleil prepares a private, metadata-free copy before secure analysis.</span>
      </header>
      <label className="js-finder-photo__subject">
        <span>What is the main subject?</span>
        <select value={subject} onChange={(event) => setSubject(event.target.value)} disabled={busy}>
          {plantFinderSubjects.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="js-finder-photo__upload">
        <strong>Take a photo or choose an image</strong>
        <span>Use a sharp JPEG, PNG, or WebP view in natural light. Avoid people and private documents.</span>
        <input ref={fileInputRef} type="file" accept={PLANT_IMAGE_ACCEPT} capture="environment" onChange={chooseFile} disabled={busy} />
      </label>

      {processedPhoto && (
        <>
          <figure>
            <img src={processedPhoto.dataUrl} alt={`Prepared preview of the unknown plant's ${subject.toLocaleLowerCase()}`} />
            <figcaption>
              <span>{processedPhoto.fileName} · {processedPhoto.width} × {processedPhoto.height} · {formatBytes(processedPhoto.bytes)}</span>
              <button type="button" onClick={clearPhoto} disabled={busy}>Remove or replace</button>
            </figcaption>
          </figure>
          <p className="js-finder-photo__privacy">This prepared preview remains only in the current session until you choose Save Identification, Add to My Estate, or Save to Gallery.</p>
          <ol className="js-finder-photo-flow" aria-label="Photo identification progress">
            {flowSteps.map((step, index) => <li key={step} className={index === flowIndex ? "is-current" : index < flowIndex ? "is-complete" : ""}><span>{index + 1}</span><small>{step}</small></li>)}
          </ol>
        </>
      )}

      {phase === "compressing" && (
        <aside className="js-finder-provider is-analyzing" role="status" aria-live="polite">
          <span className="js-finder-provider__spinner" aria-hidden="true" />
          <div><strong>Preparing photo…</strong><p>Resizing the image and removing embedded metadata before it leaves this browser.</p></div>
        </aside>
      )}

      {phase === "analyzing" && (
        <aside className="js-finder-provider is-analyzing" role="status" aria-live="polite">
          <span className="js-finder-provider__spinner" aria-hidden="true" />
          <div><strong>Analyzing photo…</strong><p>Only this prepared image, its visible subject, and optional region or season are sent through the secure Netlify Function.</p></div>
        </aside>
      )}

      {phase === "unavailable" && (
        <aside className="js-finder-provider is-unavailable" role="status">
          <strong>{providerHeading}</strong>
          <h3>{message}</h3>
          <p>No identification was fabricated. The photograph is still session-only and has not been added to Gallery. You can continue with the existing Guided Identification or choose another photo.</p>
        </aside>
      )}

      {phase === "prepared" && (
        <aside className="js-finder-provider" aria-label="Photo identification provider status">
          <strong>Provider status · Checking on analysis</strong>
          <p>The secure function—not browser code—checks server configuration when you select Analyze Photo.</p>
        </aside>
      )}

      {message && phase === "idle" && <p className="js-finder-validation" role="alert">{message}</p>}

      {phase === "unavailable" ? (
        <div className="js-finder-actions js-finder-photo__unavailable-actions">
          <button type="button" className="is-primary" onClick={continueGuided}>Continue with Guided Identification</button>
          <button type="button" className="is-quiet" onClick={clearPhoto}>Cancel / Choose Another Photo</button>
          <button type="button" className="is-quiet" onClick={onCancel}>Back to Plant Finder</button>
        </div>
      ) : (
        <div className="js-finder-actions">
          <button type="button" className="is-quiet" onClick={onCancel} disabled={busy}>Back</button>
          <button type="submit" className="is-primary" disabled={busy || !processedPhoto}>{busy && phase === "analyzing" ? "Analyzing photo…" : busy ? "Preparing photo…" : "Analyze Photo"}</button>
        </div>
      )}
    </form>
  );
}
