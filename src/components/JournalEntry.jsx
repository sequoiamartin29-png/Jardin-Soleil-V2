import React, { useEffect, useState } from "react";
import { useGarden } from "../context/GardenContext";
import EstatePage from "./EstatePage";
import PlantSelectorWithCreate from "./PlantSelectorWithCreate";

const entryTypes = ["Watering", "Fertilizer", "Pruning", "Bloom", "Harvest", "Pest", "Disease", "Weather", "Photo", "Note"];

export default function JournalEntry({ onSaveEntry, onNavigate }) {
  const { activePlants:plants } = useGarden();
  const [selectedPlant, setSelectedPlant] = useState(plants[0]?.id || "");
  const [entryType, setEntryType] = useState(entryTypes[0]);
  const [health, setHealth] = useState(100);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { if (!plants.some((plant) => plant.id === selectedPlant)) setSelectedPlant(plants[0]?.id || ""); }, [plants, selectedPlant]);
  const save = (event) => {
    event.preventDefault();
    if (!selectedPlant) { setMessage("Choose or create a plant before saving this entry."); return; }
    onSaveEntry?.({ plantId:selectedPlant, type:entryType, health:Number(health), notes:notes.trim() });
    setMessage("Journal entry saved in the estate archive."); setNotes("");
  };
  const selectedName = plants.find((plant) => plant.id === selectedPlant)?.name || "No plant selected";
  return <EstatePage id="new-journal-entry-title" title="New Garden Journal Entry" description="Record care, harvests, observations, and memories in the estate’s botanical ledger." icon="herb" theme="journal">
    <form className="js-estate-panel js-estate-form" onSubmit={save}>
      <PlantSelectorWithCreate label="Plant" value={selectedPlant} onChange={(plantId) => setSelectedPlant(plantId)} required description="Search the full registry or create a missing plant inline." />
      <label>Entry type<select value={entryType} onChange={(event) => setEntryType(event.target.value)}>{entryTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label className="is-wide">Health rating · {health}%<input type="range" min="0" max="100" value={health} onChange={(event) => setHealth(event.target.value)} /></label>
      <label className="is-wide">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What happened in Jardin Soleil today?" rows="6" /></label>
      {message && <p role="status" className="js-estate-badge is-gold">{message}</p>}
      <div className="js-task-form__actions"><button className="js-estate-button" type="button" onClick={() => onNavigate?.("Photo Manager")}>Add Photo</button><button className="js-estate-button" type="button" onClick={() => onNavigate?.("Journal Timeline")}>View Journal</button><button className="js-estate-button is-primary" type="submit">Save Entry</button></div>
    </form>
    <article className="js-estate-card" style={{marginTop:"22px"}}><span className="js-estate-kicker">Entry preview</span><h2 style={{fontFamily:"Georgia,serif",color:"#52623f"}}>{selectedName}</h2><p><strong>{entryType}</strong> · Health {health}%</p><p>{notes || "No notes entered yet."}</p></article>
  </EstatePage>;
}
