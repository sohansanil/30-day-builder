# ⚡ Forge — The AI Product Builder Agent

**The pitch**: Give Forge a product idea. Get back a market research brief, a full PRD, a system architecture doc, six starter code files, and a quality critique — all packaged in a downloadable ZIP. Six specialized AI agents, run sequentially, in under three minutes.

This is not a chatbot. It demonstrates planning, tool use, multi-step reasoning, context accumulation, and self-review — the full vocabulary of modern agentic AI — in a single-day shippable format.

---
# Day 12 Constraints

This project is part of a 30 Days, 30 Projects challenge.

Primary objective:

* Ship a working deployed product today.

Secondary objectives:

* Learn agentic AI concepts.
* Build a portfolio-worthy project.

Optimization order:

1. Working deployment
2. Demonstration of agentic concepts
3. Clean architecture
4. Additional features

If a design choice increases complexity significantly while providing limited portfolio value, choose the simpler implementation.

Prefer:

* Shipping
* Simplicity
* Demonstrable functionality

Avoid:

* Enterprise architecture
* Premature abstractions
* Infrastructure-heavy solutions
* Features that delay deployment


## 1. Project Vision

Forge automates the most tedious first hour of any new project: the research, planning, and scaffolding phase that precedes a single line of useful code. A user submits an idea and watches a chain of specialized agents work through the problem in real time — each one reading everything its predecessors produced before writing its own output. The result is a coherent, opinionated starter package that a developer can open and immediately build on.

The portfolio pitch writes itself: "I built an AI agent that builds other AI projects."

---

## 2. User Flow

The experience runs as eight steps from the user's perspective:

1. User opens Forge, enters a product idea plus optional constraints (target stack, project type, timeline).
2. The Orchestrator analyzes the idea and renders a structured task plan — the user can read it as it streams.
3. The Research Agent runs 3–5 web searches and synthesizes findings into a market brief.
4. The PRD Writer reads both the plan and the research, then generates a full product requirements document.
5. The Architect designs a system architecture and tech stack based on the PRD and research.
6. The Execution Engineer synthesizes the PRD, architecture, and research into a master `execution_prompt.md` meant for tools like Cursor, Claude Code, or Antigravity.
7. The Critic reviews every prior output (including the execution prompt) and surfaces strengths, gaps, and next steps.
8. The user sees four tabs of formatted output and clicks one button to download everything as a ZIP of Markdown files.

Total time from submit to ZIP: under three minutes at typical Claude API speeds.

---

## 3. Agent Architecture

The pattern is a **sequential pipeline with context accumulation**. There is no dynamic routing, no parallel execution, and no revision loop in the MVP. Each agent receives a `context` object containing the user's original idea plus every prior agent's output. This means the Architect gets richer context than the Researcher, and the Critic gets the richest context of all. The frontend owns the orchestration — it calls each API route in order, collects the streaming response, stores it in component state, and passes it forward on the next call. There is no persistent server state at any point.

This design eliminates backend complexity entirely and makes streaming trivial.

---

## 4. Individual Agent Roles

| Agent | Primary Responsibility | Input | Output | Tools Used |
|---|---|---|---|---|
| Orchestrator | Decompose idea into structured plan | Idea + constraints | `plan.json` — project name, type, search queries, key features | None |
| Researcher | Search web, synthesize market context | Plan + idea | `research.md` — competitors, tech landscape, key insights | `web_search` (3–5 calls) |
| PRD Writer | Write a full product requirements doc | Research + idea | `prd.md` — features, user flow, success metrics, non-goals | None |
| Architect | Design system, pick tech stack | PRD + research | `architecture.md` — stack, components, data model, endpoints | None |
| Execution Engineer | Generate master build prompt | All prior outputs | `execution_prompt.md` — perfect prompt for AI IDEs | None |
| Critic | Review all outputs honestly | All prior outputs | `critique.md` — 3 strengths, 3 gaps, 3 next steps | None |

The Execution Engineer creates the master prompt that modern developers actually use, saving hours of manual setup.

---

## 5. Tool Requirements

The only external tool that crosses the agentic threshold is Claude's built-in `web_search_20250305` tool, enabled on the Research Agent API route. No MCP servers, no custom tool implementations, no third-party search APIs. On the frontend, JSZip handles in-browser ZIP creation (no server-side packaging, no Vercel file system writes). FileSaver.js triggers the browser download. The rest is standard Next.js with the Anthropic SDK streaming API.

