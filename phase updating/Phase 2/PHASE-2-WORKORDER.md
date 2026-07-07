# Deen o Dunya Planner — Phase 2 Work Order

**Prerequisite:** Phases 0 and 1 shipped and verified.
**Priority order (per your ranking):** 1) Performance · 2) AdMob safety + revenue · 3) Widget · 4) Tafsir architecture (lawful).

**Modules delivered:** ddp-vlist.js, ddp-perf.js, ddp-ads.js, ddp-purchase.js, NextPrayerWidget.java, widget_next_prayer.xml, next_prayer_widget_info.xml

---

# PART 1 — PERFORMANCE (your #1)

## Task P2-1 — Virtualize the ayah list

Add `ddp-vlist.js` and `ddp-perf.js` to index.html script tags (before main inline script) and to `prepare-mobile-build.js` + `sw.js` APP_SHELL.

In `ReadingView`, replace the "map over all ayahs and render every card" logic with the virtual list. The key change: instead of returning a big array of AyahCard elements into JSX, render into a plain container div via `DDP_VLIST`.

Because the app uses `React.createElement`, the cleanest integration is a thin bridge: render each ayah card to a detached DOM node using `ReactDOM.render` into a throwaway container, OR (simpler) refactor `AyahCard` to a pure DOM-building function `renderAyahCardDOM(ayah, index)` that returns an `HTMLElement`. The latter avoids React reconciliation cost entirely on the hot path — best for low-end devices.

```javascript
// In ReadingView, after surah loads:
const profile = DDP_PERF.profile();               // device-aware tuning
const scrollEl = document.getElementById("reading-scroll");
const listEl   = document.getElementById("reading-list");

const vlist = DDP_VLIST.create({
  container: scrollEl,
  count: surah.ayahs.length,
  estimateHeight: 220,
  overscan: profile.overscan,                     // 2 on low-end, 6 on high-end
  renderRow: (i) => renderAyahCardDOM(surah.ayahs[i], i),
  onRangeChange: (start, end) => {
    // preload next ayah audio just ahead of the viewport
    const nextGid = surah.ayahs[Math.min(end, surah.ayahs.length - 1)].g + 1;
    DDP_AUDIO.preload(DDP_AUDIO.ayahSources(nextGid));
  }
});
vlist.mount(listEl);

// Resume position (Phase 0/1): jump to saved ayah
const saved = DDP_STATE.get();
if (saved.surah === surah.number && saved.ayah) {
  vlist.scrollToIndex(saved.ayah - 1);
}
```

**`renderAyahCardDOM(ayah, index)`** must build the same visual card the app already renders, but as raw DOM: Arabic line (Amiri/Uthmani font, `--ddp-scale` applied), English line, Urdu line (Nastaliq), and the small controls row (play, bookmark, copy). Keep the existing styles; just output DOM nodes. Attach the play button to `DDP_AUDIO.play(DDP_AUDIO.ayahSources(ayah.g), { onEnded: () => playNext(index) })`.

**Acceptance:** open Al-Baqarah on a 2GB-RAM emulator profile → scrolling stays smooth (no multi-hundred-ms frame drops); memory stays flat as you scroll (rows unmount).

## Task P2-2 — Apply device-tier tuning

At boot: `const perf = DDP_PERF.profile();` and use it across the app:
- Disable non-essential CSS transitions/animations when `perf.animations === false`.
- Skip box-shadows on cards when `perf.shadowEffects === false` (shadows are expensive to composite on weak GPUs).
- Set audio bitrate default from `perf.audioBitrate` (ddp-audio already picks 64k on slow networks; this adds a device-based reason too).
- Call `DDP_PERF.preloadFonts()` once on boot (after Phase 0 self-hosted the fonts).

## Task P2-3 — Yield heavy work off the main thread

Anywhere the app builds a big list synchronously (surah index of 114, azkar lists), wrap in `DDP_PERF.chunkedForEach(items, 20, buildOne, done)` so the UI stays responsive during first paint on slow CPUs. Use `DDP_PERF.debounce` on the surah-search input (150ms) and `DDP_PERF.throttle` on any scroll-driven header effects (100ms).

