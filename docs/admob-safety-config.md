# AdMob Safety Configuration — Deen o Dunya Planner

**Last verified:** 2026-07-04  
**Status:** Console configuration REQUIRED before any production release with ads.

---

## Why This Matters

Muslim Pro lost user trust over haram ad categories appearing in a worship app. Islam 360 faces ongoing criticism for intrusive ads in prayer/Qur'an screens. We prevent both problems with **two layers**: AdMob console blocks (primary) + request-level flags (backstop in `ddp-ads.js`).

**The console configuration below is THE primary block.** Request flags alone cannot fully prevent inappropriate ads. Do not ship ads without completing the steps below.

---

## Step 1 — Block Ad Categories

In your [AdMob console](https://apps.admob.com/) → **Blocking controls** → **Block ad categories**:

Block ALL of the following:
- [ ] Gambling & Betting
- [ ] Dating
- [ ] Alcohol
- [ ] Sexual & Suggestive Content
- [ ] Astrology, Esoteric & Paranormal (shirk-adjacent — critical for Islamic audience)
- [ ] Get Rich Quick
- [ ] Politics
- [ ] References to Sensitive Events
- [ ] Religion (prevents rival/sectarian and non-Islamic religious promos inside a worship app)

---

## Step 2 — Content Rating

- [ ] Set **Maximum ad content rating** to **"G" (General audiences)**
- [ ] In **Settings** → App settings → set app content rating appropriately
- [ ] Confirm the app is NOT tagged as child-directed (COPPA). The app serves general audience; max rating G covers minors in the audience without marking it child-directed.

---

## Step 3 — Create Ad Units

- [ ] Create **Adaptive Banner** ad unit
- [ ] Create **Native Advanced** ad unit
- [ ] Copy both unit IDs into `ddp-ads.js` → `UNITS` object (replace the placeholder `XXXXXXXXXX`)

---

## Step 4 — Sensitive Categories + Ad Review

- [ ] Enable **Blocking controls → Sensitive categories** review
- [ ] Check the **Ad review center** weekly for the first month
- [ ] Manually block any advertiser URL or creative that slips through
- [ ] Set up email notifications for new creatives pending review

---

## Step 5 — Verification Checklist

Before any production build:
- [ ] All 9 categories blocked in console
- [ ] Max ad content rating set to G
- [ ] Real ad unit IDs pasted into `ddp-ads.js`
- [ ] Test ads show in dev builds (Google test IDs active when `location.hostname === "localhost"` or `localStorage "ddp_dev" === "1"`)
- [ ] Real ads show ONLY in production release builds

---

## App-Level Code Safeguards (ddp-ads.js)

These are automatic and don't need console changes:
- **Screen blocking:** Banners NEVER show on `reading`, `quran`, `azkar`, `prayer`, `qibla`, `onboarding` screens
- **Audio guard:** All banners hide the instant recitation or adhan audio plays; return only after audio ends and screen is allowed
- **Consent-first:** Non-personalized ads by default; user must explicitly opt in for personalized ads (GDPR/UMP compliant)
- **Remove-ads respected:** `DDP_ADS.setAdsRemoved(true)` permanently disables all banners after purchase
