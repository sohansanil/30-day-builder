'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getMemories, getRandomMemory, Memory } from '@/lib/supabase';
import { ArrowLeft, Sparkles, Plus, X } from 'lucide-react';
import { MapSearch } from '@/components/map/MapSearch';
import { MemoryForm } from '@/components/memory/MemoryForm';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

function MapPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom?: number; trigger?: number } | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);

  // Contribution flow state
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [draftLocation, setDraftLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newlyAddedMemoryId, setNewlyAddedMemoryId] = useState<string | null>(null);

  useEffect(() => {
    getMemories().then((data) => {
      setMemories(data);
      setMemoryCount(data.length);
    });
  }, []);

  // Decide initial map view based on URL params
  const [initialView] = useState(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return { center: [parseFloat(lat), parseFloat(lng)] as [number, number], zoom: 16 };
    }
    // If no params, start at the "Globe" view
    return { center: [20, 0] as [number, number], zoom: 2 };
  });

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      setFlyTarget({ lat: parseFloat(lat), lng: parseFloat(lng), zoom: 16, trigger: Date.now() });
    } else {
      // Cinematic Intro: wait 1 second on the globe, then fly into the main cluster
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

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#f4efe6' }}>
      <MapView
        memories={memories}
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

      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 pointer-events-none">
        
        {/* Back */}
        <motion.button
          onClick={() => router.push('/')}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-black/80 border border-amber-50/10 text-white/70 hover:text-white font-medium text-[13px] backdrop-blur-md shrink-0"
          whileHover={{ color: 'var(--text-primary)' }}
        >
          <ArrowLeft size={14} /> <span className="hidden sm:inline">SoEchoes</span>
        </motion.button>

        {/* Search — takes remaining space */}
        <motion.div
          className="flex-1 pointer-events-auto min-w-0"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MapSearch onLocationSelect={(lat, lng) => setFlyTarget({ lat, lng })} />
        </motion.div>

        {/* Memory count */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden sm:block px-3.5 py-2.5 rounded-xl bg-black/80 border border-amber-50/10 text-white/50 text-xs backdrop-blur-md shrink-0 whitespace-nowrap font-medium"
        >
          {memoryCount > 0 ? `${memoryCount} echoes` : '…'}
        </motion.div>

      </div>

      {/* Placing pin instruction banner */}
      <AnimatePresence>
        {isPlacingPin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '70px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fdfbf7',
              padding: '12px 24px',
              borderRadius: '100px',
              zIndex: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              width: 'max-content',
              maxWidth: '90%',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: '#1a1816', fontWeight: 500 }}>
              Tap anywhere on the map to drop a memory
            </span>
            <button
              onClick={() => setIsPlacingPin(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#8b8075' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Take Me Somewhere Human ──────────────────────── */}
      <div className="absolute bottom-6 left-4 sm:left-1/2 sm:-translate-x-1/2 z-[500]">
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={handleTakeMeSomewhere}
          disabled={isLoadingRandom}
          className="bg-[#0a0907]/85 backdrop-blur-md border border-[#fff0c8]/10 text-[#fff0c8]/90 hover:text-white hover:border-[#fff0c8]/25 font-medium text-[13px] sm:text-sm w-[48px] h-[48px] sm:w-auto sm:h-auto sm:px-6 sm:py-3.5 rounded-full flex items-center justify-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer disabled:cursor-wait transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {isLoadingRandom
            ? <span className="w-4 h-4 sm:w-3.5 sm:h-3.5 border-[1.5px] border-white/20 border-t-white rounded-full animate-spin shrink-0" />
            : <Sparkles size={20} className="sm:w-[14px] sm:h-[14px] shrink-0" />
          }
          <span className="hidden sm:inline">Take me somewhere human</span>
        </motion.button>
      </div>

      {/* ── Add Echo FAB ──────────────────────── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => {
          setIsPlacingPin(true);
          setDraftLocation(null);
        }}
        className="absolute bottom-6 right-4 sm:right-6 z-[500] flex items-center justify-center w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-full bg-[var(--accent)] text-[#0a0907] shadow-[0_8px_24px_rgba(212,149,106,0.4),0_4px_12px_rgba(0,0,0,0.2)] cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={22} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
      </motion.button>

      {/* Memory Form Modal */}
      <AnimatePresence>
        {draftLocation && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, zIndex: 999,
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setDraftLocation(null)}
            />
            <MemoryForm
              lat={draftLocation.lat}
              lng={draftLocation.lng}
              onCancel={() => setDraftLocation(null)}
              onSubmit={async (data) => {
                const { createMemory } = await import('@/lib/supabase');
                const { playDropSound } = await import('@/lib/sounds');
                
                const newMemory = await createMemory({
                  ...data,
                  lat: draftLocation.lat,
                  lng: draftLocation.lng,
                });
                
                setMemories([newMemory, ...memories]);
                setMemoryCount(prev => prev + 1);
                setDraftLocation(null);
                setNewlyAddedMemoryId(newMemory.id);
                
                // Trigger the drop ceremony!
                playDropSound();
                setFlyTarget({ lat: newMemory.lat, lng: newMemory.lng, trigger: Date.now() });
                
                // Auto-open the card just as the pin finishes dropping
                setTimeout(() => {
                  setSelectedMemory(newMemory);
                }, 1500);
                
                // Clear the ripple after a while
                setTimeout(() => {
                  setNewlyAddedMemoryId(null);
                }, 8000);
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
