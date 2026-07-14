import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Activity, ArrowRight, Brain, AlertCircle, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CaseFile() {
  const { id = "netflix-2012" } = useParams();
  const { data: mission, isLoading } = trpc.missions.getMission.useQuery({ id });
  const evaluateMutation = trpc.missions.evaluateDecision.useMutation();

  const [step, setStep] = useState(1);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [selectedReasoning, setSelectedReasoning] = useState<string | null>(null);
  const [showAdvisors, setShowAdvisors] = useState(false);

  const reasoningOptions = [
    { id: "undervalued", label: "Fundamentally undervalued despite the noise." },
    { id: "panic", label: "Pure panic selling; business model is intact." },
    { id: "trend", label: "Broader market momentum is negative." },
    { id: "risk", label: "Minimizing downside risk in an unproven shift." }
  ];

  // Helper for auto-advancing animations
  useEffect(() => {
    if (step === 2) {
      // News flashing context
      const timer = setTimeout(() => setStep(3), 3500);
      return () => clearTimeout(timer);
    }
    if (step === 6) {
      // Signal Engine Processing
      const timer = setTimeout(() => setStep(7), 2500);
      return () => clearTimeout(timer);
    }
    if (step === 7) {
      // Interesting. Let's see...
      const timer = setTimeout(() => setStep(8), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleEvaluate = () => {
    if (!selectedDecision || !selectedReasoning) return;
    setStep(6);
    evaluateMutation.mutate({
      missionId: id,
      decisionId: selectedDecision,
      reasoningId: selectedReasoning
    });
  };

  if (isLoading) {
    return <div className="p-8 text-zinc-500 font-mono animate-pulse">DECRYPTING CASE FILE...</div>;
  }

  if (!mission) {
    return <div className="p-8 text-red-500 font-mono">CASE FILE NOT FOUND.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 font-mono pb-32">
      
      {/* STEP 1: DOSSIER */}
      {step >= 1 && (
        <div className="space-y-6 border border-zinc-800 p-8 bg-zinc-950/50 rounded-sm mb-12 relative animate-in fade-in">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/50" />
          
          <div className="text-center mb-8 border-b border-zinc-800 pb-8">
            <h1 className="text-sm font-bold tracking-widest text-zinc-500 mb-2">CASE FILE {mission.id.split('-')[1] || "001"}</h1>
            <h2 className="text-3xl font-extrabold text-zinc-100 uppercase tracking-widest">{mission.title}</h2>
            <p className="text-emerald-500 tracking-widest mt-2">{mission.year}</p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm tracking-wider">
            <div>
              <p className="text-zinc-600 mb-1">DIFFICULTY</p>
              <p className="text-zinc-300">{'★'.repeat(mission.difficulty)}{'☆'.repeat(5 - mission.difficulty)}</p>
            </div>
            <div>
              <p className="text-zinc-600 mb-1">TIME</p>
              <p className="text-zinc-300">12 MINUTES</p>
            </div>
            <div>
              <p className="text-zinc-600 mb-1">PRINCIPLE</p>
              <p className="text-zinc-300 uppercase">{mission.concept}</p>
            </div>
            <div>
              <p className="text-zinc-600 mb-1">CONCEPTS</p>
              <p className="text-zinc-300 uppercase">MOMENTUM, PSYCHOLOGY</p>
            </div>
          </div>

          {step === 1 && (
            <div className="pt-8 text-center border-t border-zinc-800">
              <Button 
                onClick={() => setStep(2)}
                className="bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-bold tracking-widest uppercase w-full"
              >
                Open Case
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: CONTEXT / NOISE */}
      {step >= 2 && (
        <div className="space-y-6 mb-12 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <div className="border-l-2 border-zinc-700 pl-6 space-y-4">
            <p className="text-xl text-zinc-300 leading-relaxed italic">
              "{mission.hook}"
            </p>
            <div className="flex flex-col gap-2 pt-4">
              {step === 2 && (
                <>
                  <p className="text-red-400 text-sm font-bold tracking-widest uppercase animate-pulse">» Netflix loses subscribers.</p>
                  <p className="text-amber-500 text-sm font-bold tracking-widest uppercase animate-pulse delay-75">» Analysts downgrade stock.</p>
                  <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase animate-pulse delay-150">» DVD business collapsing.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SIGNAL ENGINE BRIEFING */}
      {step >= 3 && (
        <div className="border border-zinc-800 bg-zinc-900/30 p-6 rounded-sm mb-12 animate-in fade-in">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <Activity className="w-5 h-5" />
            <span className="font-bold tracking-widest uppercase text-sm">Signal Engine Briefing</span>
          </div>
          <p className="text-zinc-400 leading-relaxed mb-6">
            The market rarely announces when it's about to change. Here is what I noticed during this period of extreme sentiment:
          </p>
          <div className="space-y-3 pl-4 border-l border-emerald-500/30">
            <p className="text-sm tracking-wider text-zinc-300">
              <span className="text-zinc-500 w-32 inline-block">ASSESSMENT:</span> {mission.signalEngine.assessment}
            </p>
            <p className="text-sm tracking-wider text-zinc-300">
              <span className="text-zinc-500 w-32 inline-block">CONFIDENCE:</span> {mission.signalEngine.confidence}%
            </p>
            <p className="text-sm tracking-wider text-zinc-300 flex">
              <span className="text-zinc-500 w-32 inline-block shrink-0">DRIVERS:</span> 
              <span className="flex gap-2">
                {mission.signalEngine.drivers.map((d, i) => <span key={i} className="bg-zinc-950 px-2 border border-zinc-800">{d}</span>)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* STEP 3.5: AGENT ADVISORS (NEW) */}
      {step >= 3 && step < 6 && (
        <div className="mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500">
          {!showAdvisors ? (
            <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between group">
              <div>
                <h3 className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-1">Consult Advisors</h3>
                <p className="text-zinc-400 text-sm">Need help? Hear what our AI Bull and Bear agents have to say before deciding.</p>
              </div>
              <Button 
                onClick={() => setShowAdvisors(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold tracking-widest uppercase border border-zinc-700 whitespace-nowrap"
              >
                Summon Agents <Brain className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95">
              <div className="text-center mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold tracking-widest text-zinc-100 uppercase">Agent Arena</h3>
                <p className="text-zinc-500 text-sm mt-1">Two opposing views. You decide the winner.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BULL AGENT */}
                <div className="border border-emerald-900/50 bg-emerald-950/10 p-6 relative">
                  <div className="absolute -top-3 -left-3 bg-zinc-950 border border-emerald-500/50 p-2 rounded-full shadow-lg shadow-emerald-500/10">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-emerald-400 font-bold tracking-widest uppercase mb-4 ml-4">The Bull Thesis</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    "{mission.bull_thesis || "The long-term growth potential far outweighs current concerns. I strongly recommend buying."}"
                  </p>
                </div>
                
                {/* BEAR AGENT */}
                <div className="border border-rose-900/50 bg-rose-950/10 p-6 relative">
                  <div className="absolute -top-3 -right-3 bg-zinc-950 border border-rose-500/50 p-2 rounded-full shadow-lg shadow-rose-500/10">
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  </div>
                  <h4 className="text-rose-400 font-bold tracking-widest uppercase mb-4 text-right mr-4">The Bear Thesis</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    "{mission.bear_thesis || "The momentum is collapsing and downside risk is massive. I strongly recommend selling."}"
                  </p>
                </div>
              </div>

              {/* JARGON BUSTER (Educational Component) */}
              {mission.glossary && mission.glossary.length > 0 && (
                <div className="mt-8 border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-center gap-2 mb-4 text-blue-400">
                    <BookOpen className="w-4 h-4" />
                    <h4 className="font-bold tracking-widest uppercase text-sm">Jargon Buster</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mission.glossary.map((g: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-800 p-4 hover:border-blue-500/50 transition-colors">
                        <p className="text-blue-400 font-bold text-sm tracking-wide mb-2">{g.term}</p>
                        <p className="text-zinc-400 text-xs leading-relaxed">{g.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: DECISION */}
      {step >= 3 && step < 6 && (
        <div className="space-y-4 mb-12 animate-in fade-in">
          <h3 className="text-lg font-bold tracking-widest text-zinc-100 uppercase mb-6">Your Decision</h3>
          <div className="grid grid-cols-1 gap-3">
            {mission.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setSelectedDecision(opt.id); setStep(4); }}
                className={`p-4 text-left border transition-all flex items-center justify-between group ${
                  selectedDecision === opt.id
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold tracking-widest uppercase">{opt.label}</span>
                  <span className="text-xs mt-1 opacity-70 tracking-wider">{opt.description}</span>
                </div>
                {selectedDecision === opt.id && <ArrowRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: REASONING */}
      {step >= 4 && step < 6 && (
        <div className="border border-zinc-800 bg-zinc-950 p-6 rounded-sm mb-12 animate-in slide-in-from-top-4 fade-in">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Brain className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="space-y-6 w-full">
              <div>
                <p className="text-zinc-300 font-bold tracking-wide">Interesting choice.</p>
                <p className="text-zinc-500 text-sm mt-1 tracking-wider">What is the primary foundation for this decision?</p>
              </div>
              <div className="space-y-2">
                {reasoningOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedReasoning(opt.id)}
                    className={`w-full p-3 text-left text-sm tracking-wide transition-all flex items-center gap-3 ${
                      selectedReasoning === opt.id
                        ? "text-emerald-400 bg-emerald-500/5"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm border ${selectedReasoning === opt.id ? "border-emerald-500 bg-emerald-500" : "border-zinc-700"}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
              {selectedReasoning && (
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleEvaluate} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase"
                  >
                    Lock Decision
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 6 & 7: PROCESSING & OUTCOME */}
      {step >= 6 && (
        <div className="mb-12">
          {step === 6 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-pulse text-emerald-500">
              <Activity className="w-8 h-8" />
              <p className="text-sm font-bold tracking-widest uppercase">Signal Engine Processing...</p>
            </div>
          )}
          {step === 7 && (
            <div className="text-center py-12 animate-in zoom-in-95 duration-500">
              <p className="text-lg text-zinc-300 tracking-wider">Interesting.</p>
              <p className="text-zinc-500 tracking-widest mt-2">Let's see what history decided.</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 8, 9 & 10: LESSON, EVIDENCE, LOOP */}
      {step >= 8 && evaluateMutation.data && (
        <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
          
          {/* Decision Rating Update */}
          <div className="flex flex-col items-center justify-center py-8 border-y border-zinc-900 bg-zinc-950">
            <p className="text-xs text-zinc-500 tracking-widest uppercase mb-4">Decision Rating Updated</p>
            <div className="flex items-center gap-4 text-2xl font-bold tracking-widest">
              <span className="text-zinc-500">812</span>
              <ArrowRight className="w-5 h-5 text-zinc-700" />
              <span className={`${evaluateMutation.data.isCorrect ? "text-emerald-500" : "text-amber-500"}`}>
                812 <span className="text-sm ml-1">({evaluateMutation.data.isCorrect ? "+18" : "-5"})</span>
              </span>
            </div>
          </div>

          {/* The Reveal */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-zinc-800 p-6 bg-zinc-950/50">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Your Decision</p>
                <p className={`font-bold tracking-widest text-lg uppercase mb-2 ${evaluateMutation.data.isCorrect ? "text-emerald-400" : "text-amber-400"}`}>
                  {mission.options.find(o => o.id === selectedDecision)?.label}
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {reasoningOptions.find(o => o.id === selectedReasoning)?.label}
                </p>
              </div>
              <div className="border border-zinc-800 p-6 bg-zinc-950/50">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">History's Verdict</p>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${evaluateMutation.data.isCorrect ? "text-emerald-500" : "text-amber-500"}`} />
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {evaluateMutation.data.debrief}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-sm relative mt-8">
              <div className="absolute -top-3 left-6 bg-zinc-950 px-2 text-xs font-bold tracking-widest text-emerald-500 uppercase">Signal Engine Reflection</div>
              <p className="text-emerald-400 font-medium tracking-wide">
                {evaluateMutation.data.lesson}
              </p>
            </div>
          </div>

          {/* Inspect Evidence & Next Case */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12 border-t border-zinc-900">
            <Link to="/analytics/replay">
              <Button className="w-full h-auto py-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 flex flex-col items-start px-6 h-full">
                <span className="text-xs text-zinc-500 tracking-widest uppercase mb-2">How did I know?</span>
                <span className="font-bold tracking-widest uppercase flex items-center gap-2">Inspect Evidence <ArrowRight className="w-4 h-4" /></span>
              </Button>
            </Link>

            <Button onClick={() => alert("New cases will be added soon!")} variant="outline" className="w-full h-auto py-6 border-zinc-800 text-zinc-400 hover:text-zinc-100 flex flex-col items-start px-6 bg-transparent h-full whitespace-normal text-left">
              <span className="text-xs text-zinc-600 tracking-widest uppercase mb-4 leading-relaxed block">
                I've identified another historical decision.<br/>Different market. Same principle. Ready?
              </span>
              <span className="font-bold tracking-widest uppercase flex items-center gap-2 text-zinc-300 mt-auto">Open Next Case <ArrowRight className="w-4 h-4" /></span>
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
