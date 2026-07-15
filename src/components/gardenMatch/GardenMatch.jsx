import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EstatePage from "../EstatePage";
import { gardenMatchCategories, gardenMatchDifficulties } from "../../data/gardenMatchData";
import {
  activateGardenMatchFromKeyboard,
  buildGardenMatchDeck,
  formatGardenMatchTime,
  readGardenMatchScores,
  saveGardenMatchResult,
} from "../../utils/gardenMatchGame";
import GardenMatchSelection from "./GardenMatchSelection";
import GardenMatchBoard from "./GardenMatchBoard";
import GardenMatchCompletion from "./GardenMatchCompletion";
import "./GardenMatch.css";

export default function GardenMatch({ onNavigate }) {
  const [categoryId, setCategoryId] = useState(gardenMatchCategories[0].id);
  const [difficultyId, setDifficultyId] = useState(gardenMatchDifficulties[0].id);
  const [phase, setPhase] = useState("selection");
  const [deck, setDeck] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [locked, setLocked] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);
  const [scores, setScores] = useState(() => readGardenMatchScores());
  const timeoutRef = useRef(null);
  const lockedRef = useRef(false);
  const flippedRef = useRef([]);
  const startedAtRef = useRef(null);

  const category = useMemo(
    () => gardenMatchCategories.find((item) => item.id === categoryId) || gardenMatchCategories[0],
    [categoryId],
  );
  const difficulty = useMemo(
    () => gardenMatchDifficulties.find((item) => item.id === difficultyId) || gardenMatchDifficulties[0],
    [difficultyId],
  );

  const cancelPendingCheck = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    lockedRef.current = false;
    flippedRef.current = [];
  }, []);

  const prepareGame = useCallback((nextCategoryId = categoryId, nextDifficultyId = difficultyId) => {
    cancelPendingCheck();
    setCategoryId(nextCategoryId);
    setDifficultyId(nextDifficultyId);
    setDeck(buildGardenMatchDeck(nextCategoryId, nextDifficultyId));
    setFlippedIds([]);
    setMatchedPairIds(new Set());
    setMoves(0);
    setElapsedMs(0);
    setStartedAt(null);
    startedAtRef.current = null;
    setLocked(false);
    setCompletedResult(null);
    setPhase("playing");
  }, [cancelPendingCheck, categoryId, difficultyId]);

  const chooseNewGame = useCallback(() => {
    cancelPendingCheck();
    setPhase("selection");
    setDeck([]);
    setFlippedIds([]);
    setMatchedPairIds(new Set());
    setMoves(0);
    setElapsedMs(0);
    setStartedAt(null);
    startedAtRef.current = null;
    setLocked(false);
    setCompletedResult(null);
  }, [cancelPendingCheck]);

  useEffect(() => () => cancelPendingCheck(), [cancelPendingCheck]);

  useEffect(() => {
    if (!startedAt || completedResult || phase !== "playing") return undefined;
    const updateElapsed = () => setElapsedMs(Date.now() - startedAt);
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 250);
    return () => window.clearInterval(interval);
  }, [completedResult, phase, startedAt]);

  useEffect(() => {
    const pairCount = deck.length / 2;
    if (!pairCount || matchedPairIds.size !== pairCount || completedResult) return;
    const result = {
      timeMs: Math.max(0, Date.now() - (startedAtRef.current || Date.now())),
      moves,
    };
    setElapsedMs(result.timeMs);
    setCompletedResult(result);
    const savedScore = saveGardenMatchResult(categoryId, difficultyId, result);
    setScores((current) => ({ ...current, [`${categoryId}:${difficultyId}`]:savedScore }));
  }, [categoryId, completedResult, deck.length, difficultyId, matchedPairIds, moves]);

  const selectCard = useCallback((card) => {
    if (phase !== "playing" || completedResult || lockedRef.current || matchedPairIds.has(card.pairId)) return;
    if (flippedRef.current.includes(card.instanceId)) return;

    if (!startedAtRef.current) {
      const now = Date.now();
      startedAtRef.current = now;
      setStartedAt(now);
    }

    const nextFlipped = [...flippedRef.current, card.instanceId];
    flippedRef.current = nextFlipped;
    setFlippedIds(nextFlipped);

    if (nextFlipped.length < 2) return;

    const firstCard = deck.find((item) => item.instanceId === nextFlipped[0]);
    const isMatch = Boolean(firstCard && firstCard.pairId === card.pairId);
    lockedRef.current = true;
    setLocked(true);
    setMoves((current) => current + 1);

    timeoutRef.current = window.setTimeout(() => {
      if (isMatch) {
        setMatchedPairIds((current) => {
          const next = new Set(current);
          next.add(card.pairId);
          return next;
        });
      }
      flippedRef.current = [];
      setFlippedIds([]);
      lockedRef.current = false;
      setLocked(false);
      timeoutRef.current = null;
    }, isMatch ? 430 : 900);
  }, [completedResult, deck, matchedPairIds, phase]);

  const currentBest = scores[`${categoryId}:${difficultyId}`];

  return (
    <EstatePage
      id="garden-match-title"
      title="Garden Match"
      eyebrow="Jardin Soleil · Botanical Games"
      description="Turn over miniature botanical cards and gather every pair from the estate."
      icon="flower"
      className="garden-match"
      actions={<button className="js-estate-button" type="button" onClick={() => onNavigate?.("Learning")} onKeyDown={(event) => activateGardenMatchFromKeyboard(event, () => onNavigate?.("Learning"))}>Back to Learning Center</button>}
    >
      {phase === "selection" ? (
        <GardenMatchSelection
          categories={gardenMatchCategories}
          difficulties={gardenMatchDifficulties}
          categoryId={categoryId}
          difficultyId={difficultyId}
          scores={scores}
          onCategoryChange={setCategoryId}
          onDifficultyChange={setDifficultyId}
          onStart={() => prepareGame(categoryId, difficultyId)}
        />
      ) : (
        <section className="garden-match-game" aria-labelledby="garden-match-board-title">
          <header className="garden-match-game__toolbar">
            <div>
              <span>Current collection</span>
              <h2 id="garden-match-board-title"><i aria-hidden="true">{category.emoji}</i> {category.label}</h2>
              <p>{difficulty.label} · {difficulty.pairCount} matching pairs</p>
            </div>
            <dl className="garden-match-game__score" aria-label="Current game progress">
              <div><dt>Moves</dt><dd>{moves}</dd></div>
              <div><dt>Time</dt><dd><time>{formatGardenMatchTime(elapsedMs)}</time></dd></div>
              <div><dt>Pairs</dt><dd>{matchedPairIds.size}/{deck.length / 2}</dd></div>
            </dl>
            <div className="garden-match-game__actions">
              <button className="garden-match-button" type="button" onClick={() => prepareGame(categoryId, difficultyId)} onKeyDown={(event) => activateGardenMatchFromKeyboard(event, () => prepareGame(categoryId, difficultyId))}>Restart Game</button>
              <button className="garden-match-button" type="button" onClick={chooseNewGame} onKeyDown={(event) => activateGardenMatchFromKeyboard(event, chooseNewGame)}>New Game</button>
            </div>
          </header>

          {currentBest && <p className="garden-match-game__best">Estate best for this garden · {formatGardenMatchTime(currentBest.bestTimeMs)} · {currentBest.bestMoves} moves</p>}

          <GardenMatchBoard
            deck={deck}
            flippedIds={flippedIds}
            matchedPairIds={matchedPairIds}
            locked={locked}
            difficultyId={difficultyId}
            onSelect={selectCard}
          />

          {completedResult && (
            <GardenMatchCompletion
              result={completedResult}
              category={category}
              difficulty={difficulty}
              bestScore={currentBest}
              onReplay={() => prepareGame(categoryId, difficultyId)}
              onNewGame={chooseNewGame}
            />
          )}
        </section>
      )}
    </EstatePage>
  );
}
