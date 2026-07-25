# Jardin Soleil customer-data migration

## Owner-data protection

Before public defaults were changed, the previous source seed was exported to:

`.private-migrations/jardin-soleil-owner-seed-backup.json`

The directory is gitignored. The backup contains explicit sections for the garden profile, plants, zones, journal entries, Buddy logs, tasks, harvests, photos, health cases, identifications, inventory, tea recipes, tea workflows, calendar entries, and settings. Empty sections remain present so a later private import can distinguish “no source record” from a missing export section.

The backup must remain private. It must not be added to a public commit, copied into `src`, or used as Sample Garden data.

Browser-only records cannot be read by a build script. Existing installations migrate those records in the browser without deleting the old keys. The owner should open Garden Profile & Data after upgrade and use **Export My Garden** to create a complete runtime backup before removing legacy browser storage.

## Personal source references found

The audit found owner-specific defaults in:

- `src/data/plants.js`
- `src/data/jardinData.js`
- `src/data/inventory.js`
- `src/data/teaBlends.js`
- the former hard-coded Buddy greeting
- the former hard-coded Garden Map
- dashboard artwork text and dashboard panels
- the former default weather location

The public data modules now export empty customer defaults. Optional fictional records live only in `src/data/demoGardenData.js`. Buddy, weather, dashboard greetings, statistics, tasks, recent activity, harvest status, garden health, and spotlight content now use the active garden profile.

## Customer boundary

The local product stores a single `gardenProfile` and scopes every garden record with `gardenProfileId`. This prepares the data model for a future account-backed repository, but local storage is not represented as secure multi-user authentication.
