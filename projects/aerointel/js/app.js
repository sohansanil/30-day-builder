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
import { classifyAQI, WHO_THRESHOLDS, getPollutantStatus, getPollutantBarColor, getPollutantKeys, calculateSMA, calculateVolatility, detectAnomalies, calculateLinearRegression, calculatePearsonCorrelation, generateNaturalLanguageInsights } from './analytics.js';
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
    renderCorrelationHeatmap();
    updateMetrics();
    renderHumanInsights();

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

    const showRemoveBtn = state.cities.length > 1;

    grid.innerHTML = state.cities.map((city, index) => {
        const apiData = state.currentData.get(city.name);
        const removeBtnHTML = showRemoveBtn 
            ? `<button class="remove-city-btn" data-city="${city.name}" title="Remove ${city.name}">&times;</button>`
            : '';

        if (!apiData) {
            return `
                <div class="city-card" data-city="${city.name}" style="animation-delay: ${index * 60}ms">
                    ${removeBtnHTML}
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
                ${removeBtnHTML}
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
            renderCorrelationHeatmap();
            renderHumanInsights();

            // Visual feedback: highlight selected card
            grid.querySelectorAll('.city-card').forEach(c =>
                c.style.boxShadow = c.dataset.city === cityName ? 'var(--shadow-glow)' : ''
            );
        });
    });

    // Close button click → remove city
    grid.querySelectorAll('.remove-city-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card selection
            const cityName = btn.dataset.city;
            removeCity(cityName);
        });
    });
}

/**
 * Remove a city from telemetry list and state.
 * @param {string} cityName - Name of city to remove
 */
function removeCity(cityName) {
    if (state.cities.length <= 1) {
        alert("Cannot remove the last monitored city.");
        return;
    }

    state.cities = state.cities.filter(c => c.name !== cityName);
    state.currentData.delete(cityName);

    if (state.selectedCity === cityName) {
        state.selectedCity = state.cities[0]?.name || null;
    }

    // Refresh UI
    renderCityCards();
    updateChartSelectors();
    renderChart();
    renderPollutantBreakdown();
    renderCorrelationHeatmap();
    updateMetrics();
    renderHumanInsights();
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

    const threshold = WHO_THRESHOLDS[pollutant];

    // Compute SMA-5h and SMA-20h
    const sma5 = calculateSMA(series.values, 5);
    const sma20 = calculateSMA(series.values, 20);
    const vol = calculateVolatility(series.values, 24);

    // Compute anomalies & linear regression forecast
    const anomalies = detectAnomalies(series.values, 24, 2.0); // 2.0 Z-score threshold
    const forecast = calculateLinearRegression(series.values, series.times, 6); // 6-hour forecast

    // Align all series to the new timeline (history + 6h forecast)
    const forecastPeriods = 6;
    const mergedTimes = series.times.concat(forecast.forecastTimes);
    const paddedValues = series.values.concat(Array(forecastPeriods).fill(null));
    const paddedSma5 = sma5.concat(Array(forecastPeriods).fill(null));
    const paddedSma20 = sma20.concat(Array(forecastPeriods).fill(null));
    const paddedAnomalies = anomalies.concat(Array(forecastPeriods).fill(null));

    state.chart.setData({
        timeLabels: mergedTimes,
        values: paddedValues,
        label: threshold?.name || pollutant,
        lineColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-line-1').trim() || '#58a6ff',
        thresholdValue: threshold?.limit || null,
        thresholdLabel: threshold ? `WHO Limit: ${threshold.limit} ${threshold.unit}` : '',
        sma5Values: paddedSma5,
        sma20Values: paddedSma20,
        anomalies: paddedAnomalies,
        forecastValues: forecast.forecastValues,
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

    // Update Intelligence Cards
    updateVolatilityCard(vol, threshold?.unit || '');
    updateTrendCard(forecast.slope, threshold?.unit || '');
    updateAnomalyCard(anomalies);
    updateDominantDriverCard(city);

    // Generate Natural Language Insights
    const apiData = state.currentData.get(city);
    const latestReading = apiData ? getLatestReading(apiData) : null;
    const latestVol = vol.length > 0 ? vol[vol.length - 1] : null;
    const last24AnomaliesCount = anomalies.slice(-24).filter(a => a != null).length;

    const insightText = generateNaturalLanguageInsights(
        city,
        latestReading,
        forecast.slope,
        latestVol,
        last24AnomaliesCount,
        pollutant
    );

    const insightBox = document.getElementById('ai-insight-text');
    if (insightBox) {
        insightBox.innerHTML = insightText;
    }
}

/**
 * Update the Atmospheric Stability intelligence card.
 */
function updateVolatilityCard(volSeries, unit) {
    const valEl = document.getElementById('intel-vol-val');
    const descEl = document.getElementById('intel-vol-desc');
    if (!valEl || !descEl) return;

    const latestVol = volSeries.length > 0 ? volSeries[volSeries.length - 1] : null;
    if (latestVol == null || isNaN(latestVol)) {
        valEl.textContent = '—';
        descEl.textContent = 'Needs 24h of history';
        valEl.className = 'intel-card-value';
        return;
    }

    const pollutant = state.selectedPollutant;
    const threshold = WHO_THRESHOLDS[pollutant]?.limit || 10;
    const ratio = latestVol / threshold;

    let classification = '';
    let classVal = '';
    if (ratio <= 0.15) {
        classification = 'Stable';
        classVal = 'stable';
    } else if (ratio <= 0.35) {
        classification = 'Unstable';
        classVal = 'unstable';
    } else {
        classification = 'Turbulent';
        classVal = 'turbulent';
    }

    valEl.textContent = `${latestVol.toFixed(1)} ${unit}`;
    valEl.className = `intel-card-value ${classVal}`;
    descEl.textContent = `${classification} dispersion dynamics`;
}

/**
 * Update the Trend Forecast intelligence card.
 */
function updateTrendCard(slope, unit) {
    const valEl = document.getElementById('intel-trend-val');
    const descEl = document.getElementById('intel-trend-desc');
    if (!valEl || !descEl) return;

    if (slope === 0 || slope == null || isNaN(slope)) {
        valEl.textContent = '—';
        descEl.textContent = 'No forecast model';
        valEl.className = 'intel-card-value';
        return;
    }

    let trendClass = '';
    let direction = '';
    if (slope > 0.05) {
        direction = 'Rising';
        trendClass = 'turbulent';
    } else if (slope < -0.05) {
        direction = 'Improving';
        trendClass = 'stable';
    } else {
        direction = 'Stable';
        trendClass = 'unstable';
    }

    valEl.textContent = direction;
    valEl.className = `intel-card-value ${trendClass}`;
    const sign = slope > 0 ? '+' : '';
    descEl.textContent = `${sign}${slope.toFixed(2)} ${unit}/hr trajectory`;
}

/**
 * Update the Anomaly Alerts intelligence card.
 */
function updateAnomalyCard(anomalies) {
    const valEl = document.getElementById('intel-anomaly-val');
    const descEl = document.getElementById('intel-anomaly-desc');
    if (!valEl || !descEl) return;

    const last24 = anomalies.slice(-24);
    const count = last24.filter(a => a != null).length;
    const severeCount = last24.filter(a => a != null && a.severity === 'severe').length;

    valEl.textContent = count === 0 ? 'Clear' : `${count} Alert${count > 1 ? 's' : ''}`;
    
    let stateClass = 'stable';
    if (count > 0) {
        stateClass = severeCount > 0 ? 'turbulent' : 'unstable';
    }
    
    valEl.className = `intel-card-value ${stateClass}`;
    
    if (count === 0) {
        descEl.textContent = 'No outliers detected (24h)';
    } else {
        descEl.textContent = `${severeCount} severe outliers in last 24h`;
    }
}

/**
 * Update the Dominant Driver intelligence card.
 */
function updateDominantDriverCard(city) {
    const valEl = document.getElementById('intel-driver-val');
    const descEl = document.getElementById('intel-driver-desc');
    if (!valEl || !descEl) return;

    const apiData = state.currentData.get(city);
    if (!apiData) {
        valEl.textContent = '—';
        descEl.textContent = 'No active telemetry';
        valEl.className = 'intel-card-value';
        return;
    }

    const latest = getLatestReading(apiData);
    if (!latest) {
        valEl.textContent = '—';
        descEl.textContent = 'No recent readings';
        valEl.className = 'intel-card-value';
        return;
    }

    const pollutantKeys = getPollutantKeys();
    let maxRatio = -1;
    let maxPollutant = '';

    for (const key of pollutantKeys) {
        const val = latest[key];
        const status = getPollutantStatus(key, val);
        if (status.ratio > maxRatio) {
            maxRatio = status.ratio;
            maxPollutant = key;
        }
    }

    if (!maxPollutant) {
        valEl.textContent = '—';
        descEl.textContent = 'Unable to evaluate ratio';
        valEl.className = 'intel-card-value';
        return;
    }

    const name = WHO_THRESHOLDS[maxPollutant]?.name || maxPollutant;
    valEl.textContent = name;
    
    let stateClass = 'stable';
    if (maxRatio > 1.0) {
        stateClass = maxRatio > 2.0 ? 'turbulent' : 'unstable';
    }
    valEl.className = `intel-card-value ${stateClass}`;
    descEl.textContent = `${maxRatio.toFixed(1)}x WHO safety guideline`;
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
        renderCorrelationHeatmap();
        renderHumanInsights();
    });

    // ---- Chart Pollutant Selector ----
    document.getElementById('chart-pollutant-select')?.addEventListener('change', (e) => {
        state.selectedPollutant = e.target.value;
        renderChart();
        renderHumanInsights();
    });

    // ---- Chart Option Toggles ----
    document.getElementById('toggle-sma5')?.addEventListener('change', (e) => {
        if (state.chart) {
            state.chart.showSma5 = e.target.checked;
            renderChart();
        }
    });
    document.getElementById('toggle-sma20')?.addEventListener('change', (e) => {
        if (state.chart) {
            state.chart.showSma20 = e.target.checked;
            renderChart();
        }
    });
    document.getElementById('toggle-anomalies')?.addEventListener('change', (e) => {
        if (state.chart) {
            state.chart.showAnomalies = e.target.checked;
            renderChart();
        }
    });
    document.getElementById('toggle-forecast')?.addEventListener('change', (e) => {
        if (state.chart) {
            state.chart.showForecast = e.target.checked;
            renderChart();
        }
    });

    // ---- Chart CSV Export ----
    document.getElementById('export-chart-csv')?.addEventListener('click', () => {
        if (!state.selectedCity || !state.db) return;
        const series = state.db.getTimeSeries(state.selectedCity, state.selectedPollutant);
        if (series.times.length === 0) {
            alert("No historical data to export.");
            return;
        }
        
        const csvRows = [["reading_time", state.selectedPollutant].join(",")];
        for (let i = 0; i < series.times.length; i++) {
            csvRows.push([series.times[i], series.values[i] != null ? series.values[i] : ""].join(","));
        }
        
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `aerointel_${state.selectedCity}_${state.selectedPollutant}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

                            // Check for duplicates before adding
                            if (state.cities.some(c => c.name.toLowerCase() === newCity.name.toLowerCase() || 
                                (Math.abs(c.lat - newCity.lat) < 0.01 && Math.abs(c.lon - newCity.lon) < 0.01))) {
                                alert(`${newCity.name} is already being monitored.`);
                                dialog.close();
                                return;
                            }

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
                             renderHumanInsights();
                         });
                    });

                } catch (err) {
                    searchResults.innerHTML = '<p class="search-placeholder">Search failed. Please try again.</p>';
                }
            }, 300);
        });
    }
}


