// Tiroir bibliothèque : la sidebar gauche de Spotify en plein écran.

import { CLASSES, CONFIG } from './config.js';
import { EVENTS, emit, on } from './events.js';
import { SEL } from './selectors.js';

const root = () => document.documentElement;

/** @returns {boolean} */
export function isDrawerOpen() {
  return root().classList.contains(CLASSES.drawerOpen);
}

export function openDrawer() {
  root().classList.add(CLASSES.drawerOpen);
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
