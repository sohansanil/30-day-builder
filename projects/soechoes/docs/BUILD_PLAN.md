# SoEchoes — 3-Day Build Plan

**Days:** 19, 20, 21 of 30-Day Builder  
**Theme:** Build emotions, not features.

---

## Tech Stack (All Free, $0 Cost)

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | **Next.js 14 App Router** | `npx create-next-app@latest soechoes` |
| Styling | **Tailwind CSS** | Init with Next.js |
| Components | **shadcn/ui** | `npx shadcn@latest init` |
| UI Effects | **Aceternity UI** | Copy-paste from `ui.aceternity.com` |
| UI Effects | **Magic UI** | Copy-paste from `magicui.design` |
| Animations | **Framer Motion** | `npm install framer-motion` |
| Map | **react-leaflet** | `npm install react-leaflet leaflet` |
| Map tiles | **CartoDB Dark Matter** | Free, no API key needed |
| Database | **Supabase** | Free tier — no credit card |
| Sound | **Howler.js** | `npm install howler` |
| Fonts | **Google Fonts** | Instrument Serif + Inter + Lora |

---

## Supabase Schema

```sql
-- Memories table
create table memories (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  category text not null, -- 'love' | 'chaos' | 'regret' | 'growth' | 'latenight' | 'milestone' | 'forsomeone'
  lat decimal(10, 8) not null,
  lng decimal(11, 8) not null,
  is_spot boolean default false,
  felt_count integer default 0,
  location_name text, -- "MIT Manipal" or "Library, IIT Bombay"
  created_at timestamptz default now()
);

-- Enable PostGIS for geo queries (optional for MVP)
-- create extension if not exists postgis;

-- RLS: anyone can read, anyone can insert (anonymous)
alter table memories enable row level security;
create policy "Anyone can read memories" on memories for select using (true);
create policy "Anyone can insert memories" on memories for insert with check (char_length(text) <= 280);
```

**Supabase setup steps:**
1. Go to `supabase.com` → New Project (free)
2. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Create `.env.local` in project root

