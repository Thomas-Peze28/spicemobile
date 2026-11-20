// Point d'entrée de SpiceMobile. Ordre de démarrage :
//  1. dès document-start : classe .sm-on + CSS (pas de flash en vue PC) ;
//  2. au DOMContentLoaded : viewport, barre du bas, bouton flottant.
//
// SpiceMobile agit uniquement sur le DOM et le CSS de la page.

import { VERSION } from './config.js';
import { onDomReady } from './dom.js';
import { setupDrawer } from './drawer.js';
import { EVENTS, on } from './events.js';
import { patchHistory } from './history.js';
import { log } from './log.js';
import { applyMode, buildFab, injectStyle } from './layout.js';
import { buildNav, setupNav, updateActive } from './nav.js';
import { isEnabled } from './storage.js';
import { setupSwipe } from './swipe.js';
import { createViewport } from './viewport.js';

const LOADED = Symbol.for('spicemobile.loaded');

function init() {
  if (window[LOADED]) return; // déjà chargé (double installation, rechargement du script)
  window[LOADED] = true;

  const viewport = createViewport(document);

  setupDrawer();
  setupNav();
  applyMode(isEnabled());
  injectStyle();
  patchHistory();
  setupSwipe();

  onDomReady(() => {
    injectStyle(); // Spotify a pu remplacer le <head> entre-temps
    // Pas avant : le viewport d'origine de Spotify doit être capturé une fois le <head> présent.
    viewport.sync();
    viewport.watch();
    on(EVENTS.mode, () => viewport.sync());
    buildNav();
    buildFab();
    updateActive();
    log(`v${VERSION} prête`);
  });
}

init();
