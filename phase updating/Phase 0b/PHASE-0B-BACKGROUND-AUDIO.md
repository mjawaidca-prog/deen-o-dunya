# Deen o Dunya Planner — Background Audio Fix (Phase 0 addendum: "Phase 0-B")

**The bug:** recitation stops when the phone sleeps / screen locks. Many users report it.
**Why it's separate from the Phase 0 interruption fix:** Phase 0 handled *phone-call* interruptions (pause → resume). This is different — the OS **suspends the whole WebView** when the screen locks, and a plain web `<audio>` element has no way to declare itself a media player, so the OS kills the audio. Confirmed by Capacitor community docs: *"If your app is in the background Android will force your app to go to sleep even if audio is currently playing in the WebView."*

**The fix:** declare an active **MediaSession backed by a foreground service**, which tells the OS "this is a media playback app — keep it alive with the screen off." Bonus: this also adds **lock-screen + notification playback controls** (play/pause/next/prev), which every serious Qur'an app has and yours currently lacks.

**Module delivered:** `ddp-bgaudio.js`
**Priority:** HIGH — fold this into your Phase 0 batch, since it's a top user complaint about the core feature.

---

## Task B-1 — Install the plugin
```bash
npm install @jofr/capacitor-media-session
npx cap sync
```
(This plugin starts the Android foreground service for active media sessions and bridges MediaSession to the WebView. Use the version matching your Capacitor major version — 4.x for Cap 6, per the plugin docs.)

Add `ddp-bgaudio.js` to index.html script tags (after `ddp-audio.js`), to `prepare-mobile-build.js`, and to `sw.js` APP_SHELL. Bump SW version.

---

## Task B-2 — Android native config

### AndroidManifest.xml — add foreground-service permissions
Add alongside your existing permissions:
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<!-- Android 14+ requires the TYPED permission for media playback services -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```
(The plugin registers its own foreground service; you only need to grant these permissions. If your `targetSdkVersion` is 34+, the typed `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission is mandatory or the service fails to start.)

### MainActivity — already fixed in Phase 0
Your Phase 0 `MainActivity.java` already set `setMediaPlaybackRequiresUserGesture(false)`, which this fix also needs. No further change.

### Battery-optimization caveat (document for users)
Some Android OEMs (Xiaomi/Redmi, Oppo, Vivo, Huawei, Samsung to a degree) aggressively kill background apps regardless of foreground services — this is the "Don't kill my app!" problem, very common on the exact cheap phones in your Pakistan market. You can't fully fix this in code. Add a one-time gentle tip the first time a user plays audio: *"If recitation stops when your screen is off, allow Deen o Dunya to run in the background in your phone's battery settings."* Optionally deep-link to battery settings via a small plugin. This is a known limitation of ALL WebView audio apps on these OEMs — set the expectation rather than promising perfection.

---

## Task B-3 — iOS native config

### Enable Background Audio capability
In Xcode → target → Signing & Capabilities → **+ Capability → Background Modes → check "Audio, AirPlay, and Picture in Picture."** This adds to `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### AVAudioSession category = playback
iOS silences WebView audio in the background unless the audio session category is `playback`. Set it once at app start. If the media-session plugin doesn't set it for you, add a tiny native shim in `AppDelegate.swift`:
```swift
import AVFoundation
// in application(_:didFinishLaunchingWithOptions:)
try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
try? AVAudioSession.sharedInstance().setActive(true)
```
(`.spokenAudio` mode is appropriate for recitation — it ducks/behaves correctly for voice content.)

---

## Task B-4 — Wire the module into the player (JS)

In the recitation player setup (where you build the `DDP_AUDIO` playback in Phase 0/1), after the player exists:

```javascript
// One-time bind: keeps foreground service state in sync + wires lock-screen buttons
DDP_BGAUDIO.bindToPlayer({
  onNext: () => playNextAyah(),        // your existing "advance to next ayah"
  onPrev: () => playPrevAyah()         // your existing "previous ayah"
});
```

Then, **each time a new ayah starts playing**, update the lock-screen metadata:
```javascript
function onAyahStart(surah, ayah, reciterName) {
  DDP_BGAUDIO.updateNowPlaying(surah.nameEn, ayah.n, reciterName);
}
```

When the user fully stops recitation (not just pause), release the session so the notification clears and the foreground service ends (battery):
```javascript
function onStopRecitation() {
  DDP_AUDIO.stop();
  DDP_BGAUDIO.release();
}
```

---

## Task B-5 — Test (the whole point)

On a REAL Android device (emulators don't reproduce OEM background-kill behavior):
- [ ] Start Sūrah recitation → **lock the screen** → recitation continues playing
- [ ] Lock screen shows now-playing (surah + ayah + reciter) with play/pause controls
- [ ] Lock-screen play/pause works; next/previous advances ayahs
- [ ] Put the app in the background (home button) → audio continues
- [ ] Notification shade shows playback controls while backgrounded
- [ ] Stop recitation → notification clears, no lingering foreground service
- [ ] On a Xiaomi/Oppo/Vivo device if available: confirm behavior, and confirm the battery-settings tip appears (expect OEM kill on some — that's the documented limitation)

On iOS:
- [ ] Recitation continues with screen locked
- [ ] Lock-screen / Control Center shows now-playing + controls
- [ ] Audio ducks correctly for interruptions and resumes (ties into Phase 0 interruption handling)

---

## How this fits the earlier fixes (so nothing conflicts)

- **Phase 0 `ddp-audio.js`** — playback engine, bitrate, preload, phone-call interruption resume. Unchanged; `ddp-bgaudio.js` sits on top of it and listens to the same shared `<audio>` element.
- **Phase 0 `ddp-state.js`** — restores screen/scroll position if the app IS killed. Complementary: with background audio working, the app is killed far less often during playback, but if the OS still kills it (aggressive OEM), state restore brings the user back to the right place.
- **Phase 3 `ddp-audio-dl.js`** — offline downloaded audio. Background playback works identically for local files; if anything it's more reliable (no network wake needed).

Together these four cover the full matrix: audio keeps playing when the screen sleeps (this fix), resumes after a phone call (Phase 0), survives an outright process kill by restoring position (Phase 0 state), and works fully offline (Phase 3).
```
