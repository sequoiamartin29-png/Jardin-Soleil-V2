import React, { useMemo, useState } from "react";
import BotanicalIcon from "../icons/BotanicalIcon";
import { buildTreatmentPlan, immediateSafeActions } from "../../utils/rankPlantConditions";
import TreatmentPlan from "./TreatmentPlan";

const statuses = ["Unconfirmed", "Monitoring", "Treating", "Improving", "Resolved", "Recurring"];

export default function DiagnosticResults({ result, onSave, onRestart, onConsult }) {
  const { context, analysis } = result;
  const [workingDiagnosis, setWorkingDiagnosis] = useState(analysis.ranked[0]?.name || "Unconfirmed");
  const [status, setStatus] = useState("Unconfirmed");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const selected = analysis.ranked.find((item) => item.name === workingDiagnosis) || analysis.ranked[0];
  const treatmentPlan = useMemo(() => buildTreatmentPlan(selected, context.plant), [selected, context.plant]);

  const save = () => onSave({
    plantId:context.plant.id,
    date:new Date().toISOString().slice(0, 10),
    affectedArea:context.affectedArea,
    symptoms:context.symptoms,
    pestEvidence:context.pestEvidence,
    recentConditions:context.recentConditions,
    timeline:context.timeline,
    photoIds:context.photoIds,
    rankedPossibilities:analysis.ranked,
    workingDiagnosis,
    confidence:analysis.confidence,
    treatmentPlan,
    notes:notes.trim(),
    followUpDate,
    status,
    sourceMode:context.photoMode === "external" ? "Secure external image analysis with local context" : "Local deterministic analysis",
    weatherSourceStatus:context.weatherSourceStatus,
    weatherEvidence:context.weatherEvidence,
    recentCareSummary:context.recentCare.slice(0, 5).map((entry) => ({ id:entry.id, type:entry.type, createdAt:entry.createdAt })),
  });

  return (
    <div className="js-health-results">
      <section className="js-health-results__case" aria-labelledby="diagnostic-assessment-title">
        <div className="js-health-results__plant">
          <BotanicalIcon plant={context.plant} size="lg" decorative />
          <div><p>Plant case file</p><h2>{context.plant.name}</h2><span>{context.plant.gardenZone || context.plant.location || "Location not recorded"}</span></div>
          <strong className={`is-${analysis.confidence.toLocaleLowerCase()}`}>{analysis.confidence} confidence</strong>
        </div>
        <dl>
          <div><dt>Recent watering</dt><dd>{context.lastWatered ? new Date(context.lastWatered.createdAt).toLocaleDateString() : "No saved watering record"}</dd></div>
          <div><dt>Weather context</dt><dd>{context.weatherEvidence}</dd></div>
          <div><dt>Affected area</dt><dd>{context.affectedArea}</dd></div>
          <div><dt>Timeline</dt><dd>{context.timeline}</dd></div>
        </dl>
      </section>

      <section className="js-health-results__assessment" aria-labelledby="diagnostic-assessment-title">
        <header><p>Local botanical assessment</p><h2 id="diagnostic-assessment-title">Ranked possibilities</h2><span>{analysis.limitation}</span></header>
        <div className="js-health-results__possibilities">
          {analysis.ranked.map((possibility, index) => (
            <article key={possibility.id} className={index === 0 ? "is-most-likely" : ""}>
              <div><span>{index === 0 ? "Most likely" : `Possibility ${index + 1}`}</span><strong>{possibility.category}</strong></div>
              <h3>{possibility.name}</h3>
              <h4>Why it may fit</h4><ul>{possibility.why.map((item) => <li key={item}>{item}</li>)}</ul>
              <h4>Conflicting evidence</h4><p>{possibility.conflictingEvidence}</p>
              <h4>What to inspect next</h4><p>{possibility.inspectNext}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="js-health-results__safe-actions">
        <h2>Immediate safe actions</h2>
        <ul>{immediateSafeActions.map((action) => <li key={action}>{action}</li>)}</ul>
      </section>

      <TreatmentPlan plan={treatmentPlan} />

      <section className="js-health-results__save">
        <div><p>Estate case record</p><h2>Save this assessment</h2></div>
        <label>Working diagnosis<select value={workingDiagnosis} onChange={(event) => setWorkingDiagnosis(event.target.value)}>{analysis.ranked.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Follow-up date<input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} /></label>
        <label className="is-wide">Case notes<textarea rows="4" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record observations without overstating certainty." /></label>
        <div className="js-health-results__save-actions">
          <button type="button" onClick={onRestart}>Start over</button>
          <button type="button" onClick={() => onConsult?.(context.plant)}>Consult the Head Gardener</button>
          <button className="is-primary" type="button" onClick={save}>Save diagnosis</button>
        </div>
      </section>

      <p className="js-health-disclaimer">This tool provides gardening guidance, not a guaranteed diagnosis. Confirm serious or spreading problems with a local cooperative extension office or qualified horticulture professional.</p>
    </div>
  );
}

