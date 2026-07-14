import React, { useMemo } from "react";
import { useGarden } from "../../context/GardenContext";
import { buildBuddyJournal } from "../../utils/buddyUpdates";
import "./BuddyJournal.css";

const sections = [
  ["Estate Update", "estateUpdate"],
  ["Today’s Highlights", "highlights"],
  ["Recommended Tasks", "tasks"],
  ["Seasonal Notes", "seasonalNotes"],
  ["Buddy Tips", "tips"],
];

export default function BuddyJournal({ onBack, onOpenConservatory, onOpenHealthCenter }) {
  const garden = useGarden();
  const journal = useMemo(
    () => buildBuddyJournal({ ...garden, plants:garden.activePlants }),
    [garden.activePlants, garden.journalEntries, garden.photos, garden.inventoryItems, garden.plantDiagnoses]
  );

  return <section className="js-buddy-journal" aria-labelledby="buddy-journal-title">
    <header className="js-buddy-journal__hero">
      <div className="js-buddy-journal__actions"><button type="button" onClick={onOpenConservatory}>Talk with Buddy</button><button type="button" onClick={() => onOpenHealthCenter?.()}>Plant Health Center</button><button type="button" onClick={onBack}>Back to Dashboard</button></div>
      <div><p>Jardin Soleil · Estate Companion</p><h1 id="buddy-journal-title">Buddy’s Garden Journal</h1><span>Real observations gathered from the estate’s saved garden records.</span></div>
      <span className="js-buddy-journal__seal" aria-hidden="true">JS</span>
    </header>
    <div className="js-buddy-journal__grid">
      {journal.healthAlerts.length > 0 && <article className="js-buddy-journal__health"><p>Saved plant-health records</p><h2>Plant Health Watch</h2><div>{journal.healthAlerts.map((alert) => <button type="button" key={alert.diagnosisId} onClick={() => onOpenHealthCenter?.(alert.diagnosisId)}>{alert.text}</button>)}</div></article>}
      {sections.map(([title, key]) => <article key={key}>
        <p>{key === "seasonalNotes" ? journal.month : "Buddy’s report"}</p><h2>{title}</h2>
        {journal[key].length ? <ul>{journal[key].map((item, index) => <li key={`${key}-${index}`}>{item}</li>)}</ul> : <div className="js-buddy-journal__empty">Nothing from the saved garden records needs reporting here today.</div>}
      </article>)}
    </div>
  </section>;
}
