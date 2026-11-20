import { beforeEach, describe, expect, it } from 'vitest';
import { commonAncestor, tagPlayer } from '../src/frame.js';
import { isLibraryCollapsed } from '../src/drawer.js';

describe('tagPlayer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <footer data-testid="now-playing-bar">
        <div id="row">
          <div id="l"><div data-testid="now-playing-widget">Titre</div></div>
          <div id="c"><button data-testid="control-button-playpause"></button></div>
          <div id="r"><button data-testid="volume-bar"></button></div>
        </div>
      </footer>`;
  });

  it('trouve la rangée et classe ses colonnes', () => {
    expect(tagPlayer()).toBe(true);
    expect(document.getElementById('row').classList.contains('sm-player-row')).toBe(true);
    expect(document.getElementById('l').className).toBe('sm-player-left');
    expect(document.getElementById('c').className).toBe('sm-player-center');
    expect(document.getElementById('r').className).toBe('sm-player-extra');
  });

  it('renvoie false sans barre de lecture', () => {
    document.body.innerHTML = '';
    expect(tagPlayer()).toBe(false);
  });

  it('commonAncestor', () => {
    const a = document.querySelector('[data-testid="now-playing-widget"]');
    const b = document.querySelector('[data-testid="control-button-playpause"]');
    expect(commonAncestor(a, b)?.id).toBe('row');
  });
});

describe('isLibraryCollapsed', () => {
  const button = (html) => {
    document.body.innerHTML = html;
    return document.querySelector('button');
  };
  it('bouton sans texte = réduit', () => {
    expect(isLibraryCollapsed(button('<button><svg></svg></button>'))).toBe(true);
    expect(isLibraryCollapsed(button('<button>Votre bibliothèque</button>'))).toBe(false);
  });
  it('aria-expanded prioritaire', () => {
    expect(isLibraryCollapsed(button('<button aria-expanded="true"></button>'))).toBe(false);
    expect(isLibraryCollapsed(button('<button aria-expanded="false">x</button>'))).toBe(true);
    expect(isLibraryCollapsed(null)).toBe(false);
  });
});

describe('classifyAreas', () => {
  const html = `
    <div id="grid">
      <div id="top"><a href="/">Accueil</a></div>
      <nav id="Desktop_LeftSidebar_Id"></nav>
      <div id="resizer"></div>
      <div id="main"><section>contenu</section></div>
      <div id="right"><div id="Desktop_PanelContainer_Id"></div></div>
      <div id="bar"><button data-testid="control-button-playpause"></button></div>
    </div>`;
  /** Géométrie factice (jsdom ne calcule pas de layout). */
  const rects = {
    top: { top: 0, width: 400, height: 64 },
    resizer: { top: 64, width: 8, height: 700 },
    main: { top: 64, width: 120, height: 700 },
  };
  const rect = (el) => rects[el.id] ?? { top: 0, width: 0, height: 0 };

  it('reconnaît chaque zone', async () => {
    const { classifyAreas } = await import('../src/frame.js');
    document.body.innerHTML = html;
    const roles = classifyAreas(document.getElementById('grid'), rect);
    const byId = Object.fromEntries([...roles].map(([el, role]) => [el.id, role]));
    expect(byId).toEqual({
      top: 'header',
      Desktop_LeftSidebar_Id: 'left',
      resizer: 'hidden',
      main: 'main',
      right: 'hidden',
      bar: 'player',
    });
  });

  it('préfère <main> à la plus grande zone', async () => {
    const { classifyAreas } = await import('../src/frame.js');
    document.body.innerHTML = `<div id="g"><div id="a"></div><div id="b"><main></main></div></div>`;
    const big = (el) => (el.id === 'a' ? { top: 100, width: 999, height: 999 } : rect(el));
    const roles = classifyAreas(document.getElementById('g'), big);
    expect(roles.get(document.getElementById('b'))).toBe('main');
    expect(roles.get(document.getElementById('a'))).toBe('hidden');
  });

  it('tagAreas pose les classes', async () => {
    const { tagAreas } = await import('../src/frame.js');
    document.body.innerHTML = html;
    tagAreas(document.getElementById('grid'), rect);
    expect(document.getElementById('grid').classList.contains('sm-grid')).toBe(true);
    expect(document.getElementById('main').className).toBe('sm-area-main');
    expect(document.getElementById('right').className).toBe('sm-area-hidden');
  });
});

describe('findExternalHeader', () => {
  it('trouve la barre du haut placée avant la grille', async () => {
    const { findExternalHeader } = await import('../src/frame.js');
    document.body.innerHTML = `
      <div id="root">
        <div id="nav"><a href="/">Accueil</a></div>
        <div id="wrap"><div id="grid"></div></div>
      </div>`;
    const rect = (el) =>
      el.id === 'nav' ? { top: 0, width: 400, height: 64 } : { top: 0, width: 0, height: 0 };
    expect(findExternalHeader(document.getElementById('grid'), rect)?.id).toBe('nav');
  });

  it('ignore les frères trop hauts ou sans lien', async () => {
    const { findExternalHeader } = await import('../src/frame.js');
    document.body.innerHTML = `<div id="big"><a href="/x">x</a></div><div id="plain"></div><div id="grid"></div>`;
    const rect = (el) => ({ top: 0, width: 400, height: el.id === 'big' ? 900 : 40 });
    expect(findExternalHeader(document.getElementById('grid'), rect)).toBeNull();
  });
});
