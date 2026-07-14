import React, { useMemo, useState } from "react";
import BotanicalIcon from "../icons/BotanicalIcon";
import HealthStatusSeal from "./HealthStatusSeal";
import TreatmentPlan from "./TreatmentPlan";

const statuses = ["Monitoring", "Treating", "Improving", "Resolved", "Recurring", "Unconfirmed"];
const fileToDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });

export default function DiagnosisHistory({ diagnosis, plant, photos, addPhotos, addFollowUp, updateDiagnosis, onBack, onConsult }) {
  const [followUpType, setFollowUpType] = useState("Follow-up observation");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(diagnosis.status || "Monitoring");
  const [photo, setPhoto] = useState(null);
  const linkedPhotos = photos.filter((item) => diagnosis.photoIds?.includes(item.id));
  const timeline = useMemo(() => [
    { id:`${diagnosis.id}-initial`, createdAt:diagnosis.createdAt, type:"Initial symptoms and assessment", notes:`${diagnosis.symptoms.join(", ") || "Symptoms not recorded"}. Working diagnosis: ${diagnosis.workingDiagnosis}.`, status:diagnosis.initialStatus || diagnosis.status, photoIds:diagnosis.photoIds || [] },
    ...(diagnosis.followUps || []),
  ].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)), [diagnosis]);

  const saveFollowUp = async (event) => {
    event.preventDefault();
    let photoId = "";
    if (photo) {
      photoId = `health-follow-up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      addPhotos([{ id:photoId, plantId:plant?.id || diagnosis.plantId, name:photo.name, date:new Date().toISOString(), url:await fileToDataUrl(photo), source:"Plant Health Center", stage:"Follow-up" }]);
    }
    addFollowUp(diagnosis.id, { type:followUpType, symptoms:symptoms.split(",").map((item) => item.trim()).filter(Boolean), treatment:treatment.trim(), notes:notes.trim(), status, photoIds:photoId ? [photoId] : [] });
    setSymptoms(""); setTreatment(""); setNotes(""); setPhoto(null);
  };

  return (
    <div className="js-diagnosis-history">
      <div className="js-diagnosis-history__back"><button type="button" onClick={onBack}>Back to Estate Health Review</button></div>
      <section className="js-diagnosis-history__summary">
        <BotanicalIcon plant={plant} size="lg" decorative />
        <div><p>Plant health case file</p><h2>{plant?.name || diagnosis.deletedPlantName || "Archived plant record"}</h2><span>{diagnosis.workingDiagnosis}</span></div>
        <HealthStatusSeal status={diagnosis.status} />
      </section>
      <div className="js-diagnosis-history__grid">
        <article><h3>Assessment</h3><dl><div><dt>Date</dt><dd>{new Date(diagnosis.createdAt).toLocaleDateString()}</dd></div><div><dt>Confidence</dt><dd>{diagnosis.confidence}</dd></div><div><dt>Affected area</dt><dd>{diagnosis.affectedArea}</dd></div><div><dt>Symptoms</dt><dd>{diagnosis.symptoms.join(", ") || "Not recorded"}</dd></div><div><dt>Source</dt><dd>{diagnosis.sourceMode}</dd></div><div><dt>Weather</dt><dd>{diagnosis.weatherEvidence || `Source status: ${diagnosis.weatherSourceStatus || "Unavailable"}`}</dd></div></dl></article>
        <article><h3>Ranked possibilities</h3><ol>{diagnosis.rankedPossibilities.map((item) => <li key={item.id}><strong>{item.name}</strong><span>{item.category}</span><p>{item.why?.[0]}</p></li>)}</ol></article>
      </div>
      {linkedPhotos.length > 0 && <section className="js-diagnosis-history__photos"><h3>Diagnostic photographs</h3><div>{linkedPhotos.map((photo) => <figure key={photo.id}><img src={photo.url || photo.src} alt={photo.name || "Plant health photograph"} /><figcaption>{photo.name}</figcaption></figure>)}</div></section>}
      <TreatmentPlan plan={diagnosis.treatmentPlan} />
      <section className="js-diagnosis-history__timeline"><header><p>Health progression</p><h2>Case timeline</h2></header>{timeline.map((item) => { const itemPhotos = photos.filter((photoItem) => item.photoIds?.includes(photoItem.id)); return <article key={item.id}><time>{new Date(item.createdAt).toLocaleString()}</time><div><h3>{item.type}</h3><HealthStatusSeal status={item.status || diagnosis.status} /><p>{item.notes || "No follow-up notes recorded."}</p>{item.symptoms?.length > 0 && <p><strong>Symptoms:</strong> {item.symptoms.join(", ")}</p>}{item.treatment && <p><strong>Treatment:</strong> {item.treatment}</p>}{itemPhotos.length > 0 && <div className="js-diagnosis-history__timeline-photos">{itemPhotos.map((photoItem) => <figure key={photoItem.id}><img src={photoItem.url || photoItem.src} alt={photoItem.name || "Plant health follow-up"} /><figcaption>{photoItem.name || "Follow-up photograph"}</figcaption></figure>)}</div>}</div></article>; })}</section>
      <form className="js-diagnosis-history__follow-up" onSubmit={saveFollowUp}>
        <header><p>Continue the case file</p><h2>Add follow-up</h2></header>
        <label>Follow-up type<select value={followUpType} onChange={(event) => setFollowUpType(event.target.value)}><option>Follow-up observation</option><option>Treatment recorded</option><option>Improvement noted</option><option>Outcome</option></select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Current symptoms<input value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="comma separated" /></label>
        <label>Treatment or action<input value={treatment} onChange={(event) => setTreatment(event.target.value)} placeholder="What was done?" /></label>
        <label>Follow-up photo<input type="file" accept="image/*" capture="environment" onChange={(event) => setPhoto(event.target.files?.[0] || null)} /></label>
        <label className="is-wide">Notes<textarea rows="4" value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <div className="js-diagnosis-history__actions"><button type="submit" className="js-health-primary">Save follow-up</button><button type="button" onClick={() => addFollowUp(diagnosis.id, { type:"Outcome", notes:"Marked resolved.", status:"Resolved", symptoms:[], treatment:"", photoIds:[] })}>Mark resolved</button><button type="button" onClick={() => addFollowUp(diagnosis.id, { type:"Case reopened", notes:"Reopened because the issue is recurring.", status:"Recurring", symptoms:[], treatment:"", photoIds:[] })}>Reopen as recurring</button><button type="button" onClick={() => onConsult?.(plant)}>Consult the Head Gardener</button></div>
      </form>
      <p className="js-health-disclaimer">This tool provides gardening guidance, not a guaranteed diagnosis. Confirm serious or spreading problems with a local cooperative extension office or qualified horticulture professional.</p>
    </div>
  );
}
