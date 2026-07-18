import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import EstatePage from "./EstatePage";
import "./JournalHub.css";

export default function JournalHub({ onNavigate, initialView = "recent" }) {
  const { journalEntries, plants, updateJournalEntry, deleteJournalEntry } = useGarden();
  const [view, setView] = useState(initialView);
  const [query, setQuery] = useState(() => { try { return localStorage.getItem("jardinSoleilJournalSearch") || ""; } catch { return ""; } });
  const [type, setType] = useState("All");
  const [deleting, setDeleting] = useState(null);
  const plantName = (entry) => plants.find((plant) => plant.id === entry.plantId)?.nickname || plants.find((plant) => plant.id === entry.plantId)?.name || entry.deletedPlantName || "Jardin Soleil";
  const types = useMemo(() => ["All", ...new Set(journalEntries.map((entry) => entry.type || "Note"))], [journalEntries]);
  const entries = useMemo(() => [...journalEntries].filter((entry) => {
    const text = `${entry.title || ""} ${entry.type || ""} ${entry.notes || ""} ${entry.observations || ""} ${entry.gardenZone || ""} ${plantName(entry)}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (type === "All" || entry.type === type) && (view !== "favorites" || entry.favorite);
  }).sort((a,b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)), [journalEntries, plants, query, type, view]);
  const selectView = (next) => { setView(next); try { localStorage.setItem("jardinSoleilJournalView", next); } catch { /* view remains usable */ } };
  const search = (next) => { setQuery(next); try { localStorage.setItem("jardinSoleilJournalSearch", next); } catch { /* search remains usable */ } };
  return <EstatePage id="journal-hub-title" title="Journal" description="The living estate record for observations, work, harvests, weather, photographs, and garden memories." icon="herb" theme="journal">
    <div className="js-journal-hub__actions"><button className="js-estate-button is-primary" type="button" onClick={() => onNavigate?.("New Journal Entry")}>New Entry</button><button className="js-estate-button" type="button" onClick={() => onNavigate?.("Buddy Garden Day")}>Log Today</button></div>
    <nav className="js-journal-hub__views" aria-label="Journal views">{[["recent","Recent Entries"],["timeline","Timeline"],["logs","Daily Logs"],["favorites","Highlights"]].map(([key,label]) => <button className={`js-estate-button${view === key ? " is-primary" : ""}`} aria-pressed={view === key} type="button" key={key} onClick={() => selectView(key)}>{label}</button>)}</nav>
    <div className="js-estate-toolbar js-journal-hub__filters"><label>Search<input type="search" value={query} onChange={(event) => search(event.target.value)} placeholder="Plants, notes, zones…" /></label><label>Entry type<select value={type} onChange={(event) => setType(event.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {entries.length ? <div className={view === "timeline" ? "js-journal-hub__timeline" : "js-estate-grid"}>{entries.map((entry) => <article className="js-estate-card" key={entry.id}><span className="js-estate-kicker">{entry.type || "Garden note"}</span><h2>{entry.title || plantName(entry)}</h2><p><strong>{plantName(entry)}</strong>{entry.gardenZone ? ` · ${entry.gardenZone}` : ""}</p><p>{entry.notes || entry.observations || "No notes added."}</p><time>{new Date(entry.createdAt || entry.date).toLocaleString()}</time><div className="js-journal-hub__entry-actions"><button className="js-estate-button" type="button" onClick={() => updateJournalEntry(entry.id, { favorite:!entry.favorite })}>{entry.favorite ? "★ Favorite" : "☆ Favorite"}</button><button className="js-estate-button" type="button" onClick={() => { const notes = window.prompt("Edit journal notes", entry.notes || ""); if (notes !== null) updateJournalEntry(entry.id, { notes, observations:notes }); }}>Edit</button><button className="js-estate-button is-danger" type="button" onClick={() => setDeleting(entry.id)}>Delete</button></div>{deleting === entry.id && <div className="js-estate-confirm" role="alert"><strong>Delete this journal entry?</strong><div className="js-estate-confirm__actions"><button className="js-estate-button" type="button" onClick={() => setDeleting(null)}>Cancel</button><button className="js-estate-button is-danger" type="button" onClick={() => { deleteJournalEntry(entry.id); setDeleting(null); }}>Delete Entry</button></div></div>}</article>)}</div> : <p className="js-estate-empty">No journal entries yet. Begin with today’s garden notes.</p>}
  </EstatePage>;
}
