# SoEchoes — Design System

> **Goal:** Cozy, intimate, nostalgic. Like reading an old diary at midnight.  
> **Anti-goal:** Clean, corporate, minimal tech. NOT another dark SaaS product.

---

## Color Tokens

```css
:root {
  /* Backgrounds */
  --bg:              #0a0907;   /* warm dark — late-night room */
  --surface:         #131109;   /* memory cards, panels */
  --surface-hover:   #1a1710;   /* hover state for cards */

  /* Glass (for memory cards, overlays) */
  --glass-bg:        rgba(255, 240, 200, 0.04);
  --glass-border:    rgba(255, 240, 200, 0.08);
  --glass-blur:      12px;

  /* Text */
  --text-primary:    #f0e6d3;   /* warm off-white — aged paper */
  --text-secondary:  #b8a48a;   /* warm mid */
  --text-muted:      #9a8a72;   /* very muted */
  --text-dim:        #6a5a48;   /* almost invisible */

  /* Accent */
  --accent:          #d4956a;   /* candlelight amber — the soul of the brand */
  --accent-glow:     rgba(212, 149, 106, 0.15);

  /* Category Colors — all muted/warm, no harsh primaries */
  --love:            #c97b7b;   /* muted rose */
  --chaos:           #c9a84c;   /* warm gold */
  --regret:          #7b92b5;   /* soft blue-grey */
  --growth:          #7da888;   /* sage green */
  --latenight:       #8b80b5;   /* muted lavender */
  --milestone:       #d4956a;   /* amber (same as accent) */
  --forsomeone:      #c4845a;   /* warm candle orange */

  /* Map */
  --pin-default:     #d4956a;
  --pin-spot:        #f0b47a;   /* brighter/warmer for Spots */
  --pin-glow:        rgba(212, 149, 106, 0.3);
}
```

---

## Typography

All fonts from Google Fonts — **free, no cost**.

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=Lora:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Wordmark / Hero | `Instrument Serif` | 400 | "SoEchoes" logo, page titles |
| Headings | `Instrument Serif` | 400, italic | Section headers |
| UI / Body | `Inter` | 300, 400, 500 | Buttons, labels, nav, metadata |
| Memory quotes | `Lora` | 400, italic | The actual memory text content |

```css
--font-display:  'Instrument Serif', Georgia, serif;
--font-body:     'Inter', system-ui, sans-serif;
--font-memory:   'Lora', Georgia, serif;
```

---

## Glassmorphism (Memory Cards)

```css
.memory-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
```

---

## Grain / Noise Overlay (The "not AI" texture)

Add this to the root layout. Makes the whole product feel like paper, not a screen.

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.028;
  pointer-events: none;
  z-index: 9999;
}
```

---

## UI Libraries to Use (Copy-Paste, All Free)

### Aceternity UI — `https://ui.aceternity.com`

> Copy components directly into `src/components/ui/` — no npm install needed.

| Component | Where to use |
|-----------|-------------|
| `TextGenerateEffect` | Landing page hero: *"A map of the places that changed us."* — text fades in word by word |
| `BackgroundBeams` | Landing page — very low opacity (`0.15`), warm-tinted (`#d4956a`) — subtle depth behind hero |
| `HeroHighlight` | Highlight key words in landing copy |
| `Spotlight` | Optional: spotlight effect behind map section |

**Install dependencies for Aceternity components:**
```bash
npm install framer-motion clsx tailwind-merge
```

**Required `cn` utility** (`src/lib/utils.ts`):
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### Magic UI — `https://magicui.design`

| Component | Where to use |
|-----------|-------------|
| `BlurFade` | Staggered content reveals on landing, memory cards fading in on map |
| `AnimatedGradientText` | Tagline animation: *"A map of the places that changed us."* |
| `NumberTicker` | Emotional analytics numbers (e.g., "2,431 memories") |

---

### shadcn/ui — `https://ui.shadcn.com`

Used for base interactive components. Init with:
```bash
npx shadcn@latest init
```

| Component | Where to use |
|-----------|-------------|
| `Button` | All CTAs — customize to match design tokens |
| `Dialog` | Memory viewer overlay |
| `Textarea` | Memory contribution form |
| `Badge` | Category tags on memory cards |
| `Sheet` | Mobile memory panel (slides up from bottom) |

---

## Animation Principles (Framer Motion)

### Memory card entrance (stagger)
```tsx
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
```

### Pin hover (spring, not ease)
```tsx
whileHover={{ scale: 1.2, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
```

### "I felt this too" tap
```tsx
whileTap={{ scale: 0.92 }}
// then on complete: counter increments with a spring bounce
```

### Page transitions (View Transitions API — native, no library)
```css
@view-transition { navigation: auto; }
```

---

## Map Style

- **Tile provider:** CartoDB Dark Matter — `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- **Attribution:** Required by CartoDB (add to map)
- **Max zoom:** 18 (campus level detail)
- **Starting view:** World level, center on user's approximate location

### Pin Design
- Default memory: `12px` warm amber circle, soft glow ring
- The Spot: `18px`, brighter, pulse animation
- Hovered: spotlight reveal effect (CSS masks)
- Clustered: number badge, same amber tone

---

## Sound Design (Howler.js)

```bash
npm install howler
```

### Sound mapping
| Memory Category | Sound |
|----------------|-------|
| 🌙 Late-Night | Soft rain, distant thunder |
| 📚 Library/Growth | Page turning, AC hum |
| ❤️ Love | Gentle wind |
| 😂 Chaos | Distant crowd chatter |
| 🎓 Milestones | Soft chime |
| 😔 Regret | Wind |
| 🕯️ For Someone | Candle flicker (no sound) → silence IS the sound |

**Implementation rule:** Volume max `0.15`. Fade in over 2s. Fade out when memory closes.  
**Free sound sources:** `freesound.org` (Creative Commons sounds, free to use)

---

## Layout Rules

- Max content width: `1280px`
- Map takes full viewport on the map page
- Memory panel: slides in from the right on desktop, sheet from bottom on mobile
- Landing page: single long-scroll, no pagination
- No sidebars. No complex navigation. Keep it focused.

---

## What This Should Feel Like

When someone opens SoEchoes, they should feel like:
- Opening an old diary they forgot they kept
- Finding a handwritten note in a library book
- Sitting alone at midnight and realizing someone else was sitting in the same spot years ago

It should NOT feel like:
- A social media app
- A startup landing page
- Anything with a blue gradient
