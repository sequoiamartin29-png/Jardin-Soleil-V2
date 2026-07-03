import React, { useMemo, useState } from "react";

const vocabulary = [
"APPLE",
"PEAR",
"PLUM",
"CHERRY",
"LEMON",
"KISHU",
"PAGE",
"PEACH",
"APRICOT",
"NECTARINE",
"GRAFT",
"ROOT",
"CANOPY",
"CAMBIUM",
"XYLEM",
"PHLOEM",
"MULCH",
"PRUNE",
"HARVEST",
"BLOOM",
"MINT",
"THYME",
"STEVIA",
"CHAMOMILE",
"SAGE",
"TOMATO",
"PEPPER",
"EGGPLANT",
"SQUASH",
"ZUCCHINI",
"CARROT",
"LETTUCE",
"POLLEN",
"FLOWER",
"SEED",
"ORCHARD"
];

function randomWords(count){

const shuffled=[...vocabulary].sort(()=>Math.random()-0.5);

return shuffled.slice(0,count);

}

export default function WordSearch(){

const [difficulty,setDifficulty]=useState("Easy");

const words=useMemo(()=>{

switch(difficulty){

case "Easy":
return randomWords(6);

case "Medium":
return randomWords(10);

case "Hard":
return randomWords(14);

default:
return randomWords(18);

}

},[difficulty]);

return(

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

🎮 Garden Word Search

</h2>

<p
style={{
color:"#777",
fontSize:"18px",
marginBottom:"30px"
}}
>

Every game uses a different set of horticulture words.

</p>
  <div
style={{
display:"flex",
gap:"12px",
flexWrap:"wrap",
marginBottom:"30px"
}}
>

{["Easy","Medium","Hard","Expert"].map((level)=>(

<button
key={level}
onClick={()=>setDifficulty(level)}
style={{
background:difficulty===level ? "#8FA06A" : "#B8C8A0"
}}
>
{level}
</button>

))}

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
gap:"24px"
}}
>

<div
className="card"
style={{
minHeight:"360px",
background:"linear-gradient(135deg,#FFFDF9,#F8F3EC)"
}}
>

<h3>🧩 Puzzle Board</h3>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(10,1fr)",
gap:"6px",
marginTop:"20px"
}}
>
  {Array.from({length:100}).map((_,index)=>{

const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const letter=letters[Math.floor(Math.random()*letters.length)];

return(
<div
key={index}
style={{
background:"#FFF",
borderRadius:"8px",
padding:"8px",
textAlign:"center",
fontWeight:"bold",
color:"#5D6B46",
boxShadow:"0 4px 10px rgba(0,0,0,.06)"
}}
>
{letter}
</div>
);

})}

</div>

<p
style={{
marginTop:"20px",
color:"#777",
lineHeight:"1.7"
}}
>
This is the first playable board foundation. Future updates will hide the selected words inside the grid instead of showing random filler only.
</p>

</div>

<div className="card">
<h3>🌿 Words To Find</h3>

<ul>
{words.map((word)=>(
<li key={word}>{word}</li>
))}
</ul>

<button
onClick={()=>window.location.reload()}
>
🔄 New Puzzle
</button>
</div>
  <div className="card">
  <h3>🏆 Game Notes</h3>

  <ul>
    <li>Difficulty changes the number of words.</li>
    <li>Word bank pulls from Jardin Soleil vocabulary.</li>
    <li>Future update: words will be hidden inside the grid.</li>
    <li>Future update: timer, scores, and completed puzzle history.</li>
  </ul>
</div>

</div>

</section>

);

}
