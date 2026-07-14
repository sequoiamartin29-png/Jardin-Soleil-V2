import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import { getPlantDirectoryGroup, normalizePlantText } from "../utils/plantClassification";
import BotanicalIcon from "./icons/BotanicalIcon";
import EstatePage from "./EstatePage";
import PlantSelectorWithCreate from "./PlantSelectorWithCreate";
import "./Garden.css";

const belongsToCollection = (plant, collection, collections) => {
  const names = [collection.name, collection.label].map(normalizePlantText);
  const explicitZone = normalizePlantText(plant.gardenZone);
  const knownZoneNames = new Set(collections.flatMap((item) => [normalizePlantText(item.name), normalizePlantText(item.label)]));
  if (explicitZone && knownZoneNames.has(explicitZone)) return names.includes(explicitZone);
  const explicitCollection = normalizePlantText(plant.collection);
  if (explicitCollection && knownZoneNames.has(explicitCollection)) return names.includes(explicitCollection);
  if (collection.matchType) return normalizePlantText(`${plant.type || ""} ${plant.name || ""}`).includes(normalizePlantText(collection.matchType));
  if (collection.directoryGroup === "Vegetables" && /melon/i.test(`${plant.type || ""} ${plant.name || ""}`)) return false;
  return getPlantDirectoryGroup(plant) === collection.directoryGroup;
};

export default function Garden({ onAddPlant, onSelectPlant, onEditPlant }) {
  const { activePlants, stats, gardenCollections, updateGardenCollection, assignPlantToCollection } = useGarden();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", description:"", label:"" });
  const [action, setAction] = useState(null);
  const [selection, setSelection] = useState({ plantId:"", targetId:"" });
  const [expanded, setExpanded] = useState(() => new Set());

  const sections = useMemo(() => gardenCollections.map((collection) => ({
    ...collection,
    plants:activePlants.filter((plant) => belongsToCollection(plant, collection, gardenCollections))
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity:"base" })),
  })), [activePlants, gardenCollections]);

  const startEdit = (collection) => {
    setEditing(collection.id);
    setForm({ name:collection.name, description:collection.description || "", label:collection.label || "" });
    setAction(null);
  };
  const saveCollection = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    updateGardenCollection(editing, { name, description:form.description.trim(), label:form.label.trim() });
    setEditing(null);
  };
  const openAction = (mode, collectionId) => {
    setAction({ mode, collectionId });
    setSelection({ plantId:"", targetId:"" });
    setEditing(null);
  };
  const saveAssignment = (event) => {
    event.preventDefault();
    if (!selection.plantId) return;
    const targetId = action.mode === "move" ? selection.targetId : action.collectionId;
    if (!targetId) return;
    assignPlantToCollection(selection.plantId, targetId);
    setAction(null);
  };
  const toggleExpanded = (id) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <EstatePage id="garden-collections-title" title="Garden Collections" description="Five editable garden rooms, each linked to the canonical plant registry." icon="flower" className="js-garden-collections" actions={<button className="js-estate-button is-primary" type="button" onClick={onAddPlant}>Add New Plant</button>}>
      <div className="js-estate-toolbar">
        <p><strong>{stats.edibleHerbCount}</strong> edibles & herbs · <strong>{stats.gardenZoneCount}</strong> garden zones</p>
        <span className="js-estate-badge is-gold">Assignments update without duplicating plants</span>
      </div>
      <div className="js-garden-collections__grid">
        {sections.map((section) => (
          <article className="js-estate-card js-collection-card" key={section.id}>
            <header>
              <BotanicalIcon type={section.directoryGroup === "Herbs" ? "tea" : section.directoryGroup === "Vegetables" ? "vegetable" : "flower"} size="lg" decorative />
              <div><p>{section.label || "Estate collection"}</p><h2>{section.name}</h2><span>{section.description || "Description not recorded."}</span></div>
            </header>
            <p className="js-collection-card__count"><strong>{section.plants.length}</strong> {section.plants.length === 1 ? "plant" : "plants"}</p>
            <div className="js-collection-card__actions">
              <button type="button" onClick={() => startEdit(section)}>Edit Collection</button>
              <button type="button" onClick={() => openAction("add", section.id)}>Add Plant</button>
              <button type="button" onClick={() => openAction("move", section.id)} disabled={!section.plants.length}>Move Plant</button>
              <button type="button" aria-expanded={expanded.has(section.id)} onClick={() => toggleExpanded(section.id)}>View Plants</button>
            </div>
            {editing === section.id && (
              <form className="js-estate-form js-collection-card__editor" onSubmit={saveCollection}>
                <label>Zone name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name:event.target.value }))} required /></label>
                <label>Card label<input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label:event.target.value }))} /></label>
                <label className="is-wide">Description<textarea rows="3" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description:event.target.value }))} /></label>
                <div className="js-collection-card__form-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button type="submit">Save Collection</button></div>
              </form>
            )}
            {action?.collectionId === section.id && (
              <form className="js-collection-card__editor" onSubmit={saveAssignment}>
                <PlantSelectorWithCreate label={action.mode === "move" ? "Plant to move" : "Plant to assign"} value={selection.plantId} onChange={(plantId) => setSelection((current) => ({ ...current, plantId }))} expectedCollection={action.mode === "add" ? section.name : ""} expectedZone={action.mode === "add" ? section.name : ""} required description="Search every canonical plant or create a missing record without closing this collection." />
                {action.mode === "move" && <label>Destination<select value={selection.targetId} onChange={(event) => setSelection((current) => ({ ...current, targetId:event.target.value }))} required><option value="">Choose a collection</option>{gardenCollections.filter((item) => item.id !== section.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
                <div className="js-collection-card__form-actions"><button type="button" onClick={() => setAction(null)}>Cancel</button><button type="submit">{action.mode === "move" ? "Move Plant" : "Add to Collection"}</button></div>
              </form>
            )}
            {expanded.has(section.id) && (
              <div className="js-collection-card__plants">
                {section.plants.length ? section.plants.map((plant) => <article key={plant.id}><BotanicalIcon plant={plant} size="sm" decorative /><button type="button" onClick={() => onSelectPlant?.(plant)}>{plant.name}</button><button type="button" onClick={() => onEditPlant?.(plant)}>Edit</button></article>) : <p className="js-estate-empty">No plants are assigned to this collection.</p>}
              </div>
            )}
          </article>
        ))}
      </div>
    </EstatePage>
  );
}
