import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  BarChart3,
} from "lucide-react";

function RegimeIcon({ name }: { name: string }) {
  if (name.includes("Bull")) return <TrendingUp className="w-6 h-6" />;
  if (name.includes("Bear")) return <TrendingDown className="w-6 h-6" />;
  if (name.includes("Volatil")) return <Zap className="w-6 h-6" />;
  if (name.includes("Recovery")) return <Activity className="w-6 h-6" />;
  return <BarChart3 className="w-6 h-6" />;
}

export default function Replay() {
  const { data: periods, isLoading: periodsLoading } = trpc.market.replayPeriods.useQuery();
  const [selectedPeriod, setSelectedPeriod] = useState("2024 Volatility");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(500); // ms per frame

  const period = periods?.find((p) => p.label === selectedPeriod);

  const { data: dailyData, isLoading: dataLoading } = trpc.market.dailyData.useQuery(
    {
      startDate: period?.start,
      endDate: period?.end,
    },
    { enabled: !!period }
  );

  const replayData = dailyData ?? [];
  const current = replayData[currentIndex];
  const progress = replayData.length > 0 ? (currentIndex / (replayData.length - 1)) * 100 : 0;

  // Play/Pause logic
  useEffect(() => {
    if (!isPlaying || replayData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= replayData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, replayData.length, speed]);

  // Reset when period changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [selectedPeriod]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const handleSkipForward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 10, replayData.length - 1));
  }, [replayData.length]);

  const handleSkipBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 10, 0));
  }, []);

  if (periodsLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-96 bg-zinc-800" />
      </div>
    );
  }

  // Chart data up to current index
  const chartData = replayData.slice(0, currentIndex + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Play className="w-6 h-6 text-emerald-400" />
            Market Replay
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Watch market regimes evolve day by day
          </p>
        </div>

        {/* Period Selector */}
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-64 bg-zinc-900 border-zinc-700 text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {periods?.map((p) => (
              <SelectItem key={p.label} value={p.label} className="text-zinc-200">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current State Display */}
      {current && (
        <Card
          className="border-zinc-800 transition-colors duration-500"
          style={{ backgroundColor: `${current.regime_hmm_color}08` }}
        >
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Regime Info */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-500"
                  style={{ backgroundColor: `${current.regime_hmm_color}20`, color: current.regime_hmm_color }}
                >
                  <RegimeIcon name={current.regime_hmm_name} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Current Regime</p>
                  <p
                    className="text-xl font-bold transition-colors duration-500"
                    style={{ color: current.regime_hmm_color }}
                  >
                    {current.regime_hmm_name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Confidence: {(Math.max(...current.hmm_proba) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Date & Price */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Date</p>
                  <p className="text-lg font-mono font-semibold text-zinc-200">{current.date}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">S&P 500</p>
                  <p className="text-lg font-mono font-semibold text-zinc-200">
                    {current.close.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Day</p>
                  <p className="text-lg font-mono font-semibold text-zinc-200">
                    {currentIndex + 1} / {replayData.length}
                  </p>
                </div>
              </div>

              {/* Regime Probabilities */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Regime Probabilities</p>
                <div className="space-y-1.5">
                  {current.hmm_proba.map((p: number, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            i === 0 ? "#10B981" : i === 1 ? "#EF4444" : i === 2 ? "#F59E0B" : "#3B82F6",
                        }}
                      />
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${p * 100}%`,
                            backgroundColor:
                              i === 0 ? "#10B981" : i === 1 ? "#EF4444" : i === 2 ? "#F59E0B" : "#3B82F6",
                          }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 w-10 text-right">{(p * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-500" />
            Price Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="replayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={current?.regime_hmm_color ?? "#10B981"} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={current?.regime_hmm_color ?? "#10B981"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#71717a" }}
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
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
                        <p className="text-xs text-zinc-500">{d.date}</p>
                        <p className="text-sm font-semibold text-zinc-100">{d.close.toLocaleString()}</p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={current?.regime_hmm_color ?? "#10B981"}
                  strokeWidth={2}
                  fill="url(#replayGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-12">{progress.toFixed(0)}%</span>
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={(v) => {
                  const idx = Math.round((v[0] / 100) * (replayData.length - 1));
                  setCurrentIndex(Math.max(0, Math.min(idx, replayData.length - 1)));
                  setIsPlaying(false);
                }}
                className="flex-1"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                onClick={handleSkipBack}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                onClick={handleSkipForward}
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Speed Control */}
              <div className="flex items-center gap-2 ml-4">
                <Clock className="w-4 h-4 text-zinc-500" />
                <Badge
                  variant={speed === 200 ? "default" : "outline"}
                  className={`cursor-pointer ${speed === 200 ? "bg-emerald-600" : "border-zinc-700 text-zinc-400"}`}
                  onClick={() => setSpeed(200)}
                >
                  2x
                </Badge>
                <Badge
                  variant={speed === 500 ? "default" : "outline"}
                  className={`cursor-pointer ${speed === 500 ? "bg-emerald-600" : "border-zinc-700 text-zinc-400"}`}
                  onClick={() => setSpeed(500)}
                >
                  1x
                </Badge>
                <Badge
                  variant={speed === 1000 ? "default" : "outline"}
                  className={`cursor-pointer ${speed === 1000 ? "bg-emerald-600" : "border-zinc-700 text-zinc-400"}`}
                  onClick={() => setSpeed(1000)}
                >
                  0.5x
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
