import React, { useCallback, useRef, useState } from "react";

import { GardenProvider, useGarden } from "./context/GardenContext";
import { EstateEnvironmentProvider } from "./context/EstateEnvironmentContext";

import Dashboard from "./components/Dashboard";
import Orchard from "./components/Orchard";
import Garden from "./components/Garden";
import Logbook from "./components/Logbook";
import Gallery from "./components/Gallery";
import Inventory from "./components/Inventory";
import Tasks from "./components/Tasks";
import Calendar from "./components/Calendar";
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
import PlantHealthCenter from "./components/plantHealth/PlantHealthCenter";

import "./styles/app.css";

function GardenApp() {
  const [page, setPage] = useState("Dashboard");
  const [conservatoryLaunch, setConservatoryLaunch] = useState({ companion: null, scopePlant: null, settingsOpen:false, launchId:0 });
  const [healthCenterLaunch, setHealthCenterLaunch] = useState({ plantId:"", diagnosisId:"", mode:"", launchId:0 });
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
    navigate("Plant Profile");
  };
  const startAddPlant = () => { setSelectedPlant(null); navigate("Plant Editor"); };
  const editPlant = (plant) => { setSelectedPlant(plant); navigate("Plant Editor"); };
  const openConservatory = (companion = null, scopePlant = null, settingsOpen = false) => {
    setConservatoryLaunch({ companion, scopePlant, settingsOpen, launchId:Date.now() });
    setMenuOpen(false);
    setPage("The Conservatory");
  };
  const openHealthCenter = ({ plantId = "", diagnosisId = "", mode = "" } = {}) => {
    setHealthCenterLaunch({ plantId, diagnosisId, mode, launchId:Date.now() });
    setMenuOpen(false);
    setPage("Plant Health Center");
  };
  const navigate = (nextPage) => {
    setMenuOpen(false);
    if (nextPage === "The Conservatory") setConservatoryLaunch({ companion: null, scopePlant: null, settingsOpen:false, launchId:Date.now() });
    if (nextPage === "Plant Health Center") setHealthCenterLaunch({ plantId:"", diagnosisId:"", mode:"", launchId:Date.now() });
    setPage(nextPage);
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard journalEntries={journalEntries} onNavigate={navigate} menuOpen={menuOpen} onToggleMenu={()=>setMenuOpen((open)=>!open)} menuTriggerRef={menuTriggerRef} />;

      case "Orchard":
        return <Orchard onSelectPlant={openPlant} onEditPlant={editPlant} onAddPlant={startAddPlant} />;

      case "Plant Directory":
        return <PlantDirectory onSelectPlant={openPlant} onEditPlant={editPlant} onAddPlant={startAddPlant} onViewArchived={() => navigate("Archived Plants")} />;

      case "Archived Plants":
        return <ArchivedPlants onBack={() => navigate("Plant Directory")} />;

      case "Plant Profile":
        return (
          <PlantProfile
            plant={selectedPlant}
            journalEntries={journalEntries}
            onEdit={() => navigate("Plant Editor")}
            onExit={() => navigate("Plant Directory")}
            onConsult={(plant) => openConservatory("gardener", plant)}
            onDiagnose={(plant) => openHealthCenter({ plantId:plant.id, mode:"wizard" })}
            onOpenDiagnosis={(diagnosis) => openHealthCenter({ plantId:diagnosis.plantId, diagnosisId:diagnosis.id })}
          />
        );

      case "Plant Health Center":
        return <PlantHealthCenter key={healthCenterLaunch.launchId} initialPlantId={healthCenterLaunch.plantId} initialDiagnosisId={healthCenterLaunch.diagnosisId} initialMode={healthCenterLaunch.mode} onConsult={(plant) => openConservatory("gardener", plant)} />;

      case "Plant Editor":
        return <PlantEditor plant={selectedPlant} onCancel={() => navigate(selectedPlant ? "Plant Profile" : "Plant Directory")} onSaved={(plant) => { setSelectedPlant(plant); navigate("Plant Profile"); }} onOpenExisting={openPlant} />;

      case "Add New Plant":
        return <PlantEditor plant={null} onCancel={() => navigate("Dashboard")} onSaved={(plant) => { setSelectedPlant(plant); navigate("Plant Profile"); }} onOpenExisting={openPlant} />;

      case "Garden Collections":
        return <Garden onAddPlant={startAddPlant} onSelectPlant={openPlant} onEditPlant={editPlant} />;

      case "Tasks":
        return <Tasks onNavigate={navigate} />;

      case "Calendar":
        return <Calendar onNavigate={navigate} />;

      case "Logbook":
        return <Logbook onNavigate={navigate} />;

      case "New Journal Entry":
        return (
          <JournalEntry
            onSaveEntry={addJournalEntry}
            onNavigate={navigate}
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
        return <Gallery onNavigate={navigate} />;

      case "Inventory":
        return <Inventory />;

      case "Weather":
        return <Weather />;

      case "Learning":
        return <Learning onNavigate={navigate} />;

      case "Tea Apothecary":
        return <TeaApothecary onNavigate={navigate} onConsultHerbalist={() => openConservatory("herbalist")} />;

      case "Garden Challenges":
        return <GardenChallenges onNavigate={navigate} />;

      case "Word Search":
        return <WordSearch />;

      case "Buddy's Garden Journal":
        return <BuddyJournal onBack={() => navigate("Dashboard")} onOpenConservatory={() => openConservatory("buddy")} onOpenHealthCenter={(diagnosisId) => openHealthCenter({ diagnosisId })} />;

      case "The Conservatory":
        return <Conservatory key={conservatoryLaunch.launchId} onNavigate={navigate} initialCompanion={conservatoryLaunch.companion} scopePlant={conservatoryLaunch.scopePlant} initialSettingsOpen={conservatoryLaunch.settingsOpen} />;

      case "Estate Environment":
        return <EstateEnvironmentSettings onBack={() => navigate("Dashboard")} />;

      default:
        return <Dashboard journalEntries={journalEntries} onNavigate={navigate} />;
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
