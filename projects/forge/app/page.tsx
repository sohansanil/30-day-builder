"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [constraints, setConstraints] = useState("");
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;
    
    // Store in sessionStorage to pass to the next page without URL bloat
    sessionStorage.setItem("forge_idea", idea);
    sessionStorage.setItem("forge_constraints", constraints);
    sessionStorage.setItem("forge_mode", mode);
    
    router.push("/forge");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-900 bg-scaffolding p-4 font-sans text-zinc-100 relative">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            👷 FORGE
          </h1>
          <p className="text-2xl font-medium text-zinc-400 mb-2">
            Ideas are cheap. Blueprints are valuable.
          </p>
          <p className="text-lg text-zinc-500">
            Transform a rough product idea into a complete build package.
          </p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl p-8 mb-12 relative overflow-hidden">
          {/* Subtle industrial stripe accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wide">Project Blueprint Specifications</label>
              <textarea
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none resize-none h-32 font-mono text-sm"
                placeholder="e.g. An anime social network where users can log their watched episodes and rate them..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wide">Structural Constraints (Optional)</label>
              <input
                type="text"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-mono text-sm"
                placeholder="e.g. Next.js, Tailwind, Supabase. Single day build."
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wide">Choose Your Build Path</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${mode === 'quick' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'}`}
                  onClick={() => setMode('quick')}
                >
                  <div className="font-bold text-white mb-1 flex items-center gap-2">⚡ Quick Build</div>
                  <div className="text-sm text-zinc-400">2 Agents • ~15 Seconds</div>
                  <div className="text-xs text-zinc-500 mt-2 font-mono">Fast Prototype</div>
                </div>
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${mode === 'full' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'}`}
                  onClick={() => setMode('full')}
                >
                  <div className="font-bold text-white mb-1 flex items-center gap-2">🏗️ Full Blueprint</div>
                  <div className="text-sm text-zinc-400">6 Agents • Research + Review</div>
                  <div className="text-xs text-zinc-500 mt-2 font-mono">Production Grade</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!idea}
              className="w-full bg-orange-600 text-white font-black py-4 px-4 rounded-lg hover:bg-orange-500 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
            >
              Start Forging 🔨
            </button>
          </form>
        </div>

        {mode === 'full' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-bold text-zinc-500 mb-16">
            <div className="flex items-center gap-2"><span className="text-xl">🏗️</span> Survey Terrain</div>
            <div className="flex items-center gap-2"><span className="text-xl">🔍</span> Analyze Market</div>
            <div className="flex items-center gap-2"><span className="text-xl">📐</span> Draft Blueprint</div>
            <div className="flex items-center gap-2"><span className="text-xl">🏛️</span> Design Structure</div>
            <div className="flex items-center gap-2"><span className="text-xl">🔨</span> Create Build Plan</div>
            <div className="flex items-center gap-2"><span className="text-xl">🚧</span> Safety Review</div>
          </div>
        ) : (
          <div className="flex justify-center gap-12 text-sm font-bold text-zinc-500 mb-16">
            <div className="flex items-center gap-2"><span className="text-xl">📐</span> Draft Blueprint & Structure</div>
            <div className="flex items-center gap-2"><span className="text-xl">🔨</span> Create Build Plan</div>
          </div>
        )}

        <div className="absolute bottom-6 left-0 w-full text-center">
          <p className="text-zinc-600 font-mono text-xs tracking-widest uppercase">
            A Sohan Sanil Project
          </p>
        </div>
      </div>
    </main>
  );
}
