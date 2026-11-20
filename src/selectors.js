/**
 * TOUS les sélecteurs du DOM Spotify, et seulement eux.
 *
 * Quand Spotify met à jour son lecteur et que quelque chose casse, c'est
 * (presque) toujours ici qu'il faut corriger. Le health check (health.js)
 * vérifie chacune de ces entrées sur la page.
 *
 * Chaque entrée :
 *  - variants    : sélecteurs essayés dans l'ordre (le premier trouvé gagne).
 *                  Préférer data-testid, aria-*, classes Root__* aux classes générées.
 *  - group       : 'core'       -> doit exister sur toutes les pages du lecteur ;
 *                  'contextual' -> dépend de la page ou de l'état (normal s'il manque parfois).
 *  - description : ce que l'élément représente (affiché par le health check).
 *
 * Les sélecteurs cités dans src/styles/*.css doivent aussi être déclarés ici :
 * un test (test/selectors-css.test.js) le vérifie.
 */

/** @typedef {{ variants: string[], group: 'core' | 'contextual', description: string }} SelectorEntry */

/** @type {Record<string, SelectorEntry>} */
export const SELECTORS = {
  // --- Structure de la page ---
  topContainer: {
    variants: ['.Root__top-container'],
    group: 'core',
    description: 'Conteneur principal du lecteur',
  },
  mainView: {
    variants: ['.Root__main-view'],
    group: 'core',
    description: 'Vue centrale (contenu des pages)',
  },
  leftSidebar: {
    variants: ['.Root__nav-bar', '#Desktop_LeftSidebar_Id'],
    group: 'core',
    description: 'Sidebar gauche (bibliothèque), utilisée comme tiroir',
  },
  rightSidebar: {
    variants: ['.Root__right-sidebar'],
    group: 'contextual',
    description: 'Sidebar droite (file d’attente, « En cours de lecture »)',
  },

  // --- Barre de lecture ---
  nowPlayingBar: {
    variants: ['.Root__now-playing-bar', '[data-testid="now-playing-bar"]'],
    group: 'core',
    description: 'Barre de lecture (zone du swipe)',
  },
  progressBar: {
    variants: ['[data-testid="playback-progressbar"]', 'input[type="range"]'],
    group: 'core',
    description: 'Barre de progression (exclue du swipe)',
  },
  controlButtons: {
    variants: ['[data-testid^="control-button-"]'],
    group: 'core',
    description: 'Boutons de contrôle (agrandis à 44 px)',
  },
  playPause: {
    variants: ['[data-testid="control-button-playpause"]'],
    group: 'core',
    description: 'Bouton lecture / pause',
  },
  next: {
    variants: ['[data-testid="control-button-skip-forward"]'],
    group: 'core',
    description: 'Bouton titre suivant (swipe gauche)',
  },
  prev: {
    variants: ['[data-testid="control-button-skip-back"]'],
    group: 'core',
    description: 'Bouton titre précédent (swipe droite)',
  },
  volumeBar: {
    variants: ['[data-testid="volume-bar"]'],
    group: 'contextual',
    description: 'Barre de volume (masquée)',
  },
  muteButton: {
    variants: ['[data-testid="volume-bar-toggle-mute-button"]'],
    group: 'contextual',
    description: 'Bouton sourdine (masqué)',
  },
  npvButton: {
    variants: ['[data-testid="control-button-npv"]'],
    group: 'contextual',
    description: 'Bouton « En cours de lecture » (masqué)',
  },
  pipButton: {
    variants: ['[data-testid="pip-toggle-button"]'],
    group: 'contextual',
    description: 'Bouton mini-lecteur (masqué)',
  },
  fullscreenButton: {
    variants: ['[data-testid="fullscreen-mode-button"]'],
    group: 'contextual',
    description: 'Bouton plein écran (masqué)',
  },

  // --- Listes de titres ---
  tracklistRow: {
    variants: ['[data-testid="tracklist-row"]'],
    group: 'contextual',
    description: 'Ligne de liste de titres (pages playlist / album)',
  },
  tracklistHeader: {
    variants: ['[role="grid"] [role="row"][aria-rowindex="1"]'],
    group: 'contextual',
    description: 'En-tête de liste de titres (masqué)',
  },

  // --- Liens de navigation (cliqués pour naviguer sans rechargement) ---
  homeLink: {
    variants: ['a[href="/"]'],
    group: 'core',
    description: 'Lien vers l’accueil',
  },
  searchLink: {
    variants: ['a[href^="/search"]'],
    group: 'core',
    description: 'Lien vers la recherche',
  },
};

/**
 * Sélecteur CSS combiné (variantes séparées par des virgules), utilisable
 * avec querySelector / closest.
 * @param {string} name Clé de SELECTORS.
 * @returns {string}
 */
export function selectorOf(name) {
  const entry = SELECTORS[name];
  if (!entry) throw new Error(`[SpiceMobile] Sélecteur inconnu : ${name}`);
  return entry.variants.join(', ');
}

/** Raccourcis : SEL.nowPlayingBar === '.Root__now-playing-bar, [data-testid="now-playing-bar"]'. */
export const SEL = Object.freeze(
  Object.fromEntries(Object.keys(SELECTORS).map((name) => [name, selectorOf(name)])),
);
