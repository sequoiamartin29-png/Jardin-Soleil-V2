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
import EstateAppShell from "./components/EstateAppShell";
import PlantHealthCenter from "./components/plantHealth/PlantHealthCenter";
import PlantFinder from "./components/plantFinder/PlantFinder";
import PlantFinderHistory from "./components/plantFinder/PlantFinderHistory";
import BuddyDailyLogger from "./components/buddy/BuddyDailyLogger";

import "./styles/app.css";

const estatePagePresentation = {
  Dashboard:{ theme:"dashboard", accent:"blush", title:"Dashboard" },
  Orchard:{ theme:"orchard", accent:"plum", title:"Orchard" },
  "Plant Directory":{ theme:"herbarium", accent:"sage", title:"Plant Directory" },
  "Plant Profile":{ theme:"herbarium", accent:"sage", title:"Plant Profile" },
  "Archived Plants":{ theme:"nursery", accent:"gold", title:"Archived Plants" },
  "Plant Health Center":{ theme:"plant-health", accent:"burgundy", title:"Plant Health Center" },
  "Plant Finder":{ theme:"herbarium", accent:"gold", title:"Plant Finder" },
  "Plant Finder History":{ theme:"herbarium", accent:"sage", title:"Plant Finder History" },
  "Plant Editor":{ theme:"nursery", accent:"sage", title:"Plant Record" },
  "Add New Plant":{ theme:"nursery", accent:"sage", title:"Add New Plant" },
  "Garden Collections":{ theme:"herbarium", accent:"sage", title:"Garden Collections" },
  Tasks:{ theme:"calendar", accent:"sage", title:"Estate Tasks" },
  Calendar:{ theme:"calendar", accent:"powder-blue", title:"Estate Calendar" },
  Logbook:{ theme:"journal", accent:"blush", title:"Garden Logbook" },
  "New Journal Entry":{ theme:"journal", accent:"blush", title:"New Journal Entry" },
  "Journal Timeline":{ theme:"journal", accent:"blush", title:"Journal Timeline" },
  "Photo Manager":{ theme:"journal", accent:"blush", title:"Photo Manager" },
  Gallery:{ theme:"journal", accent:"lavender", title:"Garden Gallery" },
  Inventory:{ theme:"nursery", accent:"gold", title:"Garden Inventory" },
  Weather:{ theme:"calendar", accent:"powder-blue", title:"Estate Weather" },
  Learning:{ theme:"learning", accent:"sage", title:"Learning Center" },
  "Tea Apothecary":{ theme:"apothecary", accent:"lavender", title:"Tea Apothecary" },
  "Garden Challenges":{ theme:"learning", accent:"gold", title:"Garden Challenges" },
  "Word Search":{ theme:"learning", accent:"sage", title:"Botanical Word Search" },
  "Buddy's Garden Journal":{ theme:"journal", accent:"sage", title:"Buddy’s Garden Journal" },
  "Buddy Garden Day":{ theme:"journal", accent:"sage", title:"Log My Garden Day" },
  "The Conservatory":{ theme:"conservatory", accent:"plum", title:"The Conservatory" },
  "Estate Environment":{ theme:"conservatory", accent:"powder-blue", title:"Estate Environment" },
};

