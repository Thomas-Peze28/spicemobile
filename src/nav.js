// Barre de navigation du bas : Accueil, Recherche, Biblio, Vue PC.

import { CLASSES, IDS } from './config.js';
import { isDrawerOpen, toggleDrawer } from './drawer.js';
import { EVENTS, on } from './events.js';
import { navigate } from './history.js';
import { setMobileMode } from './layout.js';
import { SEL } from './selectors.js';

/** @typedef {'home' | 'search' | 'library' | 'desktop'} TabId */

/** @type {Array<{ id: TabId, icon: string, label: string, action: () => void }>} */
export const NAV_ITEMS = [
  { id: 'home', icon: '⌂', label: 'Accueil', action: () => navigate('/', SEL.homeLink) },
  { id: 'search', icon: '⌕', label: 'Recherche', action: () => navigate('/search', SEL.searchLink) },
  { id: 'library', icon: '≡', label: 'Biblio', action: () => toggleDrawer() },
  { id: 'desktop', icon: '⇱', label: 'Vue PC', action: () => setMobileMode(false) },
];

/**
 * Onglet à mettre en surbrillance (logique pure).
 * @param {{ pathname: string, drawerOpen: boolean }} state
 * @returns {TabId | null}
 */
export function activeTab({ pathname, drawerOpen }) {
  if (drawerOpen) return 'library';
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname === '/search' || pathname.startsWith('/search/')) return 'search';
  return null;
}

export function buildNav() {
  if (document.getElementById(IDS.nav)) return;

  const nav = document.createElement('nav');
  nav.id = IDS.nav;
  nav.setAttribute('aria-label', 'SpiceMobile');

  for (const item of NAV_ITEMS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.smId = item.id;

    const icon = document.createElement('span');
    icon.className = 'sm-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = item.icon;

    const label = document.createElement('span');
    label.textContent = item.label;

    btn.append(icon, label);
    btn.addEventListener('click', item.action);
    nav.appendChild(btn);
  }
  document.body.appendChild(nav);
}

export function updateActive() {
  const nav = document.getElementById(IDS.nav);
  if (!nav) return;
  const current = activeTab({ pathname: location.pathname, drawerOpen: isDrawerOpen() });
  for (const btn of nav.querySelectorAll('button')) {
    const active = btn.dataset.smId === current;
    btn.classList.toggle(CLASSES.active, active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
}

/** Met à jour l'onglet actif à chaque changement d'URL ou de tiroir. */
export function setupNav() {
  on(EVENTS.location, updateActive);
  on(EVENTS.drawer, updateActive);
}
