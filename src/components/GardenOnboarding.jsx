import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import {
  categoryForQuickStart,
  gardenTypeOptions,
  gardenZoneSuggestions,
  plantingMethodOptions,
  plantQuickStarts,
} from "../data/plantCatalog";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./GardenOnboarding.css";

const stepLabels = ["Welcome", "Garden Profile", "Garden Zones", "First Plants", "Preferences"];

const makeZone = (name) => ({
  id:`zone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name,
  type:"Garden zone",
  description:"",
  sunlight:"",
  soil:"",
  irrigation:"",
  notes:"",
});

const makePlant = (name, group) => ({
  id:`plant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name,
  commonName:name,
  type:group === "Fruit Trees" ? "Fruit Tree" : name,
  category:categoryForQuickStart(group),
  variety:"",
  quantity:1,
  zoneId:"",
  gardenZone:"",
  plantingMethod:group === "Fruit Trees" ? "Tree" : "Unknown",
});

export default function GardenOnboarding({ onComplete }) {
  const {
    onboardingDraft,
    updateOnboardingDraft,
    completeOnboarding,
    loadSampleGarden,
  } = useGarden();
  const [zoneName, setZoneName] = useState("");
  const [customPlant, setCustomPlant] = useState({ name:"", category:"Other", variety:"", quantity:1 });
  const step = Number(onboardingDraft.step) || 0;
  const profile = onboardingDraft.profile || {};
  const zones = onboardingDraft.zones || [];
  const plants = onboardingDraft.plants || [];

  const patch = (updates) => updateOnboardingDraft((current) => ({ ...current, ...updates }));
  const patchProfile = (updates) => patch({ profile:{ ...(onboardingDraft.profile || {}), ...updates } });
  const canContinue = step !== 1 || Boolean(String(profile.gardenName || "").trim());
  const selectedPlantCount = useMemo(
    () => plants.reduce((sum, plant) => sum + (Number(plant.quantity) || 1), 0),
    [plants],
  );

  const chooseBuild = () => patch({ mode:"personal", step:1 });
  const addZone = (name) => {
    const cleanName = String(name || "").trim();
    if (!cleanName || zones.some((zone) => zone.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) return;
    patch({ zones:[...zones, makeZone(cleanName)] });
    setZoneName("");
  };
  const addQuickPlant = (name, group) => {
    const existing = plants.find((plant) => plant.commonName === name);
    if (existing) {
      patch({ plants:plants.map((plant) => plant.id === existing.id ? { ...plant, quantity:(Number(plant.quantity) || 1) + 1 } : plant) });
      return;
    }
    patch({ plants:[...plants, makePlant(name, group)] });
  };
  const updatePlant = (plantId, updates) => patch({
    plants:plants.map((plant) => {
      if (plant.id !== plantId) return plant;
      const next = { ...plant, ...updates };
      const zone = zones.find((item) => item.id === next.zoneId);
      return { ...next, gardenZone:zone?.name || "" };
    }),
  });
  const addCustomPlant = (event) => {
    event.preventDefault();
    const name = customPlant.name.trim();
    if (!name) return;
    patch({ plants:[...plants, {
      ...makePlant(name, customPlant.category === "Fruits" ? "Fruits & Berries" : customPlant.category),
      ...customPlant,
      name,
      commonName:name,
      type:name,
      quantity:Math.max(1, Number(customPlant.quantity) || 1),
    }] });
    setCustomPlant({ name:"", category:"Other", variety:"", quantity:1 });
  };
  const finish = () => {
    completeOnboarding({
      profile:{
        gardenName:String(profile.gardenName || "").trim() || "My Garden",
        ownerDisplayName:String(profile.ownerDisplayName || "").trim(),
        gardenType:profile.gardenType || [],
        climateZone:String(profile.climateZone || "").trim(),
        hemisphere:profile.hemisphere || "northern",
        locationLabel:String(profile.locationLabel || "").trim(),
        units:profile.units || "imperial",
      },
      zones,
      plants,
    });
    onComplete?.();
  };
  const exploreSample = () => {
    loadSampleGarden();
    onComplete?.();
  };

  return (
    <main className="js-onboarding">
      <div className="js-onboarding__canopy" aria-hidden="true" />
      <section className="js-onboarding__card" aria-labelledby="onboarding-title">
        <header className="js-onboarding__brand">
          <span aria-hidden="true"><BotanicalIcon type="flower" size="lg" decorative /></span>
          <div><p>Jardin Soleil</p><small>Rooted in purpose · Grown with love</small></div>
        </header>

        {step > 0 && (
          <ol className="js-onboarding__progress" aria-label="Onboarding progress">
            {stepLabels.slice(1).map((label, index) => (
              <li key={label} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""}>
                <span>{index + 1}</span><small>{label}</small>
              </li>
            ))}
          </ol>
        )}

        {step === 0 && (
          <div className="js-onboarding__welcome">
            <span className="js-onboarding__flourish" aria-hidden="true">✦</span>
            <p className="js-onboarding__eyebrow">Your garden begins here</p>
            <h1 id="onboarding-title">Welcome to Jardin Soleil</h1>
            <p>Jardin Soleil is your digital home for everything growing in your care.</p>
            <div className="js-onboarding__welcome-actions">
              <button className="is-primary" type="button" onClick={chooseBuild}>Build My Garden</button>
              <button type="button" onClick={exploreSample}>Explore with a Sample Garden</button>
            </div>
            <small>Sample records are fictional, clearly labeled, and never mixed with your personal garden.</small>
          </div>
        )}

        {step === 1 && (
          <div className="js-onboarding__step">
            <p className="js-onboarding__eyebrow">Step 1 · Garden Profile</p>
            <h1 id="onboarding-title">Name your garden</h1>
            <p>This creates the local garden profile that owns every plant, zone, note, task, and photo you add.</p>
            <div className="js-onboarding__form-grid">
              <label>Garden name <span>*</span><input autoFocus value={profile.gardenName || ""} onChange={(event) => patchProfile({ gardenName:event.target.value })} placeholder="My Garden" /></label>
              <label>Your display name <small>Optional</small><input value={profile.ownerDisplayName || ""} onChange={(event) => patchProfile({ ownerDisplayName:event.target.value })} placeholder="How Jardin Soleil should greet you" /></label>
            </div>
            <fieldset>
              <legend>What are you growing? <small>Choose any that fit.</small></legend>
              <div className="js-onboarding__choice-grid">
                {gardenTypeOptions.map((type) => {
                  const checked = (profile.gardenType || []).includes(type);
                  return <label key={type} className={checked ? "is-selected" : ""}><input type="checkbox" checked={checked} onChange={() => patchProfile({ gardenType:checked ? profile.gardenType.filter((item) => item !== type) : [...(profile.gardenType || []), type] })} />{type}</label>;
                })}
              </div>
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <div className="js-onboarding__step">
            <p className="js-onboarding__eyebrow">Step 2 · Garden Zones</p>
            <h1 id="onboarding-title">Add the places where you grow</h1>
            <p>Zones are entirely yours. Add two now, add more later, or continue without them.</p>
            <div className="js-onboarding__suggestions">
              {gardenZoneSuggestions.map((name) => <button type="button" key={name} disabled={zones.some((zone) => zone.name === name)} onClick={() => addZone(name)}>+ {name}</button>)}
            </div>
            <form className="js-onboarding__inline-form" onSubmit={(event) => { event.preventDefault(); addZone(zoneName); }}>
              <label>Custom zone name<input value={zoneName} onChange={(event) => setZoneName(event.target.value)} placeholder="e.g. Side Yard Beds" /></label>
              <button type="submit">Add Zone</button>
            </form>
            <div className="js-onboarding__selected-list">
              {zones.length ? zones.map((zone, index) => <article key={zone.id}><span>{index + 1}</span><strong>{zone.name}</strong><button type="button" aria-label={`Remove ${zone.name}`} onClick={() => patch({ zones:zones.filter((item) => item.id !== zone.id), plants:plants.map((plant) => plant.zoneId === zone.id ? { ...plant, zoneId:"", gardenZone:"" } : plant) })}>Remove</button></article>) : <p>No zones yet. Your garden can still begin without one.</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="js-onboarding__step">
            <p className="js-onboarding__eyebrow">Step 3 · First Plants</p>
            <h1 id="onboarding-title">Add what is growing now</h1>
            <p>Choose several quick starts, enter a custom plant, or skip and use Plant Finder later.</p>
            <div className="js-onboarding__catalog">
              {Object.entries(plantQuickStarts).map(([group, names]) => (
                <details key={group} open={group === "Vegetables"}>
                  <summary>{group}</summary>
                  <div>{names.map((name) => <button type="button" key={name} onClick={() => addQuickPlant(name, group)}>+ {name}</button>)}</div>
                </details>
              ))}
            </div>
            <form className="js-onboarding__custom-plant" onSubmit={addCustomPlant}>
              <label>Custom plant<input value={customPlant.name} onChange={(event) => setCustomPlant((current) => ({ ...current, name:event.target.value }))} placeholder="Plant name" /></label>
              <label>Category<select value={customPlant.category} onChange={(event) => setCustomPlant((current) => ({ ...current, category:event.target.value }))}><option>Other</option>{Object.keys(plantQuickStarts).map((group) => <option key={group} value={categoryForQuickStart(group)}>{categoryForQuickStart(group)}</option>)}</select></label>
              <label>Variety<input value={customPlant.variety} onChange={(event) => setCustomPlant((current) => ({ ...current, variety:event.target.value }))} /></label>
              <label>Quantity<input type="number" min="1" value={customPlant.quantity} onChange={(event) => setCustomPlant((current) => ({ ...current, quantity:event.target.value }))} /></label>
              <button type="submit">Add Custom Plant</button>
            </form>
            <div className="js-onboarding__plants">
              <header><strong>{selectedPlantCount} plants selected</strong><span>{plants.length} records</span></header>
              {plants.map((plant) => <article key={plant.id}>
                <strong>{plant.commonName}</strong>
                <label>Quantity<input aria-label={`${plant.commonName} quantity`} type="number" min="1" value={plant.quantity} onChange={(event) => updatePlant(plant.id, { quantity:event.target.value })} /></label>
                <label>Variety<input aria-label={`${plant.commonName} variety`} value={plant.variety || ""} onChange={(event) => updatePlant(plant.id, { variety:event.target.value })} /></label>
                <label>Zone<select aria-label={`${plant.commonName} garden zone`} value={plant.zoneId || ""} onChange={(event) => updatePlant(plant.id, { zoneId:event.target.value })}><option value="">Unassigned</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label>
                <label>Started as<select aria-label={`${plant.commonName} planting method`} value={plant.plantingMethod || "Unknown"} onChange={(event) => updatePlant(plant.id, { plantingMethod:event.target.value })}>{plantingMethodOptions.map((method) => <option key={method}>{method}</option>)}</select></label>
                <button type="button" onClick={() => patch({ plants:plants.filter((item) => item.id !== plant.id) })}>Remove</button>
              </article>)}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="js-onboarding__step">
            <p className="js-onboarding__eyebrow">Step 4 · Preferences</p>
            <h1 id="onboarding-title">Make Jardin Soleil yours</h1>
            <p>Only the garden name is required. These preferences can all be changed later.</p>
            <div className="js-onboarding__form-grid">
              <label>Units<select value={profile.units || "imperial"} onChange={(event) => patchProfile({ units:event.target.value })}><option value="imperial">Imperial</option><option value="metric">Metric</option></select></label>
              <label>Hemisphere<select value={profile.hemisphere || "northern"} onChange={(event) => patchProfile({ hemisphere:event.target.value })}><option value="northern">Northern</option><option value="southern">Southern</option></select></label>
              <label>Climate or hardiness zone <small>Optional</small><input value={profile.climateZone || ""} onChange={(event) => patchProfile({ climateZone:event.target.value })} placeholder="e.g. 7b" /></label>
              <label>General location <small>Optional</small><input value={profile.locationLabel || ""} onChange={(event) => patchProfile({ locationLabel:event.target.value })} placeholder="City, region, or leave blank" /></label>
            </div>
            <div className="js-onboarding__review">
              <article><span>Garden</span><strong>{profile.gardenName || "My Garden"}</strong></article>
              <article><span>Zones</span><strong>{zones.length}</strong></article>
              <article><span>Plants</span><strong>{selectedPlantCount}</strong></article>
            </div>
          </div>
        )}

        {step > 0 && (
          <footer className="js-onboarding__actions">
            <button type="button" onClick={() => patch({ step:Math.max(0, step - 1) })}>Back</button>
            {step < 4
              ? <button className="is-primary" type="button" disabled={!canContinue} onClick={() => patch({ step:step + 1 })}>Continue</button>
              : <button className="is-primary" type="button" onClick={finish}>Enter My Garden</button>}
          </footer>
        )}
      </section>
    </main>
  );
}
