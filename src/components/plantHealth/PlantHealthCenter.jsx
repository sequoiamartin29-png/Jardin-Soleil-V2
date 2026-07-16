import React, { useEffect, useMemo, useState } from "react";
import { useGarden } from "../../context/GardenContext";
import { useEstateEnvironment } from "../../context/EstateEnvironmentContext";
import BotanicalIcon from "../icons/BotanicalIcon";
import { EstateActionButton, EstateDataCard, EstatePageShell } from "../EstatePageSystem";
import { buildDiagnosticContext } from "../../utils/buildDiagnosticContext";
import { rankPlantConditions } from "../../utils/rankPlantConditions";
import DiagnosticResults from "./DiagnosticResults";
import DiagnosisHistory from "./DiagnosisHistory";
import EstateHealthReview from "./EstateHealthReview";
import PhotoDiagnosis from "./PhotoDiagnosis";
import SymptomWizard from "./SymptomWizard";
import "./PlantHealthCenter.css";
import { clearHealthDraft, createHealthDraft, loadHealthDraft, saveHealthDraft } from "../../utils/healthCaseDraft";

export default function PlantHealthCenter({ initialPlantId = "", initialDiagnosisId = "", initialMode = "", initialFinderContext = null, onConsult, onOpenPlantFinder }) {
  const garden = useGarden();
  const environment = useEstateEnvironment();
  const restoredDraft = useMemo(() => loadHealthDraft(), []);
  const [view, setView] = useState(initialDiagnosisId ? "history" : initialMode || (restoredDraft ? restoredDraft.currentStep === "photos" ? "photo" : "wizard" : "home"));
  const [draft, setDraft] = useState(() => restoredDraft || createHealthDraft({
    ...(initialPlantId ? { plantId:initialPlantId } : {}),
    ...(initialFinderContext || {}),
    ...(initialFinderContext ? { notice:"Plant Finder field evidence was carried into this separate health review. Choose an existing estate plant before preparing a diagnosis; the possible species match is not treated as a diagnosis." } : {}),
  }));
  const [result, setResult] = useState(null);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(initialDiagnosisId);
  const selectedDiagnosis = garden.plantDiagnoses.find((item) => item.id === selectedDiagnosisId);
  const selectedPlant = garden.activePlants.find((item) => item.id === (draft.plantId || selectedDiagnosis?.plantId));
  const activeCount = garden.plantDiagnoses.filter((item) => item.status !== "Resolved").length;
  useEffect(() => { if (draft?.status === "Draft") saveHealthDraft(draft); }, [draft]);
  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch, updatedAt:new Date().toISOString() }));
  const begin = (step="photos") => { const next=createHealthDraft({ ...(initialPlantId?{plantId:initialPlantId}:{}), currentStep:step }); setDraft(next); setResult(null); setView(step === "photos" ? "photo" : "wizard"); };
  const discard = () => { if (!window.confirm("Discard this unfinished health check? This cannot be undone.")) return; clearHealthDraft(); setDraft(createHealthDraft()); setView("home"); };

  const prepareAssessment = (assessment) => {
    const plant = garden.activePlants.find((item) => item.id === assessment.plantId);
    if (!plant) return;
    const context = buildDiagnosticContext({ plant, journalEntries:garden.journalEntries, environment, assessment });
    setResult({ context, analysis:rankPlantConditions(context) });
    setView("results");
  };

  const prepareExternalAssessment = ({ plantId, affectedArea, photoIds, analysis }) => {
    const plant = garden.activePlants.find((item) => item.id === plantId);
    if (!plant) return;
    const context = buildDiagnosticContext({ plant, journalEntries:garden.journalEntries, environment, assessment:{ plantId, affectedArea, photoIds, photoMode:"external", symptoms:analysis.symptoms || [], pestEvidence:analysis.pestEvidence || [], recentConditions:[], timeline:"photo submitted" } });
    const ranked = (analysis.possibilities || []).slice(0, 3).map((item, index) => ({ id:item.id || `external-${index}`, name:item.name || item.label || "Possible visual match", category:item.category || "Unconfirmed", why:item.why || ["Possible image-based visual match; direct confirmation is still required."], conflictingEvidence:item.conflictingEvidence || "A photo cannot establish absence of conflicting evidence.", inspectNext:item.inspectNext || "Inspect the affected tissue directly and compare nearby growth.", cultural:item.cultural || "Use only low-risk cultural care while confirming the cause.", score:item.score || 0 }));
    setResult({ context, analysis:{ ranked:ranked.length ? ranked : rankPlantConditions(context).ranked, confidence:analysis.confidence || "Low", limitation:analysis.limitation || "Image findings are possible matches only and cannot confirm a diagnosis." } });
    setView("results");
  };

  const saveDiagnosis = (record) => {
    const saved = garden.addPlantDiagnosis(record);
    clearHealthDraft();
    setSelectedDiagnosisId(saved.id);
    setView("history");
  };

  const openHistory = (diagnosisId) => { setSelectedDiagnosisId(diagnosisId); setView("history"); };
  const startWizard = (nextDraft = draft) => { updateDraft({ ...nextDraft, currentStep:"symptoms" }); setResult(null); setView("wizard"); };
  const actions = <><EstateActionButton variant="quiet" onClick={onOpenPlantFinder}>Identify an Unknown Plant</EstateActionButton><EstateActionButton variant="ledger" onClick={() => setView("review")}>Estate Health Review</EstateActionButton>{selectedPlant && <EstateActionButton variant="gate" onClick={() => onConsult?.(selectedPlant)}>Consult the Head Gardener</EstateActionButton>}</>;

  return (
    <EstatePageShell id="plant-health-center-title" eyebrow="Jardin Soleil · Botanical Infirmary" title="Estate Plant Health Center" subtitle="Thoughtful disease, pest, and stress assessment grounded in saved estate records" icon="herb" className="js-plant-health" actions={actions}>
      {view !== "home" && <nav className="js-plant-health__local-nav" aria-label="Plant Health Center sections"><button type="button" onClick={() => setView("home")}>Health Center Home</button><button type="button" onClick={() => startWizard(initialPlantId ? { plantId:initialPlantId } : {})}>Symptom Wizard</button><button type="button" onClick={() => setView("photo")}>Photo Diagnosis</button><button type="button" onClick={() => setView("review")}>Estate Health Review</button></nav>}

      {initialFinderContext && <aside className="js-health-finder-handoff" role="status"><strong>Plant Finder evidence received</strong><p>{initialFinderContext.notes || "A field image or trait record is available."} Identification and health diagnosis remain separate; choose an existing estate plant before saving a health case.</p></aside>}

      {view === "home" && <>
        {restoredDraft && <section className="js-health-continue" aria-labelledby="continue-health-title"><div><p>Saved draft</p><h2 id="continue-health-title">Continue Health Check</h2><span>Last saved {new Date(restoredDraft.updatedAt).toLocaleString()}</span></div><button type="button" onClick={()=>setView(draft.currentStep === "photos" ? "photo" : "wizard")}>Continue Draft</button><button type="button" onClick={discard}>Discard Draft</button></section>}
        <section className="js-plant-health__overview"><article><span>Active case files</span><strong>{activeCount}</strong><p>Monitoring, treating, improving, recurring, or unconfirmed</p></article><article><span>Resolved</span><strong>{garden.plantDiagnoses.filter((item) => item.status === "Resolved").length}</strong><p>Completed estate health records</p></article><article><span>Weather source</span><strong>{environment.sourceStatus}</strong><p>{environment.sourceStatus === "Live" ? "Current estate conditions available" : "No live-weather claim will be made"}</p></article></section>
        <section className="js-plant-health__modes" aria-label="Diagnostic modes">
          <EstateDataCard accent="#8c6c8f"><BotanicalIcon type="flower" size="lg" decorative /><p>New case</p><h2>Start New Health Check</h2><span>Add up to four photos, then confirm the symptoms you observe.</span><button type="button" onClick={() => begin("photos")}>Take or choose photos</button></EstateDataCard>
          <EstateDataCard accent="#647a55"><BotanicalIcon type="herb" size="lg" decorative /><p>Guided examination</p><h2>Manual Symptom Check</h2><span>Record visible symptoms and add photos to the same case when helpful.</span><button type="button" onClick={() => begin("symptoms")}>Enter symptoms manually</button></EstateDataCard>
          <EstateDataCard accent="#a27b3f"><BotanicalIcon type="tree" size="lg" decorative /><p>Estate case archive</p><h2>Estate Health Review</h2><span>Review active diagnoses, treatment progress, follow-up dates, repeated problems, and resolved cases.</span><button type="button" onClick={() => setView("review")}>Review estate health</button></EstateDataCard>
        </section>
      </>}

      {view === "photo" && <PhotoDiagnosis initialDraft={draft} onDraftChange={updateDraft} onFallback={(nextDraft) => startWizard(nextDraft)} onExternalResult={prepareExternalAssessment} />}
      {view === "wizard" && <SymptomWizard key={`${draft.id}-${draft.photoIds?.join("-") || "no-photo"}`} plants={garden.activePlants} journalEntries={garden.journalEntries} environment={environment} initialDraft={draft} onDraftChange={updateDraft} onComplete={prepareAssessment} />}
      {view === "results" && result && <DiagnosticResults result={result} onSave={saveDiagnosis} onRestart={() => startWizard({ plantId:result.context.plant.id })} onConsult={onConsult} />}
      {view === "review" && <EstateHealthReview plants={garden.activePlants} diagnoses={garden.plantDiagnoses} onOpen={openHistory} onStartDiagnosis={() => startWizard({})} />}
      {view === "history" && selectedDiagnosis && <DiagnosisHistory diagnosis={selectedDiagnosis} plant={garden.plants.find((item) => item.id === selectedDiagnosis.plantId)} photos={garden.photos} addPhotos={garden.addPhotos} addFollowUp={garden.addDiagnosisFollowUp} updateDiagnosis={garden.updatePlantDiagnosis} onBack={() => setView("review")} onConsult={onConsult} />}
      {view === "history" && !selectedDiagnosis && <div className="js-health-empty"><h2>That health record is unavailable.</h2><button type="button" onClick={() => setView("review")}>Open Estate Health Review</button></div>}

      <p className="js-health-disclaimer">This tool provides gardening guidance, not a guaranteed diagnosis. Confirm serious or spreading problems with a local cooperative extension office or qualified horticulture professional.</p>
    </EstatePageShell>
  );
}
