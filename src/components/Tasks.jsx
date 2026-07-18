import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import EstatePage from "./EstatePage";
import PlantSelectorWithCreate from "./PlantSelectorWithCreate";
import "./Tasks.css";
import { localDateKey } from "../utils/localDate";

const todayKey = () => localDateKey();
const blank = { title:"", dueDate:"", plantId:"", notes:"", recurrence:"one-time" };

export default function Tasks({ onNavigate }) {
  const { tasks, addTask, updateTask, deleteTask, refreshDailyTasks, journalEntries, activePlants } = useGarden();
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState("Active");
  const [refreshMessage, setRefreshMessage] = useState("");
  const careDue = useMemo(() => journalEntries.filter((entry) => entry.careEvent && entry.nextDueDate).map((entry) => ({
    id:`care-${entry.id}`, title:`${entry.type || "Care"} · ${activePlants.find((plant) => plant.id === entry.plantId)?.name || entry.deletedPlantName || "Garden plant"}`,
    dueDate:entry.nextDueDate, completed:false, source:"Plant care", readOnly:true,
  })), [journalEntries, activePlants]);
  const allTasks = useMemo(() => [...tasks, ...careDue].sort((a, b) => (a.completed - b.completed) || (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, careDue]);
  const visible = allTasks.filter((task) => filter === "All" || (filter === "Completed" ? task.completed : !task.completed));
  const save = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    addTask({ ...form, title:form.title.trim(), notes:form.notes.trim(), source:"Estate task", isTemplate:form.recurrence !== "one-time", kind:form.recurrence !== "one-time" ? "template" : "occurrence" });
    setForm(blank); setShowForm(false);
  };
  return (
    <EstatePage id="tasks-title" title="Estate Tasks" description="Planning, plant-care due dates, and completed work in one living ledger." icon="vegetable" actions={<><button className="js-estate-button" type="button" onClick={() => { const result=refreshDailyTasks(); setRefreshMessage(result.added ? `${result.added} new tasks are ready.` : "Estate tasks are up to date. No new tasks are due."); }}>Refresh Tasks</button><button className="js-estate-button is-primary" type="button" onClick={() => setShowForm(true)}>Add Task</button></>}>
      {refreshMessage && <p className="js-estate-badge is-gold" role="status">{refreshMessage}</p>}
      <div className="js-estate-toolbar"><div className="js-task-filters" role="group" aria-label="Filter tasks">{["Active", "Completed", "All"].map((item) => <button key={item} className={`js-estate-button${filter === item ? " is-primary" : ""}`} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="js-estate-badge is-gold">{allTasks.filter((task) => !task.completed).length} active</span></div>
      {showForm && <form className="js-estate-panel js-estate-form js-task-form" onSubmit={save}><label className="is-wide">Task<input autoFocus value={form.title} onChange={(event) => setForm((current) => ({ ...current, title:event.target.value }))} required /></label><label>Due date<input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate:event.target.value }))} /></label><label>Repeats<select value={form.recurrence} onChange={(event)=>setForm((current)=>({...current,recurrence:event.target.value}))}>{["one-time","daily","weekdays","weekly","selected-days","monthly","seasonal"].map((value)=><option key={value} value={value}>{value.replace("-"," ")}</option>)}</select></label><PlantSelectorWithCreate label="Plant" value={form.plantId} onChange={(plantId) => setForm((current) => ({ ...current, plantId }))} emptyLabel="Whole estate" description="Optional plant reference" /><label className="is-wide">Notes<textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes:event.target.value }))} /></label><div className="js-task-form__actions"><button className="js-estate-button" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="js-estate-button is-primary" type="submit">Save Task</button></div></form>}
      {visible.filter((task)=>!task.isTemplate).length ? <div className="js-task-list">{visible.filter((task)=>!task.isTemplate).map((task) => {
        const overdue = !task.completed && task.dueDate && task.dueDate < todayKey();
        return <article className={`js-estate-card${overdue ? " is-overdue" : ""}`} key={task.id}><label><input type="checkbox" checked={task.completed} disabled={task.readOnly} onChange={(event) => updateTask(task.id, { completed:event.target.checked, completedAt:event.target.checked ? new Date().toISOString() : null })} /><span><strong>{task.title}</strong><small>{task.dueDate ? `${overdue ? "Overdue · " : "Due · "}${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString()}` : "No due date"} · {task.source || "Estate task"}</small></span></label>{task.notes && <p>{task.notes}</p>}{task.readOnly ? <button type="button" className="js-estate-button" onClick={() => onNavigate?.("Journal Timeline")}>Open care history</button> : <button type="button" className="js-estate-button is-danger" onClick={() => setDeleting(task)}>Delete</button>}{deleting?.id === task.id && <div className="js-estate-confirm" role="alert"><strong>Delete this task?</strong><div className="js-estate-confirm__actions"><button className="js-estate-button" type="button" onClick={() => setDeleting(null)}>Cancel</button><button className="js-estate-button is-danger" type="button" onClick={() => { deleteTask(task.id); setDeleting(null); }}>Delete Task</button></div></div>}</article>;
      })}</div> : <p className="js-estate-empty">No {filter.toLocaleLowerCase()} tasks. New estate tasks and scheduled plant care will appear here.</p>}
    </EstatePage>
  );
}
