# Day 11

Project: Forge
Live Demo: (Pending Vercel Deployment)
GitHub: https://github.com/sohansanil/30-day-builder/tree/main/projects/forge

Goal:
Build a multi-agent orchestration platform that simulates an entire product team, taking a raw idea and outputting a full Product Blueprint, System Design, and Execution Plan in minutes. 

What I Built:
Forge, a sleek, industrial-themed AI product builder. It uses the Gemini 2.5 Flash model and features a Dual-Mode Architecture:
1. **Quick Build**: A fast prototype path that uses 2 agents (Architectural Draftsman and Build Supervisor) to generate a complete spec in ~15 seconds, staying within free tier API limits.
2. **Full Blueprint**: A production-grade path that uses the full 6-agent pipeline (Orchestrator, Researcher, Product Manager, Architect, Build Supervisor, Safety Inspector).

The app streams outputs in real-time, visualizes the pipeline progression, and exports beautifully formatted Markdown blueprints.

Challenges:
- Handling the strict 15 Requests Per Minute (RPM) quota on the Gemini Free Tier during the full 6-agent pipeline.
- Designing a Dual-Mode architecture that allows graceful degradation into a fast, 2-agent path without sacrificing core output quality.
- Parsing and safely rendering raw markdown streams directly from the AI agents.

Key Learnings:
- Combining roles into "hybrid agents" (like the Draftsman combining PRD and Architecture) can drastically reduce token usage and API calls.
- Designing an effective UI for multi-agent systems requires clear visualization of the active agent, what they are doing, and how their output flows into the next stage.
- Using `ReactMarkdown` and custom CSS is a powerful way to render agent outputs beautifully.

Tech Stack:
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Gemini API (gemini-2.5-flash)
- React Markdown
