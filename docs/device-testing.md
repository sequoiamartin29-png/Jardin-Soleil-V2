# Jardin Soleil Device Test Matrix

Use a fresh sample garden first, then repeat the critical data tests with an exported test backup. Record the device, operating-system version, result, and any issue.

| Device class | Minimum coverage | Status |
|---|---|---|
| Current iPhone | Latest iOS | Pending physical device |
| Older supported iPhone | Oldest iOS supported by the generated Xcode project | Pending physical device |
| iPad | Latest iPadOS, portrait and landscape | Pending physical device |
| Current Android phone | Latest stable Android | Pending physical device |
| Older Android phone | Android minimum SDK from `android/variables.gradle` | Pending physical device |
| Android tablet | Current Android, portrait and landscape | Pending physical device |

## Critical path

- [ ] First launch and onboarding complete without clipping
- [ ] Menu opens, traps focus, closes, and restores focus
- [ ] Every primary menu destination opens
- [ ] Dashboard hotspots open the intended garden area
- [ ] Single Plant Health alert opens its exact plant or case
- [ ] Multiple alerts open the needs-attention list
- [ ] Add, edit, archive, restore, delete, and undo a plant
- [ ] Add and complete a task
- [ ] Add a journal entry and photo
- [ ] Open a lesson, complete it, favorite it, and confirm progress after relaunch
- [ ] Start each garden game and confirm controls respond
- [ ] Deny camera, photo, location, and microphone permissions; app remains usable
- [ ] Grant each permission from the relevant feature; feature works
- [ ] Export a garden backup and import it on a second test installation
- [ ] Force-close during use and confirm saved data returns
- [ ] Turn on airplane mode and confirm local features remain usable
- [ ] Verify online tools fail with clear recovery messages
- [ ] Android hardware Back returns to Dashboard, then exits from Dashboard
- [ ] Text at 200% remains readable and controls remain reachable
- [ ] Screen reader announces page titles, buttons, alerts, and form errors
- [ ] Reduced-motion setting removes nonessential movement
- [ ] Light and dark device appearance preserve readable status/navigation bars

## Performance acceptance

- Cold launch reaches usable onboarding or Dashboard without a blank screen.
- Dashboard art does not visibly jump after load.
- No page blocks input while an unrelated page chunk loads.
- Scrolling stays responsive with 100 plants, 250 journal entries, and 100 photos.
- No crash or data loss after ten repeated background/foreground cycles.
