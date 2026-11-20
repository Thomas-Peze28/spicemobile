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
// sm-player-* sur ses colonnes : titre, puis boutons et progression, puis volume.

import { CLASSES } from './config.js';
import { SEL } from './selectors.js';

export const AREA_CLASSES = Object.freeze({
  grid: 'sm-grid',
  header: 'sm-area-header',
  left: 'sm-area-left',
  main: 'sm-area-main',
  player: 'sm-area-player',
  hidden: 'sm-area-hidden',
  /** Barre du haut placée hors de la grille (fixée en haut de l'écran). */
  top: 'sm-top',
  /** Barre de lecture placée hors de la grille (fixée au-dessus de la barre du bas). */
  bottom: 'sm-bottom',
});

/** Élément injecté par SpiceMobile (barre du bas, bouton, diagnostic...) ? */
const isOwn = (el) => el.id.startsWith('sm-');

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

  // Contenu : l'élément <main> (ou #main-view) s'il existe, sinon la plus grande zone.
  const area = (el) => {
    const r = rect(el);
    return r.width * r.height;
  };
  const main =
    rest.find((el) => has(el, 'main, #main-view')) ??
    rest.reduce((best, el) => (best && area(best) >= area(el) ? best : el), null);
  if (main) roles.set(main, 'main');

  // Barre du haut : la première zone restante avec des liens ou boutons. Pas de test
  // de position : une zone déjà masquée par SpiceMobile mesure 0 et doit être retrouvée.
  const header = rest.find(
    (el) => el !== main && rect(el).height <= HEADER_MAX_H && has(el, 'a[href], button, input'),
  );
  if (header) roles.set(header, 'header');

  const candidates = rest.filter((el) => el !== header);
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

/**
 * Barre du haut placée hors de la grille : premier frère précédent (de la grille
 * ou d'un de ses ancêtres) qui ressemble à une barre de navigation.
 * @param {Element} grid
 * @param {(el: Element) => { top: number, width: number, height: number }} [rect]
 * @returns {Element | null}
 */
export function findExternalHeader(grid, rect = (el) => el.getBoundingClientRect()) {
  const body = grid.ownerDocument.body;
  for (let node = grid; node && node !== body; node = node.parentElement) {
    for (let sib = node.previousElementSibling; sib; sib = sib.previousElementSibling) {
      if (isOwn(sib)) continue;
      const r = rect(sib);
      if (r.height > 0 && r.height <= HEADER_MAX_H && sib.querySelector('a[href], button')) {
        return sib;
      }
    }
  }
  return null;
}

/**
 * Barre de lecture placée hors de la grille : ancêtre du bouton lecture qui est
 * frère de la grille (ou d'un de ses ancêtres).
 * @param {Element} grid
 * @returns {Element | null}
 */
export function findExternalPlayer(grid) {
  const play = grid.ownerDocument.querySelector(SEL.playPause);
  if (!play || grid.contains(play)) return null;
  let node = play;
  while (node.parentElement && !node.parentElement.contains(grid)) node = node.parentElement;
  return node.parentElement && !isOwn(node) ? node : null;
}

/** Retire toutes les classes sm-area-* (retour en vue PC). */
export function untagAreas(doc = document) {
  for (const cls of Object.values(AREA_CLASSES)) {
    for (const el of doc.querySelectorAll(`.${cls}`)) el.classList.remove(cls);
  }
  doc.documentElement.style.removeProperty('--sm-top-h');
  doc.documentElement.style.removeProperty('--sm-bottom-h');
}

/**
 * Pose les classes sm-player-* sur les colonnes de la barre de lecture (idempotent).
 * @param {ParentNode} [root]
 * @returns {boolean} true si la barre a été reconnue.
 */
export function tagPlayer(root = document) {
  const play = root.querySelector(SEL.playPause);
  if (!play) return false;
  const widget = root.querySelector(SEL.nowPlayingWidget);

  // Rangée : ancêtre commun du titre et du bouton lecture, ou à défaut le premier
  // élément de la barre de lecture qui a plusieurs enfants (gauche, centre, droite).
  let row = widget ? commonAncestor(widget, play) : null;
  if (!row) {
    const bar = play.closest(SEL.nowPlayingBar);
    if (!bar) return false;
    row = bar;
    while (row.children.length === 1) row = row.children[0];
    if (row.children.length < 2 || !row.contains(play)) return false;
  }
  const left = widget
    ? [...row.children].find((child) => child.contains(widget))
    : [...row.children].find((child) => !child.contains(play));

  row.classList.add(PLAYER_CLASSES.row);
  for (const child of row.children) {
    let cls = PLAYER_CLASSES.extra;
    if (child === left) cls = PLAYER_CLASSES.left;
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
  /** Barres placées hors de la grille, fixées en haut / en bas de l'écran. */
  const bars = {
    top: { el: /** @type {Element | null} */ (null), cls: AREA_CLASSES.top, prop: '--sm-top-h' },
    bottom: {
      el: /** @type {Element | null} */ (null),
      cls: AREA_CLASSES.bottom,
      prop: '--sm-bottom-h',
    },
  };

  const style = doc.documentElement.style;
  const measure = () => {
    for (const bar of Object.values(bars)) {
      const h = bar.el?.isConnected ? Math.round(bar.el.getBoundingClientRect().height) : 0;
      style.setProperty(bar.prop, `${h}px`);
    }
  };
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

  /** @param {'top' | 'bottom'} name @param {Element | null} el */
  const setBar = (name, el) => {
    const bar = bars[name];
    if (el === bar.el) return;
    bar.el?.classList.remove(bar.cls);
    bar.el = el;
    el?.classList.add(bar.cls);
    resize?.disconnect();
    for (const b of Object.values(bars)) if (b.el) resize?.observe(b.el);
    measure();
  };
  const lost = (name) => !bars[name].el?.isConnected;

  const isOn = () => doc.documentElement.classList.contains(CLASSES.on);

  // Spotify rend (et remplace) sa mise en page après le chargement : on la retrouve au besoin.
  const refresh = () => {
    if (!isOn()) {
      if (grid) untagAreas(doc);
      bars.top.el = null;
      bars.bottom.el = null;
      resize?.disconnect();
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
      const inGrid = (role) => grid.querySelector(`:scope > .${AREA_CLASSES[role]}`);
      const missing = (!inGrid('header') && lost('top')) || (!inGrid('player') && lost('bottom'));
      if (changed || (missing && Date.now() - lastTag > 1000)) {
        tagAreas(grid);
        childCount = grid.children.length;
        lastTag = Date.now();
        setBar('top', inGrid('header') ? null : findExternalHeader(grid));
        setBar('bottom', inGrid('player') ? null : findExternalPlayer(grid));
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
