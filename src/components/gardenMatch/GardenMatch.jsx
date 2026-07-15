import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EstatePage from "../EstatePage";
import {
  gardenMatchCollections,
  gardenMatchDifficulties,
  gardenMatchModes,
  gardenMatchRewards,
} from "../../data/gardenMatchData";
import {
  buildGardenMatchDeck,
  calculateGardenMatchScore,
  formatGardenMatchTime,
  gardenMatchRecordId,
  getDailyGardenChallenge,
  getGardenMatchComboLabel,
  getGardenMatchJourney,
  getGardenMatchRank,
  grantGardenMatchReward,
  readDailyGardenProgress,
  readGardenMatchProgress,
  readGardenMatchRecords,
  readGardenMatchScores,
  readGardenMatchSettings,
  saveDailyGardenCompletion,
  saveGardenMatchResult,
  saveGardenMatchSettings,
  updateGardenMatchProgress,
} from "../../utils/gardenMatchGame";
import GardenMatchSelection from "./GardenMatchSelection";
import GardenMatchBoard from "./GardenMatchBoard";
import GardenMatchCompletion from "./GardenMatchCompletion";
import GardenMatchGameOver from "./GardenMatchGameOver";
import "./GardenMatch.css";

const buddyMessages = {
  start:"Buddy has buried a clue somewhere in the garden.",
  match:"Great memory! That pair belongs together.",
  near:"Only a few garden treasures remain.",
  hint:"Buddy found a clue! Look for the glowing cards.",
  mismatch:"Not this time—Buddy is still sniffing out the pair.",
  complete:"Every garden treasure is home again!",
};

function previewMilliseconds(settings, difficulty) {
  if (settings.previewDuration === "off") return 0;
  if (settings.previewDuration === "short") return 900;
  if (settings.previewDuration === "long") return 3200;
  return difficulty.previewMs;
}

