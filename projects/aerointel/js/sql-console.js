/**
 * sql-console.js — Interactive SQL REPL
 * 
 * WHY an interactive SQL console?
 * 
 * Most student projects display pre-defined visualizations. They answer questions
 * the developer chose in advance. An SQL console lets the USER ask their own questions.
 * 
 * This is the difference between a dashboard and a data platform:
 * - Dashboard: "Here are 5 charts I chose for you"
 * - Data platform: "Here are 5 charts + a query engine. Ask anything."
 * 
 * Real-world parallels:
 * - Google BigQuery console
 * - AWS Athena query editor
 * - Jupyter notebooks with SQL cells
 * - Metabase / Redash / Superset (BI tools)
 * 
 * The example queries serve as templates — they teach SQL syntax while
 * being directly useful for exploring the air quality data.
 */

/**
 * Pre-loaded example queries.
 * 
 * These are designed to teach SQL concepts progressively:
 * 1. SELECT * → See raw data
 * 2. COUNT + GROUP BY → Aggregation
 * 3. WHERE + ORDER BY → Filtering and sorting
 * 4. AVG + ROUND → Statistical functions
 * 5. Complex filtering → Combining conditions
 */
const EXAMPLE_QUERIES = [
    {
        label: 'Latest readings',
        sql: `SELECT city, reading_time, aqi_us, pm2_5, ozone
FROM air_readings
ORDER BY reading_time DESC
LIMIT 10;`,
    },
    {
        label: 'Avg AQI by city',
        sql: `SELECT city,
  ROUND(AVG(aqi_us), 1) AS avg_aqi,
  ROUND(AVG(pm2_5), 1) AS avg_pm25,
  COUNT(*) AS readings
FROM air_readings
GROUP BY city
ORDER BY avg_aqi DESC;`,
    },
    {
        label: 'Unhealthy hours',
        sql: `SELECT city, reading_time, aqi_us,
  ROUND(pm2_5, 1) AS pm25,
  ROUND(ozone, 1) AS o3
FROM air_readings
WHERE aqi_us > 100
ORDER BY aqi_us DESC;`,
    },
    {
        label: 'Peak PM2.5',
        sql: `SELECT city,
  MAX(pm2_5) AS peak_pm25,
  reading_time AS peak_time
FROM air_readings
WHERE pm2_5 IS NOT NULL
GROUP BY city
ORDER BY peak_pm25 DESC;`,
    },
    {
        label: 'Hourly pattern',
        sql: `SELECT
  SUBSTR(reading_time, 12, 5) AS hour,
  ROUND(AVG(pm2_5), 1) AS avg_pm25,
  ROUND(AVG(ozone), 1) AS avg_o3
FROM air_readings
GROUP BY hour
ORDER BY hour;`,
    },
    {
        label: 'Row count',
        sql: `SELECT COUNT(*) AS total_readings,
  COUNT(DISTINCT city) AS cities,
  MIN(reading_time) AS earliest,
  MAX(reading_time) AS latest
FROM air_readings;`,
    },
];

/**
 * Initialize the SQL Console UI.
 * 
 * Sets up:
 * - Example query buttons
 * - Textarea input
 * - Run button + keyboard shortcut
 * - Results table rendering
 * 
 * @param {AeroIntelDB} db - The database instance to query against
 */
function initSQLConsole(db) {
    const input = document.getElementById('sql-input');
    const runBtn = document.getElementById('sql-run');
    const resultsDiv = document.getElementById('sql-results');
    const resultsMeta = document.getElementById('sql-results-meta');
    const examplesDiv = document.getElementById('sql-examples');

    if (!input || !runBtn || !resultsDiv || !examplesDiv) {
        console.warn('[SQL Console] Missing DOM elements');
        return;
    }

    // ---- Render Example Query Buttons ----
    examplesDiv.innerHTML = EXAMPLE_QUERIES.map((ex, i) =>
        `<button class="sql-example-btn" data-index="${i}" title="${ex.sql.split('\n')[0]}">${ex.label}</button>`
    ).join('');

    // Click handler for example buttons
    examplesDiv.addEventListener('click', (e) => {
        const btn = e.target.closest('.sql-example-btn');
        if (!btn) return;
        const index = parseInt(btn.dataset.index, 10);
        input.value = EXAMPLE_QUERIES[index].sql;
        input.focus();
    });

    let lastResult = null;

    // ---- Run Query ----
    function runQuery() {
        const sql = input.value.trim();
        if (!sql) return;

        const result = db.query(sql);
        lastResult = result;

        if (result.error) {
            resultsDiv.innerHTML = `<div class="sql-error">❌ ${escapeHtml(result.error)}</div>`;
            resultsMeta.textContent = '';
            return;
        }

        if (result.rows.length === 0) {
            resultsDiv.innerHTML = `<p class="sql-placeholder">${escapeHtml(result.message || 'No rows returned.')}</p>`;
            resultsMeta.textContent = `✓ Executed in ${result.elapsed}ms`;
            return;
        }

        // Build results table
        const headerCells = result.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('');
        const bodyRows = result.rows.map(row => {
            const cells = row.map(val => {
                const display = val == null ? '<span style="opacity:0.3">NULL</span>' : escapeHtml(String(val));
                return `<td>${display}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        resultsDiv.innerHTML = `
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${bodyRows}</tbody>
            </table>
        `;

        resultsMeta.textContent = `✓ ${result.rows.length} row${result.rows.length !== 1 ? 's' : ''} · ${result.elapsed}ms`;
    }

    // Run button click
    runBtn.addEventListener('click', runQuery);

    // Export button click
    document.getElementById('sql-export')?.addEventListener('click', () => {
        if (!lastResult || lastResult.error || !lastResult.rows || lastResult.rows.length === 0) {
            alert("No query results to export. Run a successful query first.");
            return;
        }
        
        const csvRows = [lastResult.columns.join(",")];
        for (const row of lastResult.rows) {
            const rowStr = row.map(val => {
                if (val == null) return "";
                const str = String(val);
                if (str.includes(",") || str.includes("\n") || str.includes('"')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(",");
            csvRows.push(rowStr);
        }
        
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `aerointel_query_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Keyboard shortcut: Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    input.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            runQuery();
        }
    });

    // Tab key inserts spaces instead of moving focus (better for code editing)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.substring(0, start) + '  ' + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start + 2;
        }
    });
}

/**
 * Escape HTML entities to prevent XSS.
 * Even though we control the data, it's good practice to escape
 * any dynamic content rendered to the DOM.
 * 
 * @param {string} str - Raw string
 * @returns {string} HTML-safe string
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export { initSQLConsole };
