// Cadre de la vue mobile.
//
// Spotify change souvent les classes de sa mise en page (les classes Root__*
// ne sont plus fiables). On s'appuie donc sur la structure plutôt que sur les noms :
//  1. on remonte depuis la bibliothèque (sidebar gauche) jusqu'à la grille de
//     mise en page (premier ancêtre en display: grid) ;
//  2. on classe chaque enfant de cette grille d'après son contenu
//     (bibliothèque, barre de lecture, panneau de droite, barre du haut, contenu) ;
//  3. layout.css réempile ces zones en une colonne grâce aux classes sm-area-*.
//
// La barre de lecture est aussi réorganisée en deux lignes : on repère sa rangée
// (ancêtre commun du titre et du bouton lecture) et on pose des classes
// sm-player-* sur ses colonnes. La colonne de droite (volume, paroles...) est masquée.

import { CLASSES } from './config.js';
import { SEL } from './selectors.js';

export const AREA_CLASSES = Object.freeze({
  grid: 'sm-grid',
  header: 'sm-area-header',
  left: 'sm-area-left',
  main: 'sm-area-main',
  player: 'sm-area-player',
  hidden: 'sm-area-hidden',
});

export const PLAYER_CLASSES = Object.freeze({
  row: 'sm-player-row',
  left: 'sm-player-left',
  center: 'sm-player-center',
  extra: 'sm-player-extra',
});

/** Hauteur max (px) d'une barre du haut. */
const HEADER_MAX_H = 160;

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
 * Grille de mise en page de Spotify : premier ancêtre de la bibliothèque en display: grid.
 * @param {Document} [doc]
 * @returns {Element | null}
 */
export function findLayoutGrid(doc = document) {
  const sidebar = doc.querySelector(SEL.leftSidebar);
  const view = doc.defaultView;
  if (!sidebar || !view) return null;
  for (let node = sidebar.parentElement; node && node !== doc.body; node = node.parentElement) {
    // Une grille qu'on a déjà réorganisée garde notre classe.
    if (node.classList.contains(AREA_CLASSES.grid)) return node;
    if (view.getComputedStyle(node).display === 'grid') return node;
  }
  return null;
}

/**
 * Rôle de chaque enfant de la grille (logique pure, hors géométrie fournie par `rect`).
 * @param {Element} grid
 * @param {(el: Element) => { top: number, width: number, height: number }} [rect]
 * @returns {Map<Element, keyof typeof AREA_CLASSES>}
 */
export function classifyAreas(grid, rect = (el) => el.getBoundingClientRect()) {
  /** @type {Map<Element, keyof typeof AREA_CLASSES>} */
  const roles = new Map();
  const has = (el, selector) => Boolean(el.matches(selector) || el.querySelector(selector));
  const rest = [];

  for (const child of grid.children) {
    if (has(child, SEL.leftSidebar)) roles.set(child, 'left');
    else if (has(child, SEL.playPause)) roles.set(child, 'player');
    else if (has(child, SEL.rightSidebar)) roles.set(child, 'hidden');
    else rest.push(child);
  }

  // Barre du haut : collée en haut, peu haute, avec des liens ou boutons.
  const header = rest.find((el) => {
    const r = rect(el);
    return (
      r.height > 0 && r.height <= HEADER_MAX_H && r.top <= 8 && has(el, 'a[href], button, input')
    );
  });
  if (header) roles.set(header, 'header');

  // Contenu : l'élément <main> s'il existe, sinon la plus grande zone restante.
  const candidates = rest.filter((el) => el !== header);
  const area = (el) => {
    const r = rect(el);
    return r.width * r.height;
  };
  const main =
    candidates.find((el) => has(el, 'main')) ??
    candidates.reduce((best, el) => (best && area(best) >= area(el) ? best : el), null);
  if (main) roles.set(main, 'main');

  // Le reste (poignées de redimensionnement, panneaux annexes) est masqué.
  for (const el of candidates) if (el !== main) roles.set(el, 'hidden');
  return roles;
}

/**
 * Pose les classes sm-grid / sm-area-* (idempotent).
 * @param {Element} grid
 * @param {Parameters<typeof classifyAreas>[1]} [rect]
 */
export function tagAreas(grid, rect) {
  const roles = classifyAreas(grid, rect);
  const areaClasses = Object.values(AREA_CLASSES).filter((c) => c !== AREA_CLASSES.grid);
  grid.classList.add(AREA_CLASSES.grid);
  for (const [el, role] of roles) {
    el.classList.remove(...areaClasses);
    el.classList.add(AREA_CLASSES[role]);
  }
}

/** Retire toutes les classes sm-area-* (retour en vue PC). */
export function untagAreas(doc = document) {
  for (const cls of Object.values(AREA_CLASSES)) {
    for (const el of doc.querySelectorAll(`.${cls}`)) el.classList.remove(cls);
  }
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
  /** @type {Element | null} */
  let grid = null;
  /** @type {Element | null} */
  let row = null;
  /** Nombre d'enfants de la grille lors du dernier classement. */
  let childCount = -1;
  /** Dernier classement (ms) : sans barre du haut trouvée, on réessaie au plus 1 fois/s. */
  let lastTag = 0;

  const isOn = () => doc.documentElement.classList.contains(CLASSES.on);

  // Spotify rend (et remplace) sa mise en page après le chargement : on la retrouve au besoin.
  const refresh = () => {
    if (!isOn()) {
      if (grid) untagAreas(doc);
      grid = null;
      row = null;
      childCount = -1;
      return;
    }
    if (!grid || !grid.isConnected) {
      grid = findLayoutGrid(doc);
      childCount = -1;
    }
    if (grid) {
      const changed = grid.children.length !== childCount;
      const noHeader = !grid.querySelector(`:scope > .${AREA_CLASSES.header}`);
      if (changed || (noHeader && Date.now() - lastTag > 1000)) {
        tagAreas(grid);
        childCount = grid.children.length;
        lastTag = Date.now();
      }
    }
    if (!row || !row.isConnected) {
      row = tagPlayer(doc) ? doc.querySelector(`.${PLAYER_CLASSES.row}`) : null;
    }
  };

  refresh();
  new MutationObserver(refresh).observe(doc.documentElement, { childList: true, subtree: true });
  return { refresh };
}