export default function GardenMatch({ onNavigate }) {
  const [collectionId, setCollectionId] = useState("herbs");
  const [difficultyId, setDifficultyId] = useState("sprout");
  const [modeId, setModeId] = useState("classic");
  const [phase, setPhase] = useState("selection");
  const [deck, setDeck] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState(() => new Set());
  const [hintIds, setHintIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [locked, setLocked] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [combo, setCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [matchFeedback, setMatchFeedback] = useState(null);
  const [buddyMessage, setBuddyMessage] = useState(buddyMessages.start);
  const [announcement, setAnnouncement] = useState("");
  const [dailyRewardGranted, setDailyRewardGranted] = useState(false);
  const [newRewards, setNewRewards] = useState([]);
  const [scores, setScores] = useState(() => readGardenMatchScores());
  const [records, setRecords] = useState(() => readGardenMatchRecords());
  const [progress, setProgress] = useState(() => readGardenMatchProgress());
  const [daily, setDaily] = useState(() => readDailyGardenProgress());
  const [settings, setSettings] = useState(() => readGardenMatchSettings());
  const dailyChallenge = useMemo(() => getDailyGardenChallenge(), []);

  const turnTimeoutRef = useRef(null);
  const previewTimeoutRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const lockedRef = useRef(false);
  const flippedRef = useRef([]);
  const matchedRef = useRef(new Set());
  const movesRef = useRef(0);
  const hintsRef = useRef(0);
  const comboRef = useRef(0);
  const highestComboRef = useRef(0);
  const startedAtRef = useRef(null);
  const finishedRef = useRef(false);
  const gameOverRef = useRef(null);

  const collection = useMemo(
    () => gardenMatchCollections.find((item) => item.id === collectionId) || gardenMatchCollections[0],
    [collectionId],
  );
  const difficulty = useMemo(
    () => gardenMatchDifficulties.find((item) => item.id === difficultyId) || gardenMatchDifficulties[0],
    [difficultyId],
  );
  const mode = useMemo(
    () => gardenMatchModes.find((item) => item.id === modeId) || gardenMatchModes[0],
    [modeId],
  );
  const journey = useMemo(() => getGardenMatchJourney(progress), [progress]);

  const clearPending = useCallback(() => {
    [turnTimeoutRef, previewTimeoutRef, hintTimeoutRef, feedbackTimeoutRef].forEach((timerRef) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    });
  }, []);

  const beginClock = useCallback(() => {
    if (startedAtRef.current) return;
    const now = Date.now();
    startedAtRef.current = now;
    setStartedAt(now);
  }, []);

  const playTone = useCallback((kind) => {
    if (!settings.sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = kind === "match" ? 560 : kind === "complete" ? 720 : 260;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
      oscillator.addEventListener("ended", () => context.close());
    } catch {
      // Sound is a purely optional enhancement.
    }
  }, [settings.sound]);

  const endGame = useCallback((reason) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    gameOverRef.current = reason;
    lockedRef.current = true;
    setLocked(true);
    setGameOverReason(reason);
    setAnnouncement(reason === "moves" ? "The move limit has been reached." : "The timed garden has ended.");
  }, []);

  const prepareGame = useCallback((nextCollectionId = collectionId, nextDifficultyId = difficultyId, nextModeId = modeId) => {
    clearPending();
    const isDaily = nextModeId === "daily-garden";
    const actualCollectionId = isDaily ? dailyChallenge.collectionId : nextCollectionId;
    const actualDifficultyId = isDaily ? dailyChallenge.difficultyId : nextDifficultyId;
    const nextDifficulty = gardenMatchDifficulties.find((item) => item.id === actualDifficultyId) || gardenMatchDifficulties[0];
    const nextDeck = buildGardenMatchDeck(
      actualCollectionId,
      actualDifficultyId,
      isDaily ? { seed:dailyChallenge.seed } : Math.random,
    );
    const previewMs = previewMilliseconds(settings, nextDifficulty);

    setCollectionId(actualCollectionId);
    setDifficultyId(actualDifficultyId);
    setModeId(nextModeId);
    setDeck(nextDeck);
    setFlippedIds([]);
    setMatchedPairIds(new Set());
    setHintIds([]);
    setMoves(0);
    setElapsedMs(0);
    setStartedAt(null);
    setLocked(previewMs > 0);
    setPreviewActive(previewMs > 0);
    setCompletedResult(null);
    setGameOverReason(null);
    setCombo(0);
    setHighestCombo(0);
    setHintsUsed(0);
    setMatchFeedback(null);
    setBuddyMessage(buddyMessages.start);
    setAnnouncement(previewMs > 0 ? `Previewing ${nextDeck.length} cards.` : "The garden is ready.");
    setDailyRewardGranted(false);
    setNewRewards([]);
    flippedRef.current = [];
    matchedRef.current = new Set();
    movesRef.current = 0;
    hintsRef.current = 0;
    comboRef.current = 0;
    highestComboRef.current = 0;
    startedAtRef.current = null;
    finishedRef.current = false;
    gameOverRef.current = null;
    lockedRef.current = previewMs > 0;
    setPhase("playing");

    const revealFinished = () => {
      setPreviewActive(false);
      setLocked(false);
      lockedRef.current = false;
      setAnnouncement("Preview complete. Begin matching.");
      if (nextModeId === "timed") beginClock();
    };
    if (previewMs > 0) {
      previewTimeoutRef.current = window.setTimeout(revealFinished, previewMs);
    } else if (nextModeId === "timed") {
      window.setTimeout(beginClock, 0);
    }
  }, [beginClock, clearPending, collectionId, dailyChallenge, difficultyId, modeId, settings]);

  const chooseNewGame = useCallback(() => {
    clearPending();
    setPhase("selection");
    setDeck([]);
    setFlippedIds([]);
    setMatchedPairIds(new Set());
    setHintIds([]);
    setMoves(0);
    setElapsedMs(0);
    setStartedAt(null);
    setLocked(false);
    setPreviewActive(false);
    setCompletedResult(null);
    setGameOverReason(null);
    setMatchFeedback(null);
    startedAtRef.current = null;
    finishedRef.current = false;
    gameOverRef.current = null;
    lockedRef.current = false;
  }, [clearPending]);

  useEffect(() => () => clearPending(), [clearPending]);

  useEffect(() => {
    if (!startedAt || completedResult || gameOverReason || phase !== "playing") return undefined;
    const updateElapsed = () => {
      const nextElapsed = Date.now() - startedAt;
      setElapsedMs(nextElapsed);
      if (modeId === "timed" && nextElapsed >= difficulty.timeLimitSeconds * 1000) endGame("time");
    };
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 200);
    return () => window.clearInterval(interval);
  }, [completedResult, difficulty.timeLimitSeconds, endGame, gameOverReason, modeId, phase, startedAt]);

  useEffect(() => {
    const pairCount = deck.length / 2;
    if (!pairCount || matchedPairIds.size !== pairCount || completedResult || gameOverReason || finishedRef.current) return;
    finishedRef.current = true;
    const timeMs = Math.max(0, Date.now() - (startedAtRef.current || Date.now()));
    const scoreDetails = calculateGardenMatchScore({
      pairCount,
      moves:movesRef.current,
      timeMs,
      hintsUsed:hintsRef.current,
      highestCombo:highestComboRef.current,
      difficultyMultiplier:difficulty.multiplier,
    });
    const result = {
      ...scoreDetails,
      timeMs,
      moves:movesRef.current,
      hintsUsed:hintsRef.current,
      highestCombo:highestComboRef.current,
      difficultyId,
      modeId,
      rank:getGardenMatchRank(scoreDetails.score),
    };
    setElapsedMs(timeMs);
    setCompletedResult(result);
    setBuddyMessage(buddyMessages.complete);
    setAnnouncement(`Garden complete. ${result.rank}, ${result.score} points.`);
    playTone("complete");

    const saved = saveGardenMatchResult(collectionId, difficultyId, result, undefined, modeId);
    setScores((current) => ({ ...current, [`${collectionId}:${difficultyId}`]:saved.legacy }));
    setRecords((current) => ({ ...current, [gardenMatchRecordId(modeId, collectionId, difficultyId)]:saved.record }));

    const oldRewards = new Set(progress.unlockedRewards);
    let updatedProgress = updateGardenMatchProgress(collectionId, result);
    let unlockedNow = updatedProgress.unlockedRewards.filter((reward) => !oldRewards.has(reward));

    if (modeId === "daily-garden") {
      const dailyResult = saveDailyGardenCompletion(dailyChallenge.dateKey, result);
      setDaily(dailyResult.daily);
      setDailyRewardGranted(dailyResult.rewardGranted);
      if (dailyResult.daily.currentStreak >= 3) {
        updatedProgress = grantGardenMatchReward("buddy-ribbon");
        if (!oldRewards.has("buddy-ribbon")) unlockedNow = [...new Set([...unlockedNow, "buddy-ribbon"])];
      }
    }
    setProgress(updatedProgress);
    setNewRewards(unlockedNow);
  }, [collectionId, completedResult, dailyChallenge.dateKey, deck.length, difficulty.multiplier, difficultyId, gameOverReason, matchedPairIds, modeId, playTone, progress.unlockedRewards]);

  const selectCard = useCallback((card) => {
    if (phase !== "playing" || completedResult || gameOverRef.current || lockedRef.current || matchedRef.current.has(card.pairId)) return;
    if (flippedRef.current.includes(card.instanceId)) return;
    if (modeId === "limited-moves" && movesRef.current >= difficulty.moveLimit) return;

    beginClock();
    const nextFlipped = [...flippedRef.current, card.instanceId];
    flippedRef.current = nextFlipped;
    setFlippedIds(nextFlipped);
    if (nextFlipped.length < 2) {
      setAnnouncement(`${card.title} revealed. Choose another card.`);
      return;
    }

    const firstCard = deck.find((item) => item.instanceId === nextFlipped[0]);
    const isMatch = Boolean(firstCard && firstCard.pairId === card.pairId);
    const newMoves = movesRef.current + 1;
    movesRef.current = newMoves;
    setMoves(newMoves);
    lockedRef.current = true;
    setLocked(true);

    if (isMatch) {
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      highestComboRef.current = Math.max(highestComboRef.current, newCombo);
      setCombo(newCombo);
      setHighestCombo(highestComboRef.current);
      const comboLabel = getGardenMatchComboLabel(newCombo);
      setBuddyMessage(comboLabel || buddyMessages.match);
      setAnnouncement(`${firstCard.title} and ${card.title} are a match. ${comboLabel}`.trim());
      if (settings.facts) {
        setMatchFeedback({ name:card.name, icon:card.icon, fact:card.shortFact });
        if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = window.setTimeout(() => setMatchFeedback(null), 4200);
      }
      playTone("match");
    } else {
      comboRef.current = 0;
      setCombo(0);
      setBuddyMessage(buddyMessages.mismatch);
      setAnnouncement(`${firstCard?.title || "First card"} and ${card.title} do not match.`);
      playTone("miss");
    }

    turnTimeoutRef.current = window.setTimeout(() => {
      let predictedMatches = matchedRef.current.size;
      if (isMatch) {
        const nextMatched = new Set(matchedRef.current);
        nextMatched.add(card.pairId);
        matchedRef.current = nextMatched;
        predictedMatches = nextMatched.size;
        setMatchedPairIds(nextMatched);
        if ((deck.length / 2) - predictedMatches <= 2 && predictedMatches < deck.length / 2) setBuddyMessage(buddyMessages.near);
      }
      flippedRef.current = [];
      setFlippedIds([]);
      lockedRef.current = false;
      setLocked(false);
      turnTimeoutRef.current = null;
      if (modeId === "limited-moves" && newMoves >= difficulty.moveLimit && predictedMatches < deck.length / 2) endGame("moves");
    }, isMatch ? 430 : 850);
  }, [beginClock, completedResult, deck, difficulty.moveLimit, endGame, modeId, phase, playTone, settings.facts]);

  const useHint = useCallback(() => {
    if (!settings.buddyHints || lockedRef.current || finishedRef.current || hintsRef.current >= difficulty.hintLimit) return;
    const availablePairId = deck.find((card) => !matchedRef.current.has(card.pairId) && !flippedRef.current.includes(card.instanceId))?.pairId;
    if (!availablePairId) return;
    const cards = deck.filter((card) => card.pairId === availablePairId).map((card) => card.instanceId);
    hintsRef.current += 1;
    setHintsUsed(hintsRef.current);
    setHintIds(cards);
    setBuddyMessage(buddyMessages.hint);
    setAnnouncement("Buddy has highlighted a matching pair.");
    if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = window.setTimeout(() => setHintIds([]), 1500);
  }, [deck, difficulty.hintLimit, settings.buddyHints]);

  const handleModeChange = useCallback((nextModeId) => {
    setModeId(nextModeId);
    if (nextModeId === "daily-garden") {
      setCollectionId(dailyChallenge.collectionId);
      setDifficultyId(dailyChallenge.difficultyId);
    }
  }, [dailyChallenge]);

  const handleSettingsChange = useCallback((nextSettings) => {
    setSettings(saveGardenMatchSettings(nextSettings));
  }, []);

  const currentBest = records[gardenMatchRecordId(modeId, collectionId, difficultyId)] || scores[`${collectionId}:${difficultyId}`];
  const timeDisplay = modeId === "timed"
    ? formatGardenMatchTime(Math.max(0, (difficulty.timeLimitSeconds * 1000) - elapsedMs))
    : formatGardenMatchTime(elapsedMs);
  const remainingMoves = Math.max(0, difficulty.moveLimit - moves);
  const liveScore = Math.max(0, Math.round(((matchedPairIds.size * 100) + (combo * 60) - (hintsUsed * 75)) * difficulty.multiplier));
  const accuracy = moves ? Math.min(1, matchedPairIds.size / moves) : 1;

  return (
    <EstatePage
      id="garden-match-title"
      title="Garden Match"
      eyebrow="Jardin Soleil · Botanical Games"
      description="Match the living collections, follow Buddy's clues, and restore every garden room of the estate."
      icon="flower"
      className={`garden-match${settings.highContrast ? " garden-match--high-contrast" : ""}${settings.reducedMotion ? " garden-match--reduced-motion" : ""}`}
      actions={<button className="js-estate-button" type="button" onClick={() => onNavigate?.("Learning")}>Back to Learning Center</button>}
    >
      {phase === "selection" ? (
        <GardenMatchSelection
          collections={gardenMatchCollections}
          modes={gardenMatchModes}
          difficulties={gardenMatchDifficulties}
          collectionId={collectionId}
          difficultyId={difficultyId}
          modeId={modeId}
          scores={scores}
          records={records}
          progress={progress}
          journey={journey}
          rewards={gardenMatchRewards}
          daily={daily}
          dailyChallenge={dailyChallenge}
          settings={settings}
          onCollectionChange={setCollectionId}
          onDifficultyChange={setDifficultyId}
          onModeChange={handleModeChange}
          onSettingsChange={handleSettingsChange}
          onStart={() => prepareGame(collectionId, difficultyId, modeId)}
        />
      ) : (
        <section className="garden-match-game" aria-labelledby="garden-match-board-title">
          <div className="garden-match-sr-live" aria-live="polite" aria-atomic="true">{announcement}</div>
          <header className="garden-match-game__toolbar">
            <div>
              <span>{mode.label} · {difficulty.label}</span>
              <h2 id="garden-match-board-title"><i aria-hidden="true">{collection.emoji}</i> {collection.title}</h2>
              <p>{difficulty.pairCount} pairs · score multiplier ×{difficulty.multiplier}</p>
            </div>
            <dl className="garden-match-game__score" aria-label="Current game progress">
              <div><dt>{modeId === "limited-moves" ? "Moves left" : "Moves"}</dt><dd>{modeId === "limited-moves" ? remainingMoves : moves}</dd></div>
              <div><dt>{modeId === "timed" ? "Remaining" : "Time"}</dt><dd><time>{timeDisplay}</time></dd></div>
              <div><dt>Pairs</dt><dd>{matchedPairIds.size}/{deck.length / 2}</dd></div>
              <div><dt>Score</dt><dd>{liveScore.toLocaleString()}</dd></div>
              <div><dt>Combo</dt><dd>{combo}</dd></div>
              <div><dt>Accuracy</dt><dd>{Math.round(accuracy * 100)}%</dd></div>
            </dl>
            <div className="garden-match-game__actions">
              <button className="garden-match-button" type="button" onClick={useHint} disabled={!settings.buddyHints || hintsUsed >= difficulty.hintLimit || locked || previewActive}>Buddy Hint {hintsUsed}/{difficulty.hintLimit}</button>
              <button className="garden-match-button" type="button" onClick={() => prepareGame(collectionId, difficultyId, modeId)}>Restart Game</button>
              <button className="garden-match-button" type="button" onClick={chooseNewGame}>New Game</button>
            </div>
          </header>

          <div className="garden-match-status-row">
            <p className="garden-match-buddy"><span aria-hidden="true">🐾</span><strong>Buddy says</strong>{buddyMessage}</p>
            <p className="garden-match-scoring-note"><strong>Scoring</strong> Matches + accuracy + efficiency + time + combos − hints, adjusted by difficulty.</p>
          </div>

          {previewActive && <p className="garden-match-preview" role="status">Take a garden glance… the cards will turn over shortly.</p>}
          {currentBest && <p className="garden-match-game__best">Estate best for this garden · {formatGardenMatchTime(currentBest.bestTimeMs)} · {currentBest.bestMoves} moves{currentBest.bestScore ? ` · ${currentBest.bestScore.toLocaleString()} points` : ""}</p>}
          {matchFeedback && settings.facts && <aside className="garden-match-fact" aria-live="polite"><span aria-hidden="true">{matchFeedback.icon}</span><div><strong>{matchFeedback.name}</strong><p>{matchFeedback.fact}</p></div></aside>}

          <GardenMatchBoard
            deck={deck}
            flippedIds={flippedIds}
            matchedPairIds={matchedPairIds}
            hintIds={hintIds}
            locked={locked}
            previewActive={previewActive}
            difficultyId={difficultyId}
            settings={settings}
            onSelect={selectCard}
          />

          {completedResult && (
            <GardenMatchCompletion
              result={completedResult}
              collection={collection}
              difficulty={difficulty}
              mode={mode}
              bestScore={currentBest}
              dailyRewardGranted={dailyRewardGranted}
              newRewards={newRewards.map((id) => gardenMatchRewards.find((reward) => reward.id === id)?.title || id)}
              onReplay={() => prepareGame(collectionId, difficultyId, modeId)}
              onNewGame={chooseNewGame}
            />
          )}
          {gameOverReason && <GardenMatchGameOver reason={gameOverReason} onReplay={() => prepareGame(collectionId, difficultyId, modeId)} onNewGame={chooseNewGame} />}
        </section>
      )}
    </EstatePage>
  );
}
