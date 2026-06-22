/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Search, Briefcase, FileCode2, ChevronRight, Loader2, Database, Code2, BrainCircuit, Activity, ArrowRight, CheckCircle2, XCircle, Zap, FileText, GitBranch, BookOpen, ChevronDown, ChevronUp, FileCode, Clock, Trophy, Target, Cpu, Sparkles, Download, Navigation } from 'lucide-react';

const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 12000); // Medium density
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.3, // smooth drift
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.5 + 1, // Visible but not huge
          baseAlpha: Math.random() * 0.5 + 0.3, // Visible dots
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${p.baseAlpha})`; // blue-400
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) { // Medium connection distance
            ctx.beginPath();
            const opacity = (1 - dist / 150) * 0.4; // Visible but elegant lines
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
            ctx.lineWidth = 1; // 1px thickness
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};

const PROJECTS_DATA: Record<string, any> = {
  "AeroIntel": { day: "5-6", stack: ["Python", "FastAPI", "React", "PostgreSQL"], desc: "Aviation intelligence platform aggregating flight data.", type: "Data Platform", learnings: ["Handling real-time flight streams", "PostgreSQL JSONB optimization", "FastAPI dependency injection"], interview: ["Data Engineering", "Backend Developer"] },
  "AniMatch": { day: 9, stack: ["PyTorch", "Jikan API", "Next.js"], desc: "AI-powered anime recommendation engine.", type: "Recommendation Engine", learnings: ["Matrix Factorization with PyTorch", "Handling sparse datasets", "Anime metadata extraction"], interview: ["ML Engineer", "AI Researcher"] },
  "Forge": { day: 11, stack: ["Next.js", "Tailwind", "Vercel"], desc: "Developer portfolio and blog engine.", type: "AI Agent System", learnings: ["Next.js App Router caching", "MDX rendering", "Vercel edge functions"], interview: ["Frontend Engineer", "Full-Stack"] },
  "World Cup Hub": { day: 8, stack: ["Prisma", "PostgreSQL", "Next.js", "ETL"], desc: "Strictly typed full-stack soccer data architecture.", type: "Analytics Platform", learnings: ["Complex Prisma joins", "ETL pipelines for sports data", "Strict TypeScript typing"], interview: ["Backend Engineer", "Data Engineer"] },
  "Startup Roulette": { day: 12, stack: ["React", "Firebase", "WebRTC"], desc: "Randomized networking for founders.", type: "Viral Product", learnings: ["WebRTC peer connections", "Firebase real-time sync", "Managing media streams"], interview: ["Frontend Engineer"] },
  "SoFocus": { day: 13, stack: ["Next.js", "Node.js", "MongoDB", "AI"], desc: "Productivity platform leveraging AI for task categorization.", type: "Learning System", learnings: ["AI task classification", "MongoDB aggregation pipelines", "Next.js server actions"], interview: ["Full-Stack Engineer", "AI Engineer"] },
  "IsSheMadAtMe": { day: 7, stack: ["React", "FastAPI", "OpenAI"], desc: "Satirical AI consumer app analyzing relationship texts.", type: "AI Consumer App", learnings: ["Prompt engineering constraints", "FastAPI setup", "React state management"], interview: ["AI Product Manager", "Full-Stack"] },
  "BlackjackOracle": { day: 10, stack: ["Python", "Monte Carlo", "React"], desc: "Statistical probability engine for Blackjack.", type: "Decision Science", learnings: ["Monte Carlo simulations", "Python performance tuning", "React visualization"], interview: ["Data Scientist", "Python Developer"] }
};

const TIMELINE = [
  { day: "5-6", title: "AeroIntel", category: "Data Platform", icon: "✈️" },
  { day: 7, title: "IsSheMadAtMe", category: "AI Consumer App", icon: "🤖" },
  { day: 8, title: "World Cup Hub", category: "Analytics Platform", icon: "⚽" },
  { day: 9, title: "AniMatch", category: "Recommendation Engine", icon: "🌸" },
  { day: 10, title: "BlackjackOracle", category: "Decision Science", icon: "🃏" },
  { day: 11, title: "Forge", category: "AI Agent System", icon: "🔨" },
  { day: 12, title: "Startup Roulette", category: "Viral Product", icon: "🎲" },
  { day: 13, title: "SoFocus", category: "Learning System", icon: "🎯" },
  { day: 14, title: "SoCortex", category: "Personal OS", icon: "🧠" }
];

const SUGGESTED_QUERIES = [
  "Compare AniMatch vs SoFocus",
  "Compare AeroIntel vs World Cup Hub",
  "Compare Forge vs Startup Roulette",
  "What architecture patterns recur?",
  "Which projects use databases?"
];

const GlobalCommandPalette = ({ setActiveTab, resetPlacement }: { setActiveTab: (t: 'brain' | 'placement') => void, resetPlacement: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, docs, actions..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 text-sm"
            autoFocus
          />
          <kbd className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">esc</kbd>
        </div>
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</div>
          
          <div 
            onClick={() => { setActiveTab('placement'); resetPlacement(); setIsOpen(false); }}
            className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">New Interview Copilot</span>
              <span className="text-xs text-slate-500">Analyze a job description against your projects</span>
            </div>
          </div>
          
          <div 
            onClick={() => { setActiveTab('brain'); setIsOpen(false); }}
            className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">Builder Brain Query</span>
              <span className="text-xs text-slate-500">Semantic search across all notes and code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EvidenceBlock = ({ title, filePath, content, matchScore }: any) => {
  const [expanded, setExpanded] = useState(false);
  const words = content.split(' ').filter((w: string) => w.length > 5).slice(0, 3).map((w: string) => w.replace(/[^a-zA-Z]/g, ''));
  
  return (
    <div className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all group cursor-default shadow-sm hover:shadow-md">
      <div 
        className="flex items-center justify-between px-4 py-3 bg-slate-800/20 border-b border-slate-800 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">{title}</span>
            <span className="text-xs font-mono text-slate-500">{filePath}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-blue-500/10 px-2 py-1 rounded text-blue-400 border border-blue-500/20 font-bold">{matchScore}% match</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>
      
      <div className="px-4 pt-3 pb-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex gap-2">
          {words.map((w: string, i: number) => w && (
            <span key={i} className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> {w}
            </span>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-slate-950 animate-in fade-in slide-in-from-top-2 duration-200">
          <pre className="text-sm font-mono text-slate-400 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-48 overflow-y-auto custom-scrollbar italic border-l-2 border-slate-800 pl-3">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'brain' | 'placement'>('brain');
  
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [brainResponse, setBrainResponse] = useState<any>(null);

  // Placement variables
  const [placementMode, setPlacementMode] = useState<'matcher' | 'strategy'>('matcher');
  const [jd, setJd] = useState('');
  const [role, setRole] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [placementResponse, setPlacementResponse] = useState<any>(null);
  
  const [isStrategizing, setIsStrategizing] = useState(false);
  const [strategyResponse, setStrategyResponse] = useState<any>(null);

  const [activeProject, setActiveProject] = useState<string | null>(null);

  const executeSearch = async (q: string) => {
    if (!q) return;
    setQuery(q);
    setIsSearching(true);
    setBrainResponse(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeProject ? `In ${activeProject}, ${q}` : q })
      });
      const data = await res.json();
      setBrainResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBrainSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleTechClick = (tech: string) => {
    executeSearch(`Which projects use ${tech}?`);
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

  const handleStrategySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setIsStrategizing(true);
    setStrategyResponse(null);
    
    const prompt = `I am interviewing for a ${role} position. Based on my projects, tell me:
