# Google Play Verification Report

Generated: 2026-06-07
Updated: 2026-06-07
App: Deen o Dunya Planner
Target package ID: `com.deenodunya.planner`
Repository: `mjawaidca-prog/deen-o-dunya`

## Status

Not production-submission-ready yet, but the Android release build is now verified.

The native Android project is committed to GitHub. The Android package identity, SDK metadata, version name, version code, manifest permissions, and rebuilt release AAB path have been verified from the repository and developer-machine output.

Remaining blockers are store-submission items: signing/Play App Signing confirmation, public privacy-policy URL, screenshots, feature graphic, and Google Drive workspace reconciliation.

## Developer-Machine Progress Reported

Confirmed from PowerShell output on 2026-06-07:

- `git clone` succeeded.
- `npm install` succeeded with 0 vulnerabilities.
- `npm run check` passed all readiness checks.
- `npm run cap:add:android` created the native `android/` project.
- `npm run cap:sync` completed for Android.
- Java was configured with Temurin JDK 21.0.11.
- `./gradlew.bat bundleRelease` completed successfully.
- Initial Gradle build reported `BUILD SUCCESSFUL` with 118 actionable tasks.
- Generated Android project was pushed to GitHub at `main` commit `f831e07`.
- Android `versionName` was aligned to `1.0.0` and pushed to GitHub.
- Rebuilt release AAB succeeded in 1s with 118 actionable tasks: 1 executed, 117 up-to-date.
- Release AAB path: `C:\Users\mjawa\deen-o-dunya\android\app\build\outputs\bundle\release\app-release.aab`.
- Release AAB file size reported: 3,134,370 bytes.

## Verified Matches

| Item | Expected | Found | Status |
| --- | --- | --- | --- |
| App name | Deen o Dunya Planner | `capacitor.config.json`; Android `strings.xml` app_name/title_activity_main | Match |
| Android package ID | `com.deenodunya.planner` | `android/app/build.gradle` namespace and applicationId; Android `strings.xml` package_name/custom_url_scheme | Match |
| Web/mobile bundle directory | `dist` | `capacitor.config.json` webDir: `dist`; `scripts/prepare-mobile-build.js` writes to `dist/` | Match |
| Repo package version | `1.0.0` | `package.json` version: `1.0.0` | Match |
| Android version name | `1.0.0` | `android/app/build.gradle` versionName `1.0.0` | Match |
| Android version code | First release build code | `android/app/build.gradle` versionCode `1` | OK for initial release unless Play Console already has a prior build |
| Android target SDK | API 35+ | `android/variables.gradle` targetSdkVersion `36`; compileSdkVersion `36` | Match |
| Android min SDK | Project-defined | `android/variables.gradle` minSdkVersion `24` | Found |
| Android manifest permissions | Verify declared permissions | `android.permission.INTERNET` only | Found; aligns with web/content-fetch behavior |
| Android upload bundle | `.aab` artifact | `android\app\build\outputs\bundle\release\app-release.aab` on developer machine | Found |
| Privacy policy in app | Required for Play listing and in-app access | `privacy.html`; `index.html` links `./privacy.html` | Found |
| PWA manifest | Required for web/PWA metadata | `manifest.webmanifest` | Found |
| App icon source | Store asset source candidate | `assets/app-icon.svg`; Android launcher resources generated | Found |

## Remaining Blockers

| Item | Expected | Found | Launch Impact |
| --- | --- | --- | --- |
| Signing plan | Play App Signing or release signing configuration | Build succeeded, but signing mode/certificate plan not verified | Must confirm before production upload/release |
| Google Drive source workspace | `Deen o Dunya` Drive workspace | Not found via connected Drive search/root listing | Blocks Drive-vs-repo reconciliation |
| Store screenshots | Phone screenshots and optional tablet screenshots | Not found | Blocks store listing completion |
| Feature graphic | 1024 x 500 Play feature graphic | Not found | Needed for a polished Play listing and may be required for some placements |
| Public privacy-policy URL | Public HTTPS URL | Not finalized | Required for Play Console |
| Release testing | Install/test release candidate | AAB built, but device/internal testing not yet confirmed | Upload first to internal testing before production |

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

## Next Manual Step

Upload the AAB to Play Console internal testing first:

`C:\Users\mjawa\deen-o-dunya\android\app\build\outputs\bundle\release\app-release.aab`

Before production submission, confirm the Play App Signing/signing certificate setup, publish a public HTTPS privacy-policy URL, and prepare screenshots plus the 1024 x 500 feature graphic.

## Release Readiness Decision

Do not submit to production yet. The Android AAB is ready for internal testing upload, but production submission still needs signing confirmation, a public privacy-policy URL, store screenshots, the feature graphic, and final Play Console App content/Data safety answers.
