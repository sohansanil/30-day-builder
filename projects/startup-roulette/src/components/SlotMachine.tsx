"use client";

import { useState, useEffect, useRef } from "react";
import { 
  PRODUCT_TYPES, AUDIENCES, TWISTS, TECHNOLOGIES, 
  BUSINESS_MODELS, CONSTRAINTS, CHAOS_MODIFIERS,
  getRandomByRarity, getRandom, Rarity 
} from "@/config/roulette-data";
import { Reel } from "./Reel";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, RotateCcw, Dices, Camera } from "lucide-react";
import { toPng } from "html-to-image";

const FAKE_LOGIC_OPTIONS = [
  "Audience Match", "Virality Score", "Execution Simplicity", 
  "Founder Delusion Synergy", "Market Timing", "Meme Potential", 
  "VC Desperation", "Legal Loophole Size", "Monetization Aggressiveness",
  "Unnecessary Complexity", "Moral Ambiguity", "Buzzword Density"
];

const REACTIONS = [
  "🤖 GPT Verdict: Unfortunately, this would probably raise venture funding.",
  "💰 Investor Reaction: Please stop emailing me.",
  "🤖 GPT Verdict: This violates several international treaties.",
  "💰 Investor Reaction: I'll give you $4M at a $40M cap.",
  "🧠 Founder Thought: It's basically Uber but for highly illegal things.",
  "📈 Market Analyst: Total addressable market is exactly 14 people.",
  "📉 Market Analyst: You're going to prison.",
  "🤖 GPT Verdict: I am an AI language model and I refuse to help you build this.",
  "💰 Investor Reaction: Pivot to crypto and I'm in.",
  "🤖 GPT Verdict: Sounds like a feature, not a product.",
  "💼 YC Partner: Can you launch this by Tuesday?"
];

const PUNCHLINES = [
  "Estimated Seed Round: $4.2M",
  "First Investor: A guy named Trevor from San Francisco",
  "Projected LinkedIn Posts: 17 per week",
  "Number of cease and desist letters: 4",
  "Time until pivot: 3 weeks",
  "Current ARR: $0.00",
  "Weekly Active Users: Just the founder's mom",
  "Required daily caffeine: 400mg per developer",
  "Number of 'stealth mode' tweets: 12",
  "Months until acquihired by Apple: 8",
  "Chances of getting sued by Disney: 100%"
];

// Audio generation utilities using Web Audio API
const playTickSound = (audioCtx: AudioContext, time: number, pitch: number) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pitch, time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.05, time + 0.01);
  gain.gain.linearRampToValueAtTime(0, time + 0.05);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.05);
};

const playSpinAudio = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    let time = audioCtx.currentTime;
    for (let i = 0; i < 30; i++) {
      playTickSound(audioCtx, time, 300 + Math.random() * 200);
      const delay = 0.05 + (i * i * 0.0003); 
      time += delay;
    }
  } catch (e) {
    console.warn("Audio failed", e);
  }
};

const playWinAudio = (isLegendary: boolean) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = isLegendary ? 'square' : 'sine';
    osc.frequency.setValueAtTime(isLegendary ? 400 : 600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isLegendary ? 800 : 1200, audioCtx.currentTime + 0.5);
    if (isLegendary) {
       osc.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 1.5);
    }
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (isLegendary ? 2.0 : 1.0));
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + (isLegendary ? 2.0 : 1.0));
  } catch (e) {}
};

const generateTrack = (source: string[], length: number, start: string, target: string) => {
  const track = Array.from({ length: length - 2 }, () => getRandom(source));
  return [start, ...track, target];
};

