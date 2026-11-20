// Navigation sans rechargement de page : un rechargement couperait la musique.

import { clickFirst } from './dom.js';
import { closeDrawer } from './drawer.js';
import { EVENTS, emit } from './events.js';

const PATCHED = Symbol.for('spicemobile.historyPatched');

/** Émet sm:locationchange à chaque changement d'URL de la SPA (idempotent). */
export function patchHistory() {
  if (history[PATCHED]) return;
  for (const method of ['pushState', 'replaceState']) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      emit(EVENTS.location);
      return result;
    };
  }
  window.addEventListener('popstate', () => emit(EVENTS.location));
  history[PATCHED] = true;
}

/**
 * Va vers `path` sans recharger la page.
 * 1er choix : cliquer sur un vrai lien Spotify, pour laisser son routeur faire.
 * Repli : History API + popstate, que le routeur de Spotify écoute.
 * @param {string} path
 * @param {string} [linkSelector]
 */
export function navigate(path, linkSelector) {
  closeDrawer();
  if (linkSelector && clickFirst(linkSelector)) return;
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
}
