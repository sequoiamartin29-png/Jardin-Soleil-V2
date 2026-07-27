# Jardin Soleil Store Submission

## Release identity

- App name: Jardin Soleil
- Bundle/application ID: `com.tierrafleur.jardinsoleil`
- Initial version: `1.0.0`
- Category: Lifestyle
- Support email: `tierrafleur.design@gmail.com`
- Support website: `https://tierrafleur.com`
- Public privacy policy: `https://YOUR-NETLIFY-DOMAIN/privacy.html`

Replace the privacy-policy placeholder with the deployed Jardin Soleil domain before submission.

## Short description

Your private garden companion for plant care, records, learning, and botanical play.

## Full description

Jardin Soleil brings the rhythm of your garden into one thoughtfully designed place. Organize plants and growing zones, follow care tasks, record photos and journal entries, review plant-health observations, explore guided learning, and enjoy botanical games in a warm French-chalet setting.

Your core garden records stay on your device. Optional online tools—including local weather, Plant Finder photo identification, and external Conservatory guidance—are used only when you choose them.

Key features:

- Plant directory, profiles, zones, archive, and safe delete controls
- Tasks, calendar, journal, photo records, harvests, and inventory
- Plant Health Center with guided observations and follow-ups
- Optional photo identification through Pl@ntNet
- Gardening and herbal learning lessons with saved progress
- Garden games, Buddy’s Garden, and seasonal challenges
- Exportable garden backup for moving or restoring records
- Accessibility support, reduced-motion support, and responsive phone layouts

Jardin Soleil supports gardeners of all experience levels. Identification and plant-health results are educational guidance, not a substitute for a qualified local expert. Never consume a plant based only on an app result.

## Required screenshots

Capture current production data only—never real customer information.

1. French Chalet Dashboard
2. Plant Directory
3. Plant Profile and care record
4. Plant Health Center
5. Journal
6. Learning Center lesson
7. Garden Games
8. Garden Settings backup controls

Capture at minimum:

- iPhone 6.9-inch display class
- iPhone 6.5-inch display class if App Store Connect requests it
- Android phone at 1080 × 1920 or higher

## App privacy and data-safety answers

Confirm these against the deployed production configuration before answering the stores:

- Core garden records: stored locally on the device
- Account creation: none
- Advertising/tracking: none
- Precise location: optional, used only while the feature is active
- Photos: user-selected for garden records or optional identification
- Audio: microphone used only for user-started voice logging
- Third-party processing: Open-Meteo for weather; Pl@ntNet for optional photo identification; configured AI provider only when external Conservatory AI is enabled
- Data deletion: available through Garden Settings; uninstalling removes unexported local app data

## Final release gates

- [ ] Deploy `/privacy.html` and enter its public URL in both stores
- [ ] Replace support placeholders with the final live URLs
- [ ] Confirm Tierra Fleur Designs owns the final bundle/application ID
- [ ] Complete the device matrix in `docs/device-testing.md`
- [ ] Run `npm run verify`
- [ ] Run `npm run native:sync`
- [ ] Create a signed Android App Bundle in Android Studio
- [ ] Archive and validate the iOS build in Xcode
- [ ] Upload screenshots and complete content-rating questionnaires
- [ ] Use internal testing/TestFlight before production submission
