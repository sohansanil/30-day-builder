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

function calculateSMA(values, period) {
    const sma = [];
    for (let i = 0; i < values.length; i++) {
        if (i < period - 1) {
            sma.push(null);
            continue;
        }
        let sum = 0;
        let validCount = 0;
        for (let j = 0; j < period; j++) {
            const val = values[i - j];
            if (val != null) {
                sum += val;
                validCount++;
            }
        }
        sma.push(validCount === period ? sum / period : null);
    }
    return sma;
}

function calculateVolatility(values, period) {
    const vol = [];
    for (let i = 0; i < values.length; i++) {
        if (i < period - 1) {
            vol.push(null);
            continue;
        }
        // Calculate mean of window
        let sum = 0;
        let validCount = 0;
        const windowValues = [];
        for (let j = 0; j < period; j++) {
            const val = values[i - j];
            if (val != null) {
                sum += val;
                validCount++;
                windowValues.push(val);
            }
        }
        
        if (validCount < period) {
            vol.push(null);
            continue;
        }
        
        const mean = sum / period;

        // Calculate variance
        let sumSqDiff = 0;
        for (const val of windowValues) {
            sumSqDiff += Math.pow(val - mean, 2);
        }
        // Bessel's correction: divide by (N-1) instead of N
        const variance = period > 1 ? sumSqDiff / (period - 1) : 0;
        vol.push(Math.sqrt(variance));
    }
    return vol;
}

function detectAnomalies(values, period = 24, zThreshold = 2.0) {
    const anomalies = [];
    const vol = calculateVolatility(values, period);
    
    // Calculate rolling mean for Z-score calculation
    const rollingMeans = [];
    for (let i = 0; i < values.length; i++) {
        if (i < period - 1) {
            rollingMeans.push(null);
            continue;
        }
        let sum = 0;
        let validCount = 0;
        for (let j = 0; j < period; j++) {
            const val = values[i - j];
            if (val != null) {
                sum += val;
                validCount++;
            }
        }
        rollingMeans.push(validCount === period ? sum / period : null);
    }

    for (let i = 0; i < values.length; i++) {
        const val = values[i];
        const mean = rollingMeans[i];
        const stdDev = vol[i];

        if (val == null || mean == null || stdDev == null || stdDev < 0.01) {
            anomalies.push(null);
            continue;
        }

        const zScore = (val - mean) / stdDev;
        const absZ = Math.abs(zScore);

        if (absZ >= zThreshold) {
            anomalies.push({
                index: i,
                value: val,
                zScore: zScore,
                severity: absZ > 3.0 ? 'severe' : 'moderate'
            });
        } else {
            anomalies.push(null);
        }
    }
    return anomalies;
}

function calculateLinearRegression(values, times, forecastPeriods = 6) {
    // Filter out nulls for model training, but keep track of indices
    const validData = [];
    for (let i = 0; i < values.length; i++) {
        if (values[i] != null) {
            validData.push({ x: i, y: values[i] });
        }
    }

    if (validData.length < 2) {
        return {
            slope: 0,
            intercept: 0,
            forecastTimes: [],
            forecastValues: []
        };
    }

    const n = validData.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const pt of validData) {
        sumX += pt.x;
        sumY += pt.y;
        sumXY += pt.x * pt.y;
        sumXX += pt.x * pt.x;
    }

    // OLS formulas
    const denominator = n * sumXX - sumX * sumX;
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast projections
    const lastIndex = values.length - 1;
    const forecastValues = [];
    const forecastTimes = [];
    
    // We want the forecast array to align with the historical timeline,
    // so we pad the start with nulls up to the latest historical point.
    const paddedForecast = Array(values.length).fill(null);
    
    // The link point between raw and forecast is the last historical point
    if (values.length > 0) {
        paddedForecast[values.length - 1] = values[values.length - 1];
    }

    let lastTime = times.length > 0 ? new Date(times[times.length - 1]) : new Date();

    for (let k = 1; k <= forecastPeriods; k++) {
        const xFuture = lastIndex + k;
        const yPred = slope * xFuture + intercept;
        
        // Project time
        const futureTime = new Date(lastTime.getTime() + k * 60 * 60 * 1000);
        
        forecastTimes.push(futureTime.toISOString());
        paddedForecast.push(yPred);
    }

    return {
        slope,
        intercept,
        forecastTimes,
        forecastValues: paddedForecast
    };
}

