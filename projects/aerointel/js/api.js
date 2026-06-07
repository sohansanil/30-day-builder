/**
 * api.js — Data Source Layer
 * 
 * This module is the FIRST stage of our data pipeline: the Source.
 * Pipeline: Source (api.js) → Ingest/Store (database.js) → Query (sql-console.js) → Present (app.js/charts.js)
 * 
 * WHY Open-Meteo?
 * - Completely free, no API key, no authentication
 * - Hourly resolution — new data every hour
 * - 10+ pollutant variables per location
 * - Global coverage using environmental monitoring networks
 * - Returns both historical (past_days) and forecast data
 * 
 * WHY these specific cities?
 * Each represents a DIFFERENT pollution profile:
 * - Dubai: Desert dust (PM10 spikes), extreme heat UV
 * - Mumbai: Traffic + industrial pollution (NO₂, PM2.5)
 * - London: Moderate, well-monitored (good baseline reference)
 * - New York: Urban traffic emissions (NO₂, O₃ in summer)
 * - Beijing: Heavy industrial + coal heating (severe PM2.5 in winter)
 */

// Preset cities with diverse pollution profiles
const PRESET_CITIES = [
    { name: 'Dubai',     lat: 25.2048, lon: 55.2708,  country: 'AE', flag: '🇦🇪' },
    { name: 'Mumbai',    lat: 19.0760, lon: 72.8777,  country: 'IN', flag: '🇮🇳' },
    { name: 'London',    lat: 51.5074, lon: -0.1278,  country: 'GB', flag: '🇬🇧' },
    { name: 'New York',  lat: 40.7128, lon: -74.0060, country: 'US', flag: '🇺🇸' },
    { name: 'Beijing',   lat: 39.9042, lon: 116.4074, country: 'CN', flag: '🇨🇳' },
];

// The pollutant variables we request from the API
const AQ_HOURLY_PARAMS = [
    'pm2_5',             // Fine particulate matter (< 2.5 μm)
    'pm10',              // Coarse particulate matter (< 10 μm)
    'ozone',             // Ground-level ozone (O₃)
    'nitrogen_dioxide',  // NO₂ — traffic pollution marker
    'sulphur_dioxide',   // SO₂ — industrial pollution marker
    'carbon_monoxide',   // CO — combustion byproduct
    'dust',              // Desert/construction dust
    'uv_index',          // UV radiation exposure
    'european_aqi',      // EU composite air quality index
    'us_aqi',            // US EPA composite air quality index
].join(',');

/**
 * Fetch air quality data for a specific location.
 * 
 * Returns hourly data for the past 24 hours + current day.
 * The API returns arrays where each index corresponds to an hour:
 * {
 *   hourly: {
 *     time: ['2026-06-07T00:00', '2026-06-07T01:00', ...],
 *     pm2_5: [12.3, 15.1, ...],
 *     ozone: [45.2, 42.0, ...],
 *     us_aqi: [42, 55, ...],
 *     ...
 *   }
 * }
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} API response with hourly pollutant data
 */
async function fetchAirQuality(lat, lon) {
    const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    url.searchParams.set('latitude', lat);
    url.searchParams.set('longitude', lon);
    url.searchParams.set('hourly', AQ_HOURLY_PARAMS);
    url.searchParams.set('past_days', '1');       // Include yesterday's data
    url.searchParams.set('forecast_days', '1');    // Include today + forecast
    url.searchParams.set('timezone', 'auto');      // Use location's timezone

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Air Quality API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Search for cities using Open-Meteo's Geocoding API.
 * 
 * Used by the "Add City" dialog to let users search for any city worldwide.
 * Returns matching cities with coordinates and metadata.
 * 
 * @param {string} query - City name to search for
 * @returns {Promise<object>} Geocoding results with city names and coordinates
 */
async function searchCities(query) {
    if (!query || query.trim().length < 2) {
        return { results: [] };
    }

    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query.trim());
    url.searchParams.set('count', '5');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Get the most recent data point from an API response.
 * 
 * The API returns arrays of hourly data. This helper finds the latest
 * non-null reading for each variable. We use this for the city overview
 * cards which show "current" values.
 * 
 * @param {object} apiData - Raw API response
 * @returns {object} Latest reading for each variable
 */
function getLatestReading(apiData) {
    const hourly = apiData.hourly;
    if (!hourly || !hourly.time) return null;

    // Find the most recent hour that has data
    // Walk backwards from the end of the array
    const now = new Date();
    let latestIdx = hourly.time.length - 1;

    // Find the closest past hour
    for (let i = hourly.time.length - 1; i >= 0; i--) {
        const readingTime = new Date(hourly.time[i]);
        if (readingTime <= now && hourly.us_aqi[i] != null) {
            latestIdx = i;
            break;
        }
    }

    return {
        time: hourly.time[latestIdx],
        pm2_5: hourly.pm2_5?.[latestIdx],
        pm10: hourly.pm10?.[latestIdx],
        ozone: hourly.ozone?.[latestIdx],
        nitrogen_dioxide: hourly.nitrogen_dioxide?.[latestIdx],
        sulphur_dioxide: hourly.sulphur_dioxide?.[latestIdx],
        carbon_monoxide: hourly.carbon_monoxide?.[latestIdx],
        dust: hourly.dust?.[latestIdx],
        uv_index: hourly.uv_index?.[latestIdx],
        aqi_eu: hourly.european_aqi?.[latestIdx],
        aqi_us: hourly.us_aqi?.[latestIdx],
    };
}

export { PRESET_CITIES, fetchAirQuality, searchCities, getLatestReading };
