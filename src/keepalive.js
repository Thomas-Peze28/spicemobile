// Maintien de la lecture écran éteint (Firefox Android).
//
// Entre deux titres, Spotify marque un court silence. Firefox considère alors
// l'onglet comme muet et le ralentit en arrière-plan : Spotify ne télécharge
// plus la suite du titre suivant, qui se coupe après ses premières secondes.
//
// Parade : tant que Spotify joue (et un peu après), on fait tourner en boucle un
// son inaudible (20 Hz, -54 dB : sous le seuil d'audition et hors de portée
// d'un haut-parleur de téléphone). L'onglet reste « audible » pour Firefox.
//
// Désactivable : SpiceMobile.keepAlive(false), ou
// localStorage['spicemobile:keepalive'] = '0'.

import { CONFIG } from './config.js';
import { log } from './log.js';
import { isKeepAlive } from './storage.js';

/**
 * Fichier WAV (PCM 16 bits mono) d'une sinusoïde. Avec une durée multiple de la
 * période, la boucle est sans raccord audible.
 * @param {{ sampleRate?: number, seconds?: number, frequency?: number, amplitude?: number }} [options]
 * @returns {Uint8Array}
 */
export function toneWav({
  sampleRate = 8000,
  seconds = 1,
  frequency = 20,
  amplitude = 0.002,
} = {}) {
  const samples = Math.round(sampleRate * seconds);
  const dataSize = samples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const ascii = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true); // taille du bloc fmt
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // octets par seconde
  view.setUint16(32, 2, true); // octets par échantillon
  view.setUint16(34, 16, true); // bits par échantillon
  ascii(36, 'data');
  view.setUint32(40, dataSize, true);

  const peak = Math.round(amplitude * 32767);
  for (let i = 0; i < samples; i++) {
    const value = Math.round(peak * Math.sin((2 * Math.PI * frequency * i) / sampleRate));
    view.setInt16(44 + i * 2, value, true);
  }
  return new Uint8Array(buffer);
}

/**
 * @param {{ doc?: Document, grace?: number, enabled?: () => boolean }} [options]
 */
export function setupKeepAlive({
  doc = document,
  grace = CONFIG.keepAliveGrace,
  enabled = () => isKeepAlive(),
} = {}) {
  /** @type {HTMLAudioElement | null} */
  let audio = null;
  let stopTimer = 0;
  let wanted = false;

  const element = () => {
    if (audio) return audio;
    const blob = new Blob([toneWav()], { type: 'audio/wav' });
    audio = doc.createElement('audio');
    audio.src = URL.createObjectURL(blob);
    audio.loop = true;
    audio.preload = 'auto';
    audio.dataset.sm = 'keepalive';
    return audio;
  };

  const start = () => {
    clearTimeout(stopTimer);
    if (!enabled()) return;
    wanted = true;
    const el = element();
    if (!el.paused) return;
    try {
      Promise.resolve(el.play()).catch((error) => {
        // Lecture refusée (pas encore d'interaction) : on réessaiera au prochain toucher.
        log('Maintien en arrière-plan : lecture refusée', error?.name ?? error);
      });
    } catch (error) {
      log('Maintien en arrière-plan : lecture impossible', error?.name ?? error);
    }
  };

  const stop = () => {
    clearTimeout(stopTimer);
    wanted = false;
    audio?.pause();
  };

  const isOurs = (target) => target === audio;
  const isMedia = (target) => target instanceof HTMLMediaElement;

  // Les événements média ne remontent pas : on les écoute en phase de capture.
  doc.addEventListener(
    'playing',
    (event) => {
      if (isMedia(event.target) && !isOurs(event.target)) start();
    },
    true,
  );
  for (const type of ['pause', 'ended']) {
    doc.addEventListener(
      type,
      (event) => {
        if (!isMedia(event.target) || isOurs(event.target)) return;
        // On garde l'onglet actif pendant la transition vers le titre suivant.
        clearTimeout(stopTimer);
        stopTimer = window.setTimeout(stop, grace);
      },
      true,
    );
  }

  // Si la lecture a été refusée faute d'interaction, un toucher la débloque.
  doc.addEventListener(
    'pointerdown',
    () => {
      if (wanted && audio?.paused) start();
    },
    true,
  );

  return {
    start,
    stop,
    /** Pour les tests et le débogage. */
    get audio() {
      return audio;
    },
  };
}
