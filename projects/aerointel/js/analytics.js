/**
 * analytics.js — Data Classification & Domain Knowledge Layer
 * 
 * WHY this module exists:
 * Raw numbers (PM2.5 = 35.2 μg/m³) mean nothing to most users.
 * This module transforms raw data into DECISIONS:
 *   35.2 μg/m³ → "🟡 Moderate — sensitive individuals should limit outdoor exertion"
 * 
 * That transformation — raw data → actionable insight — is the core of data science.
 * 
 * The thresholds here aren't arbitrary. They're based on:
 * - US EPA Air Quality Index (AQI) breakpoints (40+ years of epidemiological research)
 * - WHO Air Quality Guidelines (2021 update, based on systematic reviews of health studies)
 * 
 * WHY is domain knowledge important?
 * A generic developer displays numbers. A data scientist understands what the numbers MEAN.
 * In an interview, being able to say "O₃ peaks in the afternoon because UV radiation
 * drives photochemical reactions with NO₂ and VOCs" shows domain depth.
 */

// =============================================
// AQI Classification System (US EPA Scale)
// =============================================

/**
 * US EPA AQI breakpoints.
 * Each level represents a range of health concern, defined by decades of
 * epidemiological research connecting pollutant concentrations to health outcomes.
 * 
 * Real-world context:
 * - "Good" doesn't mean zero pollution — it means the health risk is negligible
 * - "Moderate" is where sensitive populations (asthma, elderly, children) start being affected
 * - "Hazardous" triggers emergency protocols in many countries
 */
const AQI_LEVELS = [
    {
        max: 50,
        label: 'Good',
        cssColor: 'var(--aqi-good)',
        hex: '#4ade80',
        emoji: '🟢',
        advisory: 'Air quality is satisfactory. Safe for all outdoor activities.',
    },
    {
        max: 100,
        label: 'Moderate',
        cssColor: 'var(--aqi-moderate)',
        hex: '#facc15',
        emoji: '🟡',
        advisory: 'Acceptable quality. Sensitive individuals should limit prolonged outdoor exertion.',
    },
    {
        max: 150,
        label: 'Unhealthy (Sensitive)',
        cssColor: 'var(--aqi-usg)',
        hex: '#fb923c',
        emoji: '🟠',
        advisory: 'Sensitive groups (asthma, elderly, children) should reduce outdoor activity.',
    },
    {
        max: 200,
        label: 'Unhealthy',
        cssColor: 'var(--aqi-unhealthy)',
        hex: '#f87171',
        emoji: '🔴',
        advisory: 'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.',
    },
    {
        max: 300,
        label: 'Very Unhealthy',
        cssColor: 'var(--aqi-very-unhealthy)',
        hex: '#c084fc',
        emoji: '🟣',
        advisory: 'Health alert: significant risk of health effects for everyone. Avoid outdoor activities.',
    },
    {
        max: Infinity,
        label: 'Hazardous',
        cssColor: 'var(--aqi-hazardous)',
        hex: '#991b1b',
        emoji: '🟤',
        advisory: 'Emergency conditions. Everyone is likely to be affected. Remain indoors.',
    },
];

/**
 * Classify an AQI value into its health category.
 * 
 * @param {number|null} value - US AQI value (0-500+)
 * @returns {object} Classification with label, color, emoji, and health advisory
 */
function classifyAQI(value) {
    if (value == null || isNaN(value)) {
        return {
            label: 'N/A',
            cssColor: 'var(--text-muted)',
            hex: '#888888',
            emoji: '⚪',
            advisory: 'Air quality data is currently unavailable for this location.',
        };
    }
    return AQI_LEVELS.find(level => value <= level.max);
}


// =============================================
// WHO Pollutant Guideline Thresholds
// =============================================

/**
 * WHO Air Quality Guidelines (2021).
 * 
 * These are the concentration limits the World Health Organization recommends
 * for protecting human health. They're based on systematic reviews of thousands
 * of health studies worldwide.
 * 
 * The 'limit' value is the 24-hour mean guideline (except O₃ which uses 8-hour peak).
 * Exceeding these thresholds increases risk of respiratory disease, cardiovascular
 * events, and premature mortality.
 * 
 * WHY do we compare against these?
 * Because showing "PM2.5 = 35" is meaningless. Showing "PM2.5 = 35 (2.3× WHO limit)"
 * transforms data into a health assessment. This is data science in practice:
 * contextualize raw numbers with domain-specific reference points.
 */
