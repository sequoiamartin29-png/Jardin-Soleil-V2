import React, { useState } from "react";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import "./EstateEnvironmentSettings.css";

export default function EstateEnvironmentSettings({onBack}){
  const env=useEstateEnvironment();
  const {settings,updateSetting,status,error,conditionLabel,phase,season,estateLocation,refreshWeather,setManualLocation,useMyLocation,resetPreview}=env;
  const [location,setLocation]=useState("");
  return <section className="js-env-settings" aria-labelledby="environment-settings-title">
    <header><button type="button" onClick={onBack}>← Back to Dashboard</button><p>Jardin Soleil · Living Estate</p><h1 id="environment-settings-title">Weather Effects</h1><span>Choose how local conditions, seasons, wildlife, and atmospheric motion appear over the estate artwork.</span></header>
    <div className="js-env-settings__status"><strong>{conditionLabel}</strong><span>{estateLocation.label} · {phase.replace("-"," ")} · {season} · weather {status}</span>{error&&<small role="status">{error}</small>}<button type="button" onClick={()=>refreshWeather({force:true})}>Refresh Weather</button></div>
    <div className="js-env-settings__location"><button type="button" onClick={useMyLocation}>Use My Location</button><form onSubmit={async(event)=>{event.preventDefault();if(await setManualLocation(location))setLocation("");}}><label>City or postal code<input value={location} onChange={(event)=>setLocation(event.target.value)} placeholder="City or postal code" /></label><button type="submit">Choose Location</button></form><small>Only a general label and rounded coordinates are saved. No street address is stored.</small></div>
    <div className="js-env-settings__panel">
      {[["liveWeather","Reactive Weather","Reflect current conditions from Open-Meteo."],["seasonalEffects","Seasonal Estate Changes","Show restrained blossoms, leaves, summer wildlife, and winter atmosphere."],["dayNight","Day and Night Lighting","Use local sunrise, sunset, and time for estate lighting."],["wildlife","Wildlife","Show weather-appropriate butterflies, bees, hummingbird, moth, and dragonfly."],["buddy","Buddy","Let Buddy patrol the estate and share saved garden updates."],["reducedMotion","Use Reduced Motion","Stop particles, drifting effects, lightning, and swaying foliage."],["sound","Sound Effects","Optional ambience is off by default."]].map(([key,label,description])=><label key={key}><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={Boolean(settings[key])} onChange={(event)=>updateSetting(key,event.target.checked)}/></label>)}
      <label><span><strong>Animation Quality</strong><small>Balanced is recommended on mobile. Off returns the clean base illustration.</small></span><select value={settings.quality} onChange={(event)=>updateSetting("quality",event.target.value)}>{["Full","Balanced","Minimal","Off"].map(item=><option key={item}>{item}</option>)}</select></label>
      <label><span><strong>Preview Condition</strong><small>Test effects without changing live weather.</small></span><select value={settings.previewCondition} onChange={(event)=>updateSetting("previewCondition",event.target.value)}><option value="">Live weather</option>{["clear","partly_cloudy","cloudy","fog","drizzle","rain","heavy_rain","thunderstorm","snow","heavy_snow","sleet","windy","hot","cold"].map(item=><option key={item} value={item}>{item.replaceAll("_"," ")}</option>)}</select></label>
      <label><span><strong>Preview Season</strong><small>Test seasonal appearance without changing the saved location.</small></span><select value={settings.previewSeason} onChange={(event)=>updateSetting("previewSeason",event.target.value)}><option value="">Live season</option>{["spring","summer","autumn","winter"].map(item=><option key={item}>{item}</option>)}</select></label>
    </div>
    {(settings.previewCondition||settings.previewSeason)&&<button className="js-env-settings__reset" type="button" onClick={resetPreview}>Reset to Live Weather</button>}
  </section>;
}
