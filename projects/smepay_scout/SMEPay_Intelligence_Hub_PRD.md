# SMEPay Intelligence Hub
## Product Requirements Document (PRD) v1.0

**Tagline:** AI-Powered Merchant Market Intelligence  
**Classification:** Internal Tool — Strategic  
**Status:** Ready for Engineering Handoff  
**Authors:** Product, Design, Engineering  
**Last Updated:** June 2026

---

> **One Question This Platform Answers:**  
> *"What should SMEPay do next?"*

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Personas](#2-user-personas)
3. [User Stories](#3-user-stories)
4. [Feature Requirements](#4-feature-requirements)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Information Architecture](#7-information-architecture)
8. [User Flow Diagrams](#8-user-flow-diagrams)
9. [Dashboard Wireframes](#9-dashboard-wireframes)
10. [Screen-by-Screen Breakdown](#10-screen-by-screen-breakdown)
11. [API Architecture](#11-api-architecture)
12. [Database Schema](#12-database-schema)
13. [AI Prompt Architecture](#13-ai-prompt-architecture)
14. [System Design](#14-system-design)
15. [V1 Scope](#15-v1-scope)
16. [Future Roadmap](#16-future-roadmap)
17. [Success Metrics](#17-success-metrics)
18. [Risks and Limitations](#18-risks-and-limitations)
19. [Technical Implementation Plan](#19-technical-implementation-plan)
20. [Build Order for One-Day MVP](#20-build-order-for-one-day-mvp)

---

## 1. Product Overview

### 1.1 What It Is

SMEPay Intelligence Hub is an internal strategic intelligence platform that continuously monitors public online discussions about the Indian merchant payments ecosystem, analyzes them using AI, and surfaces actionable product and business recommendations.

It is not a sentiment dashboard. It is not a keyword tracker.  
It is a **Product Strategy Analyst**, available on demand, trained on live market signal.

### 1.2 Problem Statement

SMEPay currently operates with limited visibility into:

- What merchants are saying about them and their competitors publicly
- What recurring pain points are driving merchant churn
- What features competitors are praised or criticized for
- What product bets would give SMEPay the highest strategic return

Internal transaction data captures *what happened*. This platform captures *why merchants feel the way they do* — and *what to do about it*.

### 1.3 Strategic Value Proposition

| Without Intelligence Hub | With Intelligence Hub |
|---|---|
| Product decisions based on internal gut feel | Decisions grounded in real merchant voice |
| Competitor landscape discovered reactively | Competitor weaknesses surfaced proactively |
| Feature requests buried in support tickets | Demand signals extracted from public discussions |
| Strategy updated quarterly, if at all | Intelligence refreshed on-demand or daily |

### 1.4 Target Ecosystem

SMEPay operates in the Indian fintech / merchant payments space. The platform monitors discourse around:

- **Direct competitors**: Razorpay, BharatPe, PhonePe Business, Paytm Business
- **Adjacent topics**: UPI, POS systems, merchant onboarding, settlement cycles, payment gateways, business banking, GST reconciliation

### 1.5 Design Philosophy

The platform should feel like a **private intelligence briefing** — not a public SaaS product. Every screen, every label, every data point should reinforce: *"This was built specifically for SMEPay."*

Design reference: Stripe Dashboard meets McKinsey report.

### 1.6 V1 Constraints

- Data source: Reddit only (via PRAW)
- AI backbone: Google Gemini API
- Users: Internal SMEPay team only
- No real-time streaming; analysis runs on-demand
- No authentication in V1 (internal tool on private URL)

---

## 2. User Personas

### Persona 1 — The Founder

**Name:** Arjun (Hypothetical)  
**Role:** Founder & CEO, SMEPay  
**Goal:** Understand the competitive landscape and validate product bets before committing engineering resources  
**Pain Points:**
- No time to read 500 Reddit threads
- Needs strategic synthesis, not raw data
- Wants to walk into board meetings with conviction

**Key Need:** The Executive Summary. He wants to open the app and read a briefing in under 60 seconds.

**Quote:** *"Just tell me what the market is telling us and what I should do about it."*

---

### Persona 2 — The Product Manager

**Name:** Priya (Hypothetical)  
**Role:** Product Manager, SMEPay  
**Goal:** Build a feature roadmap backed by market demand signals, not HiPPO opinions  
**Pain Points:**
- Feature requests come from all directions with no prioritization signal
- Hard to argue for or against features without market evidence

**Key Need:** Feature Request Intelligence and Pain Point Intelligence modules with evidence and frequency.

**Quote:** *"I need to show that 63% of merchants asking for faster settlements aren't just edge cases."*

---

### Persona 3 — The Strategy Lead

**Name:** Vikram (Hypothetical)  
**Role:** Head of Strategy, SMEPay  
**Goal:** Identify whitespace opportunities competitors are failing to capture  
**Pain Points:**
- Competitive intelligence requires hours of manual research
- Hard to distinguish signal from noise in public forums

**Key Need:** Competitor Intelligence and Opportunity Engine modules.

**Quote:** *"Where is Razorpay losing? That's our chance."*

---

### Persona 4 — The Business Development Manager

**Name:** Neha (Hypothetical)  
**Role:** BD Manager, SMEPay  
**Goal:** Understand merchant segments and their specific pain points to craft pitch narratives  
**Pain Points:**
- Generic pitches don't resonate with specific merchant types
- Lacks data on merchant sentiment by vertical

**Key Need:** Pain Point Intelligence with segment tagging and representative quotes.

**Quote:** *"I need real words from real merchants to make my pitch land."*

---

### Persona 5 — The Merchant Growth Lead

**Name:** Rohan (Hypothetical)  
**Role:** Merchant Growth, SMEPay  
**Goal:** Reduce churn by identifying and addressing the most common dissatisfaction triggers  
**Pain Points:**
- Churn reasons are collected post-exit, too late to act
- No leading indicators of dissatisfaction

**Key Need:** Pain Point Intelligence with severity scores and early warning signals.

**Quote:** *"If I can fix the top 3 complaints before they leave, I keep the merchant."*

---

## 3. User Stories

### Epic 1: Market Overview

- As a **Founder**, I want to see a single-page executive summary so that I can understand the state of the market in under 60 seconds.
- As a **PM**, I want to know how many discussions were analyzed and from which subreddits so that I can assess the reliability of the data.
- As a **Strategy Lead**, I want to see the most discussed themes ranked by frequency so that I can understand where market attention is concentrated.
- As any user, I want to see overall market sentiment (positive/negative/neutral) so that I can gauge whether merchant confidence in the ecosystem is rising or falling.

### Epic 2: Pain Point Intelligence

- As a **PM**, I want to see the top 10 merchant pain points ranked by frequency so that I can prioritize fixes in the roadmap.
- As a **Merchant Growth Lead**, I want to see severity scores for each pain point so that I can identify which complaints are existential vs. cosmetic.
- As a **BD Manager**, I want to read representative merchant quotes for each pain point so that I can use authentic voice in my pitches.
- As any user, I want to filter pain points by competitor so that I understand if a pain point is ecosystem-wide or competitor-specific.

### Epic 3: Feature Request Intelligence

- As a **PM**, I want to see recurring feature requests sorted by demand so that I can add the highest-demand items to the roadmap.
- As a **PM**, I want to see which competitor's merchants are requesting a feature most so that I can identify switching incentive opportunities.
- As a **Founder**, I want to see supporting evidence for each feature request so that I can validate the signal before committing resources.

### Epic 4: Competitor Intelligence

- As a **Strategy Lead**, I want to see a competitor card for each of the four main competitors so that I can identify their strengths and weaknesses at a glance.
- As any user, I want to see market perception keywords for each competitor so that I can understand how merchants emotionally describe each company.
- As a **Founder**, I want to compare two competitors side-by-side so that I can identify SMEPay's differentiation window.

### Epic 5: Opportunity Engine

- As a **Founder**, I want to see ranked opportunities generated from pain points + competitor weaknesses so that I know where to focus first.
- As a **PM**, I want each opportunity to include a confidence score and strategic rationale so that I can defend the priority in planning sessions.
- As a **Strategy Lead**, I want to see expected impact for each opportunity so that I can build business cases for them.

### Epic 6: Strategic Recommendations

- As a **Founder**, I want a prioritized action list with priority, impact, effort, and evidence so that I can assign work to the team immediately.
- As a **PM**, I want recommendations formatted as actionable tasks so that I can copy them directly into the product backlog.

### Epic 7: Intelligence Refresh

- As any user, I want to trigger a fresh data collection and analysis run so that I can get up-to-date intelligence before a key meeting.
- As a **PM**, I want to see when the last analysis was run so that I know if the data is current.

---

## 4. Feature Requirements

### Feature 1: Market Overview Module

**Purpose:** Single-screen market pulse — what's happening at the top level.

**Required Output Fields:**
```
{
  "total_discussions_analyzed": 847,
  "time_period": "Last 30 days",
  "subreddits_crawled": ["IndiaFintech", "india", "startups", "smallbusiness"],
  "competitors_detected": ["Razorpay", "BharatPe", "PhonePe Business", "Paytm Business"],
  "overall_sentiment": {
    "positive": 23,
    "neutral": 41,
    "negative": 36
  },
  "most_discussed_themes": [
    { "theme": "Settlement Speed", "frequency": 312, "trend": "rising" },
    { "theme": "Merchant Support", "frequency": 287, "trend": "stable" },
    { "theme": "Onboarding Friction", "frequency": 198, "trend": "rising" },
    { "theme": "Dashboard / Reporting", "frequency": 143, "trend": "stable" },
    { "theme": "Pricing & MDR", "frequency": 119, "trend": "falling" }
  ]
}
```

**UI Requirements:**
- KPI cards: Discussions Analyzed, Competitors Detected, Overall Sentiment
- Horizontal bar chart: Theme frequency
- Sentiment ring/donut chart
- Last refreshed timestamp and "Refresh Now" button

---

### Feature 2: Pain Point Intelligence Module

**Required Output Fields:**
```
{
  "pain_points": [
    {
      "id": "pp_001",
      "title": "Settlement Delays",
      "description": "Merchants report T+2 or longer settlement cycles...",
      "frequency": 298,
      "severity": "critical",
      "severity_score": 9.1,
      "competitor_affected": ["Razorpay", "Paytm Business"],
      "representative_quotes": [
        {
          "source": "r/IndiaFintech",
          "text": "Been waiting 4 days for my settlement...",
          "upvotes": 234,
          "date": "2026-06-15"
        }
      ],
      "trend": "rising"
    }
  ]
}
```

**Severity Classification:**
- **Critical (8–10):** Causes merchant churn or business loss
- **High (6–7):** Causes significant friction, repeated complaints
- **Medium (4–5):** Inconvenient, present but not urgent
- **Low (1–3):** Cosmetic or edge case

**UI Requirements:**
- Filterable, sortable pain point cards
- Severity badge (Critical / High / Medium / Low)
- Frequency bar indicator
- Expandable quote drawer
- Competitor filter chips

---

### Feature 3: Feature Request Intelligence Module

**Required Output Fields:**
```
{
  "feature_requests": [
    {
      "id": "fr_001",
      "title": "Instant Settlements",
      "category": "payments",
      "demand_level": "very_high",
      "frequency": 187,
      "requesting_segments": ["D2C", "Restaurant", "Retail"],
      "competing_platform_gap": "Razorpay launched in Q4 2025 but premium only",
      "supporting_evidence": ["...quote 1...", "...quote 2..."],
      "estimated_impact": "High retention for high-volume merchants"
    }
  ]
}
```

**Demand Level Scale:** Very High → High → Medium → Low → Niche

**UI Requirements:**
- Ranked list with demand level pill badges
- Evidence accordion (expand to view quotes)
- Category filter (Payments / Analytics / Support / Integrations / Compliance)

---

### Feature 4: Competitor Intelligence Module

**Required Output Fields:**
```
{
  "competitors": [
    {
      "name": "Razorpay",
      "overall_sentiment": "mixed",
      "strengths": [
        { "attribute": "API Quality", "mention_count": 203, "sample_quote": "..." },
        { "attribute": "Developer Experience", "mention_count": 189 }
      ],
      "weaknesses": [
        { "attribute": "Support Responsiveness", "mention_count": 312, "severity": "high" },
        { "attribute": "Settlement Speed", "mention_count": 287 }
      ],
      "market_perception_keywords": ["reliable", "expensive", "dev-friendly", "cold support"],
      "smepay_opportunity_windows": [
        "Merchants want better support — SMEPay can win on relationship"
      ]
    }
  ]
}
```

**Competitors tracked in V1:**
1. Razorpay
2. BharatPe
3. PhonePe Business
4. Paytm Business

**UI Requirements:**
- One card per competitor
- Strengths (green) vs. Weaknesses (red) column layout
- Perception keyword chips
- "SMEPay Opportunity" callout box per competitor

---

### Feature 5: Opportunity Engine Module

**Required Output Fields:**
```
{
  "opportunities": [
    {
      "id": "opp_001",
      "title": "Launch T+0 Settlement for High-Volume Merchants",
      "source_signals": ["pp_001", "fr_001"],
      "confidence_score": 92,
      "strategic_rationale": "Settlement delay is the #1 pain point...",
      "expected_impact": "High — can capture churned Razorpay merchants",
      "effort_estimate": "Medium",
      "priority_rank": 1,
      "competitor_window": "Razorpay's instant settlement is paywalled above ₹10L/month",
      "recommended_action": "Launch T+0 for merchants above ₹2L/month GMV"
    }
  ]
}
```

**Confidence Score Methodology:**
- Pain Point Frequency × 0.4
- Competitor Weakness Overlap × 0.3
- Feature Request Demand × 0.2
- Severity Score × 0.1
- Max: 100

**UI Requirements:**
- Cards ranked by confidence score
- Confidence meter (0–100 visual arc)
- Source signals linked back to pain points and feature requests
- Priority rank badge
- One-line CTA per opportunity

---

### Feature 6: Strategic Recommendations Module

**Required Output Fields:**
```
{
  "recommendations": [
    {
      "priority": 1,
      "action": "Overhaul Merchant Onboarding — target < 4 hours to first transaction",
      "impact": "High",
      "effort": "Medium",
      "time_horizon": "Next Sprint",
      "evidence": "Onboarding friction mentioned in 198 discussions. BharatPe rated worst for this.",
      "linked_opportunity": "opp_003"
    }
  ]
}
```

**UI Requirements:**
- Numbered priority list
- Impact/Effort matrix visual
- Evidence collapse/expand
- Export to Notion / Copy to clipboard button

---

### Feature 7: Executive Summary Module

**Required Output Fields:**
```
{
  "executive_summary": {
    "generated_at": "2026-06-23T09:15:00Z",
    "tldr": "The Indian merchant payments market is under pressure...",
    "top_3_insights": ["...", "...", "..."],
    "top_3_opportunities": ["...", "...", "..."],
    "market_mood": "cautiously negative",
    "smepay_strategic_position": "...",
    "recommended_immediate_action": "..."
  }
}
```

**UI Requirements:**
- Full-width hero card at top of dashboard
- 3 insight bullets + 3 opportunity bullets
- Reading time estimate ("~45 seconds")
- Print / PDF export button

---

## 5. Functional Requirements

### 5.1 Data Collection

- FR-DC-01: System shall query Reddit using PRAW with configurable keyword lists
- FR-DC-02: System shall collect post title, body, top comments (up to 20 per post), upvotes, subreddit, date, and permalink
- FR-DC-03: System shall deduplicate posts by Reddit post ID
- FR-DC-04: System shall respect Reddit API rate limits (60 requests/min)
- FR-DC-05: System shall store raw Reddit data in persistent storage before analysis
- FR-DC-06: System shall support configurable time windows (Last 7 / 30 / 90 days)

### 5.2 AI Analysis

- FR-AI-01: System shall send collected discussions in structured batches to Gemini API
- FR-AI-02: System shall use a structured prompt system that extracts all 7 intelligence modules in a single response
- FR-AI-03: System shall return analysis as valid, schema-validated JSON
- FR-AI-04: System shall handle Gemini API errors with exponential backoff retry (max 3 attempts)
- FR-AI-05: System shall cache analysis results until manually refreshed

### 5.3 Dashboard Display

- FR-UI-01: System shall display all 7 modules on a tabbed dashboard interface
- FR-UI-02: System shall display last analysis timestamp on every page
- FR-UI-03: System shall provide a "Refresh Intelligence" button that triggers a new collection + analysis run
- FR-UI-04: System shall show a progress indicator during refresh (collection → analysis → rendering)
- FR-UI-05: System shall be responsive for desktop only in V1 (min-width: 1280px)

### 5.4 Export / Copy

- FR-EX-01: System shall provide a "Copy to Clipboard" action for all recommendation lists
- FR-EX-02: System shall support PDF export of the Executive Summary
- FR-EX-03: System shall support JSON export of the full analysis result

---

## 6. Non-Functional Requirements

### 6.1 Performance

- NFR-P-01: Dashboard shall load cached analysis results in < 2 seconds
- NFR-P-02: Fresh data collection + analysis run shall complete in < 5 minutes for 500 posts
- NFR-P-03: AI response for a 300-post batch shall be requested with a 90-second timeout

### 6.2 Reliability

- NFR-R-01: System shall not lose cached analysis on server restart (persistent file or DB storage)
- NFR-R-02: System shall gracefully display last-known data if refresh fails, with an error banner

### 6.3 Security (Internal Tool)

- NFR-S-01: In V1, the app is accessible only on localhost or private network
- NFR-S-02: API keys (Reddit, Gemini) shall be stored in environment variables, never committed to code
- NFR-S-03: No merchant PII is collected or stored (only public Reddit data)

### 6.4 Maintainability

- NFR-M-01: Data sources shall be configurable via a `sources.config.ts` file without code changes
- NFR-M-02: Keyword lists shall be editable in a flat JSON config file
- NFR-M-03: AI prompt templates shall be stored in separate `.prompt.txt` files, not hardcoded

### 6.5 Extensibility

- NFR-E-01: Data source architecture shall use an adapter pattern so new sources (Twitter, Play Store) can be added without refactoring core logic
- NFR-E-02: Each intelligence module shall be independently addressable via API endpoint

---

## 7. Information Architecture

```
SMEPay Intelligence Hub
│
├── [/] Dashboard Root
│    ├── Executive Summary (default view, top of page)
│    ├── Tab: Market Overview
│    ├── Tab: Pain Points
│    ├── Tab: Feature Requests
│    ├── Tab: Competitor Intelligence
│    ├── Tab: Opportunity Engine
│    └── Tab: Strategic Recommendations
│
├── [/refresh] Intelligence Refresh
│    └── Progress page: Collection → Analysis → Complete
│
├── [/export] Export Center
│    ├── PDF: Executive Summary
│    ├── JSON: Full Analysis
│    └── Copy: Recommendations
│
└── [/settings] (V2)
     ├── Keyword Configuration
     ├── Source Management
     └── Analysis Schedule
```

### Navigation Model

- **Primary:** Left sidebar with icon + label nav links
- **Secondary:** Tab bar within each module
- **Global:** Header bar with "Last Updated" timestamp + "Refresh Now" button

---

## 8. User Flow Diagrams

### Flow 1: First-Time Setup & Initial Analysis

```
User opens app
    │
    ▼
[Check: cached analysis exists?]
    │
    ├── YES → Load dashboard with cached data
    │              └── Show "Last Updated: [timestamp]" warning if > 24h
    │
    └── NO → Show "No Intelligence Yet" empty state
                 └── [Button: Run First Analysis]
                         │
                         ▼
                 Show Progress Screen
                 ┌─────────────────────────────────┐
                 │ ● Connecting to Reddit...    ✓  │
                 │ ● Collecting discussions...  ⟳  │
                 │ ● Running AI analysis...        │
                 │ ● Building your dashboard...    │
                 └─────────────────────────────────┘
                         │
                         ▼
                 Dashboard loads with fresh data
```

### Flow 2: Returning User — On-Demand Refresh

```
User on Dashboard
    │
    ▼
Clicks "Refresh Intelligence" (header button)
    │
    ▼
[Confirm Modal: "This will take ~3–5 minutes. Continue?"]
    │
    ▼
Background job starts → Progress page renders
    │
    ▼
On completion → Dashboard refreshes, new timestamp shown
    │
    └── On error → Error banner shown, previous data preserved
```

### Flow 3: Exploring an Opportunity

```
User on Opportunity Engine tab
    │
    ▼
Clicks Opportunity Card: "Launch T+0 Settlements"
    │
    ▼
Expand animation reveals:
 - Strategic Rationale (full text)
 - Source Signals (linked to Pain Point #1, Feature Request #3)
 - Competitor Window details
 - Recommended Action CTA
    │
    ▼
User clicks "View Pain Point" → navigates to Pain Point tab, filtered to "Settlement Delays"
    │
    ▼
User clicks "Export Opportunity" → copies formatted brief to clipboard
```

### Flow 4: Reading Executive Summary

```
User opens app → Executive Summary card renders at top
    │
    ▼
Reads TL;DR (1 sentence)
    │
    ▼
Scans Top 3 Insights + Top 3 Opportunities (3+3 bullet points)
    │
    ▼
Optional: "View Full Report" → scrolls to relevant module
    │
    └── Optional: "Export as PDF" → downloads one-page briefing
```

---

## 9. Dashboard Wireframes

### 9.1 App Shell

```
┌─────────────────────────────────────────────────────────────────────┐
│ ▣ SMEPay Intelligence Hub          Last updated: June 23, 9:15 AM  │
│                                               [Refresh Intelligence] │
├────────┬────────────────────────────────────────────────────────────┤
│  NAV   │                  CONTENT AREA                              │
│        │                                                            │
│ ◈ Exec │                                                            │
│   Sum  │                                                            │
│        │                                                            │
│ ◈ Mkt  │                                                            │
│   Over │                                                            │
│        │                                                            │
│ ◈ Pain │                                                            │
│   Pts  │                                                            │
│        │                                                            │
│ ◈ Feat │                                                            │
│   Req  │                                                            │
│        │                                                            │
│ ◈ Comp │                                                            │
│   Intel│                                                            │
│        │                                                            │
│ ◈ Opp  │                                                            │
│   Eng  │                                                            │
│        │                                                            │
│ ◈ Recs │                                                            │
│        │                                                            │
└────────┴────────────────────────────────────────────────────────────┘
```

### 9.2 Executive Summary Card

```
┌─────────────────────────────────────────────────────────────────────┐
│  EXECUTIVE BRIEFING                               ≈ 45 sec read    │
│  ─────────────────────────────────────────────────────────────────  │
│  Market Mood: ● Cautiously Negative                                 │
│                                                                     │
│  The Indian merchant payments market is experiencing significant    │
│  friction around settlements and support. Razorpay leads in        │
│  volume but faces mounting support complaints. BharatPe struggles  │
│  with reliability. SMEPay has a clear window to win on trust.      │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  TOP 3 INSIGHTS     │  │  TOP 3 OPPORTUNITIES               │  │
│  │  ─────────────────  │  │  ──────────────────────────────     │  │
│  │  1. Settlement de-  │  │  1. T+0 Settlements (High conf.)   │  │
│  │     lay is #1 pain  │  │  2. Onboarding in < 4 hours        │  │
│  │  2. Support is      │  │  3. Merchant analytics dashboard   │  │
│  │     every competi-  │  │                                     │  │
│  │     tor's weakness  │  │                                     │  │
│  │  3. GST reporting   │  │                                     │  │
│  │     gap = unmet     │  │                                     │  │
│  │     demand          │  │                                     │  │
│  └─────────────────────┘  └─────────────────────────────────────┘  │
│                                              [Export PDF] [Details] │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.3 Market Overview Tab

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DISCUSSIONS  │  │ COMPETITORS  │  │   POSITIVE   │  │    TIME      │
│   ANALYZED   │  │  DETECTED    │  │  SENTIMENT   │  │    RANGE     │
│              │  │              │  │              │  │              │
│     847      │  │      4       │  │    23%       │  │  Last 30d    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

MOST DISCUSSED THEMES
─────────────────────────────────────────────────
Settlement Speed     ████████████████████░░░  312  ↑
Merchant Support     ███████████████████░░░░  287  →
Onboarding Friction  █████████████░░░░░░░░░░  198  ↑
Dashboard / Reports  █████████░░░░░░░░░░░░░░  143  →
Pricing & MDR        ████████░░░░░░░░░░░░░░░  119  ↓

SENTIMENT DISTRIBUTION
●  Positive  23%
●  Neutral   41%
●  Negative  36%
```

### 9.4 Pain Point Card

```
┌─────────────────────────────────────────────────────────────────────┐
│  ● CRITICAL          Settlement Delays                    #1 ↑ up  │
│  ─────────────────────────────────────────────────────────────────  │
│  Merchants report T+2 and longer settlement cycles with no         │
│  proactive communication. Worsening in last 2 weeks.              │
│                                                                     │
│  Frequency: ██████████████████████░░ 298 mentions                  │
│  Severity Score: 9.1 / 10                                          │
│  Affects: Razorpay ✕  Paytm Business ✕                            │
│                                                                     │
│  [▾ View Evidence (12 quotes)]                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  "Been waiting 4 days for my settlement, support doesn't respond   │
│   at all. 234 upvotes — r/IndiaFintech — June 15"                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.5 Opportunity Card

```
┌─────────────────────────────────────────────────────────────────────┐
│  #1  Launch T+0 Settlement for High-Volume Merchants               │
│  ──────────────────────────────────────────────────                 │
│  Confidence: ████████████████████░░░  92 / 100                     │
│  Impact: HIGH   Effort: MEDIUM   Horizon: Q3 2026                 │
│                                                                     │
│  Settlement delay is the #1 pain point (298 mentions). Razorpay's │
│  instant settlement feature is paywalled at ₹10L/month. SMEPay    │
│  can offer T+0 at a lower threshold to capture the mid-market.    │
│                                                                     │
│  Source signals: [Pain Point #1] [Feature Request #1]             │
│  Competitor window: Razorpay (weakness) + PhonePe (no offering)   │
│                                                                     │
│  → Recommended Action: Launch T+0 for merchants > ₹2L/month GMV  │
│                                    [Copy Brief]  [View Evidence]   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Screen-by-Screen Breakdown

### Screen 1: Empty State (No Data)

**Route:** `/`  
**Condition:** No cached analysis exists  
**Components:**
- SMEPay logo + app title
- Illustration: Empty chart/graph graphic
- Headline: "Your Intelligence Hub is ready."
- Subtext: "Run your first analysis to start getting actionable insights from the market."
- CTA Button: "Run First Analysis" (primary, full-width on center panel)

---

### Screen 2: Progress Screen

**Route:** `/refresh`  
**Trigger:** User initiates new analysis  
**Components:**
- Animated progress tracker with 4 steps:
  1. "Connecting to Reddit" → ✓
  2. "Collecting discussions" → shows count (e.g., "Collected 412 / 500...")
  3. "Running AI Analysis" → shimmer animation
  4. "Building your intelligence dashboard" → shimmer
- Cancel button (aborts job if in Step 1–2, cannot cancel Step 3)
- Estimated time remaining: "~2 min remaining"

---

### Screen 3: Executive Summary

**Route:** `/` (default tab after data exists)  
**Components:**
- Full-width "Executive Briefing" card (see wireframe §9.2)
- Market Mood chip (Positive / Mixed / Cautiously Negative / Negative)
- TL;DR paragraph (AI-generated, 2–3 sentences)
- Top 3 Insights list
- Top 3 Opportunities list
- Export buttons: [Export PDF] [Copy to Clipboard]

---

### Screen 4: Market Overview Tab

**Route:** `/overview`  
**Components:**
- 4 KPI metric cards (horizontal row)
- Donut chart: Sentiment distribution
- Horizontal bar chart: Theme frequency with trend arrows
- Subreddits analyzed (pill list)
- Time range selector: 7d / 30d / 90d

---

### Screen 5: Pain Point Intelligence Tab

**Route:** `/pain-points`  
**Components:**
- Filter row: Severity (All / Critical / High / Medium / Low), Competitor chips
- Sort: By Frequency | By Severity | By Trend
- Pain point cards (list view), expandable for quotes
- Side panel (on expand): Representative quotes with subreddit source, date, upvotes

---

### Screen 6: Feature Request Intelligence Tab

**Route:** `/feature-requests`  
**Components:**
- Category filter pills: All / Payments / Analytics / Support / Integrations / Compliance
- Sort: By Demand | By Frequency
- Feature request cards with demand badge
- Expandable evidence drawer
- "Add to Backlog" button (V2 — Jira integration)

---

### Screen 7: Competitor Intelligence Tab

**Route:** `/competitors`  
**Components:**
- 4 competitor cards in 2×2 grid (desktop)
- Each card: Name + overall sentiment + Strengths column + Weaknesses column
- Perception keywords: chip cloud
- "SMEPay Opportunity" call-out box (highlighted)
- Side-by-side compare mode (toggle at top)

---

### Screen 8: Opportunity Engine Tab

**Route:** `/opportunities`  
**Components:**
- Ranked opportunity cards (numbered #1 to #N)
- Confidence score meter
- Source signals (linked chips)
- Competitor window text
- Recommended action CTA
- Impact/Effort badge pair

---

### Screen 9: Strategic Recommendations Tab

**Route:** `/recommendations`  
**Components:**
- Priority-ordered action list (numbered)
- Impact/Effort matrix chart (2×2 quadrant)
- Each item: Action text + Impact badge + Effort badge + Time horizon chip + Evidence snippet
- "Export to Notion" placeholder button (V2)
- "Copy All" button

---

## 11. API Architecture

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### POST `/analysis/run`
Triggers new data collection + AI analysis.

**Request:**
```json
{
  "time_window_days": 30,
  "max_posts_per_keyword": 50,
  "keywords": ["SMEPay", "Razorpay", "settlement delays", "merchant payments"]
}
```

**Response:**
```json
{
  "job_id": "job_abc123",
  "status": "running",
  "started_at": "2026-06-23T09:15:00Z",
  "estimated_duration_seconds": 240
}
```

---

#### GET `/analysis/status/{job_id}`
Polls job progress.

**Response:**
```json
{
  "job_id": "job_abc123",
  "status": "analyzing",
  "progress": {
    "step": "ai_analysis",
    "posts_collected": 487,
    "posts_analyzed": 0
  }
}
```

---

#### GET `/analysis/latest`
Returns the most recent cached analysis.

**Response:** Full intelligence JSON (see §12 schema)

---

#### GET `/modules/executive-summary`
Returns only the executive summary module.

#### GET `/modules/market-overview`
Returns only the market overview module.

#### GET `/modules/pain-points`
**Query params:** `?severity=critical&competitor=Razorpay`

#### GET `/modules/feature-requests`
**Query params:** `?category=payments&sort=demand`

#### GET `/modules/competitors`
**Query params:** `?name=Razorpay`

#### GET `/modules/opportunities`
**Query params:** `?min_confidence=70`

#### GET `/modules/recommendations`

---

#### GET `/export/pdf`
Generates and returns PDF of executive summary.

#### GET `/export/json`
Returns full analysis as downloadable JSON file.

---

### Reddit Collection Endpoint (Internal)

#### POST `/collect/reddit`
Called internally by `analysis/run`. Not exposed to frontend directly.

**Request:**
```json
{
  "keywords": ["..."],
  "subreddits": ["IndiaFintech", "india", "startups", "smallbusiness"],
  "time_filter": "month",
  "limit_per_keyword": 50
}
```

---

## 12. Database Schema

Using SQLite for V1 (easy setup, no infra required). Postgres-compatible schema.

```sql
-- Raw collected Reddit posts
CREATE TABLE reddit_posts (
    id TEXT PRIMARY KEY,                -- Reddit post ID
    title TEXT NOT NULL,
    body TEXT,
    subreddit TEXT NOT NULL,
    author TEXT,
    upvotes INTEGER DEFAULT 0,
    num_comments INTEGER DEFAULT 0,
    url TEXT,
    created_utc TIMESTAMP NOT NULL,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_run_id TEXT,               -- FK to analysis_runs
    FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id)
);

-- Comments associated with posts
CREATE TABLE reddit_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    body TEXT NOT NULL,
    author TEXT,
    upvotes INTEGER DEFAULT 0,
    created_utc TIMESTAMP NOT NULL,
    FOREIGN KEY (post_id) REFERENCES reddit_posts(id)
);

-- Analysis run metadata
CREATE TABLE analysis_runs (
    id TEXT PRIMARY KEY,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status TEXT DEFAULT 'running',      -- running | completed | failed
    posts_collected INTEGER DEFAULT 0,
    time_window_days INTEGER DEFAULT 30,
    error_message TEXT
);

-- Full AI analysis results (stored as JSON blob)
CREATE TABLE analysis_results (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result_json TEXT NOT NULL,          -- Full structured JSON output
    is_latest INTEGER DEFAULT 0,        -- 1 = current active result
    FOREIGN KEY (run_id) REFERENCES analysis_runs(id)
);

-- Keyword configuration
CREATE TABLE keyword_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    category TEXT,                      -- competitor | topic | product
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
```sql
CREATE INDEX idx_reddit_posts_run ON reddit_posts(analysis_run_id);
CREATE INDEX idx_results_latest ON analysis_results(is_latest);
CREATE INDEX idx_posts_created ON reddit_posts(created_utc);
```

---

## 13. AI Prompt Architecture

### 13.1 Prompt Design Philosophy

All prompts follow a **Persona → Context → Task → Output Format → Constraints** structure. Prompts are stored in `/backend/prompts/` as `.txt` files.

### 13.2 Master Analysis Prompt

**File:** `/backend/prompts/master_analysis.txt`

```
SYSTEM:
You are a Senior Product Strategy Analyst and Market Research Consultant specializing 
in Indian fintech and merchant payments. You analyze merchant discussions to surface 
actionable intelligence for SMEPay, a fintech company serving Indian merchants.

Your analysis should read like a briefing from McKinsey, not a sentiment score report.
Be opinionated. Be specific. Prioritize actionability over completeness.

USER:
You are analyzing {POST_COUNT} Reddit discussions collected from Indian fintech communities.
These discussions cover topics including: SMEPay, Razorpay, BharatPe, PhonePe Business, 
Paytm Business, merchant payments, UPI, POS systems, and merchant onboarding.

Time window: Last {TIME_WINDOW} days.

DISCUSSIONS:
{FORMATTED_DISCUSSIONS}

---

Analyze these discussions and return a JSON object with EXACTLY this structure.
Return ONLY valid JSON. No markdown, no preamble, no explanation.

{
  "executive_summary": {
    "tldr": "2-3 sentence market overview from a strategic lens",
    "market_mood": "positive|mixed|cautiously_negative|negative",
    "top_3_insights": ["insight 1", "insight 2", "insight 3"],
    "top_3_opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "smepay_strategic_position": "1-2 sentence assessment",
    "recommended_immediate_action": "Most urgent single action for SMEPay"
  },
  "market_overview": {
    "total_discussions_analyzed": <integer>,
    "overall_sentiment": { "positive": <int%>, "neutral": <int%>, "negative": <int%> },
    "most_discussed_themes": [
      { "theme": "...", "frequency": <int>, "trend": "rising|stable|falling" }
    ]
  },
  "pain_points": [
    {
      "id": "pp_001",
      "title": "...",
      "description": "...",
      "frequency": <int>,
      "severity": "critical|high|medium|low",
      "severity_score": <float 1-10>,
      "competitor_affected": ["Razorpay", ...],
      "representative_quotes": [
        { "text": "...", "subreddit": "...", "approximate_upvotes": <int> }
      ],
      "trend": "rising|stable|falling"
    }
  ],
  "feature_requests": [
    {
      "id": "fr_001",
      "title": "...",
      "category": "payments|analytics|support|integrations|compliance",
      "demand_level": "very_high|high|medium|low|niche",
      "frequency": <int>,
      "supporting_evidence": ["quote 1", "quote 2"],
      "estimated_impact": "..."
    }
  ],
  "competitors": [
    {
      "name": "Razorpay",
      "overall_sentiment": "positive|mixed|negative",
      "strengths": [
        { "attribute": "...", "mention_count": <int>, "sample_quote": "..." }
      ],
      "weaknesses": [
        { "attribute": "...", "mention_count": <int>, "severity": "high|medium|low" }
      ],
      "market_perception_keywords": ["reliable", "expensive", ...],
      "smepay_opportunity_windows": ["opportunity description"]
    }
  ],
  "opportunities": [
    {
      "id": "opp_001",
      "title": "...",
      "source_signals": ["pp_001", "fr_001"],
      "confidence_score": <int 0-100>,
      "strategic_rationale": "...",
      "expected_impact": "...",
      "effort_estimate": "high|medium|low",
      "priority_rank": <int>,
      "competitor_window": "...",
      "recommended_action": "..."
    }
  ],
  "recommendations": [
    {
      "priority": <int>,
      "action": "...",
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "time_horizon": "Next Sprint|Next Quarter|Next Half|Next Year",
      "evidence": "..."
    }
  ]
}

CONSTRAINTS:
- Return minimum 5 pain points, 5 feature requests, 4 competitors, 3 opportunities, 5 recommendations
- Confidence scores must be calculated: Pain Frequency (40%) + Competitor Gap (30%) + Demand (20%) + Severity (10%)
- Quotes must be paraphrased, not exact if > 20 words
- All frequency counts must be realistic estimates from the discussions provided
- Never mention SMEPay as having a weakness (focus analysis on competitors and the market)
- Be direct. No hedging language like "might" or "could potentially."
```

### 13.3 Post Formatter (Pre-processing)

**File:** `/backend/prompts/post_formatter.py`

```python
def format_posts_for_prompt(posts: list[dict]) -> str:
    """
    Format Reddit posts into structured text for the AI prompt.
    Truncate body to 500 chars, include top 3 comments max.
    """
    formatted = []
    for i, post in enumerate(posts[:300]):  # Cap at 300 posts per API call
        entry = f"""
POST {i+1}:
Subreddit: r/{post['subreddit']}
Title: {post['title']}
Body: {post['body'][:500]}
Upvotes: {post['upvotes']}
Top Comments:
{chr(10).join([f'  - {c["body"][:200]}' for c in post['comments'][:3]])}
---"""
        formatted.append(entry)
    return "\n".join(formatted)
```

### 13.4 PDF Summary Prompt

**File:** `/backend/prompts/pdf_summary.txt`

```
You are generating a one-page executive briefing for the SMEPay founder.
It must be readable in under 60 seconds.
Tone: Direct, confident, strategic. No filler.

Based on this analysis data: {ANALYSIS_JSON}

Generate a structured briefing with:
1. Market Situation (2 sentences)
2. Three Critical Insights (bullet points, 1 sentence each)
3. Top Three Opportunities with confidence scores
4. Recommended immediate action (1 sentence, bold)

Format: Clean prose, not bullet soup.
```

---

## 14. System Design

### 14.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMEPAY INTELLIGENCE HUB                     │
├────────────────────────────┬────────────────────────────────────┤
│       FRONTEND             │          BACKEND                   │
│   (Next.js + TypeScript)   │         (FastAPI)                  │
│                            │                                    │
│  ┌──────────────────────┐  │  ┌──────────────────────────────┐  │
│  │  Dashboard UI        │  │  │  Analysis Router             │  │
│  │  (7 module tabs)     │◄─┼─►│  POST /analysis/run          │  │
│  └──────────────────────┘  │  │  GET  /analysis/latest       │  │
│                            │  └─────────────┬────────────────┘  │
│  ┌──────────────────────┐  │                │                   │
│  │  Progress Tracker    │  │  ┌─────────────▼────────────────┐  │
│  │  (SSE or polling)    │  │  │  Data Collection Layer       │  │
│  └──────────────────────┘  │  │  ┌────────────────────────┐  │  │
│                            │  │  │  Reddit Adapter (PRAW)  │  │  │
│  ┌──────────────────────┐  │  │  │  [Extensible pattern]  │  │  │
│  │  Export Module       │  │  │  └────────────────────────┘  │  │
│  │  (PDF / JSON)        │  │  └─────────────┬────────────────┘  │
│  └──────────────────────┘  │                │                   │
│                            │  ┌─────────────▼────────────────┐  │
└────────────────────────────┘  │  AI Analysis Layer           │  │
                                │  Gemini API (google-genai)   │  │
         ┌──────────────────────│  Prompt → Structured JSON    │  │
         │                      └─────────────┬────────────────┘  │
         │                                    │                   │
         │                      ┌─────────────▼────────────────┐  │
         │                      │  Persistence Layer           │  │
         │                      │  SQLite (analysis_results)   │  │
         │                      │  File cache (latest.json)    │  │
         │                      └──────────────────────────────┘  │
         │                                                        │
         └────────────────────────────────────────────────────────┘

External APIs:
  ● Reddit API / PRAW     → Data Collection
  ● Google Gemini API     → AI Analysis
```

### 14.2 Data Flow

```
Trigger (User) 
    │
    ▼
FastAPI: POST /analysis/run
    │
    ▼
Background Task spun up
    │
    ├─► Reddit Adapter: fetch posts by keyword × subreddit
    │        └── Store raw posts to SQLite
    │
    ├─► Post Formatter: truncate + structure posts into prompt
    │
    ├─► Gemini API: send formatted prompt
    │        └── Parse JSON response
    │        └── Validate schema
    │
    ├─► Store result JSON to analysis_results table
    │        └── Set is_latest = 1, demote previous
    │
    └─► Update job status to "completed"

Frontend polls GET /analysis/status/{job_id} every 3s
    └── On "completed" → fetch GET /analysis/latest → render
```

### 14.3 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js | 14+ (App Router) |
| Frontend | TypeScript | 5.x |
| Frontend | Tailwind CSS | 3.x |
| Frontend | Recharts | 2.x (charts) |
| Frontend | Radix UI | (headless components) |
| Backend | FastAPI | 0.111+ |
| Backend | Python | 3.11+ |
| Backend | PRAW | 7.7+ |
| Backend | SQLite | Built-in via `aiosqlite` |
| AI | Google Generative AI | `google-generativeai` |
| AI Model | Gemini 1.5 Flash | (speed + cost optimized) |
| PDF Export | ReportLab or WeasyPrint | — |
| Deployment | Localhost / Internal | V1 |

---

## 15. V1 Scope

### In Scope ✅

- Reddit data collection via PRAW
- All 7 intelligence modules (Market Overview through Strategic Recommendations)
- Executive Summary with PDF export
- On-demand analysis refresh
- Progress tracking
- JSON export
- SQLite persistence
- Desktop UI (min 1280px)
- 4 competitors (Razorpay, BharatPe, PhonePe Business, Paytm Business)
- 30-day default time window

### Out of Scope for V1 ❌

- User authentication / login
- Multiple user accounts
- Scheduled / cron-based analysis (user triggers manually)
- Additional data sources (Twitter, Play Store, App Store, LinkedIn, Quora)
- Historical trend comparison (requires 2+ runs — appears in V2)
- Real-time streaming analysis
- Jira / Notion integration
- Mobile responsiveness
- Team collaboration features
- Custom keyword configuration UI (config file only)
- Email digest / notifications

---

## 16. Future Roadmap

### V1.1 — Scheduled Intelligence (Month 2)
- Cron job: daily analysis at 6 AM IST
- Email digest: send executive summary to founder daily
- Historical comparison: "vs last week" trend lines

### V1.2 — Source Expansion (Month 2–3)
- Play Store Reviews adapter
- App Store Reviews adapter
- LinkedIn public posts adapter (if API available)
- Quora scraper (via web scraping with rate limiting)

### V2 — Collaborative Intelligence (Month 3–4)
- Multi-user access with role-based views (Founder / PM / BD)
- Annotation: team members can comment on insights
- Task creation: push recommendations to Jira/Linear
- Slack bot: daily summary in #intelligence channel

### V2.1 — Advanced Analytics (Month 4–5)
- Segment-level analysis (SMB vs. Enterprise merchants)
- Vertical breakdown (Restaurant / Retail / D2C / Services)
- City-level sentiment tracking
- Merchant lifecycle correlation (onboarding friction → churn signal)

### V3 — Predictive Intelligence (Month 6+)
- Trend forecasting: predict which pain point will escalate next month
- Competitor move detection: alert when competitor launches feature
- SMEPay NPS proxy: infer NPS from indirect mentions
- Webhook alerts: "Sentiment spike detected — Razorpay support down"

### V4 — Proprietary Data Layer (Month 8+)
- Integrate SMEPay's own merchant transaction data
- Correlate public sentiment with internal churn data
- Build a proprietary merchant intelligence index

---

## 17. Success Metrics

### 17.1 Usage Metrics (Adoption)
| Metric | Target (Month 1) | Target (Month 3) |
|---|---|---|
| Weekly active users (internal) | 3 | All 5 user types |
| Analysis runs per week | 2+ | 5+ |
| Executive Summary views per week | 5+ | Daily |
| Avg session duration | > 4 min | > 7 min |

### 17.2 Quality Metrics (Intelligence Accuracy)
| Metric | Method | Target |
|---|---|---|
| Pain point accuracy | PM validates top 5 against support tickets | > 80% overlap |
| Opportunity relevance | Founder rates top 3 opportunities | > 4/5 rating |
| Recommendation actionability | PM converts recs to backlog items | > 60% conversion |

### 17.3 Business Impact Metrics (Month 3–6)
| Metric | Definition |
|---|---|
| Product decisions informed | # of roadmap items where Intelligence Hub was cited |
| Competitive gaps addressed | # of competitor weaknesses SMEPay shipped features for |
| Merchant retention uplift | Correlation: pain points fixed → churn reduction |

### 17.4 Technical Metrics
| Metric | Target |
|---|---|
| Analysis run success rate | > 95% |
| Time to complete analysis | < 5 minutes |
| Dashboard load time (cached) | < 2 seconds |
| Gemini API error rate | < 2% |

---

## 18. Risks and Limitations

### 18.1 Data Quality Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Reddit data is skewed toward power users, not average merchants | High | Medium | Label all insights with "Reddit-based signal" caveat; cross-validate with V2 app store reviews |
| Low volume of SMEPay-specific discussions (newer brand) | High | High | Expand to competitor discussions for market intelligence; SMEPay-specific signal improves over time |
| Reddit API rate limits hit during large collections | Medium | Medium | Implement exponential backoff + partial collection fallback |
| Posts may be outdated or context-missing without thread view | Medium | Low | Include thread context (top comments) in data collection |

### 18.2 AI Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini returns malformed JSON | Medium | High | JSON schema validation + retry with simpler prompt |
| Hallucinated quotes or statistics | Medium | High | Prompt instructs paraphrasing; UI labels source clearly |
| Prompt exceeds token limit for large post batches | Low | High | Chunk posts into batches of 200, run multiple calls, merge results |
| AI bias against certain competitors based on training data | Low | Medium | Prompt explicitly instructs data-grounded analysis only |

### 18.3 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PRAW authentication fails | Low | High | Use read-only script auth; document refresh token rotation |
| SQLite concurrency issues during parallel requests | Low | Low | V1 is single-user; V2 migrates to Postgres |
| Gemini API cost overruns | Low | Medium | Use Gemini Flash (cheapest); cache all results; alert on > 50 runs/month |

### 18.4 Strategic Limitations

- **Representativeness:** Reddit discussions represent a vocal minority, not all merchants.
- **Lag:** Reddit discussions follow events with a delay; not real-time market signal.
- **Language:** V1 English-only; misses Hindi/regional language merchant discussions.
- **Gaming risk:** Competitor teams can post misleading content on Reddit; analyze clusters, not single posts.

---

## 19. Technical Implementation Plan

### 19.1 Directory Structure

```
smepay-intelligence-hub/
├── frontend/                          # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Executive Summary
│   │   ├── overview/page.tsx
│   │   ├── pain-points/page.tsx
│   │   ├── feature-requests/page.tsx
│   │   ├── competitors/page.tsx
│   │   ├── opportunities/page.tsx
│   │   ├── recommendations/page.tsx
│   │   └── refresh/page.tsx
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── layout/Header.tsx
│   │   ├── modules/ExecutiveSummary.tsx
│   │   ├── modules/MarketOverview.tsx
│   │   ├── modules/PainPoints.tsx
│   │   ├── modules/FeatureRequests.tsx
│   │   ├── modules/CompetitorIntel.tsx
│   │   ├── modules/OpportunityEngine.tsx
│   │   ├── modules/Recommendations.tsx
│   │   ├── shared/KpiCard.tsx
│   │   ├── shared/SeverityBadge.tsx
│   │   ├── shared/ConfidenceMeter.tsx
│   │   └── shared/EmptyState.tsx
│   ├── lib/
│   │   ├── api.ts                     # API client
│   │   └── types.ts                   # TypeScript interfaces
│   └── styles/globals.css
│
├── backend/                           # FastAPI app
│   ├── main.py                        # FastAPI app + CORS
│   ├── routers/
│   │   ├── analysis.py                # /analysis/* endpoints
│   │   ├── modules.py                 # /modules/* endpoints
│   │   └── export.py                  # /export/* endpoints
│   ├── services/
│   │   ├── reddit_service.py          # PRAW data collection
│   │   ├── ai_service.py              # Gemini integration
│   │   ├── analysis_service.py        # Orchestration
│   │   └── export_service.py          # PDF / JSON export
│   ├── adapters/
│   │   ├── base_adapter.py            # Abstract base for data sources
│   │   └── reddit_adapter.py          # Reddit implementation
│   ├── db/
│   │   ├── database.py                # SQLite connection
│   │   └── models.py                  # Table definitions
│   ├── prompts/
│   │   ├── master_analysis.txt
│   │   └── pdf_summary.txt
│   ├── config/
│   │   ├── keywords.json              # Keyword configuration
│   │   └── sources.config.json        # Data source config
│   └── requirements.txt
│
├── .env                               # API keys (never commit)
└── README.md
```

### 19.2 Key Configuration Files

**`/backend/config/keywords.json`**
```json
{
  "competitors": ["Razorpay", "BharatPe", "PhonePe Business", "Paytm Business"],
  "topics": [
    "merchant payments", "payment gateway", "UPI business", "POS system",
    "merchant onboarding", "settlement delay", "business banking",
    "payment processing India", "GST reporting", "MDR charges"
  ],
  "subreddits": [
    "IndiaFintech", "india", "startups", "smallbusiness",
    "entrepreneur", "IndiaBusiness", "fintech"
  ]
}
```

### 19.3 Core Service Implementations

**`/backend/services/reddit_service.py` (Key Logic)**
```python
import praw
import os
from datetime import datetime, timedelta

def collect_posts(keywords: list[str], subreddits: list[str], 
                  time_window_days: int = 30, limit: int = 50) -> list[dict]:
    reddit = praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        user_agent="SMEPay Intelligence Hub v1.0"
    )
    
    cutoff = datetime.utcnow() - timedelta(days=time_window_days)
    posts = []
    seen_ids = set()
    
    for keyword in keywords:
        for submission in reddit.subreddit("+".join(subreddits)).search(
            keyword, time_filter="month", limit=limit, sort="relevance"
        ):
            if submission.id in seen_ids:
                continue
            seen_ids.add(submission.id)
            
            submission.comments.replace_more(limit=0)
            top_comments = [
                {"body": c.body[:300], "upvotes": c.score}
                for c in sorted(submission.comments.list()[:20], 
                                key=lambda x: x.score, reverse=True)[:5]
            ]
            
            posts.append({
                "id": submission.id,
                "title": submission.title,
                "body": submission.selftext[:600],
                "subreddit": submission.subreddit.display_name,
                "upvotes": submission.score,
                "url": submission.url,
                "created_utc": datetime.utcfromtimestamp(submission.created_utc),
                "comments": top_comments
            })
    
    return posts
```

**`/backend/services/ai_service.py` (Key Logic)**
```python
import google.generativeai as genai
import json
import os
from pathlib import Path

def analyze_discussions(posts: list[dict], time_window: int) -> dict:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt_template = Path("prompts/master_analysis.txt").read_text()
    formatted_posts = format_posts_for_prompt(posts)
    
    prompt = prompt_template.replace("{POST_COUNT}", str(len(posts)))
    prompt = prompt.replace("{TIME_WINDOW}", str(time_window))
    prompt = prompt.replace("{FORMATTED_DISCUSSIONS}", formatted_posts)
    
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.3
        )
    )
    
    return json.loads(response.text)
```

---

## 20. Build Order for One-Day MVP

Total estimated time: **8–10 hours** for a developer with the stated stack experience.

---

### Hour 0–0.5 | Project Setup

```bash
# Backend
mkdir smepay-intel-hub && cd smepay-intel-hub
mkdir backend frontend

cd backend
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn praw google-generativeai aiosqlite python-dotenv

# Frontend
cd ../frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# .env
echo "REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
GEMINI_API_KEY=xxx" > ../.env
```

**Deliverable:** Repo structure, dev environment running.

---

### Hour 0.5–1.5 | Backend Core (Database + Reddit)

1. Create SQLite schema (`db/database.py`, `db/models.py`)
2. Create Reddit adapter (`adapters/reddit_adapter.py`)
3. Test Reddit collection with 2 keywords → verify JSON output
4. Store results to SQLite

**Deliverable:** `GET /collect/reddit` returns 50+ posts correctly stored.

---

### Hour 1.5–3.0 | AI Analysis Layer

1. Write `prompts/master_analysis.txt` (copy from §13.2)
2. Implement `services/ai_service.py`
3. Test with 50 posts → verify JSON structure matches schema
4. Add error handling, retry logic
5. Store result to `analysis_results` table

**Deliverable:** Full analysis JSON generated from real Reddit data.

---

### Hour 3.0–4.0 | FastAPI Router Layer

1. Implement `routers/analysis.py`:
   - `POST /analysis/run` (triggers background task)
   - `GET /analysis/status/{job_id}`
   - `GET /analysis/latest`
2. Implement `routers/modules.py` for each of 7 module endpoints
3. Add CORS middleware for Next.js dev server
4. Test all endpoints with curl / Thunder Client

**Deliverable:** All backend endpoints working, Postman collection created.

---

### Hour 4.0–5.5 | Frontend Foundation + Layout

1. Design token setup in `globals.css`:
   ```css
   :root {
     --navy: #0F1E3C;
     --teal: #00B8D9;
     --amber: #F59E0B;
     --slate: #F7F9FC;
     --charcoal: #1E293B;
     --mid-gray: #64748B;
   }
   ```
2. Build `Sidebar.tsx` with all 7 nav items + SMEPay logo
3. Build `Header.tsx` with last-updated timestamp + Refresh button
4. Build `api.ts` API client with typed fetch functions
5. Build `types.ts` with TypeScript interfaces for full analysis JSON

**Deliverable:** App shell renders correctly with navigation.

---

### Hour 5.5–6.5 | Executive Summary + Market Overview Screens

1. Build `ExecutiveSummary.tsx` component (§9.2 wireframe)
2. Build `MarketOverview.tsx` with KPI cards + Recharts donut chart + bar chart
3. Wire to backend: fetch from `/analysis/latest` on page load
4. Build `EmptyState.tsx` for no-data condition
5. Build `refresh/page.tsx` progress screen with polling

**Deliverable:** First two screens fully functional with live data.

---

### Hour 6.5–7.5 | Pain Points + Feature Requests + Competitors

1. Build `PainPoints.tsx`: filterable list + severity badges + quote expansion
2. Build `FeatureRequests.tsx`: ranked list + demand badges + evidence accordion
3. Build `CompetitorIntel.tsx`: 2×2 competitor card grid + perception keyword chips
4. Wire all three to module endpoints

**Deliverable:** Core intelligence modules displaying live analyzed data.

---

### Hour 7.5–8.5 | Opportunity Engine + Recommendations

1. Build `OpportunityEngine.tsx`: ranked cards + confidence meter arc + source links
2. Build `Recommendations.tsx`: priority list + Impact/Effort matrix
3. Add "Copy to Clipboard" functionality on recommendations
4. Add JSON export button on any page

**Deliverable:** All 7 modules complete and functional.

---

### Hour 8.5–9.5 | Polish + PDF Export

1. Apply SMEPay color palette consistently across all components
2. Add loading skeletons for async data fetching
3. Add error banners for failed states
4. Implement PDF export for Executive Summary (`/export/pdf`)
5. Add tooltips on confidence scores and severity ratings

**Deliverable:** Production-ready internal tool.

---

### Hour 9.5–10 | Ship Checklist

- [ ] Test full flow: refresh → progress → dashboard
- [ ] Verify all 7 modules render with real Gemini output
- [ ] Test edge cases: no Reddit results, Gemini timeout
- [ ] Write `README.md` with setup instructions
- [ ] Remove any hardcoded test data
- [ ] Verify `.env` is in `.gitignore`
- [ ] Take screenshots for portfolio / ship documentation

**Deliverable:** 🚀 Shipped. SMEPay Intelligence Hub is live.

---

## Appendix A: Design Tokens (Complete)

```css
/* SMEPay Intelligence Hub — Design Tokens */
:root {
  /* Primary Palette */
  --color-navy-deep:     #0F1E3C;   /* App background, sidebar */
  --color-navy-medium:   #1A3358;   /* Card backgrounds (dark mode) */
  --color-teal-accent:   #00B8D9;   /* Primary accent, links, highlights */
  --color-teal-soft:     #E0F7FA;   /* Teal chip backgrounds */
  --color-amber-accent:  #F59E0B;   /* Opportunity highlights, warnings */
  --color-amber-soft:    #FEF3C7;   /* Amber chip backgrounds */

  /* Neutral Palette */
  --color-slate-bg:      #F7F9FC;   /* Page background */
  --color-white:         #FFFFFF;   /* Card surfaces */
  --color-border:        #E2E8F0;   /* Borders, dividers */
  --color-charcoal:      #1E293B;   /* Primary text */
  --color-mid-gray:      #64748B;   /* Secondary text */
  --color-light-gray:    #94A3B8;   /* Muted text, labels */

  /* Semantic Colors */
  --color-critical:      #EF4444;   /* Critical severity */
  --color-high:          #F97316;   /* High severity */
  --color-medium:        #EAB308;   /* Medium severity */
  --color-low:           #22C55E;   /* Low severity / positive */

  /* Typography */
  --font-display:  'Inter', sans-serif;
  --font-body:     'Inter', sans-serif;
  --font-mono:     'JetBrains Mono', monospace;  /* Scores, numbers */

  /* Type Scale */
  --text-xs:    0.75rem;   /* 12px — labels, captions */
  --text-sm:    0.875rem;  /* 14px — secondary body */
  --text-base:  1rem;      /* 16px — primary body */
  --text-lg:    1.125rem;  /* 18px — card titles */
  --text-xl:    1.25rem;   /* 20px — section headers */
  --text-2xl:   1.5rem;    /* 24px — page titles */
  --text-4xl:   2.25rem;   /* 36px — KPI numbers */

  /* Spacing */
  --space-sidebar: 240px;
  --space-header:  64px;

  /* Radius */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
}
```

---

## Appendix B: Environment Variables

```env
# Reddit API (https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=SMEPay Intelligence Hub v1.0 by /u/your_username

# Google Gemini API (https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_key

# App Config
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
DATABASE_URL=./smepay_intel.db
MAX_POSTS_PER_RUN=500
DEFAULT_TIME_WINDOW_DAYS=30
```

---

*PRD Version 1.0 — Built for SMEPay Internal Use*  
*"What should SMEPay do next? This platform answers that."*
