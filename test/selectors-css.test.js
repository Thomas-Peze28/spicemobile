import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SEL, SELECTORS, selectorOf } from '../src/selectors.js';

const stylesDir = join(import.meta.dirname, '../src/styles');
const cssFiles = readdirSync(stylesDir).filter((file) => file.endsWith('.css'));
const declared = Object.values(SELECTORS).flatMap((entry) => entry.variants);

/** Fragments propres au DOM Spotify : classes Root__*, data-testid, ids Spotify. */
function spotifyTokens(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const patterns = [
    /\.Root__[\w-]+/g,
    /\[data-testid[\^$*]?="[^"]+"\]/g,
    /#(?!sm-)[A-Za-z][\w-]*/g,
  ];
  return [...new Set(patterns.flatMap((re) => withoutComments.match(re) ?? []))].filter(
    (token) => !/^#[0-9a-f]{3,8}$/i.test(token), // couleurs hexadécimales
  );
}

describe('selectors.js', () => {
  it('chaque entrée est bien formée et sa syntaxe valide', () => {
    for (const [name, entry] of Object.entries(SELECTORS)) {
      expect(entry.variants.length, name).toBeGreaterThan(0);
      expect(['core', 'contextual'], name).toContain(entry.group);
      expect(entry.description, name).toBeTruthy();
      for (const variant of entry.variants) {
        expect(() => document.querySelector(variant), `${name}: ${variant}`).not.toThrow();
      }
    }
  });

  it('SEL combine les variantes', () => {
    expect(SEL.leftSidebar).toBe('.Root__nav-bar, #Desktop_LeftSidebar_Id');
    expect(() => selectorOf('inexistant')).toThrow();
  });

  it.each(cssFiles)('tous les sélecteurs Spotify de %s sont déclarés', (file) => {
    const css = readFileSync(join(stylesDir, file), 'utf8');
    const missing = spotifyTokens(css).filter(
      (token) => !declared.some((variant) => variant.includes(token)),
    );
    expect(missing).toEqual([]);
  });
});
