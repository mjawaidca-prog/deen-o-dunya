# Handoff: Today Screen — Log Cards Update
**Deen o Dunya Planner** · Capacitor HTML/CSS/JS app

---

## Overview
This package contains designs for updating the **Today screen** and adding three new **log cards** with corresponding detail screens. The existing prayer-times list and salah log stay — these designs add to them.

## About the Design Files
The files in this bundle are **design references built in HTML** — interactive prototypes showing intended look and behaviour. The task is to **recreate these designs in the existing `index.html`** Capacitor app using its established patterns.

- `components-reference.html` — interactive visual reference for every component (open in browser)
- `prototype-reference.dc.html` — full prototype with all screens and navigation
- `README.md` — this spec document

## Fidelity
**High-fidelity.** Pixel-accurate colours, typography, spacing, and interactions. Recreate as shown.

---

## Design Tokens

### Colours
| Token | Value | Use |
|---|---|---|
| `--bg-app` | `radial-gradient(120% 55% at 80% -5%, #FBF6EA, #F4EEE0, #EFE7D6)` | App/screen background |
| `--bg-card` | `#FFFDF7` | All cards |
| `--green-dark` | `#0C5A3B` | Primary action, "done" state |
| `--green-darker` | `#073A28` | Gradient end (hero cards) |
| `--gold` | `#BD9A4E` | Section labels, accent |
| `--gold-light` | `#D8B978` | Lighter gold (tasbih bar, gradient) |
| `--text-heading` | `#21302A` | Headings, primary text |
| `--text-body` | `#4C5852` | Body copy |
| `--text-muted` | `#8A8576` | Sub-labels, secondary |
| `--text-faint` | `#B7B1A1` | Empty states, faint labels |
| `--state-late` | `#9A7B2E` / `rgba(189,154,78,0.18)` | Late prayer |
| `--state-missed` | `#B03C34` / `rgba(176,60,52,0.12)` | Missed prayer |
| `--state-excused` | `#3E6A8C` / `rgba(74,110,140,0.14)` | Excused prayer |
| `--card-shadow` | `0 6px 22px rgba(28,46,36,0.06)` | Standard card shadow |
| `--card-border` | `1px solid rgba(255,255,255,0.7)` | Standard card border |

### Typography
| Role | Family | Size | Weight | Notes |
|---|---|---|---|---|
| Screen title | Newsreader (serif) | 24px | 600 | |
| Card serif number | Newsreader | 16–32px | 600 | |
| Section label | Hanken Grotesk | 11–11.5px | 700 | UPPERCASE · 1.6px letter-spacing |
| Body / chip label | Hanken Grotesk | 12–15px | 600 | |
| Muted sub-text | Hanken Grotesk | 11.5–12px | 400–500 | |
| Arabic (azkar, glyph) | Amiri | 15–26px | 400 | |
| Large numeric (tasbih) | Newsreader | 64px | 600 | tabular-nums |

### Radii & Spacing
| Token | Value |
|---|---|
| Card radius | `28px` |
| Chip radius | `13px` |
| Pill radius | `999px` |
| Card padding | `18px` |
| Card gap (between cards) | `14px` |
| Chip inner height | `40px` |

---

## Components

### 1. Day Ribbon Card *(replaces "Next Prayer" hero)*

Replaces the existing large dark-green "Next Prayer" card on the Today screen (Look A).

**Layout:** Cream card (`#FFFDF7`, `border-radius:28px`, `padding:18px 18px 14px`).

**Header row (flex, space-between):**
- Left: Period label (UPPERCASE gold, 10px, 700 weight) + italic serif subtitle (16px, 500)
- Right: Green pill (`background:rgba(12,90,59,0.07)`, `border-radius:14px`, `padding:8px 12px`) showing next prayer name (9.5px, uppercase, `#0C5A3B`) + countdown (21px Newsreader, `#0C5A3B`)

**Timeline track (`height:62px`, `position:relative`):**
- Base track: `position:absolute; top:50%; left:5%; right:5%; height:2px; background:rgba(33,48,42,0.10); transform:translateY(-50%)`
- Elapsed fill: same but `width` = % of day elapsed since Fajr (amber→green gradient), drawn left to right
- NOW dot: `width:16px; height:16px; border-radius:50%; background:#BD9A4E; box-shadow:0 0 0 5px rgba(189,154,78,0.15), 0 2px 8px rgba(189,154,78,0.4); position:absolute; top:50%; left:{nowPct}%; transform:translate(-50%,-50%)`
- Prayer nodes (F/D/A/M/I): each is `position:absolute; top:0; bottom:0; left:{pct}%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; justify-content:space-between; width:28px`
  - Top: abbreviation text (9.5px, 700) — gold for next, `#C8C2B8` for past, `#8A8576` for future
  - Middle (aligned to track): dot `width:11px; height:11px; border-radius:50%` for next prayer (amber), `7px` for others
  - Bottom: time string (8.5px, tabular-nums) — only shown for next prayer (gold), transparent otherwise