---

# PART 2 — ADMOB SAFETY + REVENUE (your #2)

## Task P2-4 — Configure the AdMob CONSOLE (do this FIRST, before any code)

**This is the step that actually prevents haram ads.** Request-level flags are a backstop; the console is the primary control. In the AdMob web console:

1. **Block ad categories** (Blocking controls → Block ad categories). Block at minimum:
   - Gambling & Betting
   - Dating
   - Alcohol
   - Sexual & Suggestive
   - Astrology & Esoteric (shirk-adjacent — important for this audience)
   - Get Rich Quick
   - Politics (avoids inflammatory content)
   - References to Sensitive Events
   - Religion (blocks rival/sectarian and non-Islamic religious promos inside a worship app)
2. **Set maximum ad content rating to "G" (General audiences).**
3. **Block sensitive URLs / advertiser URLs** as they appear in reports.
4. **Enable the "Blocking controls → Sensitive categories" review** and check the ad review center weekly for the first month. Manually block any creative that slips through.
5. Set the app's **content rating** and **COPPA / audience** correctly: general audience, not child-directed (but max rating G covers minors in the audience).
6. Create two ad units: one **Adaptive Banner**, one **Native Advanced**. Copy their IDs into `ddp-ads.js` `UNITS`.

Document this in `docs/admob-safety-config.md` and re-verify after any AdMob policy change.

## Task P2-5 — Wire the ads manager

Install plugin: `npm i @capacitor-community/admob && npx cap sync android`.

Add `ddp-ads.js` and `ddp-purchase.js` to script tags + build + SW.

In boot sequence:
```javascript
await DDP_ADS.init();
await DDP_ADS.requestConsent();          // UMP consent (EU/privacy)
await DDP_PURCHASE.init();               // restores prior "remove ads"
DDP_ADS.bindAudioGuard(() => currentScreenId);   // hide ads during any audio
```

**The central rule:** the app must call `DDP_ADS.onScreenChange(screenId)` on EVERY screen transition. That single function is the gate — it refuses to show a banner on any worship screen (`reading`, `quran`, `azkar`, `prayer`, `qibla`, `onboarding`) and while audio plays. Do not call `showBanner` directly anywhere else.

**Placement:** banner is `BOTTOM_CENTER` with a 56px margin so it sits ABOVE the bottom nav, never overlapping it. Allowed screens only: dashboard, tasks, settings, more, surah_list.

**No interstitials** in Phase 2. (If ever added later: only after a non-worship action, off by default, frequency-capped. Not now.)

## Task P2-6 — Remove-ads purchase + donation

1. In Play Console → Monetize → Products → In-app products, create a **non-consumable** `remove_ads`. Use **tiered/regional pricing**: keep Pakistan low (e.g. ~PKR 150–300), higher in US/EU/Gulf. AdMob eCPMs in Pakistan are very low, so this + donations will out-earn ads among your core users.
2. Install a billing plugin (`@capacitor-community/in-app-purchases` for a single product, or RevenueCat if you expect tiers later) and complete the two TODOs in `ddp-purchase.js`.
3. Settings → add two rows:
   - **Remove ads** — shows localized price from `DDP_PURCHASE.getPrice()`; on tap `DDP_PURCHASE.buy()`; on success the ad guard stops all banners immediately. Add a "Restore purchase" row too (required by Play policy).
   - **Support the app (Sadaqah)** — opens a donation link (your choice: a hosted donation page / bank / JazzCash-Easypaisa). Keep this separate from remove-ads; some users will give without wanting anything removed.

**Revenue expectation, honest:** with Pakistan as the core market, ads alone will be pennies. The realistic model is: light banners for casual users, a cheap one-time remove-ads for committed users, and a visible sadaqah channel. The 2026 winners in this category lead with "ad-free / privacy-first" as a *feature* — you can market "respectful, minimal ads, one-time removal, no data selling" as a direct contrast to Muslim Pro's history and Islam 360's ad complaints.

---

