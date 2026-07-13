import React from "react";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import "./EstateEnvironmentSettings.css";

export default function EstateEnvironmentSettings({onBack}) {
  const {settings,updateSetting,status,error,conditionLabel,phase,season}=useEstateEnvironment();
  return <section className="js-env-settings" aria-labelledby="environment-settings-title">
    <header><button type="button" onClick={onBack}>← Back to Dashboard</button><p>Jardin Soleil · Living Estate</p><h1 id="environment-settings-title">Estate Environment</h1><span>Choose how live conditions, seasons, wildlife, and ambient motion appear over the approved estate artwork.</span></header>
    <div className="js-env-settings__status"><strong>{conditionLabel}</strong><span>{phase.replace("-"," ")} · {season} · weather {status}</span>{error&&<small>{error}</small>}</div>
    <div className="js-env-settings__panel">
      {[["liveWeather","Live Weather","Use current conditions from the estate’s shared weather source."],["seasonalEffects","Seasonal Effects","Show restrained blossoms, leaves, summer wildlife, and winter atmosphere."],["wildlife","Wildlife","Show butterflies, bees, hummingbird, moth, and dragonfly."],["buddy","Buddy","Let Buddy patrol the estate and share saved garden updates."]].map(([key,label,description])=><label key={key}><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={settings[key]} onChange={(event)=>updateSetting(key,event.target.checked)}/></label>)}
      <label><span><strong>Ambient Motion</strong><small>Adjust the prominence of decorative environmental movement.</small></span><select value={settings.intensity} onChange={(event)=>updateSetting("intensity",event.target.value)}><option>Minimal</option><option>Normal</option><option>Enhanced</option></select></label>
    </div>
  </section>;
}
