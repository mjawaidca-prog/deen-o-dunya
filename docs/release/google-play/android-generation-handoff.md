# Android Generation Handoff

Generated: 2026-06-07
Updated: 2026-06-07
App: Deen o Dunya Planner
Package ID: `com.deenodunya.planner`

## Current Result

Android platform generation succeeded on the developer machine.

Confirmed from PowerShell output:

- `git clone` succeeded.
- `npm install` succeeded with 0 vulnerabilities.
- `npm run check` passed all store-readiness checks.
- `npm run cap:add:android` created the native `android/` project.
- `npm run cap:sync` copied web assets and synced Android.

Current blocker:

- `./gradlew bundleRelease` failed because `JAVA_HOME` is not set and no `java` command was found in `PATH`.

This means the next launch step is Java/JDK setup, then a release AAB build.

## Required Java/JDK Setup On Windows

Install a JDK compatible with the Android Gradle Plugin. Android Studio includes a bundled JDK, or install a current LTS JDK such as Temurin 17 or 21.

Recommended quick path if Android Studio is installed:

1. Locate Android Studio's bundled JDK, often one of:

```text
C:\Program Files\Android\Android Studio\jbr
C:\Program Files\Android\Android Studio\jre
```

2. Set `JAVA_HOME` in PowerShell for the current session:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
```

If that path does not exist, install a JDK and set `JAVA_HOME` to its install folder, for example:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
```

## Build Release AAB

After Java works:

```powershell
cd C:\Users\mjawa\deen-o-dunya\android
.\gradlew.bat bundleRelease
```

Expected output is usually under:

```text
android\app\build\outputs\bundle\release\
```

## Verify Android Release Metadata

After the Android project exists, run from the repository root:

```powershell
cd C:\Users\mjawa\deen-o-dunya
Select-String -Path android\**\*.gradle* -Pattern "applicationId|namespace|versionCode|versionName|minSdk|targetSdk|compileSdk"
Select-String -Path android\app\src\main\AndroidManifest.xml -Pattern "uses-permission|ACCESS_|CAMERA|RECORD_AUDIO|INTERNET|POST_NOTIFICATIONS"
```

Expected identity values:

- App name: `Deen o Dunya Planner`
- Application ID / package ID: `com.deenodunya.planner`
- Version name: align with `package.json` version `1.0.0`, unless intentionally changed.
- First version code: usually `1`, unless Play Console already has a prior uploaded build.
- Target SDK: Android 15 / API 35 or higher for current Google Play submission.

## Verification Needed After Build

- Confirm the AAB package ID is `com.deenodunya.planner`.
- Confirm versionCode and versionName.
- Confirm targetSdk is API 35+.
- Confirm permissions match the privacy policy and Data Safety draft.
- Install/test through internal testing before production.

## Commit Guidance

If this repository is the release source of truth, commit the generated `android/` project and any version/signing documentation after verifying the generated files. Do not commit keystore private files or secrets.
