export const GARDEN_STATE_KEY = "jardinSoleilGardenStateV2";
export const GARDEN_STATE_VERSION = 2;

export const legacyGardenStorageKeys = {
  plants: "jardinSoleilPlants",
  journalEntries: "jardinSoleilJournalEntries",
  photos: "jardinSoleilPhotos",
  healthCases: "jardinSoleilPlantDiagnoses",
  plantIdentifications: "jardinSoleilPlantIdentifications",
  teaWorkflows: "jardinSoleilTeaWorkflows",
  zones: "jardinSoleilGardenCollections",
  tasks: "jardinSoleilTasks",
  lastTaskRefreshDate: "jardinSoleilTasksLastLocalRefresh",
  buddyGardenLogs: "jardinSoleilBuddyGardenLogs",
  inventoryItems: "jardinSoleilInventory",
  teaRecipes: "jardinSoleilTeaRecipes",
  calendarEntries: "jardinSoleilCalendarEvents",
};

const recordCollections = [
  "plants",
  "zones",
  "journalEntries",
  "photos",
  "healthCases",
  "plantIdentifications",
  "teaWorkflows",
  "tasks",
  "buddyGardenLogs",
  "inventoryItems",
  "teaRecipes",
  "calendarEntries",
];

const readJson = (key, fallback = null) => {
  try {
    const value = globalThis.localStorage?.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const createId = (prefix = "garden") => {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export const createGardenProfile = (values = {}) => ({
  id: values.id || createId("garden"),
  gardenName: values.gardenName || "",
  ownerDisplayName: values.ownerDisplayName || "",
  gardenType: Array.isArray(values.gardenType) ? values.gardenType : [],
  climateZone: values.climateZone || "",
  hemisphere: values.hemisphere === "southern" ? "southern" : "northern",
  locationLabel: values.locationLabel || "",
  units: values.units === "metric" ? "metric" : "imperial",
  createdAt: values.createdAt || new Date().toISOString(),
  onboardingCompleted: Boolean(values.onboardingCompleted),
  sampleGardenEnabled: Boolean(values.sampleGardenEnabled),
});

export const createEmptyGardenState = (profileValues = {}) => ({
  schemaVersion: GARDEN_STATE_VERSION,
  profile: createGardenProfile(profileValues),
  onboardingDraft: {
    step: 0,
    mode: "",
    profile: {},
    zones: [],
    plants: [],
  },
  plants: [],
  zones: [],
  journalEntries: [],
  photos: [],
  healthCases: [],
  plantIdentifications: [],
  teaWorkflows: [],
  tasks: [],
  buddyGardenLogs: [],
  inventoryItems: [],
  teaRecipes: [],
  calendarEntries: [],
  lastTaskRefreshDate: "",
  migratedFromLegacyAt: null,
});

const scopeGardenRecords = (state) => {
  const profile = createGardenProfile(state.profile);
  const normalized = { ...createEmptyGardenState(profile), ...state, profile, schemaVersion:GARDEN_STATE_VERSION };
  recordCollections.forEach((key) => {
    const records = Array.isArray(normalized[key]) ? normalized[key] : [];
    normalized[key] = records.map((record) => ({
      ...record,
      gardenProfileId: record.gardenProfileId || profile.id,
    }));
  });
  return normalized;
};

const readLegacyState = () => {
  const values = {};
  let hasLegacyGardenData = false;

  Object.entries(legacyGardenStorageKeys).forEach(([field, key]) => {
    const value = readJson(key, field === "lastTaskRefreshDate" ? "" : []);
    values[field] = value;
    if (Array.isArray(value) && value.length) hasLegacyGardenData = true;
  });

  if (!hasLegacyGardenData) return null;

  return scopeGardenRecords({
    ...createEmptyGardenState({
      gardenName: "My Jardin Soleil",
      onboardingCompleted: true,
    }),
    ...values,
    migratedFromLegacyAt: new Date().toISOString(),
  });
};

export const loadGardenState = () => {
  const stored = readJson(GARDEN_STATE_KEY);
  if (stored?.profile?.id) return scopeGardenRecords(stored);

  const legacy = readLegacyState();
  if (legacy) {
    saveGardenState(legacy);
    return legacy;
  }

  return createEmptyGardenState();
};

export const saveGardenState = (state) => {
  const normalized = scopeGardenRecords(state);
  try {
    globalThis.localStorage?.setItem(GARDEN_STATE_KEY, JSON.stringify(normalized));
  } catch {
    // The in-memory garden remains usable if browser storage is unavailable or full.
  }
  return normalized;
};

export const gardenBackupCounts = (state) => ({
  plants: Array.isArray(state?.plants) ? state.plants.length : 0,
  zones: Array.isArray(state?.zones) ? state.zones.length : 0,
  journalEntries: Array.isArray(state?.journalEntries) ? state.journalEntries.length : 0,
  tasks: Array.isArray(state?.tasks) ? state.tasks.length : 0,
  photos: Array.isArray(state?.photos) ? state.photos.length : 0,
  healthCases: Array.isArray(state?.healthCases) ? state.healthCases.length : 0,
  harvests: Array.isArray(state?.journalEntries)
    ? state.journalEntries.filter((entry) => /harvest/i.test(`${entry.type || ""} ${entry.title || ""}`)).length
    : 0,
});

export const validateGardenBackup = (candidate) => {
  if (!candidate || typeof candidate !== "object") {
    return { valid:false, error:"This file does not contain a Jardin Soleil garden backup." };
  }
  if (!candidate.profile || typeof candidate.profile !== "object") {
    return { valid:false, error:"The backup is missing its garden profile." };
  }
  const invalidCollection = recordCollections.find((key) => candidate[key] !== undefined && !Array.isArray(candidate[key]));
  if (invalidCollection) {
    return { valid:false, error:`The ${invalidCollection} section is not valid.` };
  }
  const normalized = scopeGardenRecords({
    ...createEmptyGardenState(candidate.profile),
    ...candidate,
    profile:createGardenProfile(candidate.profile),
  });
  return { valid:true, state:normalized, counts:gardenBackupCounts(normalized) };
};

export const makeGardenBackup = (state) => {
  const normalized = scopeGardenRecords(state);
  return {
    ...normalized,
    schemaVersion:GARDEN_STATE_VERSION,
    exportedAt:new Date().toISOString(),
    exportType:"Jardin Soleil Garden Backup",
    harvests:normalized.journalEntries.filter((entry) => /harvest/i.test(`${entry.type || ""} ${entry.title || ""}`)),
  };
};
