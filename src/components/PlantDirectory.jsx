import React from "react";
import { plants } from "../data/plants";

export default function PlantDirectory({ onSelectPlant }) {

return (

<section
style={{
marginTop:"50px"
}}
>

<h2
style={{
fontSize:"42px",
color:"#5D6B46"
}}
>
🌿 Plant Directory
</h2>

<p
style={{
color:"#777",
fontSize:"18px",
marginBottom:"30px"
}}
>
Browse every plant currently growing in Jardin Soleil.
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
gap:"24px"
}}
>

{plants.map((plant)=>(

<div
key={plant.id}
style={{
background:"#FFFDF9",
borderRadius:"24px",
padding:"24px",
border:"1px solid #EFE5D8",
boxShadow:"0 10px 25px rgba(0,0,0,.08)"
}}
>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start"
  }}
>
  <div>
    <h3
      style={{
        margin: "0 0 8px",
        color: "#53633F",
        fontSize: "25px"
      }}
    >
      {plant.name}
    </h3>

    <p style={{ margin: 0, color: "#777" }}>
      {plant.type}
    </p>
  </div>

  <span
    style={{
      background: "#B8C8A0",
      color: "white",
      padding: "7px 12px",
      borderRadius: "999px",
      fontSize: "13px",
      whiteSpace: "nowrap"
    }}
  >
    {plant.status}
  </span>
</div>

<div
  style={{
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "12px"
  }}
>
  <div className="card">
    <strong>❤️ Health</strong>
    <p>{plant.health}%</p>
  </div>

  <div className="card">
    <strong>📍 Location</strong>
    <p>{plant.location}</p>
  </div>
</div>
  <div
  style={{
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "10px"
  }}
>
  <button onClick={() => onSelectPlant(plant)}>
    🌿 Open Profile
  </button>

  <button>
    📸 Gallery
  </button>
</div>

<div
  style={{
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #ECE4D8",
    display: "flex",
    justifyContent: "space-between",
    color: "#777",
    fontSize: "14px"
  }}
>
  <span>☀️ {plant.sun}</span>
  <span>💧 {plant.water}</span>
</div>
  </div>

))}

</div>

</section>

);

}
