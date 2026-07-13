import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import "./PlantManagement.css";

export default function PlantDeleteDialog({plant,onCancel,onScheduled}){
  const {journalEntries,scheduleDeletePlant}=useGarden();
  const [confirmation,setConfirmation]=useState("");
  const activeTasks=useMemo(()=>{const today=new Date();today.setHours(0,0,0,0);return journalEntries.filter((entry)=>entry.plantId===plant.id&&entry.careEvent&&entry.nextDueDate&&new Date(`${entry.nextDueDate}T12:00:00`)>=today);},[journalEntries,plant.id]);
  const confirm=()=>{scheduleDeletePlant(plant.id);onScheduled?.();};
  return <div className="js-plant-dialog-backdrop"><section className="js-plant-delete" role="alertdialog" aria-modal="true" aria-labelledby="delete-plant-title">
    <p>Permanent estate record removal</p><h2 id="delete-plant-title">Delete {plant.name}?</h2>
    <p>The active plant record will be permanently removed after a 10-second Undo period. Journal entries, care and harvest history, photos, and Garden-to-Cup records will be preserved and marked as belonging to a deleted plant.</p>
    {activeTasks.length>0&&<div className="js-plant-management__warning"><strong>{activeTasks.length} active care {activeTasks.length===1?"task":"tasks"} linked to {plant.name}</strong><p>Continuing preserves them as unlinked historical care records. Cancel to keep the active plant and its tasks unchanged.</p></div>}
    <label>Type <strong>DELETE</strong> to continue<input autoFocus value={confirmation} onChange={(event)=>setConfirmation(event.target.value)} /></label>
    <div className="js-plant-management__actions"><button type="button" onClick={onCancel}>Cancel</button><button className="is-danger" type="button" disabled={confirmation!=="DELETE"} onClick={confirm}>Delete and preserve history</button></div>
  </section></div>;
}
