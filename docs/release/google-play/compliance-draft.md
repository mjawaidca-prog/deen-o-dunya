# Google Play Compliance Draft

Generated: 2026-06-07
Updated: 2026-06-07
App: Deen o Dunya Planner

This draft is grounded in repo files and the privacy policy. Do not paste final answers into Play Console until the Android native project, permissions, SDKs, and release build are verified after the AdMob integration.

## App Content: Privacy Policy

Status: required and currently available in repo source.

- In-app privacy policy: `privacy.html`
- Public Play Console privacy policy URL: not finalized
- Action required: host `privacy.html` publicly without changing policy wording, then paste the public URL into Play Console.
- Action required after AdMob: confirm whether the current privacy policy wording fully covers ad SDK behavior, advertising ID, consent handling, and any data collected/shared by Google Mobile Ads.

## App Access

Draft answer: No special app access instructions required.

Confidence: requires confirmation.

Reason: No account/login system was verified in the inspected package. Final app flow still needs testing.

## Ads

Draft answer: App contains ads.

Confidence: high after AdMob integration.

Reason: `package.json` now includes `@capacitor-community/admob`; AndroidManifest.xml includes the Google Mobile Ads application ID metadata; `mobile-admob.js` initializes AdMob and requests a bottom banner ad using the provided banner ad unit ID.

Play Console answer for "Does your app contain ads?": Yes.

## Advertising ID

Draft answer: App uses advertising ID.

Confidence: high after AdMob integration.

Reason: The app now integrates Google Mobile Ads / AdMob and declares `com.google.android.gms.permission.AD_ID` in AndroidManifest.xml.

Likely declared purpose: Advertising or marketing.

## Content Rating

Likely category: Lifestyle / utility app with religious/spiritual content.

Requires Play Console questionnaire completion. Answer based on final UI content. Do not classify as children's content unless the app is intentionally designed for children and all related requirements are satisfied.

Items to confirm:

- Whether the app contains user-generated content: not verified, likely no.
- Whether the app contains social features/chat: not verified, likely no.
- Whether the app contains violence, gambling, sexual content, or controlled substances: not verified, likely no.
- Whether religious content is informational/devotional only: requires final UI review.
- Whether ads shown by AdMob are appropriate for the selected target audience and content rating.

## Target Audience And Content

Draft answer: General audience, not specifically directed to children.

Confidence: requires confirmation.

Reason: Repo metadata and privacy policy describe a personal planner/prayer/Qur'an app, not a child-directed app. Final target-age selection must be confirmed by the developer. AdMob configuration must be aligned with the selected target audience.

## News Apps

Draft answer: Not a news app.

Confidence: medium.

Reason: App metadata describes planner, prayer, Qur'an, azkar, qibla, and personal balance features.

## COVID-19 / Health

Draft answer: Not a COVID-19 or health app.

Confidence: medium.

Reason: No health functionality was identified in app metadata or privacy policy. Final UI still needs review.

## Financial Features

Draft answer: No financial features.

Confidence: medium.

Reason: No payments, banking, investment, credit, lending, or crypto functionality was identified in inspected files.

## Data Safety Draft

Important: Google Play's Data safety form must match actual app behavior, SDKs, Android permissions, privacy policy, and third-party services.

### Data Collection

Based on the privacy policy and AdMob integration, the app may access or use:

- Approximate location: used to calculate prayer times and qibla direction.
- Device orientation data: used for qibla compass functionality.
- App preferences and downloaded reading data: stored locally on the device.
- Advertising ID: used by Google Mobile Ads / AdMob for ads.
- Standard network/request metadata may be received by third-party content services and Google Mobile Ads when content or ads are fetched.

Do not mark final Data safety fields until the Android permissions, merged manifest, SDK behavior, and network behavior are verified.

### Suggested Play Data Types To Review

Review these categories in Play Console:

- Location: approximate location. Purpose: app functionality. Collection/sharing status must be confirmed based on whether the app transmits location off-device or only uses it locally.
- Device or other IDs: advertising ID. Purpose: advertising or marketing.
- App activity or app info/performance: review Google Mobile Ads / AdMob disclosures and any diagnostics behavior.
- Files and docs, audio, contacts, calendar, photos/videos: not verified and should be answered No unless native permissions or app behavior prove otherwise.

### Data Sharing

Privacy policy states: The app does not sell personal or sensitive user data. If third-party content services are used, data handling by those services is governed by their own policies.

After AdMob integration, Play Console sharing answers must account for Google Mobile Ads / AdMob behavior and Google's data handling, not only the app's first-party code.

### Security Practices

Requires confirmation:

- Data encrypted in transit: likely yes for HTTPS third-party services and Google Mobile Ads requests, but final network URLs/SDK behavior must be verified.
- Users can request data deletion: may be not applicable if no server account/user data exists, but local-data deletion guidance should be added if Play asks.
- Users can delete local app data by clearing browser/app storage or uninstalling the app, per privacy policy.

## Permissions Declaration

Current AndroidManifest.xml declares:

- `android.permission.INTERNET`
- `com.google.android.gms.permission.AD_ID`

Expected additional verification:

- Run `npx cap sync` after installing AdMob.
- Rebuild the AAB.
- Inspect the merged release manifest to confirm final permissions and SDK metadata.

## Release Policy Blockers

- Re-run `npm install`, `npm run cap:sync`, and `./gradlew.bat bundleRelease` after pulling the AdMob changes.
- Verify the rebuilt AAB and merged manifest after AdMob integration.
- Confirm AdMob consent/message setup for applicable regions.
- Confirm Play App Signing/signing setup.
- Finalize public privacy-policy URL.
- Prepare screenshots/assets.
- Complete Play Console Data safety and App content forms with ads enabled.
- Drive workspace reconciliation incomplete.
