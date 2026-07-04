# SMEPay Intelligence Hub — Day 15 MVP Build Guide

> **Founding engineer mode.** No database. No job system. No exports. No routes.  
> One button. One Gemini call. One scrollable dashboard. Ship by midnight.

---

## What You're Building Tonight

```
[Analyze Market →]
        ↓
  Loading spinner (2–4 min)
        ↓
┌───────────────────────────────┐
│  Executive Briefing           │
│  Pain Points (with evidence)  │
│  Competitor Intelligence      │
│  Opportunity Engine           │
│  Recommendations              │
└───────────────────────────────┘
```

**Stack:** FastAPI + PRAW + Gemini → Next.js (single page, no routing)  
**Complexity cuts:** No DB · No background jobs · No PDF · No auth · No multi-page routing

---

## Project Structure

```
smepay-intel/
├── backend/
│   ├── main.py
│   ├── services/
│   │   ├── reddit_service.py
│   │   └── ai_service.py
│   ├── prompt.txt
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx          ← entire app lives here
    ├── types/
    │   └── index.ts
    └── tailwind.config.ts
```

---

## Step 1 — Backend Setup (15 min)

```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn praw google-generativeai python-dotenv
```

**`backend/.env`**
```env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=SMEPayIntel/1.0 by /u/your_reddit_username
GEMINI_API_KEY=your_gemini_key
```

> Get Reddit credentials: reddit.com/prefs/apps → Create App → "script" type  
> Get Gemini key: aistudio.google.com → Get API Key

---

## Step 2 — Backend Files (30 min)

### `backend/requirements.txt`
```
fastapi
uvicorn
praw
google-generativeai
python-dotenv
```

---

### `backend/services/reddit_service.py`

```python
import praw
import os
from dotenv import load_dotenv

load_dotenv()

# These keywords search for ECOSYSTEM discourse, not just SMEPay.
# SMEPay may have few mentions — competitors have thousands.
# We analyze the market, then identify opportunities for SMEPay.
KEYWORDS = [
    "Razorpay merchant",
    "BharatPe business",
    "PhonePe for business",
    "Paytm merchant",
    "payment gateway India",
    "UPI settlement merchant",
    "merchant onboarding India",
    "POS machine India",
    "payment processing India startup",
    "merchant payments problem India",
]

SUBREDDITS = "IndiaFintech+india+startups+smallbusiness+entrepreneur"


def collect_posts(max_posts: int = 150, time_window: str = "month") -> list[dict]:
    reddit = praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        user_agent=os.getenv("REDDIT_USER_AGENT"),
    )

    seen_ids = set()
    posts = []

    posts_per_keyword = max(1, max_posts // len(KEYWORDS))

    for keyword in KEYWORDS:
        if len(posts) >= max_posts:
            break

        try:
            results = reddit.subreddit(SUBREDDITS).search(
                keyword,
                time_filter=time_window,
                limit=posts_per_keyword,
                sort="relevance",
            )

            for submission in results:
                if submission.id in seen_ids or len(posts) >= max_posts:
                    break
                seen_ids.add(submission.id)

                # Grab top 5 comments by upvotes (ignore "load more" expanders)
                submission.comments.replace_more(limit=0)
                top_comments = sorted(
                    submission.comments.list(), key=lambda c: c.score, reverse=True
                )[:5]

                posts.append({
                    "title": submission.title,
                    "body": (submission.selftext or "")[:500],
                    "subreddit": submission.subreddit.display_name,
                    "upvotes": submission.score,
                    "comments": [
                        {"text": c.body[:300], "upvotes": c.score}
                        for c in top_comments
                    ],
                })

        except Exception as e:
            print(f"[Reddit] Error for keyword '{keyword}': {e}")
            continue

    print(f"[Reddit] Collected {len(posts)} posts across {len(seen_ids)} unique IDs")
    return posts
```

---

### `backend/services/ai_service.py`

