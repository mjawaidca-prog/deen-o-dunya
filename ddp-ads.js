/* Deen o Dunya Planner — Ads Manager (ddp-ads.js)
   Depends on: @capacitor-community/admob (Capacitor plugin)
   Exposes: window.DDP_ADS

   PRINCIPLES (non-negotiable for a worship app):
   1. NEVER show ads on: Qur'an reading, adhkār, prayer times, qibla, during audio.
   2. ONLY banner + native on utility/list screens (dashboard bottom, settings list).
   3. NO interstitials that interrupt a worship flow. (One optional interstitial on a
      NON-worship action — e.g. after saving a task — is the maximum, and off by default.)
   4. Block haram / inappropriate ad categories at the request level AND in the AdMob
      dashboard. This is what prevents the gambling-ad problem that damaged Islam 360.
   5. Respect the "remove ads" purchase and the user's consent choice.

   IMPORTANT: Request-level content filtering is a SECOND layer. The PRIMARY block
   MUST be configured in the AdMob web console:
     AdMob → Blocking controls → Block ad categories → block:
       Gambling & betting, Dating, Alcohol, Astrology, Religion (to avoid rival/
       sectarian promos), Sexual & suggestive, Politics, Get-rich-quick, References
       to sensitive events. Also block sensitive URLs.
     AND set the app's content rating to "General audiences" (max ad content rating G).
   Request-level flags below reinforce it but cannot replace console config.
*/
(function () {
  var LS_REMOVE_ADS = "ddp_remove_ads";
  var LS_CONSENT = "ddp_ad_consent";

  // Production ad unit IDs — REPLACE with your real units from AdMob console.
  var UNITS = {
    banner: "ca-app-pub-6833419077200654/XXXXXXXXXX",   // TODO real banner unit
    native: "ca-app-pub-6833419077200654/XXXXXXXXXX"     // TODO real native unit
  };
  // Google's official TEST ids — used automatically in dev builds.
  var TEST_UNITS = {
    banner: "ca-app-pub-3940256099942544/6300978111",
    native: "ca-app-pub-3940256099942544/2247696110"
  };

  // Screens where ads are FORBIDDEN. Everything not listed as allowed = forbidden.
  var AD_ALLOWED_SCREENS = ["dashboard", "tasks", "settings", "more", "surah_list"];
  var AD_FORBIDDEN_ALWAYS = ["reading", "quran", "azkar", "adhkar", "prayer", "qibla", "onboarding"];

  function getPlugin() {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) || null;
  }

  function isDev() {
    return location.hostname === "localhost" ||
           location.protocol === "http:" ||
           localStorage.getItem("ddp_dev") === "1";
  }

  function unit(kind) {
    return isDev() ? TEST_UNITS[kind] : UNITS[kind];
  }

  function adsRemoved() {
    return localStorage.getItem(LS_REMOVE_ADS) === "1";
  }

  function setAdsRemoved(v) {
    localStorage.setItem(LS_REMOVE_ADS, v ? "1" : "0");
    if (v) hideBanner();
  }

  /* ---- Initialize (call once on boot) ---- */
  function init() {
    var admob = getPlugin();
    if (!admob) return Promise.resolve();
    return admob.initialize({
      // Request non-personalized ads by default until consent obtained (safer for
      // Pakistan + minors in audience). tagForChildDirectedTreatment stays false
      // because the app is general-audience, not child-directed — but max rating = G.
      initializeForTesting: isDev(),
      tagForUnderAgeOfConsent: false
    }).catch(function () {});
  }

  /* ---- The category-safety request options.
     These are attached to every ad request. ---- */
  function requestOptions(kind) {
    var personalized = localStorage.getItem(LS_CONSENT) === "personalized";
    return {
      adId: unit(kind),
      // Max content rating G = "General audiences". Blocks mature ad creatives.
      maxAdContentRating: "G",
      // Non-personalized unless the user explicitly consented (privacy-first).
      npa: personalized ? false : true,
      // Keywords steer the network toward wholesome inventory (soft signal).
      keywords: ["islamic", "education", "books", "family", "charity"],
      // Never child-directed flag (general audience) but keep it clean.
      tagForChildDirectedTreatment: false,
      isTesting: isDev()
    };
  }

  /* ---- Banner ---- */
  var bannerVisible = false;

  function showBanner(screenId) {
    if (adsRemoved()) return Promise.resolve();
    if (AD_FORBIDDEN_ALWAYS.indexOf(screenId) !== -1) return hideBanner();
    if (AD_ALLOWED_SCREENS.indexOf(screenId) === -1) return hideBanner();
    var admob = getPlugin();
    if (!admob) return Promise.resolve();
    var opts = requestOptions("banner");
    opts.adSize = "ADAPTIVE_BANNER";
    opts.position = "BOTTOM_CENTER";
    opts.margin = 56; // sit above the bottom nav bar, not over it
    return admob.showBanner(opts).then(function () { bannerVisible = true; }).catch(function () {});
  }

  function hideBanner() {
    var admob = getPlugin();
    if (!admob || !bannerVisible) return Promise.resolve();
    return admob.hideBanner().then(function () { bannerVisible = false; }).catch(function () {});
  }

  /* Called by the app on EVERY screen change. Central guard: this is the single
     place that decides whether a banner may show, so no worship screen can ever
     accidentally get one. */
  function onScreenChange(screenId) {
    if (adsRemoved()) { hideBanner(); return; }
    // Also hide while any audio is playing, regardless of screen.
    if (window.DDP_AUDIO && window.DDP_AUDIO.element && !window.DDP_AUDIO.element.paused) {
      hideBanner();
      return;
    }
    showBanner(screenId);
  }

  /* Hide ads whenever recitation/adhan starts; restore when it ends + on allowed screen. */
  function bindAudioGuard(currentScreenGetter) {
    if (!window.DDP_AUDIO || !window.DDP_AUDIO.element) return;
    var el = window.DDP_AUDIO.element;
    el.addEventListener("play", function () { hideBanner(); });
    el.addEventListener("pause", function () {
      var s = currentScreenGetter ? currentScreenGetter() : null;
      if (s) onScreenChange(s);
    });
    el.addEventListener("ended", function () {
      var s = currentScreenGetter ? currentScreenGetter() : null;
      if (s) onScreenChange(s);
    });
  }

  /* ---- Consent (UMP) ---- */
  function requestConsent() {
    var admob = getPlugin();
    if (!admob || !admob.requestConsentInfo) return Promise.resolve("npa");
    return admob.requestConsentInfo().then(function (info) {
      if (info && info.isConsentFormAvailable && info.status === "REQUIRED") {
        return admob.showConsentForm().then(function (r) {
          var choice = (r && r.status === "OBTAINED") ? "personalized" : "npa";
          localStorage.setItem(LS_CONSENT, choice);
          return choice;
        });
      }
      localStorage.setItem(LS_CONSENT, "npa");
      return "npa";
    }).catch(function () { return "npa"; });
  }

  window.DDP_ADS = {
    init: init,
    onScreenChange: onScreenChange,
    showBanner: showBanner,
    hideBanner: hideBanner,
    bindAudioGuard: bindAudioGuard,
    requestConsent: requestConsent,
    adsRemoved: adsRemoved,
    setAdsRemoved: setAdsRemoved,
    requestOptions: requestOptions,
    AD_ALLOWED_SCREENS: AD_ALLOWED_SCREENS,
    AD_FORBIDDEN_ALWAYS: AD_FORBIDDEN_ALWAYS,
    UNITS: UNITS
  };
})();
