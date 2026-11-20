// Réglages de SpiceMobile. Rien de spécifique au DOM Spotify ici : voir selectors.js.

/* global __SM_VERSION__ */
/** Version injectée au build depuis package.json. */
export const VERSION = typeof __SM_VERSION__ === 'undefined' ? 'dev' : __SM_VERSION__;

export const CONFIG = Object.freeze({
  /** Déplacement horizontal minimum (px) pour reconnaître un swipe. */
  swipeThreshold: 60,
  /** Au-delà de ce déplacement vertical (px), le geste est un scroll. */
  swipeMaxVertical: 40,
  /** Délai (ms) avant de fermer le tiroir après un clic sur une playlist. */
  drawerCloseDelay: 150,
  /** Délai max (ms) d'attente du rendu de Spotify avant le health check. */
  healthCheckTimeout: 15000,
  /** Valeur par défaut du mode debug (surchargée par localStorage). */
  debug: false,
});

export const STORAGE_KEYS = Object.freeze({
  enabled: 'spicemobile:enabled',
  debug: 'spicemobile:debug',
});

export const MOBILE_VIEWPORT = 'width=device-width, initial-scale=1, viewport-fit=cover';

/** Classes posées sur <html> et sur nos éléments. */
export const CLASSES = Object.freeze({
  on: 'sm-on',
  drawerOpen: 'sm-drawer-open',
  active: 'sm-active',
});

/** Identifiants des éléments injectés par SpiceMobile. */
export const IDS = Object.freeze({
  style: 'sm-style',
  nav: 'sm-nav',
  fab: 'sm-fab',
});
