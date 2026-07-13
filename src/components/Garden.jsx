import React, { useMemo } from "react";
import { useGarden } from "../context/GardenContext";
import { getPlantDirectoryGroup } from "../utils/plantClassification";
import { gardenZones } from "../data/jardinData";

const zoneSubtitle = {
  "vegetable-garden":"Seasonal edible crops", "herb-tea-garden":"Kitchen · Apothecary · Tea",
  "berry-vine-zone":"Edible fruits and climbing crops", "flower-perennial-garden":"Color and pollinator plantings",
  "melon-patch":"Warm-season melons"
};

export default function Garden({onAddPlant}) {
  const { activePlants:plants, stats } = useGarden();
  const sections = useMemo(() => gardenZones.map((zone) => ({
    ...zone,
    title:zone.name,
    subtitle:zoneSubtitle[zone.id],
    plants: plants.filter((plant) => zone.matchType
      ? `${plant.type||""} ${plant.name||""}`.toLowerCase().includes(zone.matchType)
      : getPlantDirectoryGroup(plant) === zone.directoryGroup && !(zone.directoryGroup === "Vegetables" && /melon/i.test(`${plant.type||""} ${plant.name||""}`)))
      .sort((a,b)=>(a.name||"").localeCompare(b.name||"",undefined,{sensitivity:"base"}))
  })),[plants]);

  return <section style={{marginTop:"50px"}}>
    <h1 style={{color:"#5D6B46",fontFamily:"Baskerville,Georgia,serif",fontSize:"42px"}}>Garden Collections</h1>
    <p style={{color:"#777",fontSize:"18px",marginBottom:"18px"}}>Canonical Jardin Soleil plants organized into their real garden rooms.</p>
    <button type="button" onClick={onAddPlant} style={{background:"#61764F",border:"1px solid #4D603E",borderRadius:"16px",color:"white",cursor:"pointer",fontWeight:800,margin:"0 0 20px",padding:"13px 20px"}}>Add New Plant</button>
    <p aria-live="polite" style={{background:"#f7f0e5",border:"1px solid #e2d3b9",borderRadius:"16px",color:"#5d654f",padding:"14px 18px",marginBottom:"28px"}}>
      <strong>{stats.edibleHerbCount}</strong> edibles & herbs · <strong>{stats.gardenZoneCount}</strong> garden zones
    </p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:"25px"}}>
      {sections.map((section)=><article key={section.group} style={{background:"#FFFDF9",borderRadius:"28px",overflow:"hidden",border:"1px solid #EFE5D8",boxShadow:"0 12px 28px rgba(0,0,0,.08)"}}>
        <div style={{background:"linear-gradient(135deg,#F8E8EE,#EEF5E7)",padding:"28px"}}><h2 style={{margin:0,color:"#55653F",fontFamily:"Baskerville,Georgia,serif",fontSize:"28px"}}>{section.title}</h2><p style={{marginTop:"10px",color:"#6D6D6D"}}>{section.subtitle}</p></div>
        <div style={{padding:"24px"}}><div style={{display:"flex",flexWrap:"wrap",gap:"10px",marginBottom:"24px"}}>{section.plants.length?section.plants.map((plant)=><span key={plant.id} style={{background:"#F4EFE7",padding:"8px 14px",borderRadius:"999px",fontSize:"14px",color:"#5A5A5A"}}>{plant.name}</span>):<p style={{color:"#7d7466",fontStyle:"italic"}}>No canonical plant records are assigned to this zone yet.</p>}</div>
          <div style={{marginTop:"24px",paddingTop:"18px",borderTop:"1px solid #ECE4D8",display:"flex",justifyContent:"space-between",fontSize:"14px",color:"#777"}}><span>{section.plants.length} {section.plants.length===1?"plant":"plants"}</span><span>{section.title}</span></div>
        </div>
      </article>)}
    </div>
    <section aria-labelledby="garden-areas-title" style={{marginTop:"30px",background:"#fffaf1",border:"1px solid #e0cfad",borderRadius:"22px",padding:"24px"}}><h2 id="garden-areas-title" style={{color:"#536441",fontFamily:"Georgia,serif"}}>Garden Zones</h2><div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>{stats.gardenZones.map((zone)=><span key={zone.id} style={{background:"#eef2e6",borderRadius:"999px",padding:"8px 13px"}}>{zone.name}</span>)}</div></section>
  </section>;
}
