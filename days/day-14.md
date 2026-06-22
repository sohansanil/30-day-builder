# Day 14: SoCortex

**Project:** SoCortex — The Personal Knowledge OS
**Date:** June 22, 2026

## Goal
To build a Retrieval-Augmented Generation (RAG) operating system that ingests all the code, architectures, and lessons from the first 13 days of my 30-Day Builder Journey, allowing me to query my own knowledge base dynamically and prepare for engineering placements.

## What I Built
I engineered **SoCortex**, a full-stack AI knowledge engine. The backend is powered by FastAPI, interacting with a Supabase PostgreSQL database equipped with `pgvector`. I wrote an ingestion script to traverse all my past projects, extract the code/markdown, chunk it, and embed it using Google's Gemini Embedding API. When a query is asked, it performs a cosine similarity search via a Supabase RPC function. The retrieved context is then passed to Gemini 2.5 Flash.

The frontend is a sleek Next.js 15 application utilizing Tailwind CSS. It features a custom "premium SaaS" aesthetic with a neural network background canvas. I also built a dynamic markdown parser to instantly transform raw LLM responses into highly structured, dashboard-style cards for readability.

Additionally, I integrated a **Placement Copilot**, which takes a Job Description, performs semantic search against my portfolio, and generates an Interview Brief detailing skill gaps and talking points.

## Challenges
- **UI/UX Design**: Moving away from the generic "Hacker Tool" look (dark background, identical cards) to a high-contrast, story-driven layout that resembles premium tools like Cursor or Linear.
- **RAG Latency & Context Limits**: Balancing the chunk size of the source code during ingestion to ensure the LLM has enough context without exceeding token limits or slowing down generation.
- **Rendering Markdown**: Forcing the LLM to output predictable markdown so the frontend could map headers to specific Tailwind dashboard components instead of rendering walls of text.

## Key Learnings
- **Vector Databases**: Setting up Supabase `pgvector` and writing an RPC function (`match_documents`) to execute vector similarity searches natively in PostgreSQL.
- **Embedding Generation**: Using the `gemini-embedding-exp-03-07` model to convert raw code logic into 768-dimensional semantic vectors.
- **Visual Hierarchy**: Realizing that just adding colors isn't enough; true UI design requires structural hierarchy, varied emphasis, and removing identical visual weights.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React
- **Backend**: FastAPI, Python, Uvicorn
- **AI/LLM**: Google Gemini 2.5 Flash, Gemini Embedding-2
- **Database**: Supabase, PostgreSQL (`pgvector`)

## Links
- [GitHub Repository](https://github.com/sohansanil/30-day-builder/tree/main/projects/SoCortex)
