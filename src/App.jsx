import React, { useCallback, useRef, useState } from "react";

import { GardenProvider, useGarden } from "./context/GardenContext";
import { EstateEnvironmentProvider } from "./context/EstateEnvironmentContext";

import Dashboard from "./components/Dashboard";
import Orchard from "./components/Orchard";
import Garden from "./components/Garden";
import Logbook from "./components/Logbook";
import Gallery from "./components/Gallery";
import Inventory from "./components/Inventory";
import Weather from "./components/Weather";
import Learning from "./components/Learning";
import WordSearch from "./components/WordSearch";
import TeaApothecary from "./components/TeaApothecary";
import GardenChallenges from "./components/GardenChallenges";
import PlantDirectory from "./components/PlantDirectory";
import PlantProfile from "./components/PlantProfile";
import JournalEntry from "./components/JournalEntry";
import JournalTimeline from "./components/JournalTimeline";
import PhotoManager from "./components/PhotoManager";
import BuddyJournal from "./components/dashboard/BuddyJournal";
import EstateEnvironmentSettings from "./components/EstateEnvironmentSettings";
import PlantEditor from "./components/PlantEditor";
import Conservatory from "./components/conservatory/Conservatory";
import ArchivedPlants from "./components/ArchivedPlants";
import PlantDeletionSnackbar from "./components/PlantDeletionSnackbar";
import EstateMenuDrawer from "./components/EstateMenuDrawer";

import "./styles/app.css";

function GardenApp() {
  const [page, setPage] = useState("Dashboard");
  const [conservatoryLaunch, setConservatoryLaunch] = useState({ companion: null, scopePlant: null, settingsOpen:false, launchId:0 });
  const [menuOpen,setMenuOpen]=useState(false);
  const menuTriggerRef=useRef(null);
  const closeMenu=useCallback(()=>setMenuOpen(false),[]);

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
  const startAddPlant = () => { setSelectedPlant(null); setPage("Plant Editor"); };
  const openConservatory = (companion = null, scopePlant = null, settingsOpen = false) => {
    setConservatoryLaunch({ companion, scopePlant, settingsOpen, launchId:Date.now() });
    setPage("The Conservatory");
  };
  const navigate = (nextPage) => {
    if (nextPage === "The Conservatory") setConservatoryLaunch({ companion: null, scopePlant: null, settingsOpen:false, launchId:Date.now() });
    setPage(nextPage);
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard journalEntries={journalEntries} onNavigate={navigate} menuOpen={menuOpen} onToggleMenu={()=>setMenuOpen((open)=>!open)} menuTriggerRef={menuTriggerRef} />;

      case "Orchard":
        return <Orchard onSelectPlant={openPlant} onAddPlant={startAddPlant} />;

      case "Plant Directory":
        return <PlantDirectory onSelectPlant={openPlant} onAddPlant={startAddPlant} onViewArchived={() => setPage("Archived Plants")} />;

      case "Archived Plants":
        return <ArchivedPlants onBack={() => setPage("Plant Directory")} />;

      case "Plant Profile":
        return (
          <PlantProfile
            plant={selectedPlant}
            journalEntries={journalEntries}
            onEdit={() => setPage("Plant Editor")}
            onExit={() => setPage("Plant Directory")}
            onConsult={(plant) => openConservatory("gardener", plant)}
          />
        );

      case "Plant Editor":
        return <PlantEditor plant={selectedPlant} onCancel={() => setPage(selectedPlant ? "Plant Profile" : "Plant Directory")} onSaved={(plant) => { setSelectedPlant(plant); setPage("Plant Profile"); }} onOpenExisting={openPlant} />;

      case "Add New Plant":
        return <PlantEditor plant={null} onCancel={() => setPage("Dashboard")} onSaved={(plant) => { setSelectedPlant(plant); setPage("Plant Profile"); }} onOpenExisting={openPlant} />;

      case "Garden":
        return <Garden onAddPlant={startAddPlant} />;

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
        return <Learning onNavigate={navigate} />;

      case "Tea Apothecary":
        return <TeaApothecary onNavigate={navigate} onConsultHerbalist={() => openConservatory("herbalist")} />;

      case "Garden Challenges":
        return <GardenChallenges onNavigate={setPage} />;

      case "Word Search":
        return <WordSearch />;

      case "Buddy's Garden Journal":
        return <BuddyJournal onBack={() => setPage("Dashboard")} onOpenConservatory={() => openConservatory("buddy")} />;

      case "The Conservatory":
        return <Conservatory key={conservatoryLaunch.launchId} onNavigate={navigate} initialCompanion={conservatoryLaunch.companion} scopePlant={conservatoryLaunch.scopePlant} initialSettingsOpen={conservatoryLaunch.settingsOpen} />;

      case "Estate Environment":
        return <EstateEnvironmentSettings onBack={() => setPage("Dashboard")} />;

      default:
        return <Dashboard journalEntries={journalEntries} onNavigate={setPage} />;
    }
  };

  const isDashboard = page === "Dashboard";

  return (
    <div
      className="app"
      style={isDashboard ? { maxWidth: "1024px", padding: 0 } : undefined}
    >
      {!isDashboard&&<button ref={menuTriggerRef} className="js-global-menu-trigger" type="button" aria-expanded={menuOpen} aria-controls="estate-navigation-drawer" onClick={()=>setMenuOpen((open)=>!open)}><span aria-hidden="true">☰</span> Menu</button>}

      <main>{renderPage()}</main>
      <EstateMenuDrawer open={menuOpen} onClose={closeMenu} onNavigate={navigate} onOpenConservatory={(companion,settingsOpen)=>openConservatory(companion,null,settingsOpen)} activePage={page} returnFocusRef={menuTriggerRef}/>
      <PlantDeletionSnackbar />
    </div>
  );
}

export default function App() {
  return (
    <EstateEnvironmentProvider>
      <GardenProvider>
        <GardenApp />
      </GardenProvider>
    </EstateEnvironmentProvider>
  );
}
