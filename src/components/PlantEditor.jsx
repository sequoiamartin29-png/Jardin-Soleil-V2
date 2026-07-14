import React, { useState } from "react";
import { useGarden } from "../context/GardenContext";
import { plantCategories, plantGroups, suggestPlantGroup, validateAndNormalizePlant } from "../utils/plantMutations";
import { EstateActionButton, EstateFormSection, EstatePageShell } from "./EstatePageSystem";
import "./PlantEditor.css";

const editableFields = ["name", "nickname", "type", "category", "group", "variety", "botanicalName", "gardenZone", "location", "status", "health", "sun", "water", "plantingDate", "acquisitionDate", "source", "notes", "iconType", "tags", "identifiedAt", "identificationConfidence", "plantFinderIdentificationId"];
const blank = { name:"", nickname:"", type:"", category:"", group:"", variety:"", botanicalName:"", gardenZone:"", location:"", status:"", health:"", sun:"", water:"", plantingDate:"", acquisitionDate:"", source:"", notes:"", iconType:"", tags:"", identifiedAt:"", identificationConfidence:"", plantFinderIdentificationId:"" };
const initialFor = (plant) => plant ? { ...blank, ...plant, health:plant.health ?? "", tags:(plant.tags || []).join(", ") } : blank;

export default function PlantEditor({ plant, initialValues, initialPhoto, onCancel, onSaved, onOpenExisting, onOpenPlantFinder }) {
  const { plants, addPlant, updatePlant, addPhotos } = useGarden();
  const [form, setForm] = useState(() => initialFor(plant || initialValues));
  const [errors, setErrors] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [keepInitialPhoto, setKeepInitialPhoto] = useState(Boolean(initialPhoto?.url));

  const change = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]:value };
      if ((field === "type" || field === "category") && !current.group) next.group = suggestPlantGroup(next);
      return next;
    });
    setErrors((current) => ({ ...current, [field]:undefined }));
    setAllowDuplicate(false);
  };

  const save = async (event) => {
    event.preventDefault();
    const result = validateAndNormalizePlant(form, plants, plant?.id || null);
    setErrors(result.errors);
    setDuplicates(result.duplicates);
    if (!result.valid || (result.duplicates.length && !allowDuplicate)) return;
    let saved = result.record;

    if (plant) {
      updatePlant(plant.id, (current) => {
        const next = { ...current };
        editableFields.forEach((field) => delete next[field]);
        return { ...next, ...result.record, id:plant.id, createdAt:plant.createdAt || result.record.createdAt };
      });
      saved = { ...plant, ...result.record, id:plant.id };
    } else {
      addPlant(saved);
    }

    if (photo) {
      const url = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(photo);
      });
      addPhotos([{ id:`plant-photo-${Date.now()}`, plantId:saved.id, name:photo.name, date:new Date().toISOString(), url }]);
    } else if (!plant && keepInitialPhoto && initialPhoto?.url) {
      addPhotos([{ id:`plant-photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, plantId:saved.id, name:initialPhoto.name || "Plant Finder specimen", date:new Date().toISOString(), url:initialPhoto.url, source:"Plant Finder", stage:"Estate plant profile" }]);
    }
    onSaved(saved);
  };

  return (
    <EstatePageShell
      id="plant-editor-title"
      eyebrow="Jardin Soleil · Garden Registry"
      title={plant ? "Edit Plant" : "Add New Plant"}
      subtitle={plant ? "Refine this estate record without disturbing its history." : "Register a plant in the canonical Jardin Soleil collection."}
      icon={plant?.iconType || "generic-plant"}
      className="js-plant-editor-shell"
      actions={!plant && onOpenPlantFinder ? <EstateActionButton variant="ledger" onClick={onOpenPlantFinder}>Identify an Unknown Plant</EstateActionButton> : null}
    >
      <form className="js-plant-editor" onSubmit={save} noValidate>
        <EstateFormSection legend="Identity">
          <Field label="Display name" required error={errors.name}><input value={form.name} onChange={(event) => change("name", event.target.value)} /></Field>
          <Field label="Nickname"><input value={form.nickname} onChange={(event) => change("nickname", event.target.value)} /></Field>
          <Field label="Plant type" required error={errors.type}><input value={form.type} onChange={(event) => change("type", event.target.value)} placeholder="e.g. Plum, Mint, Tomato, Rose" /></Field>
          <Field label="Category" required error={errors.category}><select value={form.category} onChange={(event) => change("category", event.target.value)}><option value="">Select category</option>{plantCategories.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Group"><select value={form.group} onChange={(event) => change("group", event.target.value)}><option value="">Use suggested group</option>{plantGroups.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Variety or cultivar"><input value={form.variety} onChange={(event) => change("variety", event.target.value)} /></Field>
          <Field label="Botanical name"><input value={form.botanicalName} onChange={(event) => change("botanicalName", event.target.value)} /></Field>
          <Field label="Icon type"><input value={form.iconType} onChange={(event) => change("iconType", event.target.value)} placeholder="e.g. mint, peach, rose" /></Field>
        </EstateFormSection>

        <EstateFormSection legend="Estate placement & care">
          <Field label="Garden zone"><input value={form.gardenZone} onChange={(event) => change("gardenZone", event.target.value)} /></Field>
          <Field label="Specific location"><input value={form.location} onChange={(event) => change("location", event.target.value)} /></Field>
          <Field label="Status"><input value={form.status} onChange={(event) => change("status", event.target.value)} /></Field>
          <Field label="Health percentage" error={errors.health}><input type="number" min="0" max="100" value={form.health} onChange={(event) => change("health", event.target.value)} /></Field>
          <Field label="Sun requirements"><input value={form.sun} onChange={(event) => change("sun", event.target.value)} /></Field>
          <Field label="Water needs"><input value={form.water} onChange={(event) => change("water", event.target.value)} /></Field>
          <Field label="Planting date" error={errors.plantingDate}><input type="date" value={form.plantingDate} onChange={(event) => change("plantingDate", event.target.value)} /></Field>
          <Field label="Acquisition date" error={errors.acquisitionDate}><input type="date" value={form.acquisitionDate} onChange={(event) => change("acquisitionDate", event.target.value)} /></Field>
          <Field label="Source or nursery"><input value={form.source} onChange={(event) => change("source", event.target.value)} /></Field>
          <Field label="Tags"><input value={form.tags} onChange={(event) => change("tags", event.target.value)} placeholder="comma separated" /></Field>
          <Field label="Photo"><input type="file" accept="image/*" onChange={(event) => { setPhoto(event.target.files?.[0] || null); if (event.target.files?.[0]) setKeepInitialPhoto(false); }} />{keepInitialPhoto && initialPhoto?.url && <figure className="js-plant-editor__finder-photo"><img src={initialPhoto.url} alt="Plant Finder specimen selected for this new estate record" /><figcaption>Plant Finder specimen<button type="button" onClick={() => setKeepInitialPhoto(false)}>Remove</button></figcaption></figure>}</Field>
          <Field label="Notes" wide><textarea rows="4" value={form.notes} onChange={(event) => change("notes", event.target.value)} /></Field>
        </EstateFormSection>

        {duplicates.length > 0 && !allowDuplicate && (
          <aside className="js-plant-editor__duplicates" role="alert">
            <h2>Possible duplicate</h2>
            <p>A saved plant shares this name, nickname, variety, or botanical name.</p>
            <div>
              {duplicates.map((item) => <EstateActionButton variant="ledger" key={item.id} onClick={() => onOpenExisting(item)}>Open {item.name}</EstateActionButton>)}
              <EstateActionButton variant="quiet" onClick={() => setAllowDuplicate(true)}>Save anyway</EstateActionButton>
            </div>
          </aside>
        )}

        <div className="js-plant-editor__actions">
          <EstateActionButton variant="quiet" onClick={onCancel}>Cancel</EstateActionButton>
          <EstateActionButton variant="primary" type="submit">{plant ? "Save Plant Changes" : "Add Plant"}</EstateActionButton>
        </div>
      </form>
    </EstatePageShell>
  );
}
function Field({ label, required, error, wide, children }) {
  return (
    <label className={wide ? "is-wide" : ""}>
      <span>{label}{required ? " *" : ""}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
