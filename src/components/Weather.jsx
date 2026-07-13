import React from "react";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";

const display=(value,suffix="")=>value===null||value===undefined?"Unavailable":`${Math.round(Number(value)*10)/10}${suffix}`;
export default function Weather() {
  const {weather,status,error,conditionLabel,phase,season}=useEstateEnvironment();
  return <section style={{marginTop:"50px"}} aria-labelledby="weather-title">
    <h1 id="weather-title" style={{fontFamily:"Baskerville,Georgia,serif",fontSize:"42px",color:"#5D6B46"}}>Garden Weather</h1>
    <p style={{color:"#777",fontSize:"18px",marginBottom:"28px"}}>Live local conditions used by the Jardin Soleil estate environment.</p>
    {error&&<p role="status" style={{background:"#fff5df",border:"1px solid #d4ad68",borderRadius:"14px",padding:"14px"}}>{error}</p>}
    {!weather?<article className="card"><h2>{status==="loading"?"Locating the estate weather…":"Live conditions unavailable"}</h2><p>Enable Live Weather and allow browser location access to synchronize the estate.</p></article>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:"18px"}}>
      {[["Conditions",conditionLabel],["Temperature",display(weather.temperature,"°F")],["Feels like",display(weather.apparentTemperature,"°F")],["Precipitation",display(weather.precipitation," in")],["Wind",display(weather.wind," mph")],["Cloud cover",display(weather.cloudCover,"%")],["Sunrise",weather.sunrise?new Date(weather.sunrise).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"Unavailable"],["Sunset",weather.sunset?new Date(weather.sunset).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"Unavailable"]].map(([label,value])=><article className="card" key={label}><span style={{color:"#8a744d",fontSize:"12px",letterSpacing:".12em",textTransform:"uppercase"}}>{label}</span><h2 style={{color:"#52623f",fontFamily:"Georgia,serif"}}>{value}</h2></article>)}
    </div>}
    <p style={{color:"#736b5d",marginTop:"22px"}}>Estate state: <strong>{phase.replace("-"," ")}</strong> · <strong>{season}</strong>{weather?.timezone?` · ${weather.timezone.replace(/_/g," ")}`:""}</p>
  </section>;
}
