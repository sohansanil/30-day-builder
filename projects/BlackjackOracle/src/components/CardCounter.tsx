'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CardCounter() {
  const [runningCount, setRunningCount] = useState<number>(0);
  const [cardsDealt, setCardsDealt] = useState<number>(0);
  const [initialDecks, setInitialDecks] = useState<number>(6);
  const [decksRemaining, setDecksRemaining] = useState<number>(6);
  
  const trueCount = Math.round((runningCount / decksRemaining) * 10) / 10;
  const baseEdge = -0.5;
  const playerEdge = baseEdge + (0.5 * trueCount);
  
  let suggestedBet = "1 Unit";
  let betColor = "text-zinc-400";
  if (trueCount >= 1 && trueCount < 2) { suggestedBet = "2 Units"; betColor = "text-emerald-400"; }
  if (trueCount >= 2 && trueCount < 3) { suggestedBet = "4 Units"; betColor = "text-emerald-400"; }
  if (trueCount >= 3 && trueCount < 4) { suggestedBet = "8 Units"; betColor = "text-amber-400"; }
  if (trueCount >= 4) { suggestedBet = "12+ Units"; betColor = "text-amber-500"; }

  const handleCard = (value: number) => {
    setRunningCount(prev => prev + value);
    setCardsDealt(prev => prev + 1);
    const cardsRemaining = (initialDecks * 52) - (cardsDealt + 1);
    const decksLeft = Math.max(0.5, cardsRemaining / 52);
    setDecksRemaining(decksLeft);
  };

  const resetCount = () => {
    setRunningCount(0);
    setCardsDealt(0);
    setDecksRemaining(initialDecks);
  };

  return (
    <div className="space-y-8">
      
      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Running Count */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
          <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none transition-colors ${runningCount > 0 ? 'bg-emerald-500/20' : runningCount < 0 ? 'bg-rose-500/20' : 'bg-transparent'}`}></div>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2">Running Count</p>
          <motion.div 
            key={runningCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-black ${runningCount > 0 ? 'text-emerald-400' : runningCount < 0 ? 'text-rose-400' : 'text-white'}`}
          >
            {runningCount > 0 ? '+' : ''}{runningCount}
          </motion.div>
        </div>

        {/* True Count */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group cursor-help">
          <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none transition-colors ${trueCount > 0 ? 'bg-emerald-500/20' : trueCount < 0 ? 'bg-rose-500/20' : 'bg-transparent'}`}></div>
          <div className="flex items-center gap-1 mb-2">
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">True Count</p>
            <span className="text-zinc-500 text-xs">ⓘ</span>
          </div>
          <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-zinc-800 text-xs text-zinc-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-xl border border-white/10">
            Running Count divided by Decks Remaining. A more accurate measure of your advantage.
          </div>
          <motion.div 
            key={trueCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-black ${trueCount > 0 ? 'text-emerald-400' : trueCount < 0 ? 'text-rose-400' : 'text-white'}`}
          >
            {trueCount > 0 ? '+' : ''}{trueCount.toFixed(1)}
          </motion.div>
        </div>

        {/* Player Edge */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-visible group cursor-help z-40">
          <div className="flex items-center gap-1 mb-2">
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Advantage</p>
            <span className="text-zinc-500 text-xs">ⓘ</span>
          </div>
          <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-zinc-800 text-xs text-zinc-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-xl border border-white/10">
            High true counts mean more 10s and Aces remain, increasing player edge.
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-black ${playerEdge > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {playerEdge > 0 ? '+' : ''}{playerEdge.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-2">
            {playerEdge > 0 ? 'Player has the edge' : 'Casino has the edge'}
          </p>
        </div>

        {/* Bet Sizing */}
        <div className="bg-black/40 backdrop-blur-xl border-amber-500/30 border p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"></div>
          <p className="text-xs text-amber-500 uppercase tracking-widest font-bold mb-2">Bet Sizing</p>
          <div className={`text-4xl font-black ${betColor}`}>
            {suggestedBet}
          </div>
          <p className="text-xs text-zinc-400 font-medium mt-2 flex items-center gap-1">
            <span className="text-amber-500">◎</span> Kelly Criterion Spread
          </p>
        </div>

      </div>

      {/* Logging Pad */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Live Deck Tracking</h3>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm text-zinc-400">Shoe Size:</p>
              <select 
                value={initialDecks} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInitialDecks(val);
                  setRunningCount(0);
                  setCardsDealt(0);
                  setDecksRemaining(val);
                }}
                className="bg-black/50 border border-white/10 text-zinc-300 font-medium text-xs rounded-lg px-3 py-1.5 outline-none hover:border-white/20 focus:border-emerald-500/50 transition-colors cursor-pointer"
              >
                {[1, 2, 4, 6, 8].map(d => <option key={d} value={d} className="bg-zinc-900">{d} Deck{d > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white">{decksRemaining.toFixed(1)}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Decks Left</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => handleCard(1)}
            className="relative group p-8 bg-zinc-900 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-2xl transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 rounded-b-2xl"></div>
            <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs mb-2">Low Cards</p>
            <p className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">2 - 6</p>
            <p className="absolute top-4 right-4 text-emerald-500 font-black">+1</p>
          </button>

          <button 
            onClick={() => handleCard(0)}
            className="relative group p-8 bg-zinc-900 border border-white/10 hover:border-zinc-500 hover:bg-zinc-800 rounded-2xl transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-600 rounded-b-2xl"></div>
            <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs mb-2">Neutral Cards</p>
            <p className="text-3xl font-black text-white group-hover:text-zinc-300 transition-colors">7 - 9</p>
            <p className="absolute top-4 right-4 text-zinc-500 font-black">0</p>
          </button>

          <button 
            onClick={() => handleCard(-1)}
            className="relative group p-8 bg-zinc-900 border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-500 rounded-b-2xl"></div>
            <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs mb-2">High Cards</p>
            <p className="text-3xl font-black text-white group-hover:text-rose-400 transition-colors">10 - A</p>
            <p className="absolute top-4 right-4 text-rose-500 font-black">-1</p>
          </button>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button 
            onClick={resetCount}
            className="px-6 py-2 text-sm font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
          >
            <span>🔄</span> Reset Shoe
          </button>
        </div>
      </div>
      
    </div>
  );
}
