/**
 * database.js — Storage & Persistence Layer
 * 
 * This module is the SECOND stage of our data pipeline: Ingest & Store.
 * Pipeline: Source (api.js) → Ingest/Store (database.js) → Query → Present
 * 
 * ARCHITECTURE DECISION: Why SQL in the browser?
 * ================================================
 * 
 * We use THREE technologies together. Here's why each exists:
 * 
 * 1. sql.js (SQLite compiled to WebAssembly)
 *    - SQLite is the most widely deployed database in the world (billions of devices)
 *    - sql.js compiles the entire C codebase of SQLite into WebAssembly (WASM)
 *    - WASM runs at near-native speed inside the browser
 *    - This gives us a FULL relational database with SQL support — no server needed
 *    - Alternative: Just use JS arrays → but then no GROUP BY, no aggregation, no SQL practice
 *    - Alternative: Use a cloud database (Supabase) → adds complexity, auth, network dependency
 * 
 * 2. IndexedDB (browser's built-in key-value store)
 *    - sql.js runs SQLite entirely IN MEMORY — if you close the tab, data is gone
 *    - IndexedDB persists data across sessions (like localStorage but for large binary data)
 *    - We use it to store the entire SQLite database file as a binary blob
 *    - On page load: restore blob from IndexedDB → load into sql.js → full database restored
 *    - Think of IndexedDB as the "disk" and sql.js as the "database engine"
 * 
 * 3. The combination creates a pattern used by real companies:
 *    Memory database (fast queries) + Durable storage (survives restarts)
 *    This is the same pattern as Redis (in-memory) + disk persistence
 * 
 * DATA PIPELINE PATTERN:
 * ================================================
 * Every time we fetch from the API:
 *   1. Parse the JSON response (hourly arrays)
 *   2. For each hour: INSERT OR IGNORE into air_readings table
 *   3. "OR IGNORE" handles deduplication — if we already have that (city, reading_time), skip it
 *   4. Export the database to a binary array
 *   5. Save that binary to IndexedDB
 * 
 * This means our dataset GROWS over time. The longer you keep AeroIntel open,
 * the more data you collect, and the richer your SQL queries become.
 */

// IndexedDB configuration
const IDB_NAME = 'aerointel';
const IDB_VERSION = 1;
const IDB_STORE = 'database';
const IDB_KEY = 'sqlite-binary';

/**
 * AeroIntelDB — In-browser SQL database with persistence.
 * 
 * Usage:
 *   const db = new AeroIntelDB();
 *   await db.initialize();
 *   db.insertReadings('Dubai', 25.2, 55.3, apiResponse);
 *   const result = db.query('SELECT * FROM air_readings LIMIT 5');
 */
class AeroIntelDB {
    constructor() {
        /** @type {object|null} sql.js Database instance */
        this.db = null;
        /** @type {object|null} sql.js SQL module */
        this.SQL = null;
        /** @type {boolean} Whether the database has been initialized */
        this.ready = false;
    }

    /**
     * Initialize the database engine.
     * 
     * Steps:
     * 1. Load the sql.js WebAssembly module (downloads the .wasm binary)
     * 2. Try to restore a previously saved database from IndexedDB
     * 3. If no saved database exists, create a fresh one with our schema
     * 
     * @returns {Promise<void>}
     */
    async initialize() {
        // Step 1: Initialize the sql.js WASM module
        // This downloads the SQLite WASM binary (~1MB) from CDN
        this.SQL = await window.initSqlJs({
            locateFile: file =>
                `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
        });

        // Step 2: Try to restore from IndexedDB
        const savedData = await this._loadFromIndexedDB();

        if (savedData) {
            // Restore: create database from saved binary
            this.db = new this.SQL.Database(new Uint8Array(savedData));
            console.log('[DB] Restored database from IndexedDB');
        } else {
            // Fresh start: create empty database and schema
            this.db = new this.SQL.Database();
            this._createSchema();
            console.log('[DB] Created fresh database with schema');
        }

        this.ready = true;
    }

    /**
     * Create the database schema.
     * 
     * WHY this schema design?
     * - One row per (city, hour) — this is a time-series data model
     * - UNIQUE constraint on (city, reading_time) prevents duplicate entries
     * - Separate ingested_at timestamp tracks WHEN we stored the data vs WHEN it was measured
     * - Indexes on (city, reading_time) and (aqi_us) speed up our most common queries
     * 
     * In real data engineering, schema design is one of the most important decisions.
     * A bad schema makes queries slow or impossible. A good schema anticipates
     * the questions you'll want to ask.
     */
    _createSchema() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS air_readings (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                city            TEXT    NOT NULL,
                latitude        REAL    NOT NULL,
                longitude       REAL    NOT NULL,
                pm2_5           REAL,
                pm10            REAL,
                ozone           REAL,
                nitrogen_dioxide REAL,
                sulphur_dioxide REAL,
                carbon_monoxide REAL,
                dust            REAL,
                uv_index        REAL,
                aqi_eu          INTEGER,
                aqi_us          INTEGER,
                reading_time    TEXT    NOT NULL,
                ingested_at     TEXT    DEFAULT (datetime('now')),
                UNIQUE(city, reading_time)
            );
        `);

        // Indexes: tell SQLite to build lookup structures for fast queries.
        // Without an index, SELECT WHERE city='Dubai' would scan EVERY row.
        // With an index, it jumps directly to Dubai rows — O(log n) vs O(n).
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_city_time ON air_readings(city, reading_time);`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_aqi ON air_readings(aqi_us);`);
    }

