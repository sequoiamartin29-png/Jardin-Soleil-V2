import React, { useEffect, useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import { gardenTypeOptions } from "../data/plantCatalog";
import { gardenBackupCounts, validateGardenBackup } from "../services/gardenStorage";
import EstatePage from "./EstatePage";
import "./GardenSettings.css";

const blankZone = {
  name:"",
  type:"",
  description:"",
  sunlight:"",
  soil:"",
  irrigation:"",
  notes:"",
};

const downloadJson = (data, filename) => {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function GardenSettings({ initialSection = "profile", onNavigate }) {
  const garden = useGarden();
  const [section, setSection] = useState(initialSection === "manage" ? "manage" : "profile");
  const [profileForm, setProfileForm] = useState(garden.gardenProfile);
  const [profileSaved, setProfileSaved] = useState("");
  const [zoneForm, setZoneForm] = useState(blankZone);
  const [editingZoneId, setEditingZoneId] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");
  const [importComplete, setImportComplete] = useState("");

  useEffect(() => {
    setSection(initialSection === "manage" ? "manage" : "profile");
  }, [initialSection]);

  useEffect(() => setProfileForm(garden.gardenProfile), [garden.gardenProfile]);

  const counts = useMemo(() => gardenBackupCounts(garden.exportGardenData()), [
    garden.plants,
    garden.gardenZones,
    garden.journalEntries,
    garden.tasks,
    garden.photos,
    garden.plantDiagnoses,
  ]);
  const archivedZones = garden.gardenZones.filter((zone) => zone.archived);
  const activeZones = garden.gardenZones.filter((zone) => !zone.archived);
  const archivedPlants = garden.plants.filter((plant) => plant.archived || String(plant.status || "").toLocaleLowerCase() === "archived");

  const updateProfileField = (field, value) => setProfileForm((current) => ({ ...current, [field]:value }));
  const saveProfile = (event) => {
    event.preventDefault();
    garden.updateGardenProfile({
      ...profileForm,
      gardenName:profileForm.gardenName.trim() || "My Garden",
      ownerDisplayName:profileForm.ownerDisplayName.trim(),
      locationLabel:profileForm.locationLabel.trim(),
      climateZone:profileForm.climateZone.trim(),
    });
    setProfileSaved("Garden profile saved.");
  };
  const toggleGardenType = (type) => updateProfileField(
    "gardenType",
    profileForm.gardenType.includes(type)
      ? profileForm.gardenType.filter((item) => item !== type)
      : [...profileForm.gardenType, type],
  );

  const startZone = (zone = null) => {
    setEditingZoneId(zone?.id || "");
    setZoneForm(zone ? {
      name:zone.name || "",
      type:zone.type || "",
      description:zone.description || "",
      sunlight:zone.sunlight || "",
      soil:zone.soil || "",
      irrigation:zone.irrigation || "",
      notes:zone.notes || "",
    } : blankZone);
  };
  const saveZone = (event) => {
    event.preventDefault();
    if (!zoneForm.name.trim()) return;
    if (editingZoneId) garden.updateGardenCollection(editingZoneId, { ...zoneForm, name:zoneForm.name.trim() });
    else garden.addGardenCollection({ ...zoneForm, name:zoneForm.name.trim() });
    setEditingZoneId("");
    setZoneForm(blankZone);
  };

  const exportGarden = () => {
    const backup = garden.exportGardenData();
    const safeName = (garden.gardenProfile.gardenName || "my-garden").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    downloadJson(backup, `jardin-soleil-${safeName || "garden"}-backup.json`);
  };

  const readImport = async (file) => {
    setImportError("");
    setImportPreview(null);
    setImportComplete("");
    if (!file) return;
    try {
      const candidate = JSON.parse(await file.text());
      const result = validateGardenBackup(candidate);
      if (!result.valid) throw new Error(result.error);
      setImportPreview({ ...result, fileName:file.name });
    } catch (error) {
      setImportError(error.message || "This backup could not be read.");
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    const result = garden.replaceGardenData(importPreview.state);
    if (!result.valid) {
      setImportError(result.error);
      return;
    }
    setImportComplete(`Imported ${importPreview.counts.plants} plants and ${importPreview.counts.zones} zones.`);
    setImportPreview(null);
  };

  const actionDetails = {
    clear:{
      phrase:"CLEAR MY GARDEN",
      title:"Clear My Garden",
      explanation:"Removes plants, zones, journal entries, photos, tasks, health cases, harvests, recipes, and garden activity. Your garden profile and general app preferences remain.",
      run:garden.clearGardenData,
    },
    sample:{
      phrase:"SAMPLE",
      title:"Load Sample Garden",
      explanation:"Replaces the current local garden with clearly labeled fictional sample records. Export your garden first if you want a restorable backup.",
      run:garden.loadSampleGarden,
    },
    fresh:{
      phrase:"START FRESH",
      title:"Start Fresh",
      explanation:"Leaves Sample Garden or your current garden and returns to first-run setup with a new local garden profile. Export first if you need a backup.",
      run:garden.startFreshGarden,
    },
  };
  const openConfirmation = (type) => {
    setConfirmAction(type);
    setConfirmationText("");
  };
  const runConfirmedAction = () => {
    const action = actionDetails[confirmAction];
    if (!action || confirmationText !== action.phrase) return;
    action.run();
    setConfirmAction(null);
    setConfirmationText("");
  };

  return (
    <EstatePage
      id="garden-settings-title"
      title="Garden Profile & Data"
      description="Manage the garden profile, zones, ownership boundaries, backups, sample mode, and safe reset controls in one place."
      icon="flower"
      className="js-garden-settings"
    >
      {garden.gardenProfile.sampleGardenEnabled && (
        <aside className="js-garden-settings__sample" role="status">
          <div><strong>Sample Garden</strong><span>You are exploring fictional records. Nothing here is mixed with a personal garden.</span></div>
          <button type="button" onClick={() => openConfirmation("fresh")}>Start My Own Garden</button>
        </aside>
      )}

      <div className="js-garden-settings__tabs" role="tablist" aria-label="Garden settings sections">
        <button type="button" role="tab" aria-selected={section === "profile"} className={section === "profile" ? "is-active" : ""} onClick={() => setSection("profile")}>Garden Profile</button>
        <button type="button" role="tab" aria-selected={section === "manage"} className={section === "manage" ? "is-active" : ""} onClick={() => setSection("manage")}>Manage Garden</button>
      </div>

      {section === "profile" && (
        <form className="js-estate-panel js-garden-settings__profile" onSubmit={saveProfile}>
          <header><div><p>Local garden identity</p><h2>{garden.gardenProfile.gardenName || "Your Garden"}</h2></div><span>Profile ID · {garden.gardenProfile.id}</span></header>
          <div className="js-garden-settings__grid">
            <label>Garden name<input value={profileForm.gardenName || ""} onChange={(event) => updateProfileField("gardenName", event.target.value)} required /></label>
            <label>Owner display name<input value={profileForm.ownerDisplayName || ""} onChange={(event) => updateProfileField("ownerDisplayName", event.target.value)} placeholder="Optional" /></label>
            <label>Units<select value={profileForm.units || "imperial"} onChange={(event) => updateProfileField("units", event.target.value)}><option value="imperial">Imperial</option><option value="metric">Metric</option></select></label>
            <label>Hemisphere<select value={profileForm.hemisphere || "northern"} onChange={(event) => updateProfileField("hemisphere", event.target.value)}><option value="northern">Northern</option><option value="southern">Southern</option></select></label>
            <label>Climate or hardiness zone<input value={profileForm.climateZone || ""} onChange={(event) => updateProfileField("climateZone", event.target.value)} /></label>
            <label>General location<input value={profileForm.locationLabel || ""} onChange={(event) => updateProfileField("locationLabel", event.target.value)} placeholder="Optional city or region" /></label>
          </div>
          <fieldset>
            <legend>Garden type</legend>
            <div>{gardenTypeOptions.map((type) => <label key={type} className={profileForm.gardenType.includes(type) ? "is-selected" : ""}><input type="checkbox" checked={profileForm.gardenType.includes(type)} onChange={() => toggleGardenType(type)} />{type}</label>)}</div>
          </fieldset>
          <footer><span role="status">{profileSaved}</span><button className="js-estate-button is-primary" type="submit">Save Garden Profile</button></footer>
        </form>
      )}

      {section === "manage" && (
        <div className="js-garden-settings__manage">
          <section className="js-estate-panel js-garden-settings__zones">
            <header><div><p>Garden structure</p><h2>Garden Zones</h2></div><button className="js-estate-button is-primary" type="button" onClick={() => startZone()}>Create Zone</button></header>
            {(editingZoneId || zoneForm !== blankZone) && (
              <form className="js-garden-settings__zone-form" onSubmit={saveZone}>
                <label>Zone name<input autoFocus value={zoneForm.name} onChange={(event) => setZoneForm((current) => ({ ...current, name:event.target.value }))} required /></label>
                <label>Type<input value={zoneForm.type} onChange={(event) => setZoneForm((current) => ({ ...current, type:event.target.value }))} placeholder="Raised bed, orchard, greenhouse…" /></label>
                <label>Sunlight<input value={zoneForm.sunlight} onChange={(event) => setZoneForm((current) => ({ ...current, sunlight:event.target.value }))} /></label>
                <label>Soil<input value={zoneForm.soil} onChange={(event) => setZoneForm((current) => ({ ...current, soil:event.target.value }))} /></label>
                <label>Irrigation<input value={zoneForm.irrigation} onChange={(event) => setZoneForm((current) => ({ ...current, irrigation:event.target.value }))} /></label>
                <label className="is-wide">Description<textarea rows="2" value={zoneForm.description} onChange={(event) => setZoneForm((current) => ({ ...current, description:event.target.value }))} /></label>
                <label className="is-wide">Notes<textarea rows="2" value={zoneForm.notes} onChange={(event) => setZoneForm((current) => ({ ...current, notes:event.target.value }))} /></label>
                <div><button className="js-estate-button" type="button" onClick={() => { setEditingZoneId(""); setZoneForm(blankZone); }}>Cancel</button><button className="js-estate-button is-primary" type="submit">{editingZoneId ? "Save Zone" : "Create Zone"}</button></div>
              </form>
            )}
            <div className="js-garden-settings__zone-list">
              {activeZones.length ? activeZones.map((zone, index) => <article key={zone.id}>
                <div><span>{zone.type || "Garden zone"}</span><strong>{zone.name}</strong><small>{zone.description || "No description yet."}</small></div>
                <div>
                  <button type="button" aria-label={`Move ${zone.name} earlier`} disabled={index === 0} onClick={() => garden.reorderGardenCollection(zone.id, -1)}>↑</button>
                  <button type="button" aria-label={`Move ${zone.name} later`} disabled={index === activeZones.length - 1} onClick={() => garden.reorderGardenCollection(zone.id, 1)}>↓</button>
                  <button type="button" onClick={() => startZone(zone)}>Edit</button>
                  <button type="button" onClick={() => garden.archiveGardenCollection(zone.id)}>Archive</button>
                </div>
              </article>) : <p className="js-estate-empty">No garden zones yet. Create one when you are ready to organize your growing spaces.</p>}
            </div>
            {archivedZones.length > 0 && <details className="js-garden-settings__archived"><summary>Archived zones ({archivedZones.length})</summary>{archivedZones.map((zone) => <article key={zone.id}><strong>{zone.name}</strong><div><button type="button" onClick={() => garden.restoreGardenCollection(zone.id)}>Restore</button><button className="is-danger" type="button" onClick={() => setConfirmAction(`delete-zone:${zone.id}`)}>Delete</button></div></article>)}</details>}
          </section>

          <section className="js-estate-panel js-garden-settings__data">
            <header><div><p>Garden ownership</p><h2>Garden Data</h2></div><span>{garden.gardenProfile.sampleGardenEnabled ? "Sample Garden" : "Personal Garden"}</span></header>
            <div className="js-garden-settings__counts">{Object.entries(counts).map(([key, value]) => <article key={key}><strong>{value}</strong><span>{key.replace(/([A-Z])/g, " $1")}</span></article>)}</div>
            <div className="js-garden-settings__data-actions">
              <button type="button" onClick={exportGarden}>Export My Garden</button>
              <label>Import Garden Backup<input type="file" accept="application/json,.json" onChange={(event) => readImport(event.target.files?.[0])} /></label>
              <button type="button" onClick={() => openConfirmation("sample")}>Load Sample Garden</button>
              <button type="button" onClick={() => openConfirmation("fresh")}>Start Fresh</button>
              <button className="is-danger" type="button" onClick={() => openConfirmation("clear")}>Clear My Garden</button>
            </div>
            <p className="js-garden-settings__privacy">Jardin Soleil currently stores one local garden profile in this browser. This is not a secure cloud account. Export a backup before clearing browser storage or moving devices.</p>
            {archivedPlants.length > 0 && <button className="js-estate-button" type="button" onClick={() => onNavigate?.("Archived Plants")}>Review Archived Plants ({archivedPlants.length})</button>}
            {importError && <p className="js-garden-settings__error" role="alert">{importError}</p>}
            {importComplete && <p className="js-garden-settings__success" role="status">{importComplete}</p>}
          </section>
        </div>
      )}

      {importPreview && (
        <div className="js-garden-settings__modal-backdrop">
          <section className="js-garden-settings__modal" role="alertdialog" aria-modal="true" aria-labelledby="import-preview-title">
            <p>Validated backup · {importPreview.fileName}</p>
            <h2 id="import-preview-title">Review before importing</h2>
            <div className="js-garden-settings__counts">{Object.entries(importPreview.counts).map(([key, value]) => <article key={key}><strong>{value}</strong><span>{key.replace(/([A-Z])/g, " $1")}</span></article>)}</div>
            <p>Importing replaces the current garden records. Nothing is overwritten until you confirm.</p>
            <div><button type="button" onClick={() => setImportPreview(null)}>Cancel</button><button className="is-primary" type="button" onClick={confirmImport}>Import This Backup</button></div>
          </section>
        </div>
      )}

      {confirmAction?.startsWith("delete-zone:") && (
        <div className="js-garden-settings__modal-backdrop">
          <section className="js-garden-settings__modal" role="alertdialog" aria-modal="true">
            <h2>Delete this archived zone?</h2>
            <p>The zone is removed permanently. Plants assigned to it become unassigned, but their records stay intact.</p>
            <div><button type="button" onClick={() => setConfirmAction(null)}>Cancel</button><button className="is-danger" type="button" onClick={() => { garden.deleteGardenCollection(confirmAction.split(":")[1]); setConfirmAction(null); }}>Delete Zone</button></div>
          </section>
        </div>
      )}

      {actionDetails[confirmAction] && (
        <div className="js-garden-settings__modal-backdrop">
          <section className="js-garden-settings__modal" role="alertdialog" aria-modal="true" aria-labelledby="garden-confirm-title">
            <p>Protected action</p>
            <h2 id="garden-confirm-title">{actionDetails[confirmAction].title}</h2>
            <p>{actionDetails[confirmAction].explanation}</p>
            <label>Type <strong>{actionDetails[confirmAction].phrase}</strong> to confirm<input autoFocus value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} /></label>
            <div><button type="button" onClick={() => setConfirmAction(null)}>Cancel</button><button className="is-danger" type="button" disabled={confirmationText !== actionDetails[confirmAction].phrase} onClick={runConfirmedAction}>Confirm</button></div>
          </section>
        </div>
      )}
    </EstatePage>
  );
}
