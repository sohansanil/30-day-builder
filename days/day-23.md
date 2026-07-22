# Day 23

Project: WhatAreMyRights

Goal: Build a Constitutional Knowledge Engine that cites primary legal sources (Constitution, BNS, BNSS, NCERT) without hallucinations or excessive LLM inference times.

What I Built:
A complete Retrieval-Augmented Generation (RAG) pipeline for Indian Legal queries. When a user asks a legal question, the app determines the intent (exact article lookup vs semantic concept lookup) and retrieves the corresponding legal chunks using hybrid search from Supabase (pgvector for semantic, pg_trgm for full-text). It then uses Gemini 2.5 Flash strictly bound to a structured JSON schema to format the output with a TL;DR and a 'Chain of Authority'.

Challenges:
- Vercel Serverless Functions timing out and crashing when attempting to bundle the native C++ Linux bindings for `onnxruntime-node`.
- Striking a balance between semantic meaning and exact keyword match (e.g. "Section 144") using Reciprocal Rank Fusion.

Key Learnings:
- You don't have to pay for OpenAI/Google Embedding APIs! You can run embeddings locally or on Edge functions completely for free using WebAssembly (WASM) and `Transformers.js`.
- Bypassing the native Node bindings and forcing WASM execution solves deployment issues on Vercel for AI models.
- Fast heuristic intent routing (regex + basic rules) before retrieval is much better and cheaper than paying an LLM to decide what kind of query the user asked.

Tech Stack:
- Next.js (App Router)
- Tailwind CSS
- Supabase (PostgreSQL + pgvector + pg_trgm)
- Transformers.js (all-MiniLM-L6-v2 running in WASM)
- Gemini 2.5 Flash API

Links:

* [GitHub](https://github.com/sohansanil/whataremyrights)
* [Live Demo](https://whataremyrights.vercel.app)
