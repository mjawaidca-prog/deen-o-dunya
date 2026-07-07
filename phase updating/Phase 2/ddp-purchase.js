/* Deen o Dunya Planner — Remove Ads Purchase (ddp-purchase.js)
   Depends on: @capacitor-community/in-app-purchases  (or RevenueCat — see note)
   Exposes: window.DDP_PURCHASE

   A single one-time non-consumable product: "remove_ads".
   Cheap price point recommended for Pakistan market (see PHASE-2-WORKORDER):
   set tiered pricing in Play Console — e.g. PKR 150–300 / USD ~1.

   This complements (not replaces) the donation channel. Two ways to support the
   app: remove ads (transactional) OR donate (sadaqah jariyah). Both fit the audience.

   NOTE ON PLUGIN CHOICE:
   - Simplest: @capacitor-community/in-app-purchases for a single non-consumable.
   - If you later add subscriptions/tiers, migrate to RevenueCat (@revenuecat/purchases-capacitor)
     which handles receipt validation server-side for free up to a revenue threshold.
   The interface below is plugin-agnostic; wire whichever you install into the two
   TODO calls.
*/
(function () {
  var PRODUCT_ID = "remove_ads";
  var LS_KEY = "ddp_remove_ads";

  function getPlugin() {
    return (window.Capacitor && window.Capacitor.Plugins &&
      (window.Capacitor.Plugins.InAppPurchases || window.Capacitor.Plugins.CdvPurchase)) || null;
  }

  function isPurchased() {
    return localStorage.getItem(LS_KEY) === "1";
  }

  function markPurchased() {
    localStorage.setItem(LS_KEY, "1");
    if (window.DDP_ADS) window.DDP_ADS.setAdsRemoved(true);
  }

  /* Initialize + restore any previous purchase (call once on boot). */
  function init() {
    var p = getPlugin();
    if (!p) return Promise.resolve();
    // TODO: plugin-specific init + register PRODUCT_ID
    return Promise.resolve().then(function () {
      return restore();
    }).catch(function () {});
  }

  function getPrice() {
    var p = getPlugin();
    if (!p) return Promise.resolve(null);
    // TODO: query product; return localized price string e.g. "Rs 200"
    return Promise.resolve(null);
  }

  function buy() {
    var p = getPlugin();
    if (!p) {
      return Promise.reject(new Error("billing_unavailable"));
    }
    // TODO: plugin-specific purchase flow. On success:
    return Promise.resolve().then(function () {
      // (replace with real purchase result check)
      markPurchased();
      return { success: true };
    });
  }

  /* Restore previous purchase (e.g. after reinstall / new device). */
  function restore() {
    var p = getPlugin();
    if (!p) return Promise.resolve(false);
    // TODO: query owned products; if PRODUCT_ID owned -> markPurchased()
    return Promise.resolve().then(function () {
      // placeholder: keep existing local flag
      return isPurchased();
    });
  }

  window.DDP_PURCHASE = {
    PRODUCT_ID: PRODUCT_ID,
    init: init,
    buy: buy,
    restore: restore,
    getPrice: getPrice,
    isPurchased: isPurchased
  };
})();
