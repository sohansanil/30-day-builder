'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, CATEGORIES, incrementFeltCount } from '@/lib/supabase';
import { playAmbientSound, stopAmbientSound } from '@/lib/sounds';
import { X, MapPin } from 'lucide-react';
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

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

  const handleClose = () => {
    stopAmbientSound();
    onClose();
  };

  // Play sound on mount
  useState(() => {
    playAmbientSound(memory.category);
  });

  const isForSomeone = memory.category === 'forsomeone';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Card */}
        <motion.div
          className="relative z-10 w-full max-w-[320px] sm:max-w-md"
          initial={{ opacity: 0, y: 40, scale: 0.97, rotate: -2 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: -1.5 }}
          exit={{ opacity: 0, y: 20, rotate: -1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div
            className="p-5 sm:p-8 overflow-y-auto w-full aspect-square sm:aspect-auto sm:max-h-[80vh] flex flex-col"
            style={{
              background: '#fdfae3',
              color: '#1a1816',
              boxShadow: '0 12px 25px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.05)',
              borderRadius: '1px 1px 1px 12px',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{ color: '#8b8075' }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 transition-colors z-20"
            >
              <X size={18} />
            </button>

            {/* Location */}
            <div className="flex items-center gap-1.5 mb-4 sm:mb-5 mt-6 sm:mt-0 shrink-0">
              <MapPin size={12} style={{ color: category.color }} />
              <span
                className="text-xs tracking-wide uppercase font-semibold"
                style={{ color: category.color, fontFamily: 'var(--font-body)' }}
              >
                {memory.location_name || memory.campus || 'Unknown place'}
              </span>
            </div>

            {/* Memory text */}
            <div className="flex-1 flex flex-col justify-center min-h-[60px] sm:min-h-[80px] mb-6">
              <p
                className={`${caveat.className} text-[22px] leading-relaxed sm:text-3xl sm:leading-relaxed`}
                style={{ color: '#2a2622' }}
              >
                "{memory.text}"
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 mt-auto border-t shrink-0" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              
              {/* Category / Spot Badges (Clean Text Style) */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] uppercase tracking-wider font-bold"
                  style={{ color: category.color, fontFamily: 'var(--font-body)', opacity: 0.9 }}
                >
                  {category.emoji} {category.label}
                </span>
                {memory.is_spot && (
                  <>
                    <span style={{ color: 'rgba(0,0,0,0.15)' }}>•</span>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-black/40" style={{ fontFamily: 'var(--font-body)' }}>
                      Spot
                    </span>
                  </>
                )}
              </div>

              {/* Minimal Interactive Heart Button */}
              <motion.button
                onClick={handleFelt}
                disabled={hasFelt}
                className="flex items-center gap-1.5 px-2 py-1 -mr-2 rounded-lg transition-colors"
                style={{
                  color: hasFelt ? category.color : '#8b8075',
                  cursor: hasFelt ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)'
                }}
                whileHover={hasFelt ? {} : { backgroundColor: 'rgba(0,0,0,0.03)' }}
                whileTap={hasFelt ? {} : { scale: 0.92 }}
              >
                <motion.span
                  key={hasFelt ? 'felt' : 'unfelt'}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="text-[15px]"
                >
                  {hasFelt ? '🤎' : '🤍'}
                </motion.span>
                <span className="text-[12px] sm:text-[13px] font-semibold" style={{ letterSpacing: '0.01em' }}>
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
