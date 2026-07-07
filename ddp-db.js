/* Deen o Dunya Planner — IndexedDB storage layer (ddp-db.js)
   Replaces localStorage for CONTENT (Quran text, tafsir packs, habit history).
   localStorage stays only for tiny settings (it's synchronous and ~5MB-capped;
   the full Quran with two translations does not fit and was silently failing).

   Exposes window.DDP_DB with promise-based get/set/del/keys per store.

   Stores:
     quran   — key: surah number (1..114), value: {bismillah, ayahs:[{ar,en,ur,gid}]}
     tafsir  — key: "surah:mufassirId", value: pack
     habits  — key: "YYYY-MM-DD", value: day record (see ddp-habits.js)
     kv      — key: string, value: anything (plans, khatm state, misc)
*/
(function () {
  var DB_NAME = "ddp";
  var DB_VERSION = 1;
  var STORES = ["quran", "tafsir", "habits", "kv"];
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        STORES.forEach(function (s) {
          if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
        });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function tx(store, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(store, mode);
        var os = t.objectStore(store);
        var out = fn(os);
        t.oncomplete = function () { resolve(out && out._value !== undefined ? out._value : out); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error); };
      });
    });
  }

  function get(store, key) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var r = db.transaction(store, "readonly").objectStore(store).get(key);
        r.onsuccess = function () { resolve(r.result === undefined ? null : r.result); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function set(store, key, value) {
    return tx(store, "readwrite", function (os) { os.put(value, key); });
  }

  function del(store, key) {
    return tx(store, "readwrite", function (os) { os.delete(key); });
  }

  function keys(store) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var r = db.transaction(store, "readonly").objectStore(store).getAllKeys();
        r.onsuccess = function () { resolve(r.result || []); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  /* One-time migration: move legacy localStorage surah downloads (ddp_q_N) into
     IndexedDB, then remove them to free the 5MB quota. Safe to call on every boot. */
  function migrateLegacy() {
    var moved = [];
    return open().then(function () {
      var ops = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("ddp_q_") === 0) {
          try {
            var n = parseInt(k.slice(6), 10);
            var v = JSON.parse(localStorage.getItem(k));
            if (n >= 1 && n <= 114 && v && v.ayahs) {
              ops.push(set("quran", n, v).then((function (kk) {
                return function () { moved.push(kk); };
              })(k)));
            }
          } catch (e) {}
        }
      }
      return Promise.all(ops);
    }).then(function () {
      moved.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
      return moved.length;
    }).catch(function () { return 0; });
  }

  window.DDP_DB = { get: get, set: set, del: del, keys: keys, migrateLegacy: migrateLegacy };
})();
