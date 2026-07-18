import React, { useMemo, useState } from "react";
import EstatePage from "./EstatePage";
import { localDateKey } from "../utils/localDate";
import "./GardenChallenges.css";

const BANK = [
  {id:"soil-line",type:"true_false",title:"Root-wise watering",prompt:"Watering at the soil line is usually better than soaking the leaves.",options:["True","False"],correctAnswer:"True",explanation:"Watering near the roots reduces waste and can lower the chance of some leaf diseases.",reward:10},
  {id:"overwater",type:"multiple_choice",title:"Read the leaves",prompt:"Which sign most often suggests overwatering?",options:["Dry, brittle soil","Constantly wet soil and yellowing leaves","Flowers opening early","Stronger stems"],correctAnswer:"Constantly wet soil and yellowing leaves",explanation:"Persistently wet soil can deprive roots of oxygen, often leading to yellow leaves.",reward:10},
  {id:"scientific-name",type:"fill_blank",title:"Botanical names",prompt:"A plant’s scientific name usually contains its genus and ______.",correctAnswer:"species",explanation:"Binomial names pair a genus with a specific epithet identifying the species.",reward:10},
  {id:"leaf-look",type:"observation",title:"Look beneath",prompt:"Choose one plant and inspect the underside of two leaves.",explanation:"Leaf undersides can reveal pests and eggs before damage becomes obvious.",reward:15},
  {id:"soil-check",type:"garden_action",title:"Moisture before water",prompt:"Check the soil moisture of one plant before watering.",explanation:"Checking first helps prevent both waste and overwatering.",reward:15},
  {id:"weekly-change",type:"reflection",title:"Notice the change",prompt:"What changed most in your garden this week?",explanation:"A short reflection builds a useful seasonal record.",reward:10},
];
const load = () => { try { return JSON.parse(localStorage.getItem("jardinSoleilDailyChallenges") || "{}") || {}; } catch { return {}; } };
const save = (value) => { try { localStorage.setItem("jardinSoleilDailyChallenges", JSON.stringify(value)); } catch { /* play remains available */ } };
const hash = (text) => [...text].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 7);

export default function GardenChallenges({ onNavigate }) {
  const dateKey = localDateKey();
  const daily = useMemo(() => { const start = hash(dateKey) % BANK.length; return [BANK[start], BANK[(start + 2) % BANK.length], BANK[(start + 4) % BANK.length]].map((item) => ({...item,dateKey,status:"Not Started"})); }, [dateKey]);
  const [store, setStore] = useState(load);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState("Ready for today’s garden challenge?");
  const today = store.days?.[dateKey] || {};
  const update = (challenge, patch) => { const next = {...store,days:{...(store.days || {}),[dateKey]:{...today,[challenge.id]:{...(today[challenge.id] || {}),...patch}}}}; setStore(next); save(next); };
  const submit = (challenge) => {
    const answer = String(answers[challenge.id] || "").trim();
    const openEnded = ["observation","garden_action","reflection"].includes(challenge.type);
    if ((!openEnded && !answer) || (challenge.type === "reflection" && !String(notes[challenge.id] || "").trim())) return;
    const correct = openEnded || answer.toLocaleLowerCase() === String(challenge.correctAnswer).toLocaleLowerCase();
    const alreadyRewarded = today[challenge.id]?.rewarded;
    update(challenge,{answer:openEnded ? notes[challenge.id] || "Completed" : answer,note:notes[challenge.id] || "",correct,status:correct ? "Completed" : "In Progress",completedAt:correct ? new Date().toISOString() : null,rewarded:alreadyRewarded || correct});
    setMessage(correct ? "That’s right. Your garden instincts are growing." : "Almost. Take another look at the clue.");
  };
  const completed = daily.filter((item) => today[item.id]?.status === "Completed").length;
  const history = Object.entries(store.days || {}).filter(([key]) => key !== dateKey).sort(([a],[b]) => b.localeCompare(a)).slice(0,7);
  let streak = completed === daily.length ? 1 : 0; if (streak) { const cursor = new Date(); while (true) { cursor.setDate(cursor.getDate()-1); const key=localDateKey(cursor); const records=store.days?.[key]; if (!records || Object.values(records).filter((record) => record.status === "Completed").length < 3) break; streak += 1; } }
  return <EstatePage id="garden-challenges-title" title="Daily Challenges" eyebrow={`Jardin Soleil · ${new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}`} description="Three playable prompts rotate each local calendar day. Answers, notes, rewards, and history remain on this device." icon="apple" className="js-challenges" actions={<button className="js-estate-button" type="button" onClick={() => onNavigate?.("Learning")}>Back to Learning Center</button>}>
    <div className="js-challenges__summary"><article className="js-estate-card"><span>Today</span><strong>{completed}/3</strong><p>challenges complete</p></article><article className="js-estate-card"><span>Current streak</span><strong>{streak}</strong><p>{streak === 1 ? "day" : "days"}</p></article><article className="js-estate-card"><span>Reward preview</span><strong>{daily.reduce((sum,item)=>sum+item.reward,0)}</strong><p>estate points</p></article></div>
    <p className="js-estate-badge is-gold" role="status">Buddy · {completed === 3 ? "You finished today’s challenges." : message}</p>
    <div className="js-challenges__grid">{daily.map((challenge) => { const record=today[challenge.id] || {}; const closed=record.status === "Completed"; return <article className={`js-estate-card js-challenge-card${closed ? " is-complete" : ""}`} key={challenge.id}><span className="js-estate-badge">{challenge.type.replace("_"," ")}</span><h3>{challenge.title}</h3><p>{challenge.prompt}</p>{challenge.options && <div className="js-challenge-card__options">{challenge.options.map((option) => <label key={option}><input type="radio" name={challenge.id} value={option} checked={(answers[challenge.id] || record.answer) === option} onChange={(event) => setAnswers((current)=>({...current,[challenge.id]:event.target.value}))} />{option}</label>)}</div>}{challenge.type === "fill_blank" && <input aria-label="Fill in the blank" value={answers[challenge.id] || ""} onChange={(event)=>setAnswers((current)=>({...current,[challenge.id]:event.target.value}))} />}{["observation","garden_action","reflection"].includes(challenge.type) && <textarea rows="3" placeholder={challenge.type === "reflection" ? "Write your reflection…" : "Optional observation note…"} value={notes[challenge.id] || ""} onChange={(event)=>setNotes((current)=>({...current,[challenge.id]:event.target.value}))} />}{!closed && <button className="js-estate-button is-primary" type="button" onClick={()=>submit(challenge)}>{challenge.type === "observation" ? "Mark Observed" : challenge.type === "garden_action" ? "Log Garden Action" : challenge.type === "reflection" ? "Complete Reflection" : "Submit Answer"}</button>}{record.status && <div className={`js-challenge-card__feedback ${record.correct ? "is-correct" : "is-incorrect"}`}><strong>{record.correct ? `Completed · +${challenge.reward} points` : "Try again"}</strong><p>{challenge.explanation}</p></div>}</article>; })}</div>
    <section className="js-challenges__history"><h2>Recent challenge history</h2>{history.length ? <ul>{history.map(([key,records])=><li key={key}><strong>{new Date(`${key}T12:00:00`).toLocaleDateString()}</strong><span>{Object.values(records).filter((record)=>record.status === "Completed").length} completed</span></li>)}</ul> : <p className="js-estate-empty">Your recent challenge history will appear here.</p>}</section>
  </EstatePage>;
}