    /**
     * Insert hourly readings from an API response into the database.
     * 
     * This is the INGEST step of the data pipeline.
     * 
     * Key design decision: INSERT OR IGNORE
     * - If a row with the same (city, reading_time) already exists, skip it
     * - This makes our pipeline IDEMPOTENT: running it twice doesn't create duplicates
     * - Idempotency is a critical data engineering principle — it means your pipeline
     *   is safe to retry on failure without corrupting data
     * 
     * @param {string} city - City name
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {object} apiData - Raw API response from Open-Meteo
     * @returns {number} Number of new rows inserted
     */
    insertReadings(city, lat, lon, apiData) {
        const hourly = apiData.hourly;
        if (!hourly || !hourly.time) return 0;

        const times = hourly.time;

        // Prepared statement: compiles the SQL once, executes it many times with different data.
        // This is faster than building a new SQL string for each row.
        // It also prevents SQL injection (a security concept you'll learn more about later).
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO air_readings
                (city, latitude, longitude, pm2_5, pm10, ozone, nitrogen_dioxide,
                 sulphur_dioxide, carbon_monoxide, dust, uv_index, aqi_eu, aqi_us, reading_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let inserted = 0;

        for (let i = 0; i < times.length; i++) {
            // Skip future timestamps that don't have data yet
            if (hourly.us_aqi[i] == null && hourly.pm2_5[i] == null) continue;

            try {
                stmt.run([
                    city, lat, lon,
                    hourly.pm2_5?.[i]             ?? null,
                    hourly.pm10?.[i]              ?? null,
                    hourly.ozone?.[i]             ?? null,
                    hourly.nitrogen_dioxide?.[i]  ?? null,
                    hourly.sulphur_dioxide?.[i]   ?? null,
                    hourly.carbon_monoxide?.[i]   ?? null,
                    hourly.dust?.[i]              ?? null,
                    hourly.uv_index?.[i]          ?? null,
                    hourly.european_aqi?.[i]      ?? null,
                    hourly.us_aqi?.[i]            ?? null,
                    times[i],
                ]);
                inserted++;
            } catch (e) {
                // UNIQUE constraint violation → duplicate, silently skip
            }
        }

        stmt.free(); // Release the prepared statement

        // Persist to IndexedDB after every batch insert
        this._saveToIndexedDB();

        console.log(`[DB] Inserted ${inserted} new readings for ${city}`);
        return inserted;
    }

    /**
     * Execute an arbitrary SQL query.
     * 
     * This powers the SQL Console — users can type any SQL and run it
     * against the collected data.
     * 
     * @param {string} sql - SQL query string
     * @returns {object} { columns: string[], rows: any[][] } or { error: string }
     */
    query(sql) {
        try {
            const start = performance.now();
            const results = this.db.exec(sql);
            const elapsed = (performance.now() - start).toFixed(1);

            if (results.length === 0) {
                return {
                    columns: [],
                    rows: [],
                    elapsed,
                    message: 'Query executed successfully. No rows returned.',
                };
            }

            return {
                columns: results[0].columns,
                rows: results[0].values,
                elapsed,
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    /**
     * Get pipeline statistics — used by the metrics strip.
     * 
     * @returns {object} { total, cities, earliest, latest }
     */
    getStats() {
        try {
            const result = this.db.exec(`
                SELECT
                    COUNT(*)             AS total_readings,
                    COUNT(DISTINCT city) AS city_count,
                    MIN(reading_time)    AS earliest,
                    MAX(reading_time)    AS latest
                FROM air_readings
            `);

            if (result.length === 0 || result[0].values[0][0] === 0) {
                return { total: 0, cities: 0, earliest: null, latest: null };
            }

            const row = result[0].values[0];
            return {
                total: row[0],
                cities: row[1],
                earliest: row[2],
                latest: row[3],
            };
        } catch (e) {
            return { total: 0, cities: 0, earliest: null, latest: null };
        }
    }

    /**
     * Get time-series data for a specific city and pollutant.
     * Used by the chart component.
     * 
     * @param {string} city - City name
     * @param {string} pollutant - Column name (e.g., 'pm2_5')
     * @returns {object} { times: string[], values: number[] }
     */
    getTimeSeries(city, pollutant) {
        // Whitelist pollutant names to prevent SQL injection
        const allowed = ['pm2_5', 'pm10', 'ozone', 'nitrogen_dioxide', 'sulphur_dioxide', 'carbon_monoxide', 'dust', 'uv_index', 'aqi_us', 'aqi_eu'];
        if (!allowed.includes(pollutant)) {
            return { times: [], values: [] };
        }

        try {
            const result = this.db.exec(`
                SELECT reading_time, ${pollutant}
                FROM air_readings
                WHERE city = '${city.replace(/'/g, "''")}'
                  AND ${pollutant} IS NOT NULL
                ORDER BY reading_time ASC
            `);

            if (result.length === 0) return { times: [], values: [] };

            return {
                times: result[0].values.map(r => r[0]),
                values: result[0].values.map(r => r[1]),
            };
        } catch (e) {
            console.error('[DB] Time series query error:', e);
            return { times: [], values: [] };
        }
    }

    // =============================================
    // IndexedDB Persistence
    // =============================================

    /**
     * Save the current SQLite database to IndexedDB.
     * 
     * How it works:
     * 1. db.export() converts the in-memory database to a Uint8Array (binary blob)
     * 2. We store that blob in IndexedDB
     * 3. On next page load, we read the blob back and pass it to new SQL.Database()
     * 
     * This is conceptually identical to a database writing to disk after a transaction.
     * In production systems, this is called "checkpointing" or "write-ahead logging."
     */
    async _saveToIndexedDB() {
        try {
            const data = this.db.export(); // Returns Uint8Array
            const buffer = data.buffer;    // Get the underlying ArrayBuffer

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(IDB_NAME, IDB_VERSION);

                request.onupgradeneeded = (event) => {
                    const idb = event.target.result;
                    if (!idb.objectStoreNames.contains(IDB_STORE)) {
                        idb.createObjectStore(IDB_STORE);
                    }
                };

                request.onsuccess = (event) => {
                    const idb = event.target.result;
                    const tx = idb.transaction(IDB_STORE, 'readwrite');
                    tx.objectStore(IDB_STORE).put(buffer, IDB_KEY);
                    tx.oncomplete = () => {
                        console.log('[DB] Saved to IndexedDB');
                        resolve();
                    };
                    tx.onerror = () => reject(tx.error);
                };

                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error('[DB] IndexedDB save error:', e);
        }
    }

    /**
     * Load a previously saved database from IndexedDB.
     * 
     * @returns {Promise<ArrayBuffer|null>} The database binary, or null if none exists
     */
    async _loadFromIndexedDB() {
        return new Promise((resolve) => {
            const request = indexedDB.open(IDB_NAME, IDB_VERSION);

            request.onupgradeneeded = (event) => {
                const idb = event.target.result;
                if (!idb.objectStoreNames.contains(IDB_STORE)) {
                    idb.createObjectStore(IDB_STORE);
                }
            };

            request.onsuccess = (event) => {
                const idb = event.target.result;
                const tx = idb.transaction(IDB_STORE, 'readonly');
                const getReq = tx.objectStore(IDB_STORE).get(IDB_KEY);
                getReq.onsuccess = () => resolve(getReq.result || null);
                getReq.onerror = () => resolve(null);
            };

            request.onerror = () => resolve(null);
        });
    }
}

export { AeroIntelDB };