**Prayer positions** — compute as percentage from Fajr to Isha+1h:
```js
const tlStart = fajrH - 0.25; // 15 min before Fajr
const tlEnd = ishaH + 1.0;
const tlSpan = tlEnd - tlStart;
const toContainerPct = h => Math.max(5, Math.min(95, 5 + ((h - tlStart) / tlSpan) * 90));
```

**Period labels** (update based on `nowH`):
| Condition | Label | Subtitle |
|---|---|---|
| `nowH < fajrH` | Night · Before Fajr | Last third of night |
| `nowH < sunriseH` | Fajr · Dawn | The blessed morning hour |
| `nowH < dhuhrH - 0.5` | Ḍuḥā · Mid-morning | Between sunrise and noon |
| `nowH < dhuhrH + 0.25` | Zawal · Midday | Dhuhr window opens |
| `nowH < asrH` | Afternoon | Between Dhuhr and Asr |
| `nowH < sunsetH` | Asr · Late afternoon | Window open |
| `nowH < ishaH` | Maghrib · Evening | Sunset to Isha |
| else | Night | After Isha |

**Footer (flex, space-between, `border-top:1px solid rgba(33,48,42,0.07)`, `padding-top:10px`):**
- Sunrise icon + time | Daylight duration | Sunset time + icon

---

### 2. Salah Log Card *(existing — keep)*

5 chips, one per prayer. Tap cycles: none → ontime → late → missed → excused → none.

**Chip states:**
| State | Background | Glyph | Colour |
|---|---|---|---|
| none | `rgba(33,48,42,0.05)`, dashed border | `·` | `#B7B1A1` |
| ontime | `rgba(12,90,59,0.12)` | `✓` | `#0C5A3B` |
| late | `rgba(189,154,78,0.18)` | `!` | `#9A7B2E` |
| missed | `rgba(176,60,52,0.12)` | `×` | `#B03C34` |
| excused | `rgba(74,110,140,0.14)` | `~` | `#3E6A8C` |

**localStorage key:** `salahLog_YYYY-MM-DD` → `{fajr:'ontime', dhuhr:'none', ...}`

---

### 3. Qurʾān Log Card *(new)*

**Layout:** Same cream card. Tapping navigates to Qurʾān Log screen.

**Header:** "Qurʾān Log · Today" label + total verses done + chevron arrow.

**Session chips** (one per prayer, flex row):
- Number shows verses read in that prayer's reading session (or `·` if none)
- `active` state: `background:rgba(12,90,59,0.12)`, green number
- `empty` state: `rgba(33,48,42,0.05)`, dashed border, muted `·`

**Juz progress bar:**
- Row: "Juz X / 30" left, "N-day streak" right
- Bar: `height:6px; background:rgba(33,48,42,0.08); overflow:hidden; border-radius:999px`
- Fill: `background:linear-gradient(90deg,#BD9A4E,#D8B978); width:{juz/30*100}%`

**Footer text:** `{minutes} min read · goal {n} verses · tap to log`

**State shape:**
```js
quranLog: {
  sessions: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, // verses per session
  timeMinutes: 0,       // reading time today
  juz: 6,               // current juz (1–30)
  dailyGoal: 10,        // user-set verse target
  streak: 14            // consecutive days goal met
}
```
**localStorage key:** `quranLog_YYYY-MM-DD` (sessions + time). `quranMeta` for juz + streak + goal.

---

### 4. Zikr Card *(new)*

**Layout:** Cream card. Tapping navigates to Azkar screen.

**Header:** "Zikr · Today" + tasbih total count.

**Azkar set chips** (flex row, 3 chips):
- Morning / After Prayer / Evening
- `done`: `background:rgba(12,90,59,0.10)`, green text
- `pending`: `rgba(33,48,42,0.05)`, grey text, `border:1px solid rgba(33,48,42,0.10)`

**State shape:**
```js
azkarSets: { morning: false, afterPrayer: false, evening: false }
tasbih: { count: 0, phase: 0, history: 0 } // history = completed-phase totals
```
**localStorage key:** `azkar_YYYY-MM-DD`, `tasbih_YYYY-MM-DD`

---

### 5. Good Deeds Card *(new)*

**Layout:** Cream card. Tapping navigates to Good Deeds screen.

**Header:** "Good Deeds · Today" + `done/total` count.

**Deed pills** (flex-wrap):
- 6 pills: Fasting, Sadaqah, Tahajjud, Learning, Helped someone, Recitation
- `done`: `rgba(12,90,59,0.12)`, green label
- `todo`: `rgba(33,48,42,0.05)`, grey label, light border
- Tapping on card opens detail screen; tapping individual pill toggles inline

**State shape:**
```js
goodDeeds: {
  fasting: false, sadaqah: false, tahajjud: false,
  learning: false, helping: false, recitation: false
}
```
**localStorage key:** `goodDeeds_YYYY-MM-DD`

