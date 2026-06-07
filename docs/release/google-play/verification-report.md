# Google Play Verification Report

Generated: 2026-06-07
Updated: 2026-06-07
App: Deen o Dunya Planner
Target package ID: `com.deenodunya.planner`
Repository: `mjawaidca-prog/deen-o-dunya`

## Status

Not submission-ready, but materially advanced.

The native Android project is now committed to GitHub and the developer machine successfully built a release AAB. Core Android identity and SDK metadata are verified. One release-cleanup blocker remains: native Android `versionName` is `1.0`, while `package.json` is `1.0.0`.

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
- Generated Android project was pushed to GitHub at `main` commit `f831e07`.

## Verified Matches

| Item | Expected | Found | Status |
| --- | --- | --- | --- |
| App name | Deen o Dunya Planner | `capacitor.config.json`; Android `strings.xml` app_name/title_activity_main | Match |
| Android package ID | `com.deenodunya.planner` | `android/app/build.gradle` namespace and applicationId; Android `strings.xml` package_name/custom_url_scheme | Match |
| Web/mobile bundle directory | `dist` | `capacitor.config.json` webDir: `dist`; `scripts/prepare-mobile-build.js` writes to `dist/` | Match |
| Repo package version | `1.0.0` | `package.json` version: `1.0.0` | Found |
| Android version code | First release build code | `android/app/build.gradle` versionCode `1` | OK for initial release unless Play Console already has a prior build |
| Android target SDK | API 35+ | `android/variables.gradle` targetSdkVersion `36`; compileSdkVersion `36` | Match |
| Android min SDK | Project-defined | `android/variables.gradle` minSdkVersion `24` | Found |
| Android manifest permissions | Verify declared permissions | `android.permission.INTERNET` only | Found; aligns with web/content-fetch behavior |
| Privacy policy in app | Required for Play listing and in-app access | `privacy.html`; `index.html` links `./privacy.html` | Found |
| PWA manifest | Required for web/PWA metadata | `manifest.webmanifest` | Found |
| App icon source | Store asset source candidate | `assets/app-icon.svg`; Android launcher resources generated | Found |

## Mismatches And Blockers

| Item | Expected | Found | Launch Impact |
| --- | --- | --- | --- |
| Android version name | Align with `package.json` `1.0.0` unless intentionally different | `android/app/build.gradle` versionName `1.0` | Fix recommended before Play upload for consistency |
| Android upload bundle | `.aab` build artifact path/name | Built locally, exact path/name not yet reported | Need exact file path for manual upload handoff |
| Signing plan | Play App Signing or release signing configuration | No signing docs found; build succeeded but signing mode not verified | Must confirm Play App Signing/signing certificate plan before production |
| Google Drive source workspace | `Deen o Dunya` Drive workspace | Not found via connected Drive search/root listing | Blocks Drive-vs-repo reconciliation |
| Store screenshots | Phone screenshots and optional tablet screenshots | Not found | Blocks store listing completion |
| Feature graphic | 1024 x 500 Play feature graphic | Not found | Likely blocks polished listing; may be required for some placements |
| Public privacy-policy URL | Public HTTPS URL | Not finalized | Required for Play Console |

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

Fix Android versionName to match `package.json`:

```powershell
cd C:\Users\mjawa\deen-o-dunya
(Get-Content android\app\build.gradle) -replace 'versionName "1.0"', 'versionName "1.0.0"' | Set-Content android\app\build.gradle
cd android
.\gradlew.bat bundleRelease
```

Locate the rebuilt AAB:

```powershell
Get-ChildItem -Recurse app\build\outputs\bundle\release
```

Then commit/push the versionName fix:

```powershell
cd C:\Users\mjawa\deen-o-dunya
git status
git add android\app\build.gradle
git commit -m "Align Android version name with package version"
git push
```

## Release Readiness Decision

Do not submit yet. First align Android versionName, rebuild the AAB, confirm the AAB path, finalize the public privacy-policy URL, confirm signing/Play App Signing, and prepare store screenshots/feature graphic.
