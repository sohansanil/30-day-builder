# IsSheMadAtMe.com — Implementation Plan

> **Goal:** Build the most memorable version of IsSheMadAtMe.com in a single focused day.  
> **Stack:** Vite + vanilla HTML/CSS/JS + one serverless function  
> **Philosophy:** The report is the product. The share card is the distribution. The AI output is the soul.

---

## Table of Contents

1. [Milestone Plan](#1-milestone-plan)
2. [Single-Day MVP Definition](#2-single-day-mvp-definition)
3. [Report JSON Schema](#3-report-json-schema)
4. [Share Card Design Specification](#4-share-card-design-specification)
5. [Prompt Testing Strategy](#5-prompt-testing-strategy)
6. [Conflicting Requirements Resolution](#6-conflicting-requirements-resolution)

---

## 1. Milestone Plan

### Overview

```
M1  Design Foundation        ██░░░░░░░░░░░░░░░░░░  ~1.5 hrs
M2  Landing + Upload         ████░░░░░░░░░░░░░░░░  ~2 hrs
M3  Loading Theater          ██████░░░░░░░░░░░░░░  ~1.5 hrs
M4  Analysis Engine          ████████░░░░░░░░░░░░  ~2.5 hrs
M5  The Report               ██████████░░░░░░░░░░  ~3 hrs
M6  Share Card + Sharing     ████████████░░░░░░░░  ~2 hrs
M7  Polish + Error States    ██████████████░░░░░░  ~1.5 hrs
M8  Deploy + Validate        ████████████████░░░░  ~1 hr
                                            TOTAL  ~15 hrs
```

---

### M1 — Design Foundation (~1.5 hrs)

**What gets built:**
- Project scaffold via Vite (vanilla JS template)
- `index.html` — semantic skeleton with all three views (landing, loading, report) as sections toggled by CSS class on `<body>`
- `style.css` — complete design system:
  - All CSS custom properties (colors, typography, spacing) from PRD Section 9
  - Base element styles (body, headings, paragraphs, links)
  - Paper texture via CSS (`background-image` with subtle noise SVG data URI)
  - Utility classes for font families, verdict colors, section layouts
- Google Fonts linked (Playfair Display 400/700, IBM Plex Mono 400/500, Inter 400/500)
- Favicon (magnifying glass + chat bubble — simple SVG)
- `<meta>` tags for SEO and social sharing (OG title, description, image placeholder)
- Mobile viewport + base responsive rules

**Exit criteria:** Opening the page shows the parchment background with correct fonts loaded. The design tokens are usable from any element. All three views can be toggled by changing a class on `<body>`.

**Why first:** Every subsequent milestone inherits this visual identity. Building components on unstyled HTML produces ugly intermediates that erode confidence in the product direction.

---

### M2 — Landing Page + Upload (~2 hrs)

**What gets built:**
- **Hero section:**
  - Headline in Playfair Display: "Submit your evidence. Get the truth."
  - Sub-headline in Inter
  - "Submit Evidence" CTA button (red, wide, Playfair Display)
- **Upload drop zone:**
  - Styled as case file intake (dashed border, document icon)
  - Four states: idle, drag-hover, file-selected, error
  - Drag-and-drop + click-to-browse
  - Client-side validation (file type, file size ≤10MB)
  - In-character error messages for each validation failure
  - Image compression via `browser-image-compression` (target ≤2MB)
  - Base64 conversion
- **Context field:**
  - Subtle textarea below the drop zone
  - Label: "Anything this office should know? (Optional.)"
  - Rotating placeholder text on each page load
- **Footer:**
  - "The Relationship Forensics Lab" + in-character disclaimer
- **Mobile layout:**
  - Full-width drop zone
  - Touch-friendly CTA sizing (min 48px tap target)

**Exit criteria:** A user can drag a screenshot onto the page (or tap to select on mobile), optionally add context, and click "Submit Evidence." The file is validated, compressed, and converted to base64 in memory. The UI provides clear in-character feedback for every state.

---

### M3 — Loading Theater (~1.5 hrs)

**What gets built:**
- **Full-page loading screen:**
  - Dark navy background (`--bg-inverse`)
  - All text in IBM Plex Mono, light color (`--ink-inverse`)
  - Header: "THE RELATIONSHIP FORENSICS LAB / Case Intake System"
  - Typewriter animation: lines appear character by character
  - 6 analysis steps with animated progress bars
  - Rotating copy pools (2 groups of 6 descriptions each)
  - Final line in Playfair Display italic — contrast moment
- **Timing logic:**
  - Minimum 4-second display regardless of API response time
  - If API completes before 4s, hold on loading screen until minimum elapsed
  - If API takes >8s, show in-character patience message
  - Smooth transition to report view when both conditions met (API done + minimum time elapsed)
- **State coordination:**
  - Loading screen begins when "Submit Evidence" is clicked
  - API call fires immediately (runs in parallel with the animation)
  - Report data is stored in state, waiting for the animation to finish

**Exit criteria:** Clicking "Submit Evidence" triggers a full-page transition to the loading screen. The console text builds line by line. Progress bars animate. The final line appears in serif. After ≥4 seconds, the screen transitions out. Repeat loads show different analysis step descriptions.

---

### M4 — Analysis Engine (~2.5 hrs)

**What gets built:**
- **Serverless function** (`api/analyze.js`):
  - Receives POST with `{ imageBase64, mediaType, contextNote? }`
  - Validates input (image present, reasonable size)
  - Calls vision API with the full system prompt
  - Parses JSON response with error handling for malformed output
  - Generates case number (6-digit)
  - Returns structured report data
  - Error responses in a structured format the client can map to in-character messages
- **System prompt** (stored as a constant in the serverless function):
  - Full Dr. Read character definition
  - Exact JSON schema specification
  - Quality guidelines (specificity, deadpan tone, severity escalation)
  - Edge case handling instructions (blurry images, insufficient text, non-conversation images)
- **Client-side integration:**
  - `submitEvidence()` function that sends the compressed base64 to the API
  - Response validation (check all required fields present)
  - Error handling with in-character messages for each failure mode
- **Prompt testing:** Run at least 5 real screenshots through the API during development to validate output quality before building the report renderer

**Exit criteria:** A real screenshot can be uploaded, sent to the vision API, and a structured JSON report is returned with all required fields. The findings are specific to the actual screenshot content, not generic.

> [!IMPORTANT]
> **This is the most critical milestone.** The system prompt must produce consistently specific, funny, in-character output. If the AI returns generic findings ("she seems upset"), the product fails regardless of how beautiful the report looks. Budget extra time here for prompt iteration.

---

### M5 — The Report (~3 hrs)

**What gets built:**
- **Report header:**
  - "THE RELATIONSHIP FORENSICS LAB" in tracked monospace
  - Case number + filing date
  - Classification banner (full-width, colored by verdict level)
- **Section 1 — Evidence Summary:**
  - Estimated message count, timespan, context status
  - Styled as a structured data block (monospace, labeled fields)
- **Section 2 — Key Findings (3-5):**
  - Each finding: number, title (caps), body, severity tag
  - Severity tags color-coded: POSITIVE (green), NOTABLE (olive), CONCERNING (amber), CRITICAL (red)
  - Individual fade-in animation for each finding
- **Section 3 — Probability Matrix:**
  - 4 horizontal bars with labels and percentages
  - Bars fill from left to right on scroll-into-view (IntersectionObserver)
  - Percentage numbers count up simultaneously
  - Color gradient based on value (green → red)
- **Section 4 — The Verdict:**
  - Large verdict badge (styled as rubber stamp — rotated, thick border, imperfect edges)
  - Verdict name in large Playfair Display
  - Verdict statement (2-3 sentences)
  - Stamp animation: scales from 1.15→1.0 with spring easing + slight rotation
  - "Share Report" CTA immediately after verdict
- **Section 5 — Operative Directives:**
  - 3 numbered directives in monospace
  - Final directive occasionally more human in tone
- **Report footer:**
  - Case number, date, lab name
  - Disclaimer in character
  - "Run Another Case" CTA
- **Staggered reveal animation:**
  - Each section fades in with `translateY` offset
  - Delays: 0ms, 150ms, 300ms per finding, 800ms matrix, 1200ms verdict, 1400ms directives

**Exit criteria:** A complete forensic report renders with full styling, all 5 sections, staggered animations, animated probability bars, and the verdict stamp. The report looks like a real document, not a web page. The verdict stamp feels physical. A "Share Report" button is prominently placed.

---

### M6 — Share Card + Sharing (~2 hrs)

**What gets built:**
- **Share card HTML template** (hidden off-screen element styled for capture):
  - Dimensions: 1080×1350px (4:5 ratio — works for Instagram, Twitter, and group chats)
  - Layout as specified in [Section 4 of this document](#4-share-card-design-specification)
  - Styled independently from the main page (fixed dimensions, inline-compatible)
- **Image generation:**
  - `html-to-image` library converts the share card DOM element to PNG
  - Generated at 2x resolution for retina sharpness
- **Share actions:**
  - "Share Report" button triggers share flow
  - **Mobile:** Web Share API (`navigator.share()`) with the generated image + pre-filled text
  - **Desktop fallback:** Download image button + "Copy link" (if shareable URLs implemented)
  - Pre-filled share text rotated from 4 variants
- **Download button:**
  - Always available as secondary action
  - Downloads the PNG with filename `isshemadatme-case-XXXXXX.png`

**Exit criteria:** After receiving a verdict, the user can tap "Share Report" and get a beautiful, self-explanatory image in their share sheet (mobile) or downloaded to their device (desktop). The share card is legible at 300px wide (group chat thumbnail test). The URL "IsSheMadAtMe.com" is visible on every card.

---

### M7 — Polish + Error States (~1.5 hrs)

**What gets built:**
- **Error states** (all in character):
  - Wrong file type
  - File too large
  - No file selected
  - API failure / network error
  - No conversation detected in image
  - Rate limit reached
- **Upload state transitions:**
  - Smooth visual transitions between idle → hover → selected → uploading states
- **Landing page enhancements:**
  - Verdict level teaser section (5 verdict names with badge colors, no descriptions)
  - "What We Do" section (in-character paragraph from PRD)
- **Paper texture overlay** (subtle noise SVG)
- **Cross-device testing:**
  - iOS Safari, Android Chrome, desktop Chrome/Firefox
  - Portrait and landscape orientations
- **Performance check:**
  - Ensure fonts load without FOUT (font-display: swap + preload)
  - Total bundle size audit (target: <100KB excluding fonts)
- **Final copy review:**
  - Every string on the site checked for character consistency
  - No functional language ("upload," "loading," "error") — all in character

**Exit criteria:** Every possible user path has been tested. Every error state maintains character. The site loads fast and looks correct on mobile. No rough edges.

---

### M8 — Deploy + Validate (~1 hr)

**What gets done:**
- Deploy to Vercel
- Connect domain (or use Vercel preview URL for initial validation)
- Full end-to-end test on production
- Send to 3-5 people with zero context
- Note: what do they share? What do they say? Where do they get stuck?
- Document first-iteration priorities

**Exit criteria:** The product is live. Real people have used it. You have feedback.

---

## 2. Single-Day MVP Definition

### The "Magic Threshold"

The smallest version that still produces the reaction: *"Wait, I need to send this to someone."*

That reaction requires exactly three moments to work:

| Moment | What Happens | Why It's Required |
|---|---|---|
| **The Build-Up** | Loading console with typewriter animation | Creates anticipation. Without it, the result is "just another AI output." |
| **The Reveal** | Report with findings + verdict stamp | The product itself. The laugh. The recognition. |
| **The Artifact** | Downloadable share card | Without this, the reaction dies in the browser tab. |

### What Ships in the Single-Day MVP

| # | Component | Included | Notes |
|---|---|---|---|
| 1 | Design system (CSS tokens, fonts, texture) | ✅ | Foundation for everything |
| 2 | Landing page with hero + upload zone | ✅ | Simplified: hero + upload only, no example cards |
| 3 | Context field | ✅ | Low effort, high impact on AI quality |
| 4 | Theatrical loading screen | ✅ | Non-negotiable. The experience. |
| 5 | Serverless API + system prompt | ✅ | The engine |
| 6 | Full 5-section report | ✅ | The product |
| 7 | Verdict stamp animation | ✅ | The climax |
| 8 | Share card generation + download | ✅ | The distribution mechanism |
| 9 | Native share sheet (mobile) | ✅ | Frictionless mobile sharing |
| 10 | "Run Another Case" CTA | ✅ | The return loop |
| 11 | In-character error states | ✅ | Character consistency |
| 12 | Mobile responsive layout | ✅ | Primary device |
| 13 | Example cards on landing page | ❌ | Nice but not core |
| 14 | Verdict level teaser section | ❌ | Polish, not core |
| 15 | "What We Do" section | ❌ | Polish, not core |
| 16 | About page | ❌ | Nobody reads it day one |
| 17 | 404 page | ❌ | Handle with a redirect to home |
| 18 | Shareable report URLs | ❌ | Image sharing is sufficient |
| 19 | Analytics | ❌ | Vercel built-in is fine for now |

### The Day-One Quality Bar

Before calling it shipped:

- [ ] The report makes at least one person laugh at something *specific*
- [ ] The loading screen feels theatrical, not just slow
- [ ] The verdict badge is legible in a group chat thumbnail (test at 300px)
- [ ] The share card looks good pasted into an iMessage conversation
- [ ] Error states maintain character
- [ ] The system prompt produces specific findings, not generic AI observations
- [ ] Mobile layout tested on an actual phone, not just browser resize

---

## 3. Report JSON Schema

### The Schema

This is the exact contract between the AI and the frontend. Every field is required unless marked optional.

```json
{
  "$schema": "report-v1",

  "verdictLevel": 3,
  "verdictName": "ELEVATED SITUATIONAL AWARENESS REQUIRED",
  "verdictStatement": "This office has reviewed all submitted evidence. The situation is not terminal. However, it is not comfortable. The indicators suggest reduced enthusiasm on the subject's part. This is recoverable — but only if the correct actions are taken, and soon.",

  "evidenceSummary": {
    "estimatedMessageCount": 12,
    "estimatedTimespan": "3 hours, 22 minutes",
    "contextProvided": true,
    "contextNote": "We've been talking for 3 weeks"
  },

  "findings": [
    {
      "number": 1,
      "title": "RESPONSE LATENCY TRAJECTORY",
      "body": "An observable increase in response time was detected over the course of this exchange. The subject's replies shifted from near-immediate (estimated 2-3 minutes) to considerably delayed (estimated 40-50 minutes). This office notes that individuals who are not at all bothered by a conversation tend to maintain consistent response intervals.",
      "severity": "CONCERNING"
    },
    {
      "number": 2,
      "title": "PUNCTUATION AS STATEMENT",
      "body": "The word 'okay' appears once in the submitted evidence, followed by a period. In contemporary conversational texting, the period at the end of a single-word reply is not punctuation. It is a statement. Specifically, it is the textual equivalent of a door closing. This office has no further comment on this finding.",
      "severity": "CRITICAL"
    },
    {
      "number": 3,
      "title": "EXCLAMATION POINT FREQUENCY DECLINE",
      "body": "Exclamation point usage decreased from a baseline of approximately 2.3 per message to zero in the final four messages. Enthusiasm markers are, as a category, revealing data. Their absence is more informative than their presence.",
      "severity": "NOTABLE"
    }
  ],

  "probabilityMatrix": {
    "isAnnoyed": 78,
    "isLosingInterest": 52,
    "areYouOverthinking": 19,
    "isActuallyFine": 21
  },

  "operativeDirectives": [
    "Do not send another message until you receive a response. This is not a suggestion. It is the directive. The message has been sent. It was received. Let the response come on its own timeline.",
    "If action becomes necessary before a response arrives, one message — one — is the maximum allocation. Choose it carefully.",
    "Consider whether the energy currently being allocated to this situation is proportional to what you are receiving. This office has reviewed the exchange. It notes, without further elaboration, that you appear to give a great deal."
  ],

  "quotableFinding": "The period at the end of 'okay' is not punctuation. It is a statement. Specifically, it is the textual equivalent of a door closing."
}
```

### Field Specifications

| Field | Type | Constraints | Frontend Usage |
|---|---|---|---|
| `verdictLevel` | integer | 1-5 | Determines badge shape, color, classification banner |
| `verdictName` | string | One of the 5 exact verdict names | Large display text in verdict section + share card |
| `verdictStatement` | string | 2-3 sentences, Dr. Read voice | Verdict section body text |
| `evidenceSummary.estimatedMessageCount` | integer | Best estimate from screenshot | Evidence Summary section |
| `evidenceSummary.estimatedTimespan` | string | Human-readable duration | Evidence Summary section |
| `evidenceSummary.contextProvided` | boolean | true if user provided context | Evidence Summary section |
| `evidenceSummary.contextNote` | string \| null | Echoes user's context input | Evidence Summary section (if provided) |
| `findings` | array | 3-5 objects | Key Findings section |
| `findings[].number` | integer | Sequential 1-N | Finding header numbering |
| `findings[].title` | string | ALL CAPS, ≤6 words | Finding header |
| `findings[].body` | string | 2-4 sentences, specific, deadpan | Finding body text |
| `findings[].severity` | enum | `POSITIVE` \| `NOTABLE` \| `CONCERNING` \| `CRITICAL` | Color-coded severity tag |
| `probabilityMatrix.*` | integer | 0-100, independent (don't sum to 100) | Bar width + percentage display |
| `operativeDirectives` | array | Exactly 3 strings | Directives section |
| `quotableFinding` | string | The single most shareable line | Share card featured quote |

### Validation Rules (Client-Side)

```javascript
function validateReport(data) {
  const required = [
    'verdictLevel', 'verdictName', 'verdictStatement',
    'evidenceSummary', 'findings', 'probabilityMatrix',
    'operativeDirectives', 'quotableFinding'
  ];

  // All top-level fields present
  for (const field of required) {
    if (!(field in data)) return { valid: false, error: `Missing: ${field}` };
  }

  // Verdict level in range
  if (data.verdictLevel < 1 || data.verdictLevel > 5) {
    return { valid: false, error: 'verdictLevel must be 1-5' };
  }

  // Findings count
  if (data.findings.length < 3 || data.findings.length > 5) {
    return { valid: false, error: 'Must have 3-5 findings' };
  }

  // Probability values in range
  const matrix = data.probabilityMatrix;
  for (const key of ['isAnnoyed', 'isLosingInterest', 'areYouOverthinking', 'isActuallyFine']) {
    if (matrix[key] < 0 || matrix[key] > 100) {
      return { valid: false, error: `${key} must be 0-100` };
    }
  }

  // Exactly 3 directives
  if (data.operativeDirectives.length !== 3) {
    return { valid: false, error: 'Must have exactly 3 directives' };
  }

  return { valid: true };
}
```

### The 5 Verdict Level Names (Exact)

These are constants. The AI must return one of these exactly:

```javascript
const VERDICT_NAMES = {
  1: 'INSUFFICIENT EVIDENCE TO PANIC',
  2: 'SOME CAUSE FOR REFLECTION',
  3: 'ELEVATED SITUATIONAL AWARENESS REQUIRED',
  4: 'COOKED',
  5: 'CASE CLOSED'
};
```

---

## 4. Share Card Design Specification

### Why This Is Designed First

The share card is what 90% of potential users see before visiting the site. It appears in group chats, Twitter feeds, and Instagram stories. It must:

1. Communicate the product premise without explanation
2. Be legible at 300px wide (group chat thumbnail)
3. Look like nothing else in a message thread
4. Include the URL to close the viral loop
5. Make someone want to try it themselves

---

### Dimensions

**Primary format:** 1080 × 1350px (4:5 ratio)
- Works natively on Instagram feed
- Renders well in iMessage/WhatsApp previews
- Good aspect ratio for Twitter image cards
- Not too tall for group chat thumbnails

**Rendering:** Generated at 2x (2160 × 2700) and scaled down for retina sharpness.

### Layout Specification

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  THE RELATIONSHIP FORENSICS LAB                 │  ← Zone A: Header
│  ─────────────────────────────────────────────   │
│  Case #481923              June 8, 2026         │
│                                                 │
│                                                 │
│                                                 │
│              ┌───────────────────┐              │
│              │                   │              │
│              │   VERDICT BADGE   │              │  ← Zone B: Verdict
│              │   (stamp style)   │              │     (dominant, 40% of card)
│              │                   │              │
│              └───────────────────┘              │
│                                                 │
│         ELEVATED SITUATIONAL                    │
│         AWARENESS REQUIRED                      │
│                                                 │
│                                                 │
│  ─────────────────────────────────────────────   │
│                                                 │
│  "The period at the end of 'okay' is not        │  ← Zone C: Quotable Finding
│   punctuation. It is a statement. Specifically,  │     (the hook, italic serif)
│   it is the textual equivalent of a door         │
│   closing."                                      │
│                                                 │
│  ─────────────────────────────────────────────   │
│                                                 │
│  ████████░░ 78%  IS SHE ANNOYED?               │  ← Zone D: Mini Matrix
│  █████░░░░░ 52%  IS SHE LOSING INTEREST?       │     (condensed, 2 key stats)
│                                                 │
│  ─────────────────────────────────────────────   │
│                                                 │
│  Submit your evidence.          IsSheMadAtMe.com│  ← Zone E: Footer
│                                                 │
└─────────────────────────────────────────────────┘
```

### Zone Specifications

#### Zone A — Header (top 12%)
- **"THE RELATIONSHIP FORENSICS LAB"**
  - Font: IBM Plex Mono, 500 weight
  - Size: 13px equivalent at 1080w (scaled proportionally)
  - Letter-spacing: 0.14em
  - Color: `--ink-muted` (#6B6355)
  - Transform: uppercase
- **Horizontal rule:** 1px solid `--border` (#C8BFA8)
- **Case # and date:**
  - Font: IBM Plex Mono, 400
  - Size: 11px equivalent
  - Color: `--ink-muted`
  - Case # left-aligned, date right-aligned

#### Zone B — Verdict (middle 40%)
- **Verdict badge:**
  - The stamp. Centered. Dominant.
  - Width: ~50% of card width
  - Border: 4px solid, verdict color
  - Slight rotation: random ±1.5 degrees (generated per card)
  - Text inside: verdict level number or abbreviated name
  - Background: transparent (the border IS the badge)
  - Typography: Playfair Display Bold, verdict color
- **Verdict name:**
  - Font: Playfair Display, 700 weight
  - Size: 28px equivalent at 1080w
  - Color: verdict-level color
  - Text-align: center
  - Max 2 lines

#### Zone C — Quotable Finding (20%)
- **The hook line:**
  - Font: Playfair Display, 400, italic
  - Size: 18px equivalent
  - Color: `--ink` (#1A1A1A)
  - Surrounded by quotation marks (curly quotes)
  - Max 4 lines at this font size
  - Horizontal rules above and below (`--border`)

#### Zone D — Mini Matrix (12%)
- **Two highest-probability bars only** (not all four — simplicity for the card)
  - Selected automatically: the two questions with the highest percentage values
  - Font: IBM Plex Mono, 400
  - Size: 11px equivalent
  - Bar height: 8px
  - Bar colors: gradient from `--verdict-1-clear` to `--verdict-4-cooked` based on value
  - Percentage on left, label on right

#### Zone E — Footer (8%)
- **Left:** "Submit your evidence." — Inter, 400, 11px, `--ink-muted`
- **Right:** "IsSheMadAtMe.com" — IBM Plex Mono, 500, 11px, `--ink` (slightly bolder — this is the CTA)
- Horizontal rule above

### Card Color System

| Verdict Level | Badge Border | Badge Text | Banner |
|---|---|---|---|
| 1 — INSUFFICIENT EVIDENCE | `--verdict-1-clear` (#2A5C3F) | Forest Green | Forest Green |
| 2 — SOME CAUSE | `--verdict-2-reflect` (#5B6E2A) | Olive | Olive |
| 3 — ELEVATED | `--verdict-3-elevated` (#C07600) | Amber | Amber |
| 4 — COOKED | `--verdict-4-cooked` (#CC2200) | Red | Red |
| 5 — CASE CLOSED | `--verdict-5-closed` (#1A1A1A) | Near-Black | Near-Black |

### Card Background

`--bg-card` (#FDFAF4) — warm off-white. The paper texture overlay applies here too (very subtle).

### Thumbnail Legibility Test

At 300px wide (typical group chat thumbnail):
- ✅ The verdict badge color is visible and distinct
- ✅ The verdict name is readable (28px at 1080 → ~8px at 300 — border with the readable, which is why the color carries the message)
- ✅ "IsSheMadAtMe.com" is legible in the footer
- ✅ The overall format is recognizable: "that's a result from that website"

> [!TIP]
> The card doesn't need to be *readable* at thumbnail size — it needs to be *recognizable*. The verdict color, the institutional layout, and the URL in the corner are what make someone tap to view full-size or click through.

---

## 5. Prompt Testing Strategy

### Testing Philosophy

The system prompt is the product. Testing it is not QA — it's product development. Every test case answers the question: **"Is this output specific enough, funny enough, and in-character enough that someone would share it?"**

### Test Case Categories (25)

Organized by what we're testing: **input variety**, **output quality**, and **edge case handling**.

---

#### Input Variety — Platform Coverage

| # | Category | What We're Testing | Example |
|---|---|---|---|
| 1 | **iMessage (light mode)** | Can the model read the most common screenshot format? | Standard blue/gray bubble conversation |
| 2 | **iMessage (dark mode)** | Dark backgrounds don't confuse the vision model | Same conversation, dark mode |
| 3 | **WhatsApp** | Different visual format (green checkmarks, timestamps visible) | WhatsApp group or 1:1 chat |
| 4 | **Instagram DM** | Different bubble style, often has media mixed in | Instagram direct message thread |
| 5 | **Android Messages** | Different OS, different visual treatment | Google Messages or Samsung Messages |
| 6 | **Discord** | Very different layout — usernames, timestamps, compact | Discord DM or channel |
| 7 | **Snapchat chat** | Minimal visual structure, often no timestamps | Snapchat text conversation |

#### Input Variety — Content Types

| # | Category | What We're Testing | Example |
|---|---|---|---|
| 8 | **Short exchange (3-5 messages)** | Can the model produce specific findings from minimal data? | A brief "hey" / "hey" / "what's up" / "nm" exchange |
| 9 | **Long exchange (15+ messages)** | Does the model identify the most important patterns in longer conversations? | A full argument or extended catching-up conversation |
| 10 | **One-word replies** | Does the model catch the significance of "k", "fine", "okay."? | A series of increasingly terse replies |
| 11 | **Emoji-heavy conversation** | Can the model analyze emoji usage patterns? | Lots of 😂, ❤️, then sudden absence |
| 12 | **Voice message indicators** | How does the model handle messages it can't read? | Screenshot showing voice message bubbles |
| 13 | **Mixed media** | Images, links, and text mixed together | Screenshot with shared Instagram posts or photos |

#### Output Quality — Humor & Specificity

| # | Category | What We're Testing | Pass Criteria |
|---|---|---|---|
| 14 | **Obviously fine conversation** | Does the model produce a Level 1 verdict with gentle humor? | Verdict = Level 1. Tone = reassuring + slightly teasing about overthinking. |
| 15 | **Clearly tense conversation** | Does the model identify specific tension signals? | Findings reference specific observable patterns (not "seems upset"). |
| 16 | **Ambiguous conversation** | Does the model acknowledge ambiguity in character? | Verdict = Level 2 or 3. Findings note what's inconclusive. |
| 17 | **The "okay." test** | Does the model deliver the period-as-tone observation? | A finding about punctuation that's specific and deadpan. |
| 18 | **The double-text test** | User sends 3+ messages in a row | Model identifies the message ratio and delivers the finding with empathy. |
| 19 | **The read-receipt test** | Visible read receipts + no response | Model catches this and treats it as significant evidence. |

#### Edge Cases — Graceful Degradation

| # | Category | What We're Testing | Pass Criteria |
|---|---|---|---|
| 20 | **Blurry/low-quality screenshot** | Does the model acknowledge image quality issues in character? | Model proceeds with what it can read, notes limitations. |
| 21 | **Non-conversation image** | User uploads a meme, landscape photo, or random image | Model responds in character: "No conversation detected." Returns a structured error. |
| 22 | **Screenshot of settings/notifications** | Looks like a phone screenshot but isn't a conversation | Model identifies this isn't a text conversation. |
| 23 | **Non-English conversation** | Can the model analyze conversations in Spanish, Hindi, etc.? | Model attempts analysis or acknowledges language limitation in character. |
| 24 | **Group chat screenshot** | Multiple participants, not just a 1:1 conversation | Model adapts analysis to group dynamics. |
| 25 | **Professional/boss conversation** | Work context, not romantic | Model adjusts tone — still in character but recognizes the context isn't romantic. |

### Scoring Each Test Case

For each test, rate the output on 4 dimensions (1-5 scale):

| Dimension | 1 (Fail) | 3 (Acceptable) | 5 (Ship-worthy) |
|---|---|---|---|
| **Specificity** | Generic observations | References some specific patterns | References exact words, timestamps, or counts from the screenshot |
| **Character** | Breaks voice, sounds like ChatGPT | Mostly in character | Indistinguishable from the PRD sample copy |
| **Humor** | Not funny | Mildly amusing | Produces at least one line you'd want to quote |
| **Accuracy** | Findings don't match the screenshot | Findings are plausible | Findings are observably true and insightful |

**Minimum ship threshold:** Average ≥ 3.5 across all dimensions, no individual score below 2 on any test case.

### Prompt Iteration Process

1. Run all 25 test cases with the initial system prompt
2. Score each output
3. Identify patterns in weak outputs (common failure modes)
4. Adjust the system prompt with specific instructions addressing failures
5. Re-run failed test cases
6. Repeat until threshold is met
7. Document the final prompt version

> [!IMPORTANT]
> We won't run all 25 categories during the build day — that's a pre-launch validation exercise. During implementation, we test with **5-8 representative screenshots** (categories 1, 8, 10, 14, 15, 17, 18, 20) to validate the prompt is working. The full 25-category sweep happens before sharing the product publicly.

---

## 6. Conflicting Requirements Resolution

After comparing the [PRD](file:///Users/sohansanil/Documents/linkedin/30-day-builder/projects/IsSheMadAtMe.com/IsSheMadAtMe_PRD.md) and the product review, 8 conflicts need resolution before implementation begins.

---

### Conflict 1: Framework Choice

| PRD Says | Review Says |
|---|---|
| Next.js 14 (App Router) + Tailwind CSS + Framer Motion | Vite + vanilla HTML/CSS/JS |

**Resolution: Vite + vanilla.**

Rationale: The product has one page with three states. No SSR requirements. No complex routing. No auth. The design system is fully specified in CSS custom properties. Using Next.js adds framework overhead without delivering value. Vanilla gives us pixel-perfect control over the forensic aesthetic and ships a smaller bundle.

The animations (typewriter, bar fills, verdict stamp) are all achievable with CSS `@keyframes` + `animation-delay` and minimal JS. Framer Motion is a 32KB dependency we don't need.

> [!NOTE]
> This means we **won't** have a `/analyzing` or `/report/[id]` URL route as the PRD specifies. Instead, we use a single-page architecture with view switching via CSS classes on `<body>`. This is simpler, faster, and matches the actual user experience (nobody bookmarks the loading screen).

---

### Conflict 2: Probability Matrix — Keep or Kill?

| PRD Says | Review Says |
|---|---|
| 4 horizontal bars with percentages (IS SHE ANNOYED? 78%) | "The weakest section. Looks like every other AI output. The one section where the forensic conceit breaks." |

**Resolution: Keep it, but reframe it.**

The matrix stays because:
1. It's highly shareable (specific percentages are quotable)
2. It gives the report quantitative texture that pure prose doesn't
3. The labels ("ARE YOU OVERTHINKING? 19%") are funny

But we reframe the presentation:
- Title it "BEHAVIORAL PROBABILITY ASSESSMENT" (not "matrix" — that sounds like a tech demo)
- Add a footer line: *"Probabilities assessed independently. Not a clinical diagnostic."*
- Style it more like a classified data readout than a generic chart
- Use monospace throughout to maintain the forensic character

The matrix is not where we differentiate, but it's not hurting us if it's styled correctly.

---

### Conflict 3: Landing Page Example Cards

| PRD Says | Review Says |
|---|---|
| Three pre-made result cards as a visual strip (Section 7) | "Three static cards showing different verdict levels is the most predictable social proof pattern" |

**Resolution: Cut from MVP, add in polish phase only if time allows.**

The landing page should drive one action: upload. Example cards are social proof for a product that doesn't have users yet. For Day 1, the headline, the upload zone, and the verdict level teaser section are sufficient. The product *is* the proof.

If we add them later, they should be styled as actual case files (not cards) — brief excerpts from "The Archives" rather than generic social proof.

---

### Conflict 4: Report Structure Rigidity

| PRD Says | Review Says |
|---|---|
| Every report has exactly 5 sections, 3-5 findings, 4 matrix categories, 3 directives | "By the third use, the structure becomes predictable. The surprise diminishes." |

**Resolution: Keep the structure rigid for MVP. Plan variability for v1.1.**

For launch, a consistent structure is actually a feature — it establishes the format. People need to see the format once before they can appreciate variations. The first impression should be "this is a *thing*" — a recognizable format with clear sections.

Variability (redacted findings, confidence scores, case precedents, variable directive counts) comes in v1.1 once the base format is established. Doing this now adds complexity to both the prompt and the renderer.

---

### Conflict 5: The "Dr. Read" Character Name

| PRD Says | Review Says |
|---|---|
| The character is named "Dr. Read" with a full backstory | Not explicitly addressed |

**Resolution: Use the character voice but don't surface the name "Dr. Read" in MVP.**

The name "Dr. Read" is a nice internal reference, but surfacing it in the report creates a question: "Who is Dr. Read?" that breaks the institutional framing. "This office" is funnier and more impersonal than "Dr. Read believes." The Lab has analysts. They don't have names — they have opinions.

Keep "Dr. Read" in the system prompt as the character definition for the AI, but never display it to users. The report is authored by "The Relationship Forensics Lab" as an institution, not by a named character.

---

### Conflict 6: Vision API Provider

| PRD Says | Review Says |
|---|---|
| Anthropic Claude (claude-sonnet-4-20250514 or opus) | "Consider Gemini 2.5 Flash — faster, cheaper. Test both." |

**Resolution: Start with Gemini, have Claude as fallback.**

We begin implementation with the Gemini API since you're already building in this ecosystem and can validate quickly. The system prompt is model-agnostic — the JSON schema and character definition work with any capable vision model. If Gemini's vision output isn't specific enough during testing, we switch to Claude.

The serverless function abstracts the API choice — swapping providers requires changing one API call, not the product.

> [!IMPORTANT]
> **Decision needed from you:** Do you have a Gemini API key or Google Cloud project ready? If not, do you have an Anthropic API key? We need at least one vision API key before M4 begins.

---

### Conflict 7: Share Card Dimensions

| PRD Says | Review Says |
|---|---|
| 1080×1920 (story format) AND 1080×1080 (square) — both generated | Single format: 1080×1350 (4:5 ratio) |

**Resolution: Ship one format (1080×1350) for MVP.**

Generating two card formats doubles the rendering work and UI complexity ("Which format do you want?"). The 4:5 ratio is the best compromise — it works in group chats, on Twitter, and on Instagram feed. Story format (9:16) is a nice-to-have for v1.1.

---

### Conflict 8: The Word "AI" 

| PRD Says | Review Says |
|---|---|
| The word "AI" never appears anywhere visible to users | Aligned — no conflict |

**Resolution: Enforced. No exceptions.**

This is listed here because it's easy to accidentally break during implementation. Common traps:
- Alt text on images ("AI-generated analysis")
- Error messages ("The AI encountered an error")
- Meta descriptions ("AI-powered relationship analysis")
- Console logs visible in DevTools

Every instance must use the Lab's vocabulary instead: "analysis," "assessment," "this office," "the lab."

---

## Summary of Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Framework | Vite + vanilla HTML/CSS/JS |
| 2 | Probability Matrix | Keep, restyle as forensic data readout |
| 3 | Landing example cards | Cut from MVP |
| 4 | Report structure | Rigid for MVP, variability in v1.1 |
| 5 | Dr. Read name | Internal prompt only, never shown to users |
| 6 | Vision API | Start with Gemini, Claude as fallback |
| 7 | Share card format | Single 1080×1350 (4:5) format |
| 8 | The word "AI" | Never appears, no exceptions |

---

## Open Questions for You

> [!IMPORTANT]
> Please confirm or adjust these before we begin M1:

1. **API Key:** Do you have a Gemini API key ready, or should we plan for Claude (Anthropic)?
2. **Domain:** Is `IsSheMadAtMe.com` already purchased? If not, we'll deploy to Vercel's preview URL initially.
3. **Project location:** I'll create the project at `/Users/sohansanil/Documents/linkedin/30-day-builder/projects/IsSheMadAtMe.com/` — confirm this is correct.
4. **Deployment target:** Vercel? Do you have a Vercel account connected?

Once these are answered, we begin with Milestone 1.
