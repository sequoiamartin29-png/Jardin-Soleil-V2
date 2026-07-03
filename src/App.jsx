import React, { useEffect, useState } from "react";

import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Orchard from "./components/Orchard";
import Garden from "./components/Garden";
import Logbook from "./components/Logbook";
import Gallery from "./components/Gallery";
import Inventory from "./components/Inventory";
import Weather from "./components/Weather";
import Learning from "./components/Learning";
import WordSearch from "./components/WordSearch";
import PlantDirectory from "./components/PlantDirectory";
import PlantProfile from "./components/PlantProfile";
import JournalEntry from "./components/JournalEntry";
import JournalTimeline from "./components/JournalTimeline";

import "./styles/app.css";

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [selectedPlant, setSelectedPlant] = useState(null);

  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem("jardinSoleilJournalEntries");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "jardinSoleilJournalEntries",
      JSON.stringify(journalEntries)
    );
  }, [journalEntries]);

  const openPlantProfile = (plant) => {
    setSelectedPlant(plant);
    setPage("Plant Profile");
  };

  const addJournalEntry = (entry) => {
    setJournalEntries((current) => [
      {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...entry,
      },
      ...current,
    ]);

    setPage("Journal Timeline");
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard journalEntries={journalEntries} />;

      case "Orchard":
        return <Orchard onSelectPlant={openPlantProfile} />;

      case "Plant Directory":
        return <PlantDirectory onSelectPlant={openPlantProfile} />;

      case "Plant Profile":
        return (
          <PlantProfile
            plant={selectedPlant}
            journalEntries={journalEntries}
          />
        );

      case "Garden":
        return <Garden />;

      case "Logbook":
        return <Logbook />;

      case "New Journal Entry":
        return <JournalEntry onSaveEntry={addJournalEntry} />;

      case "Journal Timeline":
        return <JournalTimeline entries={journalEntries} />;

      case "Gallery":
        return <Gallery />;

      case "Weather":
        return <Weather />;

      case "Inventory":
        return <Inventory />;

      case "Learning":
        return <Learning />;

      case "Word Search":
        return <WordSearch />;

      default:
        return <Dashboard journalEntries={journalEntries} />;
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">French Chalet Garden Command Center</p>
          <h1>🌿 Jardin Soleil</h1>
          <p>
            Official records begin July 1, 2026. Built for your orchard,
            herbs, vegetables, flowers, photos, notes, and garden history.
          </p>
        </div>
      </header>

      <Navigation activePage={page} setPage={setPage} />

      <main>{renderPage()}</main>
    </div>
  );
}
