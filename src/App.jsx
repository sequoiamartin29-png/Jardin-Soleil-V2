import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GardenProvider, useGarden } from "./context/GardenContext";
import { EstateEnvironmentProvider } from "./context/EstateEnvironmentContext";

import PlantDeletionSnackbar from "./components/PlantDeletionSnackbar";
import EstateMenuDrawer from "./components/EstateMenuDrawer";
import EstateAppShell from "./components/EstateAppShell";
import DashboardSkinDialog from "./components/DashboardSkinDialog";
import HealthCenterErrorBoundary from "./components/plantHealth/HealthCenterErrorBoundary";
import AppErrorBoundary from "./components/AppErrorBoundary";
import PageLoading from "./components/PageLoading";
import { HEALTH_PAGE_KEY } from "./utils/healthCaseDraft";
import { initializeNativeApp } from "./services/nativeApp";
import {
  DASHBOARD_SKIN_STORAGE_KEY,
  getDashboardSkin,
  loadStoredDashboardSkinId,
} from "./data/dashboardSkins";
import {
  resolveCustomerCompanion,
  resolveCustomerRoute,
} from "./data/customerFeatures";
import {
  buildPlantHealthAlerts,
  unreadPlantHealthAlerts,
} from "./utils/plantHealthAlerts";
import { isOrchardFruitTree } from "./utils/plantClassification";

import "./styles/app.css";

const Dashboard = lazy(() => import("./components/Dashboard"));
const Orchard = lazy(() => import("./components/Orchard"));
const Garden = lazy(() => import("./components/Garden"));
const Logbook = lazy(() => import("./components/Logbook"));
const Gallery = lazy(() => import("./components/Gallery"));
const Inventory = lazy(() => import("./components/Inventory"));
const Tasks = lazy(() => import("./components/Tasks"));
const Calendar = lazy(() => import("./components/Calendar"));
const Weather = lazy(() => import("./components/Weather"));
const WateringWizard = lazy(() => import("./components/WateringWizard"));
const Learning = lazy(() => import("./components/Learning"));
const WordSearch = lazy(() => import("./components/WordSearch"));
const TeaApothecary = lazy(() => import("./components/TeaApothecary"));
const GardenChallenges = lazy(() => import("./components/GardenChallenges"));
const GardenMatch = lazy(() => import("./components/gardenMatch/GardenMatch"));
const PlantDirectory = lazy(() => import("./components/PlantDirectory"));
const PlantProfile = lazy(() => import("./components/PlantProfile"));
const JournalEntry = lazy(() => import("./components/JournalEntry"));
const JournalTimeline = lazy(() => import("./components/JournalTimeline"));
const JournalHub = lazy(() => import("./components/JournalHub"));
const PhotoManager = lazy(() => import("./components/PhotoManager"));
const BuddyJournal = lazy(() => import("./components/dashboard/BuddyJournal"));
const EstateEnvironmentSettings = lazy(() => import("./components/EstateEnvironmentSettings"));
const PlantEditor = lazy(() => import("./components/PlantEditor"));
const Conservatory = lazy(() => import("./components/conservatory/Conservatory"));
const ArchivedPlants = lazy(() => import("./components/ArchivedPlants"));
const PlantHealthCenter = lazy(() => import("./components/plantHealth/PlantHealthCenter"));
const PlantFinder = lazy(() => import("./components/plantFinder/PlantFinder"));
const PlantFinderHistory = lazy(() => import("./components/plantFinder/PlantFinderHistory"));
const BuddyDailyLogger = lazy(() => import("./components/buddy/BuddyDailyLogger"));
const BuddyGarden = lazy(() => import("./components/BuddyGarden"));
const GardenGames = lazy(() => import("./components/GardenGames"));
const GardenOnboarding = lazy(() => import("./components/GardenOnboarding"));
const GardenSettings = lazy(() => import("./components/GardenSettings"));
const Privacy = lazy(() => import("./components/Privacy"));

