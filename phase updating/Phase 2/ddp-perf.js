/* Deen o Dunya Planner — Performance Utilities (ddp-perf.js)
   Exposes: window.DDP_PERF

   A grab-bag of low-end-device optimizations. All are defensive and degrade
   gracefully on older WebViews.

   - deviceTier(): "low" | "mid" | "high" from RAM + CPU hints, so the app can
     dial down animations / overscan / audio bitrate on weak phones.
   - onIdle(fn): run non-urgent work when the main thread is free.
   - debounce / throttle helpers.
   - preloadFonts(): warm the self-hosted woff2 subsets so first Arabic/Urdu paint
     doesn't flash fallback glyphs.
   - reduceMotion(): respects prefers-reduced-motion AND low tier.
*/
(function () {
  function deviceMemoryGB() {
    return navigator.deviceMemory || 2; // Chrome exposes this; default assume 2GB
  }

  function hardwareCores() {
    return navigator.hardwareConcurrency || 4;
  }

  function deviceTier() {
    var mem = deviceMemoryGB();
    var cores = hardwareCores();
    if (mem <= 2 || cores <= 4) return "low";
    if (mem <= 4 || cores <= 6) return "mid";
    return "high";
  }

  /* Tuning profile the whole app can read */
  function profile() {
    var tier = deviceTier();
    return {
      tier: tier,
      overscan: tier === "low" ? 2 : (tier === "mid" ? 4 : 6),
      animations: tier !== "low",
      audioBitrate: tier === "low" ? 64 : 128,
      shadowEffects: tier !== "low",
      maxCachedSurahs: tier === "low" ? 30 : 114
    };
  }

  var onIdle = window.requestIdleCallback
    ? function (fn) { return window.requestIdleCallback(fn, { timeout: 2000 }); }
    : function (fn) { return setTimeout(fn, 1); };

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function throttle(fn, limit) {
    var inThrottle;
    return function () {
      var ctx = this, args = arguments;
      if (!inThrottle) {
        fn.apply(ctx, args);
        inThrottle = true;
        setTimeout(function () { inThrottle = false; }, limit);
      }
    };
  }

  /* Preload self-hosted fonts (call once on boot).
     Assumes Phase 0 self-hosted the fonts under ./assets/fonts/ as woff2. */
  function preloadFonts() {
    var fonts = [
      "assets/fonts/amiri-quran.woff2",
      "assets/fonts/noto-nastaliq-urdu.woff2",
      "assets/fonts/newsreader.woff2"
    ];
    fonts.forEach(function (href) {
      var link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  function reduceMotion() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    } catch (e) {}
    return deviceTier() === "low";
  }

  /* Lazy-load images with IntersectionObserver (for any future image content) */
  function lazyImages(root) {
    if (!("IntersectionObserver" in window)) {
      // Fallback: load all immediately
      (root || document).querySelectorAll("img[data-src]").forEach(function (img) {
        img.src = img.getAttribute("data-src");
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.getAttribute("data-src");
          img.removeAttribute("data-src");
          io.unobserve(img);
        }
      });
    }, { rootMargin: "200px" });
    (root || document).querySelectorAll("img[data-src]").forEach(function (img) { io.observe(img); });
  }

  /* Wrap heavy synchronous list-building so it yields to the UI thread */
  function chunkedForEach(array, perChunk, fn, done) {
    var i = 0;
    function next() {
      var end = Math.min(i + perChunk, array.length);
      for (; i < end; i++) fn(array[i], i);
      if (i < array.length) onIdle(next);
      else if (done) done();
    }
    next();
  }

  window.DDP_PERF = {
    deviceTier: deviceTier,
    profile: profile,
    onIdle: onIdle,
    debounce: debounce,
    throttle: throttle,
    preloadFonts: preloadFonts,
    reduceMotion: reduceMotion,
    lazyImages: lazyImages,
    chunkedForEach: chunkedForEach,
    deviceMemoryGB: deviceMemoryGB,
    hardwareCores: hardwareCores
  };
})();