Core packages: `@anthropic-ai/sdk`, `jszip`, `file-saver`. That's the entire non-standard dependency surface.

---

## 6. MVP Scope

**Ship this:**

- Single-page input form (project idea textarea + optional constraints)
- Six-agent sequential pipeline (Orchestrator → Research → PRD → Architect → Execution Engineer → Critic)
- Real-time streaming UI: each agent output streams in as it's generated, with a visible "working" indicator
- Agent status bar showing which agent is active, which are done, which are pending
- Four-tab output display (Research / PRD / Architecture / Execution Prompt)
- One-click ZIP download containing all 5 markdown output files (Research, PRD, Architecture, Execution Prompt, Critique)
- Vercel deployment with `ANTHROPIC_API_KEY` as the only environment variable

**Do not build this day:**

- Revision loops (Critic flags → re-run an agent) — doubles complexity, doubles test time
- User accounts or session persistence — stateless is fine
- Database of any kind — component state holds everything
- GitHub repo auto-creation — adds OAuth, not worth it
- Multiple project type presets — a single generic flow works for everything
- Streaming SSE endpoints — simple fetch + `ReadableStream` reader is sufficient

---

## 7. Stretch Features

| Feature | Value | Difficulty |
|---|---|---|
| Critic-triggered revision loop | High — genuinely agentic | Hard — doubles test surface |
| Project type selector (web / API / CLI / mobile) | Medium — better prompts per type | Easy — just a radio button |
| GitHub repo auto-creation | High — extremely shareable demo | Medium — OAuth required |
| History sidebar (localStorage) | Low — nice UX | Easy |
| Share page (unique URL per run) | High — viral loop | Hard — needs database |
| Streaming SSE for cleaner UX | Low — cosmetic | Medium |

---

## 8. Technical Stack

| Layer | Choice | Justification |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) | Already used in World Cup project. API routes handle streaming cleanly. |
| Styling | Tailwind CSS + shadcn/ui | Fast. Looks professional without design work. |
| AI | Claude API via `@anthropic-ai/sdk` | `claude-sonnet-4-6`, streaming + web_search tool. |
| Packaging | JSZip + FileSaver.js | Browser-side ZIP. No server filesystem needed. No Vercel write issues. |
| Deployment | Vercel | Two-minute deploys. Zero config for Next.js. |
| Auth | None | No accounts in MVP. |
| Database | None | Session state in React component. |

---

## 9. Folder Structure

```
forge/
├── app/
│   ├── page.tsx                  # Landing page + input form
│   ├── forge/
│   │   └── page.tsx              # Main workspace (streaming agents)
│   └── api/
│       ├── orchestrate/route.ts  # Agent 1: plan generator
│       ├── research/route.ts     # Agent 2: web search + synthesis
│       ├── prd/route.ts          # Agent 3: PRD writer
│       ├── architect/route.ts    # Agent 4: system architect
│       ├── execution/route.ts    # Agent 5: master prompt generator
│       └── critic/route.ts       # Agent 6: quality reviewer
├── components/
│   ├── AgentPipeline.tsx         # Status bar (6 agent badges)
│   ├── AgentStream.tsx           # Streaming text display with cursor
│   ├── OutputTabs.tsx            # 4-tab output viewer
│   └── DownloadButton.tsx        # JSZip packaging + FileSaver download
├── lib/
│   ├── claude.ts                 # Anthropic SDK wrapper, streaming helper
│   ├── context.ts                # ForgeContext type + accumulation logic
│   └── prompts/
│       ├── orchestrator.ts       # System prompt
│       ├── researcher.ts
│       ├── prd.ts
│       ├── architect.ts
│       ├── execution.ts
│       └── critic.ts
├── types/
│   └── forge.ts                  # ForgeContext, AgentOutput, etc.
└── public/
```

One file per agent. No shared state server-side. No database schema. This is the entire codebase — you can hold it in your head.

---

## 10. System Design Diagram

Each agent is a stateless API route. The frontend manages the pipeline as a state machine, passing the accumulated `ForgeContext` object to each successive agent. Click any node to learn more about that agent.---

## 11. Data Flow

The `ForgeContext` object is the core data structure. It starts with just the user's idea and constraints, then grows with each agent call:

```typescript
type ForgeContext = {
  userIdea: string;
  constraints?: string;
  plan?: string;        // JSON string from Orchestrator
  research?: string;    // Markdown from Research Agent
  prd?: string;         // Markdown from PRD Writer
  architecture?: string; // Markdown from Architect
  executionPrompt?: string; // Markdown from Execution Engineer
  critique?: string;    // Markdown from Critic
}
```

