# Deen o Dunya Planner — Phase 0 Work Order

**Purpose:** fix every issue reported by Play-testing feedback plus the critical defects found in code review, with minimal surgical changes. Written to be executed by an AI coding agent (Claude Code / Codex) or a developer against the repo `mjawaidca-prog/deen-o-dunya`.

**Feedback → fix map**

| # | Tester feedback | Root cause | Fix in this work order |
|---|---|---|---|
| 1 | Qur'an recitation is slow | Per-ayah MP3 streamed fresh from CDN at 128kbps, no preload, no cache | `ddp-audio.js` (bitrate + preload) + `sw.js` v16 (audio cache) — Tasks 2, 5 |
| 2 | Adhan does not play | WebView blocks non-user-gesture audio; adhan hotlinked from islamcan.com | `MainActivity.java` + bundle adhan locally — Tasks 3, 6 |
| 3 | Phone call stops audio; app never returns to its position | No interruption handling; no session persistence; WebView killed under memory pressure | `ddp-audio.js` + `ddp-state.js` — Tasks 2, 5, 7 |
| 4 | Font is too small | `user-scalable=no`; fixed px sizes; no text-size setting | Tasks 4, 8 + `MainActivity.java` textZoom |
| 5 | (Review) Default city was Calgary; no offline city list | Hardcoded default | `ddp-cities.js` — Task 9 |

---

## Task 1 — Repo hygiene (do first; 15 min)

The shipped app is the single inline script inside `index.html`. Every loose `.js` file at repo root is **orphaned and mislabeled** (e.g. `react.production.min.js` contains app components; `app.js` and `qibla.js` are identical copies; `quran-data.js` contains UI code). They confuse every future edit.

1. Create a folder `archive/` and move into it: `app.js`, `qibla.js`, `quran.js`, `quran-data.js`, `azkar.js`, `azkar-data.js`, `dashboard.js`, `tasks.js`, `more.js`, `settings.js`, `theme.js`, `ios-frame.js`, `react.production.min.js`, `react-dom.production.min.js`. (Do not delete yet — archive one release cycle, then delete.)
2. Keep at root only what ships: `index.html`, `sw.js`, `privacy.html`, `manifest.webmanifest`, `mobile-admob.js`, `assets/`, icons, plus the three new helper files below.

## Task 2 — Add the three helper modules

Copy into repo root: **`ddp-cities.js`**, **`ddp-audio.js`**, **`ddp-state.js`** (provided).

In `index.html`, immediately **before** the main inline `<script>` block, add:

```html
<script src="./ddp-cities.js"></script>
<script src="./ddp-state.js"></script>
<script src="./ddp-audio.js"></script>
```

Update `scripts/prepare-mobile-build.js`: add the three filenames to the `files` array so they ship in `dist/`.

Replace `sw.js` with the provided **v16** (adds font + audio runtime caching, fixes the bug where offline asset requests received `index.html` bytes, and pre-caches the helper scripts).

## Task 3 — Android native fixes

1. Replace `android/app/src/main/AndroidManifest.xml` with the provided file (adds `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`).
2. Replace `android/app/src/main/java/com/deenodunya/planner/MainActivity.java` with the provided file. It (a) allows programmatic audio — **the adhan fix** — and (b) applies the user's system font scale to the WebView (clamped 100–140%) — immediate relief for "font is too small".
3. Add the Capacitor Geolocation plugin so the native permission prompt works reliably:
   `npm i @capacitor/geolocation && npx cap sync`. No JS change is required for Phase 0 (the WebView `navigator.geolocation` will now be honored once the manifest permissions exist), but Phase 1 should switch to the plugin API.
4. Bump `versionCode` to 2 in `android/app/build.gradle` before the next upload.

## Task 4 — Viewport / zoom (one line)

In `index.html`, change:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

to:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Pinch-zoom is an accessibility right, especially for elderly readers of Qur'an text. Double-tap-zoom side effects are already mitigated by the app's `touch-action` defaults; if any control misbehaves, add `touch-action: manipulation` to the body style rather than restoring `user-scalable=no`.

## Task 5 — Wire the shared audio manager into the app (inline script edits)

