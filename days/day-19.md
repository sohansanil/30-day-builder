# Day 19

Project: SonVest 

Goal: Build a decision intelligence platform that simulates real-world investment scenarios, removing the bias of hindsight by hiding the future outcome.

What I Built:
SonVest is an educational investing simulator unlike any other. Instead of letting users replay history, SonVest acts as a "Signal Engine"—an AI-driven interface that presents historical market scenarios as interactive Case Files. It aggregates real-world data and asks the user to make a conviction-based decision, revealing the actual market results only after they commit. The interface is heavily inspired by professional terminals (like Bloomberg) and top-tier intelligence systems, trading gamified XP for a serious "Decision Rating" metric.

Challenges:
- Maintaining the suspension of disbelief by designing an immersive, terminal-like UI with typing effects and cinematic reveals.
- Structuring the React architecture to cleanly separate the "Market Detective" logic from the final "Decision Result" views.
- Developing a custom `SignalEngine` animation overlay to make the platform feel alive.

Key Learnings:
- The immense value of positioning and philosophy in product design. Changing the framing from "HMM Simulator" to "Personal Investing Operating System" completely transformed the product.
- Advanced Framer Motion animations to simulate data processing.
- Utilizing Tailwind CSS for ultra-premium, dark-mode-first aesthetic polish (glassmorphism, monospace fonts, glowing accents).

Tech Stack:
- Next.js
- React
- Tailwind CSS
- Framer Motion

Links:

* [GitHub Repository](https://github.com/sohansanil/30-day-builder/tree/main/projects/sonvest)
* [Live Demo](https://app-topaz-five-67.vercel.app)