```python
import google.generativeai as genai
import json
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def format_posts(posts: list[dict]) -> str:
    """Compact post formatter — keeps tokens low, preserves signal."""
    lines = []
    for i, p in enumerate(posts):
        comments_text = "\n".join(
            f"  Comment ({c['upvotes']} upvotes): {c['text']}"
            for c in p["comments"][:3]
        )
        lines.append(
            f"[{i+1}] r/{p['subreddit']} | {p['upvotes']} upvotes\n"
            f"Title: {p['title']}\n"
            f"Body: {p['body']}\n"
            f"{comments_text}\n"
        )
    return "\n---\n".join(lines)


def analyze(posts: list[dict]) -> dict:
    prompt_template = Path(__file__).parent.parent.joinpath("prompt.txt").read_text()
    formatted = format_posts(posts)
    prompt = prompt_template.replace("{{POSTS}}", formatted).replace(
        "{{COUNT}}", str(len(posts))
    )

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.3,        # low temp = consistent, structured output
            max_output_tokens=8192,
        ),
    )

    try:
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except json.JSONDecodeError as e:
        print(f"[AI] JSON parse error: {e}")
        print(f"[AI] Raw response: {response.text[:500]}")
        raise ValueError("Gemini returned malformed JSON. Try again.")
    except Exception as e:
        print(f"[AI] Gemini error: {e}")
        raise
```

---

### `backend/prompt.txt`

```
You are a Senior Market Intelligence Analyst. Your client is SMEPay, an Indian fintech company serving merchants.

You have been given {{COUNT}} Reddit discussions from Indian fintech communities.
These discussions cover Razorpay, BharatPe, PhonePe Business, Paytm Business, merchant payments, UPI settlements, onboarding, and POS systems.

Your job: Analyze the ECOSYSTEM as a whole, then identify strategic opportunities FOR SMEPay.
Do not analyze SMEPay's own weaknesses. Focus on what competitors are failing at and what merchants want that no one is delivering.

---

DISCUSSIONS:
{{POSTS}}

---

Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Exactly this structure:

{
  "executive_summary": {
    "tldr": "2-3 sentence strategic overview. Be direct and specific. No filler.",
    "market_mood": "one of: positive | mixed | cautiously_negative | negative",
    "top_3_insights": [
      "Specific insight #1 with a number or concrete detail",
      "Specific insight #2",
      "Specific insight #3"
    ],
    "top_3_opportunities": [
      "Specific opportunity #1 for SMEPay",
      "Specific opportunity #2 for SMEPay",
      "Specific opportunity #3 for SMEPay"
    ],
    "recommended_action": "The single most impactful thing SMEPay can do right now. One sentence, no hedging."
  },

  "pain_points": [
    {
      "title": "Short pain point title (3-5 words)",
      "description": "What merchants are experiencing. Be specific. 2-3 sentences.",
      "severity": "one of: critical | high | medium | low",
      "severity_score": 8.5,
      "evidence_count": 42,
      "confidence": 88,
      "sample_quotes": [
        "Paraphrased quote from a merchant (20-40 words, authentic voice)",
        "Second paraphrased quote from a different merchant"
      ],
      "competitor_affected": ["Razorpay", "Paytm Business"],
      "trend": "one of: rising | stable | falling"
    }
  ],

  "competitors": [
    {
      "name": "Razorpay",
      "strengths": [
        {
          "attribute": "API Quality",
          "evidence_count": 67,
          "sample_quote": "Paraphrased merchant quote praising this attribute"
        }
      ],
      "weaknesses": [
        {
          "attribute": "Support Responsiveness",
          "evidence_count": 89,
          "sample_quote": "Paraphrased merchant quote criticizing this"
        }
      ],
      "perception_keywords": ["reliable", "expensive", "dev-friendly", "cold support"],
      "smepay_window": "One sentence: specific opportunity SMEPay has against this competitor"
    }
  ],

  "opportunities": [
    {
      "title": "Opportunity title (action-oriented, 5-8 words)",
      "rationale": "Why this is a real opportunity. Cite the pain point + competitor gap. 2-3 sentences.",
      "confidence": 91,
      "impact": "one of: high | medium | low",
      "effort": "one of: high | medium | low",
      "action": "The specific thing SMEPay should build or do. One concrete sentence."
    }
  ],

  "recommendations": [
    {
      "action": "Specific action title",
      "impact": "one of: high | medium | low",
      "effort": "one of: high | medium | low",
      "time_horizon": "one of: Next Sprint | Next Quarter | Next Half",
      "evidence": "One sentence citing the market data that supports this recommendation"
    }
  ]
}

RULES:
- Return minimum: 6 pain points, 4 competitors (Razorpay, BharatPe, PhonePe Business, Paytm Business), 4 opportunities, 5 recommendations
- evidence_count must be realistic estimates based on actual frequency in the provided discussions
- confidence scores: 0-100, calculate from frequency + severity + competitor gap overlap
- sample_quotes must be paraphrased (not verbatim), authentic merchant voice
- Be opinionated and specific. Vague output is useless. "Merchants want better support" is bad. "34 merchants cited 48h+ response times from Razorpay support as their primary churn reason" is good.
- Opportunities must be ranked: #1 = highest confidence + impact
```

