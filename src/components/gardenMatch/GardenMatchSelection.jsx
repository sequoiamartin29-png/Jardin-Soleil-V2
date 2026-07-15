import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  formatGardenMatchTime,
  gardenMatchRecordId,
  isGardenMatchCollectionUnlocked,
} from "../../utils/gardenMatchGame";
import GardenMatchJourney from "./GardenMatchJourney";
import GardenMatchSettings from "./GardenMatchSettings";

function CollectionChoices({ collections, collectionId, progress, onChoose, inSheet = false }) {
  return (
    <div className={inSheet ? "garden-match-collection-sheet__grid" : "garden-match-category-grid"} role="group" aria-label="Garden Match collections">
      {collections.map((collection) => {
        const unlocked = isGardenMatchCollectionUnlocked(collection, progress);
        return (
          <button
            className={`garden-match-category${collection.id === collectionId ? " is-selected" : ""}${unlocked ? "" : " is-locked"}`}
            type="button"
            key={collection.id}
            aria-pressed={collection.id === collectionId}
            aria-label={`${collection.title}. ${unlocked ? collection.description : `Locked: ${collection.unlockRequirement.label}`}`}
            disabled={!unlocked}
            onClick={() => onChoose(collection.id)}
          >
            <span aria-hidden="true">{collection.emoji}</span>
            <strong>{collection.title}</strong>
            <small>{unlocked ? collection.subtitle : `🔒 ${collection.unlockRequirement.label}`}</small>
            <em>{collection.cards.length} pairs · {collection.badge}</em>
          </button>
        );
      })}
    </div>
  );
}

