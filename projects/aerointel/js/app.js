/**
 * app.js — Main Orchestrator
 * 
 * This is the BRAIN of AeroIntel. It coordinates all other modules:
 * 
 * Pipeline Flow:
 * ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 * │  api.js     │ →  │ database.js │ →  │ analytics.js│ →  │ charts.js   │
 * │  (Source)   │    │ (Store)     │    │ (Analyze)   │    │ (Present)   │
 * └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
 *       ↑                                                        │
 *       └────────── Auto-refresh (every 5 min) ──────────────────┘
 * 
 * State Management:
 * Instead of scattering data across DOM elements, we maintain a central
 * state object. When state changes, we re-render the affected components.
 * This is the same pattern you'll use later in React (useState/useReducer).
 */

import { PRESET_CITIES, fetchAirQuality, searchCities, getLatestReading } from './api.js';
import { AeroIntelDB } from './database.js';
import { classifyAQI, WHO_THRESHOLDS, getPollutantStatus, getPollutantBarColor, getPollutantKeys } from './analytics.js';
import { TimeSeriesChart } from './charts.js';
import { initSQLConsole } from './sql-console.js';

// =============================================
// Application State
// =============================================

const state = {
    /** @type {Array} Cities being monitored */
    cities: [...PRESET_CITIES],
    /** @type {Map<string, object>} Latest API response per city */
    currentData: new Map(),
    /** @type {AeroIntelDB|null} Database instance */
    db: null,
    /** @type {TimeSeriesChart|null} Chart instance */
    chart: null,
    /** @type {string|null} Currently selected city (for chart + breakdown) */
    selectedCity: null,
    /** @type {string} Currently selected pollutant */
    selectedPollutant: 'pm2_5',
    /** @type {number} Auto-refresh interval in ms (5 minutes) */
    refreshInterval: 300_000,
    /** @type {number|null} Countdown timer ID */
    countdownTimer: null,
    /** @type {number} Seconds until next refresh */
    countdownSeconds: 300,
    /** @type {boolean} Whether a refresh is in progress */
    isRefreshing: false,
};


// =============================================
// Initialization
// =============================================

/**
 * Boot sequence — runs when the page loads.
 * 
 * This follows a specific order because of dependencies:
 * 1. Database must initialize BEFORE we can store data
 * 2. Chart must initialize BEFORE we can render visualizations
 * 3. SQL console must initialize AFTER database is ready
 * 4. Data fetch happens AFTER everything is ready to receive data
 */
async function init() {
    try {
        // Step 1: Initialize the database engine
        updatePipelineStatus('Loading database engine...', 'fetching');
        state.db = new AeroIntelDB();
        await state.db.initialize();
        updatePipelineStatus('Database ready', 'fetching');

        // Step 2: Initialize the chart
        const canvas = document.getElementById('timeseries-chart');
        if (canvas) {
            state.chart = new TimeSeriesChart(canvas);
        }

        // Step 3: Initialize the SQL console
        initSQLConsole(state.db);

        // Step 4: Setup UI event listeners
        setupEventListeners();

        // Step 5: Fetch data for all cities
        await refreshAllCities();

        // Step 6: Start auto-refresh countdown
        startAutoRefresh();

        // Step 7: Apply saved theme
        applySavedTheme();

    } catch (error) {
        console.error('[App] Initialization failed:', error);
        updatePipelineStatus('Error: ' + error.message, 'error');
    }
}


// =============================================
// Data Pipeline: Fetch → Store → Render
// =============================================

/**
 * Refresh data for all monitored cities.
 * 
 * This is the main pipeline trigger. It:
 * 1. Fetches fresh data from the API for each city (in parallel)
 * 2. Stores the data in SQLite
 * 3. Re-renders all visual components
 * 
 * Promise.allSettled is used instead of Promise.all because
 * we want partial success: if Mumbai's API call fails, we still
 * want Dubai, London, etc. to display. This is a resilience pattern
 * used in production data pipelines.
 */
