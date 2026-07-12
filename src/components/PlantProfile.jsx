import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import "./PlantProfile.css";

const careTypes = ["Watering", "Fertilizer", "Pruning", "Treatment", "Repotting / Transplanting"];

const cleanType = (type = "") => type.replace(/^[^A-Za-z]+/, "").trim();
const includesType = (entry, words) =>
  words.some((word) => cleanType(entry.type).toLowerCase().includes(word.toLowerCase()));
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "Not recorded";

export default function PlantProfile() {
  const {
    selectedPlant,
    plants,
    getEntriesForPlant,
    getPhotosForPlant,
    addJournalEntry,
    addPhotos,
    updatePlant,
  } = useGarden();
  const [entryType, setEntryType] = useState("Watering");
  const [entryNotes, setEntryNotes] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const plant = plants.find((item) => item.id === selectedPlant?.id) || selectedPlant;
  const history = plant ? getEntriesForPlant(plant.id) : [];
  const photos = plant ? getPhotosForPlant(plant.id) : [];

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
    includesType(entry, ["water", "fertiliz", "feed", "prun", "treatment", "pest", "disease", "repot", "transplant"])
  );
  const growthHistory = sortedHistory.filter((entry) =>
    includesType(entry, ["bloom", "fruit", "harvest", "growth", "season", "weather"])
  );
  const notes = plant.profileNotes || [];
  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(noteSearch.toLowerCase())
  );
  const nextCare = (plant.health ?? 100) < 85
    ? "Inspect health concerns and record a treatment"
    : !lastWatered
      ? `Check soil moisture and follow ${plant.water || "the watering plan"}`
      : !lastFertilized
        ? `Review ${plant.fertilizer || "seasonal feeding"}`
        : "Continue routine observation and seasonal care";

  const saveJournalEntry = (event) => {
    event.preventDefault();
    if (!entryNotes.trim()) return;
    addJournalEntry({
      plantId: plant.id,
      type: entryType,
      health: plant.health ?? 100,
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
        <p>Jardin Soleil · Individual Estate Record</p>
        <h1 id="plant-profile-title">{plant.name}</h1>
        <strong>{plant.nickname || "A cherished garden resident"}</strong>
        <div className="js-profile__health" aria-label={`${plant.health ?? 100}% health`}>
          <span style={{ width: `${plant.health ?? 100}%` }} />
        </div>
      </header>

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

        <article className="js-profile__card">
          <h2>Current care</h2>
          <dl>
            <div><dt>Health status</dt><dd>{plant.health ?? 100}% · {plant.status || "No status"}</dd></div>
            <div><dt>Last watered</dt><dd>{formatDate(lastWatered?.createdAt)}</dd></div>
            <div><dt>Last fertilized</dt><dd>{formatDate(lastFertilized?.createdAt)}</dd></div>
            <div><dt>Pruning status</dt><dd>{lastPruned ? `${formatDate(lastPruned.createdAt)} · ${lastPruned.notes}` : "Not recorded"}</dd></div>
            <div><dt>Pest / disease</dt><dd>{lastPest?.notes || "No issue recorded"}</dd></div>
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
          <h2>Care history</h2>
          <div className="js-profile__chips">{careTypes.map((type) => <span key={type}>{type}</span>)}</div>
          <Timeline entries={careHistory} empty="No care events recorded yet." />
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
