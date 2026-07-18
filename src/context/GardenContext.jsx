import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { plants as starterPlants } from "../data/plants";
import { gardenPlants, gardenZones, mintPlants, starterTasks } from "../data/jardinData";
import { teaBlends as starterTeaRecipes } from "../data/teaBlends";
import { starterInventoryItems } from "../data/inventory";
import { countUniquePlants, getMintVarietyNames, getUniqueGardenBeds, isEdibleOrHerbPlant, isOrchardFruitTree } from "../utils/plantClassification";
import { preserveDeletedPlantReference } from "../utils/plantMutations";
import { buildBuddyJournalEntry, careActionTypes, isTeaHarvestPlant } from "../utils/buildBulkCareEvents";
import { isTaskDueOn, localDateKey } from "../utils/localDate";

const GardenContext = createContext(null);

const citrangequatStarter = starterPlants.find(
  (plant) => plant.id === "thomasville-citrangequat"
);
const fruitCocktailThreeStarter = starterPlants.find(
  (plant) => plant.id === "fruit-cocktail-tree-3"
);
const fruitSnacksPeachStarter = starterPlants.find(
  (plant) => plant.id === "fruit-snacks-sensational-peach"
);
const chicagoHardyFigStarter = starterPlants.find(
  (plant) => plant.id === "chicago-hardy-fig"
);
const mintCollectionStarter = gardenPlants.find(
  (plant) => plant.id === "mint-collection"
);
const watermelonStarters = gardenPlants.filter((plant) => ["black-diamond-watermelon-1", "black-diamond-watermelon-2", "crimson-red-watermelon"].includes(plant.id));
const plantLegacyIdMap = new Map();

const normalizePlantIdentity = (plant) =>
  `${plant.id || ""} ${plant.name || ""} ${plant.nickname || ""} ${plant.type || ""} ${plant.variety || ""}`
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "");

const normalizePlantName = (value) =>
  String(value || "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "");

const canonicalGardenMetadata = {
  tomatoes: { name: "Tomatoes", category: "Vegetables", group: "Vegetables", type: "Tomato" },
  mintcollection: { name: "Mint Collection", category: "Herbs", group: "Herbs", type: "Mint", variety: mintCollectionStarter.variety, collectionMembers: mintCollectionStarter.collectionMembers, collectionTotal: mintCollectionStarter.collectionTotal },
  msrose: { name: "Ms. Rose", category: "Flowers & Perennials", group: "Flowers & Perennials", type: "Rose" },
  pineapplesage: { name: "Pineapple Sage", category: "Herbs", group: "Herbs", type: "Sage" },
  honeymelonsage: { name: "Honey Melon Sage", category: "Herbs", group: "Sage", collection: "Herb & Tea Garden", type: "Sage" },
  blackdiamondwatermelon1: { name:"Black Diamond Watermelon 1", category:"Vegetables", group:"Watermelons", collection:"Vegetable Garden", type:"Watermelon" },
  blackdiamondwatermelon2: { name:"Black Diamond Watermelon 2", category:"Vegetables", group:"Watermelons", collection:"Vegetable Garden", type:"Watermelon" },
  crimsonredwatermelon: { name:"Crimson Red Watermelon", category:"Vegetables", group:"Watermelons", collection:"Vegetable Garden", type:"Watermelon" },
  crismsonredwatermelon: { name:"Crimson Red Watermelon", category:"Vegetables", group:"Watermelons", collection:"Vegetable Garden", type:"Watermelon" },
};

const createStableId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const diagnosisArray = (value) => Array.isArray(value) ? value : [];
const normalizePlantIdentification = (identification) => {
  const createdAt = identification.createdAt || identification.date || new Date().toISOString();
  return {
    ...identification,
    id:identification.id || createStableId("plant-identification"),
    date:identification.date || createdAt.slice(0, 10),
    photoIds:diagnosisArray(identification.photoIds),
    traits:identification.traits && typeof identification.traits === "object" ? identification.traits : {},
    matches:diagnosisArray(identification.matches).slice(0, 5),
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
    symptoms:diagnosisArray(diagnosis.symptoms),
    pestEvidence:diagnosisArray(diagnosis.pestEvidence),
    recentConditions:diagnosisArray(diagnosis.recentConditions),
    photoIds:diagnosisArray(diagnosis.photoIds),
    rankedPossibilities:diagnosisArray(diagnosis.rankedPossibilities),
    treatmentPlan:diagnosisArray(diagnosis.treatmentPlan),
    followUps:diagnosisArray(diagnosis.followUps),
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
  id: item.id || createStableId("inventory"),
  name: String(item.name || "").trim(),
  category: String(item.category || "Other").trim() || "Other",
  quantity: item.quantity === "" || item.quantity === null || item.quantity === undefined ? "" : Number(item.quantity),
  unit: String(item.unit || "").trim(),
  status: String(item.status || "In stock").trim(),
  location: String(item.location || "").trim(),
  lowThreshold: item.lowThreshold === "" || item.lowThreshold === null || item.lowThreshold === undefined ? "" : Number(item.lowThreshold),
  notes: String(item.notes || "").trim(),
  plantId: item.plantId || "",
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || new Date().toISOString(),
});
const normalizeTeaRecipe = (recipe) => ({
  ...recipe,
  id: recipe.id || createStableId("tea-recipe"),
  name: String(recipe.name || "").trim(),
  description: String(recipe.description || recipe.subtitle || "").trim(),
  subtitle: String(recipe.subtitle || recipe.description || "").trim(),
  ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient) =>
    typeof ingredient === "string" ? { name:ingredient, amount:"" } : { name:String(ingredient.name || "").trim(), amount:String(ingredient.amount || "").trim() }
  ).filter((ingredient) => ingredient.name) : [],
  flavorProfile: Array.isArray(recipe.flavorProfile) ? recipe.flavorProfile : [],
  wellnessBenefits: Array.isArray(recipe.wellnessBenefits) ? recipe.wellnessBenefits : [],
  brewing: { temperature:"", steepTime:"", serving:"", ...(recipe.brewing || {}) },
  inventory: { quantity:"", unit:"", ...(recipe.inventory || {}) },
  linkedPlantIds: Array.isArray(recipe.linkedPlantIds)
    ? [...new Set(recipe.linkedPlantIds.filter(Boolean))]
    : [],
  favorite: Boolean(recipe.favorite),
  archived: Boolean(recipe.archived),
  createdAt: recipe.createdAt || new Date().toISOString(),
  updatedAt: recipe.updatedAt || new Date().toISOString(),
});

