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

    /**
     * Set chart data and trigger a render.
     * 
     * @param {object} options
     * @param {string[]} options.timeLabels - Array of ISO time strings
     * @param {number[]} options.values - Array of data values
     * @param {string} options.label - Dataset label (e.g., "PM2.5")
     * @param {string} options.lineColor - CSS color for the data line
     * @param {number|null} options.thresholdValue - Optional horizontal threshold line
     * @param {string} options.thresholdLabel - Label for the threshold
     */
    setData({ timeLabels, values, label, lineColor, thresholdValue = null, thresholdLabel = '' }) {
        this.timeLabels = timeLabels;
        this.values = values;
        this.label = label;
        this.lineColor = lineColor;
        this.thresholdValue = thresholdValue;
        this.thresholdLabel = thresholdLabel;
        this._hoverIndex = -1;
        this.render();
    }

    /**
     * Main render method — called whenever data changes or canvas resizes.
     * 
     * Canvas rendering follows this pattern:
     * 1. Size the canvas (handle high-DPI screens)
     * 2. Clear everything
     * 3. Calculate scales (data range → pixel range)
     * 4. Draw layers bottom-to-top: grid → threshold → data → axes → tooltip
     */
    render() {
        const { canvas, ctx, padding } = this;

        // High-DPI support: devicePixelRatio handles Retina displays.
        // Without this, Canvas looks blurry on high-DPI screens.
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        // Chart drawing area (inside padding)
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // If no data, show placeholder
        if (!this.values.length) {
            ctx.fillStyle = this._getColor('--text-muted');
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Select a city to view trends', width / 2, height / 2);
            return;
        }

        // Filter out null values for range calculation
        const validValues = this.values.filter(v => v != null);
        if (validValues.length === 0) return;

        // Calculate value range with padding
        let minVal = Math.min(...validValues);
        let maxVal = Math.max(...validValues);
        if (this.thresholdValue != null) {
            minVal = Math.min(minVal, this.thresholdValue);
            maxVal = Math.max(maxVal, this.thresholdValue);
        }
        // Add 10% padding to avoid lines touching edges
        const range = maxVal - minVal || 1;
        minVal -= range * 0.1;
        maxVal += range * 0.1;

        // Scaling functions: map data values ↔ pixel positions
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

            // Label
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

        // ---- LAYER 3: Data Line ----
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

        // Gradient fill under the line
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, this.lineColor.replace(')', ', 0.2)').replace('oklch', 'oklch'));
        // Fallback if oklch doesn't work in gradient
        gradient.addColorStop(0, `rgba(88, 166, 255, 0.15)`);
        gradient.addColorStop(1, `rgba(88, 166, 255, 0)`);

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

        // ---- LAYER 4: X-Axis Labels ----
        this._drawXLabels(ctx, padding, chartW, chartH, xScale, height);

        // ---- LAYER 5: Hover Tooltip ----
        if (this._hoverIndex >= 0 && this._hoverIndex < this.values.length && this.values[this._hoverIndex] != null) {
            this._drawTooltip(ctx, xScale, yScale, padding, chartH);
        }
    }

    /**
     * Draw horizontal grid lines and Y-axis labels.
     */
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
        const y = yScale(this.values[i]);
        const value = this.values[i];
        const time = this.timeLabels[i]?.substring(11, 16) || '';

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

        // Tooltip box
        const text = `${value.toFixed(1)} · ${time}`;
        ctx.font = '600 12px JetBrains Mono, monospace';
        const textWidth = ctx.measureText(text).width;
        const boxW = textWidth + 16;
        const boxH = 28;
        const boxX = Math.min(Math.max(x - boxW / 2, padding.left), padding.left + (this.canvas.clientWidth - padding.left - padding.right) - boxW);
        const boxY = y - boxH - 14;

        // Background
        ctx.fillStyle = this._getColor('--bg-elevated');
        ctx.strokeStyle = this._getColor('--border-default');
        ctx.lineWidth = 1;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = this._getColor('--text-primary');
        ctx.textAlign = 'center';
        ctx.fillText(text, boxX + boxW / 2, boxY + 18);

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
