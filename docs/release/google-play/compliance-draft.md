# Google Play Compliance Draft

Generated: 2026-06-07
App: Deen o Dunya Planner

This draft is grounded in repo files and the privacy policy. Do not paste final answers into Play Console until the Android native project, permissions, SDKs, and release build are verified.

## App Content: Privacy Policy

Status: required and currently available in repo source.

- In-app privacy policy: `privacy.html`
- Public Play Console privacy policy URL: not finalized
- Action required: host `privacy.html` publicly without changing policy wording, then paste the public URL into Play Console.

## App Access

Draft answer: No special app access instructions required.

Confidence: requires confirmation.

Reason: No account/login system was verified in the inspected package. Native Android project and final app flow still need testing.

## Ads

Draft answer: App does not contain ads.

Confidence: requires confirmation.

Reason: No ad SDK was found in inspected `package.json`, but native Android project and generated dependencies are missing, so this cannot be final.

## Content Rating

Likely category: Lifestyle / utility app with religious/spiritual content.

Requires Play Console questionnaire completion. Answer based on final UI content. Do not classify as children's content unless the app is intentionally designed for children and all related requirements are satisfied.

Items to confirm:

- Whether the app contains user-generated content: not verified, likely no.
- Whether the app contains social features/chat: not verified, likely no.
- Whether the app contains violence, gambling, sexual content, or controlled substances: not verified, likely no.
- Whether religious content is informational/devotional only: requires final UI review.

## Target Audience And Content

Draft answer: General audience, not specifically directed to children.

Confidence: requires confirmation.

Reason: Repo metadata and privacy policy describe a personal planner/prayer/Qur'an app, not a child-directed app. Final target-age selection must be confirmed by the developer.

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

Based on the privacy policy, the app may access or use:

- Approximate location: used to calculate prayer times and qibla direction.
- Device orientation data: used for qibla compass functionality.
- App preferences and downloaded reading data: stored locally on the device.
- Standard network/request metadata may be received by third-party content services when content is fetched.

Do not mark final Data safety fields until the Android permissions and network behavior are verified.

### Suggested Play Data Types To Review

Review these categories in Play Console:

- Location: approximate location. Purpose: app functionality. Collection/sharing status must be confirmed based on whether the app transmits location off-device or only uses it locally.
- App activity or app info/performance: only if analytics, diagnostics, or logging SDKs are present. Not verified.
- Device or other IDs: only if SDKs collect identifiers. Not verified.
- Files and docs, audio, contacts, calendar, photos/videos: not verified and should be answered No unless native permissions or app behavior prove otherwise.

### Data Sharing

Privacy policy states: The app does not sell personal or sensitive user data. If third-party content services are used, data handling by those services is governed by their own policies.

Play Console sharing answers require confirmation after verifying actual third-party requests and whether user data is transferred off-device.

### Security Practices

Requires confirmation:

- Data encrypted in transit: likely yes for HTTPS third-party services if all requests use HTTPS, but final network URLs must be verified.
- Users can request data deletion: may be not applicable if no server account/user data exists, but local-data deletion guidance should be added if Play asks.
- Users can delete local app data by clearing browser/app storage or uninstalling the app, per privacy policy.

## Permissions Declaration

Cannot complete until Android manifest is generated and reviewed.

Expected areas to review:

- Location permissions, if native Android requests location.
- Internet permission, likely needed for third-party content fetches.
- Notification permission, if prayer reminders use Android notifications.
- Any sensor/orientation-related permissions, if present.

## Release Policy Blockers

- Android native project missing.
- Android permissions not verified.
- Target SDK/API level not verified.
- No release AAB verified.
- No public privacy-policy URL finalized.
- No screenshots/assets verified.
- Drive workspace reconciliation incomplete.
