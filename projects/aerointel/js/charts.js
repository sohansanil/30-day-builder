/**
 * charts.js — Visualization Layer (Canvas API)
 * 
 * WHY Canvas instead of Chart.js or D3?
 * 1. Zero dependencies — keeps AeroIntel lightweight (only sql.js as external dep)
 * 2. You learn HOW charts actually work: coordinate systems, scaling, line drawing
 * 3. Full creative control over every pixel
 * 4. Demonstrates you can build from scratch — not just configure a library
 * 
 * HOW Canvas charts work:
 * 1. Map data values to pixel coordinates (this is called "scaling" or "normalization")
 * 2. Draw grid lines at regular intervals (context)
 * 3. Draw data points connected by lines (the chart itself)
 * 4. Draw labels and legends (readability)
 * 
 * The key math: given a value in the range [minVal, maxVal],
 * map it to a pixel position in [paddingTop, canvasHeight - paddingBottom]:
 *   y = paddingTop + chartHeight * (1 - (value - minVal) / (maxVal - minVal))
 * The (1 - ...) flips the axis because Canvas y increases downward.
 */

class TimeSeriesChart {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.padding = { top: 35, right: 25, bottom: 55, left: 65 };

        // Current data
        this.timeLabels = [];
        this.values = [];
        this.label = '';
        this.lineColor = '';
        this.thresholdValue = null;
        this.thresholdLabel = '';
        this.sma5Values = null;
        this.sma20Values = null;
        this.anomalies = null;
        this.forecastTimes = null;
        this.forecastValues = null;

        // Display toggles
        this.showSma5 = true;
        this.showSma20 = false;
        this.showAnomalies = true;
        this.showForecast = true;

        // Tooltip state
        this._hoverIndex = -1;

        // Bind events
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
        canvas.addEventListener('mousemove', this._onMouseMove);
        canvas.addEventListener('mouseleave', this._onMouseLeave);

