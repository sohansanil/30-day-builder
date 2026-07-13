# SonVest

> History already knows the answer.
> You don't.

Most investing simulators let you replay history.

SonVest removes the future.

Instead of teaching users what happened, SonVest teaches them how to think under uncertainty by recreating historical investment decisions using only the information available at the time.

Behind every experience is SignalOS, an explainable market intelligence framework powered by Hidden Markov Models, feature engineering, and market regime detection.

## The Core Loop
- **Incoming Transmission:** Receive a classified historical market anomaly.
- **The Context:** Read the news headlines and sentiment of that exact time.
- **The Signal Engine:** Receive a consultative, emotionless assessment of market regimes using HMMs and GMMs.
- **The Decision:** Formulate a thesis. Buy, Hold, or Sell.
- **The Reveal:** See history's verdict and the Signal Engine's reflection.
- **Inspect Evidence:** Slide under the hood to see the raw ML analytics that powered the Signal Engine's briefing.

## Architecture
- **SonVest (Frontend):** React, Tailwind, Lucide Icons, Shadcn UI. A cinematic, intelligence-dossier style interface prioritizing emotional experience and microcopy.
- **SignalOS (Backend/Analytics):** FastAPI, Python, scikit-learn. Implements Hidden Markov Models and Gaussian Mixture Models for unsupervised regime detection.
- **API:** tRPC for end-to-end type safety between the game layer and the ML outputs.

> **Good investors don't predict the future. They make good decisions without seeing it. SonVest is designed to teach exactly that.**
