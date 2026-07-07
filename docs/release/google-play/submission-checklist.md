# Google Play Manual Submission Checklist

Generated: 2026-06-07
App: Deen o Dunya Planner
Package ID: `com.deenodunya.planner`

## Phase 1 - Generate And Verify Android Project

- [ ] Run `npm install`.
- [ ] Run `npm run check` and resolve failures.
- [ ] Run `npm run cap:sync`.
- [ ] Confirm `android/` project exists after sync.
- [ ] Commit generated Android project if this repo is intended to be the release source of truth.
- [ ] Verify Android `applicationId` or namespace is `com.deenodunya.planner`.
- [ ] Set/verify `versionName` aligns with `package.json` version `1.0.0` or update both intentionally.
- [ ] Set/verify first Play `versionCode`, usually `1` for an initial release unless Play Console already has builds.
- [ ] Verify `targetSdk` is Android 15 / API 35 or higher for current Google Play submission.
- [ ] Verify Android permissions in `AndroidManifest.xml`.
- [ ] Verify signing setup and Play App Signing plan.

## Phase 2 - Build Release Candidate

- [ ] Build release Android App Bundle (`.aab`).
- [ ] Verify the AAB package ID is `com.deenodunya.planner`.
- [ ] Verify versionCode/versionName in the AAB.
- [ ] Install/test release build on a physical Android device or emulator.
- [ ] Test prayer time flow.
- [ ] Test location permission behavior.
- [ ] Test qibla direction behavior.
- [ ] Test Qur'an/tafsir/azkar content loading.
- [ ] Test offline/local-storage behavior.
- [ ] Test privacy policy link in-app.

## Phase 3 - Store Assets

- [ ] Generate 512 x 512 Play icon PNG from `assets/app-icon.svg`.
- [ ] Create 1024 x 500 feature graphic.
- [ ] Capture required phone screenshots from final Android release candidate.
- [ ] Capture tablet screenshots if tablet distribution is enabled.
- [ ] Confirm screenshots show only features that are actually available.

## Phase 4 - Privacy Policy

- [ ] Choose public privacy policy hosting location.
- [ ] Publish existing `privacy.html` wording unchanged.
- [ ] Verify public URL loads without authentication.
- [ ] Paste public URL into Play Console.
- [ ] Confirm in-app privacy policy link works in release build.

## Phase 5 - Play Console Store Listing

- [ ] Create app in Play Console using app name `Deen o Dunya Planner`.
- [ ] Confirm default language.
- [ ] Paste short description from `play-listing-copy.md`.
- [ ] Paste full description from `play-listing-copy.md`.
- [ ] Select category: Lifestyle, unless final review chooses Productivity.
- [ ] Upload icon.
- [ ] Upload feature graphic.
- [ ] Upload screenshots.
- [ ] Add developer contact email: `mjawaid.ca@gmail.com`.

## Phase 6 - App Content And Compliance

- [ ] Complete Privacy Policy section.
- [ ] Complete App Access section.
- [ ] Complete Ads declaration.
- [ ] Complete Content Rating questionnaire.
- [ ] Complete Target Audience and Content.
- [ ] Complete Data Safety form based on verified app behavior and Android permissions.
- [ ] Complete any permission declarations triggered by the release AAB.
- [ ] Confirm no Play policy warnings remain.

## Phase 7 - Testing Track And Release

- [ ] Upload AAB to internal testing.
- [ ] Add testers.
- [ ] Install from Play internal testing link.
- [ ] Perform smoke test on installed Play build.
- [ ] Resolve policy/build warnings.
- [ ] Promote to closed/open/production track according to developer account requirements.

## Handoff Notes

Do not submit to production until these are resolved:

- Android native project generated and verified.
- AAB generated and verified.
- Public privacy-policy URL finalized.
- Data Safety form aligned with actual permissions, network calls, SDKs, and privacy policy.
- Store screenshots/assets finalized.
- Google Drive launch workspace reconciled or created.