async function refreshAllCities() {
    if (state.isRefreshing) return;
    state.isRefreshing = true;

    updatePipelineStatus('Fetching data...', 'fetching');
    setRefreshButtonState(true);

    const results = await Promise.allSettled(
        state.cities.map(async (city) => {
            const data = await fetchAirQuality(city.lat, city.lon);
            state.currentData.set(city.name, data);
            const inserted = state.db.insertReadings(city.name, city.lat, city.lon, data);
            return { city: city.name, inserted };
        })
    );

    // Log results
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`[Pipeline] Fetched ${succeeded}/${state.cities.length} cities (${failed} failed)`);

    // Render all components
    renderCityCards();
    updateChartSelectors();
    if (!state.selectedCity && state.cities.length > 0) {
        state.selectedCity = state.cities[0].name;
    }
    renderChart();
    renderPollutantBreakdown();
    updateMetrics();

    updatePipelineStatus('Ready', 'ready');
    setRefreshButtonState(false);
    state.isRefreshing = false;
}


// =============================================
// City Cards
// =============================================

/**
 * Render city overview cards.
 * 
 * Each card transforms raw API data into a health assessment:
 * - AQI value → Color-coded badge with health classification
 * - Individual pollutants → Mini-bars with WHO threshold comparison
 * - Health advisory → Plain language recommendation
 * 
 * This is "data → insight → decision" in a visual format.
 */
