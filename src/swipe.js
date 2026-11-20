// Swipe sur la barre de lecture : gauche = titre suivant, droite = précédent.

import { CONFIG } from './config.js';
import { clickFirst } from './dom.js';
import { isMobileMode } from './layout.js';
import { SEL } from './selectors.js';

/**
 * Reconnaît un swipe horizontal (logique pure).
 * @param {{ x: number, y: number }} start
 * @param {{ x: number, y: number }} end
 * @param {{ threshold?: number, maxVertical?: number }} [options]
 * @returns {'next' | 'prev' | null}
 */
export function detectSwipe(start, end, options = {}) {
  const { threshold = CONFIG.swipeThreshold, maxVertical = CONFIG.swipeMaxVertical } = options;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < threshold || Math.abs(dy) > maxVertical) return null;
  return dx < 0 ? 'next' : 'prev';
}

/**
 * Le geste démarre-t-il dans la zone du swipe ? (barre de lecture, hors progression)
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
export function isSwipeZone(target) {
  if (!(target instanceof Element)) return false;
  if (!target.closest(SEL.nowPlayingBar)) return false;
  return !target.closest(SEL.progressBar); // ne pas gêner la recherche dans le titre
}

export function setupSwipe() {
  /** @type {{ x: number, y: number } | null} */
  let start = null;

  document.addEventListener(
    'touchstart',
    (event) => {
      start = null;
      if (!isMobileMode() || event.touches.length !== 1) return;
      if (!isSwipeZone(event.target)) return;
      const touch = event.touches[0];
      start = { x: touch.clientX, y: touch.clientY };
    },
    { passive: true },
  );

  document.addEventListener(
    'touchend',
    (event) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const direction = detectSwipe(start, { x: touch.clientX, y: touch.clientY });
      start = null;
      if (direction) clickFirst(direction === 'next' ? SEL.next : SEL.prev);
    },
    { passive: true },
  );

  document.addEventListener(
    'touchcancel',
    () => {
      start = null;
    },
    { passive: true },
  );
}
