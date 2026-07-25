import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { demoGardenData } from "../data/demoGardenData";
import {
  createEmptyGardenState,
  createGardenProfile,
  loadGardenState,
  makeGardenBackup,
  saveGardenState,
  validateGardenBackup,
} from "../services/gardenStorage";
import {
  countUniquePlants,
  getMintVarietyNames,
  getUniqueGardenBeds,
  isEdibleOrHerbPlant,
  isOrchardFruitTree,
} from "../utils/plantClassification";
import { preserveDeletedPlantReference } from "../utils/plantMutations";
import { buildBuddyJournalEntry, careActionTypes, isTeaHarvestPlant } from "../utils/buildBulkCareEvents";
import { isTaskDueOn, localDateKey } from "../utils/localDate";

const GardenContext = createContext(null);

const createStableId = (prefix) => (
  globalThis.crypto?.randomUUID
    ? `${prefix}-${globalThis.crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
);

const asArray = (value) => Array.isArray(value) ? value : [];
const normalizePlantName = (value) => String(value || "").trim().toLocaleLowerCase();
const withProfile = (record, profileId) => ({ ...record, gardenProfileId:profileId });

const normalizeJournalEntry = (entry, index = 0) => {
  const createdAt = entry.createdAt || entry.timestamp || entry.date || new Date().toISOString();
  return {
    ...entry,
    id:entry.id || `journal-${index}-${String(createdAt).replace(/[^0-9]/g, "")}`,
    createdAt,
    date:entry.date || String(createdAt).slice(0, 10),
    title:entry.title || entry.type || "Garden note",
    type:entry.type || entry.entryType || "Note",
    notes:entry.notes || entry.observations || entry.description || "",
    observations:entry.observations || entry.notes || "",
    gardenZone:entry.gardenZone || entry.zone || "",
    plantId:entry.plantId || entry.linkedPlantId || "",
    favorite:Boolean(entry.favorite || entry.isFavorite),
    legacySource:entry.legacySource || entry.source || "Journal",
  };
};

const normalizePlantIdentification = (identification) => {
  const createdAt = identification.createdAt || identification.date || new Date().toISOString();
  return {
    ...identification,
    id:identification.id || createStableId("plant-identification"),
    date:identification.date || createdAt.slice(0, 10),
    photoIds:asArray(identification.photoIds),
    traits:identification.traits && typeof identification.traits === "object" ? identification.traits : {},
    matches:asArray(identification.matches).slice(0, 5),
    selectedMatch:identification.selectedMatch || null,
    confidence:identification.confidence || identification.selectedMatch?.confidence || "Low",
    notes:identification.notes || "",
    location:identification.location && typeof identification.location === "object" ? identification.location : {},
    verificationStatus:identification.verificationStatus || "Unconfirmed",
    expertReview:identification.expertReview && typeof identification.expertReview === "object" ? identification.expertReview : {},
    sourceMode:identification.sourceMode || "Local deterministic field key",
    createdAt,
    updatedAt:identification.updatedAt || createdAt,
  };
};

const normalizePlantDiagnosis = (diagnosis) => {
  const createdAt = diagnosis.createdAt || diagnosis.date || new Date().toISOString();
  return {
    ...diagnosis,
    id:diagnosis.id || createStableId("plant-diagnosis"),
    plantId:diagnosis.plantId || "",
    date:diagnosis.date || createdAt.slice(0, 10),
    affectedArea:diagnosis.affectedArea || "whole plant",
    symptoms:asArray(diagnosis.symptoms),
    pestEvidence:asArray(diagnosis.pestEvidence),
    recentConditions:asArray(diagnosis.recentConditions),
    photoIds:asArray(diagnosis.photoIds),
    rankedPossibilities:asArray(diagnosis.rankedPossibilities),
    treatmentPlan:asArray(diagnosis.treatmentPlan),
    followUps:asArray(diagnosis.followUps),
    workingDiagnosis:diagnosis.workingDiagnosis || diagnosis.rankedPossibilities?.[0]?.name || "Unconfirmed",
    confidence:diagnosis.confidence || "Low",
    status:diagnosis.status || "Unconfirmed",
    initialStatus:diagnosis.initialStatus || diagnosis.status || "Unconfirmed",
    notes:diagnosis.notes || "",
    followUpDate:diagnosis.followUpDate || "",
    sourceMode:diagnosis.sourceMode || "Local deterministic analysis",
    createdAt,
    updatedAt:diagnosis.updatedAt || createdAt,
  };
};

const normalizeInventoryItem = (item) => ({
  ...item,
  id:item.id || createStableId("inventory"),
  name:String(item.name || "").trim(),
  category:String(item.category || "Other").trim() || "Other",
  quantity:item.quantity === "" || item.quantity === null || item.quantity === undefined ? "" : Number(item.quantity),
  unit:String(item.unit || "").trim(),
  status:String(item.status || "In stock").trim(),
  location:String(item.location || "").trim(),
  lowThreshold:item.lowThreshold === "" || item.lowThreshold === null || item.lowThreshold === undefined ? "" : Number(item.lowThreshold),
  notes:String(item.notes || "").trim(),
  plantId:item.plantId || "",
  createdAt:item.createdAt || new Date().toISOString(),
  updatedAt:item.updatedAt || new Date().toISOString(),
});

const normalizeTeaRecipe = (recipe) => ({
  ...recipe,
  id:recipe.id || createStableId("tea-recipe"),
  name:String(recipe.name || "").trim(),
  description:String(recipe.description || recipe.subtitle || "").trim(),
  subtitle:String(recipe.subtitle || recipe.description || "").trim(),
  ingredients:asArray(recipe.ingredients).map((ingredient) => (
    typeof ingredient === "string"
      ? { name:ingredient, amount:"" }
      : { name:String(ingredient.name || "").trim(), amount:String(ingredient.amount || "").trim() }
  )).filter((ingredient) => ingredient.name),
  flavorProfile:asArray(recipe.flavorProfile),
  wellnessBenefits:asArray(recipe.wellnessBenefits),
  brewing:{ temperature:"", steepTime:"", serving:"", ...(recipe.brewing || {}) },
  inventory:{ quantity:"", unit:"", ...(recipe.inventory || {}) },
  linkedPlantIds:[...new Set(asArray(recipe.linkedPlantIds).filter(Boolean))],
  favorite:Boolean(recipe.favorite),
  archived:Boolean(recipe.archived),
  createdAt:recipe.createdAt || new Date().toISOString(),
  updatedAt:recipe.updatedAt || new Date().toISOString(),
});

const quantityOf = (plant) => {
  const quantity = Number(plant.quantity);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

const stateFromDemo = () => validateGardenBackup({
  ...createEmptyGardenState(demoGardenData.profile),
  ...demoGardenData,
  profile:demoGardenData.profile,
}).state;

export function GardenProvider({ children }) {
  const [initialState] = useState(loadGardenState);
  const [gardenProfile, setGardenProfile] = useState(initialState.profile);
  const [onboardingDraft, setOnboardingDraft] = useState(initialState.onboardingDraft);
  const [plants, setPlants] = useState(initialState.plants);
  const [zones, setZones] = useState(initialState.zones);
  const [journalEntries, setJournalEntries] = useState(() => initialState.journalEntries.map(normalizeJournalEntry));
  const [photos, setPhotos] = useState(initialState.photos);
  const [plantDiagnoses, setPlantDiagnoses] = useState(() => initialState.healthCases.map(normalizePlantDiagnosis));
  const [plantIdentifications, setPlantIdentifications] = useState(() => initialState.plantIdentifications.map(normalizePlantIdentification));
  const [teaWorkflows, setTeaWorkflows] = useState(initialState.teaWorkflows);
  const [tasks, setTasks] = useState(initialState.tasks);
  const [lastTaskRefreshDate, setLastTaskRefreshDate] = useState(initialState.lastTaskRefreshDate || "");
  const [buddyGardenLogs, setBuddyGardenLogs] = useState(initialState.buddyGardenLogs);
  const [inventoryItems, setInventoryItems] = useState(() => initialState.inventoryItems.map(normalizeInventoryItem));
  const [teaRecipes, setTeaRecipes] = useState(() => initialState.teaRecipes.map(normalizeTeaRecipe));
  const [calendarEntries, setCalendarEntries] = useState(initialState.calendarEntries);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [pendingPlantDeletions, setPendingPlantDeletions] = useState([]);
  const deletionTimers = useRef(new Map());

  const pendingDeletionIds = useMemo(
    () => new Set(pendingPlantDeletions.map((item) => item.plantId)),
    [pendingPlantDeletions],
  );
  const activePlants = useMemo(
    () => plants.filter((plant) => (
      !plant.archived
      && !["archived", "removed"].includes(String(plant.status || "").toLocaleLowerCase())
      && !pendingDeletionIds.has(plant.id)
    )),
    [plants, pendingDeletionIds],
  );
  const gardenCollections = useMemo(() => zones.filter((zone) => !zone.archived), [zones]);

  const gardenState = useMemo(() => ({
    schemaVersion:2,
    profile:gardenProfile,
    onboardingDraft,
    plants,
    zones,
    journalEntries,
    photos,
    healthCases:plantDiagnoses,
    plantIdentifications,
    teaWorkflows,
    tasks,
    lastTaskRefreshDate,
    buddyGardenLogs,
    inventoryItems,
    teaRecipes,
    calendarEntries,
    migratedFromLegacyAt:initialState.migratedFromLegacyAt || null,
  }), [
    gardenProfile, onboardingDraft, plants, zones, journalEntries, photos, plantDiagnoses,
    plantIdentifications, teaWorkflows, tasks, lastTaskRefreshDate, buddyGardenLogs,
    inventoryItems, teaRecipes, calendarEntries, initialState.migratedFromLegacyAt,
  ]);

  useEffect(() => {
    saveGardenState(gardenState);
  }, [gardenState]);

  useEffect(() => () => deletionTimers.current.forEach((timer) => clearTimeout(timer)), []);

  const applyGardenState = (nextState) => {
    const result = validateGardenBackup(nextState);
    if (!result.valid) return result;
    const next = result.state;
    setGardenProfile(next.profile);
    setOnboardingDraft(next.onboardingDraft);
    setPlants(next.plants);
    setZones(next.zones);
    setJournalEntries(next.journalEntries.map(normalizeJournalEntry));
    setPhotos(next.photos);
    setPlantDiagnoses(next.healthCases.map(normalizePlantDiagnosis));
    setPlantIdentifications(next.plantIdentifications.map(normalizePlantIdentification));
    setTeaWorkflows(next.teaWorkflows);
    setTasks(next.tasks);
    setLastTaskRefreshDate(next.lastTaskRefreshDate || "");
    setBuddyGardenLogs(next.buddyGardenLogs);
    setInventoryItems(next.inventoryItems.map(normalizeInventoryItem));
    setTeaRecipes(next.teaRecipes.map(normalizeTeaRecipe));
    setCalendarEntries(next.calendarEntries);
    setSelectedPlant(null);
    return result;
  };

  const updateGardenProfile = (updates) => {
    setGardenProfile((current) => createGardenProfile({
      ...current,
      ...(typeof updates === "function" ? updates(current) : updates),
      id:current.id,
      createdAt:current.createdAt,
    }));
  };

  const updateOnboardingDraft = (updates) => {
    setOnboardingDraft((current) => ({
      ...current,
      ...(typeof updates === "function" ? updates(current) : updates),
    }));
  };

  const completeOnboarding = ({ profile, zones:nextZones = [], plants:nextPlants = [] }) => {
    const completedProfile = createGardenProfile({
      ...gardenProfile,
      ...profile,
      id:gardenProfile.id,
      createdAt:gardenProfile.createdAt,
      onboardingCompleted:true,
      sampleGardenEnabled:false,
    });
    const now = new Date().toISOString();
    setGardenProfile(completedProfile);
    setZones(nextZones.map((zone, index) => withProfile({
      id:zone.id || createStableId(`zone-${index + 1}`),
      name:zone.name,
      type:zone.type || "Garden zone",
      description:zone.description || "",
      sunlight:zone.sunlight || "",
      soil:zone.soil || "",
      irrigation:zone.irrigation || "",
      notes:zone.notes || "",
      createdAt:zone.createdAt || now,
      archived:false,
    }, completedProfile.id)));
    setPlants(nextPlants.map((plant, index) => withProfile({
      id:plant.id || createStableId(`plant-${index + 1}`),
      name:plant.name || plant.commonName,
      commonName:plant.commonName || plant.name,
      botanicalName:plant.botanicalName || "",
      type:plant.type || plant.commonName || "Plant",
      category:plant.category || "Other",
      variety:plant.variety || "",
      quantity:Number(plant.quantity) > 0 ? Number(plant.quantity) : 1,
      zoneId:plant.zoneId || "",
      gardenZone:plant.gardenZone || "",
      plantingMethod:plant.plantingMethod || "Unknown",
      plantedDate:plant.plantedDate || "",
      expectedHarvest:plant.expectedHarvest || "",
      sunlight:plant.sunlight || "",
      watering:plant.watering || "",
      soil:plant.soil || "",
      status:plant.status || "Active",
      healthStatus:plant.healthStatus || "Not recorded",
      notes:plant.notes || "",
      photos:asArray(plant.photos),
      createdAt:plant.createdAt || now,
      updatedAt:now,
    }, completedProfile.id)));
    setOnboardingDraft({ step:0, mode:"", profile:{}, zones:[], plants:[] });
  };

  const loadSampleGarden = () => applyGardenState(stateFromDemo());
  const startFreshGarden = () => applyGardenState(createEmptyGardenState({
    units:gardenProfile.units,
    hemisphere:gardenProfile.hemisphere,
  }));
  const clearGardenData = () => applyGardenState({
    ...createEmptyGardenState({
      ...gardenProfile,
      onboardingCompleted:true,
      sampleGardenEnabled:false,
    }),
    profile:createGardenProfile({
      ...gardenProfile,
      onboardingCompleted:true,
      sampleGardenEnabled:false,
    }),
  });
  const replaceGardenData = (candidate) => applyGardenState(candidate);
  const exportGardenData = () => makeGardenBackup(gardenState);

  const addJournalEntry = (entry) => {
    const next = withProfile({
      id:createStableId("journal"),
      createdAt:new Date().toISOString(),
      ...entry,
    }, gardenProfile.id);
    setJournalEntries((current) => [normalizeJournalEntry(next), ...current]);
    if (entry.plantId && entry.health) {
      setPlants((current) => current.map((plant) => (
        plant.id === entry.plantId ? { ...plant, health:Number(entry.health), status:entry.type } : plant
      )));
    }
    return next;
  };
  const updateJournalEntry = (entryId, updates) => setJournalEntries((current) => current.map((entry) => (
    entry.id === entryId ? { ...entry, ...updates, updatedAt:new Date().toISOString() } : entry
  )));
  const deleteJournalEntry = (entryId) => setJournalEntries((current) => current.filter((entry) => entry.id !== entryId));

  const addPhotos = (newPhotos) => {
    const scoped = newPhotos.map((photo) => withProfile({
      id:photo.id || createStableId("photo"),
      date:photo.date || new Date().toISOString(),
      ...photo,
    }, gardenProfile.id));
    setPhotos((current) => [...scoped, ...current]);
    return scoped;
  };
  const deletePhoto = (photoId) => setPhotos((current) => current.filter((photo) => photo.id !== photoId));

  const addPlantDiagnosis = (diagnosis) => {
    const next = withProfile(normalizePlantDiagnosis({
      ...diagnosis,
      id:createStableId("plant-diagnosis"),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    }), gardenProfile.id);
    setPlantDiagnoses((current) => [next, ...current]);
    return next;
  };
  const updatePlantDiagnosis = (diagnosisId, updates) => setPlantDiagnoses((current) => current.map((diagnosis) => {
    if (diagnosis.id !== diagnosisId) return diagnosis;
    const patch = typeof updates === "function" ? updates(diagnosis) : updates;
    const reviewWasExplicitlyUpdated = Object.prototype.hasOwnProperty.call(patch, "alertReviewedAt")
      || Object.prototype.hasOwnProperty.call(patch, "acknowledgedAt");
    const statusChanged = patch.status && patch.status !== diagnosis.status;
    return normalizePlantDiagnosis({
      ...diagnosis,
      ...patch,
      ...(!reviewWasExplicitlyUpdated && statusChanged && patch.status !== "Resolved"
        ? { alertReviewedAt:null, acknowledgedAt:null }
        : {}),
      id:diagnosis.id,
      createdAt:diagnosis.createdAt,
      updatedAt:new Date().toISOString(),
    });
  }));
  const addDiagnosisFollowUp = (diagnosisId, followUp) => {
    const next = { id:createStableId("diagnosis-follow-up"), createdAt:new Date().toISOString(), ...followUp };
    updatePlantDiagnosis(diagnosisId, (diagnosis) => ({
      ...diagnosis,
      status:followUp.status || diagnosis.status,
      resolvedAt:followUp.status === "Resolved" ? next.createdAt : diagnosis.resolvedAt,
      ...(followUp.status === "Resolved" ? {} : { alertReviewedAt:null, acknowledgedAt:null }),
      followUps:[next, ...(diagnosis.followUps || [])],
    }));
    return next;
  };
  const deletePlantDiagnosis = (diagnosisId) => setPlantDiagnoses((current) => current.filter((diagnosis) => diagnosis.id !== diagnosisId));

  const addPlantIdentification = (identification) => {
    const next = withProfile(normalizePlantIdentification({
      ...identification,
      id:createStableId("plant-identification"),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    }), gardenProfile.id);
    setPlantIdentifications((current) => [next, ...current]);
    return next;
  };
  const updatePlantIdentification = (identificationId, updates) => {
    let updated = null;
    setPlantIdentifications((current) => current.map((identification) => {
      if (identification.id !== identificationId) return identification;
      const patch = typeof updates === "function" ? updates(identification) : updates;
      updated = normalizePlantIdentification({ ...identification, ...patch, id:identification.id, createdAt:identification.createdAt, updatedAt:new Date().toISOString() });
      return updated;
    }));
    return updated;
  };
  const deletePlantIdentification = (identificationId) => setPlantIdentifications((current) => current.filter((item) => item.id !== identificationId));

  const addTeaWorkflow = (workflow) => {
    const next = withProfile({ id:createStableId("tea-workflow"), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), ...workflow }, gardenProfile.id);
    setTeaWorkflows((current) => [next, ...current]);
    return next;
  };
  const updateTeaWorkflow = (workflowId, updates) => setTeaWorkflows((current) => current.map((workflow) => (
    workflow.id === workflowId ? { ...workflow, ...updates, updatedAt:new Date().toISOString() } : workflow
  )));
  const deleteTeaWorkflow = (workflowId) => setTeaWorkflows((current) => current.filter((workflow) => workflow.id !== workflowId));

  const addGardenCollection = (zone) => {
    const next = withProfile({
      id:zone.id || createStableId("zone"),
      name:String(zone.name || "").trim(),
      type:zone.type || "Garden zone",
      description:zone.description || "",
      sunlight:zone.sunlight || "",
      soil:zone.soil || "",
      irrigation:zone.irrigation || "",
      notes:zone.notes || "",
      createdAt:zone.createdAt || new Date().toISOString(),
      archived:false,
    }, gardenProfile.id);
    setZones((current) => [...current, next]);
    return next;
  };
  const updateGardenCollection = (collectionId, updates) => {
    const currentCollection = zones.find((collection) => collection.id === collectionId);
    if (currentCollection && updates.name && updates.name !== currentCollection.name) {
      setPlants((current) => current.map((plant) => (
        plant.zoneId === collectionId
        || normalizePlantName(plant.gardenZone) === normalizePlantName(currentCollection.name)
          ? { ...plant, zoneId:collectionId, gardenZone:updates.name }
          : plant
      )));
    }
    setZones((current) => current.map((collection) => (
      collection.id === collectionId ? { ...collection, ...updates, updatedAt:new Date().toISOString() } : collection
    )));
  };
  const reorderGardenCollection = (collectionId, direction) => setZones((current) => {
    const index = current.findIndex((zone) => zone.id === collectionId);
    const nextIndex = Math.max(0, Math.min(current.length - 1, index + direction));
    if (index < 0 || nextIndex === index) return current;
    const next = [...current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    return next;
  });
  const archiveGardenCollection = (collectionId) => updateGardenCollection(collectionId, { archived:true, archivedAt:new Date().toISOString() });
  const restoreGardenCollection = (collectionId) => updateGardenCollection(collectionId, { archived:false, archivedAt:null });
  const deleteGardenCollection = (collectionId) => {
    setZones((current) => current.filter((zone) => zone.id !== collectionId));
    setPlants((current) => current.map((plant) => (
      plant.zoneId === collectionId ? { ...plant, zoneId:"", gardenZone:"" } : plant
    )));
  };
  const assignPlantToCollection = (plantId, collectionId) => {
    const collection = zones.find((item) => item.id === collectionId);
    if (collection) updatePlant(plantId, { zoneId:collection.id, collection:collection.name, gardenZone:collection.name });
  };

  const addTask = (task) => {
    const next = withProfile({ id:createStableId("task"), completed:false, createdAt:new Date().toISOString(), ...task }, gardenProfile.id);
    setTasks((current) => [next, ...current]);
    return next;
  };
  const updateTask = (taskId, updates) => setTasks((current) => current.map((task) => (
    task.id === taskId ? { ...task, ...updates, updatedAt:new Date().toISOString() } : task
  )));
  const deleteTask = (taskId) => setTasks((current) => current.filter((task) => task.id !== taskId));
  const refreshDailyTasks = (date = new Date()) => {
    const dateKey = localDateKey(date);
    const existing = new Set(tasks.map((task) => String(task.id)));
    const templates = tasks.filter((task) => task.isTemplate || task.kind === "template");
    const occurrences = templates.filter((template) => isTaskDueOn(template, date)).flatMap((template) => {
      const id = `${template.id}__${dateKey}`;
      return existing.has(id) ? [] : [{ ...template, id, templateId:template.id, kind:"occurrence", isTemplate:false, dueDate:dateKey, completed:false, completedAt:null, createdAt:new Date().toISOString() }];
    });
    if (occurrences.length) setTasks((current) => [...occurrences, ...current]);
    setLastTaskRefreshDate(dateKey);
    return { dateKey, added:occurrences.length };
  };

  useEffect(() => {
    const refresh = () => refreshDailyTasks(new Date());
    if (gardenProfile.onboardingCompleted) refresh();
    const onVisibility = () => {
      if (!document.hidden && localDateKey() !== lastTaskRefreshDate && gardenProfile.onboardingCompleted) refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [gardenProfile.onboardingCompleted, lastTaskRefreshDate]);

  const applyBuddyGardenLog = ({ originalText, parsedActions = [], confirmedActions = [], date, time = "", photos:attachments = [], taskCompletionIds = [] }) => {
    const now = new Date();
    const recordId = createStableId("buddy-log");
    const eventTimestamp = new Date(`${date || localDateKey(now)}T${time || "12:00"}:00`).toISOString();
    const normalizedActions = confirmedActions.map((action) => ({
      ...action,
      targetIds:[...new Set(asArray(action.targetIds).filter((id) => activePlants.some((plant) => plant.id === id)))],
    }));
    const photoRecords = attachments.map((photo, index) => withProfile({
      id:createStableId(`buddy-photo-${index + 1}`),
      plantId:normalizedActions.flatMap((action) => action.targetIds).length === 1 ? normalizedActions.flatMap((action) => action.targetIds)[0] : null,
      name:photo.name || `Garden-day photo ${index + 1}`,
      date:eventTimestamp,
      url:photo.url || photo.src,
      source:"Buddy Natural-Language Logger",
      buddyLogId:recordId,
    }, gardenProfile.id));
    const baseRecord = withProfile({
      id:recordId,
      originalText:String(originalText || "").trim(),
      parsedActions,
      confirmedActions:normalizedActions,
      affectedPlantIds:[...new Set(normalizedActions.flatMap((action) => action.targetIds))],
      date:date || localDateKey(now),
      time,
      eventTimestamp,
      createdAt:now.toISOString(),
      updatedAt:now.toISOString(),
      source:"Buddy Natural-Language Logger",
      status:"saved",
    }, gardenProfile.id);
    const journalRecords = normalizedActions.map((action) => withProfile({
      ...buildBuddyJournalEntry(action, baseRecord, activePlants, createStableId),
      photoIds:photoRecords.map((photo) => photo.id),
      buddyLogId:recordId,
    }, gardenProfile.id));
    const harvestWorkflows = normalizedActions
      .filter((action) => action.type === "harvested")
      .flatMap((action) => action.targetIds.map((plantId) => ({ action, plant:activePlants.find((plant) => plant.id === plantId) })))
      .filter(({ plant }) => plant && isTeaHarvestPlant(plant))
      .map(({ action, plant }) => withProfile({
        id:createStableId("tea-workflow"),
        plantId:plant.id,
        currentStage:"Harvested",
        harvestDate:baseRecord.date,
        gardenLocation:plant.location || plant.gardenZone || plant.collection || "",
        personalNotes:action.notes || `Harvest recorded by Buddy for ${plant.name}.`,
        source:"Buddy Natural-Language Logger",
        buddyLogId:recordId,
        createdAt:now.toISOString(),
        updatedAt:now.toISOString(),
      }, gardenProfile.id));
    const selectedTaskIds = [...new Set(taskCompletionIds)].filter((taskId) => tasks.some((task) => task.id === taskId && !task.completed));
    const taskSnapshots = tasks.filter((task) => selectedTaskIds.includes(task.id)).map((task) => ({ id:task.id, completed:task.completed, completedAt:task.completedAt || null }));
    const record = { ...baseRecord, journalEntryIds:journalRecords.map((item) => item.id), photoIds:photoRecords.map((item) => item.id), teaWorkflowIds:harvestWorkflows.map((item) => item.id), completedTaskIds:selectedTaskIds, taskSnapshots };
    setJournalEntries((current) => [...journalRecords, ...current]);
    setPhotos((current) => [...photoRecords, ...current]);
    setTeaWorkflows((current) => [...harvestWorkflows, ...current]);
    setTasks((current) => current.map((task) => selectedTaskIds.includes(task.id) ? { ...task, completed:true, completedAt:now.toISOString() } : task));
    const careActions = normalizedActions.filter((action) => careActionTypes.has(action.type) && !action.recordOnly);
    setPlants((current) => current.map((plant) => {
      const action = [...careActions].reverse().find((item) => item.targetIds.includes(plant.id));
      return action ? { ...plant, lastCareAt:eventTimestamp, lastCareType:action.type, updatedAt:now.toISOString() } : plant;
    }));
    setBuddyGardenLogs((current) => [record, ...current]);
    return record;
  };

  const undoBuddyGardenLog = (recordId) => {
    const record = buddyGardenLogs.find((item) => item.id === recordId && item.status !== "undone");
    if (!record) return false;
    setJournalEntries((current) => current.filter((entry) => entry.buddyLogId !== recordId));
    setPhotos((current) => current.filter((photo) => photo.buddyLogId !== recordId));
    setTeaWorkflows((current) => current.filter((workflow) => workflow.buddyLogId !== recordId));
    setTasks((current) => current.map((task) => {
      const snapshot = record.taskSnapshots?.find((item) => item.id === task.id);
      return snapshot ? { ...task, completed:snapshot.completed, completedAt:snapshot.completedAt } : task;
    }));
    setBuddyGardenLogs((current) => current.map((item) => item.id === recordId ? { ...item, status:"undone", undoneAt:new Date().toISOString() } : item));
    return true;
  };

  const addInventoryItem = (item) => {
    const next = withProfile(normalizeInventoryItem(item), gardenProfile.id);
    setInventoryItems((current) => [next, ...current]);
    return next;
  };
  const updateInventoryItem = (itemId, updates) => setInventoryItems((current) => current.map((item) => (
    item.id === itemId ? normalizeInventoryItem({ ...item, ...updates, id:item.id, createdAt:item.createdAt, updatedAt:new Date().toISOString() }) : item
  )));
  const deleteInventoryItem = (itemId) => setInventoryItems((current) => current.filter((item) => item.id !== itemId));

  const addCalendarEntry = (entry) => {
    const next = withProfile({ id:createStableId("calendar"), createdAt:new Date().toISOString(), ...entry }, gardenProfile.id);
    setCalendarEntries((current) => [next, ...current]);
    return next;
  };
  const updateCalendarEntry = (entryId, updates) => setCalendarEntries((current) => current.map((entry) => (
    entry.id === entryId ? { ...entry, ...updates, updatedAt:new Date().toISOString() } : entry
  )));
  const deleteCalendarEntry = (entryId) => setCalendarEntries((current) => current.filter((entry) => entry.id !== entryId));

  const addTeaRecipe = (recipe) => {
    const next = withProfile(normalizeTeaRecipe(recipe), gardenProfile.id);
    setTeaRecipes((current) => [next, ...current]);
    return next;
  };
  const updateTeaRecipe = (recipeId, updates) => setTeaRecipes((current) => current.map((recipe) => (
    recipe.id === recipeId ? normalizeTeaRecipe({ ...recipe, ...updates, id:recipe.id, createdAt:recipe.createdAt, updatedAt:new Date().toISOString() }) : recipe
  )));
  const deleteTeaRecipe = (recipeId) => setTeaRecipes((current) => current.filter((recipe) => recipe.id !== recipeId));
  const duplicateTeaRecipe = (recipeId) => {
    const recipe = teaRecipes.find((item) => item.id === recipeId);
    if (!recipe) return null;
    return addTeaRecipe({ ...recipe, id:createStableId("tea-recipe"), name:`${recipe.name} Copy`, favorite:false, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
  };

  const updatePlant = (plantId, updates) => {
    let result = null;
    setPlants((current) => current.map((plant) => {
      if (plant.id !== plantId) return plant;
      const patch = typeof updates === "function" ? updates(plant) : updates;
      result = { ...plant, ...patch, id:plant.id, gardenProfileId:gardenProfile.id, updatedAt:new Date().toISOString() };
      return result;
    }));
    if (selectedPlant?.id === plantId && result) setSelectedPlant(result);
    return result;
  };
  const addPlant = (plant) => {
    const next = withProfile({
      ...plant,
      id:plant.id || createStableId("plant"),
      quantity:Number(plant.quantity) > 0 ? Number(plant.quantity) : 1,
      createdAt:plant.createdAt || new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    }, gardenProfile.id);
    setPlants((current) => [...current, next]);
    return next;
  };
  const archivePlant = (plantId) => updatePlant(plantId, { archived:true, archivedAt:new Date().toISOString(), status:"Archived" });
  const restorePlant = (plantId) => updatePlant(plantId, { archived:false, archivedAt:null, status:"Active" });
  const finalizeDeletePlant = (plant) => {
    setPlants((current) => current.filter((item) => item.id !== plant.id));
    setJournalEntries((current) => current.map((entry) => preserveDeletedPlantReference(entry, plant)));
    setPhotos((current) => current.map((photo) => preserveDeletedPlantReference(photo, plant)));
    setPlantDiagnoses((current) => current.map((diagnosis) => preserveDeletedPlantReference(diagnosis, plant)));
    setTeaWorkflows((current) => current.map((workflow) => preserveDeletedPlantReference(workflow, plant)));
    setTasks((current) => current.map((task) => preserveDeletedPlantReference(task, plant)));
    setCalendarEntries((current) => current.map((entry) => preserveDeletedPlantReference(entry, plant)));
    setPendingPlantDeletions((current) => current.filter((item) => item.plantId !== plant.id));
    deletionTimers.current.delete(plant.id);
    if (selectedPlant?.id === plant.id) setSelectedPlant(null);
  };
  const scheduleDeletePlant = (plantId) => {
    const plant = plants.find((item) => item.id === plantId);
    if (!plant || deletionTimers.current.has(plantId)) return false;
    const deadline = Date.now() + 10000;
    setPendingPlantDeletions((current) => [...current, { plantId, plantName:plant.name, deadline }]);
    deletionTimers.current.set(plantId, setTimeout(() => finalizeDeletePlant(plant), 10000));
    return true;
  };
  const undoDeletePlant = (plantId) => {
    const timer = deletionTimers.current.get(plantId);
    if (!timer) return false;
    clearTimeout(timer);
    deletionTimers.current.delete(plantId);
    setPendingPlantDeletions((current) => current.filter((item) => item.plantId !== plantId));
    return true;
  };

  const getPlantById = (plantId) => plants.find((plant) => plant.id === plantId);
  const getEntriesForPlant = (plantId) => journalEntries.filter((entry) => entry.plantId === plantId || entry.affectedPlantIds?.includes(plantId));
  const getPhotosForPlant = (plantId) => photos.filter((photo) => photo.plantId === plantId);
  const getDiagnosesForPlant = (plantId) => plantDiagnoses.filter((diagnosis) => diagnosis.plantId === plantId);

  const stats = useMemo(() => {
    const totalPlants = activePlants.reduce((sum, plant) => sum + quantityOf(plant), 0);
    const orchardPlants = activePlants.filter((plant) => isOrchardFruitTree(plant) || plant.category === "Fruit Trees");
    const vegetables = activePlants.filter((plant) => plant.category === "Vegetables");
    const fruits = activePlants.filter((plant) => ["Fruits", "Berries & Vines"].includes(plant.category));
    const herbs = activePlants.filter((plant) => ["Herbs", "Mints", "Tea Plants"].includes(plant.category));
    const gardenBeds = getUniqueGardenBeds(activePlants);
    const mintVarieties = getMintVarietyNames(activePlants);
    const activeHealthCases = plantDiagnoses.filter((diagnosis) => diagnosis.status !== "Resolved");
    const harvests = journalEntries.filter((entry) => /harvest/i.test(`${entry.type || ""} ${entry.title || ""}`));
    const weightedHealth = activePlants.reduce((sum, plant) => sum + (Number(plant.health) || 100), 0);
    return {
      totalPlants,
      plantRecordCount:activePlants.length,
      averageHealth:activePlants.length ? Math.round(weightedHealth / activePlants.length) : 0,
      journalCount:journalEntries.length,
      photoCount:photos.length,
      orchardCount:orchardPlants.reduce((sum, plant) => sum + quantityOf(plant), 0),
      fruitTreeCount:orchardPlants.reduce((sum, plant) => sum + quantityOf(plant), 0),
      vegetableCount:vegetables.reduce((sum, plant) => sum + quantityOf(plant), 0),
      fruitCount:fruits.reduce((sum, plant) => sum + quantityOf(plant), 0),
      herbCount:herbs.reduce((sum, plant) => sum + quantityOf(plant), 0),
      edibleHerbCount:countUniquePlants(activePlants, isEdibleOrHerbPlant),
      gardenBedCount:gardenBeds.length,
      gardenBeds,
      gardenZoneCount:gardenCollections.length,
      gardenZones:gardenCollections,
      mintVarietyCount:mintVarieties.length,
      mintVarieties,
      citrusCount:activePlants.filter((plant) => (plant.category || "").toLocaleLowerCase() === "citrus").length,
      plantsNeedingAttention:activePlants.filter((plant) => Number(plant.health || 100) < 85),
      openTaskCount:tasks.filter((task) => !task.completed && !task.isTemplate).length,
      activeHealthCaseCount:activeHealthCases.length,
      harvestCount:harvests.length,
      recentEntries:journalEntries.slice(0, 5),
    };
  }, [activePlants, journalEntries, photos, gardenCollections, tasks, plantDiagnoses]);

  const value = {
    gardenProfile,
    updateGardenProfile,
    onboardingDraft,
    updateOnboardingDraft,
    completeOnboarding,
    loadSampleGarden,
    startFreshGarden,
    clearGardenData,
    exportGardenData,
    replaceGardenData,
    plants,
    activePlants,
    setPlants,
    selectedPlant,
    setSelectedPlant,
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    photos,
    addPhotos,
    deletePhoto,
    plantDiagnoses,
    addPlantDiagnosis,
    updatePlantDiagnosis,
    addDiagnosisFollowUp,
    deletePlantDiagnosis,
    plantIdentifications,
    addPlantIdentification,
    updatePlantIdentification,
    deletePlantIdentification,
    teaWorkflows,
    addTeaWorkflow,
    updateTeaWorkflow,
    deleteTeaWorkflow,
    gardenCollections,
    gardenZones:zones,
    addGardenCollection,
    updateGardenCollection,
    reorderGardenCollection,
    archiveGardenCollection,
    restoreGardenCollection,
    deleteGardenCollection,
    assignPlantToCollection,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    refreshDailyTasks,
    lastTaskRefreshDate,
    buddyGardenLogs,
    applyBuddyGardenLog,
    undoBuddyGardenLog,
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    calendarEntries,
    addCalendarEntry,
    updateCalendarEntry,
    deleteCalendarEntry,
    teaRecipes,
    addTeaRecipe,
    updateTeaRecipe,
    deleteTeaRecipe,
    duplicateTeaRecipe,
    updatePlant,
    addPlant,
    archivePlant,
    restorePlant,
    deletePlant:scheduleDeletePlant,
    scheduleDeletePlant,
    undoDeletePlant,
    pendingPlantDeletions,
    getPlantById,
    getEntriesForPlant,
    getPhotosForPlant,
    getDiagnosesForPlant,
    stats,
  };

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (!context) throw new Error("useGarden must be used inside GardenProvider");
  return context;
}
