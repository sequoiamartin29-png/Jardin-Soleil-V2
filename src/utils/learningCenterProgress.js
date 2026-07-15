import { learningCenterLessons } from "../data/learningCenterLessons.js";

export const LEARNING_CENTER_PROGRESS_KEY = "jardinSoleil:learningCenter:progress:v2";
const LEGACY_PROGRESS_KEYS = [
  "jardinSoleil:learningCenter:progress:v1",
  "jardinSoleil:learning:progress",
  "learningCenterProgress",
];

export const emptyLearningProgress = {
  version:2,
  completedLessonIds:[],
  favoriteLessonIds:[],
  lastLessonId:null,
  reviewAnswers:{},
  updatedAt:null,
};

const lessonIds = new Set(learningCenterLessons.map((lesson) => lesson.id));
const lessonTitleIds = new Map(learningCenterLessons.map((lesson) => [lesson.title.toLocaleLowerCase(), lesson.id]));

function getStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function parseObject(value) {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeLessonId(value) {
  const text = String(value || "").trim();
  if (lessonIds.has(text)) return text;
  return lessonTitleIds.get(text.toLocaleLowerCase()) || null;
}

function idsFromLegacy(value) {
  const raw = value instanceof Set
    ? [...value]
    : Array.isArray(value)
      ? value
      : value && typeof value === "object"
        ? Object.entries(value).filter(([, enabled]) => Boolean(enabled)).map(([id]) => id)
        : [];
  return [...new Set(raw.map(normalizeLessonId).filter(Boolean))];
}

function normalizeProgress(saved) {
  const completedLessonIds = idsFromLegacy(saved.completedLessonIds || saved.completedLessons || saved.completed);
  const favoriteLessonIds = idsFromLegacy(saved.favoriteLessonIds || saved.favoriteLessons || saved.favorites);
  const lastLessonId = normalizeLessonId(saved.lastLessonId || saved.lastOpenedLesson || saved.currentLesson);
  const reviewAnswers = saved.reviewAnswers && typeof saved.reviewAnswers === "object" && !Array.isArray(saved.reviewAnswers)
    ? saved.reviewAnswers
    : {};
  return {
    version:2,
    completedLessonIds,
    favoriteLessonIds,
    lastLessonId,
    reviewAnswers,
    updatedAt:saved.updatedAt || null,
    ...(saved.migratedFrom ? { migratedFrom:saved.migratedFrom } : {}),
  };
}

export function readLearningProgress(storage) {
  const source = getStorage(storage);
  if (!source) return { ...emptyLearningProgress };
  const current = parseObject(source.getItem(LEARNING_CENTER_PROGRESS_KEY));
  if (current) return normalizeProgress(current);

  for (const key of LEGACY_PROGRESS_KEYS) {
    const legacy = parseObject(source.getItem(key));
    if (!legacy) continue;
    const migrated = { ...normalizeProgress(legacy), migratedFrom:key, updatedAt:new Date().toISOString() };
    try { source.setItem(LEARNING_CENTER_PROGRESS_KEY, JSON.stringify(migrated)); } catch { /* Keep the in-memory migration usable. */ }
    return migrated;
  }
  return { ...emptyLearningProgress };
}

export function saveLearningProgress(progress, storage) {
  const source = getStorage(storage);
  const next = {
    ...normalizeProgress(progress),
    updatedAt:new Date().toISOString(),
  };
  try { source?.setItem(LEARNING_CENTER_PROGRESS_KEY, JSON.stringify(next)); } catch { /* Learning remains usable when storage is unavailable. */ }
  return next;
}

export function updateLearningProgress(progress, changes, storage) {
  return saveLearningProgress({ ...progress, ...changes }, storage);
}

export function toggleLearningFavorite(progress, lessonId, storage) {
  const favorites = new Set(progress.favoriteLessonIds);
  if (favorites.has(lessonId)) favorites.delete(lessonId); else favorites.add(lessonId);
  return updateLearningProgress(progress, { favoriteLessonIds:[...favorites] }, storage);
}

export function setLearningCompletion(progress, lessonId, complete, storage) {
  const completed = new Set(progress.completedLessonIds);
  if (complete) completed.add(lessonId); else completed.delete(lessonId);
  return updateLearningProgress(progress, { completedLessonIds:[...completed] }, storage);
}

export function saveLearningReviewAnswer(progress, lessonId, questionId, answer, storage) {
  return updateLearningProgress(progress, {
    reviewAnswers:{
      ...progress.reviewAnswers,
      [lessonId]:{
        ...(progress.reviewAnswers[lessonId] || {}),
        [questionId]:answer,
      },
    },
  }, storage);
}
