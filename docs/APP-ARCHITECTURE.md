# Deen o Dunya Planner — Complete App Architecture

**Version:** 1.5.1 · **versionCode:** 7  
**Platform:** Android (native via Capacitor 8) + iOS (Xcode project generated)  
**Last updated:** 2026-07-04

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [File Structure](#file-structure)
5. [Module Reference](#module-reference)
6. [Data Flow](#data-flow)
7. [Screen Map & Navigation](#screen-map--navigation)
8. [Feature Inventory by Phase](#feature-inventory-by-phase)
9. [Plugin Matrix](#plugin-matrix)
10. [Build & Release Pipeline](#build--release-pipeline)

---

## Project Overview

**Deen o Dunya Planner** is an offline-first Islamic daily planner PWA wrapped as a native Android/iOS app via Capacitor. It combines prayer times, Qur'an reading with recitation, adhkar, habit tracking, Ramadan mode, and productivity tools into a single calm, trilingual (EN/AR/UR) interface.

**Core design principles:**
- Offline-first — Qur'an text, search, prayer times, and hijri dates work without internet
- Worship-first — ads NEVER appear on prayer/Qur'an/adhkar screens
- Low-end device friendly — device-tier performance tuning, virtualized lists
- Trilingual with proper RTL — English, Arabic, Urdu with Nastaliq rendering
- Ethical monetization — category-blocked ads, one-time remove-ads purchase, sadaqah channel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript (React 18 production build inline) |
| **Styling** | Inline React styles, CSS custom properties, Google Fonts (Newsreader, Hanken Grotesk, Amiri, Noto Nastaliq Urdu) |
| **Mobile wrapper** | Capacitor 8 (`@capacitor/core`, `@capacitor/cli`) |
| **Offline storage** | IndexedDB (Qur'an, tafsir, habits, hadith packs) + localStorage (tiny settings) |
| **Audio** | Single shared `<audio>` element via `DDP_AUDIO` + MediaSession foreground service |
| **Build** | Node.js scripts → `dist/` → `npx cap sync` → Android Studio / Xcode |
| **Service Worker** | Custom v21 — app shell, font, audio, and content caching |
| **Target Android** | API 24+ (min), API 36 (target), Android 15 |
| **Target iOS** | iOS 14+ (Capacitor 8 minimum) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    index.html (532KB)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  <head>: Google Fonts (Newsreader, Amiri, etc.)       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  <body>: <div id="root">                             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  <!-- External Modules (22 files) -->                │  │
│  │  Phase 0:  ddp-cities, ddp-state, ddp-audio,         │  │
│  │            ddp-bgaudio                               │  │
│  │  Phase 1:  ddp-db, ddp-habits, ddp-notify,           │  │
│  │            ddp-hijri, ddp-i18n                       │  │
│  │  Phase 2:  ddp-perf, ddp-vlist, ddp-ads,             │  │
│  │            ddp-purchase                              │  │
│  │  Phase 3:  ddp-audio-dl, ddp-hadith, ddp-kids,       │  │
│  │            ddp-tasbeeh-qibla                         │  │
│  │  Phase 4:  ddp-ramadan, ddp-search                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  <script> React 18 (production.min.js)               │  │
│  │  <script> ReactDOM (production.min.js)               │  │
│  │  <script> App Code (~500KB inline)                   │  │
│  │    ├── Components (Dashboard, Quran, Azkar, etc.)    │  │
│  │    ├── Phase 1: Boot, Onboarding, DailyRing,         │  │
│  │    │   Habbits, Khatm, i18n                          │  │
│  │    ├── Phase 2: Perf tuning, Ads guard               │  │
│  │    ├── Phase 3: Kids mode, Tasbeeh haptics           │  │
│  │    ├── Phase 4: Ramadan, Search                      │  │
│  │    └── Phase 0b: Background audio bind               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Native Capacitor Bridge                         │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  AdMob   │FileSystem│Geolocation│ Haptics  │  Local   │  │
│  │  Banner  │  (DLs)   │  (GPS)   │(Tasbeeh) │Notif.    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│  ┌──────────┬──────────────────────────────────────────┐   │
│  │  Media   │  Android Widget (NextPrayerWidget.java)  │   │
│  │ Session  │  SharedPreferences bridge                │   │
│  │(bg audio)│                                          │   │
│  └──────────┴──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Storage Layer                                   │
│  ┌──────────────────┬──────────────────────────────────┐   │
│  │  IndexedDB (ddp) │  localStorage (settings)          │   │
│  │  ├── quran (114) │  ├── ddp_lang, ddp_text_scale    │   │
│  │  ├── tafsir      │  ├── ddp_onboard_v1              │   │
│  │  ├── habits      │  ├── ddp_kids_mode, ddp_kids_pin │   │
│  │  ├── kv (misc)   │  ├── ddp_remove_ads              │   │
│  │  └── audio blobs │  ├── ddp_streak_v1, ddp_khatm_v1│   │
│  │  (web fallback)  │  └── tasbih, salah logs, etc.    │   │
│  └──────────────────┴──────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Device Filesystem (Capacitor Filesystem)             │   │
│  │  └── audio/{reciterId}/{surahNum}/{ayahN}.mp3        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
deen-o-dunya/
├── index.html                    # THE APP (532KB, single-file React PWA)
├── sw.js                         # Service Worker v21
├── privacy.html                  # Privacy policy page
├── manifest.webmanifest          # PWA manifest
├── capacitor.config.json         # Capacitor mobile config
├── package.json                  # v1.0.0, Capacitor 8 deps
├── package-lock.json
│
├── dist/                         # Mobile build output (→ Capacitor sync)
│   ├── index.html, sw.js, privacy.html, manifest.webmanifest
│   ├── mobile-admob.js
│   ├── ddp-*.js (22 modules)
│   ├── quran-bundle.json.gz (1.1 MB)
│   └── assets/ (audio, icons)
│
├── archive/                      # Original pre-Phase-0 source files
│   ├── app.js, qibla.js, quran.js, quran-data.js, azkar.js,
│   │   azkar-data.js, dashboard.js, tasks.js, more.js,
│   │   settings.js, theme.js, ios-frame.js
│   └── react.production.min.js, react-dom.production.min.js
│
├── assets/
│   ├── app-icon.svg
│   └── audio/
│       ├── adhan-makkah.mp3      # ~700KB, local adhan recording
│       └── adhan-madinah.mp3     # ~700KB, local adhan recording
│
├── scripts/
│   ├── prepare-mobile-build.js   # Builds dist/ from root files
│   ├── build-quran-bundle.js     # Downloads + gzips 114 surahs × 3 langs
│   ├── verify-phase-0.js         # 68 checks — Phase 0 verification
│   ├── verify-phase-1.js         # 58 checks — Phase 1 verification
│   ├── verify-phase-2.js         # 39 checks — Phase 2 verification
│   ├── verify-phase-3.js         # 37 checks — Phase 3 verification
│   ├── verify-phase-4.js         # 27 checks — Phase 4 verification
│   └── verify-phase-0b.js        # 18 checks — Background audio verification
│
├── android/                      # Capacitor Android project
│   └── app/src/main/
│       ├── AndroidManifest.xml   # 8 permissions + widget receiver
│       ├── java/com/deenodunya/planner/
│       │   ├── MainActivity.java # Programmatic audio + font scale
│       │   └── NextPrayerWidget.java  # Home-screen widget
│       └── res/
│           ├── raw/              # adhan_makkah.mp3, adhan_madinah.mp3
│           ├── drawable/         # widget_bg.xml, widget_ring_bg.xml
│           ├── layout/           # widget_next_prayer.xml
│           ├── xml/              # next_prayer_widget_info.xml
│           └── values/           # strings.xml (app_name, widget_description)
│
├── ios/                          # Capacitor iOS project
│   └── App/App/                  # Xcode project (needs signing + capabilities)
│
├── docs/
│   ├── APP-ARCHITECTURE.md       # THIS FILE
│   ├── TESTING-PLAN.md           # Pre-release testing checklist
│   ├── admob-safety-config.md    # AdMob console configuration guide
│   └── release/google-play/      # Play Store submission docs
│
├── store/                        # App Store listing drafts
├── updates/                      # Phase 1 design reference files
│
└── node_modules/                 # Capacitor + plugins
```

---

## Module Reference (22 ddp-*.js files)

### Phase 0 — Core Infrastructure
| Module | Exposes | Purpose |
|--------|---------|---------|
| `ddp-cities.js` | `DDP_LOC`, `DDP_CITIES` | 70+ city DB (Pakistan-first), GPS resolve, Karachi default |
| `ddp-state.js` | `DDP_STATE` | Session persistence (screen/ayah/scroll position) |
| `ddp-audio.js` | `DDP_AUDIO` | Shared audio manager — bitrate, preload, interruption handling |
| `ddp-bgaudio.js` | `DDP_BGAUDIO` | Background audio via MediaSession — keeps recitation alive when screen locks |

### Phase 1 — Content & Habits
| Module | Exposes | Purpose |
|--------|---------|---------|
| `ddp-db.js` | `DDP_DB` | IndexedDB wrapper — quran/tafsir/habits/kv stores, localStorage migration |
| `ddp-habits.js` | `DDP_HABITS` | Daily ring (8 segments), streaks with mercy day, khatm plan |
| `ddp-notify.js` | `DDP_NOTIFY` | 7-day prayer notification scheduler with adhan sound + evening nudge |
| `ddp-hijri.js` | `DDP_HIJRI` | Offline hijri date (Kuwaiti algorithm), user offset, Islamic occasions |
| `ddp-i18n.js` | `DDP_I18N` | Trilingual string table (EN/AR/UR), RTL dir, language switching |

### Phase 2 — Performance & Monetization
| Module | Exposes | Purpose |
|--------|---------|---------|
| `ddp-perf.js` | `DDP_PERF` | Device-tier tuning (low/mid/high), debounce/throttle, chunked loops |
| `ddp-vlist.js` | `DDP_VLIST` | Virtual scrolling list — renders only visible ayahs |
| `ddp-ads.js` | `DDP_ADS` | AdMob manager — screen blocking, audio guard, consent, test ads |
| `ddp-purchase.js` | `DDP_PURCHASE` | Remove-ads IAP — one-time non-consumable, restore |

### Phase 3 — Kids, Hadith, Audio, Qibla
| Module | Exposes | Purpose |
|--------|---------|---------|
| `ddp-audio-dl.js` | `DDP_AUDIO_DL` | Offline surah audio downloads (5 reciters), resumable, real progress |
| `ddp-hadith.js` | `DDP_HADITH` | Hadith collections (8 registered, all `cleared:false`), hadith-of-the-day |
| `ddp-kids.js` | `DDP_KIDS` | Kids mode (PIN guard, curated content, ad-free, large text) |
| `ddp-tasbeeh-qibla.js` | `DDP_TASBEEH`, `DDP_QIBLA` | Tasbeeh counter with haptics + Qibla compass (DeviceOrientation) |

### Phase 4 — Ramadan & Search
| Module | Exposes | Purpose |
|--------|---------|---------|
| `ddp-ramadan.js` | `DDP_RAMADAN` | Auto-detect Ramadan from hijri, suhoor/iftar, fasting log, Qadr nights |
| `ddp-search.js` | `DDP_SEARCH` | Offline full-text Qur'an search (harakat-free Arabic, EN, UR) |

---

## Data Flow

```
USER OPENS APP
    │
    ▼
ddpBoot() [Phase 1]
    ├── DDP_DB.migrateLegacy()          # localStorage → IndexedDB
    ├── loadQuranBundle()               # If first install: fetch quran-bundle.json.gz
    ├── DDP_PERF.profile()              # Device-tier detection → __ddpPerf
    ├── Strip copyrighted tafsir keys   # Phase 2 compliance
    ├── DDP_I18N.apply()                # Set lang + dir on <html>
    ├── DDP_HABITS.recalcStreak()       # Async streak recalculation
    ├── DDP_RAMADAN.ramadanStatus()     # Phase 4: check if Ramadan
    ├── DDP_ADS.init()                  # Phase 2: AdMob initialize
    ├── DDP_BGAUDIO.bindToPlayer()      # Phase 0b: lock-screen audio
    ├── DDP_KIDS.isActive()?            # Phase 3: kids mode guard
    ├── Check onboarding                # Phase 1: show Onboarding if first run
    └── DDP_NOTIFY.needsRefresh()?      # Phase 1: schedule prayer notifications
    │
    ▼
DASHBOARD RENDERS
    ├── Hijri date (DDP_HIJRI.format)
    ├── Gregorian date
    ├── Ramadan check → Suhoor/Iftar card OR pre-Ramadan countdown
    ├── DayRibbon / PrayerLookB (next prayer + timeline)
    ├── SalahLogCard → tap cycles prayer states
    ├── QuranLogCard → verses per session + juz bar
    ├── ZikrCard → azkar sets + tasbih count
    ├── GoodDeedsCard → 6 deed pills
    ├── DailyRing (8-segment SVG ring + streak)
    ├── Hadith of the Day card (Phase 3)
    └── Balance card (Deen/Dunya %)
    │
    ▼
SCREEN NAVIGATION (via go() function)
    ├── DDP_ADS.onScreenChange(screenId)  # Ad guard
    ├── DDP_KIDS.isActive()? → restrict to safe screens
    └── React setState → re-render
    │
    ▼
QUR'AN READING FLOW
    ├── loadSurah(num) → DDP_DB.get("quran", num) [IndexedDB first]
    │   └── Fallback: fetch from api.alquran.cloud → cache in IDB
    ├── Recitation: DDP_AUDIO.ayahSources(gid) → play
    │   ├── DDP_AUDIO_DL.localAyahUri() [check offline first]
    │   └── CDN fallback: cdn.islamic.network
    ├── DDP_BGAUDIO.updateNowPlaying() [lock screen metadata]
    └── DDP_STATE.set() [save position]
```

---

## Screen Map & Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│                        BOTTOM NAV BAR                            │
│  [Today] [Qur'an] [Tafsir] [Hadith] [Qibla] [Azkar] [More]      │
└─────────────────────────────────────────────────────────────────┘

Today (Dashboard)
├── Day Ribbon / Prayer Look B (next prayer)
├── Prayer Times Table
├── Salah Log Card ──────────────→ SalahLogScreen
├── Qur'an Log Card ─────────────→ QuranLogScreen
├── Zikr Card ───────────────────→ AzkarScreen (with TasbihCounter)
├── Good Deeds Card ─────────────→ GoodDeedsScreen
├── Daily Ring (habit score)
├── Hadith of the Day
├── Balance Card (Deen/Dunya %)
├── [Ramadan] Suhoor/Iftar Card ─→ RamadanLog
└── [Ramadan] Pre-Ramadan Countdown Banner

Qur'an Tab
├── Surah List (114, searchable) ─→ ReadingView (ayah cards + recitation)
├── Daily Nourishment card
├── [Khatm] Today's Portion card
└── Search button ────────────────→ SearchScreen

Tafsir Tab
└── Mufassir picker + commentary (licensed content only)

Hadith Tab
└── Collections list (cleared:true only) ─→ Reading view with grade chip

Qibla Tab
└── Compass with Kaaba needle / static bearing fallback

Azkar Tab
├── Azkar sets (morning/evening/after prayer)
└── TasbihCounter (with haptics + DDP_TASBEEH)

More Tab
├── Profile card
├── Tasks (Deen + Dunya) ─────────→ TasksScreen
├── Settings ─────────────────────→ SettingsScreen
│   ├── Support the App (Remove Ads + Sadaqah)
│   ├── Prayer Times (Calculation method, Location, Manual times)
│   ├── Adhan & Audio (per-prayer toggles, adhan voice)
│   ├── Hijri Date Adjustment (−2 to +2 days)
│   ├── Qur'an (Qari, daily verse goal, recite reminder)
│   ├── Kids Mode (PIN-protected)
│   ├── General (Notifications, Appearance, Language EN/UR/AR)
│   └── About (attribution, version)
├── Prayer Settings ──────────────→ PrayerSettingsScreen
├── Daily Nourishment
├── Qur'an Log ───────────────────→ QuranLogScreen
├── Azkar ────────────────────────→ AzkarScreen
├── Good Deeds ───────────────────→ GoodDeedsScreen
├── Qibla Finder
├── Downloads (audio) ────────────→ DownloadsScreen (Phase 3)
├── [Ramadan] Fasting Log ────────→ RamadanLog (Phase 4)
└── Search Qur'an ────────────────→ SearchScreen (Phase 4)

Onboarding (first run only)
├── Screen 1: Language picker (English / اردو / العربية)
├── Screen 2: City picker (searchable list + GPS)
└── Screen 3: Ready confirmation + notification opt-in
```

---

## Feature Inventory by Phase

| Phase | Version | Key Features |
|-------|---------|-------------|
| **0** | 1.0.0 | Repo hygiene, shared audio manager, session persistence, city picker (Karachi default), adhan bundle, text-size setting, viewport fix, honest download UI, Android native fixes |
| **0b** | 1.5.1 | **Background audio** (MediaSession + foreground service), lock-screen controls |
| **1** | 1.2.0 | Offline Qur'an (IndexedDB bundle, 3 translations), daily habit ring (8 segments), streaks with mercy day, khatm plan, prayer notifications with adhan sound, hijri date (offline), trilingual i18n (EN/AR/UR with RTL), 3-screen onboarding |
| **2** | 1.3.0 | Virtual scrolling list (ddp-vlist), device-tier perf tuning (low/mid/high), AdMob category blocking + screen guard (NO ads on worship screens), remove-ads IAP + sadaqah, home-screen widget (next prayer), tafsir copyright cleanup |
| **3** | 1.4.0 | Offline audio downloads (5 reciters, per-surah, resumable), hadith module (8 collections, gated on licensing), kids mode (PIN, curated content, ad-free), tasbeeh haptics, qibla compass (with static fallback), iOS platform |
| **4** | 1.5.0 | Ramadan auto-detection (from hijri), suhoor/iftar countdown, 30-day fasting log (by hijri year), taraweeh toggle, last-ten-nights/Qadr highlights, offline full-text Qur'an search (harakat-free Arabic + EN + UR) |

---

## Plugin Matrix

| Plugin | Version | Purpose | Android | iOS |
|--------|---------|---------|---------|-----|
| `@capacitor/core` | 8.4.1 | Capacitor runtime | ✅ | ✅ |
| `@capacitor/cli` | 8.x | Build tooling | ✅ | ✅ |
| `@capacitor-community/admob` | 8.0.0 | Banner/native ads | ✅ | ✅ |
| `@capacitor/geolocation` | 8.2.0 | GPS for prayer times + qibla | ✅ | ✅ |
| `@capacitor/local-notifications` | 8.2.0 | Prayer time notifications | ✅ | ✅ |
| `@capacitor/filesystem` | 8.1.2 | Offline audio storage | ✅ | ✅ |
| `@capacitor/haptics` | 8.0.2 | Tasbeeh tap feedback | ✅ | ✅ |
| `@jofr/capacitor-media-session` | 4.0.0 | Background audio + lock-screen controls | ✅ | ❌ |
| `@capacitor/ios` | 8.x | iOS platform support | — | ✅ |

---

## Build & Release Pipeline

```bash
# 1. Generate Quran bundle (one-time / after translation updates)
node scripts/build-quran-bundle.js
# Output: dist/quran-bundle.json.gz (~1.1 MB), dist/quran-index.json

# 2. Move bundle to root for build
cp dist/quran-bundle.json.gz ./

# 3. Build web bundle
npm run prepare:mobile
# Output: dist/ with all files

# 4. Sync to native projects
npx cap sync
# Copies dist/ → android/app/src/main/assets/public/
# Copies dist/ → ios/App/App/public/
# Updates plugin native code

# 5. Android: open in Android Studio, build signed AAB
npx cap open android
# Build → Generate Signed Bundle → app-release.aab

# 6. iOS: open in Xcode, configure signing, archive
npx cap open ios
# Product → Archive → Upload to App Store Connect

# 7. Before each release, run ALL verification scripts:
node scripts/verify-phase-0.js   # 68 checks
node scripts/verify-phase-0b.js  # 18 checks
node scripts/verify-phase-1.js   # 58 checks
node scripts/verify-phase-2.js   # 39 checks
node scripts/verify-phase-3.js   # 37 checks
node scripts/verify-phase-4.js   # 27 checks
```

### Version History
| Phase | versionCode | versionName | SW |
|-------|-------------|-------------|-----|
| 0 | 2 | 1.0.0 | v16 |
| 1 | 3 | 1.2.0 | v17 |
| 2 | 4 | 1.3.0 | v18 |
| 3 | 5 | 1.4.0 | v19 |
| 4 | 6 | 1.5.0 | v20 |
| **0b** | **7** | **1.5.1** | **v21** |
