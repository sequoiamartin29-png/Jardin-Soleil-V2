import React, { useMemo, useState } from "react";
import { buildIdentificationContext } from "../../utils/buildIdentificationContext";
import { flowerColors, flowerShapes, fruitTypes, habitatTypes, leafArrangements, leafTraits, plantForms, stemTraits } from "../../utils/plantFinderRules";

const steps = ["Plant form", "Leaf arrangement", "Leaf traits", "Flowers", "Fruit or seeds", "Bark & habit", "Habitat", "Location"];
const toggle = (items, item) => items.includes(item) ? items.filter((value) => value !== item) : [...items, item];

export default function IdentificationWizard({ initialData = {}, notice = "", onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [draft, setDraft] = useState({
    subject:"Unknown", form:"Unknown", leafArrangement:"Unknown", leafTraits:[], flowerColors:[], flowerShapes:[],
    fruit:[], stem:[], habitat:[], country:"", region:"", usdaZone:"", coordinates:null, notes:"", photoIds:[],
    sourceMode:"Manual Wizard", ...initialData,
  });

  const stageTitle = useMemo(() => steps[step - 1], [step]);
  const multi = (field, value) => setDraft((current) => ({ ...current, [field]:toggle(current[field], value) }));
  const finish = () => onComplete(buildIdentificationContext(draft));
  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationMessage("This browser does not provide location access. You can continue without it."); return; }
    setLocating(true);
    setLocationMessage("Waiting for your browser’s permission…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraft((current) => ({ ...current, coordinates:{ latitude:position.coords.latitude, longitude:position.coords.longitude } }));
        setLocationMessage("Approximate coordinates added with your permission.");
        setLocating(false);
      },
      () => { setLocationMessage("Location was not shared. You can continue without it."); setLocating(false); },
      { enableHighAccuracy:false, timeout:10000, maximumAge:300000 }
    );
  };

  return (
    <section className="js-finder-ledger js-finder-wizard" aria-labelledby="plant-finder-wizard-title">
      <header><p>Botanical field key</p><h2 id="plant-finder-wizard-title">Manual Identification Wizard</h2><span>Step {step} of 8 · {stageTitle}</span></header>
      {notice && <aside className="js-finder-notice" role="status">{notice}</aside>}
      <ol className="js-finder-progress" aria-label="Identification progress">
        {steps.map((item, index) => <li key={item} className={index + 1 === step ? "is-current" : index + 1 < step ? "is-complete" : ""}><span>{index + 1}</span><small>{item}</small></li>)}
      </ol>

      <div className="js-finder-wizard__stage">
        {step === 1 && <ChoiceField legend="What is the plant’s overall form?" values={plantForms} selected={[draft.form]} onChange={(form) => setDraft((current) => ({ ...current, form }))} />}
        {step === 2 && <ChoiceField legend="How are the leaves arranged?" description="Look at where leaves attach to the stem, not just their shape." values={leafArrangements} selected={[draft.leafArrangement]} onChange={(leafArrangement) => setDraft((current) => ({ ...current, leafArrangement }))} />}
        {step === 3 && <ChoiceField legend="Which leaf traits can you observe?" values={leafTraits} selected={draft.leafTraits} onChange={(value) => multi("leafTraits", value)} multiple />}
        {step === 4 && <div className="js-finder-two-keys"><ChoiceField legend="Flower color" values={flowerColors} selected={draft.flowerColors} onChange={(value) => multi("flowerColors", value)} multiple /><ChoiceField legend="Flower shape and arrangement" values={flowerShapes} selected={draft.flowerShapes} onChange={(value) => multi("flowerShapes", value)} multiple /></div>}
        {step === 5 && <ChoiceField legend="What fruit or seed structure is visible?" values={fruitTypes} selected={draft.fruit} onChange={(value) => multi("fruit", value)} multiple />}
        {step === 6 && <ChoiceField legend="Bark, stem, and growth habit" values={stemTraits} selected={draft.stem} onChange={(value) => multi("stem", value)} multiple />}
        {step === 7 && <ChoiceField legend="Where is the plant growing?" values={habitatTypes} selected={draft.habitat} onChange={(value) => multi("habitat", value)} multiple />}
        {step === 8 && (
          <div className="js-finder-location">
            <p>Location narrows possibilities, but GPS is optional and is requested only when you press the permission button.</p>
            <div><label><span>Country</span><input value={draft.country} onChange={(event) => setDraft((current) => ({ ...current, country:event.target.value }))} /></label><label><span>State or region</span><input value={draft.region} onChange={(event) => setDraft((current) => ({ ...current, region:event.target.value }))} /></label><label><span>USDA zone</span><input value={draft.usdaZone} onChange={(event) => setDraft((current) => ({ ...current, usdaZone:event.target.value }))} placeholder="Optional" /></label></div>
            <label><span>Field notes</span><textarea rows="4" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes:event.target.value }))} placeholder="Odor, sap, plant height, nearby habitat, or other observations" /></label>
            <button type="button" className="js-finder-location__button" onClick={requestLocation} disabled={locating}>{locating ? "Requesting location…" : draft.coordinates ? "Location added" : "Share approximate GPS location"}</button>
            {locationMessage && <p role="status">{locationMessage}</p>}
          </div>
        )}
      </div>

      <div className="js-finder-actions">
        <button type="button" className="is-quiet" onClick={() => step === 1 ? onCancel() : setStep((current) => current - 1)}>Back</button>
        <button type="button" className="is-primary" onClick={() => step < 8 ? setStep((current) => current + 1) : finish()}>{step === 8 ? "Compare field-key matches" : "Continue"}</button>
      </div>
    </section>
  );
}

function ChoiceField({ legend, description, values, selected, onChange, multiple = false }) {
  return (
    <fieldset className="js-finder-choice">
      <legend>{legend}</legend>
      {description && <p>{description}</p>}
      <div>{values.map((value) => {
        const checked = selected.includes(value);
        return <label key={value} className={checked ? "is-selected" : ""}><input type={multiple ? "checkbox" : "radio"} checked={checked} onChange={() => onChange(value)} /><span>{value}</span></label>;
      })}</div>
    </fieldset>
  );
}