Inside the inline script, two audio systems exist: `PlayerBar` (Qur'an recitation) and `DhikrAudio` (azkar). Both create their own `<audio>` elements. Refactor both to delegate to `window.DDP_AUDIO`:

1. **PlayerBar**: where it currently builds the ayah URL from `cdn.islamic.network/quran/audio/128/ar.alafasy/{gid}.mp3` with a 64kbps fallback, replace with `DDP_AUDIO.ayahSources(gid)` and `DDP_AUDIO.play(sources, { onEnded: goToNextAyah })`. Subscribe UI state via `DDP_AUDIO.onState(...)`.
2. **Preload**: whenever an ayah starts playing, call `DDP_AUDIO.preload(DDP_AUDIO.ayahSources(gid + 1))`. Combined with sw.js v16 caching, sequential listening becomes gapless after the first ayah, and replays work offline.
3. **DhikrAudio**: remove the per-card `<audio>` element; route play/pause through `DDP_AUDIO` with the existing `audioSourcesFor(...)` list. Only one dhikr can play at a time anyway (the app already enforces `playingId`), so a single element is strictly better.
4. Delete the fake waveform-progress timer only if it depended on the removed element's events; otherwise drive it from `DDP_AUDIO.element.currentTime / duration`.

**Acceptance:** during recitation, receive a phone call → return to app → playback resumes from the same second (or shows a paused state at the same position requiring one tap), never resets to the dashboard.

## Task 6 — Bundle adhan audio locally

1. Create `assets/audio/` and place two adhan recordings there as `adhan-makkah.mp3` and `adhan-madinah.mp3`. Source them from a license-cleared origin (e.g., public-domain/CC recordings; verify license — do **not** rip from islamcan.com). Keep each ≤ ~700 KB (mono, 64–96 kbps is fine for adhan).
2. In the inline script, replace the two hardcoded `https://www.islamcan.com/audio/adhan/azan1.mp3` / `azan2.mp3` URLs with `./assets/audio/adhan-makkah.mp3` / `./assets/audio/adhan-madinah.mp3`.
3. Add both files to `APP_SHELL` in `sw.js` and to `prepare-mobile-build.js` (`dirs` already copies `assets/`).
4. Note: with `MainActivity` now permitting programmatic playback, the in-app adhan will sound **while the app is open**. Adhan when the app is closed requires local notifications — that is the first item of Phase 1, not this work order.

## Task 7 — Session position persistence

1. On boot, the app's root component currently initializes `tab/surah/ayah` state from constants. Change the initializers to read `DDP_STATE.get()`, e.g. `useState(() => DDP_STATE.get().surah || null)`.
2. In the state setters for tab change, surah open/close, and ayah advance, add `DDP_STATE.set({ tab, surah, ayah })`.
3. After the reading view mounts, call `DDP_STATE.trackScroll(scrollContainerElement)` (the main scrolling `div`).
4. Also persist the reading position when audio advances ayahs, so "resume" returns to the correct verse even if the process was killed mid-listen.

## Task 8 — Global text-size setting (A− / A / A+)

1. Add a CSS variable on `:root`: `--ddp-scale: 1`.
2. In the Settings screen, add a "Text size" row with three options (Normal / Large / Extra large → 1 / 1.15 / 1.3), stored in `localStorage("ddp_text_scale")`, applied on boot via `document.documentElement.style.setProperty("--ddp-scale", v)`.
3. Because the app uses inline pixel styles, apply the scale at the WebView level in JS: on boot and on change, set `document.documentElement.style.fontSize = (16 * v) + "px"` **and** wrap the two reading-critical font sizes (Arabic ayah text, Urdu translation/tafsir) to multiply by the scale — these four sites in the inline script: Arabic `fontSize: 28`, Urdu `fontSize: 17`, tafsir Urdu `fontSize: 15`, dhikr Arabic `fontSize: 27`. Reading text is where "font is too small" hurts; chrome/labels can stay fixed.
4. This complements (not replaces) the system-font-scale honoring added in `MainActivity.java`.

## Task 9 — Replace the Calgary default with the offline city picker

1. In the inline script, locate the geolocation block anchored by `label:"Your location"` and the fallback anchored by the string `Calgary`. Replace the whole resolve-location flow with `DDP_LOC.resolve(loc => { ... })` from `ddp-cities.js` (it already implements: saved city → GPS → smart locale default → **Karachi**, never Calgary).
2. In Settings, replace the current fixed "Calgary, AB (default)" row with a searchable city list fed by `DDP_CITIES.search(query)`; on select, call `DDP_LOC.save(city)` and recompute prayer times + qibla. When a picked city carries a `method`, pre-select that calculation method (e.g., any Pakistani city → Karachi method) while leaving the user free to override.
3. First run (no saved location, GPS denied): show the city picker once before the dashboard — one screen, search box, Pakistan's major cities on top. This is also the single biggest "non-tech-friendly" win: the app is correct out of the box without touching settings.

## Task 10 — Honest download UI

In `ReadingView`'s download routine: remove the `setInterval` fake-progress timer and the fabricated `ayahs*0.04+0.3` MB label. The download is three parallel fetches (Arabic, English, Urdu) — report real progress in thirds as each resolves (33/66/100%), and drop the MB figure entirely ("Download full sūrah" is enough). Keep the existing error state.

Also: wrap the `localStorage.setItem` for downloaded surahs so a `QuotaExceededError` shows the user a real message ("Storage full — remove a downloaded sūrah") instead of silently failing. (Full move to IndexedDB is Phase 1.)

## Task 11 — Rebuild + test checklist

```
npm run prepare:mobile && npx cap sync android
# open Android Studio, run on a LOW-END device or 2GB-RAM emulator profile
```

Verify, in order:
- [ ] Fresh install, airplane mode ON from first launch → app opens, dashboard renders, Urdu/Arabic fonts show correctly after one prior online launch (fonts now cached)
- [ ] Fresh install, GPS denied → city picker appears, pick Lahore → prayer times correct for Lahore, method = Karachi
- [ ] Play Sūrah recitation on throttled 3G profile → first ayah starts < 3 s at 64kbps; second ayah gapless
- [ ] Mid-recitation, trigger an incoming call → end call → app resumes at same surah/ayah/scroll; audio resumes or shows tap-to-resume at the same second
- [ ] Kill the app from recents mid-reading → relaunch → returns to the same surah and scroll position
- [ ] Adhan test button (or wait for prayer time with app open) → adhan audible
- [ ] Settings → Text size → Extra large → Arabic/Urdu reading text visibly larger; layout not broken
- [ ] Pinch-zoom works on the reading screen
- [ ] Offline: previously played ayahs replay; previously downloaded surahs open

---

# Product spec (build after Phase 0): simple mode + habit loop

You asked for (a) usability for non-technical users and (b) making the app habitual. These are design decisions, so specifying them now so Phase 1 implements them coherently.

## A. "Easy for everyone" principles

1. **Three-screen onboarding, then never ask again:** ① Language (اردو / English — big buttons, native script) ② Your city (picker from Task 9) ③ "Ready — your prayer times are set." Everything else defaults sensibly (method auto-selected by city).
2. **The dashboard is the app.** One screen a 60-year-old can live in: today's next prayer as a large countdown card, then exactly three big tappable rows — *Today's Salah* (5 check circles), *Today's Qur'an* (continue reading, one tap), *Today's Azkar* (morning/evening, one tap). Everything else moves behind "More".
3. **Words over icons.** Every bottom-nav item labeled in the chosen language; no icon-only controls. Urdu labels in Nastaliq at ≥15px equivalent.
4. **One-tap actions everywhere:** marking a prayer prayed = single tap on its circle (no dialogs); dhikr counting = tap anywhere on the card (already true — keep it).
5. **Never punish, never block:** no login, no mandatory permissions, no interstitials, ads never on Qur'an/azkar/prayer screens.

## B. The habit loop (what makes it daily)

The app already has the raw pieces (SalahLogScreen, reading plan, azkar counters). Connect them into one loop:

1. **Daily Score ring** on the dashboard: 5 prayers + Qur'an portion + morning azkar + evening azkar = 8 segments of one ring. Filling the ring completely = "Day completed — الحمد للہ". Simple, visual, understandable with zero literacy in apps.
2. **Streaks with mercy:** consecutive completed days counted; one "mercy day" per week auto-protects the streak (missed days happen — an app that shames users gets deleted; this is also the fiqh-appropriate tone).
3. **Khatm plan:** on first Qur'an open, ask one question — "Finish the Qur'an in: 30 days / 90 days / 1 year / my own pace" — then the daily reading card always shows exactly today's portion and a progress bar to completion. This converts the Qur'an tab from a library into a commitment.
4. **Prayer notifications (the anchor habit):** adhan or silent banner per prayer, configurable per prayer, via `@capacitor/local-notifications` with the bundled adhan as the notification sound. This alone is the #1 retention feature of every successful Islamic app.
5. **Gentle evening nudge (one per day max):** if the ring is ≥ half full at Isha, "2 more to complete your day" — never guilt-based wording.
6. **Weekly Jum'ah summary:** Friday notification with the week's ring, streak, and one short hadith on consistency ("the most beloved deeds are the most consistent, even if small" — Bukhari/Muslim). Ties the habit to a weekly spiritual rhythm rather than gamification for its own sake.
7. **Widget (Phase 2):** home-screen next-prayer countdown + ring. Widgets are the cheapest daily-visibility win on Android.

Deliberately **not** recommended: leaderboards, public streaks, coin/points economies — they cheapen worship and clash with the app's tone and audience.