---

### 6. Qurʾān Log Screen *(detail screen)*

Navigate to from: tap Qurʾān Log card on Today screen.

**Header:** Back button + eyebrow "Track your reading" + title "Qurʾān Log"

**Stat row (2 cards):**
- Green card: streak number (32px Newsreader) + "day streak"
- White card: weekly% (32px) + "goal met this week"

**Sessions list card:**
- Label: "Today's sessions · tap to add a verse"
- One row per prayer: dot (green=has verses, grey=0) + prayer name + prayer time + tap counter
- Tap counter: shows verse count (`font-family:Newsreader; 20px`) + "v" unit label
- Tapping increments the verse count for that session

**Juz grid:**
- 30 segments, `flex-wrap:wrap; gap:4px`
- Each: `flex-basis:calc(100%/6 - 4px); height:14px; border-radius:4px`
- `done` → `#0C5A3B` · `current` (juz in progress) → `rgba(12,90,59,0.35)` · `todo` → `rgba(33,48,42,0.08)`

**Goal adjustment:**
- `−` button (grey bg), number, `+` button (green bg)
- Range: 1–50 verses

---

### 7. Good Deeds Screen *(detail screen)*

Navigate to from: tap Good Deeds card on Today, or More → Good Deeds.

**Header:** Back → More + eyebrow "Daily ʿamal" + title "Good Deeds"

**Stat row:** Green card (deeds done today) + white card (total tracked deeds = 6)

**Deed list** (white card, `border-radius:24px`):
Each row: icon square (`42px`, `border-radius:13px`) + deed name + status label + checkmark circle

| done | `rgba(12,90,59,0.1)` icon bg · `#0C5A3B` colour · "Done today" · green filled circle + white checkmark |
| todo | `rgba(33,48,42,0.05)` icon bg · `#8A8576` colour · "Not yet logged" · empty circle with grey border |

Tapping a row toggles its state and updates the stat count.

**Footer:** "Tap to log · resets at Fajr · every good deed is rewarded."

---

### 8. Tasbīḥ Counter *(appended to existing Azkar screen)*

Placed below the existing azkar sets list.

**Container:** Dark green gradient card (`background:linear-gradient(150deg,#0C5A3B,#073A28)`, `border-radius:28px`, `padding:24px 20px 18px`, `text-align:center`)

**Elements (top to bottom):**
1. Arabic phrase (26px Amiri, `direction:rtl`, 90% white)
2. Transliteration (11px Hanken Grotesk, UPPERCASE, `#D8B978`, 1.2px tracking)
3. Count display (64px Newsreader, white, `tabular-nums`)
4. "of X · Y total today" (13px, 60% white)
5. Progress bar (4px, white 15% track → `#D8B978` fill, `transition:width 0.12s`)
6. Tap button (padding:18px, `rgba(255,255,255,0.14)` bg, 16px bold white)
7. Reset link (12px, 45% white)

**Three-phase cycle:** SubhanAllah ×33 → Alhamdulillah ×33 → AllahuAkbar ×34

**Counter logic:**
```js
const PHRASES = ['سُبْحَانَ ٱللَّهِ', 'ٱلْحَمْدُ لِلَّهِ', 'ٱللَّهُ أَكْبَرُ'];
const TARGETS = [33, 33, 34];

function tap() {
  count++;
  if (count >= TARGETS[phase % 3]) {
    history += count; count = 0; phase++;
  }
  saveToLocalStorage();
  render();
}
```
**localStorage key:** `tasbih_YYYY-MM-DD` → `{ count, phase, history }`  
Reset on app open if date has changed.

---

## Interactions & Behaviour

### Daily Reset
All log states reset at **Fajr time** for the current date. On app open, compare `localStorage.getItem('logDate')` to today's Fajr — if past Fajr and date differs, clear today's logs and write new date.

### Navigation Flow
```
Today screen
  ├── Qurʾān Log card tap  → Qurʾān Log screen
  ├── Zikr card tap        → Azkar screen (scroll to Tasbih)
  └── Good Deeds card tap  → Good Deeds screen

More screen
  └── Good Deeds row       → Good Deeds screen

Azkar tab
  └── (existing azkar list + new tasbih at bottom)
```

### Streak Logic
A streak increments when the **daily verse goal** is met by the end of that day. Store `streak` and `lastStreakDate` in `quranMeta` localStorage key.

---

## Assets
- **Fonts:** Google Fonts CDN — `Newsreader`, `Hanken Grotesk`, `Amiri` (already loaded in existing app)
- **Icons:** No new icon libraries needed — all glyphs are Unicode characters (`✓ ! × ~ ص ♡ ☾ ✎ ✤ ◎`) or inline SVG chevrons

---

## Files
| File | Purpose |
|---|---|
| `components-reference.html` | **Start here** — interactive visual reference, open in any browser |
| `prototype-reference.dc.html` | Full prototype with navigation between all screens |
| `README.md` | This document |
