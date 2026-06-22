# SoCortex

> The ultimate "Personal OS" built to retain, analyze, and synthesize knowledge from a 30-Day Builder Journey.

![SoCortex UI](https://github.com/user-attachments/assets/placeholder-socortex-banner)

SoCortex is a RAG-powered Personal Knowledge Engine. Instead of querying the open web, it indexes the code, architectures, key learnings, and strategic placement data of 8 complex engineering projects shipped over 14 days. 

It transforms raw builder history into a **living, interrogatable operating system**.

## 🧠 What It Does

- **Global Memory Retrieval**: Asks complex questions across multiple projects. (e.g., *"Compare the recommendation systems of AniMatch and SoFocus"*).
- **Project-Specific Workspaces**: Deep-dives into individual project architectures, tech stacks, and source code.
- **Placement & Interview Copilot**: Pastes a Job Description and dynamically matches it against the 30-day builder portfolio, exporting a generated Interview Brief highlighting skill gaps, perfect project matches, and talking points.
- **Dynamic Dashboard Answers**: Transforms raw Gemini LLM outputs into beautifully structured, highly readable UI dashboards.

## 🛠️ The Stack

**Frontend (Web)**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4 (Custom "Vibrant SaaS" & "Neural Canvas" aesthetics)
- Lucide React Icons

**Backend (API & AI)**
- FastAPI (Python)
- Google Gemini 2.5 Flash (LLM Generation)
- Google Gemini Embedding-2 (Vector Generation)
- Supabase (PostgreSQL with `pgvector` for semantic search)

## 🚀 How It Works

1. **Ingestion**: The `ingest.py` script traverses local directories, extracts Python/TS/JS/SQL code and markdown files, chunks them, and generates embeddings via Gemini.
2. **Vector Storage**: Embeddings are stored in Supabase with `pgvector`.
3. **Retrieval**: When a query is asked, FastAPI generates an embedding for the query and executes an RPC call to Supabase (`match_documents`) using cosine similarity.
4. **Synthesis**: The retrieved code chunks are fed to Gemini 2.5 Flash with strict formatting rules to prevent "walls of text," outputting heavily structured markdown.
5. **Presentation**: The Next.js frontend catches the structured output and maps it directly into high-contrast Tailwind UI components.

## 💻 Running Locally

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Ensure .env contains SUPABASE_URL, SUPABASE_KEY, and GEMINI_API_KEY
uvicorn api:app --reload --port 8000
```

### Frontend
```bash
cd web
npm install
npm run dev
```

## 📈 The Journey So Far

SoCortex is Day 14 of the 30-Day Builder Journey, built upon the technical foundations of:
- **AeroIntel** (Data Pipelines)
- **IsSheMadAtMe** (AI Consumer)
- **World Cup Hub** (Analytics)
- **AniMatch** (PyTorch Recommendation)
- **BlackjackOracle** (Decision Science)
- **Forge** (AI Agents)
- **Startup Roulette** (Viral UX)
- **SoFocus** (Chrome Extensions)

**Status:** Ready for Deployment. 🚀