# PART 3 — HOME-SCREEN WIDGET (your #3)

## Task P2-W — Next Prayer widget

Widgets are native Android and live outside the WebView. Files provided:
- `NextPrayerWidget.java` → `android/app/src/main/java/com/deenodunya/planner/`
- `widget_next_prayer.xml` → `android/app/src/main/res/layout/`
- `next_prayer_widget_info.xml` → `android/app/src/main/res/xml/`

Additional native bits to create:
1. **Drawables** in `res/drawable/`:
   - `widget_bg.xml` — a rounded-rect shape, solid emerald `#059669` (or a subtle gradient to `#047857`), 20dp corner radius.
   - `widget_ring_bg.xml` — a circle/oval stroke, emerald tint, for the mini ring badge.
   - `widget_preview.png` — a static preview image for the widget picker.
2. **String** in `res/values/strings.xml`:
   `<string name="widget_description">Next prayer time & today's progress</string>`
3. **Register** in AndroidManifest.xml (inside `<application>`):
```xml
<receiver
    android:name=".NextPrayerWidget"
    android:exported="false">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/next_prayer_widget_info" />
</receiver>
```

4. **The data bridge (WebView → widget).** The widget reads SharedPreferences ("DDP_WIDGET"). The web app must write to it after each prayer-time recompute. Use `@capacitor/preferences` is NOT enough (different store). Simplest: a tiny custom Capacitor plugin `WidgetBridge` with one method:
```java
// WidgetBridgePlugin.java (Capacitor @PluginMethod)
@PluginMethod
public void update(PluginCall call) {
    SharedPreferences p = getContext().getSharedPreferences("DDP_WIDGET", Context.MODE_PRIVATE);
    p.edit()
      .putString("next_name", call.getString("name", "—"))
      .putString("next_time", call.getString("time", ""))
      .putString("next_in", call.getString("in", ""))
      .putString("city", call.getString("city", ""))
      .putInt("ring_done", call.getInt("ringDone", 0))
      .apply();
    NextPrayerWidget.updateAllWidgets(getContext());
    call.resolve();
}
```
Then from JS after each recompute:
```javascript
if (window.Capacitor?.Plugins?.WidgetBridge) {
  window.Capacitor.Plugins.WidgetBridge.update({
    name: next.name, time: next.timeStr, in: next.countdownStr,
    city: loc.label, ringDone: DDP_HABITS.score(await DDP_HABITS.getDay()).done
  });
}
```

**Acceptance:** add widget to home screen → shows next prayer + countdown + city + today's ring; updates within 30 min automatically and immediately after opening/using the app; tapping it opens the app.

**Phase 2.5 (optional):** a second larger widget with all 5 prayer times for the day.

---

# PART 4 — TAFSIR ARCHITECTURE (lawful) — your #4

**The situation, stated plainly:** you confirmed the bundled tafsir was typed from the published books of Ghamidi, Islahi, and Maududi. Typing it out yourself does not create a right to distribute it — **these works are under active copyright**:
- **Tafhim-ul-Qur'an** (Maududi) — copyright held by the Maududi estate / Islamic Publications Ltd.
- **Tadabbur-i-Qur'an** (Islahi, d. 1997) — under copyright; rights held by his publisher/estate.
- **Al-Bayan / Ghamidi's work** — published by **Al-Mawrid**; protected.

Distributing these in your app without permission exposes you to takedown and legal claims, and — more importantly for this app — a credibility hit if a rights-holder publicly objects.

**So the architecture must be permission-first. Three lawful paths, in order of preference:**