Each API route receives the full context as a POST body, runs its agent, and streams the response back. The frontend appends the streamed result to the appropriate context field, then fires the next agent. No server-to-server calls. No shared database. The context only lives in the React component's `useState` — it dies when the tab closes, which is fine for an MVP.

---

## 12. Deployment Strategy

One command: `vercel --prod`. The entire deployment surface is one environment variable (`ANTHROPIC_API_KEY`) and one configuration tweak: in `vercel.json`, set the function max duration to 60 seconds for the Research and Builder routes, which can run long.

```json
{
  "functions": {
    "app/api/research/route.ts": { "maxDuration": 60 },
    "app/api/execution/route.ts": { "maxDuration": 60 }
  }
}
```

Cost per run: approximately $0.10–$0.40 in Claude API credits depending on idea complexity and generated code length. No database costs. No server costs. Vercel free tier handles the traffic.

---

## 13. Risks and Simplifications

| Risk | Likelihood | Mitigation |
|---|---|---|
| Markdown rendering breaks UI | Low | Use `react-markdown` and keep styling simple. |
| Vercel function timeout on long Execution calls | Medium | Set `maxDuration: 60` in `vercel.json`. Use streaming to keep the connection alive. |
| Claude context window overflows on large projects | Medium | Cap each agent output at 800 words by including word limits in every system prompt. |
| Streaming implementation confusion | Medium | Use the SDK's `stream.textStream` async iterator pattern — 5 lines, not 50. |
| web_search returns irrelevant results | Low | Orchestrator generates specific search queries upfront; Research Agent uses them as starting points. |
| JSZip fails in certain browsers | Low | JSZip is battle-tested. Test early. Add a fallback "copy to clipboard" button. |
| Agent produces hallucinated competitor data | Inevitable | Frame Critic output as "review" not "facts". This is a starter package, not production research. |

The single biggest failure mode is treating this as a waterfall build. Test the agents first, build the UI around them.

---

## 14. Portfolio Value Assessment

| Dimension | Score | Reasoning |
|---|---|---|
| Concept strength | 9/10 | Multi-agent AI is the dominant 2025 topic in engineering hiring. |
| Technical depth | 8/10 | Tool use, streaming, context accumulation, agent orchestration — the full toolkit. |
| Demo quality | 10/10 | Watching agents work in sequence is visually compelling in any interview or demo. |
| Uniqueness in portfolio | 9/10 | Complements World Cup (data) and AniMatch (ML). Adds agentic AI. Covers three major DS/AI domains. |
| Time-to-build realism | 8/10 | Seven to nine focused hours. Achievable with Claude Code assist. |
| Recruiter hook | 9/10 | "I built an AI agent that builds AI projects" opens every conversation. |

**Verdict**: This is the highest-leverage one-day project available to you right now. Agentic AI is where every ML engineer job description is trending. This project puts a working implementation on your GitHub before most candidates understand what agents even are.

---

---

# Product Requirements Document

**Project**: Forge — The AI Product Builder Agent
**Author**: Sohan Aravind Sanil
**Day**: 30-Day Builder Journey
**Version**: 1.0 MVP

### Problem Statement

Developers and students spend the first one to three hours of any new project doing the same tedious work: researching what already exists, writing requirements no one will read, sketching an architecture, and setting up boilerplate. This work is necessary but mechanical. Forge automates it using a chain of specialized AI agents, so a developer can go from idea to working scaffold in under three minutes.

### Target User

A developer, student, or hackathon participant who has an idea and wants to start building — not planning — as fast as possible.

### Core Features

| Feature | Priority | Description |
|---|---|---|
| Idea input form | P0 | Textarea for project idea + optional constraints field (stack, timeline, type) |
| 6-agent pipeline | P0 | Sequential: Orchestrate → Research → PRD → Architect → Execution Engineer → Critique |
| Streaming agent UI | P0 | Each agent's output streams in real time (as Markdown) with an active/done/pending status per agent |
| 4-tab output viewer | P0 | Research, PRD, Architecture, Execution Prompt — each agent's output in its own formatted tab |
| ZIP download | P0 | Packages all 5 Markdown outputs into a single downloadable ZIP |
| web_search on Research | P1 | Research Agent uses Claude's `web_search_20250305` tool for real market data |
| Markdown rendering | P1 | `react-markdown` for streaming and completed tabs |
| Agent timing display | P2 | Show how long each agent took (demonstrates pipeline complexity) |