1. Which projects to lead with
2. Which projects to mention briefly
3. Which technical decisions are most impressive
4. Which skills align best
5. How I should position myself

Format your output beautifully using Markdown. Include a strict "Strategic Scorecard" at the very beginning in this format exactly:
# Strategic Scorecard
**Portfolio Fit:** [X]%
**Best Projects:** [Projects]
**Strongest Skills:** [Skills]
**Weakest Areas:** [Weaknesses]

Then write out the rest of the strategic advisory.`;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt })
      });
      const data = await res.json();
      setStrategyResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStrategizing(false);
    }
  };

  const exportBrief = () => {
    if (!placementResponse) return;
    
    const mkdn = `# SoCortex Interview Brief

## Role Assessment
${placementResponse.jd_analysis}

**Overall Match:** 88%

## Matching Projects
${placementResponse.matched_projects.map((p: any) => `### ${p.project_name}\n${p.relevance_explanation}`).join('\\n\\n')}

## Matching Skills
${placementResponse.core_skills.join(', ')}

## Skill Gaps to Address
${placementResponse.missing_skills.join(', ')}
`;

    const blob = new Blob([mkdn], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SoCortex-Interview-Brief.md';
    a.click();
  };

  const resetPlacement = () => {
    setJd('');
    setPlacementResponse(null);
    setRole('');
    setStrategyResponse(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 font-sans pb-24 relative overflow-hidden">
      <NeuralBackground />
      <GlobalCommandPalette setActiveTab={setActiveTab} resetPlacement={resetPlacement} />
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setBrainResponse(null); setQuery(''); }}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-100">
              SoCortex
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 ml-4 bg-slate-800 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Personal OS <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
            </span>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('brain')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'brain' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setActiveTab('placement')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'placement' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Placement Copilot
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* REVISED STORY-DRIVEN BUILDER STATS */}
        <div className="mb-16 border border-slate-800 bg-slate-900/40 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-sm">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="space-y-1 relative z-10">
            <h2 className="text-3xl font-extrabold text-slate-50 tracking-tight">Builder Journey</h2>
            <p className="text-slate-400 text-sm">Transforming ideas into production systems across 30 days.</p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-x-12 gap-y-6 relative z-10">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Days Completed</div>
              <div className="text-3xl font-black text-white">14 <span className="text-sm font-medium text-slate-500">/ 30</span></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Projects Shipped</div>
              <div className="text-3xl font-black text-white">8</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Current Evolution</div>
              <div className="text-lg font-bold text-blue-400 mt-1">Personal OS</div>
            </div>
          </div>

          <div className="w-full md:w-auto relative z-10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tech Acquired</div>
            <div className="flex flex-wrap gap-2 max-w-[280px]">
              {['Next.js', 'FastAPI', 'Supabase', 'PyTorch', 'Chrome Extensions'].map(tech => (
                <span key={tech} className="text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'brain' && (
          <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* LEFT COLUMN: THE TIMELINE */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Timeline
                </h3>
              </div>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-[2px] before:bg-slate-800">
                {TIMELINE.map((item, idx) => {
                  const isActive = activeProject === item.title;
                  return (
                    <div key={idx} className="relative flex items-center group cursor-pointer" onClick={() => { setActiveProject(item.title); setBrainResponse(null); setQuery(''); }}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${isActive ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'border-slate-700 bg-slate-900 text-slate-400'} shrink-0 z-10 transition-all`}>
                        {item.icon}
                      </div>
                      <div className={`ml-4 w-full p-3 rounded-xl transition-all ${isActive ? 'bg-slate-900 border-slate-700 shadow-md border' : 'bg-transparent border-transparent hover:bg-slate-900/50 border'}`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>Day {item.day}</span>
                        </div>
                        <h4 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'}`}>{item.title}</h4>
                        <span className={`text-[10px] block mt-0.5 font-medium ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>{item.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: DYNAMIC WORKSPACE */}
            <div className="lg:col-span-9">
              {activeProject && PROJECTS_DATA[activeProject] ? (
                // --- PROJECT WORKSPACE MODE (BIG DOCUMENT STYLE) ---
                <div className="animate-in slide-in-from-right-8 duration-300 space-y-10">
                  <div className="border-b border-slate-800 pb-10">
                    <span className="text-blue-400 font-mono text-sm tracking-widest uppercase mb-4 block">
                      Built Day {PROJECTS_DATA[activeProject].day}
                    </span>
                    <h2 className="text-5xl font-black text-white tracking-tight mb-4">
                      {activeProject}
                    </h2>
                    <p className="text-2xl text-slate-400 font-light mb-6">
                      {PROJECTS_DATA[activeProject].type}
                    </p>
                    <p className="text-slate-300 max-w-3xl text-lg leading-relaxed">
                      {PROJECTS_DATA[activeProject].desc}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Core Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {PROJECTS_DATA[activeProject].stack.map((tech: string) => (
                          <span 
                            key={tech} 
                            onClick={() => handleTechClick(tech)}
                            className="bg-slate-900 text-slate-300 hover:text-white text-sm px-4 py-2 rounded-lg border border-slate-800 cursor-pointer transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Key Learnings</h3>
                      <ul className="space-y-3">
                        {PROJECTS_DATA[activeProject].learnings.map((learning: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                            <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            {learning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-800/50">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Memory Retrieval</h3>
                    <form onSubmit={handleBrainSearch} className="relative group w-full mb-8">
                      <div className="absolute -inset-1 bg-blue-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search within ${activeProject}'s architecture, codebase, and notes...`}
                        className="relative w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-32 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm text-base"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <button 
                        type="submit"
                        disabled={isSearching || !query}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-500 px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                      >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                      </button>
                    </form>

                    {/* Show results strictly for this project */}
                    {brainResponse && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                          <div className="text-slate-200 leading-relaxed text-base" 
                               dangerouslySetInnerHTML={{ __html: brainResponse.answer
                                 .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b border-slate-800 pb-2">$1</h2>')
                                 .replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-blue-400 uppercase tracking-widest mt-6 mb-2">$1</h3>')
                                 .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
                                 .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-slate-300 my-1.5">$1</li>')
                                 .replace(/\n/g, '<br/>') 
                               }} 
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 mt-4">Retrieved Sources</h4>
                          {brainResponse.sources.map((source: any, idx: number) => (
                            <EvidenceBlock 
                              key={idx}
                              title={source.project.replace(/_/g, ' ')}
                              filePath={source.filename}
                              content={source.content}
                              matchScore={source.similarity}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // --- GLOBAL SEARCH MODE ---
                <div className="space-y-8 animate-in fade-in duration-500 mt-4">
                  <div className="text-left space-y-2">
                    <h2 className="text-4xl font-black tracking-tight text-slate-50">
                      Global Memory
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl">Search across the entire 30-day builder journey to find architecture patterns, comparisons, and snippets.</p>
                  </div>

                  <form onSubmit={handleBrainSearch} className="relative mt-8 group w-full max-w-3xl">
                    <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Compare the architectures of AeroIntel and World Cup Hub"
                      className="relative w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 pl-14 pr-32 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xl transition-all text-lg"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <button 
                      type="submit"
                      disabled={isSearching || !query}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-500 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Retrieve'}
                    </button>
                  </form>

                  {!brainResponse && !isSearching && (
                    <div className="pt-4 max-w-3xl">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Suggested Inquiries</span>
                      <div className="flex flex-wrap gap-3">
                        {SUGGESTED_QUERIES.map((q, i) => (
                          <button 
                            key={i}
                            onClick={() => executeSearch(q)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 transition-colors text-left shadow-sm"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {brainResponse && (
                    <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl">
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4" /> 
                          Cortex Synthesis
                        </h3>
                        <div className="text-slate-200 leading-relaxed text-lg" 
                             dangerouslySetInnerHTML={{ __html: brainResponse.answer
                               .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b border-slate-800 pb-2">$1</h2>')
                               .replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-blue-400 uppercase tracking-widest mt-6 mb-2">$1</h3>')
                               .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
                               .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-slate-300 my-1.5">$1</li>')
                               .replace(/\n/g, '<br/>') 
                             }} 
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Database className="w-4 h-4" /> 
                          Found {brainResponse.sources.length} Relevant Sources
                        </h3>
                        
                        <div className="flex flex-col gap-3">
                          {brainResponse.sources.map((source: any, idx: number) => (
                            <EvidenceBlock 
                              key={idx}
                              title={source.project.replace(/_/g, ' ')}
                              filePath={source.filename}
                              content={source.content}
                              matchScore={source.similarity}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placement Copilot section (unchanged) */}
        {activeTab === 'placement' && (
          // ... keeping exact same Placement Code for brevity ...
          <div className="grid lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-4 space-y-6">
              
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-50">Placement Mode</h2>
              </div>
              
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit shadow-sm">
                <button
                  onClick={() => setPlacementMode('matcher')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    placementMode === 'matcher' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> JD Matcher
                </button>
                <button
                  onClick={() => setPlacementMode('strategy')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    placementMode === 'strategy' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Navigation className="w-4 h-4" /> Positioning
                </button>
              </div>

              {placementMode === 'matcher' ? (
                <form onSubmit={handlePlacementMatch} className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-slate-400 text-sm">Paste a Job Description. SoCortex will map your exact projects to their requirements.</p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <textarea
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                      placeholder="Paste Job Description here..."
                      className="relative w-full h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none shadow-xl leading-relaxed"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isMatching || !jd}
                    className="w-full bg-blue-600 text-white hover:bg-blue-500 font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-600/20"
                  >
                    {isMatching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Briefcase className="w-5 h-5" /> Analyze Match</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleStrategySubmit} className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-slate-400 text-sm">Input the role you are interviewing for. SoCortex will build a strategic scorecard for you.</p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. ML Engineer, Full-Stack"
                      className="relative w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-50 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 shadow-xl text-lg"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isStrategizing || !role}
                    className="w-full bg-blue-600 text-white hover:bg-blue-500 font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-600/20"
                  >
                    {isStrategizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Navigation className="w-5 h-5" /> Build Strategy</>}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-8">
              {placementMode === 'matcher' && placementResponse && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 h-full shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-50">Interview Copilot Analysis</h2>
                        <p className="text-sm text-slate-400">Evaluating fit based on your builder journey</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={exportBrief}
                        className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-slate-200 font-medium transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" /> Export Brief
                      </button>
                      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 shadow-sm">
                        <span className="text-sm font-medium text-slate-400">Match</span>
                        <span className="text-lg font-bold text-emerald-400">88%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-sm italic border-l-2 border-blue-500 pl-4 py-1 bg-blue-500/5 rounded-r-lg">
                    "{placementResponse.jd_analysis}"
                  </p>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Skills Requested</h3>
                    <div className="flex flex-wrap gap-2">
                      {placementResponse.core_skills?.map((skill: string, idx: number) => (
                        <span key={idx} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <GitBranch className="w-4 h-4 text-slate-500" />
                      <h3 className="text-sm font-bold text-slate-200">Your Matching Projects</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {placementResponse.matched_projects?.map((proj: any, idx: number) => {
                        const matchScore = 98 - (idx * 6);
                        return (
                          <div key={idx} className="group bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-5 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-slate-100 font-bold text-base group-hover:text-blue-400 transition-colors">{proj.project_name.replace(/_/g, ' ')}</h4>
                              </div>
                              <div className="bg-slate-900 rounded-full px-2 py-0.5 border border-slate-700">
                                <span className="text-xs font-mono text-slate-300">{matchScore}%</span>
                              </div>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">{proj.relevance_explanation}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {placementResponse.missing_skills?.length > 0 && (
                    <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-6 mt-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-5 text-rose-400">
                        <XCircle className="w-4 h-4" />
                        <span className="font-bold text-sm">Missing Skills (Gap Analysis)</span>
                      </div>
                      <div className="space-y-4">
                        {placementResponse.missing_skills.map((gap: string, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{gap}</span>
                            <div className="w-1/3 h-1.5 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                              <div className="h-full w-[25%] bg-rose-500/80 rounded-full" />
                            </div>
                            <span className="text-slate-500 text-xs font-mono ml-4">Low</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {placementMode === 'strategy' && strategyResponse && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 h-full shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-50">Strategic Scorecard</h2>
                      <p className="text-sm text-slate-400">Positioning strategy for {role}</p>
                    </div>
                  </div>

                  {/* Rendering the Markdown strategy response */}
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-base prose-h1:text-xl prose-h1:font-bold prose-h1:border-b prose-h1:border-slate-800 prose-h1:pb-3 prose-strong:text-white prose-li:my-1.5" 
                       dangerouslySetInnerHTML={{ __html: strategyResponse.answer
                         .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                         .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                         .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                         .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                         .replace(/^- (.*$)/gim, '<li>$1</li>')
                         .replace(/\n/g, '<br/>') 
                       }} 
                  />
                </div>
              )}

              {!placementResponse && placementMode === 'matcher' && (
                <div className="h-full min-h-[500px] border border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-500 flex-col gap-6 p-8 text-center bg-slate-900/50">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 opacity-50 text-blue-400" />
                  </div>
                  <p className="max-w-sm text-lg">Paste a job description and click analyze to see which of your projects make you the perfect candidate.</p>
                </div>
              )}

              {!strategyResponse && placementMode === 'strategy' && (
                <div className="h-full min-h-[500px] border border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-500 flex-col gap-6 p-8 text-center bg-slate-900/50">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <Navigation className="w-8 h-8 opacity-50 text-blue-400" />
                  </div>
                  <p className="max-w-sm text-lg">Input a target role to get a breakdown of exactly which projects to highlight in your interview.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