### Path A — Get written permission (best; also a trust asset)
Contact each rights-holder and request distribution permission for a free, non-commercial (or ad-supported — disclose it) Islamic app:
- **Ghamidi's work:** Al-Mawrid (al-mawrid.org) — they actively license Ghamidi content and run their own apps; they may say yes or point you to an official feed/API.
- **Maududi:** Islamic Publications Ltd. (Lahore) / the Maududi estate.
- **Islahi:** his publisher (Faran Foundation / Islahi's estate).
Written permission (even email) is *also a marketing asset* — "Tafsīr used with permission from Al-Mawrid" is exactly the kind of authenticity signal that beats Islam 360. If granted, THEN bundle as downloadable packs (architecture below).

### Path B — Use openly-licensed / public-domain tafsir instead (ship immediately)
Ship day-one with tafāsīr you can legally distribute, and add the copyrighted ones later only under Path A:
- **Tafsīr Ibn Kathīr** — classical, widely available in public-domain English/Urdu translations (verify the specific translation's license).
- **Tafsīr al-Jalālayn** — classical, public domain.
- **Maarif-ul-Qur'an (Mufti Shafi)** — check license; some editions permit free distribution.
- **quran.com / Quranic Research API** — offers several tafsir with clear usage terms; you already call quran.com's API at runtime. Use their sanctioned tafsir resources rather than bundling your own typed copies.
Ship these as legitimate content, and remove the typed Ghamidi/Islahi/Maududi text from the current build until Path A clears.

### Path C — Link out (fallback, zero risk)
For any copyrighted tafsir you don't have permission for, link to the rights-holder's own app/site (Al-Mawrid's app, etc.) instead of reproducing the text. Least satisfying UX, but zero legal exposure.

### The tafsir-pack architecture (once content is cleared via A or B)
Build tafsir as **downloadable packs into IndexedDB**, not bundled in the APK and not per-ayah network fetches:
```
tafsir store key: "surah:mufassirId"   (e.g. "2:ibnkathir")
Pack manifest (kv "tafsir_manifest"): list of available mufassirīn with
  { id, nameEn, nameUr, nameAr, license, sizeKB, source, cleared: true/false }
Download flow: user picks a mufassir → download whole-work pack (chunked, real
  progress) → store per-surah entries in IndexedDB → available offline.
Only show mufassirīn with cleared:true. The UI reads the manifest, so adding a
  newly-permitted mufassir is a data change, not a code change.
```

**Immediate action for THIS build:** remove the typed Ghamidi/Islahi/Maududi text now (Path B ships public-domain tafsir in its place), and pursue Path A permissions in parallel. I can draft the permission-request emails to Al-Mawrid, the Maududi estate, and Islahi's publisher whenever you want — that's the highest-leverage next step and it's free.

---

# BUILD + TEST

```bash
npm i @capacitor-community/admob @capacitor-community/in-app-purchases
node scripts/build-quran-bundle.js       # if not already done in Phase 1
npm run prepare:mobile && npx cap sync android
# build.gradle: versionCode 4, versionName "1.3.0"
```

**Full Phase 2 acceptance:**
- [ ] Al-Baqarah scrolls smoothly on a 2GB-RAM profile; memory flat while scrolling
- [ ] Device-tier tuning: animations/shadows off on low tier (test by forcing `deviceMemory`)
- [ ] Banner shows ONLY on dashboard/tasks/settings/more/surah_list; NEVER on reading/azkar/prayer/qibla
- [ ] Banner disappears the instant recitation or adhan plays; returns after, if on an allowed screen
- [ ] AdMob console: category blocks + max rating G verified; test ads show in dev, real ads gated to release
- [ ] Remove-ads purchase works; after buying, no banners anywhere; "Restore purchase" works on reinstall
- [ ] Donation row opens the sadaqah link
- [ ] Widget on home screen shows next prayer + countdown + city + ring; updates; tap opens app
- [ ] Typed Ghamidi/Islahi/Maududi tafsir REMOVED; only cleared/public-domain tafsir present
- [ ] versionCode 4 uploaded to Play internal testing

---

# Phase 3 preview
- iOS build (Capacitor already supports it; needs Apple Developer account)
- Downloadable audio manager (full-surah recitation offline, per-reciter)
- Vetted hadith with grading (replace community jsdelivr API)
- Kids mode (large text, simple duas, colour-in ring)
- Tasbeeh counter with haptics; Qibla AR compass
- Tafsir Path A packs as permissions clear
- Arabic UI QA pass with a native speaker; Urdu UI QA with a native speaker
