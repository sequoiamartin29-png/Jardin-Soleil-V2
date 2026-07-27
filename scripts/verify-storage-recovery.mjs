import assert from "node:assert/strict";

const values = new Map();
globalThis.localStorage = {
  getItem:key => values.has(key) ? values.get(key) : null,
  setItem:(key, value) => values.set(key, String(value)),
  removeItem:key => values.delete(key),
};

const {
  GARDEN_STATE_BACKUP_KEY,
  GARDEN_STATE_KEY,
  GARDEN_STATE_STAGED_KEY,
  createEmptyGardenState,
  loadGardenState,
  saveGardenState,
} = await import("../src/services/gardenStorage.js");

const first = createEmptyGardenState({ gardenName:"First Garden", onboardingCompleted:true });
saveGardenState(first);
assert.equal(JSON.parse(values.get(GARDEN_STATE_KEY)).profile.gardenName, "First Garden");
assert.equal(values.has(GARDEN_STATE_STAGED_KEY), false);

saveGardenState({ ...first, profile:{ ...first.profile, gardenName:"Updated Garden" } });
assert.equal(JSON.parse(values.get(GARDEN_STATE_BACKUP_KEY)).profile.gardenName, "First Garden");

values.set(GARDEN_STATE_KEY, "{corrupted");
assert.equal(loadGardenState().profile.gardenName, "First Garden");
assert.equal(JSON.parse(values.get(GARDEN_STATE_KEY)).profile.gardenName, "First Garden");

console.log("Garden storage recovery verification passed.");
