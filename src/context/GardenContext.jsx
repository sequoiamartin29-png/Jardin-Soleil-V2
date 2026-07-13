import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { plants as starterPlants } from "../data/plants";
import { gardenPlants, gardenZones, mintPlants } from "../data/jardinData";
import { countUniquePlants, getMintVarietyNames, getUniqueGardenBeds, isEdibleOrHerbPlant, isOrchardFruitTree } from "../utils/plantClassification";
import { preserveDeletedPlantReference } from "../utils/plantMutations";

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
const mintLegacyIdMap = new Map();

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
  honeymelonsage: { name: "Honey Melon Sage", category: "Herbs", group: "Herbs", type: "Sage" },
};

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

const loadPlants = () => {
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

  mintLegacyIdMap.clear();
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
    matches.forEach((plant) => { if (plant.id && plant.id !== canonicalMint.id) mintLegacyIdMap.set(plant.id, canonicalMint.id); });
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
    load("jardinSoleilJournalEntries", []).map((entry) => mintLegacyIdMap.has(entry.plantId) ? { ...entry, plantId:mintLegacyIdMap.get(entry.plantId) } : entry)
  );

  const [photos, setPhotos] = useState(() =>
    load("jardinSoleilPhotos", []).map((photo) => mintLegacyIdMap.has(photo.plantId) ? { ...photo, plantId:mintLegacyIdMap.get(photo.plantId) } : photo)
  );

  const [teaWorkflows, setTeaWorkflows] = useState(() =>
    load("jardinSoleilTeaWorkflows", []).map((workflow) => mintLegacyIdMap.has(workflow.plantId) ? { ...workflow, plantId:mintLegacyIdMap.get(workflow.plantId) } : workflow)
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
    localStorage.setItem("jardinSoleilTeaWorkflows", JSON.stringify(teaWorkflows));
  }, [teaWorkflows]);

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
    setTeaWorkflows((current)=>current.map(preserveReference));
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
    journalEntries.filter((entry) => entry.plantId === plantId);

  const getPhotosForPlant = (plantId) =>
    photos.filter((photo) => photo.plantId === plantId);

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
      gardenZoneCount: gardenZones.length,
      gardenZones,
      mintVarietyCount: mintVarieties.length,
      mintVarieties,
      citrusCount: activePlants.filter(
        (p) => (p.category || "").toLocaleLowerCase() === "citrus"
      ).length,
      plantsNeedingAttention: activePlants.filter((p) => (p.health || 100) < 85),
      recentEntries: journalEntries.slice(0, 5),
    };
  }, [activePlants, journalEntries, photos]);

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
    teaWorkflows,
    addTeaWorkflow,
    updateTeaWorkflow,
    deleteTeaWorkflow,
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