```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Day 19 — Build Discovery

**Emotion to nail:** The feeling of discovering that someone else felt what you felt.

### Tasks
- [ ] Initialize Next.js project
- [ ] Set up Tailwind, shadcn/ui, Framer Motion
- [ ] Create design token CSS variables (from DESIGN_SYSTEM.md)
- [ ] Add Google Fonts (Instrument Serif, Inter, Lora)
- [ ] Add grain/noise overlay
- [ ] Build landing page:
  - [ ] Hero with `TextGenerateEffect` (Aceternity)
  - [ ] `BackgroundBeams` at very low opacity
  - [ ] "Explore the map" CTA button
  - [ ] "Take Me Somewhere Human" CTA button
  - [ ] Sample memories showcase (static, seeded)
- [ ] Build map page:
  - [ ] `react-leaflet` with CartoDB Dark Matter tiles
  - [ ] Memory pins rendering (amber glowing dots)
  - [ ] Spot pins (larger, pulse animation)
  - [ ] Memory viewer (Dialog/Sheet from shadcn)
  - [ ] "Take Me Somewhere Human" button on map
- [ ] Connect Supabase — read memories from DB
- [ ] Seed 20–30 real-feeling sample memories across multiple campuses

### Day 19 Seeded Memories (examples)
Use these + write more to seed the DB before launch:
```
MIT Manipal | Library stairs | 😔 Regret | "Bombed my first coding interview and cried here for 20 minutes."
MIT Manipal | Hostel rooftop | 🌙 Late-Night | "Came here every night for 3 months because I didn't know what I wanted to be."
IIT Bombay | H8 mess | 😂 Chaos | "Accidentally called my prof 'bro' in front of the whole class."
BITS Pilani | Convo lake | ❤️ Love | "She never knew I used to time my walks so I'd run into her."
VIT Vellore | Silver Jubilee | 🌱 Growth | "Sat here after getting rejected from 14 companies. Got placed the next week."
Random | Bus stop | 🕯️ For Someone | "Dad, I got the internship. You said I would. I didn't believe you."
```

---

## Day 20 — Build Contribution

**Emotion to nail:** The feeling of leaving something behind forever.

### Tasks
- [ ] Build contribution flow:
  - [ ] "Leave a memory here" button on map (click-to-place pin)
  - [ ] Contribution ritual modal — ceremony copy fades in word by word
  - [ ] Text area for memory (280 char limit, live counter)
  - [ ] Category picker (7 categories, warm pill buttons)
  - [ ] "Was this your spot?" toggle (Yes/No)
  - [ ] "Leave it here" submit button
  - [ ] Optimistic UI — pin appears instantly on map before DB confirm
- [ ] Build "🕯️ For Someone" category special treatment:
  - [ ] Different empty state placeholder text: *"Who is this for?"*
  - [ ] Slightly different card styling when viewed
- [ ] Spot system:
  - [ ] Spots render differently on map
  - [ ] "X people called this their spot" on memory viewer
  - [ ] "Show me people's spots" filter on map
- [ ] Ambient audio (Howler.js):
  - [ ] Download/source free sounds from freesound.org
  - [ ] Map category → sound file
  - [ ] Fade in on memory open, fade out on close
  - [ ] Respect `prefers-reduced-motion`

---

## Day 21 — Build Connection + Polish

**Emotion to nail:** The feeling of realizing you were never alone.

### Tasks
- [ ] "I felt this too" interaction:
  - [ ] Single tap on memory viewer
  - [ ] localStorage check (one per memory per session)
  - [ ] Optimistic counter update
  - [ ] Spring animation on tap (`whileTap={{ scale: 0.92 }}`)
  - [ ] Counter: "🤍 47 people felt this too"
- [ ] Emotional analytics page (per campus):
  - [ ] `/campus/[slug]` route
  - [ ] Total memories count (Magic UI `NumberTicker`)
  - [ ] Category breakdown percentage bars
  - [ ] Most-felt memory of the campus
- [ ] Polish:
  - [ ] Mobile responsive (Sheet from bottom on mobile)
  - [ ] Loading states — warm skeleton loaders
  - [ ] Empty state — if campus has no memories yet
  - [ ] 404 page in the SoEchoes tone
  - [ ] Page transitions (View Transitions API)
  - [ ] OG image for social sharing
- [ ] Write the LinkedIn post while the product is fresh

---

## File Structure

```
soechoes/
├── docs/               ← You are here
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Landing page
│   │   ├── map/page.tsx          ← Main map page
│   │   ├── campus/[slug]/        ← Campus analytics
│   │   └── layout.tsx            ← Root layout + fonts + grain overlay
│   ├── components/
│   │   ├── ui/                   ← shadcn + Aceternity + Magic UI components
│   │   ├── map/
│   │   │   ├── MapView.tsx       ← react-leaflet map
│   │   │   ├── MemoryPin.tsx     ← Individual pin component
│   │   │   └── SpotPin.tsx       ← Spot pin variant
│   │   ├── memory/
│   │   │   ├── MemoryCard.tsx    ← Memory viewer card
│   │   │   ├── MemoryForm.tsx    ← Contribution form
│   │   │   └── ContributionRitual.tsx ← Ceremony copy component
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   └── SampleMemories.tsx
│   │   └── TakeMeSomewhere.tsx   ← "Take Me Somewhere Human" button + logic
│   ├── lib/
│   │   ├── supabase.ts           ← Supabase client
│   │   ├── utils.ts              ← cn() utility
│   │   └── sounds.ts             ← Howler.js sound manager
│   └── styles/
│       └── globals.css           ← Design tokens + grain overlay + base styles
├── public/
│   └── sounds/                   ← Ambient audio files (mp3)
└── .env.local                    ← Supabase keys (never commit this)
```

---

## Key Implementation Notes

### react-leaflet (SSR issue fix)
Leaflet doesn't work with SSR. Always use dynamic import:
```tsx
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });
```

### "Take Me Somewhere Human" logic
```tsx
// Fetch a random memory from Supabase
const { data } = await supabase
  .from('memories')
  .select('*')
  .order('random()') // or use a random offset
  .limit(1)
  .single();

// Then fly the map to that location
mapRef.current?.flyTo([data.lat, data.lng], 16, { duration: 2.5 });
```

### Optimistic "I felt this too"
```tsx
// 1. Check localStorage
const key = `felt_${memoryId}`;
if (localStorage.getItem(key)) return; // already felt

// 2. Update UI immediately
setFeltCount(prev => prev + 1);
setHasFelt(true);
localStorage.setItem(key, '1');

// 3. Update DB in background
supabase.rpc('increment_felt_count', { memory_id: memoryId });
```

### Supabase RPC for atomic increment
```sql
create function increment_felt_count(memory_id uuid)
returns void as $$
  update memories set felt_count = felt_count + 1 where id = memory_id;
$$ language sql security definer;
```

---

## Definition of Done (Day 21)

The build is done when:
1. A stranger can land on the site and immediately feel something
2. They can leave a memory without creating an account
3. They can hit "I felt this too" and feel heard
4. The "Take Me Somewhere Human" button drops them somewhere real
5. It works on mobile

That's it. Nothing else matters on Day 21.
