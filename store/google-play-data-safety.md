# Google Play Data Safety Notes

Use these notes when filling Google Play Console Data Safety.

Updated: 2026-07-14

## Important Release Blocker: Ads / Advertising ID

The current Android evidence includes:

- `@capacitor-community/admob` in `package.json`.
- `com.google.android.gms.permission.AD_ID` in `android/app/src/main/AndroidManifest.xml`.
- AdMob application ID metadata in `android/app/src/main/AndroidManifest.xml`.

Do not answer `No ads` or `no advertising ID` in Play Console while this remains in the production build. Before release, choose one path:

1. Keep ads: replace any test/sample AdMob app ID with the production AdMob app ID, verify ad placement, and disclose ads / device IDs according to Play Console requirements.
2. No ads: remove/disable the AdMob SDK path, ad metadata, and Advertising ID permission, then rebuild and re-check the merged manifest.

## Data Collected / Used

The app itself stores preferences, downloaded tafsir, reading state, and planner data locally on the user's device. It does not sell this data.

## Location

Location may be requested for prayer times and qibla direction. Disclose this as app functionality. Confirm in the final Data safety flow whether Play Console asks for approximate, precise, or both based on the final permission/runtime behavior.

## Device Or Other IDs

Requires final confirmation based on the Ads decision. If AdMob/AD_ID remains in the production build, disclose device or other IDs according to the SDK behavior and Google Play requirements.

## Third-Party Network Requests

The app may request Qur'an text, tafsir, hadith, audio, and fonts from third-party services. Those services may receive normal network metadata such as IP address and request metadata.

## Security Practices

- The app and privacy policy should be served over HTTPS.
- User settings and offline data remain on-device unless future account/sync functionality is added.
- No login is currently verified as required for core functionality.

## Play Console Notes

Use this hosted privacy policy URL after confirming it opens and matches the canonical repo policy:

`https://mjawaidca-prog.github.io/deen-o-dunya/privacy.html`
