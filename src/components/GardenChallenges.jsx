import React, { useState } from "react";

const challenges = [
  "Inspect one plant for new growth",
  "Check soil moisture before watering",
  "Record one seasonal garden observation",
  "Photograph a bloom, fruit, or interesting leaf",
];

export default function GardenChallenges({ onNavigate }) {
  const [completed, setCompleted] = useState(() => new Set());
  const toggle = (challenge) => setCompleted((current) => { const next = new Set(current); if (next.has(challenge)) next.delete(challenge); else next.add(challenge); return next; });
  return (
    <section style={{ marginTop:"40px" }}>
      <div style={{ background:"linear-gradient(120deg,#f5e3e6,#fff8e9,#e2eadb)", border:"1px solid rgba(177,138,71,.4)", borderRadius:"30px", padding:"35px" }}>
        <p style={{ color:"#B18A47", fontWeight:800, letterSpacing:".16em", textTransform:"uppercase" }}>Botanical Games</p>
        <h1 style={{ color:"#4A5C41", fontFamily:"Georgia,serif", fontSize:"42px", margin:"0 0 10px" }}>🏆 Garden Challenges</h1>
        <p style={{ color:"#706C63" }}>Complete thoughtful daily activities while tending Jardin Soleil.</p>
      </div>
      <button type="button" onClick={() => onNavigate?.("Learning")} style={{ background:"transparent", border:0, color:"#596D4D", cursor:"pointer", fontWeight:800, margin:"20px 0" }}>← Back to Learning Center</button>
      <div className="card">
        <h2 style={{ color:"#53633F" }}>Today’s challenges</h2>
        {challenges.map((challenge) => <label key={challenge} style={{ alignItems:"center", borderBottom:"1px solid #ECE4D8", display:"flex", gap:"12px", padding:"14px 0" }}><input type="checkbox" checked={completed.has(challenge)} onChange={() => toggle(challenge)} style={{ width:"auto" }}/><span style={{ textDecoration:completed.has(challenge)?"line-through":"none" }}>{challenge}</span></label>)}
        <p aria-live="polite" style={{ color:"#718061" }}>{completed.size} of {challenges.length} completed</p>
      </div>
    </section>
  );
}