export function SlotMachine() {
  const [spinning, setSpinning] = useState(false);
  const [spinCompleted, setSpinCompleted] = useState(false);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [flash, setFlash] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  
  const [productTrack, setProductTrack] = useState<string[]>(["Uber"]);
  const [audienceTrack, setAudienceTrack] = useState<string[]>(["Gamers"]);
  const [twistTrack, setTwistTrack] = useState<string[]>(["AI Agents"]);

  const [rarity, setRarity] = useState<Rarity | null>(null);

  const [chaosData, setChaosData] = useState<{
    technology: string;
    businessModel: string;
    constraint: string;
    modifier: string;
  } | null>(null);

  const [scoreData, setScoreData] = useState<{ score: number } | null>(null);
  const [fakeLogic, setFakeLogic] = useState<{name: string, value: number}[]>([]);
  const [reaction, setReaction] = useState<string | null>(null);
  const [punchline, setPunchline] = useState<string | null>(null);

  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProductTrack([getRandom(PRODUCT_TYPES)]);
    setAudienceTrack([getRandom(AUDIENCES)]);
    setTwistTrack([getRandom(TWISTS)]);
  }, []);

  const fireLegendaryConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff00ff', '#00ffff', '#ffff00']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff00ff', '#00ffff', '#ffff00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setSpinCount(prev => prev + 1);
    setSpinCompleted(false);
    setScoreData(null);
    setChaosData(null);
    setRarity(null);
    setReaction(null);
    setPunchline(null);
    setFlash(false);

    playSpinAudio();

    const targetProduct = getRandomByRarity(PRODUCT_TYPES);
    const targetAudience = getRandomByRarity(AUDIENCES);
    const targetTwist = getRandomByRarity(TWISTS);

    const rarityLevels = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4 };
    const maxRarityValue = Math.max(
      rarityLevels[targetProduct.rarity],
      rarityLevels[targetAudience.rarity],
      rarityLevels[targetTwist.rarity]
    );
    const finalRarity = Object.keys(rarityLevels).find(key => rarityLevels[key as Rarity] === maxRarityValue) as Rarity;
    
    const currentProduct = productTrack[productTrack.length - 1];
    const currentAudience = audienceTrack[audienceTrack.length - 1];
    const currentTwist = twistTrack[twistTrack.length - 1];

    setProductTrack(generateTrack(PRODUCT_TYPES, 30, currentProduct, targetProduct.item));
    setAudienceTrack(generateTrack(AUDIENCES, 40, currentAudience, targetAudience.item));
    setTwistTrack(generateTrack(TWISTS, 50, currentTwist, targetTwist.item));

    if (isChaosMode) {
      setChaosData({
        technology: getRandomByRarity(TECHNOLOGIES).item,
        businessModel: getRandomByRarity(BUSINESS_MODELS).item,
        constraint: getRandomByRarity(CONSTRAINTS).item,
        modifier: getRandomByRarity(CHAOS_MODIFIERS).item,
      });
    }

    setTimeout(() => {
      setSpinning(false);
      setSpinCompleted(true);
      setRarity(finalRarity);
      
      setFlash(true);
      setTimeout(() => setFlash(false), 300);

      const isLegendary = finalRarity === 'Legendary';
      const isEpic = finalRarity === 'Epic';
      
      playWinAudio(isLegendary);

      if (isLegendary) {
        fireLegendaryConfetti();
      } else {
        confetti({
          particleCount: isEpic ? 200 : 100,
          spread: isEpic ? 100 : 80,
          origin: { y: 0.6 },
          colors: ['#f5d76e', '#e74c3c', '#ffffff']
        });
      }

      let minScore = 40;
      let maxScore = 60;
      if (finalRarity === 'Rare') { minScore = 61; maxScore = 80; }
      if (finalRarity === 'Epic') { minScore = 81; maxScore = 94; }
      if (finalRarity === 'Legendary') { minScore = 95; maxScore = 100; }
      
      const score = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
      setScoreData({ score });

      const p1 = Math.floor(score * 0.4);
      const p2 = Math.floor(score * 0.35);
      const p3 = score - p1 - p2;
      const shuffledLogic = [...FAKE_LOGIC_OPTIONS].sort(() => 0.5 - Math.random());
      setFakeLogic([
        { name: shuffledLogic[0], value: p1 },
        { name: shuffledLogic[1], value: p2 },
        { name: shuffledLogic[2], value: p3 },
      ]);

      setReaction(getRandom(REACTIONS));
      setPunchline(getRandom(PUNCHLINES));

    }, 2600); 
  };

  const handleBuildIt = () => {
    const p = productTrack[productTrack.length - 1];
    const a = audienceTrack[audienceTrack.length - 1];
    const t = twistTrack[twistTrack.length - 1];
    let idea = `${p} for ${a} where ${t}`;
    
    if (isChaosMode && chaosData) {
      idea += `\nTechnology: ${chaosData.technology}\nBusiness Model: ${chaosData.businessModel}\nConstraint: ${chaosData.constraint}\nChaos: ${chaosData.modifier}`;
    }
    
    window.open(`https://forge-pearl-eight.vercel.app?idea=${encodeURIComponent(idea)}`, '_blank');
  };

  const takeScreenshot = async () => {
    if (captureRef.current) {
      try {
        const dataUrl = await toPng(captureRef.current, { 
          backgroundColor: '#120e23',
          pixelRatio: 2 // For high quality
        });
        const link = document.createElement("a");
        link.download = "startup-disaster.png";
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Screenshot failed", err);
      }
    }
  };

  const getRarityColor = (r: Rarity | null) => {
    switch (r) {
      case 'Legendary': return 'text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]';
      case 'Epic': return 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]';
      case 'Rare': return 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]';
      default: return 'text-gray-400';
    }
  };

  const finalProduct = productTrack[productTrack.length - 1];
  const finalAudience = audienceTrack[audienceTrack.length - 1];
  const finalTwist = twistTrack[twistTrack.length - 1];

  const chaosContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.6 }
    }
  };

  const chaosItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 15 } }
  };

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-5xl mx-auto mt-2 pb-24">
      
      {!spinning && !spinCompleted && (
        <button 
          onClick={() => setIsChaosMode(!isChaosMode)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border-2 ${isChaosMode ? 'bg-red-900/30 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}`}
        >
          <Dices className="w-5 h-5" />
          {isChaosMode ? "CHAOS MODE ACTIVE" : "NORMAL MODE"}
        </button>
      )}

      {/* The Machine & Lever Wrapper */}
      <div className="relative w-full flex justify-center">
        
        {/* Fake Crank / Lever (Desktop Only) */}
        <motion.div 
          className="absolute -right-16 md:-right-24 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center cursor-pointer group z-0"
          animate={spinning ? { rotateX: 65, y: 30 } : { rotateX: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          style={{ transformOrigin: "bottom center" }}
          onClick={handleSpin}
        >
          {/* Lever handle ball */}
          <div className="w-12 h-12 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:bg-red-500 transition-colors z-10" />
          {/* Lever shaft */}
          <div className="w-4 h-36 bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-xl shadow-inner -mt-3" />
          {/* Lever base pivot */}
          <div className="w-10 h-14 bg-gray-800 rounded-lg -mt-4 border-r-4 border-b-4 border-gray-900 shadow-xl flex items-center justify-center">
             <div className="w-6 h-6 rounded-full bg-gray-600 shadow-inner" />
          </div>
        </motion.div>

        {/* The Machine Main Box with Shake Animation */}
        <motion.div 
          animate={spinning ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 1, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className={`relative z-10 p-6 md:p-8 bg-black/40 rounded-3xl border ${isChaosMode ? 'border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : 'border-white/10 shadow-2xl'} backdrop-blur-sm w-full transition-all duration-500`}
        >
          {/* Gold Flash Overlay */}
          <div className={`absolute inset-0 bg-casino-gold pointer-events-none transition-opacity duration-300 rounded-3xl ${flash ? 'opacity-30' : 'opacity-0'}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex gap-2">
              <div className={`w-3 h-3 rounded-full ${isChaosMode ? 'bg-red-500 animate-ping' : 'bg-red-500 animate-pulse'}`} />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-casino-gold font-mono text-sm uppercase tracking-widest font-bold">
              Startup Generator v3000
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-center w-full bg-black/60 p-6 rounded-2xl border-t-[8px] border-casino-bg-light shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
            <Reel items={productTrack} spinning={spinning} selectedItemIndex={productTrack.length - 1} spinCount={spinCount} />
            <div className="text-gray-500 font-black text-xl italic lg:-rotate-90 py-2">FOR</div>
            <Reel items={audienceTrack} spinning={spinning} selectedItemIndex={audienceTrack.length - 1} spinCount={spinCount} />
            <div className="text-gray-500 font-black text-xl italic lg:-rotate-90 py-2">WHERE</div>
            <Reel items={twistTrack} spinning={spinning} selectedItemIndex={twistTrack.length - 1} spinCount={spinCount} />
          </div>
        </motion.div>
      </div>

      {!spinCompleted && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpin}
          disabled={spinning}
          className={`
            relative group overflow-hidden px-16 py-6 rounded-full font-black text-4xl tracking-wider uppercase
            transition-all duration-300 mt-4
            ${spinning 
              ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none" 
              : isChaosMode
                ? "bg-gradient-to-b from-red-500 to-red-800 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:shadow-[0_0_60px_rgba(239,68,68,0.8)]"
                : "bg-gradient-to-b from-casino-gold to-casino-gold-dark text-black shadow-[0_0_40px_rgba(245,215,110,0.5)] hover:shadow-[0_0_60px_rgba(245,215,110,0.8)]"
            }
          `}
        >
          {spinning ? "Spinning..." : isChaosMode ? "UNLEASH CHAOS" : "SPIN!"}
          {!spinning && (
            <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
          )}
        </motion.button>
      )}

      {/* Post-Spin Reveal Area */}
      <AnimatePresence>
        {spinCompleted && scoreData && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-10 w-full mt-4"
          >
            
            {/* SCREENSHOT CAPTURE AREA */}
            <div ref={captureRef} className="w-full flex flex-col items-center gap-6 p-4 md:p-8 bg-[#120e23] rounded-[3rem]">
              {/* BIG STARTUP CARD */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20, delay: 0.2 }}
                className="w-full text-center p-8 md:p-12 bg-gradient-to-b from-white/10 to-transparent border-t-2 border-white/20 rounded-[3rem] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-b-full" />
                
                <div className="text-casino-gold font-bold tracking-[0.2em] uppercase text-sm mb-6 flex items-center justify-center gap-3">
                  <span className="w-8 h-[1px] bg-casino-gold/50" />
                  💡 Your Startup
                  <span className="w-8 h-[1px] bg-casino-gold/50" />
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.3] text-balance">
                  <span className="text-blue-400">{finalProduct}</span> <br/>
                  <span className="text-gray-500 italic text-2xl md:text-4xl font-serif">for</span> <br/>
                  <span className="text-emerald-400">{finalAudience}</span> <br/>
                  <span className="text-gray-500 italic text-2xl md:text-4xl font-serif">where</span> <br/>
                  <span className="text-purple-400">{finalTwist}</span>
                </h2>
                
                <div className={`mt-8 inline-block px-6 py-2 rounded-full border-2 border-current text-sm font-bold tracking-widest uppercase ${getRarityColor(rarity)}`}>
                  {rarity} IDEA
                </div>
              </motion.div>

              {/* CHAOS SEQUENTIAL REVEAL */}
              {isChaosMode && chaosData && (
                <motion.div 
                  variants={chaosContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <motion.div variants={chaosItemVariants} className="bg-black/60 p-6 rounded-2xl border border-red-500/30 shadow-[0_5px_15px_rgba(239,68,68,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">⚡</div>
                    <div className="text-red-400 font-bold uppercase tracking-widest text-sm mb-2">Technology</div>
                    <div className="text-2xl font-black text-white">{chaosData.technology}</div>
                  </motion.div>
                  
                  <motion.div variants={chaosItemVariants} className="bg-black/60 p-6 rounded-2xl border border-green-500/30 shadow-[0_5px_15px_rgba(34,197,94,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💰</div>
                    <div className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">Business Model</div>
                    <div className="text-2xl font-black text-white">{chaosData.businessModel}</div>
                  </motion.div>
                  
                  <motion.div variants={chaosItemVariants} className="bg-black/60 p-6 rounded-2xl border border-orange-500/30 shadow-[0_5px_15px_rgba(249,115,22,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🚨</div>
                    <div className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-2">Constraint</div>
                    <div className="text-2xl font-black text-white">{chaosData.constraint}</div>
                  </motion.div>
                  
                  <motion.div variants={chaosItemVariants} className="bg-black/60 p-6 rounded-2xl border border-purple-500/30 shadow-[0_5px_15px_rgba(168,85,247,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🤡</div>
                    <div className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-2">Chaos Modifier</div>
                    <div className="text-2xl font-black text-white">{chaosData.modifier}</div>
                  </motion.div>
                </motion.div>
              )}

              {/* FAKE SCORE LOGIC & REACTION */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: isChaosMode ? 3.5 : 1.0 }}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 rounded-3xl w-full max-w-2xl shadow-2xl backdrop-blur-md flex flex-col md:flex-row gap-8 items-center"
              >
                <div className="flex-1 w-full space-y-4">
                  {fakeLogic.map((logic, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                      <span className="text-gray-300 font-medium">{logic.name}</span>
                      <span className="font-black text-emerald-400 text-xl">+{logic.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex-1 w-full flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8">
                  <div className="text-7xl font-black text-white leading-none mb-2">{scoreData.score}</div>
                  <div className="text-xl text-gray-500 font-bold mb-6 tracking-widest uppercase">/ 100 Score</div>
                  
                  {reaction && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-xl text-blue-200 text-sm font-medium italic text-center w-full">
                      {reaction}
                      {punchline && (
                        <>
                          <hr className="my-2 border-blue-500/20" />
                          <div className="text-blue-300 font-bold not-italic">{punchline}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            {/* END SCREENSHOT CAPTURE AREA */}

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isChaosMode ? 4 : 1.5 }}
              className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl px-4"
            >
              <button
                onClick={() => {
                  setSpinCompleted(false);
                  setScoreData(null);
                  setChaosData(null);
                  setRarity(null);
                  setFakeLogic([]);
                  setReaction(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-5 rounded-2xl font-bold bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/20 text-lg"
              >
                <RotateCcw className="w-5 h-5" />
                PASS
              </button>
              
              <button
                onClick={takeScreenshot}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-5 rounded-2xl font-bold bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 transition-colors text-purple-200 text-lg"
              >
                <Camera className="w-5 h-5" />
                SHARE DISASTER
              </button>

              <button
                onClick={handleBuildIt}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-5 rounded-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all text-white shadow-lg hover:shadow-blue-500/50 text-xl tracking-wide"
              >
                <Hammer className="w-6 h-6" />
                BUILD IT
              </button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
