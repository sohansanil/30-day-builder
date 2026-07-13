import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  ScatterChart,
} from "lucide-react";
import {
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function MetricCard({
  label,
  value,
  best,
}: {
  label: string;
  value: string | number;
  best?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg ${best ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-zinc-800/50"}`}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${best ? "text-emerald-400" : "text-zinc-200"}`}>
        {value ?? "N/A"}
      </p>
    </div>
  );
}

function ModelCard({ model, isBest }: { model: any; isBest: boolean }) {
  return (
    <Card className={`bg-zinc-900/50 border-zinc-800 ${isBest ? "ring-1 ring-emerald-500/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBest ? "bg-emerald-500/20" : "bg-zinc-800"}`}>
              <Brain className={`w-4 h-4 ${isBest ? "text-emerald-400" : "text-zinc-400"}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-200">{model.name}</CardTitle>
              <p className="text-xs text-zinc-500">{model.short_name}</p>
            </div>
          </div>
          {isBest && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Best Fit
            </Badge>
          )}
        </div>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{model.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="Silhouette" value={model.metrics.silhouette} best={isBest} />
          <MetricCard label="Calinski-Harabasz" value={model.metrics.calinski_harabasz} />
          <MetricCard label="AIC" value={model.metrics.aic != null ? Math.round(model.metrics.aic) : "N/A"} />
          <MetricCard label="BIC" value={model.metrics.bic != null ? Math.round(model.metrics.bic) : "N/A"} />
        </div>

        {/* Strengths */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Strengths</p>
          <div className="space-y-1.5">
            {model.strengths.map((s: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Weaknesses</p>
          <div className="space-y-1.5">
            {model.weaknesses.map((w: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                {w}
              </div>
            ))}
          </div>
        </div>

        {/* Regimes detected */}
        <div className="pt-3 border-t border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Detected Regimes</p>
          <div className="flex flex-wrap gap-2">
            {model.regimes.map((r: any) => (
              <div
                key={r.regime_id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: `${r.color}15`, color: r.color, border: `1px solid ${r.color}30` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.name} ({r.percentage}%)
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransitionMatrix() {
  const { data: matrixData, isLoading } = trpc.models.transitionMatrix.useQuery();

  if (isLoading) return <Skeleton className="h-64 bg-zinc-800" />;
  if (!matrixData) return null;

  const { regimes, matrix } = matrixData;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-zinc-200 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-zinc-500" />
          HMM Transition Matrix
        </CardTitle>
        <p className="text-sm text-zinc-500">
          Probability of moving from one regime to another (rows = from, columns = to)
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-500">From \ To</TableHead>
                {regimes.map((r: any) => (
                  <TableHead key={r.id} className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-zinc-400 text-xs">{r.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map((row: number[], i: number) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: regimes[i]?.color }} />
                      {regimes[i]?.name}
                    </div>
                  </TableCell>
                  {row.map((prob, j) => (
                    <TableCell key={j} className="text-center">
                      <span
                        className={`text-sm font-mono ${
                          i === j ? "text-emerald-400 font-semibold" : "text-zinc-400"
                        }`}
                      >
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PCAScatter() {
  const { data: dailyData, isLoading } = trpc.market.dailyData.useQuery({});

  if (isLoading) return <Skeleton className="h-80 bg-zinc-800" />;

  const scatterData = dailyData?.map((d) => ({
    x: d.pca_x,
    y: d.pca_y,
    regime: d.regime_hmm_name,
    color: d.regime_hmm_color,
    date: d.date,
  })) ?? [];

  const regimeColors: Record<string, string> = {};
  scatterData.forEach((d) => {
    regimeColors[d.regime] = d.color;
  });

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-zinc-200 flex items-center gap-2">
          <ScatterChart className="w-4 h-4 text-zinc-500" />
          PCA Visualization
        </CardTitle>
        <p className="text-sm text-zinc-500">
          Daily observations projected onto first two principal components, colored by HMM regime
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ReScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                type="number"
                dataKey="x"
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                label={{ value: "PC1", position: "bottom", fill: "#71717a", fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                label={{ value: "PC2", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-xs text-zinc-500">{d.date}</p>
                      <p className="text-sm font-semibold" style={{ color: d.color }}>{d.regime}</p>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ReScatterChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {Object.entries(regimeColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-zinc-400">{name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Models() {
  const { data: comparison, isLoading } = trpc.models.comparison.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  const models = comparison?.models ?? [];
  // Determine best model by silhouette score
  const bestModel = models.reduce((best: any, current: any) => {
    if (!best) return current;
    return (current.metrics.silhouette ?? -Infinity) > (best.metrics.silhouette ?? -Infinity)
      ? current
      : best;
  }, null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-emerald-400" />
          Model Benchmark
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Comparing unsupervised learning approaches for market regime detection
        </p>
      </div>

      {/* Features Used */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-500" />
            Features Used ({comparison?.features_used.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {comparison?.features_used.map((feat) => (
              <Badge key={feat} variant="outline" className="border-zinc-700 text-zinc-400">
                {feat.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models.map((model: any) => (
          <ModelCard
            key={model.id}
            model={model}
            isBest={model.id === bestModel?.id}
          />
        ))}
      </div>

      {/* Tabs: Transition Matrix / PCA */}
      <Tabs defaultValue="transitions" className="space-y-4">
        <TabsList className="bg-zinc-800 border border-zinc-700">
          <TabsTrigger value="transitions" className="data-[state=active]:bg-zinc-700">
            <ArrowRight className="w-4 h-4 mr-1.5" />
            Transitions
          </TabsTrigger>
          <TabsTrigger value="pca" className="data-[state=active]:bg-zinc-700">
            <ScatterChart className="w-4 h-4 mr-1.5" />
            PCA View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transitions">
          <TransitionMatrix />
        </TabsContent>
        <TabsContent value="pca">
          <PCAScatter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
