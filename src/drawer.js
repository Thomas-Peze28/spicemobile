// Tiroir bibliothèque : la sidebar gauche de Spotify en plein écran.

import { CLASSES, CONFIG } from './config.js';
import { EVENTS, emit, on } from './events.js';
import { SEL } from './selectors.js';

/**
 * La bibliothèque est-elle en mode réduit (pochettes seules, sans les noms) ?
 * En mode réduit, le bouton « Votre bibliothèque » n'affiche pas de texte.
 * @param {Element | null} toggle
 * @returns {boolean}
 */
export function isLibraryCollapsed(toggle) {
  if (!toggle) return false;
  const expanded = toggle.getAttribute('aria-expanded');
  if (expanded !== null) return expanded === 'false';
  return (toggle.textContent ?? '').trim() === '';
}

/** Déplie la bibliothèque si Spotify l'affiche en mode réduit. */
export function expandLibrary(doc = document) {
  const toggle = doc.querySelector(SEL.libraryToggle);
  if (toggle instanceof HTMLElement && isLibraryCollapsed(toggle)) toggle.click();
}

const root = () => document.documentElement;

/** @returns {boolean} */
export function isDrawerOpen() {
  return root().classList.contains(CLASSES.drawerOpen);
}

export function openDrawer() {
  root().classList.add(CLASSES.drawerOpen);
  expandLibrary();
  emit(EVENTS.drawer, { open: true });
}

export function closeDrawer() {
  root().classList.remove(CLASSES.drawerOpen);
  emit(EVENTS.drawer, { open: false });
}

export function toggleDrawer() {
  if (isDrawerOpen()) closeDrawer();
  else openDrawer();
}

/** Ferme le tiroir quand on change de vue, ou quand on choisit une playlist dedans. */
export function setupDrawer() {
  on(EVENTS.mode, closeDrawer);

  document.addEventListener(
    'click',
    (event) => {
      if (!isDrawerOpen()) return;
      const target = event.target;
      const link = target instanceof Element ? target.closest('a[href]') : null;
      if (link && link.closest(SEL.leftSidebar)) setTimeout(closeDrawer, CONFIG.drawerCloseDelay);
    },
    true,
  );
}
