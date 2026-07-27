import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import { isOrchardFruitTree } from "../utils/plantClassification";
import "./PlantManagement.css";

export default function PlantDeleteDialog({plant,onCancel,onScheduled,onArchived}){
  const {journalEntries,tasks,plantDiagnoses,archivePlant,scheduleDeletePlant}=useGarden();
  const [confirmation,setConfirmation]=useState("");
  const [error,setError]=useState("");
  const isTree=isOrchardFruitTree(plant);
  const recordLabel=isTree?"Tree":"Plant";
  const isArchived=Boolean(plant.archived||String(plant.status).toLocaleLowerCase()==="archived");
  const activeCareTasks=useMemo(()=>{
    const today=new Date();today.setHours(0,0,0,0);
    return journalEntries.filter((entry)=>entry.plantId===plant.id&&entry.careEvent&&entry.nextDueDate&&new Date(`${entry.nextDueDate}T12:00:00`)>=today);
  },[journalEntries,plant.id]);
  const openTasks=useMemo(()=>tasks.filter((task)=>task.plantId===plant.id&&!task.completed&&!task.archived),[tasks,plant.id]);
  const openCases=useMemo(()=>plantDiagnoses.filter((diagnosis)=>diagnosis.plantId===plant.id&&!["Resolved","Archived"].includes(diagnosis.status)),[plantDiagnoses,plant.id]);
  const archive=()=>{
    setError("");
    if(!archivePlant(plant.id)){
      setError(`We couldn’t remove this ${recordLabel.toLocaleLowerCase()}. Your record is unchanged.`);
      return;
    }
    onArchived?.(plant);
  };
  const confirm=()=>{
    setError("");
    if(!scheduleDeletePlant(plant.id)){
      setError(`We couldn’t remove this ${recordLabel.toLocaleLowerCase()}. Your record is unchanged.`);
      return;
    }
    onScheduled?.(plant);
  };
  return <div className="js-plant-dialog-backdrop"><section className="js-plant-delete" role="alertdialog" aria-modal="true" aria-labelledby="delete-plant-title">
    <p>{recordLabel} lifecycle</p><h2 id="delete-plant-title">Remove “{plant.name}”?</h2>
    <p>{isTree?"This removes the tree from your active orchard and plant directory.":"This removes the plant from your active directory."} Related logs, harvests, photos, and journal history will be preserved with the former {recordLabel.toLocaleLowerCase()} name.</p>
    {!isArchived&&<div className="js-plant-management__archive-choice"><strong>Archive is the safer choice</strong><p>Archive hides this {recordLabel.toLocaleLowerCase()} from active views, preserves every linked record, and allows restoration later.</p><button type="button" onClick={archive}>Archive {recordLabel}</button></div>}
    {(activeCareTasks.length>0||openTasks.length>0||openCases.length>0)&&<div className="js-plant-management__warning"><strong>Linked work will not be silently deleted</strong><p>{activeCareTasks.length+openTasks.length} open care {activeCareTasks.length+openTasks.length===1?"task":"tasks"} and {openCases.length} open health {openCases.length===1?"case":"cases"} will be archived or retained as historical records.</p></div>}
    <label>Type <strong>{plant.name}</strong> to delete permanently<input autoFocus={isArchived} value={confirmation} onChange={(event)=>setConfirmation(event.target.value)} /></label>
    {error&&<p className="js-plant-management__error" role="alert">{error}</p>}
    <div className="js-plant-management__actions"><button type="button" onClick={onCancel}>Cancel</button><button className="is-danger" type="button" disabled={confirmation.trim()!==plant.name} onClick={confirm}>Delete Permanently</button></div>
  </section></div>;
}
