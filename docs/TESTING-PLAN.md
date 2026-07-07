# Deen o Dunya Planner — Pre-Release Testing Plan

**Version:** 1.5.1 · **versionCode:** 7  
**Target platforms:** Android (primary), iOS (secondary)  
**Last updated:** 2026-07-04

---

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Phase 0 — Core Infrastructure Tests](#phase-0--core-infrastructure-tests)
3. [Phase 0b — Background Audio Tests](#phase-0b--background-audio-tests)
4. [Phase 1 — Content & Habits Tests](#phase-1--content--habits-tests)
5. [Phase 2 — Performance & Ads Tests](#phase-2--performance--ads-tests)
6. [Phase 3 — Kids, Hadith, Audio DL, Qibla Tests](#phase-3--kids-hadith-audio-dl-qibla-tests)
7. [Phase 4 — Ramadan & Search Tests](#phase-4--ramadan--search-tests)
8. [Cross-Cutting Tests](#cross-cutting-tests)
9. [Device Matrix](#device-matrix)
10. [Pre-Release Checklist](#pre-release-checklist)
11. [Release Sequence](#release-sequence)

---

## Before You Start

### Required tools
- **1 real budget Android phone** (~$80, 2GB RAM) — the single most important testing investment
- 1 mid-range Android phone (4GB+ RAM) if available
- 1 iOS device (iPhone 8 or newer) for iOS testing
- Android Studio (for emulator fallback + AAB signing)
- Xcode + Apple Developer account (for iOS build + TestFlight)

### Before each test cycle
```bash
# 1. Clear app data on the test device (Settings → Apps → Deen o Dunya → Clear Data)
# 2. Fresh install from the signed build
# 3. Run ALL verification scripts:
node scripts/verify-phase-0.js && node scripts/verify-phase-0b.js && node scripts/verify-phase-1.js && node scripts/verify-phase-2.js && node scripts/verify-phase-3.js && node scripts/verify-phase-4.js
```

### Test result markers
- ✅ PASS — works as described
- ⚠️ ISSUE — works but has a minor problem (describe)
- ❌ FAIL — doesn't work (describe + file GitHub issue)
- ⏭️ SKIP — not applicable to this device/platform

---

## Phase 0 — Core Infrastructure Tests

### T0-1: Repo Hygiene
- [ ] **T0-1.1** — Fresh install, app launches without errors
- [ ] **T0-1.2** — No stray `.js` files at root (all archived in `archive/`)
- [ ] **T0-1.3** — `sw.js` registers successfully (check DevTools → Application → Service Workers)

### T0-2: Audio Manager (DDP_AUDIO)
- [ ] **T0-2.1** — Play Sūrah Al-Fatihah recitation → audio plays within 3 seconds on 4G
- [ ] **T0-2.2** — Play recitation on throttled "Slow 3G" (DevTools) → first ayah plays at 64kbps
- [ ] **T0-2.3** — Sequential ayahs play gaplessly (preload working)
- [ ] **T0-2.4** — Play recitation → receive a phone call → end call → app shows paused state at the SAME ayah
- [ ] **T0-2.5** — Play recitation → pause → resume → continues from same position
- [ ] **T0-2.6** — Swipe between ayahs while playing → audio transitions to new ayah

### T0-3: Adhan
- [ ] **T0-3.1** — Open app → tap adhan preview button → adhan plays audibly (Makkah style)
- [ ] **T0-3.2** — Switch adhan style to Madinah → preview plays Madinah adhan
- [ ] **T0-3.3** — Adhan files are local (airplane mode ON → adhan preview still works)
- [ ] **T0-3.4** — No islamcan.com hotlinking (grep index.html for "islamcan.com" → zero results)

### T0-4: Session Persistence
- [ ] **T0-4.1** — Open Sūrah Al-Baqarah → scroll to ayah 50 → kill the app from recents → relaunch → returns to same surah
- [ ] **T0-4.2** — Play recitation on ayah 10 → kill app mid-playback → relaunch → returns to same ayah position
- [ ] **T0-4.3** — Switch tabs (Today → Qur'an → Azkar → Today) → returns to correct scroll position

### T0-5: Text Size & Zoom
- [ ] **T0-5.1** — Pinch-zoom works on the Qur'an reading screen
- [ ] **T0-5.2** — Settings → Text Size → Large → Arabic/Urdu reading text visibly larger
- [ ] **T0-5.3** — Settings → Text Size → Extra Large → layout not broken, text still readable
- [ ] **T0-5.4** — `user-scalable=no` and `maximum-scale=1.0` are NOT in the viewport meta tag

### T0-6: City Picker & Prayer Times
- [ ] **T0-6.1** — Fresh install, GPS denied → city picker appears in onboarding → pick Lahore → prayer times correct for Lahore
- [ ] **T0-6.2** — Settings → location shows picked city, not "Calgary, AB (default)"
- [ ] **T0-6.3** — Settings → Calculation Method → change to "Karachi" → times update immediately
- [ ] **T0-6.4** — Karachi is the default city (verify in `ddp-cities.js`)
- [ ] **T0-6.5** — Prayer times are correct against a known source (e.g., IslamicFinder for your city)

### T0-7: Download UI (Qur'an surahs)
- [ ] **T0-7.1** — Open an un-downloaded surah → tap Download → real progress shown (no fake timer)
- [ ] **T0-7.2** — Download progress moves through real stages (not fake setInterval)
- [ ] **T0-7.3** — Fill device storage near quota → download a surah → "Storage full" message shown (not silent failure)

### T0-8: Offline
- [ ] **T0-8.1** — Fresh install, airplane mode ON from first launch → app opens, dashboard renders
- [ ] **T0-8.2** — Previously downloaded surahs open offline (airplane mode)
- [ ] **T0-8.3** — Previously played ayahs replay offline
- [ ] **T0-8.4** — Urdu/Arabic fonts show correctly after one prior online launch (fonts cached by SW)

---

## Phase 0b — Background Audio Tests

**⚠️ This is the #1 user complaint fix. Test on a REAL device, not emulator.**

### T0b-1: Screen-Off Playback
- [ ] **T0b-1.1** — Start Sūrah recitation → **lock the screen** → recitation CONTINUES playing
- [ ] **T0b-1.2** — Recitation playing with screen off for 2+ minutes → still playing
- [ ] **T0b-1.3** — Press home button (app to background) → recitation continues

### T0b-2: Lock-Screen Controls
- [ ] **T0b-2.1** — While recitation plays → lock screen shows now-playing info (surah + ayah + reciter name)
- [ ] **T0b-2.2** — Lock-screen play/pause button works
- [ ] **T0b-2.3** — Lock-screen next track → advances to next ayah (if wired)
- [ ] **T0b-2.4** — Lock-screen previous track → goes to previous ayah (if wired)

### T0b-3: Notification Shade
- [ ] **T0b-3.1** — Recitation playing → notification shade shows playback controls
- [ ] **T0b-3.2** — Stop recitation → notification clears (no lingering foreground service)

### T0b-4: Battery Optimization (OEM-specific)
- [ ] **T0b-4.1** — On Xiaomi/Redmi device (if available): check if battery optimization kills audio
- [ ] **T0b-4.2** — On Oppo/Vivo device (if available): same check
- [ ] **T0b-4.3** — If audio stops on any OEM: the battery-settings tip message should appear

---

## Phase 1 — Content & Habits Tests

### T1-1: Offline Qur'an (IndexedDB Bundle)
- [ ] **T1-1.1** — Fresh install → first launch shows "Setting up offline Qur'an" → completes in <30s
- [ ] **T1-1.2** — After bundle load → open any surah → loads instantly (no network fetch)
- [ ] **T1-1.3** — Airplane mode ON → open all 114 surahs → all show Arabic + English + Urdu
- [ ] **T1-1.4** — Downloaded surah → delete/reinstall app → bundle loads again from scratch

### T1-2: Onboarding
- [ ] **T1-2.1** — Fresh install → onboarding appears (3 screens: Language → City → Ready)
- [ ] **T1-2.2** — Screen 1: Pick Urdu → UI switches to Urdu + RTL
- [ ] **T1-2.3** — Screen 1: Pick Arabic → UI switches to Arabic + RTL
- [ ] **T1-2.4** — Screen 2: Search "Lahore" → finds Lahore, Pakistan → pick → proceeds
- [ ] **T1-2.5** — Screen 2: "Use GPS instead" → location prompt appears → works
- [ ] **T1-2.6** — Screen 3: Shows picked city + method + sample fajr time → "Start using the app"
- [ ] **T1-2.7** — Skip onboarding (kill app before completion) → onboarding shows again on relaunch
- [ ] **T1-2.8** — Complete onboarding → onboarding never shows again (check `ddp_onboard_v1` in localStorage)

### T1-3: Daily Habit Ring
- [ ] **T1-3.1** — Dashboard shows DailyRing (8-segment SVG)
- [ ] **T1-3.2** — Mark a prayer as prayed in SalahLog → ring segment fills
- [ ] **T1-3.3** — Read Qur'an → Qur'an segment fills
- [ ] **T1-3.4** — Complete morning adhkar → morning segment fills
- [ ] **T1-3.5** — Complete all 8 segments → ring shows "Complete! اَلْحَمْدُ لِلّٰه"
- [ ] **T1-3.6** — Streak counter shows correct number after 2+ consecutive completed days
- [ ] **T1-3.7** — Mercy day: miss one day in a 7-day streak → streak unbroken

### T1-4: Salah Log
- [ ] **T1-4.1** — Tap prayer chip → cycles: none → ontime → late → missed → excused → none
- [ ] **T1-4.2** — Each state shows correct color + glyph (green ✓, amber !, red ×, blue ~)
- [ ] **T1-4.3** — Log persists across app restarts (same date)
- [ ] **T1-4.4** — Next day: log is fresh (new localStorage key)

### T1-5: Qur'an Log + Khatm Plan
- [ ] **T1-5.1** — Tap session chip in Qur'an Log → verse count increments
- [ ] **T1-5.2** — Juz progress bar updates
- [ ] **T1-5.3** — First open Qur'an tab → khatm prompt appears ("How would you like to finish?")
- [ ] **T1-5.4** — Pick "30 days" → today's portion card appears with correct surah/ayah range
- [ ] **T1-5.5** — "Continue reading" → opens correct surah at correct ayah

### T1-6: Notifications
- [ ] **T1-6.1** — After onboarding → prayer notifications scheduled for 7 days
- [ ] **T1-6.2** — Notification permission prompt appears (first time)
- [ ] **T1-6.3** — Fajr notification fires with adhan sound (set device clock to test)
- [ ] **T1-6.4** — Settings → per-prayer toggle OFF for Dhuhr → Dhuhr notification not scheduled
- [ ] **T1-6.5** — Evening nudge fires when ring ≥50% complete (30 min before Isha)
- [ ] **T1-6.6** — Change location → notifications reschedule with new times

### T1-7: i18n (Trilingual)
- [ ] **T1-7.1** — Settings → Language → اردو → entire UI in Urdu, RTL direction
- [ ] **T1-7.2** — Settings → Language → العربية → entire UI in Arabic, RTL direction
- [ ] **T1-7.3** — Settings → Language → English → back to LTR
- [ ] **T1-7.4** — Bottom nav labels update in selected language
- [ ] **T1-7.5** — RTL: icons + text mirror correctly (flexDirection row-reverse)

### T1-8: Hijri Date
- [ ] **T1-8.1** — Dashboard shows Hijri date (e.g., "24 Shawwal 1447 AH")
- [ ] **T1-8.2** — Settings → Hijri Date Adjustment → +1 → date shifts by one day
- [ ] **T1-8.3** — Hijri date is correct against a known Islamic calendar
- [ ] **T1-8.4** — Islamic occasions appear when within 3 days (e.g., Ramadan countdown)

---

## Phase 2 — Performance & Ads Tests

### T2-1: Performance
- [ ] **T2-1.1** — Open Al-Baqarah (286 ayahs) on budget phone → scrolling is smooth
- [ ] **T2-1.2** — Memory stays stable while scrolling (no continuous growth — DevTools Performance monitor)
- [ ] **T2-1.3** — On a 2GB RAM device: animations and box-shadows are reduced (low tier detected)
- [ ] **T2-1.4** — On a 4GB+ RAM device: animations and shadows render fully (mid/high tier)
- [ ] **T2-1.5** — App cold start <4 seconds on budget phone
- [ ] **T2-1.6** — Surah search input doesn't lag (debounce working, 150ms)

### T2-2: AdMob — Screen Guard (THE critical test)
- [ ] **T2-2.1** — **Banner shows on Dashboard** (allowed screen)
- [ ] **T2-2.2** — **Banner shows on Tasks** (allowed screen)
- [ ] **T2-2.3** — **Banner shows on Settings** (allowed screen)
- [ ] **T2-2.4** — **Banner shows on More** (allowed screen)
- [ ] **T2-2.5** — **NO banner on Qur'an reading screen** (forbidden — worship)
- [ ] **T2-2.6** — **NO banner on Azkar screen** (forbidden — worship)
- [ ] **T2-2.7** — **NO banner on Prayer Times screen** (forbidden — worship)
- [ ] **T2-2.8** — **NO banner on Qibla screen** (forbidden — worship)
- [ ] **T2-2.9** — **NO banner during Onboarding** (forbidden)

### T2-3: AdMob — Audio Guard
- [ ] **T2-3.1** — Dashboard with banner → start recitation → **banner DISAPPEARS**
- [ ] **T2-3.2** — Stop recitation → **banner RETURNS** (if still on allowed screen)
- [ ] **T2-3.3** — Dashboard with banner → adhan preview plays → banner disappears
- [ ] **T2-3.4** — Adhan ends → banner returns

### T2-4: AdMob — Consent & Privacy
- [ ] **T2-4.1** — First launch (EU region or simulated) → consent form appears
- [ ] **T2-4.2** — User declines personalized ads → non-personalized ads served
- [ ] **T2-4.3** — Ads are non-personalized by default (npa:true in request options)

### T2-5: Remove Ads Purchase
- [ ] **T2-5.1** — Settings → "Remove Ads" → tap → purchase flow starts
- [ ] **T2-5.2** — After successful purchase → NO banners anywhere, on any screen
- [ ] **T2-5.3** — Reinstall app → Settings → "Restore Purchase" → ads removed again
- [ ] **T2-5.4** — Settings → "Support the App (Sadaqah)" → opens donation link

### T2-6: Home-Screen Widget
- [ ] **T2-6.1** — Add widget to home screen → widget shows next prayer name + time
- [ ] **T2-6.2** — Widget shows city name
- [ ] **T2-6.3** — Widget shows ring progress (e.g., "5/8")
- [ ] **T2-6.4** — Tap widget → opens the app
- [ ] **T2-6.5** — After using app (prayer times recomputed) → widget updates within 30 minutes

---

## Phase 3 — Kids, Hadith, Audio DL, Qibla Tests

### T3-1: Kids Mode
- [ ] **T3-1.1** — Settings → Kids Mode → set PIN "1234" → Kids Mode ON
- [ ] **T3-1.2** — Kids Mode: text is larger, navigation simplified
- [ ] **T3-1.3** — Kids Mode: **NO ads** on any screen (even allowed screens)
- [ ] **T3-1.4** — Kids Mode: only dashboard, quran, azkar, more accessible
- [ ] **T3-1.5** — Kids Mode: tap Tasks → redirected to dashboard (not accessible)
- [ ] **T3-1.6** — Kids Mode: tap Settings → redirected to dashboard
- [ ] **T3-1.7** — Settings → Kids Mode → enter wrong PIN → "Wrong PIN" → stays in kids mode
- [ ] **T3-1.8** — Settings → Kids Mode → enter correct PIN → kids mode OFF, full app restored

### T3-2: Audio Downloads
- [ ] **T3-2.1** — Downloads screen → shows 5 reciters
- [ ] **T3-2.2** — Download Sūrah Yasin (Alafasy) → real progress shown (not fake timer)
- [ ] **T3-2.3** — Download completes → status shows "✓ Offline"
- [ ] **T3-2.4** — Airplane mode ON → play downloaded surah → plays fully offline, gapless
- [ ] **T3-2.5** — Delete downloaded surah → space reclaimed (verify in storage header)
- [ ] **T3-2.6** — Cancel mid-download → download stops, partial files cleaned

### T3-3: Tasbeeh Counter
- [ ] **T3-3.1** — Azkar → Tasbeeh Counter → tap → count increments with haptic feedback
- [ ] **T3-3.2** — Haptic at each tap (light buzz)
- [ ] **T3-3.3** — Haptic at target (33/33/34) → stronger buzz (SUCCESS)
- [ ] **T3-3.4** — Phase cycles: SubhanAllah ×33 → Alhamdulillah ×33 → Allahu Akbar ×34
- [ ] **T3-3.5** — Reset → current count resets, lifetime total preserved
- [ ] **T3-3.6** — Kill app mid-count → count preserved on return

### T3-4: Qibla Compass
- [ ] **T3-4.1** — Qibla tab → compass appears with Kaaba needle
- [ ] **T3-4.2** — Rotate phone → needle rotates to point toward Qibla
- [ ] **T3-4.3** — Align within ±5° → "aligned" state shown (color change)
- [ ] **T3-4.4** — On phone WITHOUT magnetometer → static bearing shown (e.g., "258° from North")
- [ ] **T3-4.5** — Static fallback shows distance to Makkah in km
- [ ] **T3-4.6** — Leave Qibla tab → orientation listener stops (check battery — no drain)

### T3-5: Hadith
- [ ] **T3-5.1** — Hadith tab → only collections with `cleared:true` are visible
- [ ] **T3-5.2** — Hadith of the Day card on dashboard → shows hadith text + narrator + source
- [ ] **T3-5.3** — Hadith reading view shows: Arabic + translation + narrator + **grade chip** (color-coded)
- [ ] **T3-5.4** — No hadith shown without grade + reference

---

## Phase 4 — Ramadan & Search Tests

### T4-1: Ramadan Mode
- [ ] **T4-1.1** — Set device date into Ramadan (Hijri month 9) → Ramadan UI activates automatically
- [ ] **T4-1.2** — Dashboard shows Suhoor/Iftar card with countdown
- [ ] **T4-1.3** — Suhoor/Iftar times correct against known prayer times
- [ ] **T4-1.4** — Imsak offset configurable in Settings (default 10 min before Fajr)
- [ ] **T4-1.5** — Pre-Ramadan: set date to ~30 days before Ramadan → "X days until Ramadan" banner
- [ ] **T4-1.6** — Fasting Log: 30-day calendar, tap to cycle fasted/missed/exempt
- [ ] **T4-1.7** — Fasting Log: exempt reasons selectable (travel, illness, menses, pregnancy, other)
- [ ] **T4-1.8** — Fasting Log persists across app restarts
- [ ] **T4-1.9** — Taraweeh toggle per night
- [ ] **T4-1.10** — Last ten nights (day 21+): highlight appears
- [ ] **T4-1.11** — Odd nights (21,23,25,27,29): Qadr reminder shown
- [ ] **T4-1.12** — Make-up-owed counter correct (missed + exempt days)

### T4-2: Offline Search
- [ ] **T4-2.1** — Search screen → type "رحمن" (no harakat) → finds Ar-Rahman ayahs
- [ ] **T4-2.2** — Search "mercy" → finds English matches
- [ ] **T4-2.3** — Search Urdu term → finds Urdu matches
- [ ] **T4-2.4** — Language filter: All → results from all languages
- [ ] **T4-2.5** — Language filter: العربية → only Arabic results
- [ ] **T4-2.6** — Tap a result → opens correct surah at correct ayah
- [ ] **T4-2.7** — Search works in airplane mode (index cached)
- [ ] **T4-2.8** — Second search is instant (index already built)
- [ ] **T4-2.9** — Index builds lazily (first search takes 2-5s, doesn't delay app boot)

---

## Cross-Cutting Tests

### T-X1: Trilingual + RTL
- [ ] **T-X1.1** — Switch EN → UR → AR → EN in one session → no UI corruption
- [ ] **T-X1.2** — RTL: text alignment, icons, navigation all mirror correctly
- [ ] **T-X1.3** — Arabic text renders correctly (joined letters, harakat, tatweel)
- [ ] **T-X1.4** — Urdu Nastaliq renders correctly (not Naskh fallback)
- [ ] **T-X1.5** — Bottom nav labels render in all three languages without truncation

### T-X2: Offline Resilience
- [ ] **T-X2.1** — Airplane mode ON → launch app → dashboard renders
- [ ] **T-X2.2** — Airplane mode → open previously-downloaded surah → full text visible
- [ ] **T-X2.3** — Airplane mode → prayer times calculated (offline algorithm)
- [ ] **T-X2.4** — Airplane mode → hijri date shown (offline calculation)
- [ ] **T-X2.5** — Airplane mode → azkar available
- [ ] **T-X2.6** — Airplane mode → downloaded audio plays
- [ ] **T-X2.7** — Airplane mode → search works (index cached)

### T-X3: Storage
- [ ] **T-X3.1** — App install size reasonable (APK ~5-8MB + bundle ~1.1MB)
- [ ] **T-X3.2** — After downloading 5 surahs → storage usage shown correctly
- [ ] **T-X3.3** — Clear app data → reinstall → bundle downloads fresh
- [ ] **T-X3.4** — IndexedDB quota not exceeded under normal use (10+ surahs downloaded)

### T-X4: Service Worker
- [ ] **T-X4.1** — SW registers without error (check console)
- [ ] **T-X4.2** — SW caches app shell on first load
- [ ] **T-X4.3** — SW caches fonts on first load
- [ ] **T-X4.4** — SW caches audio on first play
- [ ] **T-X4.5** — SW update: bump version → old caches cleared, new caches populated

### T-X5: Error States & Edge Cases
- [ ] **T-X5.1** — No internet → app loads from cache (shell + fonts)
- [ ] **T-X5.2** — Qur'an bundle download fails → retry button shown
- [ ] **T-X5.3** — Audio download fails → error state, can retry
- [ ] **T-X5.4** — GPS denied → city picker fallback (works)
- [ ] **T-X5.5** — Notification permission denied → app functions normally without
- [ ] **T-X5.6** — Storage quota exceeded → user sees "Storage full" message
- [ ] **T-X5.7** — Rapid navigation (tap 5 tabs quickly) → no crash, no white screen
- [ ] **T-X5.8** — App in background for hours → return → state preserved

### T-X6: Privacy & Permissions
- [ ] **T-X6.1** — Location used locally (no data sent to server)
- [ ] **T-X6.2** — No login/signup required
- [ ] **T-X6.3** — Privacy policy accessible from Settings
- [ ] **T-X6.4** — No tracking SDKs beyond AdMob (which uses consent-first non-personalized default)
- [ ] **T-X6.5** — Kids mode: no ads, no data collection

---

## Device Matrix

| # | Device | RAM | Android | Test Focus | Result |
|---|--------|-----|---------|------------|--------|
| 1 | Budget Android (Infinix/Redmi/Tecno) | 2GB | 12+ | Performance, scrolling, background audio, OEM kill | ⬜ |
| 2 | Mid-range Android | 4GB+ | 13+ | General functionality, all features | ⬜ |
| 3 | High-end Android (if available) | 8GB+ | 14+ | Widget, notifications, all features | ⬜ |
| 4 | Android Emulator (2GB profile) | 2GB | API 24 | Fallback for budget phone testing | ⬜ |
| 5 | iPhone 8 / SE (if available) | 2GB | iOS 15+ | iOS baseline | ⬜ |
| 6 | iPhone 12+ (if available) | 4GB+ | iOS 17+ | iOS full test | ⬜ |

---

## Pre-Release Checklist

### GitHub
- [ ] All verification scripts pass (`verify-phase-0.js` through `verify-phase-4.js`)
- [ ] `git status` — only intentional files modified
- [ ] `node_modules/` in `.gitignore`
- [ ] `dist/` in `.gitignore` (optional — some teams commit it for Capacitor)
- [ ] `android/` and `ios/` directories committed (generated by Capacitor)
- [ ] Commit message: `Release v1.5.1 (versionCode 7) — background audio fix + all Phase 0-4 features`
- [ ] Tag: `git tag v1.5.1`
- [ ] Push: `git push origin main --tags`

### Google Play Store
- [ ] Signed AAB built (`Build → Generate Signed Bundle → release`)
- [ ] AAB uploaded to Play Console (internal testing track FIRST)
- [ ] Internal testing: add 2-5 testers, wait 24h for review
- [ ] Internal testing feedback addressed
- [ ] AdMob console: category blocks configured (see `docs/admob-safety-config.md`)
- [ ] AdMob console: real ad unit IDs in `ddp-ads.js` (not test IDs)
- [ ] `versionCode` incremented (currently 7)
- [ ] `versionName` matches release (1.5.1)
- [ ] Privacy policy URL live
- [ ] Store listing: screenshots (EN + AR + UR), feature graphic, description
- [ ] Content rating questionnaire completed
- [ ] Data safety section completed (no data collected beyond AdMob standard)
- [ ] App content → target audience: 13+ (general, not child-directed)
- [ ] `remove_ads` in-app product created in Play Console
- [ ] Promote to production

### Apple App Store
- [ ] Xcode project configured with correct bundle ID + signing team
- [ ] Info.plist: all permission strings added (location, motion, notifications)
- [ ] Background Modes → Audio enabled
- [ ] AVAudioSession category set to `.playback` (spokenAudio mode)
- [ ] AdMob: `GADApplicationIdentifier` in Info.plist + SKAdNetworkItems
- [ ] iOS ad units created (separate from Android)
- [ ] Archive → upload to App Store Connect
- [ ] TestFlight: add testers
- [ ] App Store listing: screenshots (iPhone 6.7" + 5.5"), description
- [ ] App privacy details completed
- [ ] App Review notes: mention Islamic prayer/Qur'an app, location used locally
- [ ] Submit for review

---

## Release Sequence

```
STEP 1: Run all verification scripts (6 scripts, ~247 checks)
        ↓
STEP 2: Test on REAL budget Android phone (Device #1 in matrix)
        ↓
STEP 3: Fix any issues found in Step 2
        ↓
STEP 4: Push to GitHub + tag release
        ↓
STEP 5: Build signed AAB → upload to Play Console INTERNAL TESTING
        ↓
STEP 6: Wait for internal tester feedback (2-5 testers, 24-48h)
        ↓
STEP 7: Address any feedback → rebuild if needed → promote to PRODUCTION
        ↓
STEP 8: iOS: configure Xcode → TestFlight → review → App Store
        ↓
STEP 9: Monitor Play Console crash reports + reviews for first week
        ↓
STEP 10: Schedule native-speaker QA for Arabic + Urdu UI strings
```

---

## Quick Verification (Run Before Every Build)

```bash
# Run all verification scripts
cd "C:\Users\mjawa\OneDrive - Athabasca University\Dev Projects\Deen o Dunya\deen-o-dunya"

echo "=== Phase 0 ===" && node scripts/verify-phase-0.js && \
echo "=== Phase 0b ===" && node scripts/verify-phase-0b.js && \
echo "=== Phase 1 ===" && node scripts/verify-phase-1.js && \
echo "=== Phase 2 ===" && node scripts/verify-phase-2.js && \
echo "=== Phase 3 ===" && node scripts/verify-phase-3.js && \
echo "=== Phase 4 ===" && node scripts/verify-phase-4.js && \
echo "=== ALL PHASES PASSED ==="

# Total expected: 68 + 18 + 58 + 39 + 37 + 27 = 247 checks

# Build
npm run prepare:mobile && npx cap sync

# Android: open for signing
npx cap open android
```
