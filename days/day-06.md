# Day 6 — Advanced Statistical Analytics & Human Decisions Layer

**Date**: June 10, 2026  
**Focus**: Statistical modeling, SMAs, rolling volatility (stddev), OLS linear regression forecasting, Z-score outlier detection, Pearson correlation matrix, CSS grid heatmap, interactive SQL console, and Human Insights recommendations.  
**Type**: 🧠 Learning + 🔨 Building

---

## 🎯 Learning Objective

Apply advanced mathematical and statistical models directly on local relational data, visualize pollutant correlations dynamically, implement telemetry management (city addition/removal), and build a "Human Insights" product layer to translate statistical summaries into everyday lifestyle choices.

---

## 🧠 What I Learned

### Statistical Signal Processing in JavaScript
- **Simple Moving Average (SMA)** Smooths high-frequency sensor noise to reveal underlying environmental trends.
- **Rolling Volatility**: Tracks dispersion using standard deviation. Applied Bessel's correction ($N-1$) to prevent sample variance bias.
- **Z-Score Outlier Detection**: Compares readings to their rolling averages. Data points exceeding $|Z| > 2$ are flagged as anomalies.
- **Ordinary Least Squares (OLS) Linear Regression**: Fits $y = mx + c$ over a 24-hour timeline to project future trends.
- **Pearson Correlation ($r$)**: Normalizes the covariance of two variables between $[-1, +1]$ to analyze if pollutants share emission profiles.

### Human-Centered Product Design
- Recruiters and users value decisions, not just raw telemetry. Translating a raw PM2.5 value into a running or window ventilation warning changes a project from an engineering dashboard into a valuable product.

---

## ✅ What I Did

- [x] **Mathematical Modeling**: Implemented SMA, Volatility (stddev), Z-score outliers, OLS regression, and Pearson correlation in `analytics.js`.
- [x] **Visual Canvas Overlays**: Upgraded `charts.js` to render SMA overlays, dashed forecast projections, and anomaly dots with multi-series tooltips.
- [x] **Pearson Heatmap Matrix**: Built a 6x6 pollutant correlation matrix styled using CSS Grid. Added dynamic cell background shading and interactive descriptions (titration, nested particulates).
- [x] **Interactive SQL REPL Console**: Created a SQL playground console with preloaded examples (Peak hours, city averages) and CSV data exporters.
- [x] **Telemetry Control**: Implemented geocoding deduplication checks and card deletion triggers with fallback city routing.
- [x] **Human Decisions & Lifestyle Insights**:
  - Designed today's recommendation card, showing guidelines (Running, Cycling, Play, Ventilation) based on live AQI and forecast trends.
  - Added Today's Air Quality Leaderboard (sorted cleanest to dirtiest).
  - Programmed observations analyzing cleanest/dirtiest ratios, fastest-improving cities, and volatility spikes.

---

## 💡 Key Takeaways

1. **Aesthetics and product narratives build trust**: A clean interface with human recommendations makes data accessible to everyone.
2. **Robust error boundaries keep UIs active**: Canvas color engines can be fragile; wrapping calculations and layout additions in safety checks is essential.

---

## 🔗 Resources

- [Pearson Correlation Coefficient - Wikipedia](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient)
- [Ordinary Least Squares - Wikipedia](https://en.wikipedia.org/wiki/Ordinary_least_squares)
- [HTML5 Canvas 2D Context API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)

---

## 📣 LinkedIn Post Draft

> **Day 6 of my 30-Day Builder Journey** 🚀
> 
> Today, I turned **AeroIntel** from a statistics dashboard into a **Human-Centered Environmental Decision Platform**!
> 
> Data is only useful if it helps people make choices. Today, I added a statistics and human decisions layer:
> 
> 🧮 **Analytics Engine**: Coded SMA filters, rolling standard deviations (volatility), and rolling Z-score anomaly markers.
> 
> 🔮 **Linear Regression Forecasting**: Fit OLS regression models to project pollutant trends 6 hours into the future.
> 
> 🎛️ **Pearson Correlation Heatmap**: Designed an interactive 6x6 CSS Grid heatmap comparing pollutant co-variances with detailed chemical diagnostic notes.
> 
> 🌅 **Decision Support Layer**: Designed a dynamic "Today's Recommendations" widget. It translates live AQI and forecast trends into badges for Running, Cycling, Play, and Ventilation, alongside a live leaderboard and comparative observations.
> 
> This wrap-up marks the completion of the AeroIntel MVP! All code, architecture docs, and interview prep guides are pushed to GitHub.
> 
> Live project: https://sohansanil.github.io/30-day-builder/projects/aerointel/
> 
> #BuildInPublic #DataScience #DataEngineering #MachineLearning #AeroIntel #HTML5Canvas #Statistics #WebDev #PlacementPrep