const PLANT_HEALTH_NAVIGATION_KEY = "jardinSoleilPlantHealthNavigation";
const emptyHealthLaunch = { plantId:"", diagnosisId:"", mode:"", finderContext:null, launchId:0 };
const loadHealthLaunch = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PLANT_HEALTH_NAVIGATION_KEY) || "{}");
    return { ...emptyHealthLaunch, ...saved, launchId:Date.now() };
  } catch {
    return emptyHealthLaunch;
  }
};
const saveHealthLaunch = (launch) => {
  try {
    localStorage.setItem(PLANT_HEALTH_NAVIGATION_KEY, JSON.stringify({
      plantId:launch.plantId || "",
      diagnosisId:launch.diagnosisId || "",
      mode:launch.mode || "",
      finderContext:launch.finderContext || null,
    }));
  } catch {
    // Navigation remains available for the current session.
  }
};

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
  Journal:{ theme:"journal", accent:"blush", title:"Journal" },
  "New Journal Entry":{ theme:"journal", accent:"blush", title:"New Journal Entry" },
  "Journal Timeline":{ theme:"journal", accent:"blush", title:"Journal Timeline" },
  "Photo Manager":{ theme:"journal", accent:"blush", title:"Photo Manager" },
  Gallery:{ theme:"journal", accent:"lavender", title:"Garden Gallery" },
  Inventory:{ theme:"nursery", accent:"gold", title:"Garden Inventory" },
  Weather:{ theme:"calendar", accent:"powder-blue", title:"Estate Weather" },
  "Watering Wizard":{ theme:"watering-wizard", accent:"powder-blue", title:"Watering Wizard" },
  Learning:{ theme:"learning", accent:"sage", title:"Learning Center" },
  "Tea Apothecary":{ theme:"apothecary", accent:"lavender", title:"Tea Apothecary" },
  "Garden Challenges":{ theme:"learning", accent:"gold", title:"Garden Challenges" },
  "Garden Match":{ theme:"learning", accent:"gold", title:"Garden Match" },
  "Word Search":{ theme:"learning", accent:"sage", title:"Botanical Word Search" },
  "Garden Games":{ theme:"learning", accent:"gold", title:"Garden Games" },
  "Buddy's Garden":{ theme:"learning", accent:"gold", title:"Buddy’s Garden" },
  "Buddy's Garden Journal":{ theme:"journal", accent:"sage", title:"Buddy’s Garden Journal" },
  "Buddy Garden Day":{ theme:"journal", accent:"sage", title:"Log My Garden Day" },
  "The Conservatory":{ theme:"conservatory", accent:"plum", title:"The Conservatory" },
  "Estate Environment":{ theme:"conservatory", accent:"powder-blue", title:"Estate Environment" },
  "Garden Settings":{ theme:"nursery", accent:"gold", title:"Garden Profile & Data" },
  "Privacy & Support":{ theme:"herbarium", accent:"sage", title:"Privacy & Support" },
};

