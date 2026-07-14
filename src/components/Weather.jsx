import React from "react";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import EstatePage from "./EstatePage";

const display=(value,suffix="")=>value===null||value===undefined?"Unavailable":`${Math.round(Number(value)*10)/10}${suffix}`;
export default function Weather() {
  const {weather,status,sourceStatus,estateLocation,error,conditionLabel,phase,season}=useEstateEnvironment();
  return <EstatePage id="weather-title" title="Estate Weather" description="Delaware conditions from the dashboard’s shared weather source, displayed in your browser’s local time." icon="lavender">
    <div className="js-estate-toolbar"><span className="js-estate-badge is-gold">Estate location · {estateLocation.label}</span><span className="js-estate-badge">Source · {sourceStatus}</span></div>
    {error&&<p role="status" className="js-estate-panel">{error}</p>}
    {!weather?<article className="js-estate-panel"><h2>{status==="loading"?"Refreshing Delaware estate weather…":"Conditions unavailable"}</h2><p>When Live Weather is enabled, this page refreshes the configured Delaware estate source. The browser’s local timezone controls date and time display.</p></article>:
    <div className="js-estate-grid">
      {[["Conditions",conditionLabel],["Temperature",display(weather.temperature,"°F")],["Feels like",display(weather.apparentTemperature,"°F")],["Precipitation",display(weather.precipitation," in")],["Wind",display(weather.wind," mph")],["Cloud cover",display(weather.cloudCover,"%")],["Sunrise",weather.sunrise?new Date(weather.sunrise).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"Unavailable"],["Sunset",weather.sunset?new Date(weather.sunset).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"Unavailable"]].map(([label,value])=><article className="js-estate-card" key={label}><span className="js-estate-kicker">{label}</span><h2 style={{color:"#52623f",fontFamily:"Georgia,serif"}}>{value}</h2></article>)}
    </div>}
    <p className="js-estate-panel" style={{marginTop:"22px"}}>Estate state: <strong>{phase.replace("-"," ")}</strong> · <strong>{season}</strong> · <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone?.replace(/_/g," ") || "Local browser time"}</strong></p>
  </EstatePage>;
}
