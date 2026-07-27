import React, { useEffect, useState } from "react";
import { useGarden } from "../context/GardenContext";
import "./PlantManagement.css";

export default function PlantDeletionSnackbar(){
  const {pendingPlantDeletions,undoDeletePlant,plantLifecycleNotices,dismissPlantLifecycleNotice}=useGarden();
  const [,tick]=useState(0);
  useEffect(()=>{if(!pendingPlantDeletions.length)return;const timer=setInterval(()=>tick((value)=>value+1),250);return()=>clearInterval(timer);},[pendingPlantDeletions.length]);
  useEffect(()=>{if(!plantLifecycleNotices.length)return;const timer=setTimeout(()=>dismissPlantLifecycleNotice(plantLifecycleNotices[0].id),6000);return()=>clearTimeout(timer);},[plantLifecycleNotices,dismissPlantLifecycleNotice]);
  if(!pendingPlantDeletions.length&&!plantLifecycleNotices.length)return null;
  return <div className="js-plant-snackbars" aria-live="assertive">
    {pendingPlantDeletions.map((item)=>{const seconds=Math.max(0,Math.ceil((item.deadline-Date.now())/1000));const isTree=item.plantKind==="Tree";return <div className="js-plant-snackbar" key={item.plantId}><span><strong>{isTree?"Tree removed from your orchard.":"Plant removed from your active directory."}</strong> {item.plantName} will be permanently deleted in {seconds} seconds; related history is preserved.</span><button type="button" onClick={()=>undoDeletePlant(item.plantId)}>Undo</button></div>;})}
    {plantLifecycleNotices.map((notice)=><div className="js-plant-snackbar" key={notice.id}><span>{notice.message}</span><button type="button" onClick={()=>dismissPlantLifecycleNotice(notice.id)}>Dismiss</button></div>)}
  </div>;
}
