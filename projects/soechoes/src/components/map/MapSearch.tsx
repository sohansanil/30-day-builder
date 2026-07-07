'use client';

import { useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { Search, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.flyTo([lat, lng], 17, { duration: 2 });
  return null;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(true);
    } catch {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search();
    if (e.key === 'Escape') { setOpen(false); setResults([]); setMobileExpanded(false); }
  };

  const selectResult = (r: NominatimResult) => {
    onLocationSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',')[0]);
    setQuery(r.display_name.split(',')[0]);
    setResults([]);
    setOpen(false);
    setMobileExpanded(false);
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  const closeMobile = () => {
    clear();
    setMobileExpanded(false);
  };

  return (
    <>
      {/* Mobile Trigger */}
      <button 
        className="sm:hidden flex items-center justify-center w-[38px] h-[38px] rounded-xl bg-black/80 border border-amber-50/10 text-white/70 backdrop-blur-md ml-auto"
        onClick={() => setMobileExpanded(true)}
      >
        <Search size={16} />
      </button>

      {/* Main Search Area (Modal on mobile, Inline on desktop) */}
      <div className={`${mobileExpanded ? 'fixed inset-0 z-[1000] bg-[#0a0907]/40 backdrop-blur-md p-3 sm:p-0' : 'hidden sm:block relative w-full max-w-[360px]'}`}>
        
        {/* Modal Backdrop Click handler (mobile only) */}
        {mobileExpanded && (
          <div className="absolute inset-0 z-0" onClick={closeMobile} />
        )}

        <div className="relative z-10 w-full max-w-[360px] mx-auto">
          <div className="flex items-center gap-2 bg-black/80 border border-amber-50/10 rounded-xl px-3.5 py-2.5 backdrop-blur-md shadow-2xl">
            {loading
              ? <span className="w-3.5 h-3.5 border-[1.5px] border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin shrink-0" />
              : <Search size={14} className="text-white/40 shrink-0" />
            }
            <input
              autoFocus={mobileExpanded}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search any place…"
              className="bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 text-[13px] flex-1 min-w-0 font-medium"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            {query && (
              <button onClick={clear} className="text-white/40 hover:text-white/70 p-1 flex">
                <X size={13} />
              </button>
            )}
            {mobileExpanded && (
              <button onClick={closeMobile} className="text-white/40 hover:text-white/70 pl-2 border-l border-white/10 ml-1 text-xs font-medium">
                Cancel
              </button>
            )}
          </div>

          <AnimatePresence>
            {open && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#0d0b09]/95 border border-amber-50/10 rounded-xl backdrop-blur-xl overflow-hidden shadow-2xl"
              >
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => selectResult(r)}
                    className={`w-full flex items-start gap-2.5 text-left p-3 hover:bg-[var(--accent)]/10 transition-colors ${i < results.length - 1 ? 'border-b border-amber-50/5' : ''}`}
                  >
                    <MapPin size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-white/90 font-medium mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                        {r.display_name.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-white/40 leading-snug" style={{ fontFamily: 'var(--font-body)' }}>
                        {r.display_name.split(',').slice(1, 3).join(',')}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
            {open && results.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#0d0b09]/95 border border-amber-50/10 rounded-xl p-4 text-center backdrop-blur-xl"
              >
                <p className="text-xs text-white/40" style={{ fontFamily: 'var(--font-body)' }}>No results found</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
