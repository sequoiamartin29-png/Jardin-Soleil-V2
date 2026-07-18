import React from "react";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import EstatePage from "./EstatePage";

const display=(value,suffix="")=>value===null||value===undefined?"Unavailable":`${Math.round(Number(value)*10)/10}${suffix}`;
export default function Weather(){
  const env=useEstateEnvironment();
  const {weather,status,sourceStatus,estateLocation,error,conditionLabel,phase,season,refreshWeather,settings}=env;
  const preview=Boolean(settings.previewCondition||settings.previewSeason);
  return <EstatePage id="weather-title" title="Estate Weather" description="Local conditions from the dashboard’s shared Open-Meteo source, displayed in the location’s reported timezone." icon="lavender" actions={<button className="js-estate-button is-primary" type="button" onClick={()=>refreshWeather({force:true})}>Refresh Weather</button>}>
    <div className="js-estate-toolbar"><span className="js-estate-badge is-gold">Location · {estateLocation.label}</span><span className="js-estate-badge">Source · {sourceStatus}</span></div>
    <p className="js-estate-panel">{preview?`Previewing ${settings.previewSeason||season} ${settings.previewCondition||conditionLabel.toLowerCase()}.`:"Jardin Soleil is reflecting current local conditions."}</p>
    {error&&<p role="status" className="js-estate-panel">{error}</p>}
    {!weather?<article className="js-estate-panel"><h2>{status==="loading"?"Refreshing local estate weather…":"Conditions unavailable"}</h2><p>Choose a location in Weather Effects settings to activate local estate weather.</p></article>:
    <div className="js-estate-grid">{[["Conditions",conditionLabel],["Temperature",display(weather.temperatureF,"°F")],["Feels like",display(weather.apparentTemperatureF,"°F")],["Precipitation",weather.precipitationType?`${display(weather.precipitation," in")} · ${weather.precipitationType} · ${display(weather.precipitationProbability,"% chance")}`:"None reported"],["Wind",`${display(weather.windSpeedMph," mph")} · gusts ${display(weather.windGustMph," mph")}`],["Cloud cover",display(weather.cloudCover,"%")],["Last updated",weather.observedAt?new Date(weather.observedAt).toLocaleString():"Unavailable"],["Status",weather.isStale?"Last known conditions":"Current cached observation"]].map(([label,value])=><article className="js-estate-card" key={label}><span className="js-estate-kicker">{label}</span><h2 style={{color:"#52623f",fontFamily:"Georgia,serif"}}>{value}</h2></article>)}</div>}
    <p className="js-estate-panel" style={{marginTop:"22px"}}>Estate state: <strong>{phase.replace("-"," ")}</strong> · <strong>{season}</strong> · <strong>{weather?.timezone?.replace(/_/g," ")||"Local browser time"}</strong></p>
  </EstatePage>;
}
