import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import BotanicalIcon from "./icons/BotanicalIcon";
import PlantMoveForm from "./PlantMoveForm";
import PlantDeleteDialog from "./PlantDeleteDialog";
import "./PlantProfile.css";

const careActions = [
  { label: "Water", type: "Watering", icon: "💧" },
  { label: "Feed", type: "Feeding", icon: "🌱" },
  { label: "Prune", type: "Pruning", icon: "✂️" },
  { label: "Treat", type: "Treatment", icon: "🩺" },
  { label: "Repot / Transplant", type: "Repotting / Transplanting", icon: "🪴" },
  { label: "General Care Note", type: "General Care Note", icon: "📝" },
];
const careTypes = careActions.map(({ type }) => type);

const cleanType = (type = "") => type.replace(/^[^A-Za-z]+/, "").trim();
const includesType = (entry, words) =>
  words.some((word) => cleanType(entry.type).toLowerCase().includes(word.toLowerCase()));
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "Not recorded";

export default function PlantProfile({onEdit,onExit,onConsult}) {
  const {
    selectedPlant,
    setSelectedPlant,
    plants,
    getEntriesForPlant,
    getPhotosForPlant,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addPhotos,
    updatePlant,
    archivePlant,
    restorePlant,
  } = useGarden();
  const [entryType, setEntryType] = useState("Watering");
  const [entryNotes, setEntryNotes] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [selectedCareType, setSelectedCareType] = useState(null);
  const [careDate, setCareDate] = useState(new Date().toISOString().slice(0, 10));
  const [careTime, setCareTime] = useState("");
  const [careNotes, setCareNotes] = useState("");
  const [careProduct, setCareProduct] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [editingCareId, setEditingCareId] = useState(null);
  const [careFilter, setCareFilter] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [movingPlant, setMovingPlant] = useState(false);

  const plant = plants.find((item) => item.id === selectedPlant?.id) || selectedPlant;
  const history = plant ? getEntriesForPlant(plant.id) : [];
  const photos = plant ? getPhotosForPlant(plant.id) : [];
  const hasHealth = plant?.health !== undefined && plant?.health !== null && plant?.health !== "";
  const collectionMembers = (plant?.collectionMembers || []).map((id) => plants.find((item) => item.id === id)).filter(Boolean);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [history]
  );

  if (!plant) {
    return (
      <section className="js-profile js-profile--empty">
        <h1>No plant selected</h1>
        <p>Choose a plant from the Orchard or Plant Directory to open its estate record.</p>
      </section>
    );
  }

  const latest = (...words) => sortedHistory.find((entry) => includesType(entry, words));
  const lastWatered = latest("water");
  const lastFertilized = latest("fertiliz", "feed");
  const lastPruned = latest("prun");
  const lastPest = latest("pest", "disease", "treatment");
  const careHistory = sortedHistory.filter((entry) =>
    entry.careEvent || includesType(entry, ["water", "fertiliz", "feed", "prun", "treatment", "pest", "disease", "repot", "transplant", "general care"])
  );
  const filteredCareHistory = careFilter === "All"
    ? careHistory
    : careHistory.filter((entry) => cleanType(entry.type) === careFilter);
  const nextScheduledCare = careHistory
    .filter((entry) => entry.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))[0];
  const growthHistory = sortedHistory.filter((entry) =>
    includesType(entry, ["bloom", "fruit", "harvest", "growth", "season", "weather"])
  );
  const notes = plant.profileNotes || [];
  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(noteSearch.toLowerCase())
  );
  const nextCare = nextScheduledCare
    ? `${cleanType(nextScheduledCare.type)} due ${formatDate(nextScheduledCare.nextDueDate)}`
    : hasHealth && Number(plant.health) < 85
    ? "Inspect health concerns and record a treatment"
    : !lastWatered
      ? `Check soil moisture and follow ${plant.water || "the watering plan"}`
      : !lastFertilized
        ? `Review ${plant.fertilizer || "seasonal feeding"}`
        : "Continue routine observation and seasonal care";

  const resetCareForm = () => {
    setSelectedCareType(null);
    setEditingCareId(null);
    setCareDate(new Date().toISOString().slice(0, 10));
    setCareTime("");
    setCareNotes("");
    setCareProduct("");
    setNextDueDate("");
  };

  const openCareForm = (type) => {
    resetCareForm();
    setSelectedCareType(type);
  };

  const saveCareEvent = (event) => {
    event.preventDefault();
    const createdAt = new Date(`${careDate}T${careTime || "12:00"}`).toISOString();
    const careEvent = {
      plantId: plant.id,
      type: selectedCareType,
      careEvent: true,
      careDate,
      careTime,
      createdAt,
      notes: careNotes.trim(),
      productAmount: careProduct.trim(),
      nextDueDate,
    };

    if (editingCareId) updateJournalEntry(editingCareId, careEvent);
    else addJournalEntry(careEvent);
    resetCareForm();
  };

  const editCareEvent = (entry) => {
    setEditingCareId(entry.id);
    setSelectedCareType(cleanType(entry.type));
    setCareDate(entry.careDate || new Date(entry.createdAt).toISOString().slice(0, 10));
    setCareTime(entry.careTime || "");
    setCareNotes(entry.notes || "");
    setCareProduct(entry.productAmount || "");
    setNextDueDate(entry.nextDueDate || "");
  };

  const removeCareEvent = (entryId) => {
    if (window.confirm("Delete this care entry?")) deleteJournalEntry(entryId);
  };

  const saveJournalEntry = (event) => {
    event.preventDefault();
    if (!entryNotes.trim()) return;
    addJournalEntry({
      plantId: plant.id,
      type: entryType,
      ...(hasHealth ? { health:plant.health } : {}),
      notes: entryNotes.trim(),
    });
    setEntryNotes("");
  };

  const addNote = (event) => {
    event.preventDefault();
    if (!noteText.trim()) return;
    updatePlant(plant.id, (current) => ({
      ...current,
      profileNotes: [
        { id: Date.now(), text: noteText.trim(), createdAt: new Date().toISOString() },
        ...(current.profileNotes || []),
      ],
    }));
    setNoteText("");
  };

  const saveEditedNote = (noteId) => {
    if (!editingNoteText.trim()) return;
    updatePlant(plant.id, (current) => ({
      ...current,
      profileNotes: (current.profileNotes || []).map((note) =>
        note.id === noteId
          ? { ...note, text: editingNoteText.trim(), updatedAt: new Date().toISOString() }
          : note
      ),
    }));
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const handlePhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    const uploaded = await Promise.all(files.map((file, index) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: `${Date.now()}-${index}`,
        plantId: plant.id,
        name: file.name,
        date: new Date().toISOString(),
        url: reader.result,
      });
      reader.readAsDataURL(file);
    })));
    addPhotos(uploaded);
    event.target.value = "";
  };

  return (
    <section className="js-profile" aria-labelledby="plant-profile-title">
      <header className="js-profile__hero">
        <BotanicalIcon plant={plant} size="xl" decorative className="js-profile__plant-icon" />
        <p>Jardin Soleil · Individual Estate Record</p>
        <h1 id="plant-profile-title">{plant.name}</h1>
        <strong>{plant.nickname || "A cherished garden resident"}</strong>
        {hasHealth ? <div className="js-profile__health" aria-label={`${plant.health}% health`}><span style={{ width: `${plant.health}%` }} /></div> : <p>Health not recorded</p>}
      </header>
      <div className="js-profile__record-actions"><button type="button" onClick={()=>onConsult?.(plant)}>Consult the Head Gardener</button><button type="button" onClick={onEdit}>Edit Plant</button><button type="button" onClick={()=>setMovingPlant(true)}>Move / Reclassify</button>{plant.archived?<button type="button" onClick={()=>restorePlant(plant.id)}>Restore Plant</button>:<button type="button" onClick={()=>{archivePlant(plant.id);onExit?.();}}>Archive Plant</button>}<button className="is-danger" type="button" onClick={()=>setConfirmDelete(true)}>Delete Plant</button></div>
      {movingPlant&&<PlantMoveForm plant={plant} onCancel={()=>setMovingPlant(false)} onSaved={(updated)=>{setSelectedPlant(updated);setMovingPlant(false);}}/>}
      {confirmDelete&&<PlantDeleteDialog plant={plant} onCancel={()=>setConfirmDelete(false)} onScheduled={()=>{setConfirmDelete(false);onExit?.();}}/>}

      <div className="js-profile__grid js-profile__grid--top">
        <article className="js-profile__card">
          <h2>Identity</h2>
          <dl>
            <div><dt>Common name</dt><dd>{plant.name}</dd></div>
            <div><dt>Nickname</dt><dd>{plant.nickname || "Not recorded"}</dd></div>
            <div><dt>Variety / botanical name</dt><dd>{plant.variety || plant.botanicalName || plant.type || "Not recorded"}</dd></div>
            <div><dt>Category</dt><dd>{plant.category || "Not recorded"}</dd></div>
            <div><dt>Plant type</dt><dd>{plant.type || "Not recorded"}</dd></div>
            <div><dt>Garden location</dt><dd>{plant.location || "Not recorded"}</dd></div>
          </dl>
        </article>

        {collectionMembers.length > 0 && <article className="js-profile__card js-profile__collection">
          <h2>Mint Collection</h2><p>{collectionMembers.length} canonical mint varieties</p>
          <div>{collectionMembers.map((member)=><button type="button" key={member.id} onClick={()=>setSelectedPlant(member)}>{member.name}</button>)}</div>
        </article>}

        <article className="js-profile__card">
          <h2>Current care</h2>
          <dl>
            <div><dt>Health status</dt><dd>{hasHealth ? `${plant.health}%` : "Not recorded"}{plant.status ? ` · ${plant.status}` : ""}</dd></div>
            <div><dt>Last watered</dt><dd>{formatDate(lastWatered?.createdAt)}</dd></div>
            <div><dt>Last fed</dt><dd>{formatDate(lastFertilized?.createdAt)}</dd></div>
            <div><dt>Last pruned</dt><dd>{formatDate(lastPruned?.createdAt)}</dd></div>
            <div><dt>Last treated</dt><dd>{lastPest ? `${formatDate(lastPest.createdAt)} · ${lastPest.notes || "Treatment recorded"}` : "Not recorded"}</dd></div>
            <div><dt>Next care</dt><dd>{nextCare}</dd></div>
          </dl>
        </article>
      </div>

      <article className="js-profile__card js-profile__gallery">
        <div className="js-profile__section-heading">
          <div><p>Visual archive</p><h2>Photo gallery</h2></div>
          <label className="js-profile__button">Add photos<input type="file" accept="image/*" multiple onChange={handlePhotos} /></label>
        </div>
        {photos.length ? (
          <div className="js-profile__photos">
            {photos.map((photo) => <figure key={photo.id}><img src={photo.url} alt={photo.name || plant.name} /><figcaption>{photo.name}</figcaption></figure>)}
          </div>
        ) : <p className="js-profile__empty-state">No saved photos for {plant.nickname || plant.name} yet.</p>}
      </article>

      <div className="js-profile__grid">
        <article className="js-profile__card">
          <div className="js-profile__section-heading"><div><p>Garden care</p><h2>Care history</h2></div></div>
          <div className="js-profile__care-actions" aria-label="Plant care actions">
            {careActions.map(({ label, type, icon }) => <button type="button" key={type} onClick={() => openCareForm(type)}><span aria-hidden="true">{icon}</span>{label}</button>)}
          </div>

          {selectedCareType && (
            <form className="js-profile__care-form" onSubmit={saveCareEvent}>
              <h3>{editingCareId ? "Edit" : "Record"} {selectedCareType}</h3>
              <label>Plant<input value={`${plant.name}${plant.nickname ? ` (${plant.nickname})` : ""}`} readOnly /></label>
              <label>Care type<select value={selectedCareType} onChange={(event) => setSelectedCareType(event.target.value)}>{careTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label>Date<input type="date" required value={careDate} onChange={(event) => setCareDate(event.target.value)} /></label>
              <label>Time (optional)<input type="time" value={careTime} onChange={(event) => setCareTime(event.target.value)} /></label>
              <label className="is-wide">Notes<textarea rows="3" value={careNotes} onChange={(event) => setCareNotes(event.target.value)} placeholder="What care was completed?" /></label>
              <label>Amount or product (optional)<input value={careProduct} onChange={(event) => setCareProduct(event.target.value)} placeholder="e.g. 2 gallons or Citrus-Tone" /></label>
              <label>Next due date (optional)<input type="date" value={nextDueDate} onChange={(event) => setNextDueDate(event.target.value)} /></label>
              <div className="js-profile__care-form-actions"><button className="js-profile__button" type="submit">Save care event</button><button type="button" onClick={resetCareForm}>Cancel</button></div>
            </form>
          )}

          <label className="js-profile__care-filter">Filter care history<select value={careFilter} onChange={(event) => setCareFilter(event.target.value)}><option>All</option>{careTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <CareTimeline plant={plant} entries={filteredCareHistory} onEdit={editCareEvent} onDelete={removeCareEvent} />
        </article>

        <article className="js-profile__card">
          <h2>Growth & production</h2>
          <p><strong>Bloom:</strong> {plant.bloom || "Not recorded"}</p>
          <p><strong>Fruit / harvest:</strong> {plant.harvest || "Not recorded"}</p>
          <Timeline entries={growthHistory} empty="No seasonal observations recorded yet." />
        </article>
      </div>

      <article className="js-profile__card">
        <div className="js-profile__section-heading"><div><p>Plant record</p><h2>Journal history</h2></div></div>
        <form className="js-profile__entry-form" onSubmit={saveJournalEntry}>
          <label>Entry type<select value={entryType} onChange={(event) => setEntryType(event.target.value)}>{[...careTypes, "Bloom", "Harvest", "Seasonal Observation", "Note"].map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Journal note<textarea value={entryNotes} onChange={(event) => setEntryNotes(event.target.value)} rows="3" placeholder={`Add an observation for ${plant.nickname || plant.name}`} /></label>
          <button className="js-profile__button" type="submit">Save journal entry</button>
        </form>
        <Timeline entries={sortedHistory} empty="No journal history yet." />
      </article>

      <article className="js-profile__card">
        <div className="js-profile__section-heading"><div><p>Searchable archive</p><h2>Notes</h2></div><input aria-label="Search plant notes" type="search" value={noteSearch} onChange={(event) => setNoteSearch(event.target.value)} placeholder="Search notes" /></div>
        <form className="js-profile__note-form" onSubmit={addNote}><textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows="3" placeholder="Add a plant-specific note" /><button className="js-profile__button" type="submit">Add note</button></form>
        <div className="js-profile__notes">
          {filteredNotes.length ? filteredNotes.map((note) => (
            <div key={note.id}>
              {editingNoteId === note.id ? (
                <><textarea value={editingNoteText} onChange={(event) => setEditingNoteText(event.target.value)} /><button type="button" onClick={() => saveEditedNote(note.id)}>Save</button><button type="button" onClick={() => setEditingNoteId(null)}>Cancel</button></>
              ) : (
                <><p>{note.text}</p><small>{formatDate(note.updatedAt || note.createdAt)}</small><button type="button" onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}>Edit note</button></>
              )}
            </div>
          )) : <p className="js-profile__empty-state">No matching plant notes.</p>}
        </div>
      </article>
    </section>
  );
}

function Timeline({ entries, empty }) {
  if (!entries.length) return <p className="js-profile__empty-state">{empty}</p>;
  return <div className="js-profile__timeline">{entries.map((entry) => <div key={entry.id}><time>{formatDate(entry.createdAt)}</time><strong>{cleanType(entry.type) || "Garden note"}</strong><p>{entry.notes || "No notes added."}</p></div>)}</div>;
}

function CareTimeline({ plant, entries, onEdit, onDelete }) {
  if (!entries.length) {
    return <p className="js-profile__empty-state">No care history exists for this plant yet.</p>;
  }

  return (
    <div className="js-profile__care-history">
      {entries.map((entry) => (
        <article key={entry.id}>
          <span className="js-profile__care-icon"><BotanicalIcon plant={plant} size="sm" decorative /></span>
          <div>
            <time>{formatDate(entry.createdAt)}{entry.careTime ? ` · ${entry.careTime}` : ""}</time>
            <h3>{cleanType(entry.type)}</h3>
            <p>{entry.notes || "No notes added."}</p>
            {entry.productAmount && <p><strong>Amount / product:</strong> {entry.productAmount}</p>}
            {entry.nextDueDate && <p><strong>Next due:</strong> {formatDate(entry.nextDueDate)}</p>}
          </div>
          <div className="js-profile__care-entry-actions">
            <button type="button" onClick={() => onEdit(entry)}>Edit</button>
            <button type="button" onClick={() => onDelete(entry.id)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}
