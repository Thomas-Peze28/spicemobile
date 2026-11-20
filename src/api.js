// API de console : window.SpiceMobile, pratique en débogage distant.
//
//   SpiceMobile.healthCheck()   -> vérifie les sélecteurs sur la page actuelle
//   SpiceMobile.debug(true)     -> active le mode debug (puis recharger la page)
//   SpiceMobile.diag()          -> panneau de diagnostic de mise en page
//   SpiceMobile.version         -> version installée

import { VERSION } from './config.js';
import { showDiagnostic } from './diag.js';
import { runHealthCheck } from './health.js';
import { setMobileMode } from './layout.js';
import { SELECTORS } from './selectors.js';
import { isDebug, saveDebug } from './storage.js';

export function exposeApi() {
  const api = {
    version: VERSION,
    selectors: SELECTORS,
    healthCheck: () => runHealthCheck({ wait: false }),
    /** @param {boolean} [on] */
    debug(on) {
      if (on !== undefined) saveDebug(Boolean(on));
      return isDebug();
    },
    /** @param {boolean} on */
    mobile: (on) => setMobileMode(Boolean(on)),
    diag: () => showDiagnostic(),
  };
  Object.defineProperty(window, 'SpiceMobile', {
    value: Object.freeze(api),
    configurable: true,
  });
  return api;
}
