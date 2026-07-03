import React, { useState } from "react";

import { GardenProvider, useGarden } from "./context/GardenContext";

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
import PhotoManager from "./components/PhotoManager";

import "./styles/app.css";

function GardenApp() {
  const [page, setPage] = useState("Dashboard");

  const {
    selectedPlant,
    setSelectedPlant,
    journalEntries,
    addJournalEntry
  } = useGarden();

  const openPlant = (plant) => {
    setSelectedPlant(plant);
    setPage("Plant Profile");
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard journalEntries={journalEntries} />;

      case "Orchard":
        return <Orchard onSelectPlant={openPlant} />;

      case "Plant Directory":
        return <PlantDirectory onSelectPlant={openPlant} />;

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
        return (
          <JournalEntry
            onSaveEntry={addJournalEntry}
          />
        );

      case "Journal Timeline":
        return (
          <JournalTimeline
            entries={journalEntries}
          />
        );

      case "Photo Manager":
        return <PhotoManager />;

      case "Gallery":
        return <Gallery />;

      case "Inventory":
        return <Inventory />;

      case "Weather":
        return <Weather />;

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
        <h1>🌿 Jardin Soleil</h1>

        <p>
          French Chalet Garden Command Center
        </p>
      </header>

      <Navigation
        activePage={page}
        setPage={setPage}
      />

      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <GardenProvider>
      <GardenApp />
    </GardenProvider>
  );
}