### Non-Goals (MVP)

The following are explicitly excluded from the first-day build: user accounts, session persistence, revision loops (Critic re-triggering agents), GitHub API integration, multiple project type presets beyond "web application", and mobile-optimized layout.

### Success Metrics

A single run succeeds when: all six agents complete without timeout, the Critic outputs a coherent review that references specific content from prior agents, and the ZIP download contains six readable files. The pipeline should complete in under three minutes from submit.

### Agent System Prompts

These are the most important implementation details in this entire document. Every word in a system prompt changes the output quality dramatically.

**Orchestrator** (`/lib/prompts/orchestrator.ts`)
```
You are a project planning specialist. Analyze the product idea and return ONLY a valid JSON object — no markdown, no explanation:
{
  "project_name": "string (2-3 words)",
  "project_type": "web_app | api | cli | mobile",
  "core_problem": "one sentence",
  "target_user": "one sentence",
  "search_queries": ["specific query 1", "specific query 2", "specific query 3"],
  "key_features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "tech_hints": ["hint 1", "hint 2"],
  "complexity": "simple | medium | complex"
}
Make the search_queries specific enough that a web search would return useful market data.
```

**Research Agent** (`/lib/prompts/researcher.ts`)
```
You are a product research specialist. Use the provided search queries to find real market data. Synthesize your findings into a research brief with these sections:

## Market context
## Key competitors (name 2-3 with one differentiator each)
## Technology landscape
## Key insights for this project

Be specific. Use actual product names and real data from your searches. Maximum 500 words total.
```

**PRD Writer** (`/lib/prompts/prd.ts`)
```
You are a senior product manager. Write a focused PRD based on the idea and research. Include:

## Problem statement
## Target user  
## Core features (table: Feature | Priority P0/P1/P2 | Description)
## Non-goals
## Success metrics
## User flow (numbered steps, maximum 8)

Maximum 600 words. Be specific. Every feature should reference something from the research.
```

**Architect** (`/lib/prompts/architect.ts`)
```
You are a pragmatic software architect. Design a minimal viable architecture. Include:

## Tech stack (table: Layer | Technology | Justification)
## System components (4-6 components with one-sentence descriptions)
## Data model (3-5 key entities and their relationships)
## Key API endpoints (table: Method | Route | Purpose)
## Folder structure (code block)

Prioritize practicality. Maximum 500 words.
```

**Execution Engineer** (`/lib/prompts/execution.ts`)
```
You are an expert AI developer and workflow accelerator. Synthesize the PRD, architecture, and research into a single, comprehensive "Master Build Prompt" (like a `.cursorrules` or prompt.md file) designed to be pasted into an AI IDE like Cursor, Windsurf, or Claude Code.

Include:
## Context & Goals (from PRD)
## Tech Stack & Architecture
## Core Components to Build
## Strict Instructions & Constraints (for the AI)
## Step-by-Step Implementation Plan

Be highly specific. Treat the AI IDE as your junior developer. Maximum 800 words.
```

**Critic** (`/lib/prompts/critic.ts`)
```
You are an experienced engineering lead doing a project review. Review everything the pipeline produced. Structure your review as:

## Strengths (3 specific positives)
## Gaps (3 specific weaknesses, contradictions in the PRD, or overengineered architecture)
## Prompt Critique (Is the Execution Prompt clear and actionable?)

Be honest, specific, and slightly ruthless. Challenge everything. Reference actual content from the PRD, architecture, and Execution Prompt. Maximum 400 words.
```

---

---

# Implementation Roadmap

**Total target time: 8 hours**

**Phase 1 — Foundation (Hour 1)**
Initialize the Next.js project, install dependencies, set up the environment variable, and write `lib/claude.ts` — a thin wrapper around the Anthropic SDK that exposes a `streamAgent(systemPrompt, userMessage)` helper. Test this wrapper with a single hardcoded call before building anything else. Do not proceed until you can stream a response to the terminal.

**Phase 2 — Agents (Hours 2–4)**
Build each API route one at a time, in pipeline order. After each route, test it directly with curl or Postman before moving to the next. The Orchestrator and Critic are the easiest (no tools, clean outputs). The Research Agent is second (add the `web_search` tool to the API call). Since every agent now outputs either simple JSON (Orchestrator) or pure Markdown, the failure surface is extremely low.

