import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  ArrowDownRight,
  Brain,
  Calendar,
  Layers,
} from "lucide-react";

function RegimeIcon({ name }: { name: string }) {
  if (name.includes("Bull")) return <TrendingUp className="w-5 h-5" />;
  if (name.includes("Bear")) return <TrendingDown className="w-5 h-5" />;
  if (name.includes("Volatil")) return <Zap className="w-5 h-5" />;
  if (name.includes("Recovery")) return <Activity className="w-5 h-5" />;
  return <BarChart3 className="w-5 h-5" />;
}

function RegimeBadge({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      <RegimeIcon name={name} />
      {name}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Icon className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; close: number; regime_hmm_name: string; regime_hmm_color: string } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-1">{data.date}</p>
      <p className="text-sm font-semibold text-zinc-100">{data.close.toLocaleString()}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.regime_hmm_color }} />
        <span className="text-xs" style={{ color: data.regime_hmm_color }}>
          {data.regime_hmm_name}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: summary, isLoading: summaryLoading } = trpc.market.summary.useQuery();
  const { data: currentState, isLoading: stateLoading } = trpc.market.currentState.useQuery();
  const { data: dailyData, isLoading: dailyLoading } = trpc.market.dailyData.useQuery({});
  const { data: regimeDist } = trpc.market.regimeDistribution.useQuery();

  const isLoading = summaryLoading || stateLoading || dailyLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 bg-zinc-800" />
          ))}
        </div>
        <Skeleton className="h-96 bg-zinc-800" />
      </div>
    );
  }

  // Show last 90 days on chart by default
  const chartData = dailyData?.slice(-90) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Market Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            S&P 500 regime detection via Hidden Markov Model
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentState && (
            <>
              <RegimeBadge name={currentState.regime_name} color={currentState.regime_color} />
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                <Brain className="w-3 h-3 mr-1" />
                {currentState.confidence}% confidence
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Latest Close"
            value={`${summary.latest_close.toLocaleString()}`}
            subtitle={summary.latest_date}
            icon={Activity}
          />
          <StatCard
            title="Overall Return"
            value={`${summary.overall_return > 0 ? "+" : ""}${summary.overall_return}%`}
            subtitle={`Since ${summary.data_range.start}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Avg Volatility"
            value={`${summary.avg_annual_volatility}%`}
            subtitle="Annualized"
            icon={Zap}
          />
          <StatCard
            title="Max Drawdown"
            value={`${summary.max_drawdown}%`}
            subtitle="Worst peak-to-trough"
            icon={ArrowDownRight}
          />
        </div>
      )}

      {/* Main Chart + Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                Price & Regime Overlay
              </CardTitle>
              <span className="text-xs text-zinc-500">Last 90 trading days</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={{ stroke: "#27272a" }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={{ stroke: "#27272a" }}
                    tickFormatter={(v: number) => v.toLocaleString()}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                  />
                  {/* Regime change markers */}
                  {chartData.map((d, i) => {
                    if (i === 0) return null;
                    if (d.regime_hmm_name !== chartData[i - 1].regime_hmm_name) {
                      return (
                        <ReferenceLine
                          key={d.date}
                          x={d.date}
                          stroke={d.regime_hmm_color}
                          strokeDasharray="4 4"
                          strokeOpacity={0.6}
                        />
                      );
                    }
                    return null;
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Current Explanation Panel */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-200 flex items-center gap-2">
              <Brain className="w-4 h-4 text-zinc-500" />
              Why This Regime?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentState?.explanations.map((exp, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{exp}</p>
              </div>
            ))}

            <div className="pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">
                Regime Probabilities
              </p>
              {currentState?.regime_probabilities
                .sort((a, b) => b.probability - a.probability)
                .map((rp) => (
                  <div key={rp.regime_id} className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rp.regime_name.includes("Bull") ? "#10B981" : rp.regime_name.includes("Bear") ? "#EF4444" : rp.regime_name.includes("Volatil") ? "#F59E0B" : "#3B82F6" }} />
                    <span className="text-xs text-zinc-400 flex-1">{rp.regime_name}</span>
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${rp.probability}%`,
                          backgroundColor: rp.regime_name.includes("Bull") ? "#10B981" : rp.regime_name.includes("Bear") ? "#EF4444" : rp.regime_name.includes("Volatil") ? "#F59E0B" : "#3B82F6",
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-300 w-10 text-right">{rp.probability}%</span>
                  </div>
                ))}
            </div>

            {currentState?.historical_similarities && (
              <div className="pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">
                  Similar Historical Periods
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentState.historical_similarities.map((date) => (
                    <Badge key={date} variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {date}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Regime Distribution */}
      {regimeDist && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-500" />
              Regime Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {Object.entries(regimeDist).map(([name, info]) => (
                <div key={name} className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">{name}</span>
                    <span className="text-sm font-semibold" style={{ color: info.color }}>
                      {info.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${info.percentage}%`, backgroundColor: info.color }}
                    />
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">{info.count} days</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
