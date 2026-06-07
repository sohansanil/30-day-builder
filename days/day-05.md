# Day 5 — In-Browser SQL Databases & Core Ingestion Pipelines

**Date**: June 9, 2026  
**Focus**: In-browser SQL, WebAssembly, IndexedDB persistence, Open-Meteo REST API, and core timeline charts.  
**Type**: 🧠 Learning + 🔨 Building

---

## 🎯 Learning Objective

Understand how to run a relational SQL database entirely inside the browser using SQLite compiled to WebAssembly (`sql.js`), persist binary assets across sessions using IndexedDB, build asynchronous API ingestion queues, and construct the foundation of the AeroIntel dashboard.

---

## 🧠 What I Learned

### WebAssembly (WASM) & sql.js
- **WASM**: A binary instruction format that allows languages like C, C++, or Rust to run at near-native speeds inside browser engines.
- **sql.js**: The entire C engine of SQLite compiled into WebAssembly. This brings a complete relational database to the client-side, enabling full SQL executions without a remote database server.

### Browser persistence: IndexedDB vs. LocalStorage
- **LocalStorage**: Synchronous, text-only, and strictly limited to 5MB. Unsuitable for storing binary file buffers.
- **IndexedDB**: Asynchronous transactional database built into browsers. It supports binary data (blobs/ArrayBuffers), allowing us to store and load the SQLite database file buffer directly.

### Data Ingest Idempotency
- Storing time-series data requires deduplication. By applying a `UNIQUE(city, reading_time)` constraint in the schema and querying with `INSERT OR IGNORE`, the data pipeline becomes **idempotent** (safely repeatable without duplicate rows).

---

## ✅ What I Did

- [x] **Initialized SQLite WASM**: Loaded `sql.js` from CDN and set up the `AeroIntelDB` engine.
- [x] **Built IndexedDB persistence**: Wrote binary export/import systems to sync SQLite memory to browser storage on every write.
- [x] **Ingested Open-Meteo API**: Implemented asynchronous fetch routines in `api.js` retrieving hourly pollutant measurements.
- [x] **Designed Core Dashboard**:
  - Populated city cards with flag emojis, real-time US AQI calculations, and health classification labels.
  - Drew a 24-hour Canvas trend timeline showing historical PM2.5 concentrations and the WHO safety limit.
  - Wired auto-refresh counters that trigger data re-runs every 5 minutes.

---

## 💡 Key Takeaways

1. **Relational local storage simplifies analytics**: Running SQL in-browser allows data science students to apply standard grouping and queries directly on live collections.
2. **Persistence links sessions**: Combining volatile memory databases with IndexedDB mimics server-side memory caching + disk storage designs.

---

## 🔗 Resources

- [sql.js WebAssembly Library](https://sql.js.org/)
- [IndexedDB MDN Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Open-Meteo Air Quality API](https://open-meteo.com/)

---

## 📣 LinkedIn Post Draft

> **Day 5 of my 30-Day Builder Journey** 🚀
> 
> Today, I built the foundation of **AeroIntel**, an Air Quality Intelligence dashboard that runs a relational SQL database entirely in the browser!
> 
> In-browser databases are usually simple arrays. I wanted to build something more robust. Here is the architecture I implemented:
> 
> ⚙️ **WebAssembly SQLite**: Loaded `sql.js` (SQLite compiled to WASM) to run a local SQL query engine.
> 
> 💾 **IndexedDB Durability**: Because WASM SQLite operates in volatile memory, I wrote serialization routines to save and restore the database binary file to the browser's IndexedDB, keeping data intact across browser refreshes.
> 
> 🌀 **Asynchronous Ingestion**: Built a time-series pipeline fetching hourly reports from the Open-Meteo API, using `INSERT OR IGNORE` to guarantee idempotent, duplicate-free writes.
> 
> 📊 **Canvas Visuals**: Designed an interactive 24-hour timeline chart and city overview cards comparing local pollutants directly to WHO safety thresholds.
> 
> #BuildInPublic #WebAssembly #SQLite #IndexedDB #DataScience #AeroIntel #OpenMeteo #WebDev #DataPipelines