const WHO_THRESHOLDS = {
    pm2_5: {
        limit: 15,
        unit: 'μg/m³',
        name: 'PM2.5',
        fullName: 'Fine Particulate Matter',
        description: 'Particles < 2.5μm — penetrate lungs and enter bloodstream',
    },
    pm10: {
        limit: 45,
        unit: 'μg/m³',
        name: 'PM10',
        fullName: 'Coarse Particulate Matter',
        description: 'Particles < 10μm — irritate airways and lungs',
    },
    ozone: {
        limit: 100,
        unit: 'μg/m³',
        name: 'O₃',
        fullName: 'Ground-Level Ozone',
        description: 'Formed by UV reacting with NO₂ — triggers asthma, damages lungs',
    },
    nitrogen_dioxide: {
        limit: 25,
        unit: 'μg/m³',
        name: 'NO₂',
        fullName: 'Nitrogen Dioxide',
        description: 'Traffic/combustion pollutant — causes respiratory inflammation',
    },
    sulphur_dioxide: {
        limit: 40,
        unit: 'μg/m³',
        name: 'SO₂',
        fullName: 'Sulphur Dioxide',
        description: 'Industrial pollutant — breathing difficulties, acid rain precursor',
    },
    carbon_monoxide: {
        limit: 4000,
        unit: 'μg/m³',
        name: 'CO',
        fullName: 'Carbon Monoxide',
        description: 'Combustion byproduct — reduces oxygen delivery to organs',
    },
};

/**
 * Assess a pollutant reading against its WHO guideline.
 * 
 * Returns a ratio (value / limit) and a status classification.
 * This is a simple but powerful analytics technique:
 * normalize values to a common scale for comparison.
 * 
 * @param {string} key - Pollutant key (e.g., 'pm2_5')
 * @param {number} value - Measured concentration
 * @returns {object} { ratio, status, threshold }
 */
function getPollutantStatus(key, value) {
    const threshold = WHO_THRESHOLDS[key];
    if (!threshold || value == null || isNaN(value)) {
        return { ratio: 0, status: 'unknown', threshold: null };
    }

    const ratio = value / threshold.limit;

    let status;
    if (ratio <= 0.5) status = 'good';          // Well within guidelines
    else if (ratio <= 0.75) status = 'fair';     // Approaching guidelines
    else if (ratio <= 1.0) status = 'moderate';  // Near the limit
    else if (ratio <= 2.0) status = 'exceeded';  // Exceeds WHO guidelines
    else status = 'dangerous';                    // Severely exceeds

    return { ratio, status, threshold };
}

/**
 * Get the CSS color for a pollutant bar based on its ratio to the WHO limit.
 * 
 * This creates a smooth color gradient from green → yellow → orange → red
 * as pollution levels increase relative to health guidelines.
 * 
 * @param {number} ratio - value / WHO limit
 * @returns {string} CSS color value
 */
function getPollutantBarColor(ratio) {
    if (ratio <= 0.5) return 'var(--aqi-good)';
    if (ratio <= 0.75) return 'var(--aqi-moderate)';
    if (ratio <= 1.0) return 'var(--aqi-usg)';
    if (ratio <= 2.0) return 'var(--aqi-unhealthy)';
    return 'var(--aqi-very-unhealthy)';
}

/**
 * Get the list of pollutant keys we track (excluding non-pollutant metrics like UV).
 * Used by charts and breakdown displays.
 * 
 * @returns {string[]} Array of pollutant keys
 */
function getPollutantKeys() {
    return Object.keys(WHO_THRESHOLDS);
}

export {
    AQI_LEVELS,
    classifyAQI,
    WHO_THRESHOLDS,
    getPollutantStatus,
    getPollutantBarColor,
    getPollutantKeys,
};
