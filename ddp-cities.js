/* Deen o Dunya Planner — offline city database + location helpers
   Load BEFORE the main app script. Exposes window.DDP_CITIES and window.DDP_LOC.

   Purpose (Phase 0):
   - Replace the hardcoded "Calgary, AB" default with a locale-aware default.
   - Give users with no GPS / no data a fully OFFLINE city picker (Pakistan-first).
   - Auto-select the correct prayer calculation method per country.
*/
(function () {
  // [name, country, lat, lon, suggestedMethod]
  // method keys must match the app's existing method keys: "karachi" | "isna" | "ummalqura" | "mwl"
  var CITIES = [
    // ---- Pakistan (Karachi method) ----
    ["Karachi", "Pakistan", 24.8607, 67.0011, "karachi"],
    ["Lahore", "Pakistan", 31.5204, 74.3587, "karachi"],
    ["Faisalabad", "Pakistan", 31.4504, 73.1350, "karachi"],
    ["Rawalpindi", "Pakistan", 33.5651, 73.0169, "karachi"],
    ["Islamabad", "Pakistan", 33.6844, 73.0479, "karachi"],
    ["Gujranwala", "Pakistan", 32.1877, 74.1945, "karachi"],
    ["Peshawar", "Pakistan", 34.0151, 71.5249, "karachi"],
    ["Multan", "Pakistan", 30.1575, 71.5249, "karachi"],
    ["Hyderabad", "Pakistan", 25.3960, 68.3578, "karachi"],
    ["Quetta", "Pakistan", 30.1798, 66.9750, "karachi"],
    ["Sialkot", "Pakistan", 32.4945, 74.5229, "karachi"],
    ["Bahawalpur", "Pakistan", 29.3956, 71.6836, "karachi"],
    ["Sargodha", "Pakistan", 32.0836, 72.6711, "karachi"],
    ["Sukkur", "Pakistan", 27.7052, 68.8574, "karachi"],
    ["Larkana", "Pakistan", 27.5590, 68.2120, "karachi"],
    ["Sheikhupura", "Pakistan", 31.7131, 73.9783, "karachi"],
    ["Gujrat", "Pakistan", 32.5731, 74.0789, "karachi"],
    ["Mardan", "Pakistan", 34.1986, 72.0404, "karachi"],
    ["Kasur", "Pakistan", 31.1187, 74.4502, "karachi"],
    ["Rahim Yar Khan", "Pakistan", 28.4202, 70.2952, "karachi"],
    ["Okara", "Pakistan", 30.8081, 73.4458, "karachi"],
    ["Dera Ghazi Khan", "Pakistan", 30.0561, 70.6348, "karachi"],
    ["Sahiwal", "Pakistan", 30.6611, 73.1086, "karachi"],
    ["Abbottabad", "Pakistan", 34.1688, 73.2215, "karachi"],
    ["Mirpur (AJK)", "Pakistan", 33.1478, 73.7518, "karachi"],
    ["Muzaffarabad", "Pakistan", 34.3700, 73.4711, "karachi"],
    ["Gilgit", "Pakistan", 35.9208, 74.3144, "karachi"],
    ["Skardu", "Pakistan", 35.2971, 75.6333, "karachi"],
    // ---- Gulf (Umm al-Qura) ----
    ["Makkah", "Saudi Arabia", 21.3891, 39.8579, "ummalqura"],
    ["Madinah", "Saudi Arabia", 24.5247, 39.5692, "ummalqura"],
    ["Riyadh", "Saudi Arabia", 24.7136, 46.6753, "ummalqura"],
    ["Jeddah", "Saudi Arabia", 21.4858, 39.1925, "ummalqura"],
    ["Dubai", "UAE", 25.2048, 55.2708, "ummalqura"],
    ["Abu Dhabi", "UAE", 24.4539, 54.3773, "ummalqura"],
    ["Doha", "Qatar", 25.2854, 51.5310, "ummalqura"],
    ["Kuwait City", "Kuwait", 29.3759, 47.9774, "ummalqura"],
    ["Muscat", "Oman", 23.5880, 58.3829, "ummalqura"],
    // ---- South / Southeast Asia ----
    ["Dhaka", "Bangladesh", 23.8103, 90.4125, "karachi"],
    ["Delhi", "India", 28.7041, 77.1025, "karachi"],
    ["Mumbai", "India", 19.0760, 72.8777, "karachi"],
    ["Kuala Lumpur", "Malaysia", 3.1390, 101.6869, "mwl"],
    ["Jakarta", "Indonesia", -6.2088, 106.8456, "mwl"],
    // ---- West ----
    ["London", "United Kingdom", 51.5074, -0.1278, "mwl"],
    ["Birmingham", "United Kingdom", 52.4862, -1.8904, "mwl"],
    ["Toronto", "Canada", 43.6532, -79.3832, "isna"],
    ["Calgary", "Canada", 51.0447, -114.0719, "isna"],
    ["Vancouver", "Canada", 49.2827, -123.1207, "isna"],
    ["New York", "USA", 40.7128, -74.0060, "isna"],
    ["Houston", "USA", 29.7604, -95.3698, "isna"],
    ["Chicago", "USA", 41.8781, -87.6298, "isna"],
    ["Sydney", "Australia", -33.8688, 151.2093, "mwl"],
    // ---- Middle East / other ----
    ["Istanbul", "Türkiye", 41.0082, 28.9784, "mwl"],
    ["Cairo", "Egypt", 30.0444, 31.2357, "mwl"]
  ];

  var LS_KEY = "ddp_location_v2";

  function all() {
    return CITIES.map(function (c) {
      return { name: c[0], country: c[1], lat: c[2], lon: c[3], method: c[4], label: c[0] + ", " + c[1] };
    });
  }

  function search(q) {
    q = (q || "").trim().toLowerCase();
    var list = all();
    if (!q) return list;
    return list.filter(function (c) {
      return c.name.toLowerCase().indexOf(q) !== -1 || c.country.toLowerCase().indexOf(q) !== -1;
    });
  }

  /* Locale-aware default when nothing is saved and GPS is unavailable.
     Pakistan-market build => Karachi, but we still try the device's own signals first. */
  function smartDefault() {
    var list = all();
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      var lang = (navigator.language || "").toLowerCase();
      if (tz === "Asia/Karachi" || lang.indexOf("ur") === 0 || lang.indexOf("-pk") !== -1) return byName("Karachi");
      var tzMap = {
        "Asia/Dhaka": "Dhaka", "Asia/Riyadh": "Riyadh", "Asia/Dubai": "Dubai", "Asia/Qatar": "Doha",
        "Asia/Kolkata": "Delhi", "Asia/Kuala_Lumpur": "Kuala Lumpur", "Asia/Jakarta": "Jakarta",
        "Europe/London": "London", "Europe/Istanbul": "Istanbul", "Africa/Cairo": "Cairo",
        "America/Toronto": "Toronto", "America/Edmonton": "Calgary", "America/New_York": "New York",
        "America/Chicago": "Chicago", "Australia/Sydney": "Sydney"
      };
      if (tzMap[tz]) return byName(tzMap[tz]);
    } catch (e) {}
    return byName("Karachi"); // final fallback for this market — NOT Calgary
  }

  function byName(name) {
    var list = all();
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return list[i];
    return list[0];
  }

  function saved() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch (e) { return null; }
  }

  function save(loc) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(loc)); } catch (e) {}
  }

  /* Resolve location in priority order:
     1. user-saved city, 2. GPS (if permission granted), 3. smart locale default. */
  function resolve(cb) {
    var s = saved();
    if (s && typeof s.lat === "number") { cb(s); return; }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, label: "Your location", method: null, source: "gps" };
          save(loc); cb(loc);
        },
        function () { cb(smartDefault()); },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 3600000 }
      );
    } else {
      cb(smartDefault());
    }
  }

  window.DDP_CITIES = { all: all, search: search, byName: byName, smartDefault: smartDefault };
  window.DDP_LOC = { resolve: resolve, saved: saved, save: save, LS_KEY: LS_KEY };
})();
