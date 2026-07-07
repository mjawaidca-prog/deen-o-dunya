# Deen o Dunya Planner — Architecture Migration Assessment
### Should you migrate from Capacitor/WebView to Flutter?

**Short answer: No — not now. Stay on Capacitor, keep hardening it, and set explicit "trigger conditions" that would justify a migration later. A rewrite today would cost you months and re-introduce bugs you've already fixed, to solve a problem you can largely engineer around.**

This document exists so the decision is deliberate, revisited on evidence, not vibes.

---

## 1. The honest performance picture (2026)

The tradeoff is real and well-documented, and it points exactly at your app's risk area:

- **Capacitor's ceiling is the WebView's ceiling.** On modern iPhones (WebKit) this is genuinely good. On Android — especially **older/budget devices, your core Pakistan market** — the Chromium WebView "can struggle with DOM-heavy interfaces." Multiple 2026 sources name the *specific* failure modes: **complex list virtualization, heavy real-time rendering, and gesture-intensive scrolling.** A Qur'an reader with hundreds of ayah cards is precisely a "large list" workload.
- Developers report the same app running **smoothly as a PWA in mobile Chrome but stuttering once wrapped in Capacitor on Android** — with the usual mitigations (remove box-shadows, opacity, low-res images, GPU-only CSS animations). You've already applied several of these in Phase 2 (`ddp-perf.js` device tiering).
- **Flutter has the highest performance ceiling** because it compiles to native ARM and controls the rendering pipeline end-to-end (Skia). For "heavy offline-first applications" Flutter is more robust. This is the genuine case *for* migrating.

So the criticism is fair. But "Flutter is faster" is not the same as "you should migrate." Here's why the answer is still no, for now.

---

## 2. Why NOT to migrate right now

**a) You've already neutralized the main offender.** The #1 WebView risk for your app is long-list jank. Phase 2's `ddp-vlist.js` (true windowing — only visible ayahs mounted) plus `ddp-perf.js` (tier-based disabling of shadows/animations on low-end phones) directly target that. The right sequence is: *ship those, measure on a real ₨15–20k Android phone, and see if the problem still exists.* Migrating before measuring is solving a problem you may no longer have.

**b) The translation tax is enormous and risky.** Everything from Phases 0–3 — prayer calc, i18n with RTL, Hijri engine, habit ring, IndexedDB storage, offline audio manager, search index, Ramadan logic, ads/consent, notifications — is JavaScript. A Flutter rewrite re-implements all of it in Dart, re-tests it, and **re-introduces regressions you've already fixed** (the Calgary bug, the adhan gesture bug, the interruption-resume bug). Rewrites are where working software goes to break.

**c) Team/skill alignment is the strongest predictor of success.** The consistent finding across every 2026 source: *"A [web] team using [a web-based stack] will ship faster than the same team learning Flutter, even though Flutter might be technically superior."* Your entire codebase and your own workflow are web-based. Dart is a language "almost nobody knows"; senior Flutter engineers are scarcer and pricier (~$130–200K), and onboarding a non-Dart dev takes 4–8 weeks. For a solo/small-team sadaqah-oriented app, that's a poor trade.

**d) Your content is web-shaped.** Arabic/Nastaliq rendering, which most frameworks get wrong, renders *well* in a WebView — one of your stack's genuine advantages. Your Qur'an bundle, azkar, and tafsir are HTML/JSON. Capacitor ships them as-is; Flutter would need a rendering strategy for complex Arabic/Urdu typography (doable, but work).

**e) Iteration speed is your actual moat vs. Islam 360.** You differentiate on UX polish and the habit layer, not on raw 3D performance. Web tooling gives you the fastest ship-measure-improve loop, and Capacitor supports over-the-air web updates (via tools like Capgo) — you can push UI fixes without a full store release. That velocity matters more than a rewrite while you're still finding product-market fit.

---

## 3. When you SHOULD migrate (explicit trigger conditions)

Don't migrate on principle. Migrate if — *after shipping Phases 0–2 and measuring on real low-end hardware* — you hit one or more of these:

