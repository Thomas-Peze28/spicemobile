// Vue mobile / vue PC : classe .sm-on sur <html>, injection du CSS,
// bouton flottant pour revenir en vue mobile.

import { CLASSES, IDS } from './config.js';
import { EVENTS, emit } from './events.js';
import { saveEnabled } from './storage.js';
import { CSS } from './styles/index.js';

const root = () => document.documentElement;

/** @returns {boolean} */
export function isMobileMode() {
  return root().classList.contains(CLASSES.on);
}

/**
 * Applique le mode sans le mémoriser.
 * @param {boolean} on
 */
export function applyMode(on) {
  root().classList.toggle(CLASSES.on, on);
  emit(EVENTS.mode, { enabled: on });
}

/**
 * Change de vue et mémorise le choix pour les prochaines visites.
 * @param {boolean} on
 */
export function setMobileMode(on) {
  saveEnabled(on);
  applyMode(on);
}

/** Injecte la feuille de style (idempotent). */
export function injectStyle() {
  if (document.getElementById(IDS.style)) return;
  const style = document.createElement('style');
  style.id = IDS.style;
  style.textContent = CSS;
  (document.head || root()).appendChild(style);
}

/** Bouton flottant visible en vue PC pour revenir en vue mobile. */
export function buildFab() {
  if (document.getElementById(IDS.fab)) return;
  const fab = document.createElement('button');
  fab.id = IDS.fab;
  fab.type = 'button';
  fab.textContent = 'Mob';
  fab.title = 'Revenir à la vue mobile';
  fab.setAttribute('aria-label', 'Revenir à la vue mobile');
  fab.addEventListener('click', () => setMobileMode(true));
  document.body.appendChild(fab);
}
