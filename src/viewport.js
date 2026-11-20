// Balise <meta name="viewport"> : largeur de l'écran du téléphone en vue mobile,
// valeur d'origine de Spotify en vue PC.

import { CLASSES, MOBILE_VIEWPORT } from './config.js';

/**
 * Contenu voulu pour la balise viewport.
 * @param {boolean} mobile Vue mobile active ?
 * @param {string} original Contenu d'origine ('' si la balise n'existait pas).
 * @returns {string}
 */
export function wantedViewport(mobile, original) {
  return mobile ? MOBILE_VIEWPORT : original;
}

/**
 * @param {Document} [doc]
 * @returns {{ sync: () => void, watch: () => MutationObserver | null, original: () => string | null }}
 */
export function createViewport(doc = document) {
  /** Contenu d'origine, capturé au premier appel de sync(). */
  let original = null;

  function sync() {
    const root = doc.documentElement;
    let meta = doc.querySelector('meta[name="viewport"]');
    if (original === null) original = meta ? meta.getAttribute('content') || '' : '';

    const wanted = wantedViewport(root.classList.contains(CLASSES.on), original);
    if (!meta) {
      if (!wanted) return;
      meta = doc.createElement('meta');
      meta.setAttribute('name', 'viewport');
      (doc.head || root).appendChild(meta);
    }
    // Garde anti-boucle avec le MutationObserver : n'écrire que si nécessaire.
    if (meta.getAttribute('content') !== wanted) meta.setAttribute('content', wanted);
  }

  /** Spotify peut réécrire le <head> : on resurveille la balise viewport. */
  function watch() {
    if (!doc.head) return null;
    const observer = new MutationObserver(sync);
    observer.observe(doc.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['content'],
    });
    return observer;
  }

  return { sync, watch, original: () => original };
}
