'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin } from 'lucide-react';
import { CATEGORIES, Category } from '@/lib/supabase';

interface MemoryFormProps {
  lat: number;
  lng: number;
  onSubmit: (data: {
    text: string;
    category: Category;
    location_name: string;
    is_spot: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export function MemoryForm({ lat, lng, onSubmit, onCancel }: MemoryFormProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [locationName, setLocationName] = useState('');
  const [isSpot, setIsSpot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || !category || !locationName.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ text, category, location_name: locationName, is_spot: isSpot });
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const isComplete = text.trim() && category && locationName.trim();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        style={{
          position: 'fixed',
          top: 0, bottom: 0, left: 0, right: 0,
          margin: 'auto',
          height: 'fit-content',
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '90%',
          maxWidth: '440px',
          background: '#fdfbf7', // match polaroid paper
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
          zIndex: 1000,
          border: '1px solid rgba(0,0,0,0.05)',
        }}
        className="noise-bg"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            color: '#1a1816',
            fontWeight: 400,
            margin: 0,
          }}>
            Leave something behind.
          </h3>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b8075' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Location Name */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MapPin size={13} style={{ color: '#a36132' }} />
            <label style={{ fontSize: '13px', color: '#5a544c', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
              Where exactly is this?
            </label>
          </div>
          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Library Staircase, Campus Cafe..."
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#1a1816',
              outline: 'none',
            }}
          />
        </div>

        {/* Memory Text */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#5a544c', fontFamily: 'var(--font-body)', fontWeight: 500, marginBottom: '8px' }}>
            What happened here?
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= 280) setText(e.target.value);
              }}
              placeholder="I sat here after..."
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '6px',
                fontFamily: 'var(--font-memory)',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#1a1816',
                minHeight: '120px',
                resize: 'none',
                outline: 'none',
                fontStyle: 'italic',
              }}
            />
            <span style={{
              position: 'absolute',
              bottom: '12px',
              right: '14px',
              fontSize: '11px',
              color: text.length > 250 ? '#c97b7b' : '#8b8075',
              fontFamily: 'var(--font-body)',
            }}>
              {text.length}/280
            </span>
          </div>
        </div>

        {/* Category Picker */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#5a544c', fontFamily: 'var(--font-body)', fontWeight: 500, marginBottom: '10px' }}>
            How did it feel?
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '100px',
                  background: category === key ? cat.color : 'transparent',
                  border: `1px solid ${category === key ? cat.color : 'rgba(0,0,0,0.1)'}`,
                  color: category === key ? '#fff' : '#5a544c',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Is Spot Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '6px' }}>
          <input
            type="checkbox"
            checked={isSpot}
            onChange={(e) => setIsSpot(e.target.checked)}
            id="spot-toggle"
            style={{ width: '16px', height: '16px', accentColor: '#a36132', cursor: 'pointer' }}
          />
          <label htmlFor="spot-toggle" style={{ fontSize: '13px', color: '#3a342e', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
            Mark as "The Spot" (a place you returned to often)
          </label>
        </div>

        {/* Submit */}
        <motion.button
          disabled={!isComplete || isSubmitting}
          onClick={handleSubmit}
          style={{
            width: '100%',
            background: !isComplete ? 'rgba(0,0,0,0.05)' : '#a36132', // Muted if incomplete
            color: !isComplete ? '#8b8075' : '#fff',
            padding: '16px',
            borderRadius: '100px',
            border: 'none',
            fontSize: '15px',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            cursor: !isComplete || isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s',
          }}
          whileHover={isComplete && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={isComplete && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
             <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-dark 0.75s linear infinite' }} />
          ) : (
            <>Leave it here</>
          )}
        </motion.button>

      </motion.div>
    </AnimatePresence>
  );
}
