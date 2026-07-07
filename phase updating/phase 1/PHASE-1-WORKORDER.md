# Deen o Dunya Planner — Phase 1 Work Order

**Prerequisite:** Phase 0 must be shipped and verified on a test device first.
**Modules delivered:** ddp-db.js, ddp-habits.js, ddp-notify.js, ddp-hijri.js, ddp-i18n.js, build-quran-bundle.js

---

## Phase 1 goals
1. Full offline Qur'an (no network needed for text after first install)
2. Prayer notifications with adhan — works when app is closed
3. Habit loop: daily ring, streaks, khatm plan
4. Hijri date display (offline, no API)
5. Trilingual UI: English / العربية / اردو with proper RTL mirroring
6. Replace localStorage content storage with IndexedDB (kills the 5MB quota bug)
7. Three-screen onboarding so any non-tech user is set up correctly on first launch

---

## Task P1-1 — Install Capacitor plugin (5 min)

```bash
npm i @capacitor/local-notifications
npx cap sync android
```

In `android/app/src/main/res/raw/`, place two audio files (see Phase 0 Task 6):
- `adhan_makkah.mp3`  (the notification sound — filename must match exactly)
- `adhan_madinah.mp3`

Android notification sounds in `res/raw/` do NOT need a separate permission.
The `SCHEDULE_EXACT_ALARM` permission declared in Phase 0 AndroidManifest covers scheduling.

---

## Task P1-2 — Add Phase 1 modules to index.html

In `index.html`, immediately before the main inline `<script>` block,
after the Phase 0 `<script>` tags, add in this exact order:

```html
<!-- Phase 0 (already there) -->
<script src="./ddp-cities.js"></script>
<script src="./ddp-state.js"></script>
<script src="./ddp-audio.js"></script>
<!-- Phase 1 -->
<script src="./ddp-db.js"></script>
<script src="./ddp-habits.js"></script>
<script src="./ddp-notify.js"></script>
<script src="./ddp-hijri.js"></script>
<script src="./ddp-i18n.js"></script>
```

Add all six filenames to `scripts/prepare-mobile-build.js` `files` array.
Add them all to `APP_SHELL` in `sw.js`.

---

## Task P1-3 — App boot sequence (edit inline script)

Find the app's root component `onCreate` / `useEffect` boot block and replace/extend it:

```javascript
// PHASE 1 BOOT (runs once after mount)
async function ddpBoot() {
  // 1. Migrate any legacy localStorage surah downloads → IndexedDB
  const moved = await DDP_DB.migrateLegacy();
  if (moved > 0) console.log("[ddp] Migrated", moved, "surahs from localStorage");

  // 2. Load Quran bundle if not already loaded (first install only, ~3s on 4G)
  const bundleLoaded = await DDP_DB.get("kv", "bundle_loaded");
  if (!bundleLoaded) {
    await loadQuranBundle(); // see Task P1-4
  }

  // 3. Apply saved language / direction
  DDP_I18N.apply();

  // 4. Show onboarding if never completed
  const onboardDone = localStorage.getItem("ddp_onboard_v1");
  if (!onboardDone) {
    setScreen("onboarding"); // sets React state
    return; // onboarding flow will call ddpPostOnboard() on completion
  }

  // 5. Restore last screen/position (Phase 0)
  const saved = DDP_STATE.get();
  if (saved.tab) setTab(saved.tab);
  if (saved.surah) openSurah(saved.surah, saved.ayah || 1);

  // 6. Schedule notifications if needed
  if (DDP_NOTIFY.needsRefresh()) {
    const granted = await DDP_NOTIFY.requestPermission();
    if (granted) schedulePrayerNotifications(); // see Task P1-7
  }

  // 7. Recalculate streak (async, updates localStorage for dashboard read)
  DDP_HABITS.recalcStreak();
}

async function ddpPostOnboard() {
  // Called when user completes the 3-screen onboarding
  localStorage.setItem("ddp_onboard_v1", "1");
  await schedulePrayerNotifications();
  setScreen("dashboard");
}
```

---

## Task P1-4 — Quran bundle loader (add to inline script)

```javascript
async function loadQuranBundle() {
  // Show a one-time "Setting up offline Qur'an (approx 3 MB)…" screen
  // This only runs ONCE on first install (or after a data clear)
  setDownloadStatus("loading");
  try {
    const r = await fetch("./quran-bundle.json.gz");
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();
    const keys = Object.keys(data.surahs);
    for (let i = 0; i < keys.length; i++) {
      await DDP_DB.set("quran", parseInt(keys[i]), data.surahs[keys[i]]);
      if (i % 10 === 9) setDownloadProgress(Math.round(((i+1)/114)*100));
    }
    await DDP_DB.set("kv", "bundle_loaded", { at: Date.now(), version: data.version });
    setDownloadStatus("done");
  } catch (err) {
    setDownloadStatus("error"); // show retry button
    console.warn("[ddp] Bundle load failed:", err);
  }
}
```

**Run the generator first** (one-time, in your dev environment):
```bash
node scripts/build-quran-bundle.js
# Writes dist/quran-bundle.json.gz (~2.8 MB gzipped)
```
Add `dist/quran-bundle.json.gz` and `dist/quran-index.json` to `prepare-mobile-build.js` `dist` copy list.

---

## Task P1-5 — Replace surah fetching with IndexedDB reads (edit inline script)

Find every `fetch("https://api.alquran.cloud/v1/surah/...")` call in the app and replace:

```javascript
// BEFORE (network fetch, breaks offline)
async function loadSurah(num, edition) {
  const r = await fetch(`https://api.alquran.cloud/v1/surah/${num}/${edition}`);
  return r.json();
}

// AFTER (IndexedDB first, network fallback)
async function loadSurah(num) {
  // Try IndexedDB (populated by bundle on first install)
  const cached = await DDP_DB.get("quran", num);
  if (cached && cached.ayahs && cached.ayahs.length > 0) return cached;

  // Network fallback (for users who cleared storage or edge cases)
  try {
    const [arR, enR, urR] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${num}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/en.sahih`),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/ur.jalandhry`)
    ]);
    const [arD, enD, urD] = await Promise.all([arR.json(), enR.json(), urR.json()]);
    const surah = assembleSurah(num, arD.data, enD.data, urD.data);
    await DDP_DB.set("quran", num, surah); // cache for next time
    return surah;
  } catch (e) {
    throw new Error("offline_no_data");
  }
}

// assembleSurah: merge three API responses into the app's internal format
function assembleSurah(num, ar, en, ur) {
  return {
    number: num,
    nameAr: ar.name,
    nameEn: ar.englishName,
    nameTr: ar.englishNameTranslation,
    ayahCount: ar.numberOfAyahs,
    bismillah: num !== 1 && num !== 9,
    ayahs: ar.ayahs.map((a, i) => ({
      n: a.numberInSurah,
      g: a.number,
      ar: a.text,
      en: en.ayahs[i] ? en.ayahs[i].text : "",
      ur: ur.ayahs[i] ? ur.ayahs[i].text : ""
    }))
  };
}
```

Also update the `isDownloaded(num)` check to query `DDP_DB.get("quran", num)` instead of `localStorage.getItem("ddp_q_" + num)`.

---

## Task P1-6 — Three-screen onboarding (new component in inline script)

Add a React component `Onboarding` that renders when `screen === "onboarding"`:

**Screen 1 — Language** (big buttons, native script, no icons needed)
```
┌─────────────────────────────┐
│    Deen o Dunya  /  دین و دنیا  │
│                              │
│  [ English ]  [ اردو ]  [ العربية ] │
│                              │
│  (tap your language)         │
└─────────────────────────────┘
```
- On tap: call `DDP_I18N.setLang(lang)` → document dir updates → proceed to screen 2.
- All three buttons show their text in THEIR OWN script (English in Latin, Urdu in Nastaliq, Arabic in Arabic).

**Screen 2 — City** (searchable list, Pakistan cities at top)
```
┌─────────────────────────────┐
│  [ Search city…            ] │
│                              │
│  Karachi, Pakistan           │
│  Lahore, Pakistan            │
│  Islamabad, Pakistan         │
│  ...                         │
│  [ Use GPS instead ]         │
└─────────────────────────────┘
```
- List fed by `DDP_CITIES.all()` (Pakistan cities first, already in ddp-cities.js order).
- On pick: `DDP_LOC.save(city)` + recompute prayer times + auto-set calculation method.
- "Use GPS" triggers geolocation with a single permission prompt.

**Screen 3 — Ready** (summary, one-tap confirmation)
```
┌─────────────────────────────┐
│         ✓ All Set!           │
│                              │
│  City: Karachi, Pakistan     │
│  Method: Karachi             │
│  Fajr today: 4:23 AM         │
│                              │
│  [ Start using the app ]     │
└─────────────────────────────┘
```
- On tap: calls `ddpPostOnboard()`.
- On this screen only: show a gentle notification opt-in: "Get prayer time reminders?" [Yes / No thanks]

---

## Task P1-7 — Wire prayer notification scheduling (edit inline script)

```javascript
async function schedulePrayerNotifications() {
  // Compute prayer times for the next 7 days using the existing calc in the app
  const loc = DDP_LOC.saved() || DDP_LOC.smartDefault();
  const prayerTimesMap = {}; // { "2026-07-03": { fajr: Date, dhuhr: Date, ... }, ... }

  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    // Use whatever prayer calc function already exists in the inline script:
    const times = computePrayerTimes(d, loc.lat, loc.lon, loc.method || "karachi");
    const key = d.toISOString().slice(0, 10);
    prayerTimesMap[key] = times;
    // Also schedule evening nudge for today
    if (i === 0) {
      const today_day = await DDP_HABITS.getDay();
      const sc = DDP_HABITS.score(today_day);
      await DDP_NOTIFY.scheduleEveningNudge(times.isha, sc.done, sc.total);
    }
  }

  await DDP_NOTIFY.scheduleAll(prayerTimesMap);

  // Jum'ah summary
  const streak = DDP_HABITS.getStreak();
  await DDP_NOTIFY.scheduleJumahSummary(streak, 75); // 75% placeholder; compute real weekly avg
}
```

Call `schedulePrayerNotifications()`:
- On first run (after onboarding)
- On location change
- On boot if `DDP_NOTIFY.needsRefresh()` is true

---

## Task P1-8 — Daily ring dashboard component (edit DashboardScreen)

Replace the current flat prayer-time list on the dashboard with the Daily Ring layout:

**Layout (top → bottom):**
1. Hijri + Gregorian date header (use `DDP_HIJRI.format(new Date(), lang, {short:true})`)
2. **Next Prayer Card** — large countdown timer, prayer name in Arabic/Urdu/English, location name (keep existing logic, just reskin)
3. **Daily Ring** — SVG ring of 8 segments (5 prayers + Quran + morning azkar + evening azkar). Filled segments in emerald, empty in light grey. Centre shows `done/8`. Below ring: streak count.
4. Three large tappable rows (labelled with `DDP_I18N.t(...)`, Urdu in Nastaliq):
   - **Today's Ṣalāh** → opens SalahLogScreen (5 prayer circles, tap to mark)
   - **Today's Qur'an** → opens surah from khatm plan position if set, else surah list
   - **Today's Adhkār** → opens AzkarScreen with morning/evening toggle

**Daily ring SVG component** (simplified spec):

```javascript
function DailyRing({ done, total, streak }) {
  const R = 52, CX = 64, CY = 64;
  const GAP = 4; // degrees between segments
  const segDeg = (360 / total) - GAP;
  const segments = Array.from({ length: total }, (_, i) => {
    const startA = i * (360 / total) - 90; // start from top
    const endA = startA + segDeg;
    const filled = i < done;
    // convert to SVG arc path
    const toRad = a => a * Math.PI / 180;
    const x1 = CX + R * Math.cos(toRad(startA));
    const y1 = CY + R * Math.sin(toRad(startA));
    const x2 = CX + R * Math.cos(toRad(endA));
    const y2 = CY + R * Math.sin(toRad(endA));
    const large = segDeg > 180 ? 1 : 0;
    return (
      React.createElement("path", {
        key: i,
        d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
        stroke: filled ? "#059669" : "#d1fae5",
        strokeWidth: 10,
        fill: "none",
        strokeLinecap: "round"
      })
    );
  });
  return React.createElement("svg", { width: 128, height: 128, viewBox: "0 0 128 128" },
    ...segments,
    React.createElement("text", { x: CX, y: CY + 5, textAnchor: "middle", fontSize: 18,
      fill: "#059669", fontFamily: "Newsreader,serif" }, done + "/" + total),
    streak > 0 && React.createElement("text", { x: CX, y: CY + 22, textAnchor: "middle",
      fontSize: 10, fill: "#6b7280" }, streak + " day streak")
  );
}
```

---

## Task P1-9 — Khatm plan (edit QuranScreen)

On first open of the Qur'an tab (when `DDP_HABITS.getKhatm() === null`):

Show a single bottom sheet (not a full screen):
```
  How would you like to complete the Qur'an?

  [ 30 days ]  [ 3 months ]  [ 1 year ]  [ My own pace ]
  
  ( Dismissible — "I'll decide later" )
