import React from "react";
import { useGarden } from "../context/GardenContext";

export default function GardenMap() {
  const { activePlants, gardenCollections, setSelectedPlant } = useGarden();

  return (
    <section style={{ marginTop:"40px" }}>
      <h1 style={{ color:"#5D6B46", fontSize:"46px" }}>Jardin Soleil Garden Map</h1>
      <p style={{ color:"#777", marginBottom:"30px" }}>
        A living overview of the garden zones and plants in this garden profile.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"22px" }}>
        {gardenCollections.map((zone) => {
          const zonePlants = activePlants.filter((plant) => plant.zoneId === zone.id || plant.gardenZone === zone.name);
          return <article key={zone.id} className="card" style={{ background:"#FFFDF9", borderRadius:"28px", border:"1px solid #ECE4D8" }}>
            <h2 style={{ color:"#53633F" }}>{zone.name}</h2>
            <p style={{ color:"#777" }}>{zone.description || zone.type || "Garden zone"}</p>
            <div style={{ display:"grid", gap:"10px", marginTop:"18px" }}>
              {zonePlants.length ? zonePlants.map((plant) => <button key={plant.id} type="button" onClick={() => setSelectedPlant(plant)} style={{ textAlign:"left", background:"#F8F3EC", color:"#3D4A34", border:"1px solid #ECE4D8" }}>{plant.name}</button>) : <span>No plants assigned yet.</span>}
            </div>
          </article>;
        })}
      </div>
    </section>
  );
}