        // Handle resize
        this._resizeObserver = new ResizeObserver(() => this.render());
        this._resizeObserver.observe(canvas.parentElement);
    }

    setData({
        timeLabels,
        values,
        label,
        lineColor,
        thresholdValue = null,
        thresholdLabel = '',
        sma5Values = null,
        sma20Values = null,
        anomalies = null,
        forecastTimes = null,
        forecastValues = null
    }) {
        this.timeLabels = timeLabels;
        this.values = values;
        this.label = label;
        this.lineColor = lineColor;
        this.thresholdValue = thresholdValue;
        this.thresholdLabel = thresholdLabel;
        this.sma5Values = sma5Values;
        this.sma20Values = sma20Values;
        this.anomalies = anomalies;
        this.forecastTimes = forecastTimes;
        this.forecastValues = forecastValues;
        this._hoverIndex = -1;
        this.render();
    }

    render() {
        const { canvas, ctx, padding } = this;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        if (!this.values.length) {
            ctx.fillStyle = this._getColor('--text-muted');
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Select a city to view trends', width / 2, height / 2);
            return;
        }

        let validValues = this.values.filter(v => v != null);
        if (this.showSma5 && this.sma5Values) {
            validValues = validValues.concat(this.sma5Values.filter(v => v != null));
        }
        if (this.showSma20 && this.sma20Values) {
            validValues = validValues.concat(this.sma20Values.filter(v => v != null));
        }
        if (this.showForecast && this.forecastValues) {
            validValues = validValues.concat(this.forecastValues.filter(v => v != null));
        }
        if (validValues.length === 0) return;

        let minVal = Math.min(...validValues);
        let maxVal = Math.max(...validValues);
        if (this.thresholdValue != null) {
            minVal = Math.min(minVal, this.thresholdValue);
            maxVal = Math.max(maxVal, this.thresholdValue);
        }
        const range = maxVal - minVal || 1;
        minVal -= range * 0.1;
        maxVal += range * 0.1;

        const xScale = (i) => padding.left + (i / (this.timeLabels.length - 1)) * chartW;
        const yScale = (v) => padding.top + chartH * (1 - (v - minVal) / (maxVal - minVal));

        // ---- LAYER 1: Grid Lines ----
        this._drawGrid(ctx, padding, chartW, chartH, minVal, maxVal, yScale, width);

        // ---- LAYER 2: WHO Threshold Line ----
        if (this.thresholdValue != null) {
            const thresholdY = yScale(this.thresholdValue);
            ctx.save();
            ctx.strokeStyle = this._getColor('--chart-threshold');
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(padding.left, thresholdY);
            ctx.lineTo(padding.left + chartW, thresholdY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = this._getColor('--chart-threshold');
            ctx.font = '600 10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(
                this.thresholdLabel || `WHO: ${this.thresholdValue}`,
                padding.left + chartW - 4,
                thresholdY - 6
            );
            ctx.restore();
        }

        // ---- LAYER 2.5: SMA overlay lines ----
        if (this.showSma5 && this.sma5Values) {
            const color = this._getColor('--chart-line-2');
            this._drawLine(ctx, this.sma5Values, xScale, yScale, color, 1.5, [4, 3]);
        }
        if (this.showSma20 && this.sma20Values) {
            const color = this._getColor('--chart-line-3');
            this._drawLine(ctx, this.sma20Values, xScale, yScale, color, 1.5, [2, 2]);
        }

        // ---- LAYER 2.7: Forecast projection line ----
        if (this.showForecast && this.forecastValues) {
            const color = this._getColor('--chart-line-4');
            this._drawLine(ctx, this.forecastValues, xScale, yScale, color, 2.0, [6, 4]);
        }

        // ---- LAYER 3: Raw Data Line ----
        ctx.save();
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        let started = false;
        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i] == null) {
                started = false;
                continue;
            }
            const x = xScale(i);
            const y = yScale(this.values[i]);
            if (!started) {
                ctx.moveTo(x, y);
                started = true;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Gradient fill under the raw line
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        const stopColor = this._getTranslucentColor(this.lineColor, 0.15);
        try {
            gradient.addColorStop(0, stopColor);
        } catch (e) {
            console.warn("Failed to set gradient start color:", stopColor, e);
            gradient.addColorStop(0, 'rgba(45, 212, 191, 0.15)');
        }
        try {
            gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');
        } catch (e) {
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        started = false;
        let lastX = padding.left;
        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i] == null) continue;
            const x = xScale(i);
            const y = yScale(this.values[i]);
            if (!started) {
                ctx.moveTo(x, padding.top + chartH);
                ctx.lineTo(x, y);
                started = true;
            } else {
                ctx.lineTo(x, y);
            }
            lastX = x;
        }
        ctx.lineTo(lastX, padding.top + chartH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // ---- LAYER 3.5: Anomaly Markers ----
        if (this.showAnomalies && this.anomalies) {
            ctx.save();
            for (let i = 0; i < this.values.length; i++) {
                const anomaly = this.anomalies[i];
                if (anomaly && this.values[i] != null) {
                    const x = xScale(i);
                    const y = yScale(this.values[i]);
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = anomaly.severity === 'severe' ? this._getColor('--aqi-unhealthy') : this._getColor('--aqi-moderate');
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.fill();
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        // ---- LAYER 4: X-Axis Labels ----
        this._drawXLabels(ctx, padding, chartW, chartH, xScale, height);

        // ---- LAYER 5: Hover Tooltip ----
        if (this._hoverIndex >= 0 && this._hoverIndex < this.timeLabels.length) {
            const hasRaw = this.values[this._hoverIndex] != null;
            const hasForecast = this.showForecast && this.forecastValues && this.forecastValues[this._hoverIndex] != null;
            if (hasRaw || hasForecast) {
                this._drawTooltip(ctx, xScale, yScale, padding, chartH);
            }
        }
    }

    _drawLine(ctx, values, xScale, yScale, color, lineWidth, lineDash = []) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        if (lineDash.length) ctx.setLineDash(lineDash);
        ctx.beginPath();

        let started = false;
        for (let i = 0; i < values.length; i++) {
            if (values[i] == null) {
                started = false;
                continue;
            }
            const x = xScale(i);
            const y = yScale(values[i]);
            if (!started) {
                ctx.moveTo(x, y);
                started = true;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    _drawGrid(ctx, padding, chartW, chartH, minVal, maxVal, yScale, width) {
        const gridColor = this._getColor('--chart-grid');
        const axisColor = this._getColor('--chart-axis');
        const numLines = 5;
        const step = (maxVal - minVal) / numLines;

        ctx.save();
        for (let i = 0; i <= numLines; i++) {
            const value = minVal + step * i;
            const y = yScale(value);

            // Grid line
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartW, y);
            ctx.stroke();

            // Y-axis label
            ctx.fillStyle = axisColor;
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(1), padding.left - 8, y + 4);
        }
        ctx.restore();
    }

    /**
     * Draw time labels on the X-axis.
     * Show every Nth label to avoid crowding.
     */
    _drawXLabels(ctx, padding, chartW, chartH, xScale, height) {
        const axisColor = this._getColor('--chart-axis');
        const count = this.timeLabels.length;
        // Show ~8 labels max
        const step = Math.max(1, Math.floor(count / 8));

        ctx.save();
        ctx.fillStyle = axisColor;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';

        for (let i = 0; i < count; i += step) {
            const x = xScale(i);
            const time = this.timeLabels[i];
            // Extract HH:MM from ISO string
            const label = time ? time.substring(11, 16) : '';
            ctx.fillText(label, x, padding.top + chartH + 20);
        }
        ctx.restore();
    }

    /**
     * Draw hover tooltip at the hovered data point.
     */
    _drawTooltip(ctx, xScale, yScale, padding, chartH) {
        const i = this._hoverIndex;
        const x = xScale(i);
        const time = this.timeLabels[i]?.substring(11, 16) || '';

        const focusValue = this.values[i] != null ? this.values[i] : (this.forecastValues ? this.forecastValues[i] : null);
        if (focusValue == null) return;
        const y = yScale(focusValue);

        // Data point dot
        ctx.save();
        ctx.fillStyle = this.lineColor;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Vertical line
        ctx.strokeStyle = this._getColor('--chart-grid');
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x, padding.top + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Collect lines to display
        const lines = [`Time: ${time}`];
        if (this.values[i] != null) {
            lines.push(`${this.label}: ${this.values[i].toFixed(1)}`);
        }
        if (this.showSma5 && this.sma5Values && this.sma5Values[i] != null) {
            lines.push(`SMA-5h: ${this.sma5Values[i].toFixed(1)}`);
        }
        if (this.showSma20 && this.sma20Values && this.sma20Values[i] != null) {
            lines.push(`SMA-20h: ${this.sma20Values[i].toFixed(1)}`);
        }
        if (this.showForecast && this.forecastValues && this.forecastValues[i] != null) {
            lines.push(`Forecast: ${this.forecastValues[i].toFixed(1)}`);
        }
        if (this.showAnomalies && this.anomalies && this.anomalies[i]) {
            lines.push(`ALERT: ${this.anomalies[i].severity === 'severe' ? '⚠️ Severe' : '💡 Mod'} Anomaly`);
        }

        // Tooltip box sizing
        ctx.font = '600 11px JetBrains Mono, monospace';
        let maxTextW = 0;
        for (const line of lines) {
            maxTextW = Math.max(maxTextW, ctx.measureText(line).width);
        }
        
        const boxW = maxTextW + 16;
        const lineH = 15;
        const boxH = 10 + lines.length * lineH;
        const boxX = Math.min(Math.max(x - boxW / 2, padding.left), padding.left + (this.canvas.clientWidth - padding.left - padding.right) - boxW);
        const boxY = Math.min(Math.max(y - boxH - 14, 5), this.canvas.clientHeight - boxH - 5);

        // Background
        ctx.fillStyle = this._getColor('--bg-elevated');
        ctx.strokeStyle = this._getColor('--border-default');
        ctx.lineWidth = 1;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        // Text rendering
        ctx.fillStyle = this._getColor('--text-primary');
        ctx.textAlign = 'left';
        for (let j = 0; j < lines.length; j++) {
            // Color anomalies red/amber
            if (lines[j].startsWith('ALERT:')) {
                ctx.fillStyle = lines[j].includes('Severe') ? this._getColor('--aqi-unhealthy') : this._getColor('--aqi-moderate');
            } else if (lines[j].startsWith('SMA-5h:')) {
                ctx.fillStyle = this._getColor('--chart-line-2');
            } else if (lines[j].startsWith('SMA-20h:')) {
                ctx.fillStyle = this._getColor('--chart-line-3');
            } else if (lines[j].startsWith('Forecast:')) {
                ctx.fillStyle = this._getColor('--chart-line-4');
            } else {
                ctx.fillStyle = this._getColor('--text-primary');
            }
            ctx.fillText(lines[j], boxX + 8, boxY + 14 + j * lineH);
        }

        ctx.restore();
    }

    /**
     * Helper: draw a rounded rectangle path.
     */
    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    /**
     * Get a CSS custom property value from the document.
     * This lets our Canvas code use the same theme colors as the CSS.
     */
    _getColor(varName) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#888';
    }

    /**
     * Helper: convert a CSS color string to a translucent rgba/oklch color.
     */
    _getTranslucentColor(colorStr, alpha) {
        if (!colorStr) return `rgba(88, 166, 255, ${alpha})`;
        colorStr = colorStr.trim();
        
        // 1. If it's hex (like #14b8a6)
        if (colorStr.startsWith('#')) {
            let hex = colorStr.substring(1);
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        // 2. If it's rgb/rgba
        if (colorStr.startsWith('rgb')) {
            const matches = colorStr.match(/\d+/g);
            if (matches && matches.length >= 3) {
                return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${alpha})`;
            }
        }
        
        // 3. If it's oklch
        if (colorStr.startsWith('oklch')) {
            // Check if there is already a slash inside (e.g. oklch(L C H / A))
            if (colorStr.includes('/')) {
                // Replace everything after / with alpha
                return colorStr.replace(/\/[\s\d\.]+\)/, `/ ${alpha})`);
            }
            // Otherwise, replace closing paren
            return colorStr.replace(')', ` / ${alpha})`);
        }
        
        return colorStr;
    }

    /**
     * Mouse move handler — find nearest data point for tooltip.
     */
    _onMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const chartW = rect.width - this.padding.left - this.padding.right;

        if (mouseX < this.padding.left || mouseX > rect.width - this.padding.right) {
            this._hoverIndex = -1;
            this.render();
            return;
        }

        const ratio = (mouseX - this.padding.left) / chartW;
        const index = Math.round(ratio * (this.timeLabels.length - 1));
        const clampedIndex = Math.max(0, Math.min(index, this.timeLabels.length - 1));

        if (clampedIndex !== this._hoverIndex) {
            this._hoverIndex = clampedIndex;
            this.render();
        }
    }

    /**
     * Mouse leave handler — hide tooltip.
     */
    _onMouseLeave() {
        this._hoverIndex = -1;
        this.render();
    }
}

export { TimeSeriesChart };
