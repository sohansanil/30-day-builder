# BuilderOS — Product Requirements Document

> **"Know Everything You've Built."**

| Field | Value |
|---|---|
| **Product Name** | BuilderOS |
| **Version** | 1.0 — MVP |
| **Author** | Sohan Aravind Sanil |
| **Day** | Day 14 of 30 — Builder Journey |
| **Status** | Draft for Implementation |
| **Last Updated** | Day 14 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [User Personas](#3-user-personas)
4. [User Stories](#4-user-stories)
5. [Product Vision](#5-product-vision)
6. [MVP Scope](#6-mvp-scope)
7. [Non-Goals](#7-non-goals)
8. [Functional Requirements](#8-functional-requirements)
9. [Information Architecture](#9-information-architecture)
10. [Technical Architecture Overview](#10-technical-architecture-overview)
11. [Retrieval Flow](#11-retrieval-flow)
12. [Placement Analysis Flow](#12-placement-analysis-flow)
13. [Success Metrics](#13-success-metrics)
14. [Risks and Mitigations](#14-risks-and-mitigations)
15. [Future Roadmap](#15-future-roadmap)
16. [Launch Checklist](#16-launch-checklist)
17. [Appendix: Opinionated Notes](#17-appendix-opinionated-notes)

---

## 1. Executive Summary

Sohan Aravind Sanil is 14 days into a 30-day public builder challenge. He has shipped 13 full-stack projects — from an anime recommendation engine to a multi-agent AI builder — accumulating a substantial repository of architecture decisions, technical lessons, deployment notes, and day logs.

The knowledge is there. Getting to it is not.

**BuilderOS** is a retrieval-first personal AI system designed to serve as the institutional memory of the 30-Day Builder Journey. It operates in two distinct modes:

**Builder Brain** — A semantic search engine over all project documentation, architecture notes, day logs, and a resume. Ask natural language questions, receive grounded answers with cited sources. No hallucinations dressed up as helpfulness.

**Interview Copilot** — A placement preparation assistant. Paste a job description, receive a structured interview package: matched projects, STAR-method stories drawn from actual documentation, skill gap analysis, and tailored talking points.

The philosophical anchor: **LLM is the reasoning layer. Retrieval is the product.** Every answer must be traceable to a source document. BuilderOS is not a chatbot. It is a knowledge retrieval engine with a generation layer on top.

**MVP Target (Day 14):** Dual-mode interface backed by a Supabase/pgvector knowledge base, FastAPI retrieval API, and Next.js frontend — indexing all 13 existing project documents and fully deployable by end of day.

---

## 2. Problem Statement

### 2.1 Context

After 13 consecutive days of building, a solo developer has produced meaningful intellectual capital distributed across:

- 13 project README files
- Daily builder logs (Day 1–Day 13)
- Architecture documentation per project
- Technical decision records
- A personal resume

This documentation was written for **logging**, not for **querying**. Each project is an island. There is no bridge.

### 2.2 The Three Failure Modes

**Failure Mode 1: Inventory Failure**

"Which projects used Supabase?" currently requires opening 13 directories, scanning README files manually, and maintaining a mental map of tech stack choices. This is a retrieval problem masquerading as a memory problem.

**Failure Mode 2: Synthesis Failure**

"What did I learn from building recommendation systems?" requires reading multiple files across AniMatch and possibly Forge, then mentally synthesizing patterns. The answer exists. The path to it is exhausting.

**Failure Mode 3: Presentation Failure**

"Why am I the right fit for this AI Engineer role?" requires manually assembling evidence from 30+ documents into a coherent narrative — under time pressure, the night before an interview. The portfolio is strong. The ability to articulate it under pressure is the bottleneck.

### 2.3 Root Cause

The knowledge base is **write-only**. Documentation was written to record progress, not to be queried. No retrieval layer exists on top of it.

### 2.4 The Opportunity

Adding a semantic retrieval layer over existing documentation — without changing the writing workflow — resolves all three failure modes simultaneously. The ingestion pipeline meets documentation where it already is. The retrieval layer transforms it.

---

## 3. User Personas

### Persona 1 — Sohan, The Active Builder

| Attribute | Detail |
|---|---|
| **Role** | 3rd-year Data Science & Engineering student, 30-Day challenge participant |
| **Projects shipped** | 13 (at time of Day 14) |
| **Technical level** | High — comfortable with full-stack, ML, databases, deployment |
| **Primary need** | Instant, precise answers about past work without re-reading docs |

**Pain Points:**
- Cognitive overhead of maintaining mental state across 13 projects
- Time wasted scanning files for a specific technical decision or lesson
- Cannot confidently answer "which project best demonstrates X?" on the spot

**Context of use:** Between build sessions, post-deployment retrospectives, late-night project planning.

---

### Persona 2 — Sohan, The Job Seeker

| Attribute | Detail |
|---|---|
| **Role** | Same person, different mode |
| **Goal** | Ace placement season by translating a portfolio into interview-ready narratives |
| **Stakes** | Internships and full-time roles in AI/ML, Data Science, Full-Stack Engineering |
| **Pain Point** | Not knowing which projects to highlight, or how to tell their story for a specific JD |

**Pain Points:**
- STAR stories that feel generic because they're not grounded in specifics
- Uncertainty about what skills a given JD requires vs. what has actually been demonstrated
- Starting from scratch every time a new JD is encountered instead of building on existing prep

**Context of use:** Night before an interview, placement cell events, company research sessions.

---

### Persona 3 — Technical Recruiter *(V3, Out of MVP Scope)*

| Attribute | Detail |
|---|---|
| **Role** | Hiring manager or technical recruiter reviewing Sohan's portfolio |
| **Goal** | Quickly understand what the candidate has built and how deep the expertise goes |
| **Pain Point** | GitHub repos are opaque; cross-portfolio skill view is unavailable |

> **Note:** This persona is explicitly deferred to V3. Designing for recruiters now would dilute the Day 14 build. The product must be useful to the builder before it is presentable to anyone else.

---

## 4. User Stories

### Builder Brain

**BRN-001**
As a builder reviewing my past work, I want to search "which projects used Supabase?" so I can inventory my backend experience without manually opening every project directory.

**BRN-002**
As a builder, I want to ask "what did I learn about Shadow DOM in the Chrome extension project?" so I can recall a specific technical insight without re-reading the full SoFocus documentation.

**BRN-003**
As a builder, I want to ask "compare AniMatch and Forge architecturally" so I can clearly articulate the design tradeoffs between my two most architecturally complex projects.

**BRN-004**
As a builder, I want every answer to cite the source document and section it was retrieved from, so I can trust the response and verify it independently without second-guessing the system.

**BRN-005**
As a builder, I want the system to clearly acknowledge when it cannot find relevant information in my documentation — rather than generating a plausible-sounding but fabricated answer — so I know when to look manually.

**BRN-006**
As a builder, I want to ask "what architecture decisions did I make in the first five days?" so I can reflect on early patterns and how my thinking has evolved.

**BRN-007**
As a builder, I want to find which project "best demonstrates machine learning" so I can confidently pick the right portfolio piece for a given conversation without second-guessing myself.

---

### Interview Copilot

**ICP-001**
As a job seeker, I want to paste a job description and receive a ranked list of my most relevant projects so I know immediately what to lead with in an interview.

**ICP-002**
As a job seeker, I want STAR-format stories generated for each matched project, grounded in my actual documentation and not invented, so I have concrete, specific talking points I can actually use.

**ICP-003**
As a job seeker, I want to see which JD skills I demonstrably have versus which I lack, so I can prepare honest responses for gap questions instead of being blindsided.

**ICP-004**
As a job seeker, I want the system to explain *why* each project is relevant to the role — not just assert that it is — so I can internalize the connection and speak to it naturally in conversation.

**ICP-005**
As a job seeker preparing for a Data Analyst interview, I want the system to surface my data-heavy projects even if I built them primarily as engineering exercises, so I can reframe them through an analytics lens.

**ICP-006**
As a job seeker, I want to generate a complete interview preparation package for a role in under two minutes, so I can do meaningful prep even the night before.

---

## 5. Product Vision

### The North Star

BuilderOS becomes the single most useful tool in Sohan's placement preparation workflow — the difference between walking into an interview *hoping* to remember what he built and walking in *knowing* exactly what to say, and why it matters.

### Vision Statement

*BuilderOS is the institutional memory of a builder's journey. Every lesson learned, every technology chosen, every architecture decision made — indexed, connected, and instantly retrievable. It transforms fragmented documentation into a living, queryable knowledge base that becomes more valuable with every project shipped.*

### The Core Philosophical Distinction

BuilderOS is not a chatbot. The distinction is not aesthetic — it is architectural and philosophical.

A chatbot generates. BuilderOS retrieves, then synthesizes. Every claim the system makes must be traceable to a source document in the knowledge base. If a fact is not in the index, the system says so, rather than confabulating a plausible answer.

This distinction matters because the primary use case — placement preparation — requires trustworthy, specific information. A builder who walks into an interview citing a project detail that BuilderOS invented has been actively harmed by the product.

**Retrieval before generation. Always.**

### Why This Is Day 14, Not Day 1

The 30-day challenge has now generated enough cross-project documentation that a retrieval system becomes genuinely valuable. On Day 1, with one project, a personal knowledge base would be a solution looking for a problem. On Day 14, with 13 projects and accelerating documentation volume, it is the right tool at the right time.

---

## 6. MVP Scope

The MVP must be completable in one build day and demonstrably useful by end of day. Every item in this scope is load-bearing. Nothing here is optional.

### Ingestion Pipeline

- Parse markdown files from a local directory structure: project READMEs, day logs, architecture notes
- Parse the personal resume (PDF or markdown)
- Semantic chunking by document section using markdown header boundaries (H2/H3)
- Chunk overlap: ~50 tokens at boundaries to preserve cross-boundary context
- Embed each chunk using Gemini `text-embedding-004` (768 dimensions)
- Store chunks, embeddings, and metadata in Supabase with the pgvector extension

### Knowledge Metadata Schema (Per Chunk)

Each stored chunk carries: content text, embedding vector, project name, document type (readme / architecture / daylog / resume), day number, source file path, and section header.

### Builder Brain Mode

- Natural language query input
- Semantic similarity search over chunk embeddings (cosine, top-k = 8)
- LLM synthesis with strict grounding instruction: answer only from retrieved context
- Response includes cited source documents and section headers, inline
- Explicit "insufficient context" response when retrieval confidence is low

### Interview Copilot Mode

- Job description text input (paste)
- Structured JD skill extraction via a single LLM call
- Per-skill semantic search against the knowledge base
- Project relevance scoring: ranked by matched skill coverage
- STAR story generation for the top 3 matched projects, grounded in retrieved chunks only
- Skill gap identification: JD skills with no matching retrieval flagged explicitly
- Talking points list (3–5 points) per matched project

### Frontend (Next.js + Tailwind CSS)

- Clear mode selector between Builder Brain and Interview Copilot
- Builder Brain: search input, generated answer, source citations visually prominent (not hidden)
- Interview Copilot: JD input area, structured output with labeled sections
- Loading states during all API calls
- Error handling for API failures and empty results
- No authentication — single-user personal tool

### Deployment

- FastAPI backend deployed on Railway or Render
- Next.js frontend deployed on Vercel
- Supabase project with pgvector extension enabled
- All API keys stored as environment variables — never in source code

---

## 7. Non-Goals

The following are explicitly excluded from the MVP. These are not deferred features — they are conscious decisions to protect the Day 14 ship date. Any item that appears in this section and sounds like a good idea belongs in the V2 roadmap.

**Source code indexing.** Raw implementation code is low signal-to-noise for semantic retrieval. The indexing infrastructure for code is meaningfully different from markdown. V2 will handle this — selectively.

**Multi-user support.** This is a personal tool. Authentication, user isolation, and multi-tenancy add architectural complexity that serves no current user.

**Real-time document sync.** Ingestion is a manually triggered pipeline for MVP. GitHub webhooks and auto-sync are V2 features.

**Conversation history / multi-turn context.** Each query is stateless. Multi-turn memory adds session management complexity that the core retrieval use case does not require.

**Public recruiter-facing mode.** The product must be useful to the builder before it is presentable to anyone else. A public interface requires curation, branding, and a different information architecture.

**Analytics dashboards.** No usage tracking, query logging, or visualization of knowledge base coverage in MVP.

**Fine-tuning or model customization.** RAG is the correct architecture for a frequently-updated personal knowledge base. Fine-tuning is expensive, slow, and would embed knowledge that becomes stale with every new project.

**Mobile-first design.** Responsive layout is acceptable; the primary use case is desktop — a builder at a laptop doing pre-interview preparation.

**Answering questions outside the knowledge base.** If someone asks "explain transformers to me," the system should redirect. This product answers questions *about Sohan's projects*, not general questions about the world.

---

## 8. Functional Requirements

### FR-01: Document Ingestion

| ID | Requirement | Priority |
|---|---|---|
| FR-01-a | System ingests markdown files from a specified root directory, traversing subdirectories | P0 |
| FR-01-b | System ingests a PDF or markdown resume | P0 |
| FR-01-c | Chunking uses markdown H2/H3 header boundaries as semantic split points | P0 |
| FR-01-d | Each chunk stores: content, embedding, project name, doc type, day number, source file, section header, character count | P0 |
| FR-01-e | Ingestion script prints a summary on completion: documents processed, chunks created, failures | P1 |
| FR-01-f | Duplicate detection using content hash prevents re-embedding unchanged documents on re-run | P1 |

### FR-02: Semantic Search

| ID | Requirement | Priority |
|---|---|---|
| FR-02-a | Query is embedded using the same model as ingestion: Gemini `text-embedding-004` | P0 |
| FR-02-b | pgvector cosine similarity search returns top-k chunks; default k=8, configurable via environment variable | P0 |
| FR-02-c | Each result includes: similarity score, source file path, project name, doc type, section header | P0 |
| FR-02-d | Chunks below a configurable similarity threshold (default: 0.65) are excluded from results | P1 |
| FR-02-e | Optional metadata filter parameter accepted: `project_name`, `doc_type`, `day_number` | P1 |

### FR-03: Builder Brain Generation

| ID | Requirement | Priority |
|---|---|---|
| FR-03-a | Retrieved chunks are assembled with explicit source labels: `[Source: {project} / {doc_type} / {section}]` | P0 |
| FR-03-b | System prompt instructs the LLM: answer only from provided context; cite sources by label; state uncertainty explicitly | P0 |
| FR-03-c | Response identifies the source document(s) for each claim it makes | P0 |
| FR-03-d | When retrieved context is insufficient, the response states: "I couldn't find reliable information about this in your documentation" — no fabrication | P0 |
| FR-03-e | Response latency target: <5 seconds P95 in MVP | P1 |
| FR-03-f | API response includes structured metadata: `chunks_used`, `sources`, and timing breakdowns | P1 |

### FR-04: Interview Copilot Analysis

| ID | Requirement | Priority |
|---|---|---|
| FR-04-a | JD accepted as raw pasted text; no file upload required in MVP | P0 |
| FR-04-b | LLM extracts structured data from JD: required skills, preferred skills, domain, role type, top 3 responsibilities | P0 |
| FR-04-c | Each extracted skill runs as a semantic query against the knowledge base | P0 |
| FR-04-d | Projects ranked by weighted relevance score: required skill matches weighted 2×, preferred skill matches weighted 1× | P0 |
| FR-04-e | STAR stories generated for the top 3 projects, using only retrieved chunks as source material | P0 |
| FR-04-f | Skills present in the JD but absent from retrieval results (below similarity threshold) flagged as skill gaps | P0 |
| FR-04-g | 3–5 talking points generated per matched project | P0 |
| FR-04-h | Output clearly separates demonstrated skills from inferred or gap skills | P0 |

### FR-05: Frontend

| ID | Requirement | Priority |
|---|---|---|
| FR-05-a | Mode selector between Builder Brain and Interview Copilot visible at all times | P0 |
| FR-05-b | Retrieved source chunks displayed alongside the generated answer — not hidden behind a toggle | P0 |
| FR-05-c | Interview Copilot output rendered in labeled sections: role summary, matched projects, STAR stories, skill coverage, gaps | P0 |
| FR-05-d | Loading indicator during all API calls; no unresponsive UI states | P0 |
| FR-05-e | Error states surface user-facing messages; API errors do not produce blank screens | P1 |

---

## 9. Information Architecture

### Application Structure

```
BuilderOS
│
├── [Mode: Builder Brain]  ← Default
│   │
│   ├── Query Input Bar
│   │       └── Placeholder: "What did I learn about recommendation systems?"
│   │
│   ├── Results Panel (Left/Primary)
│   │       ├── Generated Answer (with inline source labels)
│   │       └── Source List (project, doc type, section, similarity score)
│   │
│   └── Evidence Panel (Right/Secondary)
│           └── Retrieved Chunks (expandable, showing raw retrieved text)
│               ← This panel exists to reinforce retrieval transparency
│
└── [Mode: Interview Copilot]
    │
    ├── JD Input Panel
    │       ├── Text area: paste job description
    │       └── "Analyze" button
    │
    └── Analysis Output Panel
            │
            ├── Role Summary Card
            │       └── Extracted: domain, role type, required skills, preferred skills
            │
            ├── Matched Projects (Top 3, ranked)
            │       └── Per Project Card:
            │               ├── Project name + day number
            │               ├── Relevance score
            │               ├── "Why it matches" (1-2 sentences)
            │               ├── Matched skills (tags)
            │               ├── STAR Story (expandable)
            │               └── Talking Points (3–5 bullets)
            │
            ├── Skill Coverage
            │       ├── Demonstrated skills (green)
            │       └── Gap skills (amber, with note: "not found in documentation")
            │
            └── Resume Talking Points
                    └── 4–5 general points for this role type
```

### Knowledge Base Structure

```
Knowledge Base (Supabase)
│
├── Document Types
│   ├── readme       ← Project overview, features, tech stack, setup
│   ├── architecture ← Design decisions, tradeoffs, system diagrams described
│   ├── daylog       ← Daily reflections, blockers, learnings, what was shipped
│   └── resume       ← Skills, education, experience, projects
│
├── Project Dimension (13+ projects)
│   ├── AeroIntel          (Day ?)
│   ├── IsSheMadAtMe       (Day ?)
│   ├── AniMatch           (Day ?)
│   ├── World Cup Hub      (Day ?)
│   ├── Forge              (Day 11)
│   ├── Startup Roulette   (Day 12)
│   ├── SoFocus            (Day 13)
│   └── [Days 1–10 projects]
│
└── Metadata Dimensions (per chunk)
    ├── project_name
    ├── doc_type
    ├── day_number
    ├── section_header
    ├── source_file
    └── char_count
```

### Navigation Principle

Two modes. No nested navigation. The mode toggle is the only primary navigation element. Within each mode, the flow is strictly linear: input → API call → structured output. No sidebars, no settings panels, no tabs within modes in MVP. The simpler the navigation, the faster the build and the clearer the product intent.

---

## 10. Technical Architecture Overview

### System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                            │
│                  (Deployed on Vercel)                            │
│                                                                  │
│        Builder Brain Mode     │      Interview Copilot Mode      │
└───────────────────┬───────────┴──────────────────┬──────────────┘
                    │     HTTP REST (JSON)          │
                    ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                              │
│                 (Deployed on Railway)                            │
│                                                                  │
│   POST /api/search        →   Builder Brain query handler        │
│   POST /api/analyze       →   Interview Copilot pipeline         │
│   POST /api/ingest        →   Ingestion trigger (admin only)     │
│   GET  /api/health        →   Health check                       │
└───────────────────┬──────────────────────┬───────────────────────┘
                    │                      │
          ┌─────────▼──────────┐  ┌───────▼────────────────────┐
          │    Supabase        │  │     Google Gemini API       │
          │    PostgreSQL      │  │                             │
          │    + pgvector      │  │   text-embedding-004        │
          │                    │  │   (ingestion + query embed) │
          │   Table: chunks    │  │                             │
          │   Table: projects  │  │   gemini-2.5-flash          │
          │                    │  │   (generation + extraction) │
          └────────────────────┘  └────────────────────────────┘
```

### Component Responsibilities

**Next.js Frontend**
Handles UI rendering and state management for both modes. Thin client — no business logic lives here. Calls the FastAPI backend over REST. Managed environment variables via Vercel for the API base URL.

**FastAPI Backend**
The core intelligence layer. Responsible for: query embedding, pgvector similarity search, prompt construction, Gemini generation calls, Interview Copilot multi-step orchestration, and the ingestion pipeline. All retrieval logic lives here, not in the frontend.

**Supabase PostgreSQL + pgvector**
Primary storage for chunks and embeddings. Cosine similarity search executed via pgvector operators (`<=>` for cosine distance). Metadata filtering via standard SQL WHERE clauses. Sufficient at this scale without an external vector database.

**Gemini API**
`text-embedding-004`: 768-dimensional embeddings, 2048-token input limit. Used consistently for both ingestion and query embedding — critical, since embedding model mismatch is a silent retrieval bug.

`gemini-2.5-flash`: Fast, cost-effective generation with a large context window. Used for: Builder Brain answer synthesis, JD skill extraction, STAR story generation, and talking points generation.

### Data Schema

```sql
-- Primary knowledge table
CREATE TABLE chunks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content      TEXT NOT NULL,
    embedding    VECTOR(768),
    content_hash TEXT,                      -- For duplicate detection on re-ingestion
    project_name TEXT,
    doc_type     TEXT CHECK (doc_type IN ('readme', 'architecture', 'daylog', 'resume')),
    day_number   INTEGER,
    source_file  TEXT,
    section_header TEXT,
    char_count   INTEGER,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index (IVFFlat)
-- Lists value: ~sqrt(total_chunks), revisit when chunk count exceeds 10,000
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- Full-text search index (for hybrid search in V2)
CREATE INDEX ON chunks USING gin(to_tsvector('english', content));

-- Projects reference table (one row per project, for metadata joins)
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT UNIQUE NOT NULL,
    day_number  INTEGER,
    tech_stack  TEXT[],
    description TEXT,
    live_url    TEXT,
    repo_url    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Chunking Strategy

**Method:** Section-aware chunking using markdown header boundaries as primary split points.

**Target chunk size:** 400–600 tokens. Hard maximum: 800 tokens.

**Overlap:** 50 tokens carried forward at each chunk boundary.

**Metadata preserved per chunk:** The section header (H2 or H3) is stored as metadata on every chunk, enabling the LLM to cite not just the document but the specific section. A citation reading `"AniMatch / architecture / Recommendation Algorithm Design"` is meaningfully more useful than `"AniMatch README, chunk 7"`.

**Rationale and emphasis:** Chunking quality is the most underrated variable in a RAG system's performance. The model is not the bottleneck. The embedding model is not the bottleneck. The way knowledge is sliced is the bottleneck. A chunk titled "## Why PostgreSQL over MongoDB" is semantically coherent and retrievable. An arbitrary 500-token window that starts mid-sentence and ends in the middle of a code block is neither. Spend time here before connecting the LLM.

---

## 11. Retrieval Flow

### Builder Brain Query Pipeline

```
User Query
(e.g., "What architecture decisions did I make for AniMatch?")
    │
    ▼
FastAPI: POST /api/search
    │
    ▼
Embed Query
→ Gemini text-embedding-004
→ Output: 768-dimensional query vector
→ Timing: ~100–200ms
    │
    ▼
pgvector Cosine Similarity Search
→ SELECT content, project_name, doc_type, section_header, source_file,
         1 - (embedding <=> $query_vector) AS similarity
  FROM chunks
  WHERE 1 - (embedding <=> $query_vector) >= 0.65
  ORDER BY similarity DESC
  LIMIT 8;
→ Timing: ~30–80ms at MVP chunk count
    │
    ▼
Retrieved Chunks (with metadata, ordered by similarity)
    │
    ├── Log similarity scores for debugging
    ├── If no chunks above threshold → return "insufficient context" response
    │
    ▼
Context Assembly
→ Format per chunk:
   "[Source: {project_name} / {doc_type} / {section_header}]
    {content}
    ---"
→ Ordered highest similarity first
→ Total context budget: max 6,000 tokens (leaves room for system prompt + response)
    │
    ▼
Prompt Construction
→ System:
   "You are BuilderOS, an assistant with access to Sohan's builder journey documentation.
    Answer questions ONLY using the context provided below.
    For every claim you make, cite the source using the [Source: ...] label.
    If the provided context does not contain enough information to answer reliably,
    say: 'I couldn't find reliable information about this in your documentation.'
    Do not make up information. Do not answer from general knowledge."
→ Context: assembled chunk text
→ User: original query
    │
    ▼
Gemini 2.5 Flash Generation
→ Temperature: 0.1 (factual retrieval)
→ Timing: ~800–2000ms
    │
    ▼
Response Parsing and Citation Extraction
→ Map [Source: ...] references in output to chunk metadata
→ Build structured citation list
    │
    ▼
API Response (JSON)
{
  "answer": "AniMatch used an ALS collaborative filtering approach for...[Source: AniMatch / architecture / Recommendation Algorithm Design]...",
  "sources": [
    {
      "project": "AniMatch",
      "doc_type": "architecture",
      "section": "Recommendation Algorithm Design",
      "similarity_score": 0.91,
      "source_file": "projects/animatch/ARCHITECTURE.md"
    }
  ],
  "chunks_retrieved": 8,
  "chunks_used_in_answer": 3,
  "latency_ms": {
    "embedding": 145,
    "search": 52,
    "generation": 1240,
    "total": 1437
  }
}
```

---

## 12. Placement Analysis Flow

### Interview Copilot Multi-Step Pipeline

```
Job Description (raw pasted text)
    │
    ▼
FastAPI: POST /api/analyze
    │
    ▼
Step 1: JD Extraction (LLM Call 1 — gemini-2.5-flash)
→ Prompt: "Analyze this job description. Return ONLY a JSON object with:
  {
    'required_skills': [...],
    'preferred_skills': [...],
    'domain': 'AI/ML | Data Analytics | Fullstack | etc.',
    'role_type': 'internship | full-time | contract',
    'responsibilities': [top 3 responsibilities as strings]
  }
  Return only the JSON. No markdown, no explanation."
→ Parse response → structured JD data
    │
    ▼
Step 2: Parallel Skill Retrieval
→ For each skill in (required_skills + preferred_skills):
     query = f"{skill} project experience"
     embed query → similarity search (top-k=5 per skill)
     tag each result with: skill_label, is_required (bool)
→ Aggregate all retrieved chunks with their skill labels
    │
    ▼
Step 3: Project Relevance Scoring
→ For each project appearing in retrieved chunks:
     score = Σ (is_required ? 2 : 1) for each skill with chunks from this project
→ Sort projects by score descending
→ Select top 3 projects
    │
    ▼
Step 4: STAR Story Generation (LLM Call 2 — per top project)
→ Collect all retrieved chunks for this project
→ Prompt:
  "Using ONLY the context below about {project_name}, write a STAR-format interview story.
   The story should demonstrate: {top_matched_skill_for_this_project}.
   Format:
   Situation: [2–3 sentences]
   Task: [2–3 sentences]
   Action: [3–4 sentences, specific and technical]
   Result: [2–3 sentences, include measurable outcomes if available]
   IMPORTANT: Do not add details that are not present in the provided context.
   Context:
   {assembled_project_chunks}"
    │
    ▼
Step 5: Skill Gap Identification
→ Gaps = required_skills where no retrieved chunk met similarity threshold ≥ 0.65
→ Flagged with label: "Not found in documentation"
    │
    ▼
Step 6: Talking Points Generation (LLM Call 3)
→ Per top project:
  "Based on this context about {project_name}, write 4 specific talking points
   that demonstrate suitability for a {domain} {role_type} role.
   Focus on: technical depth, problem-solving process, and outcomes.
   Each point should be one sentence, specific, and not generic.
   Context: {assembled_project_chunks}"
    │
    ▼
Final Response Assembly
{
  "role_summary": {
    "domain": "AI/ML",
    "role_type": "internship",
    "required_skills": ["Python", "RAG", "Vector Databases", "LLM APIs"],
    "preferred_skills": ["FastAPI", "Next.js", "pgvector"]
  },
  "matched_projects": [
    {
      "name": "AniMatch",
      "day_number": 3,
      "relevance_score": 8.5,
      "matched_skills": ["Python", "Machine Learning", "Collaborative Filtering"],
      "why_relevant": "AniMatch demonstrates end-to-end ML system design...",
      "star_story": {
        "situation": "...",
        "task": "...",
        "action": "...",
        "result": "..."
      },
      "talking_points": ["...", "...", "...", "..."],
      "source_chunks_used": 5
    }
  ],
  "skill_coverage": {
    "demonstrated": ["Python", "SQL", "Machine Learning", "FastAPI", "Next.js"],
    "gaps": ["Docker", "Kubernetes", "Spark"]
  },
  "total_llm_calls": 5,
  "total_latency_ms": 8200
}
```

---

## 13. Success Metrics

### Primary Launch Criteria (Day 14 Definition of Done)

The MVP is considered successfully shipped when all three of the following are true:

1. A natural language query about any of the 13 indexed projects returns a grounded, cited answer within 5 seconds — consistently, not once.
2. Pasting an "AI Engineer Intern" job description returns a ranked list of relevant projects and at least one complete, usable STAR story drawn from actual documentation.
3. All 13+ project documents are indexed and the knowledge base is queryable by end of Day 14.

### Retrieval Quality Metrics

| Metric | Target | How to Measure |
|---|---|---|
| Grounding rate | >90% of answers cite ≥1 source | Inspect 20 test queries manually |
| Hallucination rate | <5% | Spot-check against source documents |
| Retrieval relevance | Top-3 chunks relevant in >80% of queries | Review raw retrieval output for 10 queries |
| "Insufficient context" accuracy | System correctly declines unanswerable questions | Test 5 out-of-scope queries |

### Placement Quality Metrics

| Metric | Target | How to Measure |
|---|---|---|
| Project match accuracy | Top-3 projects feel right to the builder in >85% of JD analyses | Run 5 JD analyses, evaluate manually |
| STAR story usability | Stories require ≤minor edits before interview use in >70% of cases | Evaluate 3 generated stories |
| Gap identification accuracy | All real skill gaps correctly flagged; no false negatives on obvious gaps | Compare gaps to builder's self-assessment |

### Performance Metrics

| Metric | Target |
|---|---|
| Builder Brain P95 latency | <5 seconds end-to-end |
| Interview Copilot P95 latency | <15 seconds end-to-end (multi-step pipeline) |
| Ingestion pipeline (full run) | <10 minutes for all 13 projects |
| Supabase query time | <100ms for similarity search at MVP chunk count |

### Engagement Metrics (Post-Launch, First Week)

| Metric | Target |
|---|---|
| Builder Brain queries | >50 in the first 7 days |
| JD analyses run | >5 different job descriptions analyzed |
| Interview sessions supported | Used in preparation for ≥2 actual interviews |

---

## 14. Risks and Mitigations

### Risk 1: Poor Chunking Quality → Irrelevant Retrieval

**Likelihood:** High. **Impact:** Critical.

The entire product depends on the quality of retrieved context. If chunks cut mid-thought, mix topics from different sections, or omit surrounding context, the LLM will generate poorly grounded or wrong answers.

**Mitigation (do this first):** Implement header-boundary chunking as specified. Before connecting the LLM, manually inspect the top-5 retrieved chunks for 5 test queries. If the retrieval is bad, the LLM will not save it. Fix chunking before debugging generation.

**Fallback:** If chunking quality is mediocre, reduce k and raise the similarity threshold to trade recall for precision.

---

### Risk 2: Sparse Documentation → Knowledge Blind Spots

**Likelihood:** Medium-High. **Impact:** High.

Some of the 13 projects may have thin READMEs (under 300 words) or missing architecture notes. These projects will be underrepresented in the knowledge base and retrieval will return poor results for them.

**Mitigation:** Before running ingestion, audit documentation length for all 13 projects. Enrich any project under 300 words with a brief retrospective summary. This is 30 minutes of writing that will meaningfully improve coverage. Going forward, document daily with retrieval in mind.

---

### Risk 3: Scope Creep → Nothing Ships on Day 14

**Likelihood:** Medium. **Impact:** Critical.

BuilderOS is architecturally interesting. There will be tempting additions: re-ranking, conversation history, metadata filter UI, analytics, public mode. Each addition reduces the probability of shipping.

**Mitigation:** The Launch Checklist in Section 16 is the definition of done. Anything outside it is V2. If it's not on the checklist and it sounds like a good idea, write it in the roadmap document and keep building.

**Red Line Rule:** If at 6 PM on Day 14 the end-to-end retrieval pipeline is not working, cut the Interview Copilot mode entirely and ship Builder Brain only. A half-product that ships is a Day 14 win. A full product that is 80% done is not.

---

### Risk 4: LLM Hallucination in STAR Stories

**Likelihood:** Medium. **Impact:** High.

The LLM may embellish STAR stories with details not present in retrieved chunks — inventing metrics, outcomes, or technical decisions that sound plausible but are fabricated. A builder who uses a hallucinated interview story in an actual interview has been harmed.

**Mitigation:** Strict grounding instruction in the STAR generation prompt. Temperature 0.1. Display the source chunks used to generate each STAR story — visible in the UI — so the builder can verify grounding by inspection. Add a visible disclaimer: "Generated from your documentation — review before use."

---

### Risk 5: "Chat with PDF" User Behavior

**Likelihood:** High (self-inflicted). **Impact:** Medium.

Even with a retrieval-first philosophy, the UI may invite open-ended chatbot behavior. The builder might ask "what should I build next?" or "explain machine learning to me" — questions the system is not designed for, and cannot answer well without fabricating.

**Mitigation:** UI copy and placeholder text should set explicit expectations. Placeholder text in Builder Brain: *"What did I learn about recommendation systems?"* or *"Which projects used PostgreSQL?"* — not *"Ask me anything."* The retrieved chunks panel should be as visually prominent as the generated answer to reinforce that evidence is the product.

---

### Risk 6: Embedding Model Mismatch

**Likelihood:** Low. **Impact:** High (silent bug).

If the embedding model used during ingestion differs from the model used during query embedding, similarity scores will be meaningless and retrieval will fail silently — returning technically valid results that are semantically irrelevant.

**Mitigation:** Set the embedding model as a single constant in the codebase (`EMBEDDING_MODEL = "text-embedding-004"`) used by both the ingestion pipeline and the query handler. Never hardcode the model name in two places.

---

### Risk 7: Interview Copilot Latency Too High

**Likelihood:** Medium. **Impact:** Medium.

The Interview Copilot makes 3+ LLM calls sequentially. At ~1–2 seconds per call, total pipeline latency could reach 10–20 seconds, which feels slow for an interactive product.

**Mitigation:** Run STAR story generation calls in parallel (one per top project) using `asyncio.gather`. JD extraction and skill retrieval must be sequential; STAR generation is parallelizable. This reduces perceived latency significantly. Add a progress indicator with step labels: "Extracting skills... Searching knowledge base... Generating stories..." to manage perceived wait time.

---

## 15. Future Roadmap

### V2 — Knowledge Enrichment and Retrieval Precision

**Target:** Within 2 weeks of MVP launch, or by end of 30-day challenge.

**Theme:** Make the knowledge base richer and the retrieval smarter.

**Hybrid Search**
Add PostgreSQL full-text search (`tsvector` + GIN index) alongside semantic search. Combine scores: `final_score = 0.7 * semantic_score + 0.3 * bm25_score`. This dramatically improves precision on exact technology-name queries ("which projects used pgvector?") where pure semantic search sometimes underperforms on short technical terms.

*Note: This is the single highest-ROI post-MVP enhancement. Consider making it V1.5.*

**Incremental Ingestion**
Detect changed documents using content hash before re-embedding. Support adding a single project document without full rebuild. This matters increasingly as Days 15–30 continue to produce new documentation.

**Richer Metadata**
Auto-extract technology tags at ingestion time. Enrich the projects table with live URLs, GitHub repo URLs, and deployment status. Enable UI-side filtering: "Search only Architecture docs" or "Filter by ML projects."

**Code Ingestion (Selective)**
Index high-signal code artifacts only: function signatures, docstrings, inline comments, and configuration files. Do not index raw implementation. Build a code-aware chunker that extracts only the semantic signal.

**Multi-turn Conversation**
Maintain a short conversation history (last 3–5 turns) in Builder Brain mode to support follow-up questions. "Which projects used PostgreSQL?" → "Tell me more about the AniMatch database schema."

**Resume Alignment Mode**
Upload a resume version. Get a gap analysis: skills on the resume not yet demonstrated in projects, and projects in the knowledge base not yet on the resume.

---

### V3 — Multi-User Builder Platform

**Target:** Post-30-day challenge, post-placement.

**Theme:** What works for one builder should work for any builder.

**Platform Architecture**
User accounts with isolated knowledge bases. Each builder has their own Supabase schema or row-level security policy. GitHub OAuth for login and automatic repository discovery.

**GitHub Integration**
Auto-sync READMEs, wiki pages, and release notes on push events via GitHub webhooks. Daily ingestion job for any documentation changes.

**Interview Simulation Mode**
AI interviewer conducts a mock interview based on the JD and the knowledge base. The builder answers, and the system evaluates: Was the answer specific? Was it grounded in actual project details? Did it include a measurable result? Coaching feedback after each answer.

**Company-Specific Preparation**
"Prepare me for Google DeepMind" — not just role-based but company-and-role-based preparation that factors in known interview styles, commonly asked questions, and how to frame projects for that specific culture.

**Recruiter-Facing Public Profile**
A shareable link to a curated, queryable view of the builder's work. "Ask the portfolio" — recruiters can ask natural language questions and get grounded answers from the builder's documentation.

**Skill Progression Analytics**
Visual representation of how technical depth in each skill evolved across days. Which skills appear early and grow? Which appear once and disappear? Where is there clear compounding vs. isolated experiments?

**Application Package Export**
One click: generate a tailored PDF containing matched projects, skills, and STAR stories for a specific JD. Ready to review before walking into an interview.

---

## 16. Launch Checklist

Each item is binary: done or not done. No partial credit on a ship day.

### Environment Setup
- [ ] Supabase project created; pgvector extension enabled (`CREATE EXTENSION vector;`)
- [ ] FastAPI project initialized; Python virtual environment created; dependencies installed
- [ ] Gemini API key configured in `.env` file; confirmed working with a test embedding call
- [ ] Next.js project initialized with Tailwind CSS; runs locally on `localhost:3000`
- [ ] FastAPI runs locally on `localhost:8000`; health check endpoint returns 200

### Ingestion Pipeline
- [ ] Markdown parser reads files recursively from project root directory
- [ ] Section-based chunking (H2/H3 boundaries) producing coherent chunks — inspected manually
- [ ] Chunk metadata populated correctly for 2 test documents (project name, doc type, day number, section header)
- [ ] Gemini `text-embedding-004` integration working; embeddings stored in Supabase
- [ ] Ingestion script run on 2 documents end-to-end; chunks visible in Supabase table
- [ ] All 13 project READMEs indexed
- [ ] Day logs (Day 1–Day 13) indexed
- [ ] Architecture notes indexed (all available)
- [ ] Resume indexed
- [ ] Ingestion summary printed: total documents, total chunks, any failures
- [ ] IVFFlat index created on the embedding column

### Retrieval Layer
- [ ] pgvector cosine similarity search returns results for a test query
- [ ] Top-5 results manually inspected for relevance on these 5 test queries:
  - [ ] "Which projects used PostgreSQL?"
  - [ ] "What did I learn about recommendation systems?"
  - [ ] "What is AniMatch's architecture?"
  - [ ] "Describe the Forge multi-agent system"
  - [ ] "What Chrome extension APIs did I use?"
- [ ] Similarity threshold tuned; chunks below threshold correctly excluded
- [ ] FastAPI `POST /api/search` returns structured JSON with answer, sources, and latency

### Builder Brain Mode
- [ ] System prompt tested: LLM cites sources and refuses to fabricate
- [ ] "Insufficient context" response triggered correctly for an out-of-scope query
- [ ] 5 diverse Builder Brain queries answered correctly with citations — verified against source docs

### Interview Copilot Mode
- [ ] JD extraction (Step 1) working; structured JSON returned for a sample JD
- [ ] Per-skill retrieval (Step 2) returning relevant chunks for each extracted skill
- [ ] Project relevance scoring (Step 3) ranking projects in a sensible order
- [ ] STAR story generation (Step 4) grounded in retrieved chunks; no obvious hallucinations
- [ ] Skill gap identification (Step 5) working for skills not in the knowledge base
- [ ] 2 full end-to-end JD analyses completed:
  - [ ] "AI Engineer Intern" JD → confirmed relevant project matches
  - [ ] "Data Analyst" JD → confirmed relevant project matches

### Frontend
- [ ] Mode toggle between Builder Brain and Interview Copilot functional
- [ ] Builder Brain: query input, answer, and source citations rendered correctly
- [ ] Retrieved chunks panel visible and expandable
- [ ] Interview Copilot: JD input area, output panel with all sections rendering correctly
- [ ] Loading states shown during API calls
- [ ] Error states handled gracefully

### Deployment
- [ ] FastAPI deployed on Railway; health check returning 200 on production URL
- [ ] Next.js deployed on Vercel pointing to production FastAPI URL
- [ ] Production end-to-end test: 2 Builder Brain queries working on live deployment
- [ ] Production end-to-end test: 1 JD analysis working on live deployment
- [ ] No API keys hardcoded; all secrets in environment variables

### Documentation
- [ ] README written: project description, architecture overview, how to run locally
- [ ] Architecture notes for BuilderOS itself written (it should self-document)
- [ ] Day 14 learning log entry written
- [ ] Known issues and limitations documented

### Post-Ship
- [ ] GitHub repository made public
- [ ] Twitter/LinkedIn post drafted and published
- [ ] BuilderOS added to the 30-Day Builder Journey portfolio index
- [ ] BuilderOS's own documentation indexed into BuilderOS (recursive self-knowledge — for Day 15)

---

## 17. Appendix: Opinionated Notes

*Challenges to assumptions and strong recommendations, offered because weak PRDs describe what to build; good PRDs argue for why specific decisions are correct.*

---

### A. Interview Copilot Is The Killer Feature — Design Accordingly

The brief positions Builder Brain and Interview Copilot as co-equal modes. They are not, and the product should not present them as if they are.

Interview Copilot is the feature used under genuine time pressure and emotional stakes — the night before a placement interview, with limited time and high anxiety. It delivers irreplaceable, time-critical value that no other tool provides in this form. Builder Brain is a useful utility. Interview Copilot is important.

Recommendation: give Interview Copilot equal or greater visual prominence in the UI. Consider making it the default mode, especially as placement season approaches. The mode toggle labels matter: consider "Builder Brain" and "Interview Prep" rather than two equally weighted options.

---

### B. The Retrieved Chunks Panel Is Not Decorative

Most RAG implementations bury the retrieved source chunks behind a "Sources" toggle that users never open. This defeats the purpose of building a retrieval-first system.

For BuilderOS, the retrieved chunks ARE the product. The generated answer is a summary of what the chunks contain. Displaying chunks prominently — always visible, not hidden — serves two purposes: it lets the builder verify grounding at a glance, and it reinforces the philosophical distinction between BuilderOS and a generic chatbot. When the evidence is front and center, the product feels like a knowledge retrieval tool, not a chat interface.

---

### C. Document Enrichment Before Ingestion Is Worth 30 Minutes

The retrieval system is bounded by what is in the documentation. If a project has a three-paragraph README, the knowledge base has three paragraphs of information about it, and retrieval will reflect that.

Before running ingestion, audit all 13 project READMEs for length and quality. Enrich any project under 300 words with a retrospective summary: what was built, what tech was used, what was learned, what the architecture looked like. This 30-minute writing exercise will improve retrieval quality more than any parameter tuning or model upgrade.

Going forward: Day 15 onward, write documentation with retrieval in mind. Each README should include an explicit "What I Learned" section. This is the single best compounding investment for the remaining 16 days.

---

### D. Hybrid Search Should Be V1.5, Not V3

Pure semantic search underperforms on short, specific technical terms. Asking "which projects used pgvector?" may not retrieve all pgvector-related chunks because the semantic neighborhood of "pgvector" in embedding space does not cleanly cluster with all relevant documents.

Adding PostgreSQL full-text search (`tsvector` + `GIN` index) alongside semantic search — and combining scores with a weighted formula — is a one-day addition that dramatically improves precision for technology-name queries. Supabase already supports this natively.

This enhancement is scoped as V2 in this PRD because Day 14 already has enough in scope. But it should be the first feature built after the MVP ships — within the same week if possible.

---

### E. The Ingestion Pipeline Is A 30-Day Asset

The ingestion pipeline built on Day 14 will be run again for Days 15 through 30 as new projects are completed. Treating it as a one-time script is short-sighted.

Spend 30 additional minutes on Day 14 to support incremental ingestion: compute a content hash at document load time and skip re-embedding if the hash matches an existing record. Support adding a single document path as a command-line argument. This modest investment will save significant time and API cost across the remaining 16 days, and it is far easier to build incrementally now than to retrofit later.

---

### F. A Final Provocation On Scope

The most common reason Day 14 projects do not ship is that the scope of Day 14 includes features that belong on Day 15. Interview Copilot is worth building, but if at any point during the day it feels like it might prevent the MVP from shipping, cut it.

A working Builder Brain — retrieval, synthesis, citation, deployed — is a complete Day 14 project. The Interview Copilot can be Day 15's enhancement. Ship something that works rather than something that is almost done.

The 30-Day Builder Journey's entire premise is shipping. The checklist exists to prevent drift. Trust the checklist.

---

*Document ends.*

*BuilderOS — Day 14 of 30*

*Build the memory. Know the journey.*
