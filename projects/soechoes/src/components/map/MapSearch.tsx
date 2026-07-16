'use client';

import { useState, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, name?: string) => void;
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
    if (e.key === 'Escape') { setOpen(false); setResults([]); }
  };

  const selectResult = (r: NominatimResult) => {
    onLocationSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',')[0]);
    setQuery(r.display_name.split(',')[0]);
    setResults([]);
    setOpen(false);
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          height: '44px',
          padding: '0 16px',
          borderRadius: '22px',
          background: isFocused ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: isFocused ? '1.5px solid rgba(163,97,50,0.35)' : '1px solid rgba(255,255,255,0.5)',
          boxShadow: isFocused
            ? '0 2px 20px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.6) inset'
            : '0 2px 16px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
          transition: 'border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {loading ? (
          <span style={{
            width: 14,
            height: 14,
            border: '1.5px solid rgba(163,97,50,0.25)',
            borderTopColor: '#a36132',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
            flexShrink: 0,
          }} />
        ) : (
          <Search size={15} strokeWidth={2} style={{ color: 'rgba(60,52,46,0.45)', flexShrink: 0 }} />
        )}

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search any place…"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            fontWeight: 500,
            color: '#1a1816',
            fontFamily: 'var(--font-body)',
            letterSpacing: '-0.01em',
            minWidth: 0,
          }}
        />

        {query && (
          <button
            onClick={clear}
            style={{
              background: 'rgba(0,0,0,0.07)',
              border: 'none',
              cursor: 'pointer',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b6560',
              flexShrink: 0,
              padding: 0,
            }}
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '18px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => selectResult(r)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(163,97,50,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <MapPin size={13} strokeWidth={2} style={{ color: '#a36132', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1a1816',
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '-0.01em',
                    marginBottom: 2,
                  }}>
                    {r.display_name.split(',')[0]}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: 'rgba(60,52,46,0.5)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.4,
                  }}>
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
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '18px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
            }}
          >
            <p style={{ fontSize: '13px', color: 'rgba(60,52,46,0.45)', fontFamily: 'var(--font-body)' }}>
              No results found
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