/**
 * Render the interactive Pearson Correlation matrix heatmap.
 */
function renderCorrelationHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    const labelX = document.getElementById('heatmap-labels-x');
    const labelY = document.getElementById('heatmap-labels-y');
    const title = document.getElementById('heatmap-city');
    if (!grid || !labelX || !labelY || !state.selectedCity || !state.db) return;

    if (title) title.textContent = `${state.selectedCity} — Historical Pollutant Matrix`;

    const pollutants = ['pm2_5', 'pm10', 'ozone', 'nitrogen_dioxide', 'sulphur_dioxide', 'carbon_monoxide'];
    
    // Fetch historical data for all pollutants
    const seriesData = {};
    for (const p of pollutants) {
        seriesData[p] = state.db.getTimeSeries(state.selectedCity, p).values;
    }

    // Compute matrix
    const matrix = [];
    for (let i = 0; i < pollutants.length; i++) {
        const row = [];
        for (let j = 0; j < pollutants.length; j++) {
            const pA = pollutants[i];
            const pB = pollutants[j];
            const r = calculatePearsonCorrelation(seriesData[pA], seriesData[pB]);
            row.push(r);
        }
        matrix.push(row);
    }

    // Render Y-Axis labels
    labelY.innerHTML = pollutants.map(p => `<div>${WHO_THRESHOLDS[p]?.name || p}</div>`).join('');
    
    // Render X-Axis labels
    labelX.innerHTML = pollutants.map(p => `<div>${WHO_THRESHOLDS[p]?.name || p}</div>`).join('');

    // Render grid cells
    let cellsHTML = '';
    for (let i = 0; i < pollutants.length; i++) {
        for (let j = 0; j < pollutants.length; j++) {
            const r = matrix[i][j];
            const pAKey = pollutants[i];
            const pBKey = pollutants[j];
            const pAName = WHO_THRESHOLDS[pAKey]?.name || pAKey;
            const pBName = WHO_THRESHOLDS[pBKey]?.name || pBKey;
            
            // Map r to dynamic color
            let bg = 'var(--bg-surface)';
            if (r > 0.02) {
                // Positive correlation: orange/red
                bg = `oklch(0.62 0.20 28 / ${r.toFixed(2)})`;
            } else if (r < -0.02) {
                // Negative correlation: blue/teal
                bg = `oklch(0.55 0.16 260 / ${Math.abs(r).toFixed(2)})`;
            }

            cellsHTML += `
                <div class="heatmap-cell" 
                     style="background: ${bg}" 
                     title="${pAName} vs ${pBName}: r = ${r.toFixed(2)}"
                     data-pa="${pAName}"
                     data-pb="${pBName}"
                     data-r="${r.toFixed(2)}"
                     data-pakey="${pAKey}"
                     data-pbkey="${pBKey}">
                    ${r.toFixed(1)}
                </div>
            `;
        }
    }
    grid.innerHTML = cellsHTML;

    // Attach click listeners to cells for correlation details
    grid.querySelectorAll('.heatmap-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const pa = cell.dataset.pa;
            const pb = cell.dataset.pb;
            const r = parseFloat(cell.dataset.r);
            const pakey = cell.dataset.pakey;
            const pbkey = cell.dataset.pbkey;
            showCorrelationExplanation(pa, pb, r, pakey, pbkey);
        });
    });
}