**Phase 3 — Frontend (Hours 5–6)**
Build `app/forge/page.tsx` first — just sequential fetch calls with `console.log` output. Then add `AgentStream.tsx` for the streaming display. Then `OutputTabs.tsx`. Then the landing page (`app/page.tsx`). UI last, logic first.

**Phase 4 — Download + Polish (Hour 7)**
Add the ZIP download via JSZip. Wire up the Download button. Add loading states. Add a basic error message if any agent fails. Test the full pipeline at least three times end-to-end.

**Phase 5 — Ship (Hour 8)**
`vercel --prod`. Test the deployed URL. Write the README (one paragraph + a screenshot). Update your portfolio or builder log.

---

---

# Prioritized Task List

These 25 tasks are ordered by dependency, not importance. Complete each one before moving to the next.

1. `npx create-next-app@latest forge --typescript --tailwind --app`
2. `npm install @anthropic-ai/sdk jszip file-saver @types/file-saver`
3. Add `ANTHROPIC_API_KEY` to `.env.local`
4. Create `lib/claude.ts` with streaming helper
5. Create `app/api/orchestrate/route.ts` — returns JSON plan
6. Test orchestrate endpoint with curl
7. Create `lib/prompts/` folder and all 6 prompt files
8. Create `app/api/research/route.ts` with `web_search` tool enabled
9. Test research endpoint — verify actual web search results appear
10. Create `app/api/prd/route.ts`
11. Create `app/api/architect/route.ts`
12. Create `app/api/execution/route.ts`
13. Create `app/api/critic/route.ts`
14. Create `types/forge.ts` with `ForgeContext` type (no GeneratedFile needed)
16. Create `app/forge/page.tsx` with sequential fetch calls (log to console first)
17. Create `components/AgentPipeline.tsx` — status badges for 6 agents
18. Create `components/AgentStream.tsx` — streaming text display
19. Wire streaming from all 6 agents into the forge page
20. Create `components/OutputTabs.tsx`
21. Create `app/page.tsx` — landing/input form
22. Create `components/DownloadButton.tsx` with JSZip logic
23. Add `vercel.json` with `maxDuration: 60` for research and execution routes
24. `vercel --prod` — test deployed URL end-to-end
25. README + screenshot + portfolio update

---

---

# Build Order (Optimized for Shipping)

The single most important principle: **test every agent before building the UI around it**. Students consistently lose two hours debugging agent outputs after building a beautiful frontend that calls broken endpoints.

```
Hour 0:00  npx create-next-app + install packages
Hour 0:15  Write lib/claude.ts — 20 lines, streaming helper
Hour 0:30  Build + test /api/orchestrate — verify JSON output
Hour 1:00  Write all 6 prompt files (they're just strings, move fast)
Hour 1:30  Build + test /api/research — verify web_search tool fires
Hour 2:00  Build /api/prd, /api/architect — test each with hardcoded context
Hour 2:45  Build /api/execution — test prompt output
Hour 3:15  Build /api/critic
Hour 3:30  [CHECKPOINT] All 6 agents tested in isolation. If not, stay here.
Hour 4:00  app/forge/page.tsx — sequential calls, console.log, no UI yet
Hour 4:30  AgentPipeline.tsx (status badges)
Hour 5:00  AgentStream.tsx (streaming display per agent)
Hour 5:45  OutputTabs.tsx (4 tabs)
Hour 6:15  app/page.tsx (landing + input form)
Hour 6:45  DownloadButton.tsx + JSZip
Hour 7:15  vercel.json + vercel --prod
Hour 7:30  End-to-end test on deployed URL
Hour 7:45  README + portfolio update
Hour 8:00  Ship day complete. Run the Ship Day workflow.
```

**The checkpoint at 3:30 is non-negotiable.** Every agent must work correctly in isolation before you build any UI. Frontend polish is fast. Debugging a broken agent through a streaming UI is not.

---
# Demo Requirement

Forge must have a clear "wow moment."

A first-time user should immediately understand that multiple AI agents are working together.

The UI should make the agent pipeline visible.

Examples:

* Live progress indicator
* Agent cards activating in sequence
* Streaming outputs
* Visual context accumulation
* Timeline of agent decisions

The product should feel alive while generating results.

**Final thought**: The Critic is the agent that makes this project genuinely agentic rather than just a prompted chain. A Critic that calls out specific weaknesses in its own pipeline's PRD — by name, by section — is what separates "I chained six Claude calls" from "I built an agentic system." Invest extra time in the Critic's prompt and test it on your own worst-case outputs. That's the demo moment that lands.

Build fast. Ship clean. Then tell people what it does.