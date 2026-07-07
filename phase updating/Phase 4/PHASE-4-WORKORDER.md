# Deen o Dunya Planner — Phase 4 Work Order

**Prerequisite:** Phases 0–3 in progress/shipped. (You confirmed: partly shipped — prioritize finishing Phase 0 fixes to testers.)
**Built this round (unblocked, high-value):** Ramadan mode, offline full-text search.
**Also delivered:** Migration assessment (decision doc), blocked-items map (below).
**Modules:** ddp-ramadan.js, ddp-search.js

Add both to index.html script tags, `prepare-mobile-build.js`, `sw.js` APP_SHELL (bump SW to v19).

---

# PART 1 — RAMADAN MODE

`ddp-ramadan.js` — depends on `ddp-hijri.js`, `ddp-habits.js`, `ddp-db.js`.

**Key design decision (from date research):** Ramadan dates are NOT hardcoded. Sources disagree by up to 10 days for any given year because start depends on regional moon-sighting. The module DERIVES Ramadan from your Hijri engine (Hijri month == 9) using the user's existing regional offset. Result: it auto-activates correctly every year, forever, with no code update, and respects each user's local convention.

## Task P4-1 — Auto-activation + pre-Ramadan countdown
On boot and daily rollover:
```javascript
const rs = DDP_RAMADAN.ramadanStatus();        // {inRamadan, day, hijriYear}
if (rs.inRamadan) {
  enableRamadanUI(rs.day);                       // day 1..30
} else {
  const days = DDP_RAMADAN.daysUntilRamadan();   // null if >60 days away
  if (days !== null && days <= 40) showRamadanCountdownBanner(days);
}
```
Ramadan UI = a themed dashboard variant (deeper emerald/gold, a crescent motif) — visual only, same components.

## Task P4-2 — Suhoor & Iftar card (the daily anchor)
On the dashboard during Ramadan, replace/augment the next-prayer card with a Suhoor/Iftar card:
```javascript
const times = computePrayerTimes(new Date(), loc.lat, loc.lon, loc.method); // existing calc
const si = DDP_RAMADAN.suhoorIftar(times, new Date());
// si.imsak, si.iftar, si.nextLabel ("Suhoor ends" | "Iftar"), si.secondsToTarget
renderCountdown(si.nextLabel, si.secondsToTarget);   // live ticking countdown
```
Imsak = Fajr − N minutes (N configurable in Settings, default 10; `DDP_RAMADAN.setImsakMinutes`). Show both Suhoor-ends and Iftar times for the day, with the next one emphasized and counting down.

## Task P4-3 — Fasting log
A Ramadan calendar screen (30 day cells). Each day: tap to set **fasted / missed / exempt** (exempt reasons: travel, illness, menses, pregnancy/nursing, other).
```javascript
DDP_RAMADAN.markFast(rs.hijriYear, day, "fasted");
DDP_RAMADAN.markFast(rs.hijriYear, day, "exempt", "travel");
```
Stored by **Hijri year+day** so it survives across Gregorian years and future Ramadans. Show a summary: fasted / missed / exempt / make-up owed (`DDP_RAMADAN.ramadanSummary(hijriYear)` → `makeUpOwed`). This "make-up owed" counter is genuinely useful and nobody's competitor does it well.

## Task P4-4 — Taraweeh + daily ring integration
- Add a "Taraweeh prayed" toggle each night: `DDP_RAMADAN.markTaraweeh(hijriYear, day)`.
- During Ramadan, add taraweeh as a 9th segment to the daily ring (or swap it in), so the habit loop reflects Ramadan worship.

## Task P4-5 — Last ten nights + Laylat al-Qadr
```javascript
if (DDP_RAMADAN.isLastTenNights()) highlightLastTen();      // day >= 21
if (DDP_RAMADAN.isOddLastTenNight()) showQadrReminder();    // 21,23,25,27,29
```
On odd nights of the last ten, a gentle notification (reuse `ddp-notify`) + a dashboard highlight encouraging extra worship. Keep tone encouraging, never guilt-based (consistent with the app's ethic).

**Acceptance:** set device clock into Ramadan (Hijri month 9) → Ramadan UI activates, suhoor/iftar countdown correct, fasting log persists, last-ten-nights highlight appears on day 21+.

---

# PART 2 — OFFLINE FULL-TEXT SEARCH

`ddp-search.js` — depends on the Phase 1 Qur'an bundle already in IndexedDB.

## Task P4-6 — Build the index (once, lazily)
On first use of search (not on boot — keep boot fast):
```javascript
await DDP_SEARCH.buildIndex(pct => showIndexProgress(pct));  // ~2-5s first time on cheap phones
// cached in IndexedDB; subsequent launches are instant
```
The index is an inverted map (token → ayah ids) across Arabic, English, Urdu. Built sequentially surah-by-surah to keep memory low on budget devices.

## Task P4-7 — Search UI
A search screen (magnifier in Qur'an tab):
```javascript
const results = await DDP_SEARCH.search(query, { lang: "all", limit: 50 });
// each result: {surah, surahName, ayah, gid, score, ar, en, ur}
```
- Language filter chips: All / العربية / English / اردو.
- **Arabic works WITHOUT harakat** — the normalizer strips diacritics and unifies alif/hamza/ya, so users type "الرحمن" and match "الرَّحْمٰن". This is a real usability win — Islam 360 users complain about needing exact diacritics.
- Urdu normalizes Arabic vs Urdu yeh/keheh so both keyboards work.
- Tapping a result opens that surah at that ayah (reuse `vlist.scrollToIndex`).
- Highlight the matched term in the result snippet.

**Acceptance:** offline (airplane mode), search "رحمن" (no harakat) → returns Ar-Rahman ayahs; search "mercy" → returns English matches; search Urdu term → returns Urdu matches; tapping a result jumps to the ayah.

## Task P4-8 (later) — Extend search to hadith
Once hadith packs (Phase 3) are licensed and downloaded, the same index pattern extends to hadith text. Add a `buildHadithIndex()` mirroring `buildIndex()` over downloaded collections. Deferred until hadith licensing clears.

---

# PART 3 — ARCHITECTURE MIGRATION DECISION

See `MIGRATION-ASSESSMENT.md` (separate doc). **Summary: do NOT migrate to Flutter now.** You've already neutralized the main WebView risk (list jank) with `ddp-vlist` + `ddp-perf`. The disciplined move: ship Phases 0–2, **test on one real budget Android phone (~$80, the best money you can spend)**, and migrate only if specific measured triggers fire (unfixable jank after virtualization, cold-start/OOM ceilings, or a feature the WebView can't do like camera-AR/on-device ML). If you ever do migrate, port data + logic-as-spec, never a big-bang rewrite. The assessment lists the exact trigger conditions and the safe migration sequence.

---

# PART 4 — BLOCKED-ITEMS MAP (what to unblock, and how)

These Phase 4/5 features are genuinely valuable but blocked on a decision or dependency only you can resolve. Here's each, what blocks it, and the smallest next step to unblock.

### 1. Tafsir packs (Ghamidi / Islahi / Maududi)
- **Blocked on:** your permission requests to Al-Mawrid, the Maududi estate, and Islahi's publisher (you're handling these).
- **Unblock step:** when any rights-holder grants permission, the Phase 2 tafsir-pack architecture (downloadable packs into IndexedDB, `cleared:true` gating) is ready to receive the content. Until then, ship public-domain tafsir (Ibn Kathir, Jalalayn) so the feature isn't empty.
- **Status:** architecture done, content gated on permissions.

### 2. Duas & Adhkar expansion (full Hisnul Muslim, categorized)
- **Blocked on:** translation licensing. The Arabic is public domain; specific English/Urdu translations of Hisnul Muslim are often copyrighted.
- **Unblock step:** choose a translation you can distribute — either a public-domain/creative-commons translation, or request permission from the translator/publisher. Then the data slots into the existing azkar structure.
- **Effort once unblocked:** low (it's a data addition).

### 3. Mosque / halal finder
- **Blocked on:** a data-source + cost decision. Google Places API works but costs money at scale (per-request billing) — a problem for a free app with Pakistan volume.
- **Options to weigh:** (a) OpenStreetMap/Overpass API (free, community data, patchy coverage in some areas), (b) Google Places (best data, costs money — could gate behind the "remove ads"/supporter tier), (c) skip it (many prayer apps don't have it).
- **Unblock step:** decide free-vs-paid data and whether it's core. If OSM coverage is acceptable in your target cities, it's buildable free.

### 4. Ramadan prayer-time notifications specific to suhoor/iftar
- **Blocked on:** nothing technical — just sequencing after Ramadan mode ships. Reuses `ddp-notify` with suhoor/iftar times from `ddp-ramadan`.
- **Unblock step:** after P4-2, schedule a suhoor-ending reminder (imsak − 30 min) and an iftar reminder at Maghrib. Small addition.

### 5. Apple Watch / Wear OS complications
- **Blocked on:** platform scope + effort priority. These are native (Swift/Kotlin), outside the WebView, real additional work.
- **Unblock step:** defer until the phone apps are stable on both stores and you have user demand. Low priority vs. everything above.

### 6. Native-speaker QA (Arabic + Urdu UI)
- **Blocked on:** finding reviewers (not technical).
- **Unblock step — HIGH PRIORITY before public launch:** get one native Arabic and one native Urdu speaker to review every UI string (`ddp-i18n.js` STRINGS) for idiomatic, religiously-appropriate phrasing. My i18n groundwork is solid but human review of religious terminology is non-negotiable before a non-testing release. This is the cheapest, highest-trust-impact item on the list.

---

# BUILD + TEST (Phase 4)
```bash
node scripts/build-quran-bundle.js        # if not already built (search needs the bundle)
npm run prepare:mobile && npx cap sync
# Android: versionCode 6, versionName "1.5.0"
```

**Acceptance checklist:**
- [ ] Ramadan mode auto-activates when Hijri month = 9 (test via device clock); correct fast day number
- [ ] Suhoor/iftar countdown correct against known local times; imsak offset configurable
- [ ] Fasting log persists by Hijri year+day; make-up-owed counter correct
- [ ] Taraweeh toggle works; ring reflects it during Ramadan
- [ ] Last-ten-nights highlight + odd-night Qadr reminder appear correctly
- [ ] Offline search returns Arabic results WITHOUT harakat; English + Urdu work; tap jumps to ayah
- [ ] Search index builds once, caches, is instant on second use
- [ ] Migration assessment reviewed; a real budget phone acquired for testing
- [ ] Native-speaker QA scheduled before any public launch

---

# What "state of the art" looks like from here

You now have, across Phases 0–4, a coherent product:
- **Fixed** every tester complaint (speed, adhan, interruption, fonts, location).
- **Offline-first** Qur'an, audio, search, Hijri, prayer times — the decisive edge in Pakistan and Islam 360's weakest area.
- **Trilingual** EN/AR/UR with real RTL.
- **A habit layer** (daily ring, streaks, khatm, Ramadan) that no major competitor owns.
- **Ethical monetization** (category-blocked ads, cheap remove-ads, sadaqah) that contrasts with Muslim Pro's privacy history and Islam 360's ad complaints.
- **Kids mode, tasbeeh, qibla** for breadth across age groups.
- **A clear-eyed architecture decision** documented rather than guessed.

The remaining work is mostly **content licensing** (tafsir, hadith, duas — trust-critical, yours to clear) and **human QA** (native-speaker review) — not more engineering. The single most important thing left is not a feature at all: **ship what you've built to testers, and test it on a real cheap phone.** Everything else is refinement on a foundation that's now genuinely competitive.
