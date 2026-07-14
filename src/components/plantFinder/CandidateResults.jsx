import React, { useMemo, useState } from "react";
import BotanicalIcon from "../icons/BotanicalIcon";
import CandidateComparison from "./CandidateComparison";
import ExpertVerification from "./ExpertVerification";
import { identificationStatuses } from "../../utils/plantFinderRules";

const photoFlowSteps = ["Photo Selected", "Analyzing", "Results", "Confirm Match / Guided Follow-Up", "Save Identification", "Add to My Estate"];

const compactMatch = (match) => ({
  id:match.id, commonName:match.commonName, botanicalName:match.botanicalName, family:match.family,
  category:match.category, type:match.type, group:match.group, confidence:match.confidence, score:match.score,
  why:match.why, conflicts:match.conflicts, inspectNext:match.inspectNext,
  form:match.form, leafArrangement:match.leafArrangement, leafTraits:match.leafTraits, flowerColors:match.flowerColors,
  flowerShapes:match.flowerShapes, fruit:match.fruit, stem:match.stem, habitat:match.habitat, regions:match.regions,
  nativeStatus:match.nativeStatus, habit:match.habit, size:match.size, light:match.light, water:match.water, zones:match.zones,
  flowerSeason:match.flowerSeason, fruitSeason:match.fruitSeason, pollinatorValue:match.pollinatorValue,
  invasiveStatus:match.invasiveStatus, toxicity:match.toxicity, edibility:match.edibility, herbalUse:match.herbalUse,
  conservationLegal:match.conservationLegal,
});

