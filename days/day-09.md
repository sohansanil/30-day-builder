# Day 9 — AI Recommendation Engine (AniMatch)

**Date**: June 10, 2026  
**Focus**: Machine Learning, Matrix Factorization, Embeddings, Hybrid Recommendation Systems, Next.js Integration, Edge Deployment.  
**Type**: 🧠 Learning + 🔨 Building

---

## 🎯 Learning Objective

Understand how modern recommendation systems go beyond simple genre tagging by leveraging Collaborative Filtering and Matrix Factorization. Learn how to train an embedding model in PyTorch, export the latent weights, and serve them seamlessly inside a Next.js full-stack application on the edge.

## 🧠 What I Learned

### Collaborative Filtering & Matrix Factorization
1. **The Problem with Metadata**: Recommending shows based purely on genres (Content-Based Filtering) ignores nuance. Two shows might share the "Sci-Fi" tag but attract completely different audiences.
2. **Collaborative Filtering**: Instead of looking at the *content*, look at the *audience*. If thousands of users who rated Show A highly also rated Show B highly, the shows are conceptually linked.
3. **Matrix Factorization**: A technique to decompose a massive User-Item rating matrix into two lower-dimensional matrices (User Embeddings and Item Embeddings). 
4. **Embeddings & Latent Space**: By training a neural network on 57 million ratings, we map every anime into a 64-dimensional "latent space". Shows that share audience overlap cluster together physically in this mathematical space.
5. **Cosine Similarity**: To find recommendations for a target anime, we calculate the cosine similarity between its 64D vector and all other vectors in the dataset. 

### Hybrid Recommender Systems
- **Seasonality Bias**: Collaborative filtering often suffers from "seasonality bias"—shows airing in the same season cluster together because users watch them concurrently, regardless of actual similarity.
- **The Hybrid Solution**: We can fix this by introducing a 20% metadata penalty. We calculate the Jaccard Similarity of genres and themes (hard metadata) and blend it with the 80% collaborative filtering score.

### Machine Learning to Web Deployment
- **Avoiding Python API Overhead**: Instead of spinning up a costly Python backend (like Flask/FastAPI) to calculate similarities, the exported PyTorch embedding matrices (`embeddings.json`) can be loaded directly into a Next.js Serverless API route.
- **Progressive Hydration**: We store lightweight ML indices locally, but fetch rich imagery and synopses dynamically from the Jikan (MyAnimeList) API to keep the dataset fresh and the UI stunning without bloating the repository.

---

## ✅ What I Did

- [x] Sourced the **Kaggle Anime Recommendations Database**, containing 57 million ratings across 320,000+ users.
- [x] Engineered an ML pipeline in Python using PyTorch and Pandas.
- [x] Trained a 64-dimensional Matrix Factorization model to generate anime embeddings.
- [x] Extracted and exported the trained weights as lightweight JSON matrices (~24MB).
- [x] Built **AniMatch**, a beautifully designed, glassmorphic Next.js web application.
- [x] Implemented an in-memory nearest-neighbor calculation algorithm directly inside a Next.js serverless route.
- [x] Integrated the Jikan REST API for real-time metadata enrichment (fetching posters, scores, and synopses).
- [x] Implemented an "Explainable AI" feature that breaks down *why* a show is recommended based on the hybrid score.
- [x] Solved Next.js strict TypeScript compiler errors and successfully deployed the engine to Vercel's edge network.

---

## 💡 Key Takeaways

1. **AI doesn't require massive overhead**: You don't need a heavy Python microservice to run inference on embeddings. For nearest-neighbor lookups, exporting weights to JSON and calculating cosine similarity in TypeScript is incredibly fast and cheap.
2. **Hybrid is king**: Pure collaborative filtering is smart but lacks common sense (seasonality bias). Pure metadata is logical but lacks human nuance. Combining 80% crowd wisdom with 20% hard metadata creates the perfect recommendation.
3. **Vercel Serverless Limits**: Vercel allows up to 50MB for serverless functions on the Hobby tier. Our 24MB embeddings slipped right under the limit, making deployment frictionless.

---

## 🔗 Resources

- [Kaggle: Anime Recommendations Database](https://www.kaggle.com/datasets/CooperUnion/anime-recommendations-database)
- [PyTorch: Matrix Factorization](https://pytorch.org/tutorials/)
- [Jikan API Documentation](https://docs.api.jikan.moe/)

---

## 📣 LinkedIn Post Draft

> **Day 9 of my 30-Day Builder Journey** 🚀
> 
> Today, I built **AniMatch**: an AI-powered anime recommendation engine trained on 57 million user ratings! 🌸
> 
> Most recommendation algorithms fail because they rely on simple genre matching. To solve this, I dove into Machine Learning and Matrix Factorization using PyTorch. By decomposing a massive user-rating matrix, I mapped 17,000+ anime into a 64-dimensional latent space. Shows that share the exact same audience cluster together automatically!
> 
> But I didn't stop at the Python notebook. I wanted to ship a real product.
> 
> What I learned/implemented today:
> - **Hybrid Recommender**: Blended Collaborative Filtering (80%) with Metadata Jaccard Similarity (20%) to eliminate seasonality bias.
> - **Edge AI Inference**: Bypassed building a heavy Python backend entirely. I exported the PyTorch weights as JSON and wrote a blazing fast nearest-neighbor algorithm directly in a Next.js Serverless API!
> - **Progressive UI**: Fetched rich, real-time metadata progressively via the Jikan REST API to keep the UX flawless.
> 
> I've officially successfully deployed the Next.js app to Vercel, and you can test out the recommendation engine right now!
> 
> Live Demo: [https://animatch-web-flax.vercel.app](https://animatch-web-flax.vercel.app)
> 
> Tomorrow, we move into FastAPI and backends!
> 
> #BuildInPublic #MachineLearning #NextJS #PyTorch #DataScience #WebDevelopment #30DayBuilderJourney
