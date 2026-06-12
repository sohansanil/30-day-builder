'use client';

import React, { useState } from 'react';
import HandAnalyzer from '@/components/HandAnalyzer';
import CardCounter from '@/components/CardCounter';
import { motion } from 'framer-motion';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'counter'>('analyzer');

  return (
    <main className="min-h-screen text-zinc-50 font-sans relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#050505] overflow-hidden">
        
        {/* 4 Oversized Suit Symbols */}
        <div className="absolute -top-20 -left-10 text-[400px] text-white opacity-[0.15] blur-[3px] rotate-[-15deg] select-none font-serif leading-none">♠</div>
        <div className="absolute top-20 -right-20 text-[350px] text-white opacity-10 blur-[2px] rotate-[25deg] select-none font-serif leading-none">♥</div>
        <div className="absolute -bottom-32 -left-10 text-[450px] text-white opacity-[0.12] blur-[4px] rotate-[10deg] select-none font-serif leading-none">♣</div>
        <div className="absolute -bottom-20 -right-10 text-[400px] text-white opacity-[0.15] blur-[3px] rotate-[-20deg] select-none font-serif leading-none">♦</div>
        {/* Subtle emerald and gold radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.06)_0%,_transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(251,191,36,0.02)_0%,_transparent_40%)]"></div>
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1 flex items-center gap-3 justify-center md:justify-start">
                <span className="text-emerald-500">♠</span> 
                Sohan's Edge
              </h1>
              <p className="text-zinc-400 font-medium text-sm md:text-base tracking-wide">Blackjack Analytics & Card Counting Dashboard</p>
            </div>

            {/* Stats Strip */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-zinc-500">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> 
                500+ Decision States
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span> 
                Basic Strategy Engine
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span> 
                Hi-Lo Counting System
              </span>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8">
          
          {/* Navigation Tabs */}
          <div className="flex p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl mb-10 w-full max-w-sm mx-auto shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex-1 relative z-10 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-colors duration-300 ${
                activeTab === 'analyzer' ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hand Analyzer
              {activeTab === 'analyzer' && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('counter')}
              className={`flex-1 relative z-10 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-colors duration-300 ${
                activeTab === 'counter' ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Card Counter
              {activeTab === 'counter' && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>

          {/* Content Area */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'analyzer' ? <HandAnalyzer /> : <CardCounter />}
          </motion.div>
          
        </div>
      </div>
    </main>
  );
}