function GardenApp() {
  const validPages = Object.keys(estatePagePresentation);
  const [page, setPage] = useState(() => {
    try {
      const saved=resolveCustomerRoute(localStorage.getItem(HEALTH_PAGE_KEY));
      return validPages.includes(saved) ? saved : "Dashboard";
    } catch {
      return "Dashboard";
    }
  });
  const [conservatoryLaunch, setConservatoryLaunch] = useState({ companion: null, scopePlant: null, settingsOpen:false, launchId:0 });
  const [healthCenterLaunch, setHealthCenterLaunch] = useState(loadHealthLaunch);
  const [plantEditorPrefill, setPlantEditorPrefill] = useState(null);
  const [plantEditorReturnPage, setPlantEditorReturnPage] = useState("Plant Directory");
  const [navigationContext,setNavigationContext]=useState(() => (
    page === "Plant Health Center"
      ? { page, ...loadHealthLaunch(), launchId:Date.now() }
      : { page:"Dashboard", launchId:0 }
  ));
  const [menuOpen,setMenuOpen]=useState(false);
  const [dashboardSkinId,setDashboardSkinId]=useState(loadStoredDashboardSkinId);
  const [dashboardSkinPreviewId,setDashboardSkinPreviewId]=useState(loadStoredDashboardSkinId);
  const [dashboardSkinDialogOpen,setDashboardSkinDialogOpen]=useState(false);
  const menuTriggerRef=useRef(null);
  const nativeBackHandlerRef=useRef(() => false);
  const closeMenu=useCallback(()=>setMenuOpen(false),[]);
  useEffect(() => { try { localStorage.setItem(HEALTH_PAGE_KEY, page); } catch { /* navigation remains usable */ } }, [page]);
  useEffect(() => {
    try { localStorage.setItem(DASHBOARD_SKIN_STORAGE_KEY, dashboardSkinId); } catch { /* preview and selection still work in memory */ }
  }, [dashboardSkinId]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById("estate-page-content");
      main?.focus({ preventScroll:true });
      globalThis.scrollTo?.({ top:0, behavior:"auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [page]);

  const {
    gardenProfile,
    selectedPlant,
    setSelectedPlant,
    journalEntries,
    addJournalEntry,
    photos,
    updatePlantIdentification,
    plantDiagnoses,
    plants,
    updatePlant,
    updatePlantDiagnosis,
  } = useGarden();
  const healthAlerts = useMemo(() => buildPlantHealthAlerts({
    plantDiagnoses,
    plants,
    photos,
  }), [plantDiagnoses, plants, photos]);
  const unreadHealthAlerts = useMemo(() => unreadPlantHealthAlerts(healthAlerts), [healthAlerts]);

  const markHealthAlertReviewed = (alert) => {
    if (!alert?.unread) return;
    const reviewedAt = new Date().toISOString();
    if (alert.healthCaseId) {
      updatePlantDiagnosis(alert.healthCaseId, { alertReviewedAt:reviewedAt, acknowledgedAt:reviewedAt });
    } else if (alert.plantId) {
      updatePlant(alert.plantId, { healthAlertReviewedAt:reviewedAt });
    }
  };

  const openPlant = (plant) => {
    setSelectedPlant(plant);
    navigate("Plant Profile");
  };
  const startAddPlant = () => { setSelectedPlant(null); setPlantEditorPrefill(null); setPlantEditorReturnPage(page === "Dashboard" ? "Dashboard" : page); navigate("Plant Editor"); };
  const editPlant = (plant) => { setSelectedPlant(plant); setPlantEditorPrefill(null); setPlantEditorReturnPage("Plant Profile"); navigate("Plant Editor"); };
  const openConservatory = (companion = null, scopePlant = null, settingsOpen = false) => {
    setConservatoryLaunch({ companion:resolveCustomerCompanion(companion), scopePlant, settingsOpen, launchId:Date.now() });
    setMenuOpen(false);
    setPage("The Conservatory");
  };
  const openHealthCenter = ({ plantId = "", diagnosisId = "", mode = "", finderContext = null, photoIds = [], notes = "", traits = null } = {}) => {
    const launch = { plantId, diagnosisId, mode, finderContext:finderContext || (photoIds.length || notes || traits ? { photoIds, notes, traits } : null), launchId:Date.now() };
    setHealthCenterLaunch(launch);
    saveHealthLaunch(launch);
    setNavigationContext({ page:"Plant Health Center", ...launch });
    setMenuOpen(false);
    setPage("Plant Health Center");
  };
  const navigate = (nextPage, context = {}) => {
    nextPage = resolveCustomerRoute(nextPage);
    const journalAliases = { Logbook:"logs", "Journal Timeline":"timeline" };
    if (journalAliases[nextPage]) { context = { ...context, journalView:journalAliases[nextPage] }; nextPage = "Journal"; }
    setMenuOpen(false);
    setNavigationContext({ page:nextPage, ...context, launchId:Date.now() });
    if (nextPage === "Plant Profile" && context.plantId) {
      setSelectedPlant(plants.find((plant) => plant.id === context.plantId) || null);
    }
    if (nextPage === "The Conservatory") setConservatoryLaunch({ companion: null, scopePlant: null, settingsOpen:false, launchId:Date.now() });
    if (nextPage === "Plant Health Center") {
      const launch = {
        plantId:context.plantId || "",
        diagnosisId:context.diagnosisId || "",
        mode:context.mode || "",
        finderContext:context.finderContext || null,
        launchId:Date.now(),
      };
      setHealthCenterLaunch(launch);
      saveHealthLaunch(launch);
    }
    setPage(nextPage);
  };
  nativeBackHandlerRef.current = () => {
    if (menuOpen) {
      closeMenu();
      return true;
    }
    if (page !== "Dashboard") {
      navigate("Dashboard");
      return true;
    }
    return false;
  };
  useEffect(() => {
    let active = true;
    let cleanup = () => {};
    initializeNativeApp({
      onBack:() => nativeBackHandlerRef.current(),
    }).then((dispose) => {
      if (active) cleanup = dispose;
      else dispose();
    });
    return () => {
      active = false;
      cleanup();
    };
  }, []);
  const openDashboardSkins = () => {
    setDashboardSkinPreviewId(dashboardSkinId);
    setDashboardSkinDialogOpen(true);
  };
  const closeDashboardSkins = () => {
    setDashboardSkinPreviewId(dashboardSkinId);
    setDashboardSkinDialogOpen(false);
  };
  const applyDashboardSkin = (skinId) => {
    const nextId = getDashboardSkin(skinId).id;
    setDashboardSkinId(nextId);
    setDashboardSkinPreviewId(nextId);
    setDashboardSkinDialogOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard skinId={dashboardSkinDialogOpen ? dashboardSkinPreviewId : dashboardSkinId} onNavigate={navigate} />;

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
            initialSection={navigationContext.section || ""}
            journalEntries={journalEntries}
            onEdit={() => navigate("Plant Editor")}
            onExit={() => navigate("Plant Directory")}
            onConsult={(plant) => openConservatory("gardener", plant)}
            onDiagnose={(plant) => openHealthCenter({ plantId:plant.id, mode:"wizard" })}
            onOpenDiagnosis={(diagnosis) => openHealthCenter({ plantId:diagnosis.plantId, diagnosisId:diagnosis.id })}
          />
        );

      case "Plant Health Center":
        return <HealthCenterErrorBoundary onRestore={() => openHealthCenter({})} onHome={() => openHealthCenter({})} onDashboard={() => navigate("Dashboard")}><PlantHealthCenter key={healthCenterLaunch.launchId} initialPlantId={healthCenterLaunch.plantId} initialDiagnosisId={healthCenterLaunch.diagnosisId} initialMode={healthCenterLaunch.mode} initialFinderContext={healthCenterLaunch.finderContext} alerts={healthAlerts} onReviewAlert={markHealthAlertReviewed} onOpenPlant={(plantId) => navigate("Plant Profile", { plantId, section:"health" })} onOpenPlantFinder={() => navigate("Plant Finder")} onConsult={(plant) => openConservatory("gardener", plant)} /></HealthCenterErrorBoundary>;

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
        return <PlantEditor plant={selectedPlant} initialValues={plantEditorPrefill?.values} initialPhoto={plantEditorPrefill?.photo} onOpenPlantFinder={() => navigate("Plant Finder")} onCancel={() => navigate(selectedPlant ? "Plant Profile" : plantEditorReturnPage)} onSaved={(plant) => { if (plantEditorPrefill?.identificationId) updatePlantIdentification(plantEditorPrefill.identificationId, { verificationStatus:"Added to Estate", estatePlantId:plant.id }); setPlantEditorPrefill(null); setSelectedPlant(plant); navigate("Plant Profile"); }} onRemoved={({plant}) => { setPlantEditorPrefill(null); navigate(isOrchardFruitTree(plant) ? "Orchard" : "Plant Directory"); }} onOpenExisting={openPlant} />;

      case "Add New Plant":
        return <PlantEditor plant={null} onOpenPlantFinder={() => navigate("Plant Finder")} onCancel={() => navigate("Dashboard")} onSaved={(plant) => { setSelectedPlant(plant); navigate("Plant Profile"); }} onOpenExisting={openPlant} />;

      case "Garden Collections":
        return <Garden onAddPlant={startAddPlant} onSelectPlant={openPlant} onEditPlant={editPlant} onManageZones={() => navigate("Garden Settings", { settingsSection:"manage" })} />;

      case "Tasks":
        return <Tasks onNavigate={navigate} />;

      case "Calendar":
        return <Calendar onNavigate={navigate} />;

      case "Logbook":
        return <Logbook onNavigate={navigate} />;

      case "Journal":
        return <JournalHub key={`journal-${navigationContext.launchId}`} initialView={navigationContext.journalView || "recent"} onNavigate={navigate} />;

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

      case "Watering Wizard":
        return <WateringWizard />;

      case "Learning":
        return <Learning onNavigate={navigate} />;

      case "Tea Apothecary":
        return <TeaApothecary onNavigate={navigate} onConsultHerbalist={() => openConservatory("herbalist")} />;

      case "Garden Challenges":
        return <GardenChallenges onNavigate={navigate} />;

      case "Garden Games":
        return <GardenGames onNavigate={navigate} />;

      case "Buddy's Garden":
        return <BuddyGarden onNavigate={navigate} />;

      case "Garden Match":
        return <GardenMatch onNavigate={navigate} />;

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

      case "Garden Settings":
        return <GardenSettings key={`garden-settings-${navigationContext.launchId}`} initialSection={navigationContext.settingsSection || "profile"} onNavigate={navigate} />;

      case "Privacy & Support":
        return <Privacy onNavigate={navigate} />;

      default:
        return <Dashboard skinId={dashboardSkinDialogOpen ? dashboardSkinPreviewId : dashboardSkinId} onNavigate={navigate} />;
    }
  };

  const presentation = estatePagePresentation[page] || { theme:"herbarium", accent:"sage", title:page };
  const pageTitle = page === "Plant Editor"
    ? selectedPlant ? `Edit ${selectedPlant.nickname || selectedPlant.name}` : "Add New Plant"
    : presentation.title;

  if (!gardenProfile.onboardingCompleted) {
    return <Suspense fallback={<PageLoading label="Preparing your garden" />}><GardenOnboarding onComplete={() => navigate("Dashboard")} /></Suspense>;
  }

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
        sampleGardenEnabled={gardenProfile.sampleGardenEnabled}
      >
        <Suspense fallback={<PageLoading label={`Opening ${pageTitle}`} />}>
          {renderPage()}
        </Suspense>
      </EstateAppShell>
      <EstateMenuDrawer open={menuOpen} onClose={closeMenu} onNavigate={navigate} onOpenAppearance={openDashboardSkins} activePage={page} activeContext={navigationContext} healthAlerts={unreadHealthAlerts} returnFocusRef={menuTriggerRef}/>
      <DashboardSkinDialog
        open={dashboardSkinDialogOpen}
        activeSkinId={dashboardSkinId}
        previewSkinId={dashboardSkinPreviewId}
        onPreview={(skinId) => setDashboardSkinPreviewId(getDashboardSkin(skinId).id)}
        onApply={applyDashboardSkin}
        onClose={closeDashboardSkins}
      />
      <PlantDeletionSnackbar />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <EstateEnvironmentProvider>
        <GardenProvider>
          <GardenApp />
        </GardenProvider>
      </EstateEnvironmentProvider>
    </AppErrorBoundary>
  );
}
