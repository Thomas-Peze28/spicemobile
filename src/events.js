// Petit bus d'événements sur window : les modules se préviennent sans s'importer
// les uns les autres (pas de dépendances circulaires).

export const EVENTS = Object.freeze({
  /** Vue mobile activée / désactivée. detail : { enabled: boolean } */
  mode: 'sm:modechange',
  /** Tiroir ouvert / fermé. detail : { open: boolean } */
  drawer: 'sm:drawerchange',
  /** L'URL a changé (pushState, replaceState, popstate). */
  location: 'sm:locationchange',
});

/**
 * @param {string} name
 * @param {unknown} [detail]
 */
export function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * @param {string} name
 * @param {(event: CustomEvent) => void} handler
 * @returns {() => void} Fonction de désabonnement.
 */
export function on(name, handler) {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