```
- On pick: call `DDP_HABITS.setKhatm(pace)`.
- On next open and always after: show a "Today's portion" card above the surah list:
  ```
  Today: Sūrah Al-Baqarah, Āyāt 1–18  ▶  Continue
  [=========>        ] 8% complete · 327 days left
  ```
  Tapping "Continue" opens the surah at the correct ayah and after reading calls `DDP_HABITS.advanceKhatm(ayahsRead)`.

---

## Task P1-10 — Hijri date in dashboard header (edit DashboardScreen)

Replace the static date string with:
```javascript
const lang = DDP_I18N.lang();
const hijri = DDP_HIJRI.format(new Date(), lang);
const occasions = DDP_HIJRI.upcomingOccasions(new Date());
// Show hijri string below the Gregorian date
// If occasions[0] exists and daysAway <= 3, show a gentle banner:
// "Ramadan begins in 3 days — الحمد للہ"
```

In Settings → add a "Hijri Date Adjustment" row:
- Options: −2 / −1 / 0 / +1 / +2 days
- Calls `DDP_HIJRI.setOffset(n)`
- Default: 0 (Gulf calculation matches most global Islamic calendars)
- Explanation text: "Adjust if your local moon-sighting differs from the calculated date"

---

## Task P1-11 — Trilingual UI wiring (edit ALL screen components)

1. At the top of the inline script, after the modules load, bind the language event:
```javascript
window.addEventListener("ddp:langchange", function () {
  // Force React re-render by updating a top-level state atom
  setAppLang(DDP_I18N.lang());
});
```

2. Every hardcoded English string in the UI must be replaced with `DDP_I18N.t("key")`.
   The full string table is in `ddp-i18n.js`. Mapping:
   - "Dashboard" → `t("dashboard")`
   - "Prayer Times" → `t("prayer_times")`
   - "Next Prayer" → `t("next_prayer")`
   - "Today's Salah" → `t("todays_salah")`
   - "Today's Qur'an" → `t("todays_quran")`
   - "Today's Adhkār" → `t("todays_azkar")`
   - … (all keys are in ddp-i18n.js `STRINGS` object)

3. Wherever a layout container has `flexDirection:"row"`, change to:
   `flexDirection: DDP_I18N.dir() === "rtl" ? "row-reverse" : "row"`
   This mirrors icons + text correctly in Arabic/Urdu.

4. Bottom nav labels: always show in the selected language using `t()`.

5. In Settings → add "Language" row (first item):
   Three buttons: **English** / **اردو** / **العربية**
   On tap: `DDP_I18N.setLang(l)` — document dir updates instantly.

---

## Task P1-12 — Service worker update (sw.js)

Add to `APP_SHELL`:
```javascript
"./ddp-db.js",
"./ddp-habits.js",
"./ddp-notify.js",
"./ddp-hijri.js",
"./ddp-i18n.js",
"./quran-bundle.json.gz",
"./dist/quran-index.json",
"./assets/audio/adhan-makkah.mp3",
"./assets/audio/adhan-madinah.mp3"
```
Bump VERSION to "v17".

---

## Task P1-13 — Settings screen additions

Add these rows to SettingsScreen (in order, grouped):

**Appearance**
- Language (Task P1-11 step 5)
- Text Size (Phase 0 Task 8 — already specified)

**Prayer**
- City & Location (Phase 0 Task 9 — already specified)
- Calculation Method (existing — keep)
- Asr Juristic Method (existing — keep)
- Hijri Date Adjustment (Task P1-10)
- Prayer Notifications → sub-screen with per-prayer toggles + sound choice (from `DDP_NOTIFY.getPrefs()`)

**Qur'an**
- Khatm Plan — shows current pace + "Change" button
- Reciter — existing selector (keep)

**About**
- Version (existing)
- Attribution: "Arabic: tanzil.net (CC BY ND 3.0) · English: Saheeh International · Urdu: Jalandhry"
- Privacy Policy link (existing)

---

## Task P1-14 — Version bump + test build

```bash
npm run prepare:mobile
npx cap sync android
# android/app/build.gradle: versionCode 3, versionName "1.2.0"
```

**Acceptance test checklist (full Phase 1):**
- [ ] Fresh install, no internet → onboarding appears → pick Urdu + Lahore → app in Urdu RTL, prayer times correct
- [ ] Qur'an tab → all 114 surahs open instantly with no network (bundle loaded)
- [ ] Pick khatm plan "3 months" → today's portion card shows correct surah/ayah range
- [ ] Mark 5 prayers + open Qur'an + tap morning azkar done → ring shows 7/8 filled
- [ ] Ring fully complete → shows "الحمد للہ" / "Alhamdulillah" completion state
- [ ] Wait for a prayer time (or mock one by setting device clock) → adhan notification sounds with adhan audio when app is CLOSED
- [ ] Hijri date shows correctly on dashboard; change offset → updates immediately
- [ ] Settings → Language → switch EN/UR/AR → whole UI switches including RTL mirroring
- [ ] Streak: complete two days in a row → streak = 2 on dashboard
- [ ] Upgrade build to versionCode 3, upload to Play internal testing track

---

## Phase 2 preview (next session)

Once Phase 1 ships to testers:
- **AdMob category blocking** (configure before any wider release)
- **Virtulized ayah list** (fix jank on Al-Baqarah on low-RAM phones)
- **Tafsir packs** (downloadable per-mufassir, pending your answer on bundled text provenance)
- **Home screen widget** (Android — next prayer countdown + ring)
- **Jum'ah summary notification** (weekly habit review)
- **iOS build** (Capacitor already supports it; just needs an Apple account)
- **Kids mode** (large text, simple duas, colour-in ring for younger children)
