# Deen o Dunya Planner — Phase 3 Work Order

**Prerequisite:** Phases 0–2 shipped and verified.
**Priority order (per your ranking):** 1) Offline audio · 2) Hadith · 3) Kids mode · 4) Tasbeeh + Qibla. Plus: iOS build (you confirmed ready).
**Modules delivered:** ddp-audio-dl.js, ddp-hadith.js, ddp-kids.js, ddp-tasbeeh-qibla.js

Add all four to index.html script tags, `prepare-mobile-build.js`, and `sw.js` APP_SHELL (bump SW to v18).

---

# PART 1 — OFFLINE AUDIO DOWNLOAD MANAGER (your #1)

## Task P3-1 — Install filesystem plugin
```bash
npm i @capacitor/filesystem
npx cap sync
```
Audio files are large — they go on the device filesystem (Directory.Data), NOT IndexedDB. Only the download *index* lives in IndexedDB. `ddp-audio-dl.js` handles both native (filesystem) and web (IndexedDB blob) paths automatically.

## Task P3-2 — Downloads UI (new screen)
Add a "Downloads" screen (reachable from Qur'an tab and Settings):

1. **Reciter picker** — from `DDP_AUDIO_DL.RECITERS` (Alafasy, Abdul Basit, Husary, Minshawi, Sudais).
2. **Per-surah download rows** — each surah shows: name, size estimate, and a state:
   - Not downloaded → "Download" button
   - Downloading → real progress bar (`onProgress(done,total,pct)` — NO fake timer)
   - Downloaded → "✓ Offline" + delete (trash) button
3. **Storage header** — show `DDP_AUDIO_DL.storageEstimate().freeMB` and total used by downloads. Warn before a download if free space < 100MB.
4. **"Download whole Qur'an (this reciter)"** — optional bulk action; warn it's large (200–800MB depending on reciter) and wifi-recommended.

Wire the download:
```javascript
const surah = await loadSurah(num);              // from Phase 1
const ayahGlobals = surah.ayahs.map(a => a.g);
DDP_AUDIO_DL.downloadSurah(reciterId, num, ayahGlobals, (done, total, pct) => {
  updateProgressBar(num, pct);                    // real progress
});
```

## Task P3-3 — Play from local when available
In the recitation player (Phase 0 `DDP_AUDIO`), before hitting the CDN, check for a local copy:
```javascript
async function ayahSourcesSmart(reciterId, surahNum, ayahN, globalAyah) {
  const local = await DDP_AUDIO_DL.localAyahUri(reciterId, surahNum, ayahN);
  if (local) return [local];                      // instant, offline
  return DDP_AUDIO.ayahSources(globalAyah);        // fall back to streaming
}
```
Update `PlayerBar` to call this. Result: downloaded surahs play instantly with zero buffering — the core fix for low-connectivity users.

**Acceptance:** download Sūrah Yasin (Alafasy) over wifi → enable airplane mode → play it start to finish gaplessly; delete it → space reclaimed (verify in storage header).

---

# PART 2 — HADITH WITH GRADING (your #2)

## Task P3-4 — Verify licensing FIRST (before any code)
`ddp-hadith.js` ships every collection with `cleared:false` on purpose. **The UI shows only `cleared:true` collections.** Do not flip any to true until you confirm:
- **Source & license:** Sunnah.com data (check sunnah.com/developers terms + attribution), OR an openly-licensed dataset (verify per collection). 
- **Translation license:** the English/Urdu translation is separately copyrighted from the Arabic — verify both.
- **Attribution string** required by the source → put it in the About screen.

This is the same discipline as the tafsir issue: authenticity + licensing before shipping. A mis-graded or unlicensed hadith is a trust-ender.

## Task P3-5 — Bind a data source + download packs
Implement `fetchCollectionData(collectionId, onProgress)` bound to your licensed source, returning `[{ book, hadiths:[record] }]` where each record matches the shape documented in `ddp-hadith.js` (arabic, translation, narrator, grade, gradedBy, reference). Then:
```javascript
await DDP_HADITH.downloadCollection("nawawi40", fetchCollectionData, onProgress);
```
Packs store in IndexedDB → hadith works fully offline after one download.

## Task P3-6 — Hadith UI
1. **Collections list** — `DDP_HADITH.clearedCollections()` only. Each shows authenticity badge.
2. **Reading view** — every hadith displays: Arabic, translation (in app language), narrator, and a **grade chip** (`DDP_HADITH.gradeLabel(grade, lang)` — Sahih green, Hasan teal, Da'if amber, Mawdu' red). NEVER show a hadith without its grade + reference.
3. **Hadith of the day** — a dashboard card via `DDP_HADITH.hadithOfTheDay(lang)` (prefers Nawawi 40 — short, foundational). Ties into the daily habit loop.
4. **Search** — within downloaded collections (simple text match to start).

**Start small:** ship **40 Hadith Nawawi + 40 Hadith Qudsi** first (82 hadith total, tiny, foundational, easy to license/verify), then add the six major collections as licensing clears.

---

# PART 3 — KIDS MODE (your #3)

## Task P3-7 — Kids mode toggle + guard
`ddp-kids.js` provides state + curated content. Integration:
1. **Settings → "Kids Mode"** toggle. On enable: forces text scale 1.3, simplifies nav. Optional 4-digit **parent PIN** to exit (so a child can't leave it).
2. **Ad guard:** in `ddp-ads.js` `onScreenChange`, add at the top:
   `if (window.DDP_KIDS && DDP_KIDS.isActive()) { hideBanner(); return; }`
   Ads OFF in kids mode always — required by Play/AdMob families policy and our design ethic.
3. **Simplified dashboard** when `DDP_KIDS.isActive()`:
   - Big next-prayer card, big star ring (`DDP_KIDS.kidsRingModel(day)` — 7 gentle stars, no score/number).
   - Three huge buttons: **Learn a Surah**, **Learn a Du'a**, **My Prayers**.
4. **Content** restricted to `DDP_KIDS.KIDS_SURAHS` (short mufassal) and `DDP_KIDS.KIDS_DUAS` (daily duas). Verify dua translations before shipping.
5. **Reward:** completing the day's stars shows a warm animation + "Well done! 🌟 اَلْحَمْدُ لِلّٰه" — never points/leaderboards.

**Acceptance:** enable kids mode → text is large, nav simplified, no ads, only short surahs/duas shown, PIN required to exit.

---

# PART 4 — TASBEEH + QIBLA (your #4)

## Task P3-8 — Tasbeeh counter
`ddp-tasbeeh-qibla.js` → `DDP_TASBEEH`. New screen:
1. Large circular tap target (whole area tappable). Each tap → `DDP_TASBEEH.increment(dhikrId)` → returns `{count, lifetime, target, hitTarget}`.
2. Haptic per tap (light), stronger buzz at each target multiple (handled inside — Capacitor Haptics or `navigator.vibrate` fallback).
3. Dhikr selector from `DDP_TASBEEH.DHIKRS` (SubhanAllah/Alhamdulillah/Allahu Akbar/Tahlil/Istighfar/Salawat).
4. Show current count, target (e.g. 33), and lifetime total. Reset button for current (lifetime persists).
5. Install haptics: `npm i @capacitor/haptics && npx cap sync`.

## Task P3-9 — Qibla compass
`DDP_QIBLA`. New screen:
1. On open: `DDP_QIBLA.start(lat, lon, (heading, qiblaAngle, hasCompass) => {...})`.
   - iOS: this triggers the DeviceOrientation permission prompt (handled inside).
2. If `hasCompass`: rotate the Kaaba needle by `qiblaAngle` as the user turns. Show a satisfying "aligned" state (haptic + colour change) when `qiblaAngle` is within ±5°.
3. If `!hasCompass` (many cheap phones lack a magnetometer): show a **static fallback** — "Qibla is at 258° from North" + `DDP_QIBLA.distanceToMakkah(lat,lon)` km. Still useful without a sensor.
4. `DDP_QIBLA.stop()` on screen leave (removes the orientation listener — battery).

**Note on "AR compass":** true camera-AR qibla is heavy and battery-hungry on low-end phones — I recommend the sensor compass above (works everywhere, light) over camera AR. If you still want camera AR later, it's a Phase 4 add-on, not core.

**Acceptance:** Qibla screen points correctly (verify against a known qibla direction for your city); on a phone without magnetometer, shows the static bearing + distance.

---

# PART 5 — iOS BUILD (you confirmed ready)

## Task P3-10 — Add the iOS platform
```bash
npm i @capacitor/ios
npx cap add ios
npm run prepare:mobile        # ensure dist/ is built with all assets
npx cap sync ios
npx cap open ios              # opens Xcode
```

## Task P3-11 — iOS configuration
In Xcode (`ios/App/App/`):
1. **Signing:** select your Apple Developer team; set a unique bundle id (e.g. `com.deenodunya.planner` — must match/register on App Store Connect).
2. **Info.plist permission strings** (iOS requires human-readable reasons or it rejects):
   - `NSLocationWhenInUseUsageDescription` — "Used to calculate accurate prayer times and Qibla direction for your location."
   - `NSMotionUsageDescription` — "Used for the Qibla compass." (DeviceOrientation)
   - For notifications: request via `@capacitor/local-notifications` (already installed) — iOS shows its own prompt.
3. **Background audio (optional but recommended for recitation):** enable Background Modes → Audio in Signing & Capabilities, so recitation continues when the screen locks. In your audio setup, set the AVAudioSession category to playback (Capacitor community audio plugins expose this; or a tiny native shim).
4. **Adhan notification sound:** iOS notification sounds must be bundled in the app bundle (`.caf`/`.aiff`/`.wav`, ≤30s). Convert your adhan clips to a short `.caf` and reference by filename in the notification `sound` field. (Long full-adhan playback while backgrounded is restricted on iOS — a short adhan tone for the notification + full adhan when the app is open is the compliant pattern.)
5. **AdMob iOS:** add your iOS AdMob app id to `Info.plist` as `GADApplicationIdentifier`; add `SKAdNetworkItems` per Google's iOS setup. Create iOS ad units (separate from Android) and add them to `ddp-ads.js` UNITS (branch by platform).
6. **App Tracking Transparency:** if ads are personalized, add `NSUserTrackingUsageDescription` and call the ATT prompt. If you keep ads non-personalized (recommended for this audience), you can avoid ATT — simpler and more privacy-respecting.

## Task P3-12 — iOS testing & submission
1. Test on a real device (WebView differs from Android; check RTL Urdu/Arabic rendering, audio, notifications, qibla sensor).
2. Archive → upload to App Store Connect → TestFlight for testers (mirrors your Play testing track).
3. App Review notes: mention it's an Islamic prayer/Qur'an app; declare data use (location used locally, not collected/sold — a genuine advantage you can state plainly). Prepare screenshots in EN/UR/AR.

**iOS gotchas specific to this app:**
- IndexedDB in iOS WKWebView has had eviction quirks under storage pressure — your Phase 1 bundle load should handle a missing-bundle re-fetch gracefully (it does). 
- `file://` audio playback needs `Capacitor.convertFileSrc` (already used in `ddp-audio-dl.js`).
- Self-hosted fonts must be in the bundle (Phase 0) — Google Fonts hotlinking is worse on iOS offline.

---

# BUILD + TEST (Phase 3 full)
```bash
npm i @capacitor/filesystem @capacitor/haptics @capacitor/ios
node scripts/build-quran-bundle.js
npm run prepare:mobile && npx cap sync
# Android: versionCode 5, versionName "1.4.0"
```

**Acceptance checklist:**
- [ ] Download a sūrah's audio → plays fully offline, gaplessly; delete reclaims space; real progress throughout
- [ ] Local audio preferred over streaming when present
- [ ] Hadith: only cleared/licensed collections visible; every hadith shows grade + reference; hadith-of-the-day on dashboard
- [ ] Kids mode: large text, simplified nav, no ads, curated content only, PIN to exit
- [ ] Tasbeeh: taps count with haptics, target buzz, lifetime totals persist
- [ ] Qibla: correct direction with compass; static bearing fallback on no-magnetometer phones
- [ ] iOS: builds, signs, runs on device; RTL correct; notifications + location + qibla work; TestFlight build uploaded
- [ ] Android versionCode 5 to Play internal testing

---

# Phase 4 preview (when you're ready)
- Tafsir Path A packs as your permissions clear (you're handling permissions)
- Full-text Qur'an + hadith search (offline index)
- Duas & Adhkar expansion (Hisnul Muslim full, categorized) — verify translation license
- Ramadan mode (suhoor/iftar times, taraweeh tracker, fasting log)
- Community/mosque finder (needs a data source decision)
- Apple Watch / Wear OS prayer complications
- Native-performance migration assessment (if WebView limits bite as features grow — revisit Flutter question from the original review)
- Native-speaker QA passes for Arabic and Urdu UI before a public (non-testing) launch
