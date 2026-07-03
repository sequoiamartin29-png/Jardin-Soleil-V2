import React from "react";

export default function PlantProfile({

  plant = {
    name: "Mr. Pear",
    variety: "4-in-1 Pear",
    location: "Left Orchard",
    health: 98,
    sun: "Full Sun",
    moisture: "Moist",
    fertilizer: "Garden-Tone",
    height: "7 ft",
    bloom: "Spring",
    harvest: "Late Summer"
  }

}) {

return (

<div
style={{
background:"#FFFDF9",
borderRadius:"30px",
padding:"35px",
marginTop:"40px",
boxShadow:"0 12px 30px rgba(0,0,0,.08)"
}}
>

<h1 style={{margin:0,color:"#5D6B46"}}>
🌳 {plant.name}
</h1>

<p style={{
fontSize:"20px",
color:"#777"
}}>
{plant.variety}
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"18px",
marginTop:"35px"
}}
>
  <div className="card">
  <h3>❤️ Health Score</h3>
  <h1 style={{ margin: 0, color: "#5D6B46" }}>
    {plant.health}%
  </h1>
</div>

<div className="card">
  <h3>📍 Location</h3>
  <p>{plant.location}</p>
</div>

<div className="card">
  <h3>☀️ Sun</h3>
  <p>{plant.sun}</p>
</div>

<div className="card">
  <h3>💧 Moisture</h3>
  <p>{plant.moisture}</p>
</div>

<div className="card">
  <h3>🌱 Fertilizer</h3>
  <p>{plant.fertilizer}</p>
</div>

<div className="card">
  <h3>📏 Height</h3>
  <p>{plant.height}</p>
</div>
  <div className="card">
  <h3>❤️ Health Score</h3>
  <h1 style={{ margin: 0, color: "#5D6B46" }}>
    {plant.health}%
  </h1>
</div>

<div className="card">
  <h3>📍 Location</h3>
  <p>{plant.location}</p>
</div>

<div className="card">
  <h3>☀️ Sun</h3>
  <p>{plant.sun}</p>
</div>

<div className="card">
  <h3>💧 Moisture</h3>
  <p>{plant.moisture}</p>
</div>

<div className="card">
  <h3>🌱 Fertilizer</h3>
  <p>{plant.fertilizer}</p>
</div>

<div className="card">
  <h3>📏 Height</h3>
  <p>{plant.height}</p>
</div>
  <div
  style={{
    marginTop: "35px",
    paddingTop: "25px",
    borderTop: "1px solid #ECE4D8"
  }}
>
  <h2 style={{ color: "#5D6B46" }}>
    📝 Garden Journal
  </h2>

  <p style={{ color: "#666", lineHeight: "1.8" }}>
    Record pruning, fertilizing, blooms, fruit set, pest sightings,
    disease treatments, weather events, and personal observations for
    this plant. This timeline will become the complete history of each
    specimen in Jardin Soleil.
  </p>

  <button
    style={{
      marginTop: "20px",
      padding: "14px 26px",
      borderRadius: "16px",
      border: "none",
      background: "#B8C8A0",
      color: "#fff",
      fontWeight: "bold",
      cursor: "pointer"
    }}
  >
    ➕ Add Journal Entry
  </button>
</div>

</div>

);

}
