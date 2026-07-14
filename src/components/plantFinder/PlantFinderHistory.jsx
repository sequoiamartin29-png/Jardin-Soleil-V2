import React, { useMemo, useState } from "react";
import { useGarden } from "../../context/GardenContext";
import BotanicalIcon from "../icons/BotanicalIcon";
import { EstateActionButton, EstatePageShell } from "../EstatePageSystem";
import { identificationStatuses } from "../../utils/plantFinderRules";
import ExpertVerification from "./ExpertVerification";
import "./PlantFinder.css";

export default function PlantFinderHistory({ onBack, onAddToEstate }) {
  const { plantIdentifications, photos, updatePlantIdentification, deletePlantIdentification } = useGarden();
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState("");
  const visible = useMemo(() => plantIdentifications.filter((record) => {
    const selected = record.selectedMatch;
    const text = `${selected?.commonName || ""} ${selected?.botanicalName || ""} ${record.notes || ""}`.toLocaleLowerCase();
    return (status === "All" || record.verificationStatus === status) && (!search.trim() || text.includes(search.trim().toLocaleLowerCase()));
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [plantIdentifications, search, status]);

  return (
    <EstatePageShell id="plant-finder-history-title" eyebrow="Jardin Soleil · Field Archive" title="Plant Finder History" subtitle="Saved observations remain separate from confirmed estate plant records" icon="herb" actions={<EstateActionButton variant="primary" onClick={onBack}>New identification</EstateActionButton>} className="js-plant-finder">
      <section className="js-finder-history__filters" aria-label="Identification history filters"><label><span>Search history</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Common name, botanical name, or notes" /></label><label><span>Verification status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option>{identificationStatuses.map((item) => <option key={item}>{item}</option>)}</select></label></section>
      {!visible.length ? <div className="js-finder-no-match"><BotanicalIcon type="herb" size="xl" decorative /><h2>No saved identifications match this view.</h2><p>Begin a field observation or adjust the history filters.</p><button type="button" onClick={onBack}>Open Plant Finder</button></div> : <div className="js-finder-history">
        {visible.map((record) => {
          const selected = record.selectedMatch;
          const photo = photos.find((item) => record.photoIds?.includes(item.id));
          const expanded = expandedId === record.id;
          return <article key={record.id}>
            {photo ? <img src={photo.url} alt={`Saved field specimen${selected ? ` for possible ${selected.commonName}` : ""}`} /> : <div className="js-finder-history__specimen"><BotanicalIcon type="generic-plant" size="lg" decorative /></div>}
            <div className="js-finder-history__summary"><p>{new Date(`${record.date}T12:00:00`).toLocaleDateString()} · {record.sourceMode}</p><h2>{selected?.commonName || "Unidentified specimen"}</h2><em>{selected?.botanicalName || "No candidate selected"}</em><span>{record.confidence} confidence · {record.verificationStatus}</span><p>{record.notes || "No field notes saved."}</p></div>
            <div className="js-finder-history__actions"><button type="button" onClick={() => setExpandedId(expanded ? "" : record.id)} aria-expanded={expanded}>{expanded ? "Close details" : "Review details"}</button>{selected && <button type="button" onClick={() => onAddToEstate(selected, record)}>Add to My Estate</button>}<button type="button" className="is-danger" onClick={() => setConfirmDeleteId(record.id)}>Delete record</button></div>
            {expanded && <div className="js-finder-history__details"><label><span>Verification status</span><select value={record.verificationStatus} onChange={(event) => updatePlantIdentification(record.id, { verificationStatus:event.target.value })}>{identificationStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><section><h3>Recorded traits</h3><p>{Object.entries(record.traits || {}).filter(([, value]) => Array.isArray(value) ? value.length : value && typeof value !== "object").map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join(" · ") || "No traits recorded."}</p></section><section><h3>Ranked candidates</h3><ol>{record.matches?.map((match) => <li key={match.id}><strong>{match.commonName}</strong> <em>{match.botanicalName}</em> · {match.confidence}</li>)}</ol></section><ExpertVerification initial={record.expertReview} onSave={(expertReview) => updatePlantIdentification(record.id, { expertReview })} /></div>}
          </article>;
        })}
      </div>}
      {confirmDeleteId && <div className="js-finder-confirm" role="dialog" aria-modal="true" aria-labelledby="delete-identification-title"><div><h2 id="delete-identification-title">Delete this field record?</h2><p>This removes the identification history entry. It does not delete any confirmed estate plant.</p><div><button type="button" onClick={() => setConfirmDeleteId("")}>Cancel</button><button type="button" className="is-danger" onClick={() => { deletePlantIdentification(confirmDeleteId); setConfirmDeleteId(""); }}>Delete identification</button></div></div></div>}
      <p className="js-finder-safety">Never eat, brew, or medically use a wild plant based only on an app identification. Confirm with a qualified local expert.</p>
    </EstatePageShell>
  );
}

