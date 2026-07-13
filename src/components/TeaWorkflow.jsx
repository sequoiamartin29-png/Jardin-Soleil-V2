import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./TeaWorkflow.css";

export const teaWorkflowStages = ["Growing", "Ready to Harvest", "Harvested", "Drying", "Ready to Jar", "Jarred", "Ready to Blend", "Blended", "Brewed", "Enjoyed"];
const dateFields = [
  ["harvestDate", "Harvest date"], ["dryingStartDate", "Drying start"], ["dryingCompletionDate", "Drying complete"],
  ["jarredDate", "Jarred date"], ["blendCreationDate", "Blend creation"], ["brewingDate", "Brewing date"]
];
const blankForm = { plantId:"", blendId:"", gardenLocation:"", harvestDate:"", harvestQuantity:"", dryingStartDate:"", dryingCompletionDate:"", jarredDate:"", storageContainer:"", blendCreationDate:"", brewingDate:"", tastingNotes:"", flavorNotes:"", wellnessNotes:"", currentStage:"Growing", personalNotes:"", stagePhotos:{} };

const seasonFor = (date) => { if (!date) return "Unscheduled"; const month=new Date(`${date}T12:00`).getMonth()+1; return month<=2||month===12?"Winter":month<=5?"Spring":month<=8?"Summer":"Fall"; };