export default function GardenMatchSelection({
  collections,
  modes,
  difficulties,
  collectionId,
  difficultyId,
  modeId,
  scores,
  records,
  progress,
  journey,
  rewards,
  daily,
  dailyChallenge,
  settings,
  onCollectionChange,
  onDifficultyChange,
  onModeChange,
  onSettingsChange,
  onStart,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeRef = useRef(null);
  const chooserRef = useRef(null);
  const sheetRef = useRef(null);
  const wasSheetOpenRef = useRef(false);
  const selectedCollection = collections.find((item) => item.id === collectionId) || collections[0];
  const selectedDifficulty = difficulties.find((item) => item.id === difficultyId) || difficulties[0];
  const selectedRecord = records[gardenMatchRecordId(modeId, collectionId, difficultyId)];
  const selectedScore = selectedRecord || scores[`${collectionId}:${difficultyId}`];
  const unlockedRewards = useMemo(
    () => rewards.filter((reward) => progress.unlockedRewards.includes(reward.id)),
    [progress.unlockedRewards, rewards],
  );
  const todayEntry = daily.dates[dailyChallenge.dateKey];

  useEffect(() => {
    if (!sheetOpen) {
      if (wasSheetOpenRef.current) chooserRef.current?.focus();
      wasSheetOpenRef.current = false;
      return undefined;
    }
    wasSheetOpenRef.current = true;
    closeRef.current?.focus();
    const handleSheetKeys = (event) => {
      if (event.key === "Escape") setSheetOpen(false);
      if (event.key !== "Tab") return;
      const focusable = [...(sheetRef.current?.querySelectorAll("button:not(:disabled), select, [tabindex]:not([tabindex='-1'])") || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleSheetKeys);
    return () => document.removeEventListener("keydown", handleSheetKeys);
  }, [sheetOpen]);

  const chooseFromSheet = (id) => {
    onCollectionChange(id);
    setSheetOpen(false);
  };

  return (
    <div className="garden-match-selection">
      <GardenMatchJourney areas={journey} />

      <section aria-labelledby="garden-match-mode-title">
        <div className="garden-match-section-heading">
          <span>Choose how to play</span>
          <h2 id="garden-match-mode-title">A garden game for every kind of day</h2>
        </div>
        <div className="garden-match-mode-grid" role="group" aria-label="Garden Match modes">
          {modes.map((mode) => (
            <button
              className={`garden-match-mode${mode.id === modeId ? " is-selected" : ""}`}
              type="button"
              key={mode.id}
              aria-pressed={mode.id === modeId}
              onClick={() => onModeChange(mode.id)}
            >
              <span aria-hidden="true">{mode.icon}</span>
              <strong>{mode.label}</strong>
              <small>{mode.description}</small>
              <em>{mode.badge}</em>
            </button>
          ))}
        </div>
      </section>

      {modeId === "daily-garden" ? (
        <section className="garden-match-daily-card" aria-labelledby="garden-match-daily-title">
          <span className="garden-match-daily-card__sun" aria-hidden="true">☀</span>
          <div>
            <small>{dailyChallenge.dateKey} · Local daily garden</small>
            <h2 id="garden-match-daily-title">{selectedCollection.title} · {selectedDifficulty.label}</h2>
            <p>The same date-seeded layout returns throughout your local day. Replays are welcome; its keepsake reward is granted once.</p>
          </div>
          <dl>
            <div><dt>Today's state</dt><dd>{todayEntry?.completed ? "Completed" : "Ready"}</dd></div>
            <div><dt>Current streak</dt><dd>{daily.currentStreak} day{daily.currentStreak === 1 ? "" : "s"}</dd></div>
          </dl>
        </section>
      ) : (
        <>
          <section aria-labelledby="garden-match-category-title">
            <div className="garden-match-section-heading">
              <span>Choose a collection</span>
              <h2 id="garden-match-category-title">Which garden shall we explore?</h2>
            </div>
            <button ref={chooserRef} className="garden-match-mobile-collection-button" type="button" onClick={() => setSheetOpen(true)}>
              <span aria-hidden="true">{selectedCollection.emoji}</span>
              <span><small>Selected collection</small><strong>{selectedCollection.title}</strong></span>
              <span aria-hidden="true">Choose ›</span>
            </button>
            <CollectionChoices collections={collections} collectionId={collectionId} progress={progress} onChoose={onCollectionChange} />
          </section>

          <section aria-labelledby="garden-match-difficulty-title">
            <div className="garden-match-section-heading">
              <span>Choose a challenge</span>
              <h2 id="garden-match-difficulty-title">How many pairs are blooming?</h2>
            </div>
            <div className="garden-match-difficulty-grid" role="group" aria-label="Garden Match difficulty levels">
              {difficulties.map((difficulty) => (
                <button
                  className={`garden-match-difficulty${difficulty.id === difficultyId ? " is-selected" : ""}`}
                  type="button"
                  key={difficulty.id}
                  aria-pressed={difficulty.id === difficultyId}
                  onClick={() => onDifficultyChange(difficulty.id)}
                >
                  <span>{difficulty.pairCount} pairs · ×{difficulty.multiplier}</span>
                  <strong>{difficulty.label}</strong>
                  <small>{difficulty.description}</small>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="garden-match-rewards" aria-labelledby="garden-match-rewards-title">
        <div className="garden-match-section-heading">
          <span>Estate keepsakes</span>
          <h2 id="garden-match-rewards-title">Crests, seals & card backs</h2>
        </div>
        {unlockedRewards.length ? (
          <ul>{unlockedRewards.map((reward) => <li key={reward.id}><span aria-hidden="true">✦</span><strong>{reward.title}</strong><small>{reward.description}</small></li>)}</ul>
        ) : (
          <p>Complete an estate area to place its first keepsake in this cabinet.</p>
        )}
      </section>

      <GardenMatchSettings settings={settings} onChange={onSettingsChange} />

      <div className="garden-match-selection__footer">
        <div aria-live="polite">
          {selectedScore ? (
            <><span>Estate best</span><strong>{formatGardenMatchTime(selectedScore.bestTimeMs)} · {selectedScore.bestMoves} moves{selectedScore.bestScore ? ` · ${selectedScore.bestScore.toLocaleString()} points` : ""}</strong></>
          ) : (
            <><span>Estate best</span><strong>No completed game yet</strong></>
          )}
        </div>
        <button className="garden-match-button garden-match-button--primary" type="button" onClick={onStart}>Begin {modeId === "daily-garden" ? "Today's Garden" : "Garden Match"}</button>
      </div>

      {sheetOpen && createPortal(
        <div className="garden-match-collection-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSheetOpen(false); }}>
          <div ref={sheetRef} className="garden-match-collection-sheet" role="dialog" aria-modal="true" aria-labelledby="garden-match-sheet-title">
            <header><div><small>Garden Match</small><h2 id="garden-match-sheet-title">Choose a collection</h2></div><button ref={closeRef} type="button" aria-label="Close collection chooser" onClick={() => setSheetOpen(false)}>×</button></header>
            <CollectionChoices collections={collections} collectionId={collectionId} progress={progress} onChoose={chooseFromSheet} inSheet />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
