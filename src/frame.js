// Cadre de la vue mobile : barre du haut, contenu, barre de lecture, barre du bas.
//
// Spotify place ses panneaux dans une grille dont la structure change souvent.
// Plutôt que d'en dépendre, la vue mobile fixe chaque zone à l'écran (voir
// layout.css) et mesure ici la hauteur réelle des barres :
//   --sm-top-h    : barre du haut de Spotify ;
//   --sm-player-h : barre de lecture.
//
// La barre de lecture est aussi réorganisée en deux lignes : on repère sa
// rangée (ancêtre commun du titre et du bouton lecture) et on pose des classes
// sm-player-* sur ses colonnes. La colonne de droite (volume, paroles, file...)
// est masquée.

import { CLASSES } from './config.js';
import { SEL } from './selectors.js';

export const PLAYER_CLASSES = Object.freeze({
  row: 'sm-player-row',
  left: 'sm-player-left',
  center: 'sm-player-center',
  extra: 'sm-player-extra',
});

/**
 * Ancêtre commun le plus proche de deux éléments.
 * @param {Element} a
 * @param {Element} b
 * @returns {Element | null}
 */
export function commonAncestor(a, b) {
  for (let node = a.parentElement; node; node = node.parentElement) {
    if (node.contains(b)) return node;
  }
  return null;
}

/**
 * Pose les classes sm-player-* sur les colonnes de la barre de lecture (idempotent).
 * @param {ParentNode} [root]
 * @returns {boolean} true si la barre a été reconnue.
 */
export function tagPlayer(root = document) {
  const widget = root.querySelector(SEL.nowPlayingWidget);
  const play = root.querySelector(SEL.playPause);
  if (!widget || !play) return false;
  const row = commonAncestor(widget, play);
  if (!row) return false;

  row.classList.add(PLAYER_CLASSES.row);
  for (const child of row.children) {
    let cls = PLAYER_CLASSES.extra;
    if (child.contains(widget)) cls = PLAYER_CLASSES.left;
    else if (child.contains(play)) cls = PLAYER_CLASSES.center;
    child.classList.remove(...Object.values(PLAYER_CLASSES));
    child.classList.add(cls);
  }
  return true;
}

/**
 * @param {Document} [doc]
 */
export function setupFrame(doc = document) {
  const style = doc.documentElement.style;
  /** @type {Element | null} */
  let top = null;
  /** @type {Element | null} */
  let player = null;
  /** @type {Element | null} */
  let row = null;

  const measure = () => {
    style.setProperty(
      '--sm-top-h',
      `${top ? Math.round(top.getBoundingClientRect().height) : 64}px`,
    );
    style.setProperty(
      '--sm-player-h',
      `${player ? Math.round(player.getBoundingClientRect().height) : 0}px`,
    );
  };

  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

  // Spotify rend (et remplace) ses barres après le chargement : on les retrouve au besoin.
  const refresh = () => {
    if (!doc.documentElement.classList.contains(CLASSES.on)) return;
    const stale = (el) => !el || !el.isConnected;
    if (!stale(top) && !stale(player) && !stale(row)) return;

    top = doc.querySelector(SEL.globalNav);
    player = doc.querySelector(SEL.nowPlayingBar);
    row = tagPlayer(doc) ? doc.querySelector(`.${PLAYER_CLASSES.row}`) : null;
    if (resize) {
      resize.disconnect();
      for (const el of [top, player]) if (el) resize.observe(el);
    }
    measure();
  };

  measure();
  refresh();
  new MutationObserver(refresh).observe(doc.documentElement, { childList: true, subtree: true });
  return { refresh, measure };
}
