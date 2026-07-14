import { useState } from "react";
import { Activity, ShieldCheck, Database, Zap, TrendingUp, TrendingDown, Check, X, Server, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Scanner() {
  const [suggestions, setSuggestions] = useState([
    {
      id: "NVDA-1",
      ticker: "NVDA",
      name: "Nvidia Corporation",
      action: "BUY",
      score: 9.2,
      price: 134.55,
      bull_thesis: "The new Blackwell architecture is driving record data-center revenue. Compute demand is far exceeding supply for the next 18 months. Momentum is accelerating.",
      bear_thesis: "Priced for absolute perfection. Any hint of supply chain delays or macro slowdown could trigger a 30% drawdown given the historical high multiples.",
      status: "PENDING"
    },
    {
      id: "AMD-1",
      ticker: "AMD",
      name: "Advanced Micro Devices",
      action: "HOLD",
      score: 6.8,
      price: 162.20,
      bull_thesis: "MI300X adoption by Microsoft and Meta proves they can challenge Nvidia's monopoly. Significant upside as enterprise customers seek alternatives.",
      bear_thesis: "Software ecosystem (ROCm) still lags behind CUDA significantly. Margins are being compressed trying to compete on price.",
      status: "PENDING"
    }
  ]);

  const handleAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-mono pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-widest uppercase">Live Scanner</h1>
        <p className="text-zinc-500 mt-2">AI-Assisted Portfolio Copilot & Human Approval Queue</p>
      </div>

      {/* Systems Status Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "SEC EDGAR", status: "ONLINE", icon: Database },
          { label: "Polymarket", status: "SYNCED", icon: Zap },
          { label: "News RSS", status: "PARSING", icon: Activity },
          { label: "Signal Engine", status: "ARMED", icon: ShieldCheck }
        ].map((sys, i) => {
          const Icon = sys.icon;
          return (
            <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 rounded-sm flex flex-col gap-3 group hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5 text-emerald-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mb-1">{sys.label}</p>
                <p className="text-emerald-400 text-sm tracking-widest">{sys.status}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* The Suggestion Queue */}
      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2 className="text-lg font-bold tracking-widest uppercase flex items-center gap-2">
            <Server className="w-5 h-5 text-zinc-400" />
            Execution Queue
          </h2>
          <span className="bg-zinc-900 text-zinc-400 text-xs px-2 py-1 uppercase tracking-widest">
            {suggestions.filter(s => s.status === "PENDING").length} Pending Approvals
          </span>
        </div>

        <div className="space-y-6">
          {suggestions.map((sug) => (
            <div key={sug.id} className="border border-zinc-800 bg-zinc-950 p-6 relative group overflow-hidden">
              
              {/* Status Overlay */}
              {sug.status !== "PENDING" && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className={`border-2 p-4 text-2xl font-bold tracking-widest uppercase rotate-12 ${sug.status === "APPROVED" ? "text-emerald-500 border-emerald-500" : "text-rose-500 border-rose-500"}`}>
                    {sug.status}
                  </div>
                </div>
              )}

              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 pb-6 border-b border-zinc-900">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold tracking-widest text-zinc-100">{sug.ticker}</h3>
                    <span className={`px-2 py-1 text-xs font-bold tracking-widest ${sug.action === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>
                      {sug.action}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm">{sug.name}</p>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Signal Score</p>
                    <p className="text-xl font-bold text-zinc-100">{sug.score} / 10</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Latest Close</p>
                    <p className="text-xl font-bold text-zinc-100">${sug.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Agent Arena Debate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-950/10 border border-emerald-900/30 p-4">
                  <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold tracking-widest uppercase text-xs">Bull Thesis</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{sug.bull_thesis}</p>
                </div>
                
                <div className="bg-rose-950/10 border border-rose-900/30 p-4">
                  <div className="flex items-center gap-2 mb-3 text-rose-400">
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-bold tracking-widest uppercase text-xs">Bear Thesis</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{sug.bear_thesis}</p>
                </div>
              </div>

              {/* Approval Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/30 p-4 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-zinc-500" />
                  <p className="text-sm text-zinc-400">Waiting for human judgment...</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => handleAction(sug.id, "REJECTED")}
                    variant="outline"
                    className="flex-1 sm:flex-none border-rose-900 text-rose-500 hover:bg-rose-950 font-bold tracking-widest uppercase"
                  >
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button 
                    onClick={() => handleAction(sug.id, "APPROVED")}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase"
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