function GardenApp() {
  const [page, setPage] = useState("Dashboard");
  const [conservatoryLaunch, setConservatoryLaunch] = useState({ companion: null, scopePlant: null, settingsOpen:false, launchId:0 });
  const [healthCenterLaunch, setHealthCenterLaunch] = useState({ plantId:"", diagnosisId:"", mode:"", launchId:0 });
  const [plantEditorPrefill, setPlantEditorPrefill] = useState(null);
  const [plantEditorReturnPage, setPlantEditorReturnPage] = useState("Plant Directory");
  const [navigationContext,setNavigationContext]=useState({page:"Dashboard",launchId:0});
  const [menuOpen,setMenuOpen]=useState(false);
  const menuTriggerRef=useRef(null);
  const closeMenu=useCallback(()=>setMenuOpen(false),[]);

  const {
    selectedPlant,
    setSelectedPlant,
    journalEntries,
    addJournalEntry,
    photos,
    updatePlantIdentification
  } = useGarden();

  const openPlant = (plant) => {
    setSelectedPlant(plant);
    navigate("Plant Profile");
  };
  const startAddPlant = () => { setSelectedPlant(null); setPlantEditorPrefill(null); setPlantEditorReturnPage(page === "Dashboard" ? "Dashboard" : page); navigate("Plant Editor"); };
  const editPlant = (plant) => { setSelectedPlant(plant); setPlantEditorPrefill(null); setPlantEditorReturnPage("Plant Profile"); navigate("Plant Editor"); };
  const openConservatory = (companion = null, scopePlant = null, settingsOpen = false) => {
    setConservatoryLaunch({ companion, scopePlant, settingsOpen, launchId:Date.now() });
    setMenuOpen(false);
    setPage("The Conservatory");
  };
  const openHealthCenter = ({ plantId = "", diagnosisId = "", mode = "", finderContext = null, photoIds = [], notes = "", traits = null } = {}) => {
    setHealthCenterLaunch({ plantId, diagnosisId, mode, finderContext:finderContext || (photoIds.length || notes || traits ? { photoIds, notes, traits } : null), launchId:Date.now() });
    setMenuOpen(false);
    setPage("Plant Health Center");
  };
  const navigate = (nextPage, context = {}) => {
    setMenuOpen(false);
    setNavigationContext({ page:nextPage, ...context, launchId:Date.now() });
    if (nextPage === "The Conservatory") setConservatoryLaunch({ companion: null, scopePlant: null, settingsOpen:false, launchId:Date.now() });
    if (nextPage === "Plant Health Center") setHealthCenterLaunch({ plantId:"", diagnosisId:"", mode:"", finderContext:null, launchId:Date.now() });
    setPage(nextPage);
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard journalEntries={journalEntries} onNavigate={navigate} />;

      case "Orchard":
        return <Orchard onSelectPlant={openPlant} onEditPlant={editPlant} onAddPlant={startAddPlant} />;

      case "Plant Directory":
        return <PlantDirectory key={`plant-directory-${navigationContext.launchId}`} initialSearch={navigationContext.initialSearch || ""} initialFilter={navigationContext.initialFilter || "All"} onSelectPlant={openPlant} onEditPlant={editPlant} onAddPlant={startAddPlant} onOpenPlantFinder={() => navigate("Plant Finder")} onViewArchived={() => navigate("Archived Plants")} />;

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
        return <PlantHealthCenter key={healthCenterLaunch.launchId} initialPlantId={healthCenterLaunch.plantId} initialDiagnosisId={healthCenterLaunch.diagnosisId} initialMode={healthCenterLaunch.mode} initialFinderContext={healthCenterLaunch.finderContext} onOpenPlantFinder={() => navigate("Plant Finder")} onConsult={(plant) => openConservatory("gardener", plant)} />;

      case "Plant Finder":
        return <PlantFinder onNavigate={navigate} onConsultHeadGardener={() => openConservatory("gardener")} onOpenHealthCenter={(finderContext) => openHealthCenter({ mode:"wizard", finderContext, ...finderContext })} onAddToEstate={(candidate, identification, preparedPhoto = null) => {
          const photo = preparedPhoto || photos.find((item) => identification.photoIds?.includes(item.id));
          setSelectedPlant(null);
          setPlantEditorReturnPage("Plant Finder");
          setPlantEditorPrefill({
            identificationId:identification.id,
            photo,
            values:{ name:candidate.commonName || "", botanicalName:candidate.botanicalName || "", category:candidate.category || "Other / Uncategorized", type:candidate.type || candidate.form?.[0] || "Other", group:candidate.group || "Other / Uncategorized", source:"Plant Finder", identifiedAt:identification.date, identificationConfidence:identification.confidence, plantFinderIdentificationId:identification.id, notes:[identification.notes, `Plant Finder ${identification.confidence} confidence; identified ${identification.date}. User confirmation required.`].filter(Boolean).join("\n"), tags:["Plant Finder", identification.verificationStatus] },
          });
          navigate("Plant Editor");
        }} />;

      case "Plant Finder History":
        return <PlantFinderHistory onBack={() => navigate("Plant Finder")} onAddToEstate={(candidate, identification) => {
          const photo = photos.find((item) => identification.photoIds?.includes(item.id));
          setSelectedPlant(null);
          setPlantEditorReturnPage("Plant Finder History");
          setPlantEditorPrefill({ identificationId:identification.id, photo, values:{ name:candidate.commonName || "", botanicalName:candidate.botanicalName || "", category:candidate.category || "Other / Uncategorized", type:candidate.type || candidate.form?.[0] || "Other", group:candidate.group || "Other / Uncategorized", source:"Plant Finder", identifiedAt:identification.date, identificationConfidence:identification.confidence, plantFinderIdentificationId:identification.id, notes:[identification.notes, `Plant Finder ${identification.confidence} confidence; identified ${identification.date}. User confirmation required.`].filter(Boolean).join("\n"), tags:["Plant Finder", identification.verificationStatus] } });
          navigate("Plant Editor");
        }} />;

      case "Plant Editor":
        return <PlantEditor plant={selectedPlant} initialValues={plantEditorPrefill?.values} initialPhoto={plantEditorPrefill?.photo} onOpenPlantFinder={() => navigate("Plant Finder")} onCancel={() => navigate(selectedPlant ? "Plant Profile" : plantEditorReturnPage)} onSaved={(plant) => { if (plantEditorPrefill?.identificationId) updatePlantIdentification(plantEditorPrefill.identificationId, { verificationStatus:"Added to Estate", estatePlantId:plant.id }); setPlantEditorPrefill(null); setSelectedPlant(plant); navigate("Plant Profile"); }} onOpenExisting={openPlant} />;

      case "Add New Plant":
        return <PlantEditor plant={null} onOpenPlantFinder={() => navigate("Plant Finder")} onCancel={() => navigate("Dashboard")} onSaved={(plant) => { setSelectedPlant(plant); navigate("Plant Profile"); }} onOpenExisting={openPlant} />;

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
        return <BuddyJournal onBack={() => navigate("Dashboard")} onOpenLogger={() => navigate("Buddy Garden Day")} onOpenConservatory={() => openConservatory("buddy")} onOpenHealthCenter={(diagnosisId) => openHealthCenter({ diagnosisId })} />;

      case "Buddy Garden Day":
        return <BuddyDailyLogger onNavigate={navigate} />;

      case "The Conservatory":
        return <Conservatory key={conservatoryLaunch.launchId} onNavigate={navigate} onOpenLogger={() => navigate("Buddy Garden Day")} initialCompanion={conservatoryLaunch.companion} scopePlant={conservatoryLaunch.scopePlant} initialSettingsOpen={conservatoryLaunch.settingsOpen} />;

      case "Estate Environment":
        return <EstateEnvironmentSettings onBack={() => navigate("Dashboard")} />;

      default:
        return <Dashboard journalEntries={journalEntries} onNavigate={navigate} />;
    }
  };

  const presentation = estatePagePresentation[page] || { theme:"herbarium", accent:"sage", title:page };
  const pageTitle = page === "Plant Editor"
    ? selectedPlant ? `Edit ${selectedPlant.nickname || selectedPlant.name}` : "Add New Plant"
    : presentation.title;

  return (
    <div className="app">
      <EstateAppShell
        page={page}
        pageTitle={pageTitle}
        theme={presentation.theme}
        accent={presentation.accent}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        menuTriggerRef={menuTriggerRef}
        onNavigate={navigate}
      >
        {renderPage()}
      </EstateAppShell>
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
