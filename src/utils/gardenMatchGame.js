import { gardenMatchCards, gardenMatchDifficulties } from "../data/gardenMatchData";

export const GARDEN_MATCH_SCORE_KEY = "jardinSoleil:gardenMatch:best:v1";

export function activateGardenMatchFromKeyboard(event, action) {
  if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
  event.preventDefault();
  action();
}

export function shuffleGardenMatchCards(cards, random = Math.random) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function buildGardenMatchDeck(categoryId, difficultyId, random = Math.random) {
  const difficulty = gardenMatchDifficulties.find((item) => item.id === difficultyId) || gardenMatchDifficulties[0];
  const categoryCards = gardenMatchCards.filter((card) => card.category === categoryId && card.id && card.pairId && card.title);
  const pairs = new Map();

  categoryCards.forEach((card) => {
    if (!pairs.has(card.pairId)) pairs.set(card.pairId, []);
    pairs.get(card.pairId).push(card);
  });

  const completePairs = [...pairs.values()].filter((pair) => pair.length === 2);
  const selectedPairs = completePairs.slice(0, difficulty.pairCount);

  return shuffleGardenMatchCards(selectedPairs.flat(), random).map((card, index) => ({
    ...card,
    instanceId: `${card.id}-${index}`,
  }));
}

export function formatGardenMatchTime(milliseconds = 0) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function readGardenMatchScores(storage = globalThis.localStorage) {
  if (!storage) return {};
  try {
    const saved = JSON.parse(storage.getItem(GARDEN_MATCH_SCORE_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

export function saveGardenMatchResult(categoryId, difficultyId, result, storage = globalThis.localStorage) {
  const scores = readGardenMatchScores(storage);
  const scoreId = `${categoryId}:${difficultyId}`;
  const previous = scores[scoreId] || {};
  const next = {
    bestTimeMs: Number.isFinite(previous.bestTimeMs) ? Math.min(previous.bestTimeMs, result.timeMs) : result.timeMs,
    bestMoves: Number.isFinite(previous.bestMoves) ? Math.min(previous.bestMoves, result.moves) : result.moves,
    lastCompletedAt: new Date().toISOString(),
  };

  scores[scoreId] = next;
  try {
    storage?.setItem(GARDEN_MATCH_SCORE_KEY, JSON.stringify(scores));
  } catch {
    return next;
  }
  return next;
}
