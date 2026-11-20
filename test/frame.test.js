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
