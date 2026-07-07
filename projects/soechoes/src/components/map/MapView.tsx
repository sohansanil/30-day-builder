'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Memory, CATEGORIES } from '@/lib/supabase';
import { MemoryCard } from '@/components/memory/MemoryCard';
import 'leaflet/dist/leaflet.css';

// ── Pin HTML rendered as Leaflet divIcon ─────────────────────
function PinIcon({ color, isSpot, isDraft, isNewlyAdded }: { color: string; isSpot: boolean; isDraft?: boolean; isNewlyAdded?: boolean }) {
  const size = isSpot ? 40 : (isDraft ? 32 : 28);
  return (
    <div 
      style={{ position: 'relative', width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', transform: 'translateY(-50%)' }}
      className={isNewlyAdded ? 'animate-drop-pin' : ''}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill={color} 
        stroke={isDraft ? '#1a1816' : '#fff'} 
        strokeWidth={isDraft ? "2" : "1.5"} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{ 
          filter: isDraft ? 'drop-shadow(0px 8px 12px rgba(0,0,0,0.4))' : 'drop-shadow(0px 4px 6px rgba(0,0,0,0.25))',
          animation: isDraft ? 'pulse-amber-light 2s infinite' : 'none',
          position: 'relative',
          zIndex: 10
        }}
      >
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.007 4 10a8 8 0 0 1 16 0"/>
        <circle cx="12" cy="10" r="3" fill={isDraft ? '#1a1816' : '#fff'} />
      </svg>
      {isNewlyAdded && (
        <div className="animate-ripple" style={{ background: color, zIndex: 1 }} />
      )}
    </div>
  );
}

function createPinIcon(memory: Memory, isNewlyAdded?: boolean) {
  const cat = CATEGORIES[memory.category] || { color: '#a36132' };
  const color = cat.color;
  const html = renderToStaticMarkup(
    <PinIcon color={color} isSpot={memory.is_spot} isNewlyAdded={isNewlyAdded} />
  );
  const size = memory.is_spot ? 40 : 28;
  return divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size], // anchor at bottom center
  });
}

function createDraftPinIcon() {
  const html = renderToStaticMarkup(
    <PinIcon color="#1a1816" isSpot={false} isDraft={true} />
  );
  return divIcon({
    html,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // anchor at bottom center
  });
}

// ── Fly-to controller ────────────────────────────────────────
interface FlyToProps { lat: number; lng: number; zoom?: number; trigger?: number }
function FlyToController({ lat, lng, zoom = 16, trigger = 0 }: FlyToProps) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 2.5 });
  }, [lat, lng, zoom, map, trigger]);
  return null;
}

// ── Map Events ───────────────────────────────────────────────
function MapEvents({
  isPlacingPin,
  onPinPlaced
}: {
  isPlacingPin: boolean;
  onPinPlaced: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isPlacingPin) {
        onPinPlaced(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// ── Main MapView ─────────────────────────────────────────────
interface MapViewProps {
  memories: Memory[];
  flyTarget?: { lat: number; lng: number; trigger?: number } | null;
  onFlyComplete?: () => void;
  isPlacingPin?: boolean;
  draftLocation?: { lat: number; lng: number } | null;
  onPinPlaced?: (lat: number, lng: number) => void;
  selectedMemory?: Memory | null;
  setSelectedMemory?: (m: Memory | null) => void;
  newlyAddedMemoryId?: string | null;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function MapView({ 
  memories, 
  flyTarget, 
  onFlyComplete,
  isPlacingPin = false,
  draftLocation = null,
  onPinPlaced,
  selectedMemory,
  setSelectedMemory,
  newlyAddedMemoryId,
  initialCenter = [20, 78],
  initialZoom = 5
}: MapViewProps) {
  const [localSelected, setLocalSelected] = useState<Memory | null>(null);
  
  const selected = selectedMemory !== undefined ? selectedMemory : localSelected;
  const setSelected = setSelectedMemory || setLocalSelected;

  // Manual spiderfy/jitter for overlapping pins
  const processedMemories = memories.map((memory, index) => {
    // Find how many memories share this EXACT coordinate
    const identicals = memories.filter(m => m.lat === memory.lat && m.lng === memory.lng);
    if (identicals.length > 1) {
      // Find our index within the identical group
      const subIndex = identicals.findIndex(m => m.id === memory.id);
      if (subIndex > 0) {
        // Apply a tiny visual offset (radius ~5 meters)
        const radius = 0.00004 + (identicals.length * 0.000005);
        const angle = (subIndex / identicals.length) * 2 * Math.PI;
        return {
          ...memory,
          lat: memory.lat + radius * Math.cos(angle),
          lng: memory.lng + (radius * Math.sin(angle) / Math.cos(memory.lat * Math.PI / 180))
        };
      }
    }
    return memory;
  });

  return (
    <div className="relative w-full h-full" style={{ cursor: isPlacingPin ? 'crosshair' : 'grab' }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%', background: '#f4efe6' }}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          subdomains="abc"
          maxZoom={19}
        />

        {flyTarget && (
          <FlyToController lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} trigger={flyTarget.trigger} />
        )}

        {isPlacingPin && onPinPlaced && (
          <MapEvents isPlacingPin={isPlacingPin} onPinPlaced={onPinPlaced} />
        )}

        {draftLocation && (
          <Marker
            position={[draftLocation.lat, draftLocation.lng]}
            icon={createDraftPinIcon()}
          />
        )}

        {processedMemories.map((memory) => (
          <Marker
            key={memory.id}
            position={[memory.lat, memory.lng] as [number, number]}
            icon={createPinIcon(memory, memory.id === newlyAddedMemoryId)}
            eventHandlers={{ click: () => setSelected(memory) }}
          />
        ))}
      </MapContainer>

      {selected && (
        <MemoryCard
          memory={selected}
          onClose={() => { setSelected(null); onFlyComplete?.(); }}
        />
      )}
    </div>
  );
}
