import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { plants as starterPlants } from "../data/plants";

const GardenContext = createContext(null);

const citrangequatStarter = starterPlants.find(
  (plant) => plant.id === "thomasville-citrangequat"
);

const normalizePlantIdentity = (plant) =>
  `${plant.id || ""} ${plant.name || ""} ${plant.nickname || ""} ${plant.type || ""} ${plant.variety || ""}`
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "");

const isThomasvilleCitrangequat = (plant) => {
  const identity = normalizePlantIdentity(plant);
  return (
    identity.includes("thomasvillecitrangequat") ||
    identity.includes("citrangequat") ||
    identity.includes("msquatt")
  );
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
  const savedPlants = load("jardinSoleilPlants", starterPlants);
  const existingPlant = savedPlants.find(isThomasvilleCitrangequat);

  if (!existingPlant) {
    return [...savedPlants, citrangequatStarter];
  }

  return savedPlants.map((plant) =>
    plant === existingPlant
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
  );
};

export function GardenProvider({ children }) {
  const [plants, setPlants] = useState(loadPlants);

  const [selectedPlant, setSelectedPlant] = useState(null);

  const [journalEntries, setJournalEntries] = useState(() =>
    load("jardinSoleilJournalEntries", [])
  );

  const [photos, setPhotos] = useState(() =>
    load("jardinSoleilPhotos", [])
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

  const addPhotos = (newPhotos) => {
    setPhotos((current) => [...newPhotos, ...current]);
  };

  const getPlantById = (plantId) =>
    plants.find((plant) => plant.id === plantId);

  const getEntriesForPlant = (plantId) =>
    journalEntries.filter((entry) => entry.plantId === plantId);

  const getPhotosForPlant = (plantId) =>
    photos.filter((photo) => photo.plantId === plantId);

  const stats = useMemo(() => {
    const totalPlants = plants.length;
    const averageHealth =
      totalPlants > 0
        ? Math.round(
            plants.reduce((sum, plant) => sum + (plant.health || 100), 0) /
              totalPlants
          )
        : 0;

    return {
      totalPlants,
      averageHealth,
      journalCount: journalEntries.length,
      photoCount: photos.length,
      orchardCount: plants.filter((p) =>
        ["orchard", "citrus"].includes((p.category || "").toLocaleLowerCase())
      ).length,
      citrusCount: plants.filter(
        (p) => (p.category || "").toLocaleLowerCase() === "citrus"
      ).length,
      plantsNeedingAttention: plants.filter((p) => (p.health || 100) < 85),
      recentEntries: journalEntries.slice(0, 5),
    };
  }, [plants, journalEntries, photos]);

  const value = {
    plants,
    setPlants,
    selectedPlant,
    setSelectedPlant,
    journalEntries,
    addJournalEntry,
    photos,
    addPhotos,
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
