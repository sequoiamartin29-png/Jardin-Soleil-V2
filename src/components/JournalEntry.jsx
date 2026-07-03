import React, { useState } from "react";
import { plants } from "../data/plants";

const entryTypes = [
  "💧 Watering",
  "🌱 Fertilizer",
  "✂️ Pruning",
  "🌸 Bloom",
  "🍎 Harvest",
  "🐛 Pest",
  "🦠 Disease",
  "🌦 Weather",
  "📷 Photo",
  "📝 Note"
];

export default function JournalEntry() {

const [selectedPlant,setSelectedPlant]=useState(plants[0]?.id || "");

const [entryType,setEntryType]=useState(entryTypes[0]);

const [health,setHealth]=useState(100);

const [notes,setNotes]=useState("");

return(

<section
style={{
marginTop:"40px",
background:"#FFFDF9",
borderRadius:"30px",
padding:"35px",
boxShadow:"0 12px 30px rgba(0,0,0,.08)"
}}
>

<h2
style={{
marginTop:0,
color:"#5D6B46",
fontSize:"40px"
}}
>
📝 New Garden Journal Entry
</h2>

<p
style={{
color:"#777",
marginBottom:"30px"
}}
>
Record everything that happens in Jardin Soleil.
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
gap:"24px"
}}
>
  <div>
  <label>
    <strong>🌿 Select Plant</strong>
  </label>

  <select
    value={selectedPlant}
    onChange={(event) => setSelectedPlant(event.target.value)}
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: "14px",
      border: "1px solid #D8D0C4",
      marginTop: "10px"
    }}
  >
    {plants.map((plant) => (
      <option key={plant.id} value={plant.id}>
        {plant.name} — {plant.type}
      </option>
    ))}
  </select>
</div>

<div>
  <label>
    <strong>📌 Entry Type</strong>
  </label>

  <select
    value={entryType}
    onChange={(event) => setEntryType(event.target.value)}
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: "14px",
      border: "1px solid #D8D0C4",
      marginTop: "10px"
    }}
  >
    {entryTypes.map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </select>
</div>

<div>
  <label>
    <strong>❤️ Health Rating</strong>
  </label>

  <input
    type="range"
    min="0"
    max="100"
    value={health}
    onChange={(event) => setHealth(event.target.value)}
    style={{ width: "100%", marginTop: "18px" }}
  />

  <p>{health}%</p>
</div>
  </div>

<div style={{ marginTop: "28px" }}>
  <label>
    <strong>📝 Notes</strong>
  </label>

  <textarea
    value={notes}
    onChange={(event) => setNotes(event.target.value)}
    placeholder="What happened in Jardin Soleil today?"
    rows="6"
    style={{
      width: "100%",
      padding: "16px",
      borderRadius: "18px",
      border: "1px solid #D8D0C4",
      marginTop: "10px",
      fontFamily: "Georgia, serif",
      fontSize: "16px"
    }}
  />
</div>

<div
  style={{
    marginTop: "28px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "14px"
  }}
>
  <button>💾 Save Entry</button>
  <button>📸 Add Photo</button>
  <button>📖 View Journal</button>
</div>
  <div
  style={{
    marginTop: "35px",
    paddingTop: "25px",
    borderTop: "1px solid #ECE4D8",
    color: "#666"
  }}
>
  <h3
    style={{
      marginTop: 0,
      color: "#5D6B46"
    }}
  >
    🌿 Entry Preview
  </h3>

  <p>
    <strong>Plant:</strong>{" "}
    {plants.find((p) => p.id === selectedPlant)?.name || "None Selected"}
  </p>

  <p>
    <strong>Entry:</strong> {entryType}
  </p>

  <p>
    <strong>Health:</strong> {health}%
  </p>

  <p>
    <strong>Notes:</strong>{" "}
    {notes || "No notes entered yet."}
  </p>
</div>

</section>

);

}
