(function () {
  var BANNER_AD_UNIT_ID = "ca-app-pub-6833419077200654/3733435872";
  var BANNER_FALLBACK_HEIGHT_PX = 50;

  function isNativeCapacitor() {
    return Boolean(
      window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform()
    );
  }

  function getAdMobPlugin() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob;
  }

  function reserveBannerSpace(height) {
    var bannerHeight = Number(height) || BANNER_FALLBACK_HEIGHT_PX;
    document.documentElement.style.setProperty("--admob-banner-height", bannerHeight + "px");
  }

  async function canRequestAds(AdMob) {
    if (typeof AdMob.requestConsentInfo !== "function") {
      return true;
    }

    try {
      var consentInfo = await AdMob.requestConsentInfo();
      if (consentInfo && consentInfo.canRequestAds === false && typeof AdMob.showConsentForm === "function") {
        consentInfo = await AdMob.showConsentForm();
      }

      return !consentInfo || consentInfo.canRequestAds !== false;
    } catch (error) {
      console.warn("AdMob consent check failed; attempting to request ads.", error);
      return true;
    }
  }

  async function initializeAdMobBanner() {
    if (!isNativeCapacitor()) {
      return;
    }

    var AdMob = getAdMobPlugin();
    if (!AdMob) {
      console.warn("AdMob plugin is not available. Run npm install and npx cap sync after pulling this change.");
      return;
    }

    try {
      if (typeof AdMob.addListener === "function") {
        AdMob.addListener("bannerAdSizeChanged", function (size) {
          reserveBannerSpace(size && size.height);
        });
      }

      await AdMob.initialize();

      if (!(await canRequestAds(AdMob))) {
        console.warn("AdMob consent status does not allow ad requests yet.");
        return;
      }

      reserveBannerSpace(BANNER_FALLBACK_HEIGHT_PX);
      await AdMob.showBanner({
        adId: BANNER_AD_UNIT_ID,
        adSize: "BANNER",
        position: "BOTTOM_CENTER",
        margin: 0
      });
    } catch (error) {
      console.warn("Unable to show AdMob banner.", error);
    }
  }

  window.addEventListener("load", function () {
    setTimeout(initializeAdMobBanner, 300);
  });
})();