---

### `backend/main.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.reddit_service import collect_posts
from services.ai_service import analyze

app = FastAPI(title="SMEPay Intelligence Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    time_window_days: int = 30
    max_posts: int = 150


@app.post("/analyze")
async def run_analysis(req: AnalyzeRequest):
    """
    Single endpoint. Does everything:
    1. Collects Reddit posts
    2. Sends to Gemini
    3. Returns structured JSON
    No job system. No DB. Just results.
    """
    try:
        time_filter = (
            "week" if req.time_window_days <= 7
            else "month" if req.time_window_days <= 30
            else "year"
        )
        posts = collect_posts(max_posts=req.max_posts, time_window=time_filter)

        if len(posts) < 10:
            raise HTTPException(
                status_code=503,
                detail="Not enough Reddit data collected. Check your API credentials."
            )

        result = analyze(posts)
        result["_meta"] = {
            "posts_analyzed": len(posts),
            "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z"
        }
        return result

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"[Main] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed. Check server logs.")


@app.get("/health")
async def health():
    return {"status": "ok"}
```

**Run backend:**
```bash
uvicorn main:app --reload --port 8000
```

---

## Step 3 — Frontend Setup (10 min)

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint
```

---

### `frontend/types/index.ts`

```typescript
export interface Quote {
  text: string;
}

export interface PainPoint {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  severity_score: number;
  evidence_count: number;
  confidence: number;
  sample_quotes: string[];
  competitor_affected: string[];
  trend: 'rising' | 'stable' | 'falling';
}

export interface CompetitorStrength {
  attribute: string;
  evidence_count: number;
  sample_quote: string;
}

export interface Competitor {
  name: string;
  strengths: CompetitorStrength[];
  weaknesses: CompetitorStrength[];
  perception_keywords: string[];
  smepay_window: string;
}

export interface Opportunity {
  title: string;
  rationale: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  action: string;
}

export interface Recommendation {
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  time_horizon: string;
  evidence: string;
}

export interface Analysis {
  executive_summary: {
    tldr: string;
    market_mood: 'positive' | 'mixed' | 'cautiously_negative' | 'negative';
    top_3_insights: string[];
    top_3_opportunities: string[];
    recommended_action: string;
  };
  pain_points: PainPoint[];
  competitors: Competitor[];
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  _meta: {
    posts_analyzed: number;
    generated_at: string;
  };
}

export type AppState = 'idle' | 'loading' | 'done' | 'error';
```

---

### `frontend/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SMEPay Intelligence Hub',
  description: 'AI-Powered Merchant Market Intelligence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

### `frontend/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --navy-deep:   #0F1E3C;
  --navy-mid:    #1A3358;
  --navy-card:   #162b4d;
  --teal:        #00B8D9;
  --teal-soft:   rgba(0, 184, 217, 0.12);
  --amber:       #F59E0B;
  --amber-soft:  rgba(245, 158, 11, 0.12);
  --critical:    #EF4444;
  --high:        #F97316;
  --medium:      #EAB308;
  --low:         #22C55E;
}

body {
  background-color: var(--navy-deep);
  color: white;
}

/* Smooth scroll for section jumps */
html { scroll-behavior: smooth; }
```

---

### `frontend/app/page.tsx`  ← THE ENTIRE APP

```tsx
'use client'

