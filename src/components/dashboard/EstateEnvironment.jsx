import React from "react";
import { useEstateEnvironment } from "../../context/EstateEnvironmentContext";
import "./EstateEnvironment.css";

export default function EstateEnvironment({ paused=false }) {
  const environment=useEstateEnvironment();
  const { settings,condition,phase,season,windy }=environment;
  const disabled=!settings.liveWeather&&!settings.previewCondition;
  return <div className={`js-estate-environment phase-${phase} weather-${disabled?"clear":condition} season-${season}${windy?" is-windy":""}${paused?" is-paused":""}${settings.reducedMotion?" is-reduced-motion":""} quality-${settings.quality.toLowerCase()}`} aria-hidden="true">
    <span className="js-env-light" />
    {!disabled&&<><span className="js-env-cloud js-env-cloud--one"/><span className="js-env-cloud js-env-cloud--two"/><span className="js-env-fog"/><div className="js-env-rain">{Array.from({length:18},(_,i)=><i key={i}/>)}</div><div className="js-env-snow">{Array.from({length:16},(_,i)=><i key={i}/>)}</div><span className="js-env-wet-path"/><span className="js-env-lightning"/><span className="js-env-frost"/></>}
    {settings.seasonalEffects&&<><div className="js-env-petals">{Array.from({length:7},(_,i)=><i key={i}/>)}</div><div className="js-env-leaves">{Array.from({length:7},(_,i)=><i key={i}/>)}</div><span className="js-env-winter-haze"/><span className="js-env-dragonfly"/></>}
    {settings.dayNight&&<div className="js-env-night"><span className="js-env-stars"/><span className="js-env-moon"/><span className="js-env-lanterns"/></div>}
  </div>;
}
