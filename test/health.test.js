import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkSelectors, report, summarize, waitForPlayer } from '../src/health.js';
import { SELECTORS } from '../src/selectors.js';

const FIXTURE = {
  bar: { variants: ['.old-bar', '[data-testid="bar"]'], group: 'core', description: 'Barre' },
  gone: { variants: ['#gone'], group: 'core', description: 'Disparu' },
  row: { variants: ['.row'], group: 'contextual', description: 'Ligne' },
  broken: { variants: ['[[nope'], group: 'core', description: 'Cassé' },
};

function fakeConsole() {
  return {
    groupCollapsed: vi.fn(),
    groupEnd: vi.fn(),
    table: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('checkSelectors', () => {
  it('indique la variante trouvée, les absents et les syntaxes invalides', () => {
    document.body.innerHTML = '<div data-testid="bar"></div>';
    const results = Object.fromEntries(checkSelectors(FIXTURE).map((r) => [r.name, r]));

    expect(results.bar).toMatchObject({ status: 'ok', matched: '[data-testid="bar"]' });
    expect(results.gone).toMatchObject({ status: 'missing', matched: null, group: 'core' });
    expect(results.row).toMatchObject({ status: 'missing', group: 'contextual' });
    expect(results.broken).toMatchObject({ status: 'invalid', invalid: ['[[nope'] });
  });

  it('préfère la première variante si plusieurs correspondent', () => {
    document.body.innerHTML = '<div class="old-bar"></div><div data-testid="bar"></div>';
    const [bar] = checkSelectors({ bar: FIXTURE.bar });
    expect(bar.matched).toBe('.old-bar');
  });

  it('couvre par défaut tous les sélecteurs de selectors.js', () => {
    const names = checkSelectors().map((r) => r.name);
    expect(names).toEqual(Object.keys(SELECTORS));
  });
});

describe('summarize', () => {
  it('sépare core et contextual', () => {
    document.body.innerHTML = '<div data-testid="bar"></div>';
    const summary = summarize(checkSelectors(FIXTURE));
    expect(summary.total).toBe(4);
    expect(summary.ok).toBe(1);
    expect(summary.missingCore.map((r) => r.name)).toEqual(['gone', 'broken']);
    expect(summary.missingContextual.map((r) => r.name)).toEqual(['row']);
    expect(summary.invalid.map((r) => r.name)).toEqual(['broken']);
    expect(summary.healthy).toBe(false);
  });

  it('est sain si seuls des contextual manquent', () => {
    document.body.innerHTML = '<div data-testid="bar"></div>';
    const { bar, row } = FIXTURE;
    expect(summarize(checkSelectors({ bar, row })).healthy).toBe(true);
  });
});

describe('report', () => {
  it('liste les sélecteurs introuvables dans la console', () => {
    document.body.innerHTML = '<div data-testid="bar"></div>';
    const out = fakeConsole();
    report(checkSelectors(FIXTURE), out);

    expect(out.table).toHaveBeenCalledOnce();
    expect(out.warn).toHaveBeenCalledTimes(2);
    expect(out.warn.mock.calls[0][0]).toContain('"gone"');
    expect(out.info).toHaveBeenCalledOnce();
    expect(out.info.mock.calls[0][0]).toContain('"row"');
    expect(out.error).toHaveBeenCalledOnce();
    expect(out.log).not.toHaveBeenCalled();
  });

  it('confirme quand tout va bien', () => {
    document.body.innerHTML = '<div data-testid="bar"></div>';
    const out = fakeConsole();
    report(checkSelectors({ bar: FIXTURE.bar }), out);
    expect(out.warn).not.toHaveBeenCalled();
    expect(out.log).toHaveBeenCalledOnce();
  });
});

describe('waitForPlayer', () => {
  it('résout tout de suite si la barre de lecture est déjà là', async () => {
    document.body.innerHTML = '<div data-testid="now-playing-bar"></div>';
    await expect(waitForPlayer(50)).resolves.toBe(true);
  });

  it('attend que la barre de lecture apparaisse', async () => {
    const pending = waitForPlayer(1000);
    setTimeout(() => {
      document.body.innerHTML = '<footer class="Root__now-playing-bar"></footer>';
    }, 10);
    await expect(pending).resolves.toBe(true);
  });

  it('abandonne après le délai', async () => {
    await expect(waitForPlayer(20)).resolves.toBe(false);
  });
});
