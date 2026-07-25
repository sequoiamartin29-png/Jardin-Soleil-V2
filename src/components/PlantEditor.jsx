import React, { useState } from "react";
import { useGarden } from "../context/GardenContext";
import { categoryForQuickStart, plantingMethodOptions, plantQuickStarts } from "../data/plantCatalog";
import { plantCategories, plantGroups, suggestPlantGroup, validateAndNormalizePlant } from "../utils/plantMutations";
import { EstateActionButton, EstateFormSection, EstatePageShell } from "./EstatePageSystem";
import "./PlantEditor.css";

const editableFields = ["name", "commonName", "nickname", "type", "category", "group", "variety", "botanicalName", "quantity", "zoneId", "gardenZone", "location", "status", "healthStatus", "health", "sun", "sunlight", "water", "watering", "soil", "plantingMethod", "plantedDate", "plantingDate", "expectedHarvest", "acquisitionDate", "source", "notes", "iconType", "tags", "identifiedAt", "identificationConfidence", "plantFinderIdentificationId"];
const blank = { name:"", commonName:"", nickname:"", type:"", category:"", group:"", variety:"", botanicalName:"", quantity:1, zoneId:"", gardenZone:"", location:"", status:"Active", healthStatus:"", health:"", sun:"", water:"", soil:"", plantingMethod:"Unknown", plantedDate:"", expectedHarvest:"", acquisitionDate:"", source:"", notes:"", iconType:"", tags:"", identifiedAt:"", identificationConfidence:"", plantFinderIdentificationId:"" };
const initialFor = (plant) => plant ? { ...blank, ...plant, health:plant.health ?? "", tags:(plant.tags || []).join(", ") } : blank;
const catalogEntries = Object.entries(plantQuickStarts).flatMap(([group, names]) => names.map((name) => ({ name, group, category:categoryForQuickStart(group) })));

export default function PlantEditor({ plant, initialValues, initialPhoto, onCancel, onSaved, onOpenExisting, onOpenPlantFinder }) {
  const { plants, addPlant, updatePlant, addPhotos, gardenCollections } = useGarden();
  const [form, setForm] = useState(() => initialFor(plant || initialValues));
  const [errors, setErrors] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [keepInitialPhoto, setKeepInitialPhoto] = useState(Boolean(initialPhoto?.url));

  const change = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]:value };
      if (field === "name") {
        const catalogPlant = catalogEntries.find((item) => item.name.toLocaleLowerCase() === value.trim().toLocaleLowerCase());
        if (catalogPlant) {
          next.commonName = catalogPlant.name;
          next.type = catalogPlant.group === "Fruit Trees" ? "Fruit Tree" : catalogPlant.name;
          next.category = catalogPlant.category;
          next.plantingMethod = catalogPlant.group === "Fruit Trees" ? "Tree" : next.plantingMethod;
        }
      }
      if (field === "zoneId") {
        next.gardenZone = gardenCollections.find((zone) => zone.id === value)?.name || "";
      }
      if ((field === "type" || field === "category") && !current.group) next.group = suggestPlantGroup(next);
      return next;
    });
    setErrors((current) => ({ ...current, [field]:undefined }));
    setAllowDuplicate(false);
  };

  const duplicate = () => {
    if (!plant) return;
    const next = addPlant({
      ...plant,
      id:undefined,
      name:`${plant.name} Copy`,
      nickname:"",
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    });
    onSaved(next);
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
          {!plant && <div className="js-plant-editor__quick-start is-wide"><strong>Quick-start catalog</strong><span>Search a common vegetable, fruit, tree, herb, or enter any custom plant.</span><div>{catalogEntries.slice(0, 16).map((item) => <button type="button" key={`${item.group}-${item.name}`} onClick={() => change("name", item.name)}>+ {item.name}</button>)}</div></div>}
          <Field label="Display name" required error={errors.name}><input list="jardin-plant-catalog" value={form.name} onChange={(event) => change("name", event.target.value)} /><datalist id="jardin-plant-catalog">{catalogEntries.map((item) => <option key={`${item.group}-${item.name}`} value={item.name}>{item.group}</option>)}</datalist></Field>
          <Field label="Nickname"><input value={form.nickname} onChange={(event) => change("nickname", event.target.value)} /></Field>
          <Field label="Plant type" required error={errors.type}><input value={form.type} onChange={(event) => change("type", event.target.value)} placeholder="e.g. Plum, Mint, Tomato, Rose" /></Field>
          <Field label="Category" required error={errors.category}><select value={form.category} onChange={(event) => change("category", event.target.value)}><option value="">Select category</option>{plantCategories.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Group"><select value={form.group} onChange={(event) => change("group", event.target.value)}><option value="">Use suggested group</option>{plantGroups.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Variety or cultivar"><input value={form.variety} onChange={(event) => change("variety", event.target.value)} /></Field>
          <Field label="Botanical name"><input value={form.botanicalName} onChange={(event) => change("botanicalName", event.target.value)} /></Field>
          <Field label="Quantity" error={errors.quantity}><input type="number" min="1" value={form.quantity} onChange={(event) => change("quantity", event.target.value)} /></Field>
          <Field label="Icon type"><input value={form.iconType} onChange={(event) => change("iconType", event.target.value)} placeholder="e.g. mint, peach, rose" /></Field>
        </EstateFormSection>

        <EstateFormSection legend="Estate placement & care">
          <Field label="Garden zone"><select value={form.zoneId || ""} onChange={(event) => change("zoneId", event.target.value)}><option value="">Unassigned</option>{gardenCollections.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></Field>
          <Field label="Specific location"><input value={form.location} onChange={(event) => change("location", event.target.value)} /></Field>
          <Field label="Planting method"><select value={form.plantingMethod || "Unknown"} onChange={(event) => change("plantingMethod", event.target.value)}>{plantingMethodOptions.map((method) => <option key={method}>{method}</option>)}</select></Field>
          <Field label="Status"><input value={form.status} onChange={(event) => change("status", event.target.value)} /></Field>
          <Field label="Health status"><input value={form.healthStatus} onChange={(event) => change("healthStatus", event.target.value)} placeholder="Healthy, monitoring, recovering…" /></Field>
          <Field label="Health percentage" error={errors.health}><input type="number" min="0" max="100" value={form.health} onChange={(event) => change("health", event.target.value)} /></Field>
          <Field label="Sun requirements"><input value={form.sun} onChange={(event) => change("sun", event.target.value)} /></Field>
          <Field label="Water needs"><input value={form.water} onChange={(event) => change("water", event.target.value)} /></Field>
          <Field label="Soil"><input value={form.soil} onChange={(event) => change("soil", event.target.value)} /></Field>
          <Field label="Planting date" error={errors.plantedDate}><input type="date" value={form.plantedDate} onChange={(event) => change("plantedDate", event.target.value)} /></Field>
          <Field label="Expected harvest"><input type="date" value={form.expectedHarvest} onChange={(event) => change("expectedHarvest", event.target.value)} /></Field>
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
          {plant && <EstateActionButton variant="ledger" onClick={duplicate}>Duplicate Plant</EstateActionButton>}
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
