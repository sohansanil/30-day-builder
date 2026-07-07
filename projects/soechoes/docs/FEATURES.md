# SoEchoes — Feature Specifications

> This doc exists so no context is lost between sessions.  
> Every feature decision has been deliberated and locked. Do not reopen closed decisions.

---

## Locked Feature List

### ✅ IN — Build these
| Feature | Description | Day |
|---------|-------------|-----|
| Dark map (Leaflet + CartoDB) | World → campus → pin navigation | 19 |
| Memory pins | Glowing amber dots on map | 19 |
| Memory viewer | Click pin → read memory in overlay | 19 |
| "Take Me Somewhere Human" | Random memory button, on landing + map | 19 |
| Seeded memories | 20–30 pre-written real-feeling memories | 19 |
| Ambient audio | Soft sounds on memory open (Howler.js) | 19 |
| Contribution ritual | Ceremony copy before form | 20 |
| Anonymous posting | No login, no account | 20 |
| Category system | 7 categories (see below) | 20 |
| "The Spot" | Mark as your recurring spot | 20 |
| 🕯️ For Someone | Special category for unsent dedications | 20 |
| "I felt this too" | Single anonymous reaction per memory | 21 |
| Emotional analytics | Per-campus breakdown | 21 |
| Mobile responsive | Sheet from bottom on mobile | 21 |
| OG image | For LinkedIn post sharing | 21 |

### ❌ OUT — Do not build these
| Feature | Reason |
|---------|--------|
| Time capsules | Needs years of real data |
| Memory aging | Same reason |
| User profiles | Kills anonymity trust |
| Login / auth | Wrong product |
| Comments | Wrong emotional tone |
| Follows / likes | Wrong product category |
| Globe (react-globe.gl) | Flat map IS the product |
| Moderation dashboard | Post-MVP |
| Share button | OG meta tags are enough |
| Notifications | Wrong product |

---

## Memory Categories (Locked)

| Emoji | Name | CSS Variable | Color |
|-------|------|-------------|-------|
| ❤️ | Love | `--love` | `#c97b7b` (muted rose) |
| 😂 | Chaos | `--chaos` | `#c9a84c` (warm gold) |
| 😔 | Regret | `--regret` | `#7b92b5` (soft blue-grey) |
| 🌱 | Growth | `--growth` | `#7da888` (sage) |
| 🌙 | Late-Night Thoughts | `--latenight` | `#8b80b5` (muted lavender) |
| 🎓 | Milestones | `--milestone` | `#d4956a` (amber) |
| 🕯️ | For Someone | `--forsomeone` | `#c4845a` (candle orange) |

---

## "Take Me Somewhere Human" — Full Spec

**Trigger:** Button on landing hero + floating button on map  
**Animation:** Map pans/flies to memory location over ~2.5s  
**On land:** Memory pin pulses, memory viewer opens automatically  
**Empty state:** If DB has 0 memories (shouldn't happen — we seed)  

```tsx
// Button copy variants (rotate randomly):
const copies = [
  "Take me somewhere human.",
  "Show me something real.",
  "Take me somewhere.",
];
```

**This is NOT a gimmick. It's the cold-start solution.**  
Without it, a new user on an empty campus sees nothing.  
With it, a new user immediately experiences the emotional core of the product.

---

## The Spot — Full Spec

**What it is:** A place someone repeatedly returned to — not a one-time memory.

**UI distinction:**
- Regular pin: 12px, amber, soft glow
- Spot pin: 18px, brighter amber (`#f0b47a`), pulse animation, slightly raised z-index

**On memory form:**
```
Was this your spot?

[ Yes — I kept coming back here. ]  [ No ]
```

**On memory viewer (if is_spot = true):**
```
📍 Hostel Rooftop

"Spent 3 months coming here every night..."

🏠 31 people called this their spot.
🤍 143 people felt this too.
```

**Map filter:**
- Toggle button: "Show spots only"
- When active: non-spot pins fade to 30% opacity

---

## Contribution Ritual — Full Spec

This is a ceremony, not a form. The copy should fade in progressively.

**Step 1 — Ceremony (2.5s fade-in sequence):**
```
You are about to leave something here forever.

Someone may find this years from now.

They will never know who you are.
You will never know who they are.

That's the point.
```

**Step 2 — The form appears:**
```
What happened here?
[textarea — max 280 chars, live counter]

How would you describe this?
[❤️ Love] [😂 Chaos] [😔 Regret] [🌱 Growth] [🌙 Late-Night] [🎓 Milestones] [🕯️ For Someone]

Was this your spot?
[Yes] [No]

[Leave it here.]
```

**After submit:**
- Optimistic: pin appears immediately on map
- Memory viewer opens with their new memory
- Soft ambient sound plays
- No "success" toast/banner — the pin appearing IS the confirmation

---

## 🕯️ For Someone — Full Spec

This is the most emotionally resonant category.

**What it means:** A memory dedicated to a specific person the writer will never tell.

**Placeholder text in form:**
```
Who is this for? What do you wish you'd said?
```

**Card treatment (slightly different from other categories):**
- Slightly warmer background tint
- Candle emoji displayed subtly
- No ambient sound — silence IS the sound for this category

**Example memories to seed:**
```
"Dad, I got the internship. You said I would. I didn't believe you."
"Professor Rao, you probably don't remember me, but you stopped me from dropping out."
"I never told you I liked you. I hope you're doing well, wherever you are."
"To my roommate who moved abroad — I miss you every time I walk past your empty bed."
```

---

## Ambient Sound — Full Spec

**Library:** `howler.js`  
**Install:** `npm install howler`  
**Source:** freesound.org (filter: Creative Commons 0 — fully free)

**Sound files to download:**
| File name | Category trigger | Description |
|-----------|-----------------|-------------|
| `rain-soft.mp3` | Late-Night | Soft steady rain |
| `wind-gentle.mp3` | Regret, For Someone | Gentle breeze |
| `pages-turning.mp3` | Growth | Library ambience |
| `crowd-distant.mp3` | Chaos | Distant chatter |
| `chime-soft.mp3` | Milestones | Single soft chime |
| `silence.mp3` | For Someone | Actually silence — no file needed |

**Rules:**
- Max volume: `0.12`
- Fade in: 2000ms
- Fade out on close: 1000ms
- Only play if user has interacted with page first (browser autoplay policy)
- Respect `prefers-reduced-motion` → no sound

---

## "I Felt This Too" — Full Spec

**The core interaction of the entire product.**

**Visual:**
```
🤍 47 people felt this too.
```

**On tap:**
- Spring scale animation: `whileTap={{ scale: 0.92 }}`
- Counter increments immediately (optimistic)
- Heart fills: 🤍 → 🤎 (warm brown, matching brand)
- localStorage prevents re-tapping

**What it is NOT:**
- Not a like
- Not an upvote
- Not engagement gamification

**What it IS:**
- A quiet signal: "I was here too. I felt this."

---

## Seeded Memory List (Write Before Launch)

Must have at least 25 seeded memories before showing the product to anyone.  
Spread across: MIT Manipal, IIT Bombay, BITS Pilani, VIT, a few international locations.

Categories to cover: at least 3 memories per category.  
Make sure "For Someone" has 4–5 really good ones.  
Make sure there's at least one funny one per campus ("Chaos" category).

**These need to feel REAL. Not like an AI wrote them.**  
Write them yourself or have a friend write them.  
The first memories someone reads will determine whether they trust the product.
