import React, { useEffect, useId, useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import { gardenZoneOptions, plantCategories, plantCollections, plantGroups, plantStatuses, suggestPlantGroup, validateAndNormalizePlant } from "../utils/plantMutations";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./PlantSelectorWithCreate.css";

const blankFor = (expectedCollection, expectedZone) => ({
  name:"", category:"Other / Uncategorized", group:"Other / Uncategorized", type:"Generic Plant",
  collection:expectedCollection || "Other / Uncategorized", gardenZone:expectedZone || expectedCollection || "", status:"Active",
  variety:"", botanicalName:"", location:"", plantingDate:"", notes:"", iconType:"generic-plant",
});
const normalize = (value) => String(value || "").toLocaleLowerCase().trim().replace(/\s+/g, " ");
const searchablePlantText = (plant) => [plant.name, plant.nickname, plant.variety, plant.botanicalName, plant.type, plant.group, plant.collection, plant.gardenZone].filter(Boolean).join(" ").toLocaleLowerCase();
const fileToDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });

export default function PlantSelectorWithCreate({
  value = "", onChange, label = "Plant", required = false, emptyLabel = "No plant selected",
  expectedCollection = "", expectedZone = "", description = "", disabled = false,
  createLabel = "+ Create New Plant", createTitle = "Create New Plant",
}) {
  const { plants, activePlants, addPlant, addPhotos, gardenCollections } = useGarden();
  const listId = useId().replace(/:/g, "-");
  const selected = plants.find((plant) => plant.id === value);
  const [query, setQuery] = useState(selected?.name || "");
  const [open, setOpen] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(() => blankFor(expectedCollection, expectedZone));
  const [errors, setErrors] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);

  useEffect(() => { if (!open) setQuery(selected?.name || ""); }, [selected?.name, open]);
  const options = useMemo(() => {
    const source = includeArchived ? plants : activePlants;
    const needle = normalize(query);
    return source.filter((plant) => !needle || searchablePlantText(plant).includes(needle))
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity:"base" }));
  }, [plants, activePlants, includeArchived, query]);

  const choose = (plant) => {
    const expected = normalize(expectedCollection || expectedZone);
    const current = normalize(plant.collection || plant.gardenZone);
    if (expected && current && current !== expected) { setPendingMove(plant); setOpen(false); return; }
    onChange?.(plant.id, plant);
    setQuery(plant.name); setOpen(false); setCreating(false); setPendingMove(null);
  };
  const confirmMove = () => {
    if (!pendingMove) return;
    onChange?.(pendingMove.id, pendingMove);
    setQuery(pendingMove.name); setPendingMove(null); setCreating(false);
  };
  const startCreate = () => {
    setDraft(blankFor(expectedCollection, expectedZone)); setErrors({}); setDuplicates([]); setPhoto(null);
    setCreating(true); setOpen(false); setPendingMove(null);
  };
  const updateDraft = (field, value) => setDraft((current) => {
    const next = { ...current, [field]:value };
    if (field === "type" || field === "category") next.group = suggestPlantGroup(next);
    return next;
  });
  const savePlant = async (event) => {
    event?.preventDefault();
    const result = validateAndNormalizePlant(draft, plants);
    setErrors(result.errors); setDuplicates(result.duplicates);
    if (!result.valid || result.duplicates.length) return;
    const record = { ...result.record, status:result.record.status || "Active" };
    addPlant(record);
    if (photo) {
      const src = await fileToDataUrl(photo);
      addPhotos([{ id:`${record.id}-photo-${Date.now()}`, plantId:record.id, name:photo.name, src, date:new Date().toISOString() }]);
    }
    choose(record);
  };
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.min(options.length - 1, index + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(0, index - 1)); }
    else if (event.key === "Enter" && open && options[activeIndex]) { event.preventDefault(); choose(options[activeIndex]); }
    else if (event.key === "Escape") { setOpen(false); setCreating(false); setPendingMove(null); }
  };
  const collectionOptions = [...new Set([...plantCollections, ...gardenCollections.map((item) => item.name)])];
  const zoneOptions = [...new Set([...gardenZoneOptions, ...gardenCollections.map((item) => item.name)])];

  return <div className="js-plant-combobox">
    <label htmlFor={`${listId}-input`}><span>{label}{required ? " *" : ""}</span>{description && <small>{description}</small>}</label>
    <div className="js-plant-combobox__control">
      <input id={`${listId}-input`} role="combobox" aria-expanded={open} aria-controls={`${listId}-listbox`} aria-autocomplete="list" aria-activedescendant={open && options[activeIndex] ? `${listId}-${options[activeIndex].id}` : undefined} value={query} placeholder={emptyLabel} disabled={disabled} required={required && !value} onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }} onKeyDown={handleKeyDown} />
      {value && <button type="button" aria-label={`Clear ${label}`} onClick={() => { onChange?.("", null); setQuery(""); setOpen(false); }}>×</button>}
    </div>
    {open && <div className="js-plant-combobox__popover" id={`${listId}-listbox`} role="listbox" aria-label={`${label} options`}>
      <label className="js-plant-combobox__archived"><input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} /> Include archived</label>
      <div className="js-plant-combobox__options">{options.length ? options.map((plant, index) => <button id={`${listId}-${plant.id}`} role="option" aria-selected={plant.id === value} className={index === activeIndex ? "is-active" : ""} type="button" key={plant.id} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(plant)}><BotanicalIcon plant={plant} size="sm" decorative /><span><strong>{plant.name}</strong>{plant.nickname && <em>{plant.nickname}</em>}<small>{plant.collection || plant.gardenZone || "Unassigned"} · {plant.group || plant.type || "Uncategorized"}{plant.archived ? " · Archived" : ""}</small></span></button>) : <p>No plants match this search.</p>}</div>
      <button className="js-plant-combobox__create" type="button" onClick={startCreate}>{createLabel}</button>
    </div>}
    {pendingMove && <div className="js-plant-combobox__confirm" role="alert"><strong>Move {pendingMove.name}?</strong><p>This plant is currently assigned to {pendingMove.collection || pendingMove.gardenZone}. Saving the parent form will move the same stable record to {expectedCollection || expectedZone}; no duplicate will be created.</p><div><button type="button" onClick={() => setPendingMove(null)}>Cancel</button><button type="button" onClick={confirmMove}>Select and Move</button></div></div>}
    {creating && <section className="js-plant-inline-create" aria-label="Create new plant inline">
      <header><BotanicalIcon type={draft.iconType || "generic-plant"} size="md" decorative /><div><p>Jardin Soleil Registry</p><h3>{createTitle}</h3></div><button type="button" aria-label="Close create plant form" onClick={() => setCreating(false)}>×</button></header>
      <div className="js-plant-inline-create__grid"><Field label="Plant name" error={errors.name}><input autoFocus value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></Field><Field label="Plant type" error={errors.type}><input value={draft.type} onChange={(event) => updateDraft("type", event.target.value)} /></Field><Field label="Category" error={errors.category}><select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)}>{plantCategories.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Group"><select value={draft.group} onChange={(event) => updateDraft("group", event.target.value)}>{plantGroups.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Collection"><select value={draft.collection} onChange={(event) => updateDraft("collection", event.target.value)}>{collectionOptions.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Garden zone"><select value={draft.gardenZone} onChange={(event) => updateDraft("gardenZone", event.target.value)}><option value="">Unassigned</option>{zoneOptions.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Status"><select value={draft.status} onChange={(event) => updateDraft("status", event.target.value)}>{plantStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field></div>
      <details><summary>Optional plant details</summary><div className="js-plant-inline-create__grid"><Field label="Variety or cultivar"><input value={draft.variety} onChange={(event) => updateDraft("variety", event.target.value)} /></Field><Field label="Botanical name"><input value={draft.botanicalName} onChange={(event) => updateDraft("botanicalName", event.target.value)} /></Field><Field label="Specific location"><input value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} /></Field><Field label="Planting date"><input type="date" value={draft.plantingDate} onChange={(event) => updateDraft("plantingDate", event.target.value)} /></Field><Field label="Icon"><input value={draft.iconType} onChange={(event) => updateDraft("iconType", event.target.value)} /></Field><Field label="Photo"><input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} /></Field><Field label="Notes" wide><textarea rows="3" value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} /></Field></div></details>
      {duplicates.length > 0 && <aside className="js-plant-inline-create__duplicates" role="alert"><strong>Possible existing plant found</strong><p>Choose the matching record instead of creating a duplicate.</p>{duplicates.map((plant) => <button type="button" key={plant.id} onClick={() => choose(plant)}>Use {plant.name}</button>)}</aside>}
      <footer><button type="button" onClick={() => setCreating(false)}>Cancel</button><button type="button" onClick={savePlant}>Create and Select Plant</button></footer>
    </section>}
  </div>;
}

function Field({ label, error, wide, children }) { return <label className={wide ? "is-wide" : ""}><span>{label}</span>{children}{error && <small role="alert">{error}</small>}</label>; }
