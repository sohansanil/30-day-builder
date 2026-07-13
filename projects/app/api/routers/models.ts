import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import * as fs from "fs";
import * as path from "path";

const ML_DATA_DIR = path.join(process.cwd(), "api", "ml_data");

function loadJson<T>(filename: string): T {
  const filePath = path.join(ML_DATA_DIR, filename);
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as T;
}

interface RegimeInfo {
  regime_id: number;
  name: string;
  color: string;
  count: number;
  percentage: number;
  avg_annual_return: number;
  avg_volatility: number;
  avg_drawdown: number;
  avg_momentum_30d: number;
}

interface ModelInfo {
  id: string;
  name: string;
  short_name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  metrics: {
    silhouette: number | null;
    calinski_harabasz: number | null;
    aic: number | null;
    bic: number | null;
  };
  regimes: RegimeInfo[];
  transition_matrix?: number[][];
}

interface ModelComparison {
  models: ModelInfo[];
  features_used: string[];
  data_range: { start: string; end: string; trading_days: number };
}

interface FeatureImportanceItem {
  regime_id: number;
  regime_name: string;
  feature: string;
  z_score: number;
  importance: number;
}

export const modelsRouter = createRouter({
  comparison: publicQuery.query((): ModelComparison => {
    return loadJson<ModelComparison>("model_comparison.json");
  }),

  featureImportance: publicQuery
    .input(
      z.object({
        regimeId: z.number().optional(),
      })
    )
    .query(({ input }): FeatureImportanceItem[] => {
      const data = loadJson<FeatureImportanceItem[]>("feature_importance.json");
      if (input.regimeId !== undefined) {
        return data.filter((d) => d.regime_id === input.regimeId);
      }
      return data;
    }),

  transitionMatrix: publicQuery.query(() => {
    const comparison = loadJson<ModelComparison>("model_comparison.json");
    const hmm = comparison.models.find((m) => m.id === "hmm");
    return {
      regimes: hmm?.regimes.map((r) => ({ id: r.regime_id, name: r.name, color: r.color })) ?? [],
      matrix: hmm?.transition_matrix ?? [],
    };
  }),
});
