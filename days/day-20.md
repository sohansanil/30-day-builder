# Day 20: Micro-Frontend Architecture & Next.js Multi-Zones

## 🎯 What I Learned Today
Today, I tackled a real-world infrastructure problem at my SMEPay internship. The goal was to integrate a customer documentation portal (built on Nextra) into our main Next.js website. However, Nextra relies on React 18, while our main application runs on React 19.

Trying to force them into a single monolithic repository resulted in severe dependency conflicts that broke the build.

Instead of degrading the main app's React version or building a custom docs parser from scratch, I learned how to use **Micro-Frontends** using **Next.js Multi-Zones**.

## 🛠️ Key Technical Implementations
1. **Repository Architecture**: Separated the documentation portal into its own sub-app (`product-docs`) with an isolated `package.json` to lock it to React 18.
2. **Vercel Deployment**: Deployed the docs as a completely separate project on Vercel to guarantee that if the docs crash, the main website remains 100% safe.
3. **Next.js Rewrites**: Configured `next.config.ts` on the main application to silently proxy requests from `/docs/:path*` to the deployed Vercel docs URL.

```ts
// Example rewrite configuration
async rewrites() {
  return [
    {
      source: "/docs/:path*",
      destination: "https://docs.smepay.io/docs/:path*",
    },
  ];
}
```

## 🧠 Key Takeaways
- **Dependency Isolation is Crucial**: In production environments, isolating conflicting dependencies is a much more robust solution than trying to patch them.
- **Proxying vs Redirecting**: I learned the difference between a redirect (where the URL visibly changes) and a rewrite/proxy (where the URL stays exactly the same, but the server fetches content from elsewhere behind the scenes).
- **Startups give interns real problems**: I successfully orchestrated a production-grade infrastructure deployment that real merchants will use. It was a massive confidence booster!

## 🔗 Related Project
The codebase is proprietary to SMEPay, so it cannot be shared here, but the architectural pattern I used is highly scalable.
