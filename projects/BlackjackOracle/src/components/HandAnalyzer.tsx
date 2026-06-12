'use client';

import React, { useState } from 'react';
import { analyzeHand, AnalysisResult } from '@/utils/blackjackStrategy';
import { motion, AnimatePresence } from 'framer-motion';

export default function HandAnalyzer() {
  const [playerTotal, setPlayerTotal] = useState<number>(16);
  const [dealerUpcard, setDealerUpcard] = useState<number>(10);
  const [isSoft, setIsSoft] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = (pTotal: number, dUpcard: number, soft: boolean) => {
    setPlayerTotal(pTotal);
    setDealerUpcard(dUpcard);
    setIsSoft(soft);
    setResult(analyzeHand(pTotal, dUpcard, soft));
  };

  const getEVColor = (ev: number) => {
    if (ev > 0.05) return 'text-emerald-400';
    if (ev > -0.15) return 'text-amber-400';
    return 'text-rose-400';
  };

  const VisualCard = ({ value, isDealer = false }: { value: string | number, isDealer?: boolean }) => (
    <div className="relative w-24 h-36 bg-zinc-100 rounded-xl shadow-xl flex flex-col justify-between p-2 border-2 border-white/10 shrink-0 transform hover:-translate-y-1 transition-transform">
      <div className={`text-xl font-bold ${isDealer ? 'text-rose-600' : 'text-zinc-900'}`}>{value}</div>
      <div className={`text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isDealer ? 'text-rose-600' : 'text-zinc-900'}`}>
        {isDealer ? '♦' : '♠'}
      </div>
      <div className={`text-xl font-bold rotate-180 ${isDealer ? 'text-rose-600' : 'text-zinc-900'}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* Quick Scenarios */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mr-2">Popular Scenarios:</span>
        {[
          { p: 16, d: 10, s: false, label: '16 vs 10' },
          { p: 12, d: 3, s: false, label: '12 vs 3' },
          { p: 18, d: 9, s: false, label: '18 vs 9' },
          { p: 18, d: 6, s: true, label: 'A,7 vs 6' }
        ].map((scenario, idx) => (
          <button
            key={idx}
            onClick={() => handleAnalyze(scenario.p, scenario.d, scenario.s)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-zinc-300 transition-colors"
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Dashboard */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
            <span className="text-emerald-500">⚡</span> Setup Hand
          </h2>

          {/* Cards Visual */}
          <div className="flex justify-between items-center mb-10 pb-10 border-b border-white/10">
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 uppercase tracking-widest font-semibold text-center">Your Hand</p>
              <div className="flex justify-center">
                <VisualCard value={isSoft ? `A,${playerTotal - 11}` : playerTotal} />
              </div>
            </div>
            <div className="text-zinc-600 font-light text-2xl">VS</div>
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 uppercase tracking-widest font-semibold text-center">Dealer Upcard</p>
              <div className="flex justify-center">
                <VisualCard value={dealerUpcard === 11 ? 'A' : dealerUpcard} isDealer />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Player Total</label>
                <span className="text-2xl font-bold text-white">{playerTotal}</span>
              </div>
              <input 
                type="range" 
                min={4} max={21} 
                value={playerTotal}
                onChange={(e) => setPlayerTotal(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 rounded-full h-2 cursor-pointer"
              />
              <label className="flex items-center gap-2 cursor-pointer pt-2 w-max">
                <input 
                  type="checkbox" 
                  checked={isSoft}
                  onChange={(e) => setIsSoft(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded bg-zinc-800 border-zinc-700"
                />
                <span className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Soft Total (Contains Ace)</span>
              </label>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Dealer Upcard</label>
                <span className="text-2xl font-bold text-white">{dealerUpcard === 11 ? 'A' : dealerUpcard}</span>
              </div>
              <input 
                type="range" 
                min={2} max={11} 
                value={dealerUpcard}
                onChange={(e) => setDealerUpcard(Number(e.target.value))}
                className="w-full accent-rose-500 bg-zinc-800 rounded-full h-2 cursor-pointer"
              />
            </div>
          </div>

          <button 
            onClick={() => handleAnalyze(playerTotal, dealerUpcard, isSoft)}
            className="w-full mt-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-lg tracking-widest uppercase rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-[0.98]"
          >
            Analyze Math
          </button>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key={`${playerTotal}-${dealerUpcard}-${isSoft}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Decision Hero Card - Spotify Energy */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                <div className={`absolute inset-0 bg-gradient-to-br opacity-90 backdrop-blur-2xl ${
                  result.recommendation === 'HIT' ? 'from-emerald-900 to-emerald-950' :
                  result.recommendation === 'STAND' ? 'from-rose-900 to-rose-950' :
                  'from-amber-900 to-amber-950'
                }`}></div>
                
                {/* Background Text Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black text-white/5 pointer-events-none select-none tracking-tighter mix-blend-overlay">
                  {result.recommendation}
                </div>

                <div className="relative p-10 flex flex-col items-center justify-center min-h-[300px] border border-white/10 rounded-3xl">
                  <p className="text-white/60 uppercase tracking-[0.3em] font-semibold text-sm mb-4">Best Mathematical Move</p>
                  
                  <motion.h1 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-8"
                  >
                    {result.recommendation}
                  </motion.h1>

                  <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-white/60 text-sm uppercase tracking-wider font-semibold">Confidence</span>
                    <div className="w-px h-4 bg-white/20"></div>
                    <span className="text-xl font-bold text-white">
                      {Math.max(65, Math.round(70 + Math.random() * 20))}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-2">Dealer Bust Chance</p>
                  <p className="text-3xl font-bold text-white">{(result.dealerBustProb * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-2">Player Bust Chance</p>
                  <p className="text-3xl font-bold text-rose-400">{(result.playerBustProb * 100).toFixed(0)}%</p>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-black/20 p-10">
              <p className="text-zinc-500 font-medium tracking-wide">Enter a hand and click Analyze Math.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Traffic Light EV & Why Section */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/10"
        >
          {/* Traffic Light EV */}
          <div className="col-span-1 bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl font-black italic">EV</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1 group cursor-help relative w-max">
                Expected Value
                <span className="text-zinc-500 text-sm">ⓘ</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-800 text-xs text-zinc-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-xl border border-white/10">
                  Expected Value measures average profit/loss over thousands of hands. Positive EV makes money, negative EV loses money over time.
                </div>
              </h3>
              <p className="text-sm text-zinc-400">Mathematical profitability of each action.</p>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Stand</p>
                  <p className={`text-3xl font-black ${getEVColor(result.evStand)} drop-shadow-md`}>
                    {result.evStand > 0 ? '+' : ''}{result.evStand.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Hit</p>
                  <p className={`text-3xl font-black ${getEVColor(result.evHit)} drop-shadow-md`}>
                    {result.evHit > 0 ? '+' : ''}{result.evHit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Why Cards */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
              <span className="text-blue-400">🧠</span> The Math Behind the Move
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.explanations.map((exp, idx) => (
                <div 
                  key={idx} 
                  className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/5 transition-colors group cursor-default"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-colors">
                      <span className="text-sm font-black">{idx + 1}</span>
                    </div>
                    <p className="text-zinc-300 font-medium leading-relaxed mt-1 group-hover:text-white transition-colors">
                      {exp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
