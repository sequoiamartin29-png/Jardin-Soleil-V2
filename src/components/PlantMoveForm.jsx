import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import { gardenZoneOptions, plantCategories, plantCollections, plantGroups, plantStatuses, suggestPlantGroup, validatePlantMove } from "../utils/plantMutations";
import "./PlantManagement.css";

const initialFor=(plant)=>({
  collection:plant.collection||plant.category||"Other / Uncategorized",
  category:plant.category||"Other / Uncategorized",
  group:plant.group||suggestPlantGroup(plant),
  type:plant.type||"",
  variety:plant.variety||"",
  botanicalFamily:plant.botanicalFamily||"",
  gardenZone:plant.gardenZone||"",
  location:plant.location||"",
  status:plant.archived?"Archived":plant.status||"Active",
});

export default function PlantMoveForm({plant,onCancel,onSaved}){
  const {plants,updatePlant,archivePlant}=useGarden();
  const [form,setForm]=useState(()=>initialFor(plant));
  const [errors,setErrors]=useState({});
  const [acknowledgedDuplicate,setAcknowledgedDuplicate]=useState(false);
  const suggestion=useMemo(()=>suggestPlantGroup(form),[form.type,form.category]);
  const change=(field,value)=>{setForm((current)=>({...current,[field]:value}));setErrors((current)=>({...current,[field]:undefined}));setAcknowledgedDuplicate(false);};
  const save=(event)=>{event.preventDefault();const result=validatePlantMove(form,plant,plants);setErrors(result.errors);if(!result.valid||result.duplicates.length&&!acknowledgedDuplicate)return;const removing=["Archived","Removed"].includes(result.updates.status);updatePlant(plant.id,removing?{...result.updates,status:plant.status||"Active"}:result.updates);if(removing)archivePlant(plant.id,result.updates.status);onSaved?.({...plant,...result.updates,archived:removing||plant.archived});};
  const duplicateResult=validatePlantMove(form,plant,plants);
  return <section className="js-plant-management" aria-labelledby="move-plant-title">
    <header><p>Estate placement</p><h1 id="move-plant-title">Move / Reclassify {plant.name}</h1><span>The stable plant record and all linked history will remain unchanged.</span></header>
    <form onSubmit={save} noValidate>
      <label>Collection<select value={form.collection} onChange={(event)=>change("collection",event.target.value)}>{plantCollections.map((item)=><option key={item}>{item}</option>)}</select></label>
      <label>Garden zone<select value={form.gardenZone} onChange={(event)=>change("gardenZone",event.target.value)}><option value="">Not recorded</option>{gardenZoneOptions.map((item)=><option key={item}>{item}</option>)}</select></label>
      <label>Category<select value={form.category} onChange={(event)=>change("category",event.target.value)}>{plantCategories.map((item)=><option key={item}>{item}</option>)}</select>{errors.category&&<small role="alert">{errors.category}</small>}</label>
      <label>Plant type<input value={form.type} onChange={(event)=>change("type",event.target.value)}/>{errors.type&&<small role="alert">{errors.type}</small>}</label>
      <label>Plant group<select value={form.group} onChange={(event)=>change("group",event.target.value)}>{plantGroups.map((item)=><option key={item}>{item}</option>)}</select><small>Suggested from canonical metadata: {suggestion}. Manual override is allowed.</small></label>
      <label>Variety or cultivar<input value={form.variety} onChange={(event)=>change("variety",event.target.value)}/></label>
      <label>Botanical family<input value={form.botanicalFamily} onChange={(event)=>change("botanicalFamily",event.target.value)}/></label>
      <label>Specific location<input value={form.location} onChange={(event)=>change("location",event.target.value)}/></label>
      <label>Status<select value={form.status} onChange={(event)=>change("status",event.target.value)}>{plantStatuses.map((item)=><option key={item}>{item}</option>)}</select></label>
      {duplicateResult.duplicates.length>0&&!acknowledgedDuplicate&&<aside className="js-plant-management__warning" role="alert"><strong>Possible duplicate record</strong><p>{duplicateResult.duplicates.map((item)=>item.name).join(", ")} shares identity metadata. Reclassification never creates another record.</p><button type="button" onClick={()=>setAcknowledgedDuplicate(true)}>Continue with this existing record</button></aside>}
      <div className="js-plant-management__actions"><button type="button" onClick={onCancel}>Cancel</button><button type="submit">Save placement</button></div>
    </form>
  </section>;
}
