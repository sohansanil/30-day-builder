# Day 12

Project: Startup Roulette - The Dumbest Startup Generator on the Internet

Goal: Create a highly interactive, meme-worthy slot machine UI that generates absurd but semi-plausible startup ideas using custom Framer Motion physics, Web Audio, and html-to-image sharing.

What I Built:
- Developed a 3-reel "slot machine" with custom physics and sequential reveal logic using Framer Motion.
- Implemented a complex data structure blending products, audiences, and twists with varying "rarity" tiers (Common to Legendary).
- Added immersive casino features: fake mechanical crank, violent screen shakes, and confetti explosions for legendary results.
- Built a "Share Disaster" screenshot capability using `html-to-image` for instant social sharing.
- Added a highly performant HTML5 Canvas "Tech Bro Matrix" background with falling buzzwords and emojis.

Challenges:
- Tuning the Framer Motion spring physics to make the reel spin feel visceral and heavy.
- Managing long text strings gracefully without breaking the slot machine UI (solved with flexbox and CSS text-wrap balancing).
- Handling HTML-to-Image rendering quirks with modern CSS like `oklch`.

Key Learnings:
- Combining micro-interactions (shake, sound, flash) drastically elevates the "dopamine" and perceived quality of a web application.
- Advanced Framer Motion techniques like sequential `staggerChildren` to create suspenseful reveals.

Tech Stack:
- Next.js 16
- React
- Framer Motion
- Tailwind CSS
- HTML5 Canvas

Links:

* [GitHub](https://github.com/sohansanil/30-day-builder/tree/main/projects/startup-roulette)
* [Live Demo](https://startup-roulette.vercel.app)
