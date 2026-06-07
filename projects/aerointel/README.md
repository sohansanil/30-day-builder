# AeroIntel — Environmental Decision Platform

AeroIntel is an advanced, client-side Air Quality Intelligence and Decision Support platform. Designed from a product-first data science perspective, it translates raw, high-frequency atmospheric measurements into actionable daily life recommendations.

Instead of just presenting statistics, AeroIntel answers the ultimate user question: **"What does today's air quality actually mean for me?"**

---

## Key Product Features

### 1. 🌅 Human Decisions & Lifestyle Insights
*   **Actionable Activity Badges**: Dynamically evaluates live AQI levels and forecast regression trends to provide recommendations for Running & Workouts, Cycling & Commuting, Children's Play, and Window Ventilation.
*   **Health Classifications**: Clear badges color-coded based on the EPA's Air Quality Index scale (Good 🌿, Moderate 🌤️, Sensitive Groups ⚠️, Unhealthy 😷, Very Unhealthy 🚨, Hazardous 💀).

### 2. 📊 Advanced Statistical Analytics
*   **Simple Moving Averages (SMA)**: Features 5-hour (fast) and 20-hour (slow) SMAs overlaying raw timelines to smooth high-frequency environmental noise.
*   **Rolling Volatility (Standard Deviation)**: Tracks 24-hour sample standard deviation using Bessel's Correction ($N-1$) to represent atmospheric dispersion dynamics.
*   **Z-Score Anomaly Detection**: Automatically flags statistical outliers ($|Z| > 2.0$ for moderate, $|Z| > 3.0$ for severe anomalies) with circular chart plot markers.
*   **Ordinary Least Squares (OLS) Linear Regression**: Projects a 6-hour predictive trajectory line for the selected pollutant based on historical data.

### 3. 🔬 Multi-Variable Interaction
*   **Pearson Correlation Heatmap**: Displays a 6x6 correlation matrix comparing PM2.5, PM10, Ozone, NO₂, SO₂, and CO.
*   **Dynamic Cell Coloring**: Visualizes Pearson coefficients ($r \in [-1, +1]$) using dynamic opacities (orange/red for direct, blue/teal for inverse correlations).
*   **Interactive Diagnostic Insights**: Clicking cells generates chemical emission profiles (e.g. explaining vehicle exhaust association or O₃ photochemistry titration cycles).

### 4. 🎛️ Telemetry Control & Data console
*   **Geocoding Search & Add**: Add any city globally with responsive debounce limits and coordinate-based deduplication guards.
*   **Remove City**: Delete cities from tracking with automatic selected-city fallback routing and a 1-city minimum guard.
*   **Data Console**: A fully functional SQL REPL with pre-loaded example queries (aggregations, peak hours, averages) to query historical database tables.
*   **CSV Exports**: Separate export utilities to download historical city timelines and active SQL query tables.

---

## Engineering & Pipeline Architecture

AeroIntel operates on a client-side **4-stage time-series data pipeline**:

```
[ Ingest (api.js) ] ──> [ Store (database.js) ] ──> [ Analyze (analytics.js) ] ──> [ Present (charts.js, app.js) ]
```

1.  **Ingest (`api.js`)**: Fetches hourly timeline data asynchronously from Open-Meteo's environmental api.
2.  **Store (`database.js`)**: Restores and writes binary databases using SQLite compiled to WebAssembly (`sql.js`). Persists binary blobs locally to IndexedDB across browser refreshes. Uses `INSERT OR IGNORE` for idempotent writes.
3.  **Analyze (`analytics.js`)**: Computes statistical SMAs, standard deviations, OLS regression coefficients, Z-scores, and Pearson matrix calculations.
4.  **Present (`charts.js`, `app.js`)**: High-DPI canvas charts with custom grid mapping and multi-series hover tooltips, and interactive CSS grid elements.

---

## Setup & Running Locally

Since AeroIntel is built with vanilla HTML5, CSS3, and JavaScript, it requires **zero external framework installations** or node dependencies. 

Because it uses WebAssembly (`sql.js` WASM), the application must be served from an HTTP context rather than opened directly as a file.

1.  Clone the repository.
2.  Start a local HTTP server in the repository root directory:
    ```bash
    # Python 3
    python3 -m http.server 8081
    
    # Node.js
    npx http-server -p 8081
    ```
3.  Open your browser and navigate to `http://localhost:8081/projects/aerointel/`.
