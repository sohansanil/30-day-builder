# Day 22

Project: SoEchoes UX Polish & OG Tags

Goal:
Transform the MVP map application into a premium, "Apple-like" product with smooth animations, high-quality typography, frosted glass UI, and proper social sharing capabilities.

What I Built:
I implemented a comprehensive UI overhaul using Lora for typography, backdrop-filters for frosted glass effects, and Framer Motion for cinematic entrance animations. I also built category filters, a custom memory card interface with a share button that automatically zooms to the memory when opened, and generated dynamic OpenGraph (OG) images for sharing on platforms like WhatsApp, Twitter, and LinkedIn.

Challenges:
Designing a clean and premium aesthetic required careful tuning of spacing, colors, and shadows. The hardest part was getting the Next.js `metadata` and OG images to render properly across all platforms by ensuring the `metadataBase` was configured correctly for Vercel. 

Key Learnings:
- Premium UI design patterns (frosted glass, semantic typography, micro-interactions)
- Next.js OpenGraph image generation and metadata API
- Framer Motion animations for React components
- Vercel production deployment and environment variable management

Tech Stack:
- Next.js
- Framer Motion
- OpenGraph Tags

Links:

* GitHub: [SoEchoes Repo](https://github.com/sohansanil/30-day-builder/tree/main/projects/soechoes)
* Live Demo: [SoEchoes Live](https://soechoes.vercel.app)
