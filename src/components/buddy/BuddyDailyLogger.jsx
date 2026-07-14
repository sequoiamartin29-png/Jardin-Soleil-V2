import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGarden } from "../../context/GardenContext";
import EstatePage from "../EstatePage";
import { parseGardenDay } from "../../utils/parseGardenDay";
import { buddyActionLabels } from "../../utils/buildBulkCareEvents";
import BuddyActionReview from "./BuddyActionReview";
import BuddyLogHistory from "./BuddyLogHistory";
import "./BuddyDailyLogger.css";

const localDate = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
const localTime = () => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", hour12:false });
const canTargetNone = new Set(["skipped-watering", "custom-note", "planted"]);

export default function BuddyDailyLogger({ onNavigate }) {
  const garden = useGarden();
  const [text, setText] = useState("");
  const [date, setDate] = useState(localDate);
  const [time, setTime] = useState(localTime);
  const [attachments, setAttachments] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [stage, setStage] = useState("input");
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);
  const [notice, setNotice] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const activePlants = garden.activePlants;

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const parseEntry = () => {
    const next = parseGardenDay(text, { plants:activePlants, collections:garden.gardenCollections, tasks:garden.tasks, date, time });
    setProposal(next); setDate(next.date); if (next.time) setTime(next.time); setSelectedTaskIds([]); setNotice(""); setStage("review");
  };

  const updateAction = (actionId, updates) => setProposal((current) => ({ ...current, actions:current.actions.map((action) => action.id === actionId ? { ...action, ...updates } : action) }));
  const removeAction = (actionId) => setProposal((current) => ({ ...current, actions:current.actions.filter((action) => action.id !== actionId) }));
  const valid = proposal?.actions?.length > 0 && proposal.actions.every((action) => !action.needsClarification && ((action.targetIds?.length || 0) > 0 || action.recordOnly || canTargetNone.has(action.type)));
  const requiresSafety = proposal?.actions?.some((action) => action.destructive || action.sensitive);

  const commit = () => {
    const record = garden.applyBuddyGardenLog({ originalText:text, parsedActions:proposal.actions, confirmedActions:proposal.actions, date, time, photos:attachments, taskCompletionIds:selectedTaskIds });
    setSavedRecord(record); setStage("saved"); setSafetyOpen(false); setNotice("");
  };

  const save = () => {
    if (!valid) return;
    if (requiresSafety) { setSafetyOpen(true); return; }
    commit();
  };

  const photoChange = async (event) => {
    const files = Array.from(event.target.files || []);
    const prepared = await Promise.all(files.map((file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name:file.name, url:reader.result }); reader.onerror = reject; reader.readAsDataURL(file); })));
    setAttachments((current) => [...current, ...prepared]); event.target.value = "";
  };

  const startVoice = () => {
    if (!SpeechRecognition || listening) return;
    const recognition = new SpeechRecognition(); recognition.continuous = false; recognition.interimResults = false; recognition.lang = navigator.language || "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setNotice("Voice transcription stopped. Your typed text is unchanged."); };
    recognition.onresult = (event) => { const transcript = Array.from(event.results).map((result) => result[0].transcript).join(" "); setText((current) => [current, transcript].filter(Boolean).join(current ? " " : "")); };
    recognitionRef.current = recognition; recognition.start();
  };

  const undo = (recordId) => {
    if (garden.undoBuddyGardenLog(recordId)) {
      setNotice("Buddy undid the linked journal entries, photos, calendar follow-ups, and approved task completions.");
      if (savedRecord?.id === recordId) {
        setSavedRecord(null);
        setProposal(null);
        setStage("input");
      }
    }
  };
  const editRecord = (record) => {
    if (!garden.undoBuddyGardenLog(record.id)) return;
    setText(record.originalText); setDate(record.date); setTime(record.time || ""); setProposal({ date:record.date, time:record.time, originalText:record.originalText, actions:record.confirmedActions.map((action, index) => ({ ...action, id:action.id || `edit-${index}` })), unresolvedTerms:[], warnings:[] });
    setAttachments([]); setSelectedTaskIds([]); setSavedRecord(null); setNotice("The saved version was safely undone and reopened for replacement."); setStage("review"); window.scrollTo({ top:0, behavior:"smooth" });
  };

  const examples = useMemo(() => ["I watered the entire Jardin Soleil.", "I watered the orchard and fertilized the tomatoes.", "I harvested peppermint and pineapple mint.", "It rained all day, so I didn’t water."], []);

  return <EstatePage id="buddy-daily-logger-title" eyebrow="Jardin Soleil · Buddy’s Steward Ledger" title="Log My Garden Day" description="Tell Buddy what happened in ordinary language. Review the interpretation before any estate record changes." icon="tree" className="js-buddy-logger">
    {notice && <div className="js-buddy-logger__notice" role="status">{notice}</div>}
    {stage === "input" && <section className="js-buddy-logger__ledger" aria-labelledby="buddy-debrief-title">
      <div className="js-buddy-logger__seal" aria-hidden="true"><span>JS</span><b>B</b></div>
      <div className="js-buddy-logger__conversation"><p>Estate evening debrief</p><h2 id="buddy-debrief-title">What did you do in the garden?</h2><span>“I’ll organize it into care actions, plants, zones, and follow-ups. You’ll approve everything before I save it.” — Buddy</span></div>
      <label className="js-buddy-logger__statement">Garden-day statement<textarea autoFocus rows="7" value={text} onChange={(event) => setText(event.target.value)} placeholder="For example: I watered the orchard and fertilized the tomatoes." /></label>
      {SpeechRecognition && <button className={`js-estate-button${listening ? " is-primary" : ""}`} type="button" onClick={startVoice} disabled={listening}>{listening ? "Listening…" : "Use Voice Input"}</button>}
      <div className="js-buddy-logger__when"><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Optional time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><button className="js-estate-button" type="button" onClick={() => { setDate(localDate()); setTime(localTime()); }}>Use Today</button></div>
      <label className="js-buddy-logger__photos">Optional garden photographs<input type="file" accept="image/*" multiple onChange={photoChange} /></label>
      {attachments.length > 0 && <div className="js-buddy-logger__previews">{attachments.map((photo, index) => <figure key={`${photo.name}-${index}`}><img src={photo.url} alt={`Preview of ${photo.name}`} /><figcaption>{photo.name}<button type="button" aria-label={`Remove ${photo.name}`} onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></figcaption></figure>)}</div>}
      <div className="js-buddy-logger__examples"><span>Try an example:</span>{examples.map((example) => <button type="button" key={example} onClick={() => setText(example)}>{example}</button>)}</div>
      <footer><button className="js-estate-button" type="button" onClick={() => onNavigate?.("Buddy's Garden Journal")}>Cancel</button><button className="js-estate-button is-primary" type="button" disabled={!text.trim()} onClick={parseEntry}>Let Buddy Interpret</button></footer>
    </section>}

    {stage === "review" && <>
      <BuddyActionReview proposal={proposal} plants={activePlants} selectedTaskIds={selectedTaskIds} onToggleTask={(taskId) => setSelectedTaskIds((current) => current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId])} onChangeAction={updateAction} onRemoveAction={removeAction} />
      {!proposal.actions.length && <p className="js-estate-empty">Buddy did not find a supported garden action. Return to the statement and add what you did, such as watered, pruned, inspected, harvested, or skipped watering.</p>}
      {!valid && proposal.actions.length > 0 && <p className="js-buddy-logger__blocked" role="alert">Resolve Buddy’s highlighted questions or choose the exact affected plants before saving.</p>}
      <div className="js-buddy-logger__review-actions"><button className="js-estate-button" type="button" onClick={() => setStage("input")}>Edit Original Statement</button><button className="js-estate-button" type="button" onClick={() => { setProposal(null); setStage("input"); }}>Cancel</button><button className="js-estate-button is-primary" type="button" disabled={!valid} onClick={save}>Confirm and Save</button></div>
    </>}

    {safetyOpen && <div className="js-buddy-logger__safety-backdrop"><section role="alertdialog" aria-modal="true" aria-labelledby="buddy-safety-title"><p>Second confirmation required</p><h2 id="buddy-safety-title">Review sensitive estate actions</h2><ul>{proposal.actions.filter((action) => action.destructive || action.sensitive).map((action) => <li key={action.id}><strong>{buddyActionLabels[action.type]}</strong> — {action.scopeLabel}. {action.destructive ? "Buddy will preserve this as a historical statement; plant deletion or archiving must still be managed from its profile." : "The treatment will be logged and linked to any active health case without closing it."}</li>)}</ul><div><button className="js-estate-button" type="button" onClick={() => setSafetyOpen(false)}>Go Back</button><button className="js-estate-button is-primary" type="button" onClick={commit}>Yes, Save These Records</button></div></section></div>}

    {stage === "saved" && savedRecord && <section className="js-buddy-logger__saved" role="status"><span aria-hidden="true">JS</span><div><p>Buddy saved the confirmed debrief</p><h2>{savedRecord.confirmedActions.length} {savedRecord.confirmedActions.length === 1 ? "action" : "actions"} · {savedRecord.affectedPlantIds.length} linked plants</h2><blockquote>“{savedRecord.originalText}”</blockquote><small>One shared event was created per action—never one duplicate top-level log per affected plant.</small></div><div><button className="js-estate-button" type="button" onClick={() => editRecord(savedRecord)}>Edit Parsed Actions</button><button className="js-estate-button is-danger" type="button" onClick={() => undo(savedRecord.id)}>Undo</button><button className="js-estate-button is-primary" type="button" onClick={() => { setText(""); setAttachments([]); setProposal(null); setSavedRecord(null); setStage("input"); }}>Log Another Day</button><button className="js-estate-button" type="button" onClick={() => onNavigate?.("Journal Timeline")}>Open Journal Timeline</button></div></section>}

    <BuddyLogHistory records={garden.buddyGardenLogs} plants={activePlants} onUndo={undo} onEdit={editRecord} />
  </EstatePage>;
}
