import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CLASSES, IDS } from '../src/config.js';
import { closeDrawer, openDrawer } from '../src/drawer.js';
import { activeTab, buildNav, NAV_ITEMS, setupNav, updateActive } from '../src/nav.js';

describe('activeTab', () => {
  it.each([
    ['/', false, 'home'],
    ['/search', false, 'search'],
    ['/search/daft%20punk', false, 'search'],
    ['/playlist/37i9dQZF1DXcBWIGoYBM5M', false, null],
    ['/searchlight', false, null],
    ['/album/123', true, 'library'],
    ['/', true, 'library'],
  ])('%s (tiroir ouvert : %s) -> %s', (pathname, drawerOpen, expected) => {
    expect(activeTab({ pathname, drawerOpen })).toBe(expected);
  });
});

describe('barre de navigation', () => {
  const active = () =>
    [...document.querySelectorAll(`#${IDS.nav} button.${CLASSES.active}`)].map(
      (btn) => btn.dataset.smId,
    );

  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.className = '';
    history.replaceState({}, '', '/');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('crée un bouton par onglet, une seule fois', () => {
    buildNav();
    buildNav();
    const nav = document.querySelectorAll(`#${IDS.nav}`);
    expect(nav).toHaveLength(1);
    expect([...nav[0].querySelectorAll('button')].map((b) => b.dataset.smId)).toEqual(
      NAV_ITEMS.map((item) => item.id),
    );
  });

  it("met en surbrillance l'onglet de la page courante", () => {
    buildNav();
    updateActive();
    expect(active()).toEqual(['home']);

    history.replaceState({}, '', '/search');
    updateActive();
    expect(active()).toEqual(['search']);
    expect(document.querySelector('[data-sm-id="search"]').getAttribute('aria-current')).toBe(
      'page',
    );

    history.replaceState({}, '', '/playlist/abc');
    updateActive();
    expect(active()).toEqual([]);
  });

  it("suit l'ouverture et la fermeture du tiroir", () => {
    buildNav();
    setupNav();
    openDrawer();
    expect(active()).toEqual(['library']);
    closeDrawer();
    expect(active()).toEqual(['home']);
  });
});
