import React, { useState } from "react";
import { useGarden } from "../context/GardenContext";
import BotanicalIcon from "./icons/BotanicalIcon";
import PlantDeleteDialog from "./PlantDeleteDialog";
import "./PlantManagement.css";

export default function ArchivedPlants({onBack}){
  const {plants,restorePlant,pendingPlantDeletions}=useGarden();
  const [deleting,setDeleting]=useState(null);
  const pendingIds=new Set(pendingPlantDeletions.map((item)=>item.plantId));
  const archived=plants.filter((plant)=>(plant.archived||String(plant.status).toLocaleLowerCase()==="archived")&&!pendingIds.has(plant.id));
  return <section className="js-archived-plants js-estate-page" aria-labelledby="archived-plants-title"><header><p>Preserved estate records</p><h1 id="archived-plants-title">Archived Plants</h1><span>Restore a plant to its previous placement or permanently remove only its active record.</span></header><button className="js-archived-plants__back" type="button" onClick={onBack}>Back to Plant Directory</button>
    {archived.length?<div className="js-archived-plants__grid">{archived.map((plant)=><article key={plant.id}><BotanicalIcon plant={plant} size="lg" decorative/><div><h2>{plant.name}</h2><dl><div><dt>Archived</dt><dd>{plant.archivedAt?new Date(plant.archivedAt).toLocaleDateString():"Date not recorded"}</dd></div><div><dt>Previous category</dt><dd>{plant.archiveSnapshot?.category||plant.category||"Not recorded"}</dd></div><div><dt>Previous location</dt><dd>{plant.archiveSnapshot?.location||plant.location||"Not recorded"}</dd></div></dl></div><div className="js-archived-plants__actions"><button type="button" onClick={()=>restorePlant(plant.id)}>Restore</button><button className="is-danger" type="button" onClick={()=>setDeleting(plant)}>Delete permanently</button></div></article>)}</div>:<p className="js-archived-plants__empty">No plants are archived. Plants archived from their profiles will appear here with their previous placement preserved.</p>}
    {deleting&&<PlantDeleteDialog plant={deleting} onCancel={()=>setDeleting(null)} onScheduled={()=>setDeleting(null)}/>}</section>;
}