/**
 * Display a natural language explanation for clicked correlation cell.
 */
function showCorrelationExplanation(pa, pb, r, pakey, pbkey) {
    const insightBox = document.getElementById('ai-insight-text');
    if (!insightBox) return;

    let strength = '';
    const absR = Math.abs(r);
    if (absR >= 0.7) strength = 'strong';
    else if (absR >= 0.4) strength = 'moderate';
    else if (absR >= 0.1) strength = 'weak';
    else strength = 'negligible';

    let direction = r > 0 ? 'positive' : 'negative';
    if (absR < 0.1) direction = 'no clear';

    let physicalAdvisory = '';
    if (pakey === pbkey) {
        physicalAdvisory = `A pollutant always correlates perfectly with itself ($r = 1.0$). This represents the identity reference line on the diagonal.`;
    } else {
        // Chemical interaction guides
        if ((pakey === 'pm2_5' && pbkey === 'pm10') || (pakey === 'pm10' && pbkey === 'pm2_5')) {
            physicalAdvisory = `PM2.5 and PM10 are physically nested (PM2.5 is a subset of PM10). A high correlation ($r = ${r.toFixed(2)}$) is expected and suggests that dust, construction, or wind-blown sand is driving the particulate concentrations.`;
        } else if ((pakey === 'pm2_5' && pbkey === 'nitrogen_dioxide') || (pakey === 'nitrogen_dioxide' && pbkey === 'pm2_5')) {
            physicalAdvisory = `Nitrogen Dioxide (NO₂) and PM2.5 are highly associated with vehicle exhaust emissions. A correlation of $r = ${r.toFixed(2)}$ suggests traffic combustion is a dominant source of local fine dust particles.`;
        } else if ((pakey === 'ozone' && pbkey === 'nitrogen_dioxide') || (pakey === 'nitrogen_dioxide' && pbkey === 'ozone')) {
            physicalAdvisory = `Ground-level Ozone (O₃) has a negative correlation with NO₂ under low UV radiation because O₃ reacts with traffic exhaust (NO) in a process called titration. The correlation of $r = ${r.toFixed(2)}$ reflects this complex photochemical titration cycle.`;
        } else if ((pakey === 'carbon_monoxide' && pbkey === 'nitrogen_dioxide') || (pakey === 'nitrogen_dioxide' && pbkey === 'carbon_monoxide')) {
            physicalAdvisory = `Carbon Monoxide (CO) and NO₂ are both direct combustion byproducts. The correlation of $r = ${r.toFixed(2)}$ is a strong indicator of industrial or urban vehicle traffic emission profiles.`;
        } else {
            physicalAdvisory = `The correlation value of $r = ${r.toFixed(2)}$ represents a ${strength} ${direction} relationship. This indicates how much these two pollutants share common transport patterns (such as wind speed, thermal inversions, or seasonal temperature profiles).`;
        }
    }

    insightBox.innerHTML = `
        <p><strong>Interactive Query Matrix Analysis:</strong></p>
        <p>Analyzing correlation between <strong>${pa}</strong> and <strong>${pb}</strong> in <strong>${state.selectedCity}</strong>.</p>
        <p>The Pearson correlation coefficient is <strong>${r.toFixed(2)}</strong>, indicating a <strong>${strength} ${direction} relationship</strong>.</p>
        <p>${physicalAdvisory}</p>
    `;
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


/**
 * Render the Human Insights layer (Recommendations, Leaderboard, Observations).
 */
function renderHumanInsights() {
    if (!state.db) return;

    // 1. Update Selected City Recommendation
    const recCityBadge = document.getElementById('rec-city-badge');
    const recHeadline = document.getElementById('rec-headline');
    const recDescription = document.getElementById('rec-description');
    
    const lifeRun = document.querySelector('#life-run .lifestyle-status');
    const lifeCycle = document.querySelector('#life-cycle .lifestyle-status');
    const lifePlay = document.querySelector('#life-play .lifestyle-status');
    const lifeVent = document.querySelector('#life-vent .lifestyle-status');

    if (recCityBadge && state.selectedCity) {
        recCityBadge.textContent = state.selectedCity;
    }

    const apiData = state.selectedCity ? state.currentData.get(state.selectedCity) : null;
    const latest = apiData ? getLatestReading(apiData) : null;
    const series = state.selectedCity ? state.db.getTimeSeries(state.selectedCity, state.selectedPollutant) : null;
    let slope = 0;
    if (series && series.values.length > 0) {
        try {
            const forecast = calculateLinearRegression(series.values, series.times, 6);
            slope = forecast.slope;
        } catch (e) {
            console.error("Failed to compute slope for insights:", e);
        }
    }

    if (latest && latest.aqi_us != null) {
        const aqi = latest.aqi_us;
        let headline = '';
        let desc = '';
        
        let runStatus = '', runClass = '';
        let cycleStatus = '', cycleClass = '';
        let playStatus = '', playClass = '';
        let ventStatus = '', ventClass = '';

        if (aqi <= 50) {
            headline = "🌿 Excellent Air Quality";
            desc = slope > 0.05 
                ? "Air quality is currently excellent, though a slight rising trend is projected. Great conditions for outdoor exercise."
                : "Air quality is excellent and stable. Great conditions for outdoor activities and running.";
            
            runStatus = "Recommended · Perfect conditions"; runClass = "life-status-recommended";
            cycleStatus = "Recommended · Clean air path"; cycleClass = "life-status-recommended";
            playStatus = "Recommended · Safe for outdoor play"; playClass = "life-status-recommended";
            ventStatus = "Recommended · Open windows"; ventClass = "life-status-recommended";
        } else if (aqi <= 100) {
            headline = "🌤️ Moderate Air Quality";
            desc = slope > 0.05
                ? "Moderate air quality, forecasted to worsen slightly over the next few hours. Sensitive groups should monitor warnings."
                : "Moderate air quality but stable. Acceptable for most people; sensitive individuals should watch for minor congestion.";
            
            runStatus = "Caution · Watch for sensitivity"; runClass = "life-status-caution";
            cycleStatus = "Recommended · Safe commute"; cycleClass = "life-status-recommended";
            playStatus = "Caution · Safe for light play"; playClass = "life-status-caution";
            ventStatus = "Recommended · Keep windows open"; ventClass = "life-status-recommended";
        } else if (aqi <= 150) {
            headline = "⚠️ Unhealthy for Sensitive Groups";
            desc = slope > 0.05
                ? "Air quality is currently unhealthy for sensitive groups and forecasted to worsen. Keep outdoor exposure brief."
                : "Unhealthy for sensitive groups (asthma, children, elderly). They should limit heavy outdoor exertion.";
            
            runStatus = "Limit Exertion · Indoor workout"; runClass = "life-status-limit";
            cycleStatus = "Limit · Wear mask / urban path"; cycleClass = "life-status-limit";
            playStatus = "Limit Light Play · Watch kids"; playClass = "life-status-limit";
            ventStatus = "Limit · Keep windows closed"; ventClass = "life-status-limit";
        } else if (aqi <= 200) {
            headline = "😷 Unhealthy Air Quality";
            desc = slope > 0.05
                ? `AQI is currently unhealthy (${aqi}) and forecasted to worsen over the next 6 hours. Swap outdoor running for indoor exercise today.`
                : `AQI is currently unhealthy (${aqi}) but showing stable trends. Everyone should limit heavy or prolonged outdoor exertion.`;
            
            runStatus = "Avoid · Exercise indoors"; runClass = "life-status-avoid";
            cycleStatus = "Limit · Mask highly recommended"; cycleClass = "life-status-limit";
            playStatus = "Avoid Outdoor · Stay inside"; playClass = "life-status-avoid";
            ventStatus = "Avoid · Sealed windows recommended"; ventClass = "life-status-avoid";
        } else if (aqi <= 300) {
            headline = "🚨 Very Unhealthy Air Quality";
            desc = "Critical exposure levels. Everyone should avoid outdoor exercise, keep windows sealed, and run air purifiers indoors.";
            
            runStatus = "Avoid · Stay indoors"; runClass = "life-status-avoid";
            cycleStatus = "Avoid · Sealed vehicle commute"; cycleClass = "life-status-avoid";
            playStatus = "Avoid Outdoor · Critical exposure"; playClass = "life-status-avoid";
            ventStatus = "Avoid · Seal windows tightly"; ventClass = "life-status-avoid";
        } else {
            headline = "💀 Hazardous Air Quality";
            desc = "Emergency health warning. Avoid all outdoor activity. Keep all doors and windows tightly closed.";
            
            runStatus = "Avoid · STAY INDOORS"; runClass = "life-status-avoid";
            cycleStatus = "Avoid · Stop outdoor transit"; cycleClass = "life-status-avoid";
            playStatus = "Avoid · Emergency shelter play"; playClass = "life-status-avoid";
            ventStatus = "Avoid · Keep closed and seal"; ventClass = "life-status-avoid";
        }

        if (recHeadline) recHeadline.textContent = headline;
        if (recDescription) recDescription.textContent = desc;

        if (lifeRun) { lifeRun.textContent = runStatus; lifeRun.className = `lifestyle-status ${runClass}`; }
        if (lifeCycle) { lifeCycle.textContent = cycleStatus; lifeCycle.className = `lifestyle-status ${cycleClass}`; }
        if (lifePlay) { lifePlay.textContent = playStatus; lifePlay.className = `lifestyle-status ${playClass}`; }
        if (lifeVent) { lifeVent.textContent = ventStatus; lifeVent.className = `lifestyle-status ${ventClass}`; }
    } else {
        if (recHeadline) recHeadline.textContent = "Telemetry Offline";
        if (recDescription) recDescription.textContent = "Select a city with active readings to view daily recommendation guidelines.";
    }

    // 2. Populate Leaderboard
    const leaderboardList = document.getElementById('leaderboard-list');
    if (leaderboardList) {
        // Collect cities and their AQI
        const citiesRanked = state.cities.map(city => {
            const data = state.currentData.get(city.name);
            const latestReading = data ? getLatestReading(data) : null;
            const aqi = latestReading ? latestReading.aqi_us : null;
            return {
                name: city.name,
                flag: city.flag,
                aqi: aqi
            };
        });

        // Filter out null AQI, sort ascending (cleanest first)
        const activeRanked = citiesRanked.filter(c => c.aqi != null).sort((a, b) => a.aqi - b.aqi);
        const inactiveRanked = citiesRanked.filter(c => c.aqi == null);

        const allSorted = [...activeRanked, ...inactiveRanked];

        leaderboardList.innerHTML = allSorted.map((cityObj, i) => {
            const isActive = cityObj.name === state.selectedCity ? ' active-city' : '';
            const displayAQI = cityObj.aqi != null ? cityObj.aqi : '—';
            
            // Emoji based on AQI
            let statusEmoji = '🌿';
            if (cityObj.aqi == null) statusEmoji = '❓';
            else if (cityObj.aqi <= 50) statusEmoji = '🌿';
            else if (cityObj.aqi <= 100) statusEmoji = '🌤️';
            else if (cityObj.aqi <= 150) statusEmoji = '⚠️';
            else if (cityObj.aqi <= 200) statusEmoji = '😷';
            else if (cityObj.aqi <= 300) statusEmoji = '🚨';
            else statusEmoji = '💀';

            return `
                <div class="leaderboard-row${isActive}" data-city="${cityObj.name}">
                    <div class="leaderboard-row-left">
                        <span class="leaderboard-rank">#${i + 1}</span>
                        <span class="leaderboard-name">${cityObj.flag} ${cityObj.name}</span>
                    </div>
                    <div class="leaderboard-row-right">
                        <span class="leaderboard-value">${displayAQI}</span>
                        <span class="leaderboard-emoji">${statusEmoji}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Attach click handlers to leaderboard rows to select city
        leaderboardList.querySelectorAll('.leaderboard-row').forEach(row => {
            row.addEventListener('click', () => {
                const cityName = row.dataset.city;
                const card = document.querySelector(`.city-card[data-city="${cityName}"]`);
                if (card) {
                    card.click();
                }
            });
        });
    }

    // 3. Key Observations
    const obsList = document.getElementById('observations-list');
    if (obsList) {
        const obs = [];

        // Fetch AQI array
        const activeCitiesWithAQI = state.cities
            .map(c => {
                const data = state.currentData.get(c.name);
                const latestR = data ? getLatestReading(data) : null;
                return { name: c.name, aqi: latestR ? latestR.aqi_us : null };
            })
            .filter(c => c.aqi != null);

        // A. Ratio observation
        if (activeCitiesWithAQI.length >= 2) {
            // Sort to find min/max
            const sorted = [...activeCitiesWithAQI].sort((a, b) => a.aqi - b.aqi);
            const cleanest = sorted[0];
            const dirtiest = sorted[sorted.length - 1];
            if (cleanest.aqi > 0) {
                const ratio = dirtiest.aqi / cleanest.aqi;
                obs.push(`<strong>${dirtiest.name} (${dirtiest.aqi})</strong> currently has <strong>${ratio.toFixed(1)}x</strong> ${cleanest.name}'s (${cleanest.aqi}) AQI.`);
            }
        }

        // B. Slope / Improving observation (for selected pollutant)
        let bestCity = '';
        let bestSlope = 0;
        let mostVolatileCity = '';
        let maxVol = 0;

        for (const city of state.cities) {
            try {
                const series = state.db.getTimeSeries(city.name, state.selectedPollutant);
                if (series && series.values.length > 5) {
                    const forecast = calculateLinearRegression(series.values, series.times, 6);
                    if (forecast.slope < bestSlope) {
                        bestSlope = forecast.slope;
                        bestCity = city.name;
                    }

                    const vols = calculateVolatility(series.values, 24);
                    if (vols.length > 0) {
                        const latestVol = vols[vols.length - 1];
                        if (latestVol > maxVol) {
                            maxVol = latestVol;
                            mostVolatileCity = city.name;
                        }
                    }
                }
            } catch (e) {
                // Ignore errors for uninitialized cities
            }
        }

        if (bestCity && bestSlope < -0.01) {
            obs.push(`<strong>${bestCity}</strong>'s air quality is improving fastest today (declining trend of <strong>${Math.abs(bestSlope).toFixed(2)}</strong> units/hr).`);
        }

        if (mostVolatileCity && maxVol > 0.1) {
            obs.push(`<strong>${mostVolatileCity}</strong> shows the highest volatility in the last 24 hours (deviation of <strong>${maxVol.toFixed(1)}</strong> units).`);
        }

        // Fallback if no observations
        if (obs.length === 0) {
            if (state.cities.length <= 1) {
                obs.push("Only one city is monitored. Add more cities to compare environmental profiles.");
            } else {
                obs.push("Accumulating historical readings to generate comparative statistics...");
            }
        }

        obsList.innerHTML = obs.map(o => `<li>${o}</li>`).join('');
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
