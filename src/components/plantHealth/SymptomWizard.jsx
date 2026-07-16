import React, { useEffect, useMemo, useState } from "react";
import PlantSelectorWithCreate from "../PlantSelectorWithCreate";
import { inferRecentConditions } from "../../utils/buildDiagnosticContext";

const areas = ["leaves", "stems", "roots", "flowers", "fruit", "bark", "whole plant"];
const leafSymptoms = ["yellowing", "browning", "black spots", "brown spots", "white powder", "orange or rust-colored spots", "curling", "wilting", "holes", "skeletonized leaves", "sticky residue", "webbing", "mottling", "distorted growth", "scorched edges", "leaf drop", "torn leaves"];
const stemSymptoms = ["cracking", "cankers", "soft rot", "discoloration", "sap or gum", "boring holes", "dieback"];
const fruitSymptoms = ["blossom drop", "fruit drop", "rot", "cracking", "malformed fruit", "spots", "fruit spots", "worms or larvae", "poor fruit set"];
const rootSymptoms = ["stunted growth", "sudden collapse", "poor vigor", "root rot smell", "loose plant", "uneven growth", "one-sided dieback"];
const symptomMap = { leaves:leafSymptoms, stems:stemSymptoms, bark:stemSymptoms, flowers:fruitSymptoms, fruit:fruitSymptoms, roots:rootSymptoms, "whole plant":[...new Set([...leafSymptoms, ...rootSymptoms, "sudden collapse", "poor vigor"])] };
const pests = ["aphids", "mites", "beetles", "caterpillars", "whiteflies", "scale", "mealybugs", "slugs or snails", "ants", "webs", "eggs", "frass", "worms or larvae", "no visible pests", "unsure"];
const conditions = ["recent watering", "heavy rain", "drought", "heat", "frost", "wind", "recent feeding", "pesticide use", "repotting or transplanting", "pruning", "recent planting"];
const timelines = ["started today", "several days", "one to two weeks", "more than two weeks", "recurring"];
const steps = ["Plant", "Affected area", "Visible symptoms", "Pest evidence", "Recent conditions", "Timeline"];
const toggle = (list, value) => list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export default function SymptomWizard({ plants, journalEntries, environment, initialDraft = {}, onDraftChange, onComplete }) {
  const [step, setStep] = useState(initialDraft.plantId ? 2 : 1);
  const [draft, setDraft] = useState({ plantId:"", affectedArea:"leaves", symptoms:[], pestEvidence:[], recentConditions:[], timeline:"", photoIds:[], photoMode:"symptom", ...initialDraft });
  const plant = plants.find((item) => item.id === draft.plantId);
  const symptoms = useMemo(() => symptomMap[draft.affectedArea] || leafSymptoms, [draft.affectedArea]);

  useEffect(() => { onDraftChange?.({ ...draft, currentStep:"symptoms", wizardStep:step }); }, [draft, step]);

  useEffect(() => {
    if (!plant || draft.recentConditions.length) return;
    setDraft((current) => ({ ...current, recentConditions:inferRecentConditions({ plant, journalEntries, environment }) }));
  }, [plant, journalEntries, environment, draft.recentConditions.length]);

  const valid = step === 1 ? !!draft.plantId : step === 2 ? !!draft.affectedArea : step === 3 ? draft.symptoms.length > 0 : step === 4 ? draft.pestEvidence.length > 0 : step === 6 ? !!draft.timeline : true;
  const next = () => { if (!valid) return; if (step < 6) setStep((current) => current + 1); else onComplete(draft); };

  return (
    <section className="js-health-wizard js-health-ledger" aria-labelledby="symptom-wizard-title">
      <header><p>Guided botanical examination</p><h2 id="symptom-wizard-title">Symptom wizard</h2><span>Step {step} of 6 · {steps[step - 1]}</span></header>
      {initialDraft.notice && <aside className="js-health-wizard__notice" role="status">{initialDraft.notice}</aside>}
      <ol className="js-health-wizard__progress" aria-label="Diagnostic progress">{steps.map((item, index) => <li className={index + 1 === step ? "is-current" : index + 1 < step ? "is-complete" : ""} key={item}><span>{index + 1}</span>{item}</li>)}</ol>

      <div className="js-health-wizard__step">
        {step === 1 && <PlantSelectorWithCreate value={draft.plantId} onChange={(plantId) => setDraft((current) => ({ ...current, plantId }))} label="Choose an existing plant" required createLabel="+ Create New Plant" createTitle="Create Plant for Health Record" />}
        {step === 2 && <ChoiceGrid legend="Which area is affected?" values={areas} selected={[draft.affectedArea]} onToggle={(affectedArea) => setDraft((current) => ({ ...current, affectedArea, symptoms:[] }))} />}
        {step === 3 && <ChoiceGrid legend={`Visible symptoms on ${draft.affectedArea}`} values={symptoms} selected={draft.symptoms} onToggle={(value) => setDraft((current) => ({ ...current, symptoms:toggle(current.symptoms, value) }))} multiple />}
        {step === 4 && <ChoiceGrid legend="What pest evidence can you see?" values={pests} selected={draft.pestEvidence} onToggle={(value) => setDraft((current) => ({ ...current, pestEvidence:toggle(current.pestEvidence, value) }))} multiple />}
        {step === 5 && <ChoiceGrid legend="Recent conditions and care" description="Available weather and saved care conditions are preselected. Adjust them if they do not match the plant’s actual experience." values={conditions} selected={draft.recentConditions} onToggle={(value) => setDraft((current) => ({ ...current, recentConditions:toggle(current.recentConditions, value) }))} multiple />}
        {step === 6 && <ChoiceGrid legend="When did this begin?" values={timelines} selected={[draft.timeline]} onToggle={(timeline) => setDraft((current) => ({ ...current, timeline }))} />}
      </div>

      {!valid && <p className="js-health-wizard__validation" role="status">Choose at least one option to continue.</p>}
      <div className="js-health-wizard__actions">
        <button type="button" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>Back</button>
        <button className="js-health-primary" type="button" disabled={!valid} onClick={next}>{step === 6 ? "Prepare assessment" : "Continue"}</button>
      </div>
    </section>
  );
}

function ChoiceGrid({ legend, description, values, selected, onToggle, multiple = false }) {
  return <fieldset className="js-health-choice-grid"><legend>{legend}</legend>{description && <p>{description}</p>}<div>{values.map((value) => { const checked = selected.includes(value); return <label className={checked ? "is-selected" : ""} key={value}><input type={multiple ? "checkbox" : "radio"} checked={checked} onChange={() => onToggle(value)} />{value}</label>; })}</div></fieldset>;
}
