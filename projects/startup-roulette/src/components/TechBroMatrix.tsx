"use client";

import { useEffect, useRef } from "react";

const BUZZWORDS = [
  "SYNERGY", "AI", "CRYPTO", "WEB3", "BLOCKCHAIN", "SAAS", "B2B",
  "DISRUPT", "PIVOT", "AGILE", "METAVERSE", "LLM", "AGENTS", "RAG",
  "🚀", "💸", "🦄", "🤡", "📉", "📈", "🔥", "A16Z", "SEED", "SERIES A",
  "VC", "ARR", "MRR", "CHURN", "B2B", "VERTICAL", "EDGE", "AI ETHICS", "DECENTRALIZED ETHICAL AI"
];

interface Drop {
  x: number;
  y: number;
  text: string;
  speed: number;
  opacity: number;
  scale: number;
}

export function TechBroMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let drops: Drop[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize independent drops
    const initDrops = () => {
      drops = [];
      const numDrops = Math.floor((window.innerWidth * window.innerHeight) / 20000); // Responsive amount
      for (let i = 0; i < numDrops; i++) {
        drops.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight - window.innerHeight, // Start anywhere
          text: BUZZWORDS[Math.floor(Math.random() * BUZZWORDS.length)],
          speed: 0.5 + Math.random() * 2,
          opacity: 0.1 + Math.random() * 0.4,
          scale: 0.8 + Math.random() * 0.7
        });
      }
    };
    initDrops();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach(drop => {
        ctx.font = `bold ${20 * drop.scale}px monospace`;

        // Emojis are mostly white, text is matrix green
        const isEmoji = drop.text.match(/[\p{Emoji}\u200d]+/gu);
        if (isEmoji) {
          ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity})`;
        } else {
          // Glowing tech green
          ctx.fillStyle = `rgba(16, 185, 129, ${drop.opacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(16, 185, 129, ${drop.opacity})`;
        }

        ctx.fillText(drop.text, drop.x, drop.y);
        ctx.shadowBlur = 0; // Reset for performance

        drop.y += drop.speed;

        // Reset drop when it falls off screen
        if (drop.y > canvas.height + 50) {
          drop.y = -50;
          drop.x = Math.random() * canvas.width;
          drop.text = BUZZWORDS[Math.floor(Math.random() * BUZZWORDS.length)];
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#120e23] overflow-hidden">
      {/* Heavy vignette shadow to blend edges */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#120e23] opacity-80" style={{ background: 'radial-gradient(circle, transparent 20%, #120e23 90%)' }} />
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
    </div>
  );
}
