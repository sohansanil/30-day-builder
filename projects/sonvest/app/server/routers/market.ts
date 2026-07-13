import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import * as fs from "fs";
import * as path from "path";

const ML_DATA_DIR = path.join(process.cwd(), "api", "ml_data");

function loadJson<T>(filename: string): T {
  const filePath = path.join(ML_DATA_DIR, filename);
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as T;
}

// ── types matching the JSON output ──────────────────────────
interface DailyDataPoint {
  date: string;
  close: number;
  returns: number;
  volume: number;
  volatility_20d: number;
  momentum_30d: number;
  drawdown: number;
  regime_hmm: number;
  regime_hmm_name: string;
  regime_hmm_color: string;
  regime_gmm: number;
  regime_kmeans: number;
  hmm_proba: number[];
  pca_x: number;
  pca_y: number;
}

interface CurrentState {
  date: string;
  close: number;
  regime_id: number;
  regime_name: string;
  regime_color: string;
  confidence: number;
  regime_probabilities: { regime_id: number; probability: number; regime_name: string }[];
  historical_similarities: string[];
  explanations: string[];
  volatility: number;
  momentum_30d: number;
  drawdown: number;
}

interface Summary {
  data_range: { start: string; end: string; trading_days: number };
  latest_close: number;
  latest_date: string;
  overall_return: number;
  avg_annual_volatility: number;
  max_drawdown: number;
  current_regime: string;
  models_trained: string[];
  features_count: number;
}

export const marketRouter = createRouter({
  summary: publicQuery.query((): Summary => {
    return loadJson<Summary>("summary.json");
  }),

  currentState: publicQuery.query((): CurrentState => {
    return loadJson<CurrentState>("current_state.json");
  }),

  dailyData: publicQuery
    .input(
      z.object({
        model: z.enum(["hmm", "gmm", "kmeans"]).optional().default("hmm"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(({ input }): DailyDataPoint[] => {
      const data = loadJson<DailyDataPoint[]>("daily_data.json");
      let filtered = data;

      if (input.startDate) {
        filtered = filtered.filter((d) => d.date >= input.startDate!);
      }
      if (input.endDate) {
        filtered = filtered.filter((d) => d.date <= input.endDate!);
      }

      return filtered;
    }),

  regimeDistribution: publicQuery.query(() => {
    const data = loadJson<DailyDataPoint[]>("daily_data.json");
    const distribution: Record<string, { count: number; percentage: number; color: string }> = {};

    for (const d of data) {
      const name = d.regime_hmm_name;
      if (!distribution[name]) {
        distribution[name] = { count: 0, percentage: 0, color: d.regime_hmm_color };
      }
      distribution[name].count++;
    }

    const total = data.length;
    for (const key of Object.keys(distribution)) {
      distribution[key].percentage = Math.round((distribution[key].count / total) * 1000) / 10;
    }

    return distribution;
  }),

  replayPeriods: publicQuery.query(() => {
    // Return notable periods for replay selection
    return [
      { label: "2022 Bear Market", start: "2022-08-01", end: "2022-11-01" },
      { label: "2023 Recovery", start: "2023-03-01", end: "2023-06-01" },
      { label: "2024 Bull Run", start: "2024-01-01", end: "2024-04-01" },
      { label: "2024 Volatility", start: "2024-07-01", end: "2024-10-01" },
      { label: "2025 Trend", start: "2025-01-01", end: "2025-04-01" },
      { label: "2026 Recent", start: "2026-01-01", end: "2026-07-08" },
    ];
  }),
});
