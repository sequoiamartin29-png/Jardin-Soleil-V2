import {
  gardenMatchCards,
  gardenMatchCollections,
  gardenMatchDifficulties,
  gardenMatchJourneyAreas,
} from "../data/gardenMatchData.js";

export const GARDEN_MATCH_SCORE_KEY = "jardinSoleil:gardenMatch:best:v1";
export const GARDEN_MATCH_RECORDS_KEY = "jardinSoleil:gardenMatch:records:v2";
export const GARDEN_MATCH_PROGRESS_KEY = "jardinSoleil:gardenMatch:progress:v2";
export const GARDEN_MATCH_DAILY_KEY = "jardinSoleil:gardenMatch:daily:v1";
export const GARDEN_MATCH_SETTINGS_KEY = "jardinSoleil:gardenMatch:settings:v1";

const emptyProgress = {
  version:2,
  totalCompletions:0,
  completedCollections:{},
  masteredCollections:{},
  unlockedRewards:[],
  badges:[],
  discoveredSeasons:[],
  updatedAt:null,
};

const emptyDaily = {
  version:1,
  dates:{},
  currentStreak:0,
  longestStreak:0,
  lastCompletedDate:null,
};

function storageOrNull(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function readObject(key, fallback, storage) {
  const source = storageOrNull(storage);
  if (!source) return { ...fallback };
  try {
    const value = JSON.parse(source.getItem(key) || "null");
    return value && typeof value === "object" && !Array.isArray(value) ? value : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function writeObject(key, value, storage) {
  try {
    storageOrNull(storage)?.setItem(key, JSON.stringify(value));
  } catch {
    // A private or full storage area should never stop a playable round.
  }
  return value;
}

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

export function hashGardenMatchSeed(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < String(value).length; index += 1) {
    hash ^= String(value).charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createGardenMatchRandom(seed) {
  let state = typeof seed === "number" ? seed >>> 0 : hashGardenMatchSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function getGardenMatchLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getGardenMatchSeason(date = new Date()) {
  const month = date.getMonth();
  if ([2, 3, 4].includes(month)) return "spring";
  if ([5, 6, 7].includes(month)) return "summer";
  if ([8, 9, 10].includes(month)) return "autumn";
  return "winter";
}

export function buildGardenMatchDeck(categoryId, difficultyId, randomOrOptions = Math.random) {
  const difficulty = gardenMatchDifficulties.find((item) => item.id === difficultyId) || gardenMatchDifficulties[0];
  const options = typeof randomOrOptions === "function" ? {} : (randomOrOptions || {});
  const random = typeof randomOrOptions === "function"
    ? randomOrOptions
    : createGardenMatchRandom(options.seed ?? `${categoryId}:${difficultyId}:${Date.now()}`);
  const categoryCards = gardenMatchCards.filter((card) => card.category === categoryId && card.id && card.pairId && card.title);
  const pairs = new Map();

  categoryCards.forEach((card) => {
    if (!pairs.has(card.pairId)) pairs.set(card.pairId, []);
    pairs.get(card.pairId).push(card);
  });

  const completePairs = [...pairs.values()].filter((pair) => pair.length === 2);
  const season = options.season || getGardenMatchSeason();
  const orderedPairs = categoryId === "seasonal-garden"
    ? [
        ...shuffleGardenMatchCards(completePairs.filter((pair) => pair[0].season === season), random),
        ...shuffleGardenMatchCards(completePairs.filter((pair) => pair[0].season !== season), random),
      ]
    : shuffleGardenMatchCards(completePairs, random);
  const selectedPairs = orderedPairs.slice(0, difficulty.pairCount);

  return shuffleGardenMatchCards(selectedPairs.flat(), random).map((card, index) => ({
    ...card,
    instanceId:`${card.id}-${index}`,
  }));
}

export function getDailyGardenChallenge(date = new Date()) {
  const dateKey = typeof date === "string" ? date : getGardenMatchLocalDate(date);
  const eligible = gardenMatchCollections.filter((collection) => collection.cards.length >= 12);
  const difficultyIds = ["sprout", "bloom", "estate"];
  const hash = hashGardenMatchSeed(`jardin-soleil:${dateKey}`);
  const collection = eligible[hash % eligible.length] || gardenMatchCollections[0];
  const difficultyId = difficultyIds[Math.floor(hash / Math.max(1, eligible.length)) % difficultyIds.length];
  return {
    dateKey,
    collectionId:collection.id,
    difficultyId,
    seed:`daily:${dateKey}:${collection.id}:${difficultyId}`,
  };
}

export function formatGardenMatchTime(milliseconds = 0) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function readGardenMatchScores(storage) {
  return readObject(GARDEN_MATCH_SCORE_KEY, {}, storage);
}

export function readGardenMatchRecords(storage) {
  return readObject(GARDEN_MATCH_RECORDS_KEY, {}, storage);
}

export function gardenMatchRecordId(modeId, categoryId, difficultyId) {
  return `${modeId}:${categoryId}:${difficultyId}`;
}

export function saveGardenMatchResult(categoryId, difficultyId, result, storage, modeId = "classic") {
  const source = storageOrNull(storage);
  const scores = readGardenMatchScores(source);
  const legacyId = `${categoryId}:${difficultyId}`;
  const previous = scores[legacyId] || {};
  const next = {
    bestTimeMs:Number.isFinite(previous.bestTimeMs) ? Math.min(previous.bestTimeMs, result.timeMs) : result.timeMs,
    bestMoves:Number.isFinite(previous.bestMoves) ? Math.min(previous.bestMoves, result.moves) : result.moves,
    bestScore:Number.isFinite(previous.bestScore) ? Math.max(previous.bestScore, result.score || 0) : (result.score || 0),
    lastCompletedAt:new Date().toISOString(),
  };
  scores[legacyId] = next;
  writeObject(GARDEN_MATCH_SCORE_KEY, scores, source);

  const records = readGardenMatchRecords(source);
  const recordId = gardenMatchRecordId(modeId, categoryId, difficultyId);
  const oldRecord = records[recordId] || {};
  records[recordId] = {
    ...oldRecord,
    bestTimeMs:Number.isFinite(oldRecord.bestTimeMs) ? Math.min(oldRecord.bestTimeMs, result.timeMs) : result.timeMs,
    bestMoves:Number.isFinite(oldRecord.bestMoves) ? Math.min(oldRecord.bestMoves, result.moves) : result.moves,
    bestScore:Number.isFinite(oldRecord.bestScore) ? Math.max(oldRecord.bestScore, result.score || 0) : (result.score || 0),
    bestAccuracy:Number.isFinite(oldRecord.bestAccuracy) ? Math.max(oldRecord.bestAccuracy, result.accuracy || 0) : (result.accuracy || 0),
    highestCombo:Math.max(oldRecord.highestCombo || 0, result.highestCombo || 0),
    completions:(oldRecord.completions || 0) + 1,
    lastResult:{ ...result, completedAt:new Date().toISOString() },
  };
  writeObject(GARDEN_MATCH_RECORDS_KEY, records, source);
  return { legacy:next, record:records[recordId] };
}

export function readGardenMatchProgress(storage) {
  const saved = readObject(GARDEN_MATCH_PROGRESS_KEY, emptyProgress, storage);
  return {
    ...emptyProgress,
    ...saved,
    completedCollections:{ ...emptyProgress.completedCollections, ...(saved.completedCollections || {}) },
    masteredCollections:{ ...emptyProgress.masteredCollections, ...(saved.masteredCollections || {}) },
    unlockedRewards:Array.isArray(saved.unlockedRewards) ? saved.unlockedRewards : [],
    badges:Array.isArray(saved.badges) ? saved.badges : [],
    discoveredSeasons:Array.isArray(saved.discoveredSeasons) ? saved.discoveredSeasons : [],
  };
}

export function isGardenMatchCollectionUnlocked(collection, progress, date = new Date()) {
  if (!collection) return false;
  const requirement = collection.unlockRequirement || { type:"always", value:0 };
  if (requirement.type === "always") return true;
  if (requirement.type === "completed") return (progress?.totalCompletions || 0) >= requirement.value;
  if (requirement.type === "seasonal") {
    const season = getGardenMatchSeason(date);
    return progress?.discoveredSeasons?.includes(season) || collection.id === "seasonal-garden";
  }
  return false;
}

export function getGardenMatchJourney(progress) {
  return gardenMatchJourneyAreas.map((area) => {
    const completed = area.unlockCollections.filter((id) => (progress.completedCollections[id] || 0) > 0).length;
    const mastered = area.unlockCollections.filter((id) => progress.masteredCollections[id]).length;
    let state = "locked";
    if (completed > 0) state = "in-progress";
    if (completed === area.unlockCollections.length) state = "completed";
    if (mastered === area.unlockCollections.length) state = "mastered";
    if (area.id === "herb-walk" || area.id === "tea-corridor") state = completed ? state : "available";
    if (area.id === "orchard-path" && progress.totalCompletions >= 1 && state === "locked") state = "available";
    if (area.id === "rose-court" && progress.totalCompletions >= 2 && state === "locked") state = "available";
    if (area.id === "pollinator-meadow" && progress.totalCompletions >= 3 && state === "locked") state = "available";
    if (area.id === "moon-garden" && progress.totalCompletions >= 4 && state === "locked") state = "available";
    return { ...area, state, completed, total:area.unlockCollections.length };
  });
}

export function updateGardenMatchProgress(categoryId, result, storage, date = new Date()) {
  const progress = readGardenMatchProgress(storage);
  const completedCollections = {
    ...progress.completedCollections,
    [categoryId]:(progress.completedCollections[categoryId] || 0) + 1,
  };
  const isMastery = result.difficultyId === "master-gardener"
    || (result.difficultyId === "estate" && result.accuracy >= 0.9);
  const masteredCollections = isMastery
    ? { ...progress.masteredCollections, [categoryId]:true }
    : { ...progress.masteredCollections };
  const collection = gardenMatchCollections.find((item) => item.id === categoryId);
  const badges = collection?.badge && !progress.badges.includes(collection.badge)
    ? [...progress.badges, collection.badge]
    : [...progress.badges];
  const discoveredSeasons = [...new Set([...progress.discoveredSeasons, getGardenMatchSeason(date)])];
  const provisional = {
    ...progress,
    totalCompletions:progress.totalCompletions + 1,
    completedCollections,
    masteredCollections,
    badges,
    discoveredSeasons,
    updatedAt:new Date().toISOString(),
  };
  const completedAreaRewards = getGardenMatchJourney(provisional)
    .filter((area) => area.state === "completed" || area.state === "mastered")
    .map((area) => area.rewardId);
  provisional.unlockedRewards = [...new Set([...progress.unlockedRewards, ...completedAreaRewards])];
  writeObject(GARDEN_MATCH_PROGRESS_KEY, provisional, storage);
  return provisional;
}

export function grantGardenMatchReward(rewardId, storage) {
  const progress = readGardenMatchProgress(storage);
  if (progress.unlockedRewards.includes(rewardId)) return progress;
  const next = {
    ...progress,
    unlockedRewards:[...progress.unlockedRewards, rewardId],
    updatedAt:new Date().toISOString(),
  };
  writeObject(GARDEN_MATCH_PROGRESS_KEY, next, storage);
  return next;
}

export function calculateGardenMatchScore({ pairCount, moves, timeMs, hintsUsed = 0, highestCombo = 0, difficultyMultiplier = 1 }) {
  const safeMoves = Math.max(1, moves);
  const accuracy = Math.min(1, pairCount / safeMoves);
  const efficiency = Math.max(0, (pairCount * 2.5) - safeMoves);
  const timeBonus = Math.max(0, 180 - Math.floor(timeMs / 1000));
  const rawScore = (pairCount * 100)
    + Math.round(accuracy * 500)
    + Math.round(efficiency * 30)
    + (timeBonus * 3)
    + (highestCombo * 60)
    - (hintsUsed * 75);
  return {
    score:Math.max(0, Math.round(rawScore * difficultyMultiplier)),
    accuracy,
    efficiency:Math.max(0, Math.round(efficiency)),
  };
}

export function getGardenMatchRank(score = 0) {
  if (score >= 4200) return "Master of Jardin Soleil";
  if (score >= 3000) return "Estate Gardener";
  if (score >= 2100) return "Bloom Tender";
  if (score >= 1300) return "Seed Keeper";
  return "Garden Visitor";
}

export function getGardenMatchComboLabel(combo = 0) {
  if (combo >= 5) return "Soleil Streak!";
  if (combo >= 3) return "Garden Glow!";
  if (combo >= 2) return "Budding Streak!";
  return "";
}

export function readDailyGardenProgress(storage) {
  const saved = readObject(GARDEN_MATCH_DAILY_KEY, emptyDaily, storage);
  return { ...emptyDaily, ...saved, dates:{ ...(saved.dates || {}) } };
}

function previousLocalDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day - 1);
  return getGardenMatchLocalDate(date);
}

export function saveDailyGardenCompletion(dateKey, result, storage) {
  const daily = readDailyGardenProgress(storage);
  const previousEntry = daily.dates[dateKey];
  const rewardGranted = !previousEntry?.rewardClaimed;
  const continued = daily.lastCompletedDate === previousLocalDate(dateKey);
  const currentStreak = previousEntry
    ? daily.currentStreak
    : continued ? daily.currentStreak + 1 : 1;
  const next = {
    ...daily,
    dates:{
      ...daily.dates,
      [dateKey]:{
        completed:true,
        rewardClaimed:true,
        rewardId:`daily-bloom:${dateKey}`,
        completedAt:previousEntry?.completedAt || new Date().toISOString(),
        bestScore:Math.max(previousEntry?.bestScore || 0, result.score || 0),
        plays:(previousEntry?.plays || 0) + 1,
      },
    },
    currentStreak,
    longestStreak:Math.max(daily.longestStreak || 0, currentStreak),
    lastCompletedDate:dateKey,
  };
  writeObject(GARDEN_MATCH_DAILY_KEY, next, storage);
  return { daily:next, rewardGranted };
}

export function defaultGardenMatchSettings() {
  let reduceMotion = false;
  try {
    reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
  } catch {
    reduceMotion = false;
  }
  return {
    sound:false,
    reducedMotion:reduceMotion,
    facts:true,
    previewDuration:"difficulty",
    highContrast:false,
    cardSize:"comfortable",
    buddyHints:true,
  };
}

export function readGardenMatchSettings(storage) {
  return { ...defaultGardenMatchSettings(), ...readObject(GARDEN_MATCH_SETTINGS_KEY, {}, storage) };
}

export function saveGardenMatchSettings(settings, storage) {
  const next = { ...defaultGardenMatchSettings(), ...settings };
  writeObject(GARDEN_MATCH_SETTINGS_KEY, next, storage);
  return next;
}
