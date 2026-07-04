"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Radar, Activity, AlertTriangle, Lightbulb, 
  Target, Shield, TrendingUp, Zap, Server, ChevronRight, MessageSquare, Star, RefreshCw
} from "lucide-react";
import { MarketIntelligence, RawReview } from "@/types";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<MarketIntelligence | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Independent state for raw chatter
  const [chatterReviews, setChatterReviews] = useState<RawReview[]>([]);
  const [isChatterRefreshing, setIsChatterRefreshing] = useState(false);

  const analyzeMarket = async () => {
    setStatus("loading");
    try {
      // Assuming FastAPI runs on 8000
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_reviews_per_app: 30 })
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const result = await res.json();
      
      // Artificial delay so the loading text is readable
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setData(result);
      if (result.raw_reviews) {
        setChatterReviews(result.raw_reviews.slice(0, 9));
      }
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze market.");
      setStatus("error");
    }
  };

  const refreshLiveChatter = async () => {
    setIsChatterRefreshing(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/reviews/recent?count_per_app=3");
      const result = await res.json();
      if (result.reviews) {
        setChatterReviews(result.reviews);
      }
    } catch (err) {
      console.error("Failed to refresh chatter:", err);
    } finally {
      setIsChatterRefreshing(false);
    }
  };

  if (status === "idle" || status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-vibrant/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="z-10 text-center max-w-2xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-brand-vibrant/30 text-brand-forest text-sm font-medium mb-4">
            <Radar className="w-4 h-4" />
            <span>AI-Powered Market Reconnaissance</span>
          </div>
          
          <div className="flex justify-center mb-8"><Image src="/smepayLogo.webp" alt="SMEPay Logo" width={200} height={60} className="object-contain" /></div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-brand-forest">
            SMEPay <span className="gradient-text">Scout</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-light leading-relaxed">
            Extract actionable product strategy directly from real merchant reviews. Stop guessing. Start building what they actually want.
          </p>

          {status === "error" && (
            <div className="p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-lg mt-4">
              {errorMsg}
            </div>
          )}

          <button 
            onClick={analyzeMarket}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-forest hover:bg-brand-forest/90 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(10,60,43,0.3)] hover:shadow-[0_0_60px_rgba(10,60,43,0.5)] overflow-hidden mt-8"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative flex items-center gap-2">
              <Server className="w-5 h-5" />
              Analyze Play Store Reviews
            </span>
          </button>
        </div>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6 glass-panel p-12 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-forest to-brand-vibrant animate-pulse" />
          <Radar className="w-16 h-16 text-brand-forest animate-spin-slow" style={{ animationDuration: '3s' }} />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Scanning Market...</h2>
            <p className="text-slate-500 text-sm">
              Scraping Google Play Store reviews for Razorpay, BharatPe, and Paytm...<br/>
              Synthesizing insights with Gemini 1.5 Pro...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-brand-cream p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Image src="/smepayLogo.webp" alt="SMEPay Logo" width={120} height={40} className="object-contain" />
              <span className="text-3xl font-bold gradient-text">Scout</span>
            </div>
            <p className="text-slate-500 mt-1">
              Analyzed {data._meta?.reviews_analyzed || 90} live merchant reviews • Generated {new Date(data._meta?.generated_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={analyzeMarket}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-brand-forest rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Live Data
            </button>
            <div className="flex items-center gap-3 glass-panel px-6 py-4 border-brand-amber/30 bg-brand-amber/10 max-w-sm">
              <Activity className="text-brand-amber w-8 h-8 shrink-0" />
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Market Pulse</p>
                  <p className="text-2xl font-bold text-brand-amber leading-none">{data.market_pulse_score}/100</p>
                </div>
                <p className="text-xs text-brand-amber/80 leading-tight">
                  {data.market_pulse_explanation}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* SMEPay Scout Verdict */}
        <section className="glass-panel p-8 relative overflow-hidden border-brand-vibrant/50 bg-gradient-to-r from-brand-surface to-brand-vibrant/10">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-vibrant" />
          <h2 className="text-sm uppercase tracking-widest font-bold mb-6 text-slate-500 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-vibrant" /> SMEPay Scout Verdict
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-200">
            <div className="px-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Market At Risk</p>
              <p className="text-xl font-bold text-brand-red">HIGH</p>
            </div>
            <div className="px-4 col-span-2">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Top Opportunity</p>
              <p className="text-xl font-bold text-brand-forest truncate">{data.opportunities[0]?.title || "N/A"}</p>
            </div>
            <div className="px-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Confidence</p>
              <p className="text-xl font-bold text-brand-vibrant">{data.opportunities[0]?.confidence_score || 0}%</p>
            </div>
          </div>
        </section>

        {/* Executive Briefing */}
        <section className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-vibrant" />
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-brand-forest">
            <Target className="text-brand-vibrant" /> Executive Briefing
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm text-brand-red uppercase font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Top Risk
              </h3>
              <p className="text-lg text-slate-700">{data.executive_briefing.top_risk}</p>
            </div>
            <div>
              <h3 className="text-sm text-brand-vibrant uppercase font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Top Opportunity
              </h3>
              <p className="text-lg text-slate-700">{data.executive_briefing.top_opportunity}</p>
            </div>
          </div>
        </section>

        {/* Pain Points & Win Zones Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pain Points */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="text-brand-red" /> Critical Pain Points
            </h2>
            {data.pain_points.map((pt, i) => (
              <div key={i} className="glass-panel p-6 glass-panel-hover border-l-2 border-l-brand-red">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-brand-forest">{pt.title}</h3>
                  <span className="px-3 py-1 bg-brand-red/10 rounded-full text-xs font-medium text-brand-red">
                    {pt.urgency}
                  </span>
                </div>
                <p className="text-slate-500 mb-4">{pt.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Server className="w-4 h-4"/> {pt.evidence_count} reviews</span>
                  <span>Competitors: {pt.competitors_cited.join(", ")}</span>
                </div>
              </div>
            ))}
          </section>

          {/* SMEPay Win Zones */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="text-brand-vibrant" /> SMEPay Win Zones
            </h2>
            {data.smepay_win_zones.map((zone, i) => (
              <div key={i} className="glass-panel p-6 glass-panel-hover border-l-2 border-l-brand-vibrant">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-brand-forest">{zone.area}</h3>
                  <div className="text-2xl font-bold text-brand-vibrant">{zone.score}</div>
                </div>
                <p className="text-slate-500">{zone.reason}</p>
              </div>
            ))}
          </section>
        </div>

        {/* Opportunity Engine */}
        <section className="space-y-6 pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-brand-amber" /> Opportunity Engine
          </h2>
          <div className="grid gap-6">
            {data.opportunities.map((opp, i) => (
              <div key={i} className="glass-panel p-6 md:p-8 bg-gradient-to-br from-brand-surface to-brand-surface-alt border-brand-amber/20 relative overflow-hidden">
                {/* Confidence Badge */}
                <div className="absolute top-6 right-6 bg-brand-amber/10 border border-brand-amber/30 text-brand-amber px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {opp.confidence_score} Confidence
                </div>

                <h3 className="text-2xl font-bold text-brand-forest mb-2 pr-40">{opp.title}</h3>
                <p className="text-brand-amber mb-6">{opp.why_now}</p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="text-sm uppercase font-semibold text-slate-500 mb-2">Strategic Advantage</h4>
                    <p className="text-slate-700">{opp.strategic_advantage}</p>
                  </div>
                  <div>
                    <h4 className="text-sm uppercase font-semibold text-slate-500 mb-2">Execution Strategy</h4>
                    <p className="text-slate-700">{opp.execution_strategy}</p>
                  </div>
                </div>
                
                {/* Acquisition Potential */}
                <div className="bg-brand-vibrant/10 border border-brand-vibrant/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Estimated Acquisition Potential</h4>
                    <span className="px-3 py-1 bg-brand-vibrant/20 text-brand-forest rounded-full text-xs font-bold uppercase">{opp.estimated_acquisition_potential}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{opp.potential_reason}</p>
                </div>

                <div className="bg-brand-cream/50 rounded-lg p-4 mt-6 border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">Primary Evidence</h4>
                  <ul className="space-y-2">
                    {opp.evidence.map((ev, j) => (
                      <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-brand-vibrant shrink-0 mt-0.5" />
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Market Chatter (Raw Evidence) */}
        {chatterReviews.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-brand-forest">
                <MessageSquare className="text-brand-vibrant" /> Live Market Chatter
              </h2>
              <button 
                onClick={refreshLiveChatter}
                disabled={isChatterRefreshing}
                className={`flex items-center gap-2 px-4 py-2 bg-brand-forest text-white rounded-lg text-sm font-semibold transition-all shadow-sm ${isChatterRefreshing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-forest/90'}`}
              >
                <RefreshCw className={`w-4 h-4 ${isChatterRefreshing ? 'animate-spin' : ''}`} /> 
                {isChatterRefreshing ? 'Pulling Data...' : 'Pull Latest Reviews'}
              </button>
            </div>
            
            <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-500 ${isChatterRefreshing ? 'opacity-50' : 'opacity-100'}`}>
              {chatterReviews.map((rev, i) => (
                <div key={i} className="glass-panel p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-brand-forest text-sm">{rev.competitor}</span>
                      <span className="text-brand-amber font-bold flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-current"/> {rev.rating}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm italic mb-4">"{rev.content}"</p>
                  </div>
                  <p className="text-xs text-slate-400 text-right">{rev.date}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <span className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full font-medium">
                Live direct connection to Google Play Store
              </span>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
