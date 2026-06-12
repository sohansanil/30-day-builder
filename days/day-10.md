# Day 10: Sohan's Edge - Probability & Decision Science

## The Goal
Transform a flawed machine learning prototype into a mathematically rigorous, deterministic decision-science product for Blackjack.

## The Problem
In Day 10, the original attempt to use PyTorch machine learning models to predict Blackjack hands proved structurally incorrect. Neural networks are designed for pattern recognition in noisy data, but Blackjack is a game of exact, deterministic probabilities and combinatorics based on a finite deck of cards. The AI was hallucinating expected values and making inaccurate predictions because it was the wrong tool for the job.

## The Pivot
Instead of stubbornly sticking to a flawed ML architecture, I completely tore it down and built a deterministic probability engine. 

I engineered **Sohan's Edge**, a premium, Bloomberg Terminal-style analytics dashboard that uses exact combinatorics to calculate:
- True card counting metrics (Hi-Lo system)
- Exact remaining shoe composition
- Real-time Dealer Bust Probabilities based on the upcard
- Player Expected Value (EV) for Hit, Stand, Double, and Split actions
- Strict Basic Strategy enforcement

## Tech Stack
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Architecture:** Client-side React state for instant deterministic calculations

## Key Takeaways
1. **Tool Selection is Critical:** AI is not a silver bullet. Mathematical problems require mathematical solutions.
2. **Premium UI/UX:** A "Decision Science" product requires a clean, high-contrast, data-dense interface. By embracing a dark mode, glassmorphism, and consistent luxury color palettes (Emerald/Gold), the product feels like a professional analytics tool rather than a generic app.
3. **Pivoting is Building:** Throwing away broken code and starting fresh with the right architecture is a superpower.

## Links
- **[Live Demo](https://sohans-edge.vercel.app)**
- **[GitHub Repository](https://github.com/sohansanil/sohans-edge)**
