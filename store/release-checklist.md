# Store Release Checklist

## Before Packaging

- Host the app over HTTPS, such as GitHub Pages, and confirm `index.html`, `sw.js`, `privacy.html`, `manifest.webmanifest`, and `assets/app-icon.svg` are uploaded.
- Open the hosted URL on phone and desktop, then verify Today, Qur'an, Qibla, Azkar, More, and Settings.
- Confirm prayer times are calculated correctly for the user's location and manual times still work.
- Confirm qibla permission prompts work on iPhone Safari and Android Chrome.
- Confirm adhan playback works after one user tap, because browsers and mobile webviews block autoplay until user interaction.
- Replace placeholder developer contact text in `privacy.html` with the real support email or website.
- Generate production PNG app icons from `assets/app-icon.svg` for iOS and Android.
- Run `npm run prepare:mobile` before syncing Capacitor so the native app uses the clean `dist/` bundle.

## Google Play

- Use Android Studio after `npm install`, `npx cap add android`, and `npm run cap:sync`.
- Build an Android App Bundle (`.aab`), not only an APK.
- Target Android 15 / API 35 or newer for new apps and updates.
- Complete Play Console Data Safety using `store/google-play-data-safety.md`.
- Add privacy policy URL, screenshots, app category, content rating, and release notes.

## App Store

- Use a Mac with Xcode after `npm install`, `npx cap add ios`, and `npm run cap:sync`.
- Set Bundle ID to `com.deenodunya.planner`.
- Add location and motion/orientation permission purpose strings in Xcode if native plugins are added.
- Complete App Store Connect privacy details using `store/app-store-privacy-notes.md`.
- Include review notes from `store/app-store-review-notes.md`.
- Test on real iPhone before submission.

## Important Review Risk

Apple may reject a simple web wrapper under Guideline 4.2 if it feels like only a repackaged website. Deen o Dunya has stronger app-like features already: offline tafsir, qibla orientation, prayer audio, local planner state, and a mobile-first UI. Keep emphasizing those in the App Review notes.
