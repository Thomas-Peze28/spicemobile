// Diagnostic de mise en page : décrit la structure réelle de la page Spotify
// (balises, ids, data-testid, position et taille), pour corriger SpiceMobile
// sans accès à la console du téléphone.
//
// Ouverture : appui long sur « Vue PC » dans la barre du bas, ou SpiceMobile.diag().
// Le texte reste local : il n'est envoyé nulle part, on le copie à la main.

import { VERSION } from './config.js';
import { checkSelectors, summarize } from './health.js';
import { SEL } from './selectors.js';

const DIAG_ID = 'sm-diag';
const MAX_DEPTH = 9;
const MAX_LINES = 300;
const SKIP = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE', 'svg', 'path']);

/**
 * Description courte d'un élément : balise#id.classes[testid][aria-label].
 * @param {Element} el
 * @returns {string}
 */
export function describe(el) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const classes = [...el.classList]
    .slice(0, 3)
    .map((c) => `.${c}`)
    .join('');
  const testid = el.getAttribute('data-testid');
  const aria = el.getAttribute('aria-label');
  const role = el.getAttribute('role');
  return [
    `${tag}${id}${classes}`,
    testid ? `[tid=${testid}]` : '',
    role ? `[role=${role}]` : '',
    aria ? `[aria=${aria.slice(0, 30)}]` : '',
  ].join('');
}

/**
 * Arbre de la page, limité aux éléments visibles et aux branches utiles.
 * @param {Document} [doc]
 * @returns {string}
 */
export function buildDiagnostic(doc = document) {
  const view = doc.defaultView;
  const lines = [
    `SpiceMobile ${VERSION} — ${view?.innerWidth}x${view?.innerHeight} — ${doc.documentElement.className}`,
    `UA: ${view?.navigator.userAgent}`,
  ];

  const results = checkSelectors();
  const summary = summarize(results);
  lines.push(
    `Sélecteurs : ${summary.ok}/${summary.total}. Manquants : ${results
      .filter((r) => r.status !== 'ok')
      .map((r) => r.name)
      .join(', ')}`,
    '',
  );

  const markers = [
    ['LIB', doc.querySelector(SEL.leftSidebar)],
    ['PLAY', doc.querySelector(SEL.playPause)],
    ['WIDGET', doc.querySelector(SEL.nowPlayingWidget)],
    ['RIGHT', doc.querySelector(SEL.rightSidebar)],
    ['MAIN', doc.querySelector('main')],
  ].filter(([, el]) => el);

  const walk = (el, depth) => {
    if (lines.length >= MAX_LINES || SKIP.has(el.tagName) || el.id === DIAG_ID) return;
    const r = el.getBoundingClientRect();
    const cs = view?.getComputedStyle(el);
    const marks = markers.filter(([, m]) => m === el).map(([name]) => `★${name}`);
    const holds = markers.filter(([, m]) => el.contains(m)).map(([name]) => name);
    const visible = r.width > 0 && r.height > 0;
    if (!visible && holds.length === 0) return;

    const layout = cs ? `${cs.display}${cs.position === 'static' ? '' : ` ${cs.position}`}` : '';
    const box = `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
    lines.push(`${'  '.repeat(depth)}${describe(el)} {${layout}} ${box} ${marks.join(' ')}`);

    // On ne descend que dans les branches larges ou qui contiennent un repère.
    if (depth >= MAX_DEPTH || (r.width < 200 && holds.length === 0)) return;
    for (const child of el.children) walk(child, depth + 1);
  };
  if (doc.body) walk(doc.body, 0);
  if (lines.length >= MAX_LINES) lines.push('… (tronqué)');
  return lines.join('\n');
}

/** Affiche le diagnostic dans un panneau, avec un bouton pour le copier. */
export function showDiagnostic(doc = document) {
  doc.getElementById(DIAG_ID)?.remove();
  const text = buildDiagnostic(doc);

  const panel = doc.createElement('div');
  panel.id = DIAG_ID;
  const area = doc.createElement('textarea');
  area.readOnly = true;
  area.value = text;

  const bar = doc.createElement('div');
  const copy = doc.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copier';
  copy.addEventListener('click', async () => {
    area.select();
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = 'Copié ✔';
    } catch {
      // Repli : la sélection reste active, l'utilisateur copie à la main.
      copy.textContent = 'Sélectionné : copie à la main';
    }
  });
  const close = doc.createElement('button');
  close.type = 'button';
  close.textContent = 'Fermer';
  close.addEventListener('click', () => panel.remove());

  bar.append(copy, close);
  panel.append(bar, area);
  doc.body.appendChild(panel);
  return text;
}
