# Jardin Soleil storage migration

## Current store

Garden-owned data is persisted as one versioned document:

- `jardinSoleilGardenStateV2`

The document contains:

- `profile`
- `onboardingDraft`
- `plants`
- `zones`
- `journalEntries`
- `photos`
- `healthCases`
- `plantIdentifications`
- `teaWorkflows`
- `tasks`
- `buddyGardenLogs`
- `inventoryItems`
- `teaRecipes`
- `calendarEntries`
- `lastTaskRefreshDate`

All access to this garden document goes through `src/services/gardenStorage.js`. The adapter validates imports, scopes records to the active profile, creates clean empty state, and can later be replaced by a cloud repository.

## One-time legacy migration

On first load without a V2 document, the adapter checks these previous keys:

- `jardinSoleilPlants`
- `jardinSoleilJournalEntries`
- `jardinSoleilPhotos`
- `jardinSoleilPlantDiagnoses`
- `jardinSoleilPlantIdentifications`
- `jardinSoleilTeaWorkflows`
- `jardinSoleilGardenCollections`
- `jardinSoleilTasks`
- `jardinSoleilTasksLastLocalRefresh`
- `jardinSoleilBuddyGardenLogs`
- `jardinSoleilInventory`
- `jardinSoleilTeaRecipes`
- `jardinSoleilCalendarEvents`

If at least one legacy garden collection contains records, the adapter creates a local migrated profile, attaches its `gardenProfileId` to every record, and writes the V2 document. Legacy keys are intentionally not deleted automatically.

If no legacy garden data exists, the adapter creates an empty profile with `onboardingCompleted: false`. No sample plants, zones, tasks, recipes, logs, photos, or statistics are loaded.

## Other local preferences

Weather, dashboard skin, learning progress, Conservatory preferences, and game preferences remain separate general app settings. A garden reset preserves these where practical. Weather location starts unset for a new browser.

## Export and import

Garden Settings exports the V2 document as formatted JSON. Import:

1. parses the selected JSON locally;
2. validates the garden profile and every collection;
3. shows record counts;
4. requires a separate confirmation before replacement.

Clear, Sample Garden replacement, and Start Fresh use typed confirmation phrases.