1. **Measured, unfixable jank.** You test on a genuine 2GB-RAM budget Android phone (e.g. an entry Infinix/Tecno/Redmi common in Pakistan), and Al-Baqarah scrolling or audio-synced highlighting still drops frames badly *after* virtualization + perf tiering. If `ddp-vlist` + `ddp-perf` don't get you to smooth, that's the strongest signal.
2. **Cold-start / memory ceilings.** App cold-starts feel slow (>3–4s) on budget phones, or the WebView is OOM-killed frequently during audio (you'd see it as the "returns to dashboard" bug recurring despite `ddp-state.js`).
3. **A feature the WebView can't do well.** Real-time camera-AR qibla, advanced audio DSP, on-device ML (e.g. tajweed feedback from mic) — these hit the WebView's ceiling. If your roadmap commits to them, Flutter/native becomes justified.
4. **You gain Flutter capacity.** If you bring on a developer who already knows Dart/Flutter, the skill-alignment argument flips and the cost drops.

If none of these fire, staying on Capacitor is the correct long-term call, not just a stopgap.

---

## 4. The recommended path: harden, measure, decide

**Now (you're mid-way through this):**
- Finish shipping Phase 0–2. Confirm `ddp-vlist` + `ddp-perf` are wired into the reading view.
- **Buy or borrow one genuinely cheap Android phone** representative of your Pakistan users (2GB RAM, older Android, budget SoC). This is the single most valuable ~$80 you can spend — your emulator won't tell you the truth about WebView jank. Test the reading view, audio, and transitions on it every release.

**Keep the WebView fast (ongoing checklist):**
- Virtualize every long list (ayahs, azkar, hadith, surah index).
- On low tier: no box-shadows, no opacity transitions, minimal animation, `will-change` used sparingly, GPU-friendly transforms only.
- One shared `<audio>` element (done, `ddp-audio.js`); never one-per-card.
- Keep the DOM small — don't render offscreen content.
- Self-hosted fonts (Phase 0); avoid layout thrash from late font swaps.
- Consider OTA web updates (Capgo) so you can fix perf issues without store round-trips.

**Set a review checkpoint:** revisit this document after Phase 2 ships and you've tested on real hardware, and again if any trigger in §3 fires. Write down the measured frame rates so "it feels slow" becomes data.

---

## 5. If migration is ever greenlit — do it right (not a big-bang rewrite)

Should a trigger fire, **do not rewrite everything at once.** Sequence:
1. **Port the hot screen first.** The Qur'an reading view is 90% of the perf pain. A Flutter (or native Android) build could, in principle, host just that screen — but a cleaner path is a **full Flutter app that reuses your data**: your Qur'an bundle JSON, azkar JSON, i18n strings, and prayer-calc constants all carry over as data. The *logic* is re-implemented; the *content* is not re-created.
2. **Reuse your algorithms as specs.** `ddp-hijri`, prayer calc, `ddp-habits` streak/khatm math, `ddp-search` normalization, `ddp-ramadan` derivation — these are already precise, tested specifications. Translating well-specified logic to Dart is far lower-risk than designing it fresh.
3. **Keep the same UX and habit model.** The differentiation (daily ring, khatm plan, trilingual RTL, offline-first) is design, not framework — it transfers intact.
4. **Budget realistically:** a Flutter rewrite of this app's current scope is a multi-month effort. Only worth it if a §3 trigger makes the WebView a genuine ceiling on your users' experience.

---

## 6. Bottom line

The original review flagged the WebView as your biggest structural risk, and that was correct. But the right response was never "rewrite immediately" — it was "harden aggressively, then let real-device measurement decide." You've done the hardening. The disciplined move now is to **ship, test on a real cheap phone, and keep this document as your decision gate.** Migrate only on evidence, and if you do, port data + logic-as-spec rather than starting over.

Staying on Capacitor is not settling. For a content-and-utility app differentiated on UX and trust, shipped by a web-native builder, targeting fast iteration — it's the correct architecture. Flutter buys raw performance you can mostly engineer your way to, at a cost (rewrite risk, Dart hiring, lost velocity) that only pays off once your users' real devices prove the WebView can't keep up.
