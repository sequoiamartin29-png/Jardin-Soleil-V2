import React from "react";
import { useEstateEnvironment } from "../../context/EstateEnvironmentContext";
import "./EstateEnvironment.css";

export default function EstateEnvironment({ paused=false }) {
  const environment=useEstateEnvironment();
  const { settings,condition,phase,season,windy }=environment;
  return <div className={`js-estate-environment phase-${phase} weather-${condition} season-${season}${windy?" is-windy":""}${paused?" is-paused":""} intensity-${settings.intensity.toLowerCase()}`} aria-hidden="true">
    <span className="js-env-light" />
    {settings.liveWeather&&<><span className="js-env-cloud js-env-cloud--one"/><span className="js-env-cloud js-env-cloud--two"/><div className="js-env-rain">{Array.from({length:14},(_,i)=><i key={i}/>)}</div><div className="js-env-snow">{Array.from({length:12},(_,i)=><i key={i}/>)}</div><span className="js-env-wet-path"/><span className="js-env-lightning"/></>}
    {settings.seasonalEffects&&<><div className="js-env-petals">{Array.from({length:7},(_,i)=><i key={i}/>)}</div><div className="js-env-leaves">{Array.from({length:7},(_,i)=><i key={i}/>)}</div><span className="js-env-winter-haze"/><span className="js-env-dragonfly"/></>}
    <div className="js-env-night"><span className="js-env-stars"/><span className="js-env-moon"/><span className="js-env-lanterns"/></div>
  </div>;
}
