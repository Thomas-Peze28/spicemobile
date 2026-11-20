import { afterEach, describe, expect, it } from 'vitest';
import { CONFIG } from '../src/config.js';
import { detectSwipe, isSwipeZone } from '../src/swipe.js';

const at = (x, y = 0) => ({ x, y });

describe('detectSwipe', () => {
  it('gauche -> titre suivant, droite -> précédent', () => {
    expect(detectSwipe(at(200), at(100))).toBe('next');
    expect(detectSwipe(at(100), at(200))).toBe('prev');
  });

  it('ignore un déplacement trop court', () => {
    const almost = CONFIG.swipeThreshold - 1;
    expect(detectSwipe(at(100), at(100 + almost))).toBeNull();
    expect(detectSwipe(at(100), at(100 - almost))).toBeNull();
    expect(detectSwipe(at(100), at(100 + CONFIG.swipeThreshold))).toBe('prev');
  });

  it('ignore un geste trop vertical (scroll)', () => {
    expect(detectSwipe(at(0, 0), at(200, CONFIG.swipeMaxVertical + 1))).toBeNull();
    expect(detectSwipe(at(0, 0), at(200, -CONFIG.swipeMaxVertical))).toBe('prev');
  });

  it('accepte des seuils personnalisés', () => {
    expect(detectSwipe(at(0), at(-30), { threshold: 20 })).toBe('next');
    expect(detectSwipe(at(0, 0), at(100, 10), { maxVertical: 5 })).toBeNull();
  });
});

describe('isSwipeZone', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('accepte la barre de lecture mais pas la barre de progression', () => {
    document.body.innerHTML = `
      <div data-testid="now-playing-bar">
        <span id="title">Titre</span>
        <div data-testid="playback-progressbar"><span id="knob"></span></div>
      </div>
      <main id="elsewhere"></main>`;
    expect(isSwipeZone(document.getElementById('title'))).toBe(true);
    expect(isSwipeZone(document.getElementById('knob'))).toBe(false);
    expect(isSwipeZone(document.getElementById('elsewhere'))).toBe(false);
    expect(isSwipeZone(null)).toBe(false);
    expect(isSwipeZone(window)).toBe(false);
  });
});
