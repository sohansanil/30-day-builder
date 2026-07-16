'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getMemories, getRandomMemory, Memory, CATEGORIES, Category } from '@/lib/supabase';
import { ArrowLeft, Shuffle, Plus, X, MapPin } from 'lucide-react';
import { MapSearch } from '@/components/map/MapSearch';
import { MemoryForm } from '@/components/memory/MemoryForm';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

// All category keys + "all" option
const FILTER_OPTIONS = [
  { key: 'all', label: 'All', emoji: '🗺️' },
  ...Object.entries(CATEGORIES).map(([key, val]) => ({ key, label: val.label, emoji: val.emoji })),
];

function MapPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom?: number; trigger?: number } | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | Category>('all');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Contribution flow state
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [draftLocation, setDraftLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newlyAddedMemoryId, setNewlyAddedMemoryId] = useState<string | null>(null);

  useEffect(() => {
    getMemories().then((data) => {
      setMemories(data);
      setMemoryCount(data.length);

      // If a shared link includes ?id=..., auto-open that memory card
      // after the fly-to animation has had time to complete (~2s)
      const sharedId = searchParams.get('id');
      if (sharedId) {
        const target = data.find(m => m.id === sharedId);
        if (target) {
          setTimeout(() => setSelectedMemory(target), 2000);
        }
      }

      // Show onboarding hint briefly if no memories exist yet
      if (data.length === 0) {
        setShowOnboarding(true);
        setTimeout(() => setShowOnboarding(false), 6000);
      }
    });
  }, []);

  // Decide initial map view based on URL params
  const [initialView] = useState(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return { center: [parseFloat(lat), parseFloat(lng)] as [number, number], zoom: 16 };
    }
    return { center: [20, 0] as [number, number], zoom: 2 };
  });

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      setFlyTarget({ lat: parseFloat(lat), lng: parseFloat(lng), zoom: 16, trigger: Date.now() });
    } else {
      const timer = setTimeout(() => {
        setFlyTarget({ lat: 20, lng: 78, zoom: 5, trigger: Date.now() });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleTakeMeSomewhere = async () => {
    setIsLoadingRandom(true);
    const memory = await getRandomMemory();
    if (memory) {
      setFlyTarget({ lat: memory.lat, lng: memory.lng, trigger: Date.now() });
      setSelectedMemory(memory);
    }
    setIsLoadingRandom(false);
  };

  // Filtered memories based on active category
  const filteredMemories = activeFilter === 'all'
    ? memories
    : memories.filter(m => m.category === activeFilter);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#e8e0d0' }}>
      <MapView
        memories={filteredMemories}
        flyTarget={flyTarget}
        onFlyComplete={() => setFlyTarget(null)}
        isPlacingPin={isPlacingPin}
        draftLocation={draftLocation}
        onPinPlaced={(lat, lng) => {
          setDraftLocation({ lat, lng });
          setIsPlacingPin(false);
        }}
        selectedMemory={selectedMemory}
        setSelectedMemory={setSelectedMemory}
        newlyAddedMemoryId={newlyAddedMemoryId}
        initialCenter={initialView.center}
        initialZoom={initialView.zoom}
      />

      {/* ── Top Bar ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          zIndex: 500,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'none',
        }}
      >
        {/* Back / Brand */}
        <motion.button
          onClick={() => router.push('/')}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '8px',
            height: '44px', padding: '0 18px',
            borderRadius: '22px',
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
            color: '#1a1816', fontSize: '14px', fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            flexShrink: 0, letterSpacing: '-0.01em',
          }}
        >
          <ArrowLeft size={15} strokeWidth={2} />
          <span>SoEchoes</span>
        </motion.button>

        {/* Search */}
        <motion.div
          style={{ flex: 1, pointerEvents: 'auto', minWidth: 0, maxWidth: '440px' }}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <MapSearch onLocationSelect={(lat, lng) => setFlyTarget({ lat, lng })} />
        </motion.div>

        {/* Echo counter */}
        {memoryCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              height: '44px', padding: '0 18px',
              borderRadius: '22px',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
              flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            <MapPin size={13} strokeWidth={2} style={{ color: '#a36132' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#3a342e', fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>
              {memoryCount.toLocaleString()} {memoryCount === 1 ? 'echo' : 'echoes'}
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Category Filter Pills ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: '76px',
          left: 0, right: 0,
          zIndex: 490,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 20px',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          pointerEvents: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          paddingBottom: '2px',
        }}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.key;
            return (
              <motion.button
                key={opt.key}
                onClick={() => setActiveFilter(opt.key as 'all' | Category)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  height: '32px', padding: '0 13px',
                  borderRadius: '16px',
                  background: isActive ? 'rgba(26,24,22,0.85)' : 'rgba(255,255,255,0.68)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.5)',
                  boxShadow: isActive ? '0 2px 12px rgba(0,0,0,0.2)' : '0 1px 8px rgba(0,0,0,0.06)',
                  color: isActive ? 'rgba(255,248,236,0.95)' : '#3a342e',
                  fontSize: '12px', fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.2s ease, color 0.2s ease',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '13px' }}>{opt.emoji}</span>
                <span>{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Placing Pin Banner ─────────────────────────── */}
      <AnimatePresence>
        {isPlacingPin && (
          <motion.div
            initial={{ opacity: 0, y: -16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -12, x: '-50%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: '120px', left: '50%',
              zIndex: 600, display: 'flex', alignItems: 'center',
              gap: '14px', padding: '0 20px', height: '48px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              width: 'max-content', maxWidth: '90vw',
            }}
          >
            <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1a1816', fontWeight: 500, letterSpacing: '-0.01em' }}>
              Tap anywhere on the map to drop your memory
            </span>
            <button
              onClick={() => setIsPlacingPin(false)}
              style={{
                background: 'rgba(0,0,0,0.07)', border: 'none', cursor: 'pointer',
                padding: 0, width: '26px', height: '26px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6b6560', flexShrink: 0,
              }}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Onboarding Hint (shown when 0 memories) ──────── */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              bottom: '100px', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 490,
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 20px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '18px' }}>✨</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#3a342e', fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>
              Tap <strong>+</strong> to drop the first memory here
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Controls ─────────────────────────────── */}
      <div
        style={{
          position: 'absolute', bottom: '28px', left: 0, right: 0,
          zIndex: 500, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '12px',
          padding: '0 24px', pointerEvents: 'none',
        }}
      >
        {/* Take me somewhere human */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleTakeMeSomewhere}
          disabled={isLoadingRandom}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '9px',
            height: '48px',
            // Full text on sm+, icon-only on xs
            padding: '0 24px',
            borderRadius: '24px',
            background: 'rgba(18,14,10,0.82)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset',
            color: 'rgba(255,248,236,0.92)',
            fontSize: '14px', fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: isLoadingRandom ? 'wait' : 'pointer',
            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
          }}
        >
          {isLoadingRandom ? (
            <span style={{ width: 15, height: 15, border: '1.5px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          ) : (
            <Shuffle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          )}
          {/* Full label on md+, shortened on mobile */}
          <span className="hidden sm:inline">Take me somewhere human</span>
          <span className="sm:hidden">Surprise me</span>
        </motion.button>

        {/* Add Memory FAB */}
        <motion.button
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => { setIsPlacingPin(true); setDraftLocation(null); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#c47a45',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 20px rgba(163,97,50,0.45), 0 1px 0 rgba(255,255,255,0.2) inset',
            color: '#fff', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* ── Memory Form Modal ───────────────────────────── */}
      <AnimatePresence>
        {draftLocation && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={() => setDraftLocation(null)}
            />
            <MemoryForm
              lat={draftLocation.lat}
              lng={draftLocation.lng}
              onCancel={() => setDraftLocation(null)}
              onSubmit={async (data) => {
                const { createMemory } = await import('@/lib/supabase');
                const { playDropSound } = await import('@/lib/sounds');
                const newMemory = await createMemory({ ...data, lat: draftLocation.lat, lng: draftLocation.lng });
                setMemories([newMemory, ...memories]);
                setMemoryCount(prev => prev + 1);
                setDraftLocation(null);
                setNewlyAddedMemoryId(newMemory.id);
                playDropSound();
                setFlyTarget({ lat: newMemory.lat, lng: newMemory.lng, trigger: Date.now() });
                setTimeout(() => { setSelectedMemory(newMemory); }, 1500);
                setTimeout(() => { setNewlyAddedMemoryId(null); }, 8000);
              }}
            />
          </>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense>
      <MapPageInner />
    </Suspense>
  );
}
