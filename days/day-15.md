# Day 15: SMEPay Scout

**Project:** SMEPay Scout
**Goal:** Build an AI-Powered Market Intelligence Dashboard for SMEPay executives to track competitor weaknesses.

## What I Built
SMEPay Scout is an internal strategic tool that actively monitors the market and tells the product team exactly what features to build next to steal market share. It functions as an AI Product Strategy Analyst.

## Screenshots
<div align="center">
  <img src="../assets/smepay_scout/dashboard-1.png" width="45%" alt="Dashboard Top" />
  <img src="../assets/smepay_scout/dashboard-2.png" width="45%" alt="Dashboard Middle" />
  <img src="../assets/smepay_scout/dashboard-3.png" width="45%" alt="Dashboard Lower" />
  <img src="../assets/smepay_scout/dashboard-4.png" width="45%" alt="Dashboard Bottom" />
</div>

1. **Live Data Ingestion Pipeline:** A custom web scraper that pulls real-time grievances and reviews from competitor merchant apps (BharatPe, PhonePe Business, Paytm Business) on the Google Play Store, bypassing traditional API limitations.
2. **AI Intelligence Engine:** Integrates Google Gemini 1.5 Pro to synthesize raw unstructured reviews into an actionable JSON strategy payload.
3. **Executive Dashboard:** A Next.js frontend built with TailwindCSS that strictly adheres to SMEPay's brand identity (Forest Green & Vibrant Leaf Green). It features a Market Pulse score, Critical Pain Points, Win Zones, and an Opportunity Engine.
4. **Live Market Chatter:** A dedicated module that streams the raw, live reviews straight from the Play Store to guarantee authenticity.

## Challenges & Pivots
1. **The Reddit API Blockade:** Initially, the plan was to scrape Reddit for B2B grievances. However, waiting for Reddit API approval would have stalled the build. I pivoted immediately to building a custom Google Play scraper, which ironically yielded far more concentrated and authentic "Merchant Voice Data" than Reddit.
2. **The Gemini Quota Wall:** Passing large batches (90 reviews at a time) into Gemini during heavy testing quickly exhausted the Free Tier API limits. To ensure the dashboard remains stable during demos, I engineered a robust fallback mechanism that returns identically-structured mock JSON if the API hits a rate limit, while keeping the raw reviews section 100% live.
3. **Prompt Engineering for Strategy:** Getting the AI to output *founder-level strategy* (Opportunity Engine, Estimated Acquisition Potential) instead of generic sentiment analysis (positive/negative) required strict JSON schema enforcement in the prompt. The moment I realized I was building the wrong thing initially was when I noticed a generic sentiment analysis dashboard doesn't answer the only question founders care about: 'What should we build tomorrow to steal our competitors' users?'

## Key Learnings
- **Data Authenticity:** Raw data display builds trust. Pairing "AI Magic" with a feed of the actual raw data (Live Market Chatter) makes the insights undeniable.
- **Fail-Safes are Features:** When relying on 3rd party AI APIs for core features, always build a seamless fallback state so your app degrades gracefully.
- **Strategic Framing:** Presenting data as "Win Zones" and "Opportunities" is infinitely more valuable to an executive team than presenting raw "Sentiment Scores".

## Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS, Lucide React
- **Backend:** Python, FastAPI, Uvicorn
- **Data Ingestion:** `google-play-scraper`
- **AI Intelligence:** Google Gemini 1.5 Pro

## Links
- **GitHub:** [SMEPay Scout Code](../projects/smepay_scout)
- *Note: Designed as a local-first enterprise tool. See README to boot the services locally.*
