'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, CATEGORIES, incrementFeltCount } from '@/lib/supabase';
import { playAmbientSound, stopAmbientSound } from '@/lib/sounds';
import { X, MapPin, Link2, Check, Clock } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  onClose: () => void;
}

export function MemoryCard({ memory, onClose }: MemoryCardProps) {
  const category = CATEGORIES[memory.category] || { label: 'Memory', emoji: '📍', color: '#a36132' };
  const storageKey = `felt_${memory.id}`;
  const [feltCount, setFeltCount] = useState(memory.felt_count);
  const [hasFelt, setHasFelt] = useState(
    typeof window !== 'undefined' ? !!localStorage.getItem(storageKey) : false
  );

  const handleFelt = () => {
    if (hasFelt) return;
    setFeltCount((prev) => prev + 1);
    setHasFelt(true);
    localStorage.setItem(storageKey, '1');
    incrementFeltCount(memory.id);
  };

  // Share / copy link
  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    const url = `${window.location.origin}/map?lat=${memory.lat}&lng=${memory.lng}&id=${memory.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Optional timestamp reveal
  const [showTime, setShowTime] = useState(false);
  const relativeTime = (() => {
    const diff = Date.now() - new Date(memory.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  })();

  const handleClose = () => {
    stopAmbientSound();
    onClose();
  };

  // Play sound on mount
  useState(() => {
    playAmbientSound(memory.category);
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-5 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(10,8,6,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Card */}
        <motion.div
          className="relative z-10 w-full"
          style={{ maxWidth: '400px' }}
          initial={{ opacity: 0, y: 32, scale: 0.96, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          {/* Tape strip at top */}
          <div style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%) rotate(-1deg)',
            width: '56px',
            height: '22px',
            background: 'rgba(255,248,220,0.65)',
            backdropFilter: 'blur(4px)',
            borderRadius: '2px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            zIndex: 20,
          }} />

          <div
            style={{
              background: 'linear-gradient(160deg, #fefcf0 0%, #faf7e4 50%, #f7f3dc 100%)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
              borderRadius: '3px',
              padding: '28px 28px 22px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle paper grain texture via repeating gradient */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.018) 28px)',
              pointerEvents: 'none',
              borderRadius: '3px',
            }} />

            {/* Left margin line */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '44px',
              width: '1px',
              background: 'rgba(163,97,50,0.12)',
              pointerEvents: 'none',
            }} />

            {/* Action row: share + close */}
            <div style={{
              position: 'absolute', top: '14px', right: '14px',
              display: 'flex', alignItems: 'center', gap: '6px', zIndex: 20,
            }}>
              {/* Share / copy link */}
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                title="Copy link to this memory"
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: copied ? 'rgba(100,180,100,0.15)' : 'rgba(0,0,0,0.06)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: copied ? '#5aad5a' : '#9a8a72',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                      <Check size={13} strokeWidth={2.5} />
                    </motion.span>
                  ) : (
                    <motion.span key="link" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                      <Link2 size={13} strokeWidth={2} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Close */}
              <button
                onClick={handleClose}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#9a8a72', transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '20px',
              paddingLeft: '2px',
              position: 'relative',
              zIndex: 10,
            }}>
              <MapPin size={11} strokeWidth={2} style={{ color: category.color, flexShrink: 0 }} />
              <span style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: category.color,
                fontFamily: 'var(--font-body)',
              }}>
                {memory.location_name || 'Unknown place'}
              </span>
            </div>

            {/* Memory text — Lora Italic for that premium editorial/diary feel */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              marginBottom: '24px',
              paddingLeft: '2px',
            }}>
              <p style={{
                fontFamily: 'var(--font-memory)',
                fontStyle: 'italic',
                fontSize: '20px',
                lineHeight: 1.65,
                color: '#1e1a16',
                letterSpacing: '0.005em',
                margin: 0,
              }}>
                "{memory.text}"
              </p>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '14px',
              borderTop: '1px solid rgba(0,0,0,0.07)',
              position: 'relative',
              zIndex: 10,
            }}>

              {/* Optional timestamp toggle */}
              <motion.button
                onClick={() => setShowTime(t => !t)}
                whileTap={{ scale: 0.9 }}
                title={showTime ? 'Hide time' : 'When was this written?'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(30,26,22,0.3)',
                  padding: '4px 6px', borderRadius: '8px',
                  transition: 'color 0.15s ease',
                }}
                whileHover={{ color: 'rgba(30,26,22,0.55)' }}
              >
                <Clock size={11} strokeWidth={2} />
                <AnimatePresence mode="wait">
                  {showTime && (
                    <motion.span
                      key="time"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {relativeTime}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Category badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: category.color,
                  fontFamily: 'var(--font-body)',
                  opacity: 0.85,
                }}>
                  {category.emoji} {category.label}
                </span>
                {memory.is_spot && (
                  <>
                    <span style={{ color: 'rgba(0,0,0,0.18)', fontSize: '10px' }}>•</span>
                    <span style={{
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: 'rgba(30,26,22,0.35)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      Spot
                    </span>
                  </>
                )}
              </div>

              {/* Felt this too */}
              <motion.button
                onClick={handleFelt}
                disabled={hasFelt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'none',
                  border: 'none',
                  cursor: hasFelt ? 'default' : 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  color: hasFelt ? category.color : '#9a8a72',
                  fontFamily: 'var(--font-body)',
                  marginRight: '-8px',
                }}
                whileHover={hasFelt ? {} : { backgroundColor: 'rgba(0,0,0,0.04)' }}
                whileTap={hasFelt ? {} : { scale: 0.93 }}
              >
                <motion.span
                  key={hasFelt ? 'felt' : 'unfelt'}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  style={{ fontSize: '14px', lineHeight: 1 }}
                >
                  {hasFelt ? '🤎' : '🤍'}
                </motion.span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}>
                  {feltCount > 0
                    ? `${feltCount.toLocaleString()} felt this too`
                    : hasFelt
                    ? 'You felt this'
                    : 'I felt this too'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
