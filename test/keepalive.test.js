import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupKeepAlive, toneWav } from '../src/keepalive.js';

describe('toneWav', () => {
  const wav = toneWav({ sampleRate: 8000, seconds: 1, frequency: 20, amplitude: 0.002 });
  const view = new DataView(wav.buffer);
  const text = (offset, length) => String.fromCharCode(...wav.slice(offset, offset + length));

  it('écrit un en-tête WAV PCM 16 bits mono valide', () => {
    expect(text(0, 4)).toBe('RIFF');
    expect(text(8, 4)).toBe('WAVE');
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(8000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(16000);
    expect(wav.length).toBe(44 + 16000);
  });

  it('reste inaudible (amplitude très faible) et boucle sans raccord', () => {
    let peak = 0;
    for (let i = 0; i < 8000; i++) peak = Math.max(peak, Math.abs(view.getInt16(44 + i * 2, true)));
    expect(peak).toBe(Math.round(0.002 * 32767));
    // 20 périodes entières : le dernier échantillon précède le premier (0).
    expect(view.getInt16(44, true)).toBe(0);
    expect(Math.abs(view.getInt16(44 + 7999 * 2, true))).toBeLessThan(3);
  });
});

describe('setupKeepAlive', () => {
  let play;
  let pause;
  /** Document neuf à chaque test : les écouteurs d'un test ne fuient pas dans le suivant. */
  let doc;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function () {
      Object.defineProperty(this, 'paused', { value: false, configurable: true });
      return Promise.resolve();
    });
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function () {
      Object.defineProperty(this, 'paused', { value: true, configurable: true });
    });
    doc = document.implementation.createHTMLDocument('');
    doc.body.innerHTML = '<video id="spotify"></video>';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const fire = (type) =>
    doc.getElementById('spotify').dispatchEvent(new Event(type, { bubbles: false }));

  it('démarre quand Spotify joue, tient pendant la transition, puis s’arrête', () => {
    const keep = setupKeepAlive({ doc, grace: 1000, enabled: () => true });
    fire('playing');
    expect(play).toHaveBeenCalledTimes(1);
    expect(keep.audio.loop).toBe(true);

    fire('ended'); // fin du titre
    vi.advanceTimersByTime(500);
    fire('playing'); // titre suivant avant la fin du délai
    vi.advanceTimersByTime(1000);
    expect(pause).not.toHaveBeenCalled();

    fire('pause');
    vi.advanceTimersByTime(1000);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it('ne fait rien si désactivé', () => {
    setupKeepAlive({ doc, grace: 1000, enabled: () => false });
    fire('playing');
    expect(play).not.toHaveBeenCalled();
  });
});
