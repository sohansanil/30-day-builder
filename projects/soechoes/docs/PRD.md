# SoEchoes — Product Requirements Document

**Version:** 1.0  
**Project:** Day 19–21 of 30-Day Builder  
**Status:** Locked for Build  

---

## Product Name

**SoEchoes**  
*A map of the places that changed us.*

---

## Problem Statement

Every young person has at least one place they never forget.

A library staircase where they cried after failing their first interview.  
A hostel rooftop where they spent nights unsure of their future.  
A canteen table where they met their closest friends.  
A bus stop where they said goodbye.

To everyone else, these places look ordinary.  
To us, they became part of who we are.

The problem: nobody knows this happened. And the person experiencing it always thinks they're alone.

**SoEchoes answers one question:**
> "Did anybody else feel this too?"

---

## Product Thesis

SoEchoes is not a map app.  
SoEchoes is not a social network.  
SoEchoes is not a confession board.

SoEchoes is:
> A digital archive of the places that shaped us during the strangest years of our lives.

The map is just the interface.  
The product is: **"Other people felt what I felt."**

---

## Target User

- College students (18–25)
- Recent graduates (25–30) with strong campus nostalgia
- Anyone who has a "place" from their younger years

The emotional profile: someone who has a spot — a place they returned to repeatedly while figuring themselves out.

---

## Core User Journey (3 emotional moments)

### Moment 1: Discovery
User explores a campus on the map. Memory pins appear. They click one and read a fragment of someone else's life. The feeling: *"Someone felt exactly what I felt."*

### Moment 2: Leaving Something Behind
User decides to contribute. The interface makes this feel ceremonial, not transactional. The feeling: *"I'm leaving something here forever."*

### Moment 3: Realizing You Were Never Alone
User's memory gets "I felt this too" responses from strangers. The feeling: *"Other people understand."*

---

## Core Features (MVP — Locked)

### 1. Map (Leaflet.js + CartoDB Dark Matter tiles)
- Dark, moody, interactive map
- Zoom: World → Country → Campus → Memory pin
- Memory pins render as warm glowing dots
- "The Spot" pins render larger and warmer
- No login required to browse

### 2. Memory Pins
- Each pin has: location, text (max 280 chars), category, timestamp, "I felt this too" count
- Anonymous — no name, no avatar, no profile
- Categories: ❤️ Love | 😂 Chaos | 😔 Regret | 🌱 Growth | 🌙 Late-Night Thoughts | 🎓 Milestones | 🕯️ For Someone
- Pin hover: spotlight CSS reveal effect (CSS masks, no JS animation)

### 3. "Take Me Somewhere Human" Button
- Lives on the landing page hero AND the map page
- Drops user onto a random memory anywhere in the world
- This is the cold-start solution and the core discovery loop
- The globe/map animates to that location

### 4. The Spot
- When leaving a memory, user can mark: "Was this your spot? Yes / No"
- Spots render differently: larger pin, warmer glow, "X people called this their spot"
- Filter on map: "Show me people's spots"

### 5. Contribution Ritual
- Not a form. A ceremony.
- Interface copy fades in:
  > *"You are about to leave something here forever."*  
  > *"Someone may find this years from now."*  
  > *"They will never know who you are. You will never know who they are."*  
  > *"That's the point."*
- Then: a text area appears. Category picker. "Leave it here" button.
- Zero required fields except text and rough location

### 6. "I Felt This Too"
- The ONLY interaction on a memory (no likes, no comments, no shares)
- One tap per memory per session (no account needed, use localStorage)
- Counter shows: "🤍 47 people felt this too"
- The interaction means: "I experienced this emotion" — NOT "I enjoyed this content"

### 7. 🕯️ For Someone category
- Special category for memories dedicated to someone the writer will never tell
- Examples: a professor, an ex, a parent, a lost friend
- The most emotionally resonant category in the product

### 8. Ambient Audio (Howler.js)
- Triggered on memory open — barely noticeable
- Context-aware:
  - Library memory → soft page turning, AC hum
  - Rooftop memory → wind
  - Canteen memory → distant chatter
  - Late night → rain, quiet
- NOT music. Presence. The user shouldn't notice it consciously.

### 9. Emotional Analytics (Day 3)
- Per-campus breakdown:
  ```
  MIT Manipal
  ══════════════
  2,431 memories left behind
  
  ❤️ 24%  😂 18%  😔 31%  🌱 20%  🎓 7%
  ```
- Heatmap overlay showing where emotions cluster

---

## Features Explicitly CUT from MVP

| Feature | Why Cut |
|---------|---------|
| Time capsules | Needs years of data to be meaningful |
| Memory aging | Same — needs real historical depth |
| User profiles | Wrong product — anonymity is core |
| Auth / login | Creates friction, kills anonymous trust |
| Comments | Wrong tone — not a conversation platform |
| Followers / notifications | Wrong product |
| Globe (react-globe.gl) | Flat map IS the product. Globe = distraction. |
| Moderation dashboard | Post-MVP |

---

## North Star Question

Before every feature decision, ask:
> **"Does this make someone feel less alone?"**

If no → don't build it.

---

## Success Metric (Day 21)

The product has succeeded if:
- Someone reads a memory and says "oh my god, that's me"
- Someone leaves a memory and feels they've left something real behind
- One person hits "I felt this too" and feels less alone

Numbers don't matter on day 21. The feeling does.

---

## Tagline Options (in priority order)
1. *A map of the places that changed us.* ← **Primary**
2. *Places remember who we were.*
3. *Every campus has ghosts.*
