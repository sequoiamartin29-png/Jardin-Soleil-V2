import React from "react";
import { useGarden } from "../context/GardenContext";
import EstatePage from "./EstatePage";

export default function JournalTimeline({ entries = [] }) {
  const { plants } = useGarden();
  const getPlantName = (entry) => plants.find((plant) => plant.id === entry.plantId)?.name || entry.deletedPlantName || "Jardin Soleil";
  const ordered = [...entries].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
  return <EstatePage id="journal-timeline-title" title="Journal Timeline" description="Every saved garden entry in a distinct, newest-first estate archive." icon="herb">
    {ordered.length ? <div className="js-estate-grid">{ordered.map((entry) => <article key={entry.id} className="js-estate-card"><span className="js-estate-kicker">{entry.type || "Garden note"}</span><h2 style={{color:"#52623f",fontFamily:"Georgia,serif"}}>{getPlantName(entry)}{entry.plantDeleted ? " · Historical record" : ""}</h2><p><strong>Date:</strong> {new Date(entry.createdAt || entry.date).toLocaleString()}</p>{entry.health !== undefined && entry.health !== "" && <p><strong>Health:</strong> {entry.health}%</p>}<p>{entry.notes || "No notes added."}</p></article>)}</div> : <p className="js-estate-empty">No journal entries yet. Watering, harvest, pest, photo, care, and observation records will appear here after they are saved.</p>}
  </EstatePage>;
}
