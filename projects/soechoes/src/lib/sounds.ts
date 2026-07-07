'use client';

import { Howl } from 'howler';

// Sound files go in /public/sounds/
// Category → ambient sound mapping
const SOUND_MAP: Record<string, string> = {
  latenight:  '/sounds/rain-soft.mp3',
  regret:     '/sounds/wind-gentle.mp3',
  forsomeone: '/sounds/wind-gentle.mp3',
  sidequest:  '/sounds/pages-turning.mp3',
  funny:      '/sounds/crowd-distant.mp3',
  milestone:  '/sounds/chime-soft.mp3',
  love:       '/sounds/wind-gentle.mp3',
};

let currentSound: Howl | null = null;

export function playAmbientSound(category: string) {
  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const src = SOUND_MAP[category];
  if (!src) return;

  // Fade out existing
  if (currentSound) {
    currentSound.fade(currentSound.volume(), 0, 1000);
    setTimeout(() => currentSound?.unload(), 1100);
  }

  currentSound = new Howl({
    src: [src],
    loop: true,
    volume: 0,
    html5: true,
  });

  currentSound.play();
  currentSound.fade(0, 0.10, 2000);
}

export function stopAmbientSound() {
  if (!currentSound) return;
  currentSound.fade(currentSound.volume(), 0, 1000);
  setTimeout(() => {
    currentSound?.unload();
    currentSound = null;
  }, 1100);
}

export function playDropSound() {
  const dropSound = new Howl({
    src: ['/sounds/chime-soft.mp3'], // we reuse chime for a magical drop effect
    loop: false,
    volume: 0.6,
    html5: true,
  });
  dropSound.play();
}
