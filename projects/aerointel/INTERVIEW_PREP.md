# AeroIntel — Interview Preparation & Technical Design Document

This document prepares you for technical interviews, outlining the design choices, architectural tradeoffs, and engineering justifications behind AeroIntel.

---

## 1. Core Technology Decisions & Rationales

### Decision 1: SQLite WebAssembly (`sql.js`) instead of Standard JavaScript Arrays
*   **The "Why"**: Storing data in raw JavaScript arrays is simple, but limits querying capabilities. By implementing a relational database inside the browser using WebAssembly (`sql.js`), we gain access to SQL features like `GROUP BY`, `ORDER BY`, and aggregations.
*   **Interview Hook**: *"I chose SQL in the browser to turn the application into a queryable data platform. This allows users to write their own custom queries in the REPL console, which is the difference between a static dashboard and a database tool."*

### Decision 2: IndexedDB instead of LocalStorage for SQL Persistence
*   **The "Why"**: WebAssembly SQLite operates entirely in the browser's volatile memory; refreshing the page wipes the database. LocalStorage is synchronous, string-only, and capped at 5MB. IndexedDB is asynchronous, supports large binary data (blobs), and allows us to store the entire SQLite binary database file directly as a single serialized ArrayBuffer.
*   **Interview Hook**: *"We combine an in-memory SQL database (for fast sub-millisecond queries) with an IndexedDB storage layer (the durable disk). Every time data is fetched, the serialized database is saved to IndexedDB, achieving full persistence across browser restarts."*

### Decision 3: Vanilla HTML5 Canvas API instead of Chart.js or D3.js
*   **The "Why"**: Bringing in heavy visualization libraries adds size and black-box dependencies. Building the charts from scratch using the Canvas API shows a deep understanding of scaling mathematics, rendering cycles, device pixel ratio adjustments, and custom vector drawing.
*   **Interview Hook**: *"Instead of configuring a charting library, I wrote the rendering logic myself using the Canvas API. This required mapping data coordinates to pixel boundaries, handling high-DPI scaling, and designing custom drawing algorithms for regression projections, SMAs, and tooltips."*

---

## 2. Alternatives & Tradeoffs

| Technology | Alternative Considered | Tradeoffs & Justifications |
| :--- | :--- | :--- |
| **Storage** | Cloud Database (e.g. Supabase, Firebase) | **Alternative**: Direct API writes to the cloud.<br>**Tradeoff**: Requires authentication, API keys, and has network latency. In-browser SQL is zero-cost, serverless, offline-first, and runs instantly with zero configuration. |
| **Charts** | Chart.js / Recharts | **Alternative**: Standard npm packages.<br>**Tradeoff**: Easier setup but adds bundle size. Canvas vector rendering allows complete design control (e.g. customized dashed forecast extensions and hover overlays). |
| **Logic** | Client-Side Math in JS | **Alternative**: Server-side math functions in SQL.<br>**Tradeoff**: Standard WebAssembly SQLite builds do not compile advanced mathematical packages (`SQRT`, `STDDEV`). Thus, we retrieve the raw values and run the statistics layer (Standard Deviation, OLS, Pearson) in JavaScript. |

---

## 3. Anticipated Interview Questions & Answers

### Q1: "Why use SQL in the browser when the data originates from a JSON API?"
> **Answer**: Ingesting JSON is only step 1. In real-world data science, we collect data over time. By writing JSON readings to SQL using an `INSERT OR IGNORE` command, we build an incremental, deduplicated historical repository. This allows us to perform aggregate time-series analysis (e.g. calculating rolling averages or standard deviations over days of accumulated telemetry) that the single-day JSON API doesn't support.

### Q2: "How did you scale the Canvas charts for High-DPI (Retina) screens?"
> **Answer**: Standard Canvas rendering looks blurry on Retina screens. We solved this by scaling the canvas coordinate dimensions by the device pixel ratio (`window.devicePixelRatio`) while keeping its CSS display bounds constant, and then calling `ctx.scale(dpr, dpr)`. This keeps vector strokes and font rendering sharp on all screens.

### Q3: "What happens if a user adds 50 cities? Will the database crash?"
> **Answer**: WebAssembly SQLite can easily handle millions of rows in memory. However, since the database is serialized and saved to IndexedDB on every API write, exporting a large database file (~20MB+) can block the main JavaScript thread. For production scaling, we would offload the SQLite serialization and IndexedDB operations to a **Web Worker thread** so the UI never stutters.

---

## 4. Future System Enhancements

If you are asked how you would scale the project:
1.  **Web Workers**: Offload SQLite serialization and calculations to a background thread to prevent UI freezing.
2.  **Database Partitioning**: Implement a data retention policy (e.g. purging database readings older than 30 days) to keep the IndexedDB payload lightweight.
3.  **Real-Time Subscriptions**: Replace 5-minute polling with WebSockets to receive live sensor warnings.
