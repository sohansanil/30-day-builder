'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BlurFade } from '@/components/ui/blur-fade';
import { getRandomMemory, getMemories, CATEGORIES, Memory } from '@/lib/supabase';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';

const TILTS = [-2.5, 1.8, -1.5];

function PolaroidCard({ memory, index, delay }: { memory: Memory; index: number; delay: number }) {
  const cat = CATEGORIES[memory.category] || { label: 'Memory', emoji: '📍', color: '#a36132' };
  const tilt = TILTS[index % TILTS.length];

  return (
    <BlurFade delay={delay} inView>
      <motion.div
        style={{
          background: '#fdfbf7', // Crisp polaroid white/cream
          padding: '14px 14px 40px',
          borderRadius: '2px',
          transform: `rotate(${tilt}deg)`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.05)',
          cursor: 'default',
          transformOrigin: 'center',
          position: 'relative',
        }}
        whileHover={{
          transform: `rotate(0deg) translateY(-8px)`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
          transition: { duration: 0.25, ease: 'easeOut' },
          zIndex: 10,
        }}
      >
        {/* Subtle tape at the top */}
        <div style={{
          position: 'absolute',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%) rotate(-2deg)',
          width: '40px',
          height: '14px',
          background: 'rgba(255, 255, 255, 0.6)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          zIndex: 2,
        }} />

        {/* Polaroid image area */}
        <div style={{
          background: `linear-gradient(135deg, ${cat.color}25 0%, ${cat.color}05 100%)`,
          border: `1px solid ${cat.color}30`,
          borderRadius: '2px',
          padding: '20px',
          marginBottom: '16px',
          minHeight: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-memory)',
            fontStyle: 'italic',
            fontSize: '15px',
            lineHeight: '1.7',
            color: '#1a1a1a',
            textAlign: 'center',
          }}>
            &ldquo;{memory.text}&rdquo;
          </p>
        </div>

        {/* Polaroid label area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={11} style={{ color: cat.color }} />
            <span style={{
              fontSize: '13px',
              color: '#333',
              fontFamily: 'var(--font-memory)',
              fontStyle: 'italic',
            }}>
              {memory.location_name}
            </span>
          </div>
          <span style={{ fontSize: '12px' }}>
            {cat.emoji}
          </span>
        </div>
      </motion.div>
    </BlurFade>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    getMemories().then(all => {
      const shuffled = [...all].sort(() => Math.random() - 0.5);
      setMemories(shuffled.slice(0, 3));
    });
  }, []);

  const handleTakeMe = async () => {
    setLoading(true);
    const memory = await getRandomMemory();
    setTransitioning(true);
    setTimeout(() => {
      router.push(memory
        ? `/map?lat=${memory.lat}&lng=${memory.lng}&id=${memory.id}`
        : '/map'
      );
    }, 600);
  };

  return (
    <>
      <style>{`
        @keyframes spin-dark { to { transform: rotate(360deg); } }
      `}</style>

      {/* Main container with the seamless paper texture for the bottom scrollable content */}
      <main style={{ 
        backgroundImage: "url('/paper-texture.png')",
        backgroundSize: '400px', 
        backgroundRepeat: 'repeat',
        backgroundColor: '#f4efe6', 
        minHeight: '100vh', 
        overflowX: 'hidden',
        color: '#2a2622' 
      }}>

        {/* ═══════════════════════════ HERO SECTION (Image Background) */}
        <section style={{
          minHeight: '100vh',
          width: '100vw',
          backgroundImage: "url('/bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Desktop Background */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src="/bg.png"
              alt="Scrapbook background"
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
          {/* Mobile Background */}
          <div className="block sm:hidden absolute inset-0">
            <Image
              src="/bg-mobile.png"
              alt="Scrapbook background"
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
          {/* Text Content Wrapper with soft halo for legibility over busy backgrounds */}
          <div style={{
            background: 'radial-gradient(ellipse at center, rgba(244,239,230,0.9) 0%, rgba(244,239,230,0.7) 40%, rgba(244,239,230,0) 70%)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            width: '100%',
            maxWidth: '1000px',
          }}>
            {/* Brand tag (Scrapbook Tape) */}
            <motion.div
              initial={{ opacity: 0, y: -10, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              whileHover={{ scale: 1.05, rotate: 1, y: -2 }}
              whileTap={{ scale: 0.95, rotate: -3 }}
              style={{ 
                marginBottom: '32px',
                cursor: 'pointer',
                display: 'inline-block',
                background: 'rgba(242, 238, 226, 0.95)',
                padding: '8px 24px',
                color: '#524337',
                fontSize: '12px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                boxShadow: '0 4px 10px rgba(0,0,0,0.08), inset 0 0 10px rgba(255,255,255,0.8)',
                border: 'none',
                clipPath: 'polygon(0% 0%, 100% 0%, 96% 10%, 100% 20%, 95% 30%, 100% 40%, 96% 50%, 100% 60%, 94% 70%, 100% 80%, 96% 90%, 100% 100%, 0% 100%, 4% 90%, 0% 80%, 6% 70%, 0% 60%, 5% 50%, 0% 40%, 4% 30%, 0% 20%, 5% 10%)',
                backdropFilter: 'blur(4px)',
              }}
            >
              SoEchoes
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(42px, 11vw, 84px)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: '#1a1816',
                maxWidth: '800px',
                marginBottom: '24px',
                textAlign: 'center',
                textShadow: '0 0 40px rgba(244,239,230,0.9), 0 2px 20px rgba(244,239,230,0.8), 0 0 80px rgba(244,239,230,0.6)',
              }}
            >
              A map of the places<br />that changed us.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                color: '#3a342e',
                marginBottom: '44px',
                maxWidth: '400px',
                lineHeight: 1.6,
                fontWeight: 600,
                textAlign: 'center',
                textShadow: '0 0 30px rgba(244,239,230,0.95), 0 2px 16px rgba(244,239,230,0.9)',
              }}
            >
              A collaborative scrapbook of young adulthood.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Anonymous, no logins, just places.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6"
            >
              <motion.button
                onClick={handleTakeMe}
                disabled={loading}
                className="w-full sm:w-auto justify-center"
                style={{
                  background: '#b86641', // Matches the button color in your mockup
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '15px',
                  padding: '16px 28px',
                  borderRadius: '100px',
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(163, 97, 50, 0.3)',
                }}
                whileHover={{ scale: 1.03, background: '#9c5433' }}
                whileTap={{ scale: 0.97 }}
              >
                {loading
                  ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-dark 0.75s linear infinite' }} />
                  : <><Sparkles size={16} /> Take me somewhere human</>
                }
              </motion.button>

              <motion.button
                onClick={() => router.push('/map')}
                className="w-full sm:w-auto justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  color: '#1a1816',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '15px',
                  padding: '16px 28px',
                  borderRadius: '100px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                }}
                whileHover={{ background: 'rgba(255,255,255,1)' }}
                whileTap={{ scale: 0.97 }}
              >
                <MapPin size={15} /> Explore the map
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════ THE FEELING */}
        <section style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 24px 80px' }}>
          <BlurFade inView>
            <p style={{
              fontSize: '11px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#a36132',
              marginBottom: '36px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
            }}>
              What is this
            </p>
          </BlurFade>

          <BlurFade delay={0.08} inView>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 32px)',
              lineHeight: 1.4,
              color: '#1a1816',
              marginBottom: '28px',
            }}>
              Every young person has at least one place they never forget.
            </p>
          </BlurFade>

          <BlurFade delay={0.16} inView>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: 1.8,
              color: '#5a544c',
              marginBottom: '24px',
            }}>
              A staircase where they sat after failing their first exam. A rooftop where they spent nights wondering what to do with their life.
            </p>
          </BlurFade>

          <BlurFade delay={0.24} inView>
            <p style={{
              fontFamily: 'var(--font-memory)',
              fontStyle: 'italic',
              fontSize: '19px',
              lineHeight: 1.7,
              color: '#3a342e',
              borderLeft: '2px solid rgba(163, 97, 50, 0.4)',
              paddingLeft: '20px',
            }}>
              To everyone else, these places look ordinary.<br />
              To us, they became part of who we are.
            </p>
          </BlurFade>
        </section>

        {/* ═══════════════════════════ POLAROID MEMORY CARDS */}
        {memories.length > 0 && (
          <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 40px 120px' }}>
            <BlurFade inView>
              <p style={{
                fontSize: '11px',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#a36132',
                marginBottom: '56px',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
              }}>
                Pinned Memories
              </p>
            </BlurFade>

            {/* Polaroid grid — responsive: 1 col mobile, auto-fill desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
              gap: '32px',
              padding: '16px 0 24px',
            }}>
              {memories.map((m, i) => (
                <PolaroidCard key={m.id} memory={m} index={i} delay={i * 0.1} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════ FINAL CTA */}
        <section style={{
          textAlign: 'center',
          padding: '100px 24px 120px',
          borderTop: '1px dashed rgba(0,0,0,0.1)',
        }}>
          <BlurFade inView>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 400,
              color: '#1a1816',
              marginBottom: '20px',
              lineHeight: 1.15,
            }}>
              Leave something behind.
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: '#5a544c',
              marginBottom: '48px',
              lineHeight: 1.7,
            }}>
              Someone will find it. They will never know who you are.<br />
              That&apos;s the point.
            </p>
            <motion.button
              onClick={() => router.push('/map')}
              style={{
                background: '#b86641',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '16px',
                padding: '18px 40px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(212,149,106,0.4)',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Open the map <ArrowRight size={16} />
            </motion.button>
          </BlurFade>
        </section>
      </main>

      {transitioning && (
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(244, 239, 230, 0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              color: '#3a342e',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Taking you somewhere human…
          </motion.p>
        </motion.div>
      )}
    </>
  );
}
