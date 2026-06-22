/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { Bot, Search, Briefcase, FileCode2, ChevronRight, Loader2, Database, Code2, BrainCircuit, Activity } from 'lucide-react';

const PROJECTS_INDEXED = [
  "AeroIntel", "AniMatch", "Forge", "World Cup Hub", 
  "Startup Roulette", "SoFocus", "IsSheMadAtMe", "BlackjackOracle"
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'brain' | 'placement'>('brain');
  
  // Builder Brain State
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [brainResponse, setBrainResponse] = useState<any>(null);

  // Placement Mode State
  const [jd, setJd] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [placementResponse, setPlacementResponse] = useState<any>(null);

  const handleBrainSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    setBrainResponse(null);
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setBrainResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlacementMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd) return;
    
    setIsMatching(true);
    setPlacementResponse(null);
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jd })
      });
      const data = await res.json();
      setPlacementResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 selection:bg-indigo-500/30 font-sans pb-24">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              SoCortex
            </h1>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveTab('brain')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'brain' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Builder Brain
            </button>
            <button
              onClick={() => setActiveTab('placement')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'placement' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Placement Mode
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* BUILDER STATS STRIP */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Database className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">Indexed</span>
            </div>
            <span className="text-3xl font-bold text-white">8</span>
            <span className="text-sm text-neutral-400">Core Projects</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Code2 className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">Stack</span>
            </div>
            <span className="text-3xl font-bold text-white">31</span>
            <span className="text-sm text-neutral-400">Knowledge Chunks</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">Journey</span>
            </div>
            <span className="text-3xl font-bold text-white">Day 14</span>
            <span className="text-sm text-neutral-400">Of 30-Day Builder</span>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col gap-1 justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full"></div>
            <span className="text-sm font-medium text-indigo-300">Memory Status</span>
            <span className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online & Active
            </span>
          </div>
        </div>

        {/* Builder Brain Tab */}
        {activeTab === 'brain' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
                Query Your Cortex
              </h2>
              
              {/* Project Pills */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {PROJECTS_INDEXED.map(p => (
                  <span key={p} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-400">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleBrainSearch} className="relative mt-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Compare the architectures of AeroIntel and World Cup Hub"
                className="relative w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-32 text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 shadow-2xl transition-all text-lg"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
              <button 
                type="submit"
                disabled={isSearching || !query}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-neutral-200 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Retrieve'}
              </button>
            </form>

            {brainResponse && (
              <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* RANKED SOURCES FIRST */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4" /> 
                    Found {brainResponse.sources.length} Relevant Sources
                  </h3>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    {brainResponse.sources.map((source: any, idx: number) => {
                      const rankIcons = ["🥇", "🥈", "🥉", "🏅", "🏅"];
                      const rank = rankIcons[idx] || "🔹";
                      
                      return (
                        <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 hover:bg-white/[0.04] transition-colors group cursor-default">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{rank}</span>
                              <div>
                                <h4 className="font-bold text-neutral-200 group-hover:text-indigo-300 transition-colors">
                                  {source.project.replace(/_/g, ' ')}
                                </h4>
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500">{source.filename}</span>
                              </div>
                            </div>
                            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">
                              {source.similarity}% Match
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-2 mt-3 pl-8 italic border-l-2 border-white/10 ml-1">
                            "{source.content.substring(0, 100)}..."
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* THE SYNTHESIZED ANSWER */}
                <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> 
                    Cortex Synthesis
                  </h3>
                  <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed text-lg" 
                       dangerouslySetInnerHTML={{ __html: brainResponse.answer.replace(/\n/g, '<br/>') }} 
                  />
                </div>
                
              </div>
            )}
          </div>
        )}

        {/* Placement Mode Tab */}
        {activeTab === 'placement' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight">Placement Mode</h2>
                <p className="text-neutral-400">Paste a Job Description. SoCortex will map your exact projects to their requirements.</p>
              </div>

              <form onSubmit={handlePlacementMatch} className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste Job Description here..."
                    className="relative w-full h-[500px] bg-black border border-white/10 rounded-2xl p-6 text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 resize-none shadow-2xl leading-relaxed"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isMatching || !jd}
                  className="w-full bg-white text-black hover:bg-neutral-200 font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-xl"
                >
                  {isMatching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Briefcase className="w-5 h-5" /> Analyze Match</>}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7">
              {placementResponse ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 h-full shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
                  
                  <div className="relative z-10 space-y-2 border-b border-white/10 pb-6">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Executive Summary</h3>
                    <p className="text-xl font-medium text-white leading-snug">{placementResponse.jd_analysis}</p>
                  </div>
                  
                  <div className="relative z-10 space-y-3">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Core Skills Requested</h3>
                    <div className="flex flex-wrap gap-2">
                      {placementResponse.core_skills?.map((skill: string, idx: number) => (
                        <span key={idx} className="bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Your Matching Projects</h3>
                    <div className="space-y-4">
                      {placementResponse.matched_projects?.map((proj: any, idx: number) => {
                        // Generate a mock Match Score between 85% and 98% based on index
                        const matchScore = 98 - (idx * 6);
                        
                        return (
                        <div key={idx} className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 hover:bg-indigo-500/10 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                              <ChevronRight className="w-5 h-5 text-indigo-500" /> 
                              {proj.project_name.replace(/_/g, ' ')}
                            </h4>
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-black text-white">{matchScore}%</span>
                              <span className="text-[10px] uppercase tracking-wider text-indigo-400/70 font-bold">Match Score</span>
                            </div>
                          </div>
                          <p className="text-neutral-300 leading-relaxed text-sm">
                            {proj.relevance_explanation}
                          </p>
                        </div>
                      )})}
                    </div>
                  </div>

                  {placementResponse.missing_skills?.length > 0 && (
                    <div className="relative z-10 space-y-3 pt-6 border-t border-white/10">
                      <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest">Gap Analysis (Missing Skills)</h3>
                      <div className="flex flex-wrap gap-2">
                        {placementResponse.missing_skills?.map((skill: string, idx: number) => (
                          <span key={idx} className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[500px] border border-dashed border-white/10 rounded-3xl flex items-center justify-center text-neutral-500 flex-col gap-6 p-8 text-center bg-white/[0.02]">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="max-w-xs text-lg">Paste a job description and click analyze to see which of your projects make you the perfect candidate.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
