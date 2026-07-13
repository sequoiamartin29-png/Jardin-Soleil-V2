import React, { useEffect, useState } from "react";
import { useGarden } from "../context/GardenContext";
import "./PlantManagement.css";

export default function PlantDeletionSnackbar(){
  const {pendingPlantDeletions,undoDeletePlant}=useGarden();
  const [,tick]=useState(0);
  useEffect(()=>{if(!pendingPlantDeletions.length)return;const timer=setInterval(()=>tick((value)=>value+1),250);return()=>clearInterval(timer);},[pendingPlantDeletions.length]);
  if(!pendingPlantDeletions.length)return null;
  return <div className="js-plant-snackbars" aria-live="assertive">{pendingPlantDeletions.map((item)=>{const seconds=Math.max(0,Math.ceil((item.deadline-Date.now())/1000));return <div className="js-plant-snackbar" key={item.plantId}><span><strong>{item.plantName}</strong> will be permanently deleted in {seconds} seconds.</span><button type="button" onClick={()=>undoDeletePlant(item.plantId)}>Undo</button></div>;})}</div>;
}