function renderCityCards() {
    const grid = document.getElementById('city-grid');
    if (!grid) return;

    // Remove loading state
    const loading = document.getElementById('city-loading');
    if (loading) loading.remove();

    grid.innerHTML = state.cities.map((city, index) => {
        const apiData = state.currentData.get(city.name);
        if (!apiData) {
            return `
                <div class="city-card" data-city="${city.name}" style="animation-delay: ${index * 60}ms">
                    <div class="city-card-header">
                        <div>
                            <div class="city-name">${city.flag} ${city.name}</div>
                            <div class="city-country">${city.country}</div>
                        </div>
                    </div>
                    <div class="city-advisory">Unable to load data. Will retry on next refresh.</div>
                </div>
            `;
        }

        const latest = getLatestReading(apiData);
        if (!latest) return '';

        const aqiClassification = classifyAQI(latest.aqi_us);

        // Build pollutant mini-bars
        const pollutantKeys = ['pm2_5', 'pm10', 'ozone', 'nitrogen_dioxide'];
        const pollutantMinis = pollutantKeys.map(key => {
            const value = latest[key];
            const threshold = WHO_THRESHOLDS[key];
            if (!threshold) return '';
            const status = getPollutantStatus(key, value);
            const displayValue = value != null ? value.toFixed(1) : '—';
            const exceededClass = status.ratio > 1 ? ' exceeded' : '';
            return `
                <div class="pollutant-mini">
                    <span class="pollutant-mini-name">${threshold.name}</span>
                    <span class="pollutant-mini-value${exceededClass}">${displayValue}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="city-card" data-city="${city.name}"
                 style="--card-aqi-color: ${aqiClassification.cssColor}; animation-delay: ${index * 60}ms">
                <div class="city-card-header">
                    <div>
                        <div class="city-name">${city.flag} ${city.name}</div>
                        <div class="city-country">${city.country}</div>
                    </div>
                    <div class="aqi-badge">
                        <span class="aqi-value" style="color: ${aqiClassification.cssColor}">
                            ${latest.aqi_us ?? '—'}
                        </span>
                        <span class="aqi-label">${aqiClassification.label}</span>
                    </div>
                </div>
                <div class="city-advisory">${aqiClassification.advisory}</div>
                <div class="city-pollutants">${pollutantMinis}</div>
            </div>
        `;
    }).join('');

    // City card click → select for chart + breakdown
    grid.querySelectorAll('.city-card').forEach(card => {
        card.addEventListener('click', () => {
            const cityName = card.dataset.city;
            state.selectedCity = cityName;

            // Update selectors
            const citySelect = document.getElementById('chart-city-select');
            if (citySelect) citySelect.value = cityName;

            renderChart();
            renderPollutantBreakdown();

            // Visual feedback: highlight selected card
            grid.querySelectorAll('.city-card').forEach(c =>
                c.style.boxShadow = c.dataset.city === cityName ? 'var(--shadow-glow)' : ''
            );
        });
    });
}


// =============================================
// Charts
// =============================================

/**
 * Update the chart city and pollutant selector dropdowns.
 */
function updateChartSelectors() {
    const citySelect = document.getElementById('chart-city-select');
    if (!citySelect) return;

    citySelect.innerHTML = state.cities.map(city =>
        `<option value="${city.name}" ${city.name === state.selectedCity ? 'selected' : ''}>${city.name}</option>`
    ).join('');
}

/**
 * Render the time-series chart for the selected city and pollutant.
 * 
 * Queries the DATABASE (not the live API response) to get historical data.
 * This is intentional — it demonstrates the value of storing data:
 * the API only gives us the last ~24 hours, but our database accumulates
 * data over time, eventually building weeks/months of history.
 */
function renderChart() {
    if (!state.chart || !state.selectedCity || !state.db) return;

    const pollutant = state.selectedPollutant;
    const city = state.selectedCity;

    // Query the database for time-series data
    const series = state.db.getTimeSeries(city, pollutant);

    if (series.times.length === 0) {
        state.chart.setData({
            timeLabels: [],
            values: [],
            label: '',
            lineColor: 'var(--color-accent)',
        });
        return;
    }

    // Get WHO threshold for this pollutant
    const threshold = WHO_THRESHOLDS[pollutant];

    state.chart.setData({
        timeLabels: series.times,
        values: series.values,
        label: threshold?.name || pollutant,
        lineColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-line-1').trim() || '#58a6ff',
        thresholdValue: threshold?.limit || null,
        thresholdLabel: threshold ? `WHO Limit: ${threshold.limit} ${threshold.unit}` : '',
    });

    // Update legend
    const legend = document.getElementById('chart-legend');
    if (legend && threshold) {
        legend.innerHTML = `
            <div class="legend-item">
                <span class="legend-color" style="background: var(--chart-line-1)"></span>
                <span>${threshold.name} — ${city}</span>
            </div>
            <div class="legend-item">
                <span class="legend-color dashed"></span>
                <span>WHO Guideline (${threshold.limit} ${threshold.unit})</span>
            </div>
        `;
    }
}


// =============================================
// Pollutant Breakdown
// =============================================

/**
 * Render the pollutant breakdown bar chart.
 * 
 * Shows each pollutant's current level as a horizontal bar,
 * with the WHO guideline marked as a reference point.
 * 
 * The bar width = min(ratio * 50%, 100%) — this scales the bar
 * so that the WHO guideline sits at the 50% mark. Values exceeding
 * the guideline extend past the midpoint, making violations
 * immediately visible.
 */
function renderPollutantBreakdown() {
    const container = document.getElementById('pollutant-bars');
    const subtitle = document.getElementById('breakdown-city');
    if (!container || !state.selectedCity) return;

    const apiData = state.currentData.get(state.selectedCity);
    if (!apiData) {
        container.innerHTML = '<p class="sql-placeholder">No data available</p>';
        return;
    }

    const latest = getLatestReading(apiData);
    if (!latest) return;

    subtitle.textContent = `${state.selectedCity} — Current Levels`;

    const pollutantKeys = getPollutantKeys();

    container.innerHTML = pollutantKeys.map(key => {
        const value = latest[key];
        const threshold = WHO_THRESHOLDS[key];
        const status = getPollutantStatus(key, value);
        const displayValue = value != null ? value.toFixed(1) : '—';
        const unit = threshold?.unit || '';

        // Bar width: WHO limit sits at 50% of the track
        // This ensures we can show values that exceed the limit
        const barPercent = value != null ? Math.min((status.ratio * 50), 100) : 0;
        const barColor = getPollutantBarColor(status.ratio);

        // WHO threshold marker position (always at 50%)
        const thresholdPercent = 50;

        return `
            <div class="pollutant-bar-group">
                <div class="pollutant-bar-header">
                    <span class="pollutant-bar-name">${threshold?.name || key}</span>
                    <span class="pollutant-bar-value">${displayValue} ${unit}</span>
                </div>
                <div class="pollutant-bar-track">
                    <div class="pollutant-bar-fill" style="width: ${barPercent}%; background: ${barColor}"></div>
                    <div class="pollutant-bar-threshold" style="left: ${thresholdPercent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}


// =============================================
// Pipeline Metrics
// =============================================

/**
 * Update the pipeline metrics strip at the top.
 */
function updateMetrics() {
    if (!state.db) return;

    const stats = state.db.getStats();

    const readingsEl = document.getElementById('metric-readings');
    const citiesEl = document.getElementById('metric-cities');
    const spanEl = document.getElementById('metric-span');

    if (readingsEl) readingsEl.textContent = stats.total.toLocaleString();
    if (citiesEl) citiesEl.textContent = stats.cities.toString();

    if (spanEl) {
        if (stats.earliest && stats.latest) {
            const earliest = new Date(stats.earliest);
            const latest = new Date(stats.latest);
            const hoursSpan = Math.round((latest - earliest) / (1000 * 60 * 60));
            spanEl.textContent = hoursSpan >= 24
                ? `${Math.round(hoursSpan / 24)}d ${hoursSpan % 24}h`
                : `${hoursSpan}h`;
        } else {
            spanEl.textContent = '—';
        }
    }
}


// =============================================
// Pipeline Status & Auto-Refresh
// =============================================

/**
 * Update the pipeline status indicator.
 * @param {string} message - Status message
 * @param {'ready'|'fetching'|'error'} status - Status type
 */
function updatePipelineStatus(message, status = 'ready') {
    const statusEl = document.getElementById('metric-status');
    const dot = document.getElementById('pipeline-dot');

    if (statusEl) statusEl.textContent = message;

    if (dot) {
        dot.className = 'pipeline-dot';
        if (status === 'fetching') dot.classList.add('fetching');
        if (status === 'error') dot.classList.add('error');
    }
}

/**
 * Toggle the refresh button's spinning state.
 */
function setRefreshButtonState(spinning) {
    const btn = document.getElementById('refresh-btn');
    if (btn) {
        btn.classList.toggle('refreshing', spinning);
        btn.disabled = spinning;
    }
}

/**
 * Start the auto-refresh countdown.
 * 
 * Refreshes every 5 minutes. The countdown gives visual feedback
 * that the data pipeline is alive and scheduled.
 * 
 * In production systems, this would be a cron job or a scheduler
 * like Apache Airflow. Our setInterval is the browser-scale equivalent.
 */
function startAutoRefresh() {
    state.countdownSeconds = state.refreshInterval / 1000;
    updateCountdown();

    // Clear any existing timers
    if (state.countdownTimer) clearInterval(state.countdownTimer);

    state.countdownTimer = setInterval(() => {
        state.countdownSeconds--;
        updateCountdown();

        if (state.countdownSeconds <= 0) {
            refreshAllCities();
            state.countdownSeconds = state.refreshInterval / 1000;
        }
    }, 1000);
}

/**
 * Reset the countdown after a manual refresh.
 */
function resetCountdown() {
    state.countdownSeconds = state.refreshInterval / 1000;
    updateCountdown();
}

/**
 * Update the countdown display.
 */
function updateCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;
    const min = Math.floor(state.countdownSeconds / 60);
    const sec = state.countdownSeconds % 60;
    el.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}


// =============================================
// Event Listeners
// =============================================

function setupEventListeners() {
    // ---- Refresh Button ----
    document.getElementById('refresh-btn')?.addEventListener('click', async () => {
        await refreshAllCities();
        resetCountdown();
    });

    // ---- Chart City Selector ----
    document.getElementById('chart-city-select')?.addEventListener('change', (e) => {
        state.selectedCity = e.target.value;
        renderChart();
        renderPollutantBreakdown();
    });

    // ---- Chart Pollutant Selector ----
    document.getElementById('chart-pollutant-select')?.addEventListener('change', (e) => {
        state.selectedPollutant = e.target.value;
        renderChart();
    });

    // ---- Theme Toggle ----
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // ---- Add City Dialog ----
    const addBtn = document.getElementById('add-city-btn');
    const dialog = document.getElementById('add-city-dialog');
    const closeBtn = document.getElementById('close-dialog-btn');
    const searchInput = document.getElementById('city-search-input');
    const searchResults = document.getElementById('city-search-results');

    if (addBtn && dialog) {
        addBtn.addEventListener('click', () => {
            dialog.showModal();
            searchInput?.focus();
        });

        closeBtn?.addEventListener('click', () => dialog.close());

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });

        // ---- City Search with Debounce ----
        let searchTimeout = null;
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(searchTimeout);

            if (query.length < 2) {
                searchResults.innerHTML = '<p class="search-placeholder">Type at least 2 characters to search</p>';
                return;
            }

            searchResults.innerHTML = '<p class="search-placeholder">Searching...</p>';

            // Debounce: wait 300ms after the user stops typing before making the API call.
            // This prevents firing a request for every keystroke.
            searchTimeout = setTimeout(async () => {
                try {
                    const data = await searchCities(query);
                    if (!data.results || data.results.length === 0) {
                        searchResults.innerHTML = '<p class="search-placeholder">No cities found</p>';
                        return;
                    }

                    searchResults.innerHTML = data.results.map(city => {
                        const alreadyAdded = state.cities.some(
                            c => Math.abs(c.lat - city.latitude) < 0.01 && Math.abs(c.lon - city.longitude) < 0.01
                        );

                        return `
                            <div class="city-result-item ${alreadyAdded ? 'added' : ''}"
                                 data-name="${city.name}"
                                 data-lat="${city.latitude}"
                                 data-lon="${city.longitude}"
                                 data-country="${city.country_code || ''}"
                                 ${alreadyAdded ? 'style="opacity:0.5"' : ''}>
                                <div>
                                    <div class="city-result-name">${city.name}</div>
                                    <div class="city-result-meta">${city.admin1 || ''} ${city.country || ''}</div>
                                </div>
                                <div class="city-result-meta">
                                    ${alreadyAdded ? '✓ Added' : '+ Add'}
                                </div>
                            </div>
                        `;
                    }).join('');

                    // Click handler for adding a city
                    searchResults.querySelectorAll('.city-result-item:not(.added)').forEach(item => {
                        item.addEventListener('click', async () => {
                            const newCity = {
                                name: item.dataset.name,
                                lat: parseFloat(item.dataset.lat),
                                lon: parseFloat(item.dataset.lon),
                                country: item.dataset.country,
                                flag: '📍',
                            };

                            state.cities.push(newCity);

                            // Fetch data for new city
                            try {
                                const data = await fetchAirQuality(newCity.lat, newCity.lon);
                                state.currentData.set(newCity.name, data);
                                state.db.insertReadings(newCity.name, newCity.lat, newCity.lon, data);
                            } catch (err) {
                                console.error(`Failed to fetch data for ${newCity.name}:`, err);
                            }

                            // Close dialog and re-render
                            dialog.close();
                            searchInput.value = '';
                            renderCityCards();
                            updateChartSelectors();
                            updateMetrics();
                        });
                    });

                } catch (err) {
                    searchResults.innerHTML = '<p class="search-placeholder">Search failed. Please try again.</p>';
                }
            }, 300);
        });
    }
}


// =============================================
// Theme Management
// =============================================

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('aerointel-theme', next);

    // Re-render chart (Canvas needs to pick up new CSS colors)
    if (state.chart && state.selectedCity) {
        // Small delay to let CSS transition apply
        setTimeout(() => renderChart(), 50);
    }
}

function applySavedTheme() {
    const saved = localStorage.getItem('aerointel-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}


// =============================================
// Launch
// =============================================

// Run init when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
