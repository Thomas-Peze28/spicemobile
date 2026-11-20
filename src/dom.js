// Utilitaires DOM partagés.

import { log } from './log.js';

/**
 * Clique sur le premier élément correspondant (même caché, .click() fonctionne).
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {boolean} true si un élément a été cliqué.
 */
export function clickFirst(selector, root = document) {
  const el = root.querySelector(selector);
  if (el instanceof HTMLElement) {
    el.click();
    return true;
  }
  log('Introuvable :', selector);
  return false;
}

/**
 * Exécute `fn` dès que le DOM est prêt (tout de suite s'il l'est déjà).
 * @param {() => void} fn
 */
export function onDomReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}
