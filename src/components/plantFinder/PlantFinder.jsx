import React, { useState } from "react";
import { useGarden } from "../../context/GardenContext";
import BotanicalIcon from "../icons/BotanicalIcon";
import { EstateActionButton, EstateDataCard, EstatePageShell } from "../EstatePageSystem";
import { buildIdentificationContext } from "../../utils/buildIdentificationContext";
import { plantFinderFieldKey } from "../../utils/plantFinderRules";
import { rankPlantMatches, searchPlantFieldKey } from "../../utils/rankPlantMatches";
import CandidateResults from "./CandidateResults";
import IdentificationWizard from "./IdentificationWizard";
import PhotoIdentifier from "./PhotoIdentifier";
import PhotoFollowUp from "./PhotoFollowUp";
import { refinePhotoMatches } from "../../utils/photoFollowUp";
import "./PlantFinder.css";

const normalize = (value) => String(value || "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export default function PlantFinder({ onNavigate, onAddToEstate, onOpenHealthCenter, onConsultHeadGardener }) {
  const garden = useGarden();
  const [mode, setMode] = useState("home");
  const [wizardSeed, setWizardSeed] = useState({});
  const [notice, setNotice] = useState("");
  const [session, setSession] = useState(null);
  const [knownQuery, setKnownQuery] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState(null);

  const prepareResults = (context, matches, sourceLabel = "Local deterministic field key", sourceNotice = "", options = {}) => {
    setSession({ context, matches:matches.slice(0, 5), sourceLabel, sourceNotice, ...options });
    setMode("results");
  };

  const completeWizard = (context) => prepareResults(
    context,
    rankPlantMatches(context),
    "Local deterministic field key",
    notice,
    pendingPhoto ? { pendingPhoto } : {},
  );

  const continuePhoto = ({ photoId, photo, subject, analysis }) => {
    const photoIds = [...new Set([...(wizardSeed.photoIds || []), photoId])];
    if (!analysis.analyzed) return;
    setPendingPhoto(photo);
    const externalMatches = (analysis.matches || []).slice(0, 5).map((match, index) => {
      const keyMatch = plantFinderFieldKey.find((item) => normalize(item.commonName) === normalize(match.commonName) || normalize(item.botanicalName) === normalize(match.botanicalName));
      return {
        ...(keyMatch || {}),
        ...match,
        id:keyMatch?.id || `external-photo-match-${index}`,
        commonName:match.commonName || keyMatch?.commonName || "Possible visual match",
        botanicalName:match.botanicalName || keyMatch?.botanicalName || "",
        confidence:match.confidence || "Low",
        why:Array.isArray(match.why) && match.why.length ? match.why : ["The secure provider reported visual similarity."],
        conflicts:Array.isArray(match.conflicts) ? match.conflicts : [],
        inspectNext:Array.isArray(match.inspectNext) && match.inspectNext.length ? match.inspectNext : ["Compare leaf attachment, reproductive structures, stem, and habitat before confirming."],
      };
    });
    const finderContext = buildIdentificationContext({ ...wizardSeed, ...(analysis.inferredTraits || {}), subject, photoIds, sourceMode:"Secure photo analysis" });
    const needsFocusedFollowUp = analysis.requiresFollowUp || !externalMatches.length || (externalMatches[0]?.confidenceScore || 0) < 65;
    const sourceNotice = [
      analysis.message,
      analysis.limitation,
      analysis.safetyNote,
      needsFocusedFollowUp && externalMatches.length ? "Confidence is limited. Guided Follow-Up asks only the observations needed to separate these candidates." : "",
    ].filter(Boolean).join(" ");
    prepareResults(finderContext, externalMatches, "Secure photo analysis · Pl@ntNet", sourceNotice, {
      photoBased:true,
      needsFocusedFollowUp,
      pendingPhoto:photo,
      providerStatus:"ready",
      imageQuality:analysis.imageQuality,
    });
  };

  const continueUnavailablePhoto = ({ photoId, photo, subject, analysis }) => {
    const photoIds = [...new Set([...(wizardSeed.photoIds || []), photoId])];
    setPendingPhoto(photo);
    setWizardSeed({ ...wizardSeed, subject, photoIds, sourceMode:"Session photo + Guided Identification" });
    setNotice(`${analysis?.message || "Photo analysis is unavailable."} The prepared photo remains session-only. Guided Identification begins only because you selected it.`);
    setMode("wizard");
  };

  const searchKnown = (event) => {
    event.preventDefault();
    const context = buildIdentificationContext({ notes:knownQuery, sourceMode:"Known Trait Search" });
    prepareResults(context, searchPlantFieldKey(knownQuery), "Known-trait field-key search", "Text search narrows the read-only field key. Continue the Manual Wizard to test structural traits.");
  };

  const restart = () => {
    setMode("home");
    setSession(null);
    setNotice("");
    setWizardSeed({});
    setKnownQuery("");
    setPendingPhoto(null);
  };

  const continueIdentifying = () => {
    if (session?.photoBased && session.matches?.length) {
      setMode("followup");
      return;
    }
    setWizardSeed(session?.context || {});
    setNotice(session?.photoBased
      ? "The image did not support a reliable candidate. Continue with the complete guided field key using only traits you can observe."
      : "Review uncertain traits and add more observations before comparing again.");
    setMode("wizard");
  };

  const completePhotoFollowUp = (context) => {
    const refined = refinePhotoMatches(session?.matches || [], context);
    prepareResults(context, refined, "Pl@ntNet photo analysis + guided follow-up", "Candidates were refined using only the focused observations you supplied; the image match remains unconfirmed.", {
      photoBased:true,
      needsFocusedFollowUp:false,
      pendingPhoto:session?.pendingPhoto || pendingPhoto,
      providerStatus:"ready",
      imageQuality:session?.imageQuality,
    });
  };

  const persistFinderPhoto = (photo) => {
    if (!photo) return null;
    if (!garden.photos.some((item) => item.id === photo.id)) garden.addPhotos([photo]);
    return photo;
  };

  const actions = <><EstateActionButton variant="ledger" onClick={() => onNavigate("Plant Finder History")}>History ({garden.plantIdentifications.length})</EstateActionButton><EstateActionButton variant="gate" onClick={() => setMode("wizard")}>Begin Manual Wizard</EstateActionButton></>;
  return (
    <EstatePageShell id="plant-finder-title" eyebrow="Jardin Soleil · Field Botany Desk" title="Plant Finder" subtitle="Identify an unknown plant without adding it to the estate until you confirm the record" icon="herb" actions={actions} className="js-plant-finder">
      {mode === "home" && <>
        <section className="js-finder-intro"><div><span aria-hidden="true">⌕</span><div><p>Expedition notebook</p><h2>Observe before you name</h2><strong>Plant Finder is separate from the Plant Directory.</strong><p>Use photographs and visible field traits to prepare cautious possibilities. Confirmed estate plants are created only through the existing Add New Plant workflow.</p></div></div></section>
        <section className="js-finder-modes" aria-label="Plant identification modes">
          <EstateDataCard accent="#836b8d"><BotanicalIcon type="flower" size="lg" decorative /><p>Specimen plate</p><h2>Photo Identification</h2><span>Take or upload one photograph, prepare it privately in the browser, and try secure visual identification before entering manual traits.</span><button type="button" onClick={() => setMode("photo")}>Begin with a photo</button></EstateDataCard>
          <EstateDataCard accent="#627a55"><BotanicalIcon type="herb" size="lg" decorative /><p>Eight-part field key</p><h2>Manual Wizard</h2><span>Compare form, leaves, flowers, fruit, stems, habitat, season, and region through a deterministic local key.</span><button type="button" onClick={() => setMode("wizard")}>Open the wizard</button></EstateDataCard>
          <EstateDataCard accent="#a17a3e"><BotanicalIcon type="generic-plant" size="lg" decorative /><p>Known observations</p><h2>Search by Known Traits</h2><span>Start with a remembered name, family, habitat, or trait, then continue into the complete field key.</span><button type="button" onClick={() => setMode("known")}>Search known traits</button></EstateDataCard>
        </section>
        <aside className="js-finder-expert-prompt"><div><p>Field verification</p><h2>Prepare a useful expert question</h2><span>Save your traits, ranked possibilities, photographs, and conflicts for a local extension office, certified arborist, botanist, or regional field guide.</span></div><button type="button" onClick={onConsultHeadGardener}>Ask the Head Gardener to summarize observations</button></aside>
      </>}

      {mode === "photo" && <PhotoIdentifier context={wizardSeed} onContinue={continuePhoto} onGuided={continueUnavailablePhoto} onCancel={() => setMode("home")} />}
      {mode === "wizard" && <IdentificationWizard key={JSON.stringify(wizardSeed.photoIds || [])} initialData={wizardSeed} notice={notice} onComplete={completeWizard} onCancel={() => setMode("home")} />}
      {mode === "followup" && session && <PhotoFollowUp context={session.context} candidates={session.matches} onComplete={completePhotoFollowUp} onCancel={() => setMode("results")} />}
      {mode === "known" && <form className="js-finder-ledger js-finder-known" onSubmit={searchKnown}><header><p>Brass index & specimen key</p><h2>Search by Known Traits</h2><span>Use concrete observations such as “opposite aromatic square stem purple flowers” or “tree lobed leaves nut woodland.”</span></header><label><span>Known name or traits</span><input autoFocus value={knownQuery} onChange={(event) => setKnownQuery(event.target.value)} placeholder="Enter a common name, family, leaf trait, flower, fruit, or habitat" /></label><p>This broad search is not a confirmation. Structural observations in the Manual Wizard produce a more useful ranking.</p><div className="js-finder-actions"><button type="button" className="is-quiet" onClick={() => setMode("home")}>Back</button><button type="button" onClick={() => { setWizardSeed({ notes:knownQuery, sourceMode:"Known Trait Search + Manual Wizard" }); setMode("wizard"); }}>Continue in Manual Wizard</button><button type="submit" className="is-primary" disabled={!knownQuery.trim()}>Search field key</button></div></form>}
      {mode === "results" && session && <CandidateResults
        {...session}
        onRestart={restart}
        onContinueIdentifying={continueIdentifying}
        onTakeAnotherPhoto={() => {
          setWizardSeed({ ...session.context, photoIds:(session.context.photoIds || []).filter((id) => id !== session.pendingPhoto?.id) });
          setPendingPhoto(null);
          setMode("photo");
        }}
        onAddPhoto={() => { setWizardSeed(session.context); setPendingPhoto(null); setMode("photo"); }}
        onPersistPhoto={persistFinderPhoto}
        onSaveRecord={garden.addPlantIdentification}
        onUpdateRecord={garden.updatePlantIdentification}
        onAddToEstate={onAddToEstate}
        onOpenHealthCenter={(payload) => onOpenHealthCenter({ ...payload, traits:session.context })}
      />}

      {mode !== "results" && <p className="js-finder-safety">Never eat, brew, or medically use a wild plant based only on an app identification. Confirm with a qualified local expert.</p>}
    </EstatePageShell>
  );
}