export default function TeaWorkflow({ blends }) {
  const { activePlants:plants, photos, addPhotos, teaWorkflows, addTeaWorkflow, updateTeaWorkflow, deleteTeaWorkflow } = useGarden();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ stage:"All", herb:"All", blend:"All", season:"All", status:"All" });
  const herbs = useMemo(() => plants.filter((plant) => /herb|tea|mint|lavender|chamomile|sage|balm|verbena/i.test([plant.category,plant.type,plant.name].join(" "))), [plants]);
  const plantById = (id) => plants.find((plant) => plant.id === id);
  const blendById = (id) => blends.find((blend) => blend.id === id);
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]:value }));

  const summaries = [
    ["Currently Growing", teaWorkflows.filter((w) => w.currentStage === "Growing").length],
    ["Ready to Harvest", teaWorkflows.filter((w) => w.currentStage === "Ready to Harvest").length],
    ["Drying", teaWorkflows.filter((w) => w.currentStage === "Drying").length],
    ["Jarred", teaWorkflows.filter((w) => w.currentStage === "Jarred").length],
    ["Ready to Blend", teaWorkflows.filter((w) => w.currentStage === "Ready to Blend").length],
    ["Completed Cups", teaWorkflows.filter((w) => w.currentStage === "Enjoyed").length],
  ];

  const visibleWorkflows = teaWorkflows.filter((workflow) => {
    const season = seasonFor(workflow.harvestDate);
    const completed = workflow.currentStage === "Enjoyed";
    return (filters.stage === "All" || workflow.currentStage === filters.stage)
      && (filters.herb === "All" || workflow.plantId === filters.herb)
      && (filters.blend === "All" || workflow.blendId === filters.blend)
      && (filters.season === "All" || season === filters.season)
      && (filters.status === "All" || (filters.status === "Completed" ? completed : !completed));
  });

  const openNew = () => { setEditingId(null); setForm(blankForm); setShowForm(true); };
  const openEdit = (workflow) => { setEditingId(workflow.id); setForm({ ...blankForm, ...workflow }); setShowForm(true); };
  const save = (event) => { event.preventDefault(); if (editingId) updateTeaWorkflow(editingId, form); else addTeaWorkflow(form); setShowForm(false); setEditingId(null); setForm(blankForm); };
  const choosePlant = (plantId) => { const plant=plantById(plantId); setForm((current) => ({ ...current, plantId, gardenLocation:plant?.location || current.gardenLocation })); };
  const remove = (workflow) => { if (window.confirm(`Delete the Garden to Cup record for ${plantById(workflow.plantId)?.name || workflow.deletedPlantName || "this ingredient"}?`)) deleteTeaWorkflow(workflow.id); };

  const attachPhotos = async (workflow, event) => {
    const files=Array.from(event.target.files||[]); if(!files.length)return;
    const added=await Promise.all(files.map((file,index)=>new Promise((resolve)=>{const reader=new FileReader();reader.onload=()=>resolve({id:`${Date.now()}-${index}`,workflowId:workflow.id,stage:workflow.currentStage,plantId:workflow.plantId,name:file.name,date:new Date().toISOString(),url:reader.result});reader.readAsDataURL(file);})));
    addPhotos(added);
    updateTeaWorkflow(workflow.id,{stagePhotos:{...(workflow.stagePhotos||{}),[workflow.currentStage]:[...((workflow.stagePhotos||{})[workflow.currentStage]||[]),...added.map((photo)=>photo.id)]}});
    event.target.value="";
  };

  return (
    <section className="js-cup" aria-labelledby="garden-to-cup-title">
      <div className="js-cup__heading"><div><p>Estate lifecycle journal</p><h2 id="garden-to-cup-title">From Garden to Cup</h2><span>Garden → Harvest → Dry → Jar → Blend → Brew → Enjoy</span></div><button type="button" onClick={openNew}>Create workflow</button></div>
      <div className="js-cup__summaries">{summaries.map(([label,count])=><article key={label}><strong>{count}</strong><span>{label}</span></article>)}</div>

      {showForm && <form className="js-cup__form" onSubmit={save}>
        <div className="js-cup__form-heading"><h3>{editingId?"Edit":"New"} Garden to Cup workflow</h3><button type="button" onClick={()=>setShowForm(false)}>Close</button></div>
        <label>Linked plant or herb<select required value={form.plantId} onChange={(e)=>choosePlant(e.target.value)}><option value="">Select an existing herb</option>{herbs.map((plant)=><option key={plant.id} value={plant.id}>{plant.name}{plant.nickname?` (${plant.nickname})`:""}</option>)}</select></label>
        <label>Linked tea blend<select value={form.blendId} onChange={(e)=>updateForm("blendId",e.target.value)}><option value="">No blend selected yet</option>{blends.map((blend)=><option key={blend.id} value={blend.id}>{blend.name}</option>)}</select></label>
        <label>Garden location<input value={form.gardenLocation} onChange={(e)=>updateForm("gardenLocation",e.target.value)} /></label>
        <label>Current stage<select value={form.currentStage} onChange={(e)=>updateForm("currentStage",e.target.value)}>{teaWorkflowStages.map((stage)=><option key={stage}>{stage}</option>)}</select></label>
        <label>Harvest quantity<input value={form.harvestQuantity} onChange={(e)=>updateForm("harvestQuantity",e.target.value)} placeholder="e.g. 4 oz fresh leaves" /></label>
        <label>Storage container<input value={form.storageContainer} onChange={(e)=>updateForm("storageContainer",e.target.value)} placeholder="e.g. amber glass jar" /></label>
        {dateFields.map(([field,label])=><label key={field}>{label}<input type="date" value={form[field]} onChange={(e)=>updateForm(field,e.target.value)} /></label>)}
        {[ ["tastingNotes","Tasting notes"],["flavorNotes","Flavor notes"],["wellnessNotes","Wellness notes"],["personalNotes","Personal notes"] ].map(([field,label])=><label className="is-wide" key={field}>{label}<textarea rows="3" value={form[field]} onChange={(e)=>updateForm(field,e.target.value)} /></label>)}
        <button className="js-cup__save" type="submit">Save workflow</button>
      </form>}

      <div className="js-cup__filters" aria-label="Filter Garden to Cup workflows">
        <label>Stage<select value={filters.stage} onChange={(e)=>setFilters({...filters,stage:e.target.value})}><option>All</option>{teaWorkflowStages.map((stage)=><option key={stage}>{stage}</option>)}</select></label>
        <label>Herb<select value={filters.herb} onChange={(e)=>setFilters({...filters,herb:e.target.value})}><option>All</option>{herbs.map((plant)=><option key={plant.id} value={plant.id}>{plant.name}</option>)}</select></label>
        <label>Blend<select value={filters.blend} onChange={(e)=>setFilters({...filters,blend:e.target.value})}><option>All</option>{blends.map((blend)=><option key={blend.id} value={blend.id}>{blend.name}</option>)}</select></label>
        <label>Season<select value={filters.season} onChange={(e)=>setFilters({...filters,season:e.target.value})}>{["All","Spring","Summer","Fall","Winter","Unscheduled"].map((season)=><option key={season}>{season}</option>)}</select></label>
        <label>Status<select value={filters.status} onChange={(e)=>setFilters({...filters,status:e.target.value})}><option>All</option><option>Active</option><option>Completed</option></select></label>
      </div>

      {visibleWorkflows.length ? <div className="js-cup__records">{visibleWorkflows.map((workflow)=>{
        const plant=plantById(workflow.plantId); const blend=blendById(workflow.blendId); const stageIndex=teaWorkflowStages.indexOf(workflow.currentStage); const workflowPhotos=photos.filter((photo)=>Object.values(workflow.stagePhotos||{}).flat().includes(photo.id));
        return <article key={workflow.id}><div className="js-cup__record-head"><BotanicalIcon plant={plant} size="lg" decorative /><div><span>{blend?.name || "Ingredient journey"}</span><h3>{plant?.name || workflow.deletedPlantName || "Unknown herb"}</h3>{workflow.plantDeleted&&<small>Historical record · plant deleted</small>}<p>{workflow.gardenLocation || "Garden location not recorded"}</p></div><select aria-label={`Update stage for ${plant?.name || workflow.deletedPlantName || "workflow"}`} value={workflow.currentStage} onChange={(e)=>updateTeaWorkflow(workflow.id,{currentStage:e.target.value})}>{teaWorkflowStages.map((stage)=><option key={stage}>{stage}</option>)}</select></div>
          <div className="js-cup__timeline" aria-label={`Current stage: ${workflow.currentStage}`}>{teaWorkflowStages.map((stage,index)=><span key={stage} className={index<=stageIndex?"is-complete":""} title={stage}>{index+1}</span>)}</div>
          <p className="js-cup__stage">{workflow.currentStage} · {seasonFor(workflow.harvestDate)}</p>
          <dl><div><dt>Harvest</dt><dd>{workflow.harvestDate||"Not recorded"}{workflow.harvestQuantity?` · ${workflow.harvestQuantity}`:""}</dd></div><div><dt>Drying</dt><dd>{workflow.dryingStartDate||"Not started"} → {workflow.dryingCompletionDate||"Pending"}</dd></div><div><dt>Storage</dt><dd>{workflow.jarredDate||"Not jarred"}{workflow.storageContainer?` · ${workflow.storageContainer}`:""}</dd></div><div><dt>Blend / brew</dt><dd>{workflow.blendCreationDate||"Not blended"} · {workflow.brewingDate||"Not brewed"}</dd></div></dl>
          {(workflow.tastingNotes||workflow.flavorNotes||workflow.wellnessNotes||workflow.personalNotes)&&<div className="js-cup__notes">{workflow.tastingNotes&&<p><strong>Tasting:</strong> {workflow.tastingNotes}</p>}{workflow.flavorNotes&&<p><strong>Flavor:</strong> {workflow.flavorNotes}</p>}{workflow.wellnessNotes&&<p><strong>Wellness:</strong> {workflow.wellnessNotes}</p>}{workflow.personalNotes&&<p><strong>Personal:</strong> {workflow.personalNotes}</p>}</div>}
          {workflowPhotos.length>0&&<div className="js-cup__photos">{workflowPhotos.map((photo)=><img key={photo.id} src={photo.url} alt={`${plant?.name||"Tea"} at ${photo.stage}`} title={photo.stage}/>)}</div>}
          <div className="js-cup__record-actions"><label>Attach photos to {workflow.currentStage}<input type="file" accept="image/*" multiple onChange={(e)=>attachPhotos(workflow,e)} /></label><button type="button" onClick={()=>openEdit(workflow)}>Edit</button><button type="button" onClick={()=>remove(workflow)}>Delete</button></div>
        </article>})}</div>:<p className="js-cup__empty">No Garden to Cup workflows match these filters. Create a workflow or adjust the filters to begin documenting an ingredient journey.</p>}
    </section>
  );
}