export default function CandidateResults({ context, matches, sourceLabel, sourceNotice, photoBased = false, needsFocusedFollowUp = false, onRestart, onContinueIdentifying, onAddPhoto, onSaveRecord, onUpdateRecord, onAddToEstate, onOpenHealthCenter }) {
  const [selectedId, setSelectedId] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [notes, setNotes] = useState(context.notes || "");
  const [verificationStatus, setVerificationStatus] = useState("Unconfirmed");
  const [savedRecord, setSavedRecord] = useState(null);
  const [message, setMessage] = useState("");
  const selected = matches.find((item) => item.id === selectedId) || null;
  const comparison = useMemo(() => matches.filter((item) => compareIds.includes(item.id)), [matches, compareIds]);
  const photoFlowIndex = savedRecord ? 4 : selected ? 3 : 2;
  const followUpLabel = photoBased ? needsFocusedFollowUp ? "Guided Follow-Up" : "Refine with Focused Questions" : "Continue identifying";

  const recordPayload = () => ({
    date:new Date().toISOString().slice(0, 10),
    photoIds:context.photoIds || [],
    traits:context,
    matches:matches.map(compactMatch),
    selectedMatch:selected ? compactMatch(selected) : null,
    confidence:selected?.confidence || matches[0]?.confidence || "Low",
    notes,
    location:{ country:context.country || "", region:context.region || "", usdaZone:context.usdaZone || "", coordinates:context.coordinates || null },
    verificationStatus,
    sourceMode:sourceLabel,
  });

  const save = () => {
    if (savedRecord) {
      onUpdateRecord(savedRecord.id, recordPayload());
      const next = { ...savedRecord, ...recordPayload() };
      setSavedRecord(next);
      setMessage("Identification record updated in Plant Finder History.");
      return next;
    }
    const next = onSaveRecord(recordPayload());
    setSavedRecord(next);
    setMessage(`Identification saved with ${verificationStatus} status.`);
    return next;
  };

  const addToEstate = () => {
    if (!selected) { setMessage("Choose the closest candidate before opening the estate plant form."); return; }
    const record = savedRecord || save();
    onAddToEstate(selected, record);
  };

  const updateExpert = (expertReview) => {
    if (!savedRecord) { setMessage("Save this identification before attaching an expert record."); return; }
    onUpdateRecord(savedRecord.id, { expertReview });
    setSavedRecord((current) => ({ ...current, expertReview }));
    setMessage("Expert contact details were saved. The status remains unchanged until you explicitly update it.");
  };

  const toggleCompare = (id) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);

  return (
    <section className="js-finder-results" aria-labelledby="plant-finder-results-title">
      <header className="js-finder-results__header"><div><p>{sourceLabel}</p><h2 id="plant-finder-results-title">Possible Field Matches</h2><span>{matches.length ? `${matches.length} cautious ${matches.length === 1 ? "comparison" : "comparisons"}, ranked from the traits provided` : "The current observations are not specific enough for a reliable match"}</span></div><button type="button" onClick={onRestart}>Start over</button></header>
      {photoBased && <ol className="js-finder-photo-flow is-results" aria-label="Photo identification progress">{photoFlowSteps.map((step, index) => <li key={step} className={index === photoFlowIndex ? "is-current" : index < photoFlowIndex ? "is-complete" : ""}><span>{index + 1}</span><small>{step}</small></li>)}</ol>}
      {sourceNotice && <aside className="js-finder-notice" role="status">{sourceNotice}</aside>}

      {!matches.length ? (
        <div className="js-finder-no-match">
          <BotanicalIcon type="generic-plant" size="xl" decorative />
          <h3>No reliable match was found from the current traits.</h3>
          <p>Photograph more structures, revisit uncertain traits, or ask a qualified local expert. A weak result has not been presented as an identity.</p>
          <div><button type="button" onClick={onContinueIdentifying}>{followUpLabel}</button><button type="button" onClick={save}>Save Unconfirmed record</button></div>
        </div>
      ) : (
        <>
          <div className="js-finder-results__grid">
            {matches.map((match, index) => (
              <article className={selectedId === match.id ? "is-selected" : ""} key={match.id}>
                <header><span>Candidate {index + 1}</span><strong className={`is-${match.confidence.toLocaleLowerCase()}`}>{match.confidence} confidence</strong></header>
                <BotanicalIcon type={match.type === "Fruit Tree" ? "generic-fruit-tree" : match.type === "Mint" ? "mint" : match.category === "Flowers & Perennials" ? "flower" : "generic-plant"} size="lg" decorative />
                <h3>{match.commonName}</h3><em>{match.botanicalName || "Botanical name unknown"}</em>
                <p className="js-finder-results__family">{match.family || "Family unknown"}</p>
                <h4>Why it ranked</h4><ul>{(match.why || []).slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
                {match.conflicts?.length > 0 && <><h4>Conflicting evidence</h4><ul className="is-conflict">{match.conflicts.map((item) => <li key={item}>{item}</li>)}</ul></>}
                <h4>Inspect next</h4><p>{match.inspectNext}</p>
                <details><summary>Field profile & cautions</summary><dl><Info label="Native or introduced" value={match.nativeStatus} /><Info label="Habit and size" value={[match.habit, match.size].filter(Boolean).join(" · ")} /><Info label="Light and water" value={[match.light, match.water].filter(Boolean).join(" · ")} /><Info label="Zones" value={match.zones} /><Info label="Flower / fruit season" value={[match.flowerSeason, match.fruitSeason].filter(Boolean).join(" · ")} /><Info label="Pollinator value" value={match.pollinatorValue} /><Info label="Invasive status" value={match.invasiveStatus} /><Info label="Toxicity" value={match.toxicity} /><Info label="Edibility" value={match.edibility} /><Info label="Traditional herbal use" value={match.herbalUse} /><Info label="Legal / conservation" value={match.conservationLegal} /></dl></details>
                <div className="js-finder-results__card-actions"><button type="button" className="is-primary" aria-pressed={selectedId === match.id} onClick={() => setSelectedId(match.id)}>This looks closest</button><label><input type="checkbox" checked={compareIds.includes(match.id)} disabled={!compareIds.includes(match.id) && compareIds.length >= 3} onChange={() => toggleCompare(match.id)} /> Compare</label></div>
              </article>
            ))}
          </div>
          <div className="js-finder-results__decision"><button type="button" onClick={() => { setSelectedId(""); setCompareIds([]); setMessage("No candidate selected. Continue the field key or save an unconfirmed record."); }}>None of these</button><button type="button" onClick={onContinueIdentifying}>{followUpLabel}</button><button type="button" aria-label={`Compare selected (${compareIds.length})`} disabled={compareIds.length < 2} onClick={() => setShowComparison(true)}>Compare selected ({compareIds.length})</button></div>
        </>
      )}

      {showComparison && comparison.length >= 2 && <CandidateComparison candidates={comparison} onClose={() => setShowComparison(false)} />}

      <section className="js-finder-save" aria-labelledby="save-identification-title">
        <header><p>Field notebook</p><h3 id="save-identification-title">Save this identification</h3></header>
        <div><label><span>Verification status</span><select value={verificationStatus} onChange={(event) => setVerificationStatus(event.target.value)}>{identificationStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="is-wide"><span>Personal notes</span><textarea rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div>
        {message && <p role="status">{message}</p>}
        <div className="js-finder-actions"><button type="button" className="is-quiet" onClick={save}>{savedRecord ? "Update identification" : "Save identification"}</button><button type="button" className="is-primary" onClick={addToEstate} disabled={!selected}>Add to My Estate</button></div>
      </section>

      <ExpertVerification initial={savedRecord?.expertReview} onSave={updateExpert} onAddPhoto={onAddPhoto} />
      <aside className="js-finder-health-handoff"><div><strong>Are you documenting damage or symptoms?</strong><p>Identification and health diagnosis are separate. Carry the saved image and field notes into the Plant Health Center without treating a possible species match as a diagnosis.</p></div><button type="button" onClick={() => onOpenHealthCenter({ photoIds:context.photoIds || [], notes })}>Open Plant Health Center</button></aside>
      <p className="js-finder-safety">Never eat, brew, or medically use a wild plant based only on an app identification. Confirm with a qualified local expert.</p>
    </section>
  );
}

function Info({ label, value }) { return <div><dt>{label}</dt><dd>{value || "Unknown"}</dd></div>; }