const starterTaskRecords = starterTasks.map((title, index) => ({
  id:`starter-task-${index + 1}`,
  title,
  dueDate:"",
  completed:false,
  source:"Estate task",
  createdAt:"2026-07-01T12:00:00.000Z",
}));

const isThomasvilleCitrangequat = (plant) => {
  const identity = normalizePlantIdentity(plant);
  return (
    identity.includes("thomasvillecitrangequat") ||
    identity.includes("citrangequat") ||
    identity.includes("msquatt")
  );
};

const isFruitCocktailThree = (plant) => {
  const identity = normalizePlantIdentity(plant);
  return (
    identity.includes("fruitcocktailtree3") ||
    identity.includes("fruitcocktail3") ||
    /(^|[^a-z])fc3([^a-z]|$)/i.test(`${plant.id || ""} ${plant.nickname || ""} ${plant.name || ""}`)
  );
};

const isFruitSnacksPeach = (plant) => {
  const identity = normalizePlantIdentity(plant);
  return identity.includes("fruitsnackssensationalpeach") || identity.includes("sensationalpeach");
};

const isChicagoHardyFig = (plant) => {
  const identity = normalizePlantIdentity(plant);
  return identity.includes("chicagohardyfig") || identity.includes("hardyfig");
};

const load = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeJournalEntry = (entry, index) => {
  const createdAt = entry.createdAt || entry.timestamp || entry.date || new Date().toISOString();
  return {
    ...entry,
    id:entry.id || `legacy-journal-${index}-${String(createdAt).replace(/[^0-9]/g, "")}`,
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

const loadJournalEntries = () => {
  const signatures = new Set();
  return load("jardinSoleilJournalEntries", []).map(normalizeJournalEntry).map((entry) => {
    const signature = `${entry.createdAt}|${entry.plantId}|${entry.type}|${entry.notes}`.toLocaleLowerCase();
    const suspiciousDuplicate = signatures.has(signature);
    signatures.add(signature);
    return { ...entry, suspiciousDuplicate:entry.suspiciousDuplicate || suspiciousDuplicate };
  });
};

const loadPlants = () => {
  plantLegacyIdMap.clear();
  const deletedPlantIds = new Set(load("jardinSoleilDeletedPlantIds", []));
  const savedPlants = load("jardinSoleilPlants", starterPlants);
  const existingPlant = savedPlants.find(isThomasvilleCitrangequat);

  let migratedPlants = existingPlant
    ? savedPlants.map((plant) => plant === existingPlant
      ? {
          ...citrangequatStarter,
          ...plant,
          name: "Thomasville Citrangequat",
          nickname: "Ms. Quatt",
          type: "Fruit Tree",
          variety: "Thomasville Citrangequat",
          category: "Citrus",
        }
      : plant
    )
    : [...savedPlants, citrangequatStarter];

  const existingFruitCocktailThree = migratedPlants.find(isFruitCocktailThree);
  if (existingFruitCocktailThree) {
    migratedPlants = migratedPlants.map((plant) =>
      plant === existingFruitCocktailThree
        ? {
            ...fruitCocktailThreeStarter,
            ...plant,
            icon: fruitCocktailThreeStarter.icon,
            name: fruitCocktailThreeStarter.name,
            nickname: fruitCocktailThreeStarter.nickname,
            type: fruitCocktailThreeStarter.type,
            category: fruitCocktailThreeStarter.category,
            variety: fruitCocktailThreeStarter.variety,
            group: fruitCocktailThreeStarter.group,
          }
        : plant
    );
  } else {
    migratedPlants = [...migratedPlants, fruitCocktailThreeStarter];
  }

  const existingFruitSnacksPeach = migratedPlants.find(isFruitSnacksPeach);
  if (existingFruitSnacksPeach) {
    migratedPlants = migratedPlants.map((plant) =>
      plant === existingFruitSnacksPeach
        ? {
            ...fruitSnacksPeachStarter,
            ...plant,
            icon: fruitSnacksPeachStarter.icon,
            name: fruitSnacksPeachStarter.name,
            type: fruitSnacksPeachStarter.type,
            category: fruitSnacksPeachStarter.category,
            variety: fruitSnacksPeachStarter.variety,
            group: fruitSnacksPeachStarter.group,
          }
        : plant
    );
  } else {
    migratedPlants = [...migratedPlants, fruitSnacksPeachStarter];
  }

  const existingChicagoHardyFig = migratedPlants.find(isChicagoHardyFig);
  if (existingChicagoHardyFig) {
    migratedPlants = migratedPlants.map((plant) =>
      plant === existingChicagoHardyFig
        ? {
            ...chicagoHardyFigStarter,
            ...plant,
            name: chicagoHardyFigStarter.name,
            type: chicagoHardyFigStarter.type,
            category: chicagoHardyFigStarter.category,
            variety: chicagoHardyFigStarter.variety,
            group: chicagoHardyFigStarter.group,
          }
        : plant
    );
  } else {
    migratedPlants = [...migratedPlants, chicagoHardyFigStarter];
  }

  gardenPlants.forEach((gardenPlant) => {
    const exists = migratedPlants.some((plant) =>
      plant.id === gardenPlant.id || normalizePlantName(plant.name) === normalizePlantName(gardenPlant.name)
    );
    if (!exists) {
      migratedPlants.push({
        ...gardenPlant,
        health: gardenPlant.health ?? 100,
        location: gardenPlant.location || `${gardenPlant.category} Garden`,
        sun: gardenPlant.sun || "See plant notes",
        water: gardenPlant.water || "As needed",
        photos: gardenPlant.photos || [],
        journal: gardenPlant.journal || [],
      });
    }
  });

  watermelonStarters.forEach((canonicalWatermelon) => {
    const canonicalName = normalizePlantName(canonicalWatermelon.name);
    const matches = migratedPlants.filter((plant) => {
      const name = normalizePlantName(plant.name);
      if (canonicalWatermelon.id === "black-diamond-watermelon-1") return name === canonicalName || name === "blackdiamond1" || name === "blackdiamondwatermelonone";
      if (canonicalWatermelon.id === "black-diamond-watermelon-2") return name === canonicalName || name === "blackdiamond2" || name === "blackdiamondwatermelontwo";
      return [canonicalName, "crismsonred", "crismsonredwatermelon", "crimsonred"].includes(name);
    });
    const merged = matches.reduce((result, plant) => ({
      ...result,
      ...plant,
      profileNotes:[...(result.profileNotes || []), ...(plant.profileNotes || [])],
      photos:[...(result.photos || []), ...(plant.photos || [])],
      journal:[...(result.journal || []), ...(plant.journal || [])],
    }), { ...canonicalWatermelon });
    matches.forEach((plant) => { if (plant.id && plant.id !== canonicalWatermelon.id) plantLegacyIdMap.set(plant.id, canonicalWatermelon.id); });
    migratedPlants = migratedPlants.filter((plant) => !matches.includes(plant));
    migratedPlants.push({
      ...merged,
      id:canonicalWatermelon.id,
      name:canonicalWatermelon.name,
      category:"Vegetables",
      group:"Watermelons",
      collection:"Vegetable Garden",
      type:"Watermelon",
      status:merged.status || "Active",
    });
  });

  mintPlants.forEach((canonicalMint) => {
    const canonicalName = normalizePlantName(canonicalMint.name);
    const matches = migratedPlants.filter((plant) => normalizePlantName(plant.name) === canonicalName);
    if (!matches.length) {
      migratedPlants.push({ ...canonicalMint });
      return;
    }

    const merged = matches.reduce((result, plant) => ({
      ...result,
      ...plant,
      profileNotes: [...(result.profileNotes || []), ...(plant.profileNotes || [])],
      photos: [...(result.photos || []), ...(plant.photos || [])],
      journal: [...(result.journal || []), ...(plant.journal || [])],
    }), { ...canonicalMint });
    matches.forEach((plant) => { if (plant.id && plant.id !== canonicalMint.id) plantLegacyIdMap.set(plant.id, canonicalMint.id); });
    migratedPlants = migratedPlants.filter((plant) => normalizePlantName(plant.name) !== canonicalName);
    migratedPlants.push({
      ...merged,
      id: canonicalMint.id,
      name: canonicalMint.name,
      type: "Mint",
      category: "Herbs",
      group: "Mints",
      collection: "Mint Collection",
    });
  });

  migratedPlants = migratedPlants.map((plant) => {
    const canonical = canonicalGardenMetadata[normalizePlantName(plant.name)];
    if (canonical) return { ...plant, ...canonical };
    if (isThomasvilleCitrangequat(plant)) return {
      ...citrangequatStarter, ...plant, id: citrangequatStarter.id,
      name: "Thomasville Citrangequat", nickname: "Ms. Quatt", type: "Fruit Tree",
      variety: "Thomasville Citrangequat", category: "Citrus"
    };
    if (isFruitCocktailThree(plant)) return {
      ...fruitCocktailThreeStarter, ...plant, id: fruitCocktailThreeStarter.id,
      name: fruitCocktailThreeStarter.name, nickname: fruitCocktailThreeStarter.nickname,
      type: fruitCocktailThreeStarter.type, category: fruitCocktailThreeStarter.category,
      variety: fruitCocktailThreeStarter.variety, group: "Plums", icon: fruitCocktailThreeStarter.icon
    };
    if (isFruitSnacksPeach(plant)) return {
      ...fruitSnacksPeachStarter, ...plant, id: fruitSnacksPeachStarter.id,
      name: fruitSnacksPeachStarter.name, type: fruitSnacksPeachStarter.type,
      category: fruitSnacksPeachStarter.category, variety: fruitSnacksPeachStarter.variety,
      group: "Peach / Stone Fruit", icon: fruitSnacksPeachStarter.icon
    };
    if (isChicagoHardyFig(plant)) return {
      ...chicagoHardyFigStarter, ...plant, id: chicagoHardyFigStarter.id,
      name: chicagoHardyFigStarter.name, type: chicagoHardyFigStarter.type,
      category: chicagoHardyFigStarter.category, variety: chicagoHardyFigStarter.variety,
      group: "Figs"
    };
    return plant;
  });

  const honeyMelonMatches = migratedPlants.filter((plant) => normalizePlantName(plant.name) === "honeymelonsage");
  if (honeyMelonMatches.length) {
    const canonicalHoneyMelon = honeyMelonMatches.reduce((result, plant) => ({
      ...result,
      ...plant,
      profileNotes:[...(result.profileNotes || []), ...(plant.profileNotes || [])],
      photos:[...(result.photos || []), ...(plant.photos || [])],
      journal:[...(result.journal || []), ...(plant.journal || [])],
    }), { id:"honey-melon-sage", name:"Honey Melon Sage", category:"Herbs", group:"Sage", collection:"Herb & Tea Garden", type:"Sage" });
    honeyMelonMatches.forEach((plant) => { if (plant.id && plant.id !== "honey-melon-sage") plantLegacyIdMap.set(plant.id, "honey-melon-sage"); });
    migratedPlants = migratedPlants.filter((plant) => normalizePlantName(plant.name) !== "honeymelonsage");
    migratedPlants.push({ ...canonicalHoneyMelon, id:"honey-melon-sage", name:"Honey Melon Sage", category:"Herbs", group:"Sage", collection:"Herb & Tea Garden", type:"Sage" });
  }

  const uniquePlants = new Map();
  migratedPlants.forEach((plant) => {
    const key = plant.id ? `id:${plant.id}` : `name:${normalizePlantName(plant.name)}`;
    if (!uniquePlants.has(key)) uniquePlants.set(key, plant);
  });

  return [...uniquePlants.values()].filter((plant) => !deletedPlantIds.has(plant.id));
};

export function GardenProvider({ children }) {
  const [plants, setPlants] = useState(loadPlants);
  const [pendingPlantDeletions, setPendingPlantDeletions] = useState([]);
  const deletionTimers = useRef(new Map());
  const pendingDeletionIds = useMemo(() => new Set(pendingPlantDeletions.map((item) => item.plantId)), [pendingPlantDeletions]);
  const activePlants = useMemo(() => plants.filter((plant) => !plant.archived && !["archived", "removed"].includes(String(plant.status || "").toLocaleLowerCase()) && !pendingDeletionIds.has(plant.id)), [plants, pendingDeletionIds]);

  const [selectedPlant, setSelectedPlant] = useState(null);

  const [journalEntries, setJournalEntries] = useState(() =>
    loadJournalEntries().map((entry) => plantLegacyIdMap.has(entry.plantId) ? { ...entry, plantId:plantLegacyIdMap.get(entry.plantId) } : entry)
  );

  const [photos, setPhotos] = useState(() =>
    load("jardinSoleilPhotos", []).map((photo) => plantLegacyIdMap.has(photo.plantId) ? { ...photo, plantId:plantLegacyIdMap.get(photo.plantId) } : photo)
  );

  const [plantDiagnoses, setPlantDiagnoses] = useState(() =>
    load("jardinSoleilPlantDiagnoses", []).map((diagnosis) => normalizePlantDiagnosis(
      plantLegacyIdMap.has(diagnosis.plantId) ? { ...diagnosis, plantId:plantLegacyIdMap.get(diagnosis.plantId) } : diagnosis
    ))
  );

  const [plantIdentifications, setPlantIdentifications] = useState(() =>
    load("jardinSoleilPlantIdentifications", []).map(normalizePlantIdentification)
  );

  const [teaWorkflows, setTeaWorkflows] = useState(() =>
    load("jardinSoleilTeaWorkflows", []).map((workflow) => plantLegacyIdMap.has(workflow.plantId) ? { ...workflow, plantId:plantLegacyIdMap.get(workflow.plantId) } : workflow)
  );
  const [gardenCollections, setGardenCollections] = useState(() =>
    load("jardinSoleilGardenCollections", gardenZones).map((collection) => ({ ...collection }))
  );
  const [tasks, setTasks] = useState(() => load("jardinSoleilTasks", starterTaskRecords).map((task) => plantLegacyIdMap.has(task.plantId) ? { ...task, plantId:plantLegacyIdMap.get(task.plantId) } : task));
  const [lastTaskRefreshDate, setLastTaskRefreshDate] = useState(() => load("jardinSoleilTasksLastLocalRefresh", ""));
  const [buddyGardenLogs, setBuddyGardenLogs] = useState(() =>
    load("jardinSoleilBuddyGardenLogs", []).map((record) => ({ ...record, source:record.source || "Buddy Natural-Language Logger" }))
  );
  const [inventoryItems, setInventoryItems] = useState(() =>
    load("jardinSoleilInventory", starterInventoryItems).map(normalizeInventoryItem)
  );
  const [teaRecipes, setTeaRecipes] = useState(() =>
    load("jardinSoleilTeaRecipes", starterTeaRecipes).map(normalizeTeaRecipe)
  );
  const [calendarEntries, setCalendarEntries] = useState(() =>
    load("jardinSoleilCalendarEvents", []).map((entry) =>
      plantLegacyIdMap.has(entry.plantId)
        ? { ...entry, plantId:plantLegacyIdMap.get(entry.plantId) }
        : entry
    )
  );

  useEffect(() => {
    localStorage.setItem("jardinSoleilPlants", JSON.stringify(plants));
  }, [plants]);

  useEffect(() => {
    localStorage.setItem(
      "jardinSoleilJournalEntries",
      JSON.stringify(journalEntries)
    );
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("jardinSoleilPhotos", JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem("jardinSoleilPlantDiagnoses", JSON.stringify(plantDiagnoses));
  }, [plantDiagnoses]);

  useEffect(() => {
    localStorage.setItem("jardinSoleilPlantIdentifications", JSON.stringify(plantIdentifications));
  }, [plantIdentifications]);

  useEffect(() => {
    localStorage.setItem("jardinSoleilTeaWorkflows", JSON.stringify(teaWorkflows));
  }, [teaWorkflows]);

  useEffect(() => { localStorage.setItem("jardinSoleilGardenCollections", JSON.stringify(gardenCollections)); }, [gardenCollections]);
  useEffect(() => { localStorage.setItem("jardinSoleilTasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("jardinSoleilTasksLastLocalRefresh", JSON.stringify(lastTaskRefreshDate)); }, [lastTaskRefreshDate]);
  useEffect(() => { localStorage.setItem("jardinSoleilBuddyGardenLogs", JSON.stringify(buddyGardenLogs)); }, [buddyGardenLogs]);
  useEffect(() => { localStorage.setItem("jardinSoleilInventory", JSON.stringify(inventoryItems)); }, [inventoryItems]);
  useEffect(() => { localStorage.setItem("jardinSoleilTeaRecipes", JSON.stringify(teaRecipes)); }, [teaRecipes]);
  useEffect(() => { localStorage.setItem("jardinSoleilCalendarEvents", JSON.stringify(calendarEntries)); }, [calendarEntries]);

  useEffect(() => () => deletionTimers.current.forEach((timer) => clearTimeout(timer)), []);

  const addJournalEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...entry,
    };

    setJournalEntries((current) => [newEntry, ...current]);

    if (entry.plantId && entry.health) {
      setPlants((current) =>
        current.map((plant) =>
          plant.id === entry.plantId
            ? { ...plant, health: Number(entry.health), status: entry.type }
            : plant
        )
      );
    }

    return newEntry;
  };

  const updateJournalEntry = (entryId, updates) => {
    setJournalEntries((current) =>
      current.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
      )
    );
  };

  const deleteJournalEntry = (entryId) => {
    setJournalEntries((current) => current.filter((entry) => entry.id !== entryId));
  };

  const addPhotos = (newPhotos) => {
    setPhotos((current) => [...newPhotos, ...current]);
  };

  const deletePhoto = (photoId) => {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  };

  const addPlantDiagnosis = (diagnosis) => {
    const next = normalizePlantDiagnosis({ ...diagnosis, id:createStableId("plant-diagnosis"), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
    setPlantDiagnoses((current) => [next, ...current]);
    return next;
  };

  const updatePlantDiagnosis = (diagnosisId, updates) => {
    setPlantDiagnoses((current) => current.map((diagnosis) => {
      if (diagnosis.id !== diagnosisId) return diagnosis;
      const next = typeof updates === "function" ? updates(diagnosis) : { ...diagnosis, ...updates };
      return normalizePlantDiagnosis({ ...diagnosis, ...next, id:diagnosis.id, createdAt:diagnosis.createdAt, updatedAt:new Date().toISOString() });
    }));
  };

  const addDiagnosisFollowUp = (diagnosisId, followUp) => {
    const next = { id:createStableId("diagnosis-follow-up"), createdAt:new Date().toISOString(), ...followUp };
    updatePlantDiagnosis(diagnosisId, (diagnosis) => ({
      ...diagnosis,
      status:followUp.status || diagnosis.status,
      resolvedAt:followUp.status === "Resolved" ? next.createdAt : followUp.status === "Recurring" ? null : diagnosis.resolvedAt,
      followUps:[next, ...(diagnosis.followUps || [])],
    }));
    return next;
  };

  const deletePlantDiagnosis = (diagnosisId) => setPlantDiagnoses((current) => current.filter((diagnosis) => diagnosis.id !== diagnosisId));

  const addPlantIdentification = (identification) => {
    const next = normalizePlantIdentification({
      ...identification,
      id:createStableId("plant-identification"),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    });
    setPlantIdentifications((current) => [next, ...current]);
    return next;
  };

  const updatePlantIdentification = (identificationId, updates) => {
    let updated = null;
    setPlantIdentifications((current) => current.map((identification) => {
      if (identification.id !== identificationId) return identification;
      const patch = typeof updates === "function" ? updates(identification) : updates;
      updated = normalizePlantIdentification({
        ...identification,
        ...patch,
        id:identification.id,
        createdAt:identification.createdAt,
        updatedAt:new Date().toISOString(),
      });
      return updated;
    }));
    return updated;
  };

  const deletePlantIdentification = (identificationId) => {
    setPlantIdentifications((current) => current.filter((identification) => identification.id !== identificationId));
  };

  const addTeaWorkflow = (workflow) => {
    const newWorkflow = {
      id: `tea-workflow-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...workflow,
    };
    setTeaWorkflows((current) => [newWorkflow, ...current]);
    return newWorkflow;
  };

  const updateTeaWorkflow = (workflowId, updates) => {
    setTeaWorkflows((current) => current.map((workflow) =>
      workflow.id === workflowId
        ? { ...workflow, ...updates, updatedAt: new Date().toISOString() }
        : workflow
    ));
  };

  const deleteTeaWorkflow = (workflowId) => {
    setTeaWorkflows((current) => current.filter((workflow) => workflow.id !== workflowId));
  };

  const updateGardenCollection = (collectionId, updates) => {
    const currentCollection = gardenCollections.find((collection) => collection.id === collectionId);
    if (currentCollection && updates.name && updates.name !== currentCollection.name) {
      setPlants((current) => current.map((plant) => ({
        ...plant,
        ...(normalizePlantName(plant.collection) === normalizePlantName(currentCollection.name) ? { collection:updates.name } : {}),
        ...(normalizePlantName(plant.gardenZone) === normalizePlantName(currentCollection.name) ? { gardenZone:updates.name } : {}),
      })));
    }
    setGardenCollections((current) => current.map((collection) =>
      collection.id === collectionId ? { ...collection, ...updates, updatedAt:new Date().toISOString() } : collection
    ));
  };
  const assignPlantToCollection = (plantId, collectionId) => {
    const collection = gardenCollections.find((item) => item.id === collectionId);
    if (!collection) return;
    updatePlant(plantId, {
      collection:collection.name,
      gardenZone:collection.name,
    });
  };

  const addTask = (task) => {
    const next = { id:createStableId("task"), completed:false, createdAt:new Date().toISOString(), ...task };
    setTasks((current) => [next, ...current]);
    return next;
  };
  const updateTask = (taskId, updates) => setTasks((current) => current.map((task) =>
    task.id === taskId ? { ...task, ...updates, updatedAt:new Date().toISOString() } : task
  ));
  const deleteTask = (taskId) => setTasks((current) => current.filter((task) => task.id !== taskId));
  const refreshDailyTasks = (date = new Date()) => {
    const dateKey = localDateKey(date);
    const previewTemplates = tasks.filter((task) => task.isTemplate || task.kind === "template");
    const previewIds = new Set(tasks.map((task) => String(task.id)));
    const added = previewTemplates.filter((template) => isTaskDueOn(template, date) && !previewIds.has(`${template.id}__${dateKey}`)).length;
    setTasks((current) => {
      const templates = current.filter((task) => task.isTemplate || task.kind === "template");
      const existing = new Set(current.map((task) => String(task.id)));
      const occurrences = templates.filter((template) => isTaskDueOn(template, date)).flatMap((template) => {
        const id = `${template.id}__${dateKey}`;
        if (existing.has(id)) return [];
        return [{ ...template, id, templateId:template.id, kind:"occurrence", isTemplate:false, dueDate:dateKey, completed:false, completedAt:null, createdAt:new Date().toISOString() }];
      });
      return occurrences.length ? [...occurrences, ...current] : current;
    });
    setLastTaskRefreshDate(dateKey);
    return { dateKey, added };
  };

  useEffect(() => {
    const refresh = () => refreshDailyTasks(new Date());
    refresh();
    const onVisibility = () => { if (!document.hidden && localDateKey() !== lastTaskRefreshDate) refresh(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [lastTaskRefreshDate]);

  const applyBuddyGardenLog = ({ originalText, parsedActions = [], confirmedActions = [], date, time = "", photos:attachments = [], taskCompletionIds = [] }) => {
    const now = new Date();
    const localEvent = new Date(`${date || now.toISOString().slice(0, 10)}T${time || "12:00"}:00`);
    const eventTimestamp = Number.isNaN(localEvent.getTime()) ? now.toISOString() : localEvent.toISOString();
    const recordId = createStableId("buddy-log");
    const normalizedActions = confirmedActions.map((action) => {
      const affected = [...new Set((action.targetIds || []).filter((id) => activePlants.some((plant) => plant.id === id)))];
      const linkedDiagnosisIds = ["treated-pests", "treated-disease", "inspected"].includes(action.type)
        ? plantDiagnoses.filter((diagnosis) => affected.includes(diagnosis.plantId) && diagnosis.status !== "Resolved").map((diagnosis) => diagnosis.id)
        : [];
      return { ...action, targetIds:affected, linkedDiagnosisIds };
    });
    const photoRecords = attachments.map((photo, index) => ({
      id:createStableId(`buddy-photo-${index + 1}`),
      plantId:normalizedActions.flatMap((action) => action.targetIds || []).length === 1 ? normalizedActions.flatMap((action) => action.targetIds || [])[0] : null,
      name:photo.name || `Buddy garden-day photo ${index + 1}`,
      date:eventTimestamp,
      url:photo.url || photo.src,
      source:"Buddy Natural-Language Logger",
      buddyLogId:recordId,
    }));
    const baseRecord = {
      id:recordId,
      originalText:String(originalText || "").trim(),
      parsedActions,
      confirmedActions:normalizedActions,
      affectedPlantIds:[...new Set(normalizedActions.flatMap((action) => action.targetIds || []))],
      date:date || now.toISOString().slice(0, 10),
      time,
      eventTimestamp,
      createdAt:now.toISOString(),
      updatedAt:now.toISOString(),
      source:"Buddy Natural-Language Logger",
      status:"saved",
    };
    const journalRecords = normalizedActions.map((action) => ({
      ...buildBuddyJournalEntry(action, baseRecord, activePlants, createStableId),
      photoIds:photoRecords.map((photo) => photo.id),
    }));
    const calendarRecords = normalizedActions.filter((action) => action.nextDueDate).map((action) => ({
      id:createStableId("calendar"),
      title:`${action.label || action.type} follow-up — ${action.scopeLabel || "Jardin Soleil"}`,
      date:action.nextDueDate,
      plantId:action.targetIds?.length === 1 ? action.targetIds[0] : "",
      affectedPlantIds:action.targetIds || [],
      source:"Buddy Natural-Language Logger",
      buddyLogId:recordId,
      createdAt:now.toISOString(),
    }));
    const teaHarvestWorkflows = normalizedActions
      .filter((action) => action.type === "harvested")
      .flatMap((action) => (action.targetIds || []).map((plantId) => ({ action, plant:activePlants.find((plant) => plant.id === plantId) })))
      .filter(({ plant }) => isTeaHarvestPlant(plant))
      .map(({ action, plant }) => ({
        id:createStableId("tea-workflow"),
        plantId:plant.id,
        currentStage:"Harvested",
        harvestDate:baseRecord.date,
        gardenLocation:plant.location || plant.gardenZone || plant.collection || "",
        personalNotes:action.notes || `Harvest recorded by Buddy for ${plant.name}.`,
        stagePhotos:photoRecords.length ? { Harvested:photoRecords.map((photo) => photo.id) } : {},
        source:"Buddy Natural-Language Logger",
        buddyLogId:recordId,
        createdAt:now.toISOString(),
        updatedAt:now.toISOString(),
      }));
    const selectedTaskIds = [...new Set(taskCompletionIds)].filter((taskId) => tasks.some((task) => task.id === taskId && !task.completed));
    const taskSnapshots = tasks.filter((task) => selectedTaskIds.includes(task.id)).map((task) => ({ id:task.id, completed:task.completed, completedAt:task.completedAt || null }));
    const careActions = normalizedActions.filter((action) => careActionTypes.has(action.type) && !action.recordOnly);
    const carePlantIds = [...new Set(careActions.flatMap((action) => action.targetIds || []))];
    const plantCareSnapshots = activePlants.filter((plant) => carePlantIds.includes(plant.id)).map((plant) => ({ id:plant.id, lastCareAt:plant.lastCareAt, lastCareType:plant.lastCareType, updatedAt:plant.updatedAt }));
    const latestCareByPlant = new Map();
    careActions.forEach((action) => (action.targetIds || []).forEach((plantId) => latestCareByPlant.set(plantId, action.type)));
    const record = {
      ...baseRecord,
      journalEntryIds:journalRecords.map((entry) => entry.id),
      photoIds:photoRecords.map((photo) => photo.id),
      calendarEntryIds:calendarRecords.map((entry) => entry.id),
      teaWorkflowIds:teaHarvestWorkflows.map((workflow) => workflow.id),
      completedTaskIds:selectedTaskIds,
      taskSnapshots,
      plantCareSnapshots,
    };

    setJournalEntries((current) => [...journalRecords, ...current]);
    if (carePlantIds.length) setPlants((current) => current.map((plant) => latestCareByPlant.has(plant.id) ? { ...plant, lastCareAt:eventTimestamp, lastCareType:latestCareByPlant.get(plant.id), updatedAt:now.toISOString() } : plant));
    if (photoRecords.length) setPhotos((current) => [...photoRecords, ...current]);
    if (calendarRecords.length) setCalendarEntries((current) => [...calendarRecords, ...current]);
    if (teaHarvestWorkflows.length) setTeaWorkflows((current) => [...teaHarvestWorkflows, ...current]);
    if (selectedTaskIds.length) setTasks((current) => current.map((task) => selectedTaskIds.includes(task.id) ? { ...task, completed:true, completedAt:now.toISOString(), updatedAt:now.toISOString() } : task));
    setBuddyGardenLogs((current) => [record, ...current]);
    return record;
  };

  const undoBuddyGardenLog = (recordId) => {
    const record = buddyGardenLogs.find((item) => item.id === recordId);
    if (!record || record.status === "undone") return false;
    const journalIds = new Set(record.journalEntryIds || []);
    const photoIds = new Set(record.photoIds || []);
    const calendarIds = new Set(record.calendarEntryIds || []);
    const teaWorkflowIds = new Set(record.teaWorkflowIds || []);
    const snapshots = new Map((record.taskSnapshots || []).map((snapshot) => [snapshot.id, snapshot]));
    const plantSnapshots = new Map((record.plantCareSnapshots || []).map((snapshot) => [snapshot.id, snapshot]));
    setJournalEntries((current) => current.filter((entry) => !journalIds.has(entry.id)));
    setPhotos((current) => current.filter((photo) => !photoIds.has(photo.id)));
    setCalendarEntries((current) => current.filter((entry) => !calendarIds.has(entry.id)));
    setTeaWorkflows((current) => current.filter((workflow) => !teaWorkflowIds.has(workflow.id)));
    setTasks((current) => current.map((task) => snapshots.has(task.id) ? { ...task, ...snapshots.get(task.id), updatedAt:new Date().toISOString() } : task));
    setPlants((current) => current.map((plant) => plantSnapshots.has(plant.id) ? { ...plant, ...plantSnapshots.get(plant.id) } : plant));
    setBuddyGardenLogs((current) => current.map((item) => item.id === recordId ? { ...item, status:"undone", undoneAt:new Date().toISOString(), updatedAt:new Date().toISOString() } : item));
    return true;
  };

  const addInventoryItem = (item) => {
    const normalizedName = normalizePlantName(item.name);
    if (inventoryItems.some((current) => normalizePlantName(current.name) === normalizedName && normalizePlantName(current.category) === normalizePlantName(item.category))) {
      throw new Error("That inventory item already exists in this category.");
    }
    const next = normalizeInventoryItem({ ...item, id:createStableId("inventory") });
    setInventoryItems((current) => [next, ...current]);
    return next;
  };
  const updateInventoryItem = (itemId, updates) => setInventoryItems((current) => current.map((item) =>
    item.id === itemId ? normalizeInventoryItem({ ...item, ...updates, id:item.id, createdAt:item.createdAt, updatedAt:new Date().toISOString() }) : item
  ));
  const deleteInventoryItem = (itemId) => setInventoryItems((current) => current.filter((item) => item.id !== itemId));

  const addCalendarEntry = (entry) => {
    const next = { id:createStableId("calendar"), createdAt:new Date().toISOString(), ...entry };
    setCalendarEntries((current) => [next, ...current]);
    return next;
  };
  const updateCalendarEntry = (entryId, updates) => setCalendarEntries((current) => current.map((entry) =>
    entry.id === entryId ? { ...entry, ...updates, updatedAt:new Date().toISOString() } : entry
  ));
  const deleteCalendarEntry = (entryId) => setCalendarEntries((current) => current.filter((entry) => entry.id !== entryId));

  const addTeaRecipe = (recipe) => {
    const next = normalizeTeaRecipe({ ...recipe, id:createStableId("tea-recipe") });
    setTeaRecipes((current) => [next, ...current]);
    return next;
  };
  const updateTeaRecipe = (recipeId, updates) => setTeaRecipes((current) => current.map((recipe) =>
    recipe.id === recipeId ? normalizeTeaRecipe({ ...recipe, ...updates, id:recipe.id, createdAt:recipe.createdAt, updatedAt:new Date().toISOString() }) : recipe
  ));
  const deleteTeaRecipe = (recipeId) => {
    const recipe = teaRecipes.find((item) => item.id === recipeId);
    if (recipe) setTeaWorkflows((current) => current.map((workflow) => workflow.blendId === recipeId ? { ...workflow, blendId:"", deletedBlendName:recipe.name, blendDeleted:true } : workflow));
    setTeaRecipes((current) => current.filter((item) => item.id !== recipeId));
  };
  const duplicateTeaRecipe = (recipeId) => {
    const recipe = teaRecipes.find((item) => item.id === recipeId);
    if (!recipe) return null;
    return addTeaRecipe({ ...recipe, id:undefined, name:`${recipe.name} Copy`, favorite:false, archived:false });
  };

  const updatePlant = (plantId, updates) => {
    setPlants((current) =>
      current.map((plant) =>
        plant.id === plantId
          ? typeof updates === "function"
            ? { ...updates(plant), updatedAt:new Date().toISOString() }
            : { ...plant, ...updates, updatedAt:new Date().toISOString() }
          : plant
      )
    );
  };

  const addPlant = (plant) => {
    if (plants.some((item) => item.id === plant.id)) throw new Error("A plant with this ID already exists.");
    const deleted = new Set(load("jardinSoleilDeletedPlantIds", [])); deleted.delete(plant.id); localStorage.setItem("jardinSoleilDeletedPlantIds",JSON.stringify([...deleted]));
    setPlants((current) => [...current, plant]);
    return plant;
  };
  const archivePlant = (plantId,archiveStatus="Archived") => updatePlant(plantId,(plant)=>({
    ...plant,
    archived:true,
    archivedAt:new Date().toISOString(),
    archiveSnapshot:plant.archiveSnapshot || {
      collection:plant.collection || "",
      category:plant.category || "",
      group:plant.group || "",
      type:plant.type || "",
      gardenZone:plant.gardenZone || "",
      location:plant.location || "",
      status:plant.status || "Active",
    },
    status:archiveStatus,
  }));
  const restorePlant = (plantId) => updatePlant(plantId,(plant)=>({
    ...plant,
    ...(plant.archiveSnapshot || {}),
    archived:false,
    archivedAt:null,
    archiveSnapshot:null,
    status:plant.archiveSnapshot?.status || "Active",
  }));
  const finalizeDeletePlant = (plantId) => {
    const plant=plants.find((item)=>item.id===plantId);
    if(!plant)return;
    const deleted=new Set(load("jardinSoleilDeletedPlantIds",[]));deleted.add(plantId);localStorage.setItem("jardinSoleilDeletedPlantIds",JSON.stringify([...deleted]));
    const preserveReference=(record)=>preserveDeletedPlantReference(record,plant);
    setPlants((current)=>current.filter((item)=>item.id!==plantId));
    setJournalEntries((current)=>current.map(preserveReference));
    setPhotos((current)=>current.map(preserveReference));
    setPlantDiagnoses((current)=>current.map(preserveReference));
    setTeaWorkflows((current)=>current.map(preserveReference));
    setTasks((current)=>current.map(preserveReference));
    setInventoryItems((current)=>current.map(preserveReference));
    setCalendarEntries((current)=>current.map(preserveReference));
    setTeaRecipes((current)=>current.map((recipe)=>recipe.linkedPlantIds?.includes(plantId)?{
      ...recipe,
      linkedPlantIds:recipe.linkedPlantIds.filter((id)=>id!==plantId),
      deletedIngredientPlants:[...(recipe.deletedIngredientPlants||[]),{id:plant.id,name:plant.name}],
    }:recipe));
    setPendingPlantDeletions((current)=>current.filter((item)=>item.plantId!==plantId));
    deletionTimers.current.delete(plantId);
    if(selectedPlant?.id===plantId)setSelectedPlant(null);
  };
  const scheduleDeletePlant = (plantId) => {
    const plant=plants.find((item)=>item.id===plantId);
    if(!plant || deletionTimers.current.has(plantId))return null;
    const pending={plantId,plantName:plant.name,deadline:Date.now()+10000};
    setPendingPlantDeletions((current)=>[...current.filter((item)=>item.plantId!==plantId),pending]);
    deletionTimers.current.set(plantId,setTimeout(()=>finalizeDeletePlant(plantId),10000));
    return pending;
  };
  const undoDeletePlant = (plantId) => {
    const timer=deletionTimers.current.get(plantId);if(timer)clearTimeout(timer);
    deletionTimers.current.delete(plantId);
    setPendingPlantDeletions((current)=>current.filter((item)=>item.plantId!==plantId));
  };

  const getPlantById = (plantId) =>
    plants.find((plant) => plant.id === plantId);

  const getEntriesForPlant = (plantId) =>
    journalEntries.filter((entry) => entry.plantId === plantId || entry.affectedPlantIds?.includes(plantId));

  const getPhotosForPlant = (plantId) =>
    photos.filter((photo) => photo.plantId === plantId);

  const getDiagnosesForPlant = (plantId) =>
    plantDiagnoses.filter((diagnosis) => diagnosis.plantId === plantId);

  const stats = useMemo(() => {
    const totalPlants = activePlants.length;
    const averageHealth =
      totalPlants > 0
        ? Math.round(
            activePlants.reduce((sum, plant) => sum + (plant.health || 100), 0) /
              totalPlants
          )
        : 0;

    const gardenBeds = getUniqueGardenBeds(activePlants);
    const mintVarieties = getMintVarietyNames(activePlants);
    return {
      totalPlants,
      averageHealth,
      journalCount: journalEntries.length,
      photoCount: photos.length,
      orchardCount: activePlants.filter(isOrchardFruitTree).length,
      fruitTreeCount: activePlants.filter(isOrchardFruitTree).length,
      edibleHerbCount: countUniquePlants(activePlants, isEdibleOrHerbPlant),
      gardenBedCount: gardenBeds.length,
      gardenBeds,
      gardenZoneCount: gardenCollections.length,
      gardenZones:gardenCollections,
      mintVarietyCount: mintVarieties.length,
      mintVarieties,
      citrusCount: activePlants.filter(
        (p) => (p.category || "").toLocaleLowerCase() === "citrus"
      ).length,
      plantsNeedingAttention: activePlants.filter((p) => (p.health || 100) < 85),
      recentEntries: journalEntries.slice(0, 5),
    };
  }, [activePlants, journalEntries, photos, gardenCollections]);

  const value = {
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
    updateGardenCollection,
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

  return (
    <GardenContext.Provider value={value}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const context = useContext(GardenContext);

  if (!context) {
    throw new Error("useGarden must be used inside GardenProvider");
  }

  return context;
}
