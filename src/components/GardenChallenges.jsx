import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import EstatePage from "./EstatePage";
import "./GardenChallenges.css";
import "./ChallengeMotion.css";

const loadDifficulty = () => { try { return localStorage.getItem("jardinSoleilChallengeDifficulty") || "Standard"; } catch { return "Standard"; } };
const dateOf = (entry) => new Date(entry.createdAt || entry.date || 0);
const dayKey = (date) => Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const target = (difficulty, gentle, standard, ambitious) => ({ Gentle:gentle, Standard:standard, Ambitious:ambitious })[difficulty];
const since = (days) => Date.now() - days * 86400000;

export default function GardenChallenges({ onNavigate }) {
  const { journalEntries, photos, teaWorkflows } = useGarden();
  const [difficulty, setDifficulty] = useState(loadDifficulty);
  const today = dayKey(new Date());
  const challenges = useMemo(() => {
    const entriesToday = journalEntries.filter((entry) => dayKey(dateOf(entry)) === today).length;
    const careToday = journalEntries.filter((entry) => entry.careEvent && dayKey(dateOf(entry)) === today).length;
    const careWeek = journalEntries.filter((entry) => entry.careEvent && dateOf(entry).getTime() >= since(7)).length;
    const photoWeek = photos.filter((photo) => dateOf(photo).getTime() >= since(7)).length;
    const seasonalNotes = journalEntries.filter((entry) => /bloom|harvest|seasonal|growth/i.test(`${entry.type || ""} ${entry.title || ""}`) && dateOf(entry).getTime() >= since(90)).length;
    const completedCups = teaWorkflows.filter((workflow) => workflow.currentStage === "Enjoyed").length;
    return [
      { id:"daily-journal", cadence:"Daily", title:"Record the estate", description:"Save a journal or care observation today.", value:entriesToday, goal:target(difficulty, 1, 1, 2), reward:"Dewdrop Seal" },
      { id:"daily-care", cadence:"Daily", title:"Tend with intention", description:"Complete a saved plant-care action today.", value:careToday, goal:target(difficulty, 1, 1, 2), reward:"Sage Leaf Seal" },
      { id:"weekly-care", cadence:"Weekly", title:"Carekeeper’s rhythm", description:"Build a seven-day record of completed plant care.", value:careWeek, goal:target(difficulty, 2, 4, 7), reward:"Gilded Trowel" },
      { id:"weekly-photo", cadence:"Weekly", title:"Garden memory", description:"Save photographs to the estate gallery this week.", value:photoWeek, goal:target(difficulty, 1, 3, 5), reward:"Blossom Frame" },
      { id:"season-observe", cadence:"Seasonal", title:"Seasonal witness", description:"Record bloom, growth, harvest, or seasonal observations in the last 90 days.", value:seasonalNotes, goal:target(difficulty, 2, 4, 8), reward:"Botanical Archivist" },
      { id:"season-cup", cadence:"Seasonal", title:"From Garden to Cup", description:"Complete a real Tea Apothecary workflow through Enjoyed.", value:completedCups, goal:target(difficulty, 1, 1, 3), reward:"Golden Teacup" },
    ];
  }, [journalEntries, photos, teaWorkflows, difficulty, today]);
  const activityDays = useMemo(() => new Set([...journalEntries, ...photos].map((item) => dayKey(dateOf(item))).filter(Boolean)), [journalEntries, photos]);
  let streak = 0; const cursor = new Date(); while (activityDays.has(dayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  const completed = challenges.filter((challenge) => challenge.value >= challenge.goal).length;
  const chooseDifficulty = (value) => { setDifficulty(value); localStorage.setItem("jardinSoleilChallengeDifficulty", value); };
  return (
    <EstatePage id="garden-challenges-title" title="Garden Challenges" eyebrow="Jardin Soleil · Botanical Games" description="Daily, weekly, and seasonal progress drawn only from saved estate activity." icon="apple" className="js-challenges" actions={<button className="js-estate-button" type="button" onClick={() => onNavigate?.("Learning")}>Back to Learning Center</button>}>
      <div className="js-challenges__summary"><article className="js-estate-card"><span>Current streak</span><strong>{streak}</strong><p>{streak === 1 ? "active day" : "active days"}</p></article><article className="js-estate-card"><span>Completed</span><strong>{completed}/{challenges.length}</strong><p>living challenges</p></article><article className="js-estate-card"><label>Difficulty<select value={difficulty} onChange={(event) => chooseDifficulty(event.target.value)}>{["Gentle", "Standard", "Ambitious"].map((item) => <option key={item}>{item}</option>)}</select></label><p>Targets change; saved activity never does.</p></article></div>
      {["Daily", "Weekly", "Seasonal"].map((cadence) => <section className="js-challenges__section" key={cadence} aria-labelledby={`challenge-${cadence.toLocaleLowerCase()}`}><div className="js-apothecary__section-heading"><p>Estate rhythm</p><h2 id={`challenge-${cadence.toLocaleLowerCase()}`}>{cadence} Challenges</h2></div><div className="js-challenges__grid">{challenges.filter((challenge) => challenge.cadence === cadence).map((challenge) => { const progress = Math.min(100, Math.round((challenge.value / challenge.goal) * 100)); const done = progress === 100; return <article className={`js-estate-card js-challenge-card${done ? " is-complete" : ""}`} key={challenge.id}><span className="js-estate-badge">{difficulty}</span><h3>{challenge.title}</h3><p>{challenge.description}</p><div className="js-challenge-card__progress" role="progressbar" aria-valuenow={Math.min(challenge.value, challenge.goal)} aria-valuemin="0" aria-valuemax={challenge.goal} aria-label={`${challenge.title}: ${challenge.value} of ${challenge.goal}`}><span style={{ width:`${progress}%` }} /></div><footer><strong>{Math.min(challenge.value, challenge.goal)} / {challenge.goal}</strong><span>{done ? `Earned · ${challenge.reward}` : `Reward · ${challenge.reward}`}</span></footer>{done && <i className="js-challenge-card__seal" aria-label={`${challenge.reward} earned`}>JS</i>}</article>; })}</div></section>)}
      {!journalEntries.length && !photos.length && !teaWorkflows.length && <p className="js-estate-empty">No activity has been saved yet. Add a real journal entry, care event, photo, or Garden-to-Cup workflow to begin—challenge progress is never fabricated.</p>}
    </EstatePage>
  );
}