import { useState, useEffect } from 'react'
import type { Analysis, AppState, PainPoint, Competitor, Opportunity, Recommendation } from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const LOADING_MESSAGES = [
  'Scanning Indian fintech discussions on Reddit...',
  'Collecting competitor intelligence...',
  'Identifying merchant pain points...',
  'Running AI analysis on market data...',
  'Mapping opportunities for SMEPay...',
  'Building your intelligence brief...',
]

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:      'bg-green-500/20 text-green-400 border-green-500/30',
}

const IMPACT_STYLES: Record<string, string> = {
  high:   'text-green-400',
  medium: 'text-yellow-400',
  low:    'text-red-400',
}

const TREND_ICON: Record<string, string> = {
  rising:  '↑',
  stable:  '→',
  falling: '↓',
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [data, setData] = useState<Analysis | null>(null)
  const [error, setError] = useState('')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [expandedPP, setExpandedPP] = useState<number | null>(null)
  const [expandedComp, setExpandedComp] = useState<number | null>(null)

  // Cycle loading messages
  useEffect(() => {
    if (appState !== 'loading') return
    const t = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length)
    }, 7000)
    return () => clearInterval(t)
  }, [appState])

  async function runAnalysis() {
    setAppState('loading')
    setLoadingMsgIdx(0)
    setError('')
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_window_days: 30, max_posts: 150 }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Analysis failed')
      }
      const json: Analysis = await res.json()
      setData(json)
      setAppState('done')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setAppState('error')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1E3C' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(15, 30, 60, 0.95)' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: '#00B8D9' }}>
              <span className="text-xs font-bold text-[#0F1E3C]">SI</span>
            </div>
            <div>
              <span className="text-white font-semibold tracking-tight">SMEPay</span>
              <span className="text-white/40 ml-2 text-sm">Intelligence Hub</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {data?._meta && (
              <span className="text-white/30 text-xs">
                {data._meta.posts_analyzed} discussions · {' '}
                {new Date(data._meta.generated_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            )}
            {appState === 'done' && (
              <button
                onClick={runAnalysis}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-white/60
                           hover:bg-white/5 hover:text-white transition-all"
              >
                Refresh ↻
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Idle State ── */}
      {appState === 'idle' && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <p className="text-xs tracking-widest text-[#00B8D9] uppercase mb-4 font-medium">
            Market Intelligence Platform
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            What should SMEPay<br />do next?
          </h1>
          <p className="text-white/40 text-lg mb-10 max-w-md">
            Analyze the Indian merchant payments ecosystem.<br />
            Get competitor intelligence. Find your next move.
          </p>
          <button
            onClick={runAnalysis}
            className="px-8 py-4 rounded-xl font-semibold text-[#0F1E3C] text-lg
                       transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#00B8D9' }}
          >
            Analyze Market →
          </button>
          <p className="text-white/20 text-sm mt-4">Takes 2–4 minutes · Powered by Reddit + Gemini</p>
        </div>
      )}

      {/* ── Loading State ── */}
      {appState === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#00B8D9]
                            animate-spin border-l-transparent border-r-transparent border-b-transparent" />
          </div>
          <div className="text-center">
            <p className="text-white/80 text-lg mb-2 transition-all">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
            <p className="text-white/25 text-sm">Usually takes 2–4 minutes</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-2">
            {LOADING_MESSAGES.map((_, i) => (
              <div key={i}
                   className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                               ${i === loadingMsgIdx ? 'bg-[#00B8D9] scale-125' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {appState === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">
            ✕
          </div>
          <h2 className="text-xl font-semibold">Analysis Failed</h2>
          <p className="text-white/40 max-w-sm">{error}</p>
          <button
            onClick={() => setAppState('idle')}
            className="mt-2 px-6 py-3 rounded-xl border border-white/20 text-white/70
                       hover:bg-white/5 hover:text-white transition-all"
          >
            ← Try Again
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {appState === 'done' && data && (
        <main className="max-w-5xl mx-auto px-6 py-12 space-y-20">

          {/* 1. Executive Summary */}
          <section>
            <SectionHeader label="Executive Briefing" />
            <div className="mt-5 rounded-2xl border border-white/10 p-8"
                 style={{ backgroundColor: '#162b4d' }}>
              <div className="flex items-center gap-3 mb-5">
                <MoodBadge mood={data.executive_summary.market_mood} />
                <span className="text-white/30 text-sm">≈ 30 sec read</span>
              </div>
              <p className="text-white/85 text-lg leading-relaxed mb-8">
                {data.executive_summary.tldr}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[#00B8D9] text-xs uppercase tracking-widest font-semibold mb-3">
                    Top Insights
                  </p>
                  <ul className="space-y-2.5">
                    {data.executive_summary.top_3_insights.map((insight, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-white/70">
                        <span className="text-[#00B8D9] shrink-0 mt-0.5">→</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[#F59E0B] text-xs uppercase tracking-widest font-semibold mb-3">
                    Top Opportunities
                  </p>
                  <ul className="space-y-2.5">
                    {data.executive_summary.top_3_opportunities.map((opp, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-white/70">
                        <span className="text-[#F59E0B] shrink-0 mt-0.5">→</span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border-t border-white/10 pt-5">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1.5">
                  Recommended Immediate Action
                </p>
                <p className="text-white font-medium">{data.executive_summary.recommended_action}</p>
              </div>
            </div>
          </section>

          {/* 2. Pain Points */}
          <section>
            <SectionHeader label="Pain Point Intelligence" />
            <div className="mt-5 space-y-3">
              {data.pain_points.map((pp, i) => (
                <div key={i}
                     className="rounded-xl border border-white/10 overflow-hidden cursor-pointer
                                hover:border-white/20 transition-all"
                     style={{ backgroundColor: '#162b4d' }}
                     onClick={() => setExpandedPP(expandedPP === i ? null : i)}>
                  {/* Header row */}
                  <div className="flex items-center gap-4 p-5">
                    <span className={`text-xs px-2.5 py-1 rounded-md border font-medium
                                     ${SEVERITY_STYLES[pp.severity]}`}>
                      {pp.severity.toUpperCase()}
                    </span>
                    <h3 className="font-semibold text-white flex-1">{pp.title}</h3>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div className="text-center">
                        <p className="text-white font-mono font-bold">{pp.evidence_count}</p>
                        <p className="text-white/30 text-xs">mentions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#00B8D9] font-mono font-bold">{pp.confidence}%</p>
                        <p className="text-white/30 text-xs">confidence</p>
                      </div>
                      <span className={`text-lg ${pp.trend === 'rising' ? 'text-red-400' :
                                                   pp.trend === 'falling' ? 'text-green-400' :
                                                   'text-white/40'}`}>
                        {TREND_ICON[pp.trend]}
                      </span>
                      <span className="text-white/30 ml-1">
                        {expandedPP === i ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedPP === i && (
                    <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                      <p className="text-white/70 text-sm leading-relaxed">{pp.description}</p>

                      {pp.competitor_affected.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-white/30 text-xs mt-0.5">Affects:</span>
                          {pp.competitor_affected.map(c => (
                            <span key={c} className="text-xs px-2 py-0.5 rounded bg-white/5
                                                     text-white/60 border border-white/10">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Evidence Quotes */}
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                          Evidence · {pp.evidence_count} discussions
                        </p>
                        <div className="space-y-2">
                          {pp.sample_quotes.map((q, qi) => (
                            <blockquote key={qi}
                                        className="text-sm text-white/60 italic border-l-2
                                                   border-[#00B8D9]/40 pl-3 leading-relaxed">
                              "{q}"
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Competitor Intelligence */}
          <section>
            <SectionHeader label="Competitor Intelligence" />
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.competitors.map((comp, i) => (
                <div key={i}
                     className="rounded-xl border border-white/10 overflow-hidden"
                     style={{ backgroundColor: '#162b4d' }}>
                  <div className="p-5 border-b border-white/10 flex items-center justify-between
                                  cursor-pointer hover:bg-white/5"
                       onClick={() => setExpandedComp(expandedComp === i ? null : i)}>
                    <h3 className="font-bold text-white text-lg">{comp.name}</h3>
                    <span className="text-white/30 text-sm">{expandedComp === i ? '▲' : '▼'}</span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Perception keywords */}
                    <div className="flex flex-wrap gap-1.5">
                      {comp.perception_keywords.map(kw => (
                        <span key={kw}
                              className="text-xs px-2.5 py-1 rounded-full bg-white/5
                                         text-white/50 border border-white/10">
                          {kw}
                        </span>
                      ))}
                    </div>

                    {/* SMEPay window */}
                    <div className="rounded-lg p-3"
                         style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                  borderLeft: '3px solid #F59E0B' }}>
                      <p className="text-[#F59E0B] text-xs font-semibold uppercase
                                    tracking-widest mb-1">
                        SMEPay Window
                      </p>
                      <p className="text-white/70 text-sm">{comp.smepay_window}</p>
                    </div>

                    {/* Expanded: strengths & weaknesses */}
                    {expandedComp === i && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-green-400 text-xs uppercase tracking-widest
                                        font-semibold mb-2">
                            Strengths
                          </p>
                          <ul className="space-y-2">
                            {comp.strengths.map((s, si) => (
                              <li key={si} className="text-xs text-white/60">
                                <span className="text-white/90 font-medium">{s.attribute}</span>
                                <span className="text-white/30 ml-1">({s.evidence_count})</span>
                                {s.sample_quote && (
                                  <p className="italic text-white/40 mt-0.5 leading-relaxed">
                                    "{s.sample_quote}"
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-red-400 text-xs uppercase tracking-widest
                                        font-semibold mb-2">
                            Weaknesses
                          </p>
                          <ul className="space-y-2">
                            {comp.weaknesses.map((w, wi) => (
                              <li key={wi} className="text-xs text-white/60">
                                <span className="text-white/90 font-medium">{w.attribute}</span>
                                <span className="text-white/30 ml-1">({w.evidence_count})</span>
                                {w.sample_quote && (
                                  <p className="italic text-white/40 mt-0.5 leading-relaxed">
                                    "{w.sample_quote}"
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Opportunity Engine */}
          <section>
            <SectionHeader label="Opportunity Engine" />
            <div className="mt-5 space-y-4">
              {data.opportunities.map((opp, i) => (
                <div key={i}
                     className="rounded-xl border border-[#F59E0B]/20 p-6"
                     style={{ backgroundColor: '#162b4d' }}>
                  <div className="flex items-start gap-4">
                    {/* Rank + Confidence */}
                    <div className="shrink-0 text-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center
                                      font-bold text-[#0F1E3C] text-sm mb-1"
                           style={{ backgroundColor: '#F59E0B' }}>
                        #{i + 1}
                      </div>
                      <p className="text-white/40 text-xs">{opp.confidence}%</p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-white">{opp.title}</h3>
                        <ImpactBadge label="Impact" value={opp.impact} />
                        <ImpactBadge label="Effort" value={opp.effort} invert />
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed mb-3">{opp.rationale}</p>

                      <div className="rounded-lg px-4 py-3 border border-[#00B8D9]/20"
                           style={{ backgroundColor: 'rgba(0, 184, 217, 0.07)' }}>
                        <p className="text-[#00B8D9] text-xs font-semibold uppercase
                                      tracking-widest mb-1">
                          Recommended Action
                        </p>
                        <p className="text-white/80 text-sm">{opp.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Recommendations */}
          <section>
            <SectionHeader label="Strategic Recommendations" />
            <div className="mt-5 space-y-2">
              {data.recommendations.map((rec, i) => (
                <div key={i}
                     className="rounded-xl border border-white/10 p-5 flex items-center gap-5"
                     style={{ backgroundColor: '#162b4d' }}>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-white/5 flex items-center
                                   justify-center text-white/40 text-sm font-mono">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{rec.action}</p>
                    <p className="text-white/40 text-sm mt-0.5">{rec.evidence}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3 text-xs">
                    <span className={`font-semibold ${IMPACT_STYLES[rec.impact]}`}>
                      {rec.impact.toUpperCase()} impact
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40">{rec.time_horizon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Copy recommendations button */}
            <button
              onClick={() => {
                const text = data.recommendations
                  .map((r, i) => `${i + 1}. ${r.action} [${r.impact} impact · ${r.time_horizon}]\n   ${r.evidence}`)
                  .join('\n\n')
                navigator.clipboard.writeText(text)
                  .then(() => alert('Recommendations copied to clipboard!'))
              }}
              className="mt-4 w-full py-3 rounded-xl border border-white/10 text-white/40
                         hover:text-white/70 hover:border-white/20 text-sm transition-all"
            >
              Copy Recommendations ↗
            </button>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 pt-6 pb-4 text-center text-white/20 text-xs">
            SMEPay Intelligence Hub · {data._meta.posts_analyzed} Reddit discussions analyzed · {' '}
            Powered by Gemini 1.5 Flash
          </footer>

        </main>
      )}
    </div>
  )
}

// ─── Shared Components (inline for MVP speed) ────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#00B8D9' }}>
        {label}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  )
}

function MoodBadge({ mood }: { mood: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    positive:           { bg: 'bg-green-500/20',  text: 'text-green-400',  label: 'Positive' },
    mixed:              { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Mixed' },
    cautiously_negative:{ bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Cautiously Negative' },
    negative:           { bg: 'bg-red-500/20',    text: 'text-red-400',    label: 'Negative' },
  }
  const s = styles[mood] ?? styles['mixed']
  return (
    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${s.bg} ${s.text}`}>
      ● {s.label} Market
    </span>
  )
}

function ImpactBadge({ label, value, invert = false }:
  { label: string; value: string; invert?: boolean }) {
  const color = invert
    ? { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' }[value] ?? 'text-white/40'
    : IMPACT_STYLES[value] ?? 'text-white/40'
  return (
    <span className={`text-xs ${color}`}>
      {label}: <span className="font-semibold uppercase">{value}</span>
    </span>
  )
}
```

---

### `frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: { deep: '#0F1E3C', mid: '#1A3358', card: '#162b4d' },
        teal: '#00B8D9',
        amber: '#F59E0B',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 4 — Run It

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` → click **Analyze Market →**

---

## Lean Build Order (Hour by Hour)

| Time | What to Build | Done When |
|------|---------------|-----------|
| 0:00 | Backend setup + .env | `uvicorn main:app` runs without errors |
| 0:30 | `reddit_service.py` | `collect_posts()` returns 30+ posts in terminal |
| 1:00 | `prompt.txt` + `ai_service.py` | Gemini returns valid JSON in terminal |
| 1:30 | `main.py` + test POST /analyze | curl returns full analysis JSON |
| 2:00 | Next.js setup + types | `npm run dev` loads without errors |
| 2:30 | `page.tsx` — idle + loading state | Button click shows spinner |
| 3:30 | `page.tsx` — all 5 result sections | Full dashboard renders with real data |
| 4:00 | Polish: badges, expand/collapse, copy button | Looks premium, not prototype |
| 4:30 | Test full flow 2x | Zero crashes, evidence quotes display correctly |
| 5:00 | 🚀 Ship | Screenshot for portfolio post |

---

## Debug Cheat Sheet

| Symptom | Fix |
|---------|-----|
| `praw.exceptions.ResponseException: received 401` | Client ID/Secret wrong in .env |
| `0 posts collected` | Check subreddit names; try `reddit.subreddit("all").search(...)` |
| `JSONDecodeError` from Gemini | Add `print(response.text[:500])` in `ai_service.py` to see raw output |
| CORS error in browser | Confirm `allow_origins=["http://localhost:3000"]` in main.py |
| `Module not found: '@/types'` | Add `"paths": {"@/*": ["./*"]}` to `tsconfig.json` |
| Gemini takes > 2 min | Reduce `max_posts` to 75, increase later |

---

## What the Reviewer Said → What Changed

| Reviewer Note | This Implementation |
|---|---|
| ❌ Job system | Synchronous POST. Loading state is frontend-only. |
| ❌ Database | No DB. JSON returned directly in response. |
| ❌ Seven pages | One `page.tsx`, scroll-based sections. |
| ❌ PDF export | Removed. Copy-to-clipboard only. |
| ✅ Evidence Mode | Every pain point has `evidence_count` + `sample_quotes` |
| ✅ Ecosystem framing | Prompt says "analyze the ecosystem, find opportunities for SMEPay" |
| ✅ Single Gemini call | One call, 5 modules, structured JSON |
| ✅ Competitor Intel first | Competitor section is prominent, 2×2 card grid |

---

*Day 15 · SMEPay Intelligence Hub · Ship it.*
