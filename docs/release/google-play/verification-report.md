# Google Play Verification Report

Generated: 2026-06-07
Updated: 2026-06-07
App: Deen o Dunya Planner
Target package ID: `com.deenodunya.planner`
Repository: `mjawaidca-prog/deen-o-dunya`

## Status

Not submission-ready, but materially advanced.

The developer machine successfully generated the native Android project and built a release AAB. The generated Android project has not yet been committed back to GitHub, so connector-side native Android metadata still cannot be verified from the repository.

## Developer-Machine Progress Reported

Confirmed from PowerShell output on 2026-06-07:

- `git clone` succeeded.
- `npm install` succeeded with 0 vulnerabilities.
- `npm run check` passed all readiness checks.
- `npm run cap:add:android` created the native `android/` project.
- `npm run cap:sync` completed for Android.
- Java was configured with Temurin JDK 21.0.11.
- `./gradlew.bat bundleRelease` completed successfully.
- Gradle reported `BUILD SUCCESSFUL` with 118 actionable tasks.

Current blocker: verify AAB path and Android metadata, then commit/push the generated Android project.

## Verified Matches From Repo Files

| Item | Expected | Found | Status |
| --- | --- | --- | --- |
| App name | Deen o Dunya Planner | `capacitor.config.json` appName: `Deen o Dunya Planner`; `package.json` scripts use `Deen o Dunya Planner` | Match |
| Android package ID | `com.deenodunya.planner` | `capacitor.config.json` appId: `com.deenodunya.planner`; `package.json` cap init script uses same ID | Match |
| Web/mobile bundle directory | `dist` | `capacitor.config.json` webDir: `dist`; `scripts/prepare-mobile-build.js` writes to `dist/` | Match |
| Repo package version | n/a | `package.json` version: `1.0.0` | Found |
| Privacy policy in app | Required for Play listing and in-app access | `privacy.html`; `index.html` links `./privacy.html` | Found |
| PWA manifest | Required for web/PWA metadata | `manifest.webmanifest` | Found |
| App icon source | Store asset source candidate | `assets/app-icon.svg` | Found |

## Missing Or Unverified In GitHub

| Item | Expected File Or Evidence | Current Result | Launch Impact |
| --- | --- | --- | --- |
| Android app module Gradle file | `android/app/build.gradle` or `android/app/build.gradle.kts` | Generated locally, not yet committed/verified in GitHub | Blocks connector-side verification until committed |
| Android manifest | `android/app/src/main/AndroidManifest.xml` | Generated locally, not yet committed/verified in GitHub | Blocks permissions verification until committed or pasted |
| Android upload bundle | `.aab` build artifact | Built locally, exact path/name not yet verified in handoff | Blocks Play upload handoff until file path is confirmed |
| Android signing references | Gradle signing config, keystore docs, CI secrets, or Play App Signing notes | Not found | Blocks signing readiness verification |
| Target SDK | Native Android Gradle config | Not yet verified | Blocks current Google Play target API compliance verification |
| Version code | Native Android Gradle config | Not yet verified | Blocks release upload; Play requires monotonically increasing version codes |
| Version name | Native Android Gradle config | Not yet verified | Cannot verify against `package.json` version `1.0.0` |
| Google Drive source workspace | `Deen o Dunya` Drive workspace | Not found via connected Drive search/root listing | Blocks Drive-vs-repo reconciliation |
| Store screenshots | Phone screenshots and optional tablet screenshots | Not found | Blocks store listing completion |
| Feature graphic | 1024 x 500 Play feature graphic | Not found | Likely blocks polished listing; may be required for some placements |

## Privacy Policy Evidence

Canonical repo file found: `privacy.html`.

Policy date: June 2, 2026.

Confirmed statements in the policy:

- The app is developed and maintained by Muhammad Jawaid.
- The app is a personal prayer, Qur'an, azkar, qibla and planning app.
- Preferences and downloaded reading data are stored locally on the device.
- Approximate location may be requested to calculate prayer times and qibla direction.
- Device orientation data may be requested for qibla compass functionality.
- Qur'an text, translations, tafsir, hadith, recitation audio, adhan audio, or fonts may be fetched from third-party services.
- The app does not sell personal or sensitive user data.

Privacy-policy wording must not be rewritten without explicit canonical-source approval.

## Google Play Policy Notes Checked

Current Google Play guidance says app content and Data safety declarations are managed from Play Console App content, and the Data safety form must reflect collection/sharing practices across app versions and regions. Current Android Developers guidance says new apps and updates submitted to Google Play must target Android 15 / API level 35 or higher, except certain specialized app categories.

Sources:

- https://support.google.com/googleplay/android-developer/answer/9859455
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://developer.android.com/google/play/requirements/target-sdk

## Required Next Commands

Locate the AAB:

```powershell
cd C:\Users\mjawa\deen-o-dunya\android
Get-ChildItem -Recurse app\build\outputs\bundle\release
```

Then verify native Android files from repo root:

```powershell
cd C:\Users\mjawa\deen-o-dunya
Select-String -Path android\**\*.gradle* -Pattern "applicationId|namespace|versionCode|versionName|minSdk|targetSdk|compileSdk"
Select-String -Path android\app\src\main\AndroidManifest.xml -Pattern "uses-permission|ACCESS_|CAMERA|RECORD_AUDIO|INTERNET|POST_NOTIFICATIONS"
```

Then commit/push generated Android files:

```powershell
git status
git add android package-lock.json
git commit -m "Add generated Android project"
git push
```

## Release Readiness Decision

Do not submit yet. First verify the AAB path and Android metadata, commit the generated Android project if this repo is the release source of truth, verify target SDK/API 35+, verify permissions and signing, and reconcile the Drive launch folder.
