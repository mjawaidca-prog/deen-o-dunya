# Google Play Verification Report

Generated: 2026-06-07
App: Deen o Dunya Planner
Target package ID: `com.deenodunya.planner`
Repository: `mjawaidca-prog/deen-o-dunya`

## Status

Not submission-ready.

The repo has enough evidence to confirm the intended app name and Capacitor app ID, but it does not currently include a verifiable Android native project or upload-ready Android App Bundle.

## Verified Matches

| Item | Expected | Found | Status |
| --- | --- | --- | --- |
| App name | Deen o Dunya Planner | `capacitor.config.json` appName: `Deen o Dunya Planner`; `package.json` scripts use `Deen o Dunya Planner` | Match |
| Android package ID | `com.deenodunya.planner` | `capacitor.config.json` appId: `com.deenodunya.planner`; `package.json` cap init script uses same ID | Match |
| Web/mobile bundle directory | `dist` | `capacitor.config.json` webDir: `dist`; `scripts/prepare-mobile-build.js` writes to `dist/` | Match |
| Repo package version | n/a | `package.json` version: `1.0.0` | Found |
| Privacy policy in app | Required for Play listing and in-app access | `privacy.html`; `index.html` links `./privacy.html` | Found |
| PWA manifest | Required for web/PWA metadata | `manifest.webmanifest` | Found |
| App icon source | Store asset source candidate | `assets/app-icon.svg` | Found |

## Missing Or Unverified

| Item | Expected File Or Evidence | Current Result | Launch Impact |
| --- | --- | --- | --- |
| Android app module Gradle file | `android/app/build.gradle` or `android/app/build.gradle.kts` | Not found | Blocks applicationId, versionCode, versionName, min/target SDK, signing, dependencies, and AAB verification |
| Android manifest | `android/app/src/main/AndroidManifest.xml` | Not found | Blocks permissions and Play policy verification |
| Android settings | `android/settings.gradle` | Not found | Blocks native project verification |
| Android upload bundle | `.aab` build artifact | Not found | Blocks Play Console release upload |
| Android signing references | Gradle signing config, keystore docs, CI secrets, or Play App Signing notes | Not found | Blocks signing readiness verification |
| Target SDK | Native Android Gradle config | Not found | Blocks current Google Play target API compliance verification |
| Version code | Native Android Gradle config | Not found | Blocks release upload; Play requires monotonically increasing version codes |
| Version name | Native Android Gradle config | Not found | Cannot verify against `package.json` version `1.0.0` |
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

## Required Build Verification Commands

Run after the Android project is generated and committed:

```bash
npm install
npm run check
npm run cap:sync
```

Then verify native Android files:

```bash
rg "applicationId|namespace|versionCode|versionName|minSdk|targetSdk|compileSdk" android
rg "uses-permission|ACCESS_|CAMERA|RECORD_AUDIO|INTERNET" android/app/src/main/AndroidManifest.xml
```

Build an Android App Bundle from Android Studio or Gradle after confirming signing configuration. The exact Gradle command depends on the generated Capacitor Android project, but is usually similar to:

```bash
cd android
./gradlew bundleRelease
```

## Release Readiness Decision

Do not submit yet. First generate and commit the Android native project, verify target SDK/API 35+, verify permissions and signing, generate a release AAB, and reconcile the Drive launch folder.
