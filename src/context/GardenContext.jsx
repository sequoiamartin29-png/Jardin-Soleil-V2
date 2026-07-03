import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { plants } from "../data/plants";

const GardenContext = createContext(null);

export function GardenProvider({ children }) {
  const [selectedPlant, setSelectedPlant] = useState(null);

  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem("jardinSoleilJournalEntries");
    return saved ? JSON.parse(saved) : [];
  });

  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem("jardinSoleilPhotos");
    return saved ? JSON.parse(saved) : [];
  });

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
    setJournalEntries((current) => [
      {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...entry,
      },
      ...current,
    ]);
  };

  const addPhotos = (newPhotos) => {
    setPhotos((current) => [...newPhotos, ...current]);
  };

  const value = useMemo(
    () => ({
      plants,
      selectedPlant,
      setSelectedPlant,
      journalEntries,
      addJournalEntry,
      photos,
      addPhotos,
    }),
    [selectedPlant, journalEntries, photos]
  );

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
