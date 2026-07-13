import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Database, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Cinematic timing sequence
    const sequence = [
      setTimeout(() => setStep(1), 1500), // Incoming Transmission...
      setTimeout(() => setStep(2), 3500), // Historical anomaly detected.
      setTimeout(() => setStep(3), 5000), // September 2012. Netflix.
      setTimeout(() => setStep(4), 6500), // Confidence 68%.
      setTimeout(() => setStep(5), 8000), // Open Case File
    ];
    return () => sequence.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Content (Centered) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="max-w-xl w-full space-y-12">
          
          {/* Header */}
          <div className="space-y-4 text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-[0.2em] text-zinc-100 uppercase">
              SonVest
            </h1>
            <p className="text-sm md:text-base tracking-[0.1em] text-zinc-400 uppercase">
              Decision Intelligence Platform
            </p>
          </div>

          {/* Terminal Block */}
          <div className="space-y-8 min-h-[300px]">
            <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-widest text-sm uppercase">
              <Terminal className="w-4 h-4" />
              SIGNAL ENGINE
            </div>

            <div className="space-y-6 text-zinc-300 text-lg tracking-wide">
              {step >= 1 && (
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  Incoming Transmission...
                </p>
              )}
              
              {step >= 2 && (
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  Historical anomaly detected.
                </p>
              )}
              
              {step >= 3 && (
                <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p>September 2012.</p>
                  <p className="text-zinc-100 font-bold tracking-widest uppercase">Netflix.</p>
                </div>
              )}
              
              {step >= 4 && (
                <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-zinc-500 text-sm uppercase tracking-widest">Confidence</p>
                  <p className="text-emerald-400 font-bold">68%.</p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className={`pt-8 transition-all duration-1000 ${step >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
              <div className="flex flex-col sm:flex-row gap-4 items-center border-t border-zinc-800/50 pt-8">
                <Link to="/cases/netflix-2012" className="w-full sm:w-auto flex-1">
                  <Button size="lg" className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold tracking-widest uppercase h-14 rounded-sm">
                    Open Case File
                  </Button>
                </Link>
                <Link to="/analytics" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 font-bold tracking-widest uppercase h-14 rounded-sm flex items-center justify-center gap-2 border border-zinc-800">
                    <Database className="w-4 h-4" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