function calculatePearsonCorrelation(seriesA, seriesB) {
    if (seriesA.length !== seriesB.length || seriesA.length < 2) {
        return 0;
    }

    // Filter out pairs containing nulls
    const validA = [];
    const validB = [];
    for (let i = 0; i < seriesA.length; i++) {
        if (seriesA[i] != null && seriesB[i] != null) {
            validA.push(seriesA[i]);
            validB.push(seriesB[i]);
        }
    }

    const n = validA.length;
    if (n < 2) return 0;

    // Calculate means
    let sumA = 0;
    let sumB = 0;
    for (let i = 0; i < n; i++) {
        sumA += validA[i];
        sumB += validB[i];
    }
    const meanA = sumA / n;
    const meanB = sumB / n;

    // Calculate covariance and standard deviations
    let sumProductDiff = 0;
    let sumSqDiffA = 0;
    let sumSqDiffB = 0;

    for (let i = 0; i < n; i++) {
        const diffA = validA[i] - meanA;
        const diffB = validB[i] - meanB;
        sumProductDiff += diffA * diffB;
        sumSqDiffA += diffA * diffA;
        sumSqDiffB += diffB * diffB;
    }

    if (sumSqDiffA === 0 || sumSqDiffB === 0) return 0;

    return sumProductDiff / Math.sqrt(sumSqDiffA * sumSqDiffB);
}

function generateNaturalLanguageInsights(city, latestReading, slope, latestVol, anomalyCount, selectedPollutant) {
    if (!latestReading) return "No active telemetry data available for this location.";

    const name = WHO_THRESHOLDS[selectedPollutant]?.name || selectedPollutant;
    const value = latestReading[selectedPollutant];
    const threshold = WHO_THRESHOLDS[selectedPollutant]?.limit || 15;
    const ratio = value / threshold;
    const unit = WHO_THRESHOLDS[selectedPollutant]?.unit || '';

    let levelAdvice = '';
    if (ratio <= 0.5) levelAdvice = `which is well within the safe WHO guideline of ${threshold} ${unit} (currently at **${ratio.toFixed(1)}x** the threshold).`;
    else if (ratio <= 1.0) levelAdvice = `which is approaching the WHO safety threshold of ${threshold} ${unit} (currently at **${ratio.toFixed(1)}x**). Exposure is safe but trends should be monitored.`;
    else if (ratio <= 2.0) levelAdvice = `which exceeds the WHO guideline by **${ratio.toFixed(1)}x**. Sensitive individuals may experience respiratory discomfort.`;
    else levelAdvice = `which is at a hazardous level of **${ratio.toFixed(1)}x** the WHO safety guideline. Healthy individuals should limit outdoor activities.`;

    let trendAdvice = '';
    if (slope > 0.05) trendAdvice = `A linear regression model projects a **rising trend (+${slope.toFixed(2)} ${unit}/hr)** over the next 6 hours, indicating deteriorating conditions.`;
    else if (slope < -0.05) trendAdvice = `The predictive trend line is **falling (${slope.toFixed(2)} ${unit}/hr)**, indicating expected clearance and improving air quality.`;
    else trendAdvice = `The forecasting model indicates a **flat trajectory**, suggesting stable air concentrations over the next 6 hours.`;

    let volAdvice = '';
    if (latestVol == null) {
        volAdvice = ``;
    } else {
        const volRatio = latestVol / threshold;
        if (volRatio <= 0.15) {
            volAdvice = `Atmospheric dispersion dynamics are **Stable**, meaning sudden pollution swings are highly unlikely.`;
        } else if (volRatio <= 0.35) {
            volAdvice = `Dispersion patterns show **Moderate instability**, likely driven by localized traffic cycles or changing winds.`;
        } else {
            volAdvice = `Atmospheric conditions are **Highly Turbulent**. Pollutant levels are fluctuating rapidly; caution is advised as conditions can change quickly.`;
        }
    }

    let anomalyAdvice = '';
    if (anomalyCount === 0) {
        anomalyAdvice = `No statistical anomalies have been detected in the last 24 hours, suggesting normal daily cycling.`;
    } else {
        anomalyAdvice = `AeroIntel flagged **${anomalyCount} statistical anomaly alert${anomalyCount > 1 ? 's' : ''}** in the last 24 hours, indicating unusual local emissions or extreme wind shifts.`;
    }

    return `
<strong>AeroIntel Analyst Diagnostic Report for ${city}:</strong>
Currently analyzing <strong>${name}</strong> concentrations (latest: **${value?.toFixed(1)} ${unit}**), ${levelAdvice}

${trendAdvice} ${volAdvice}

${anomalyAdvice}

<em>Tip: Click any cell in the Pollutant Correlation Matrix below to investigate chemical emissions relationships.</em>
    `.trim();
}

export {
    AQI_LEVELS,
    classifyAQI,
    WHO_THRESHOLDS,
    getPollutantStatus,
    getPollutantBarColor,
    getPollutantKeys,
    calculateSMA,
    calculateVolatility,
    detectAnomalies,
    calculateLinearRegression,
    calculatePearsonCorrelation,
    generateNaturalLanguageInsights,
};
