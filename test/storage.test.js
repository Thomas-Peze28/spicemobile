import { describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../src/config.js';
import { isDebug, isEnabled, readFlag, saveDebug, saveEnabled, writeFlag } from '../src/storage.js';

function memoryStore(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

const throwingStore = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('readFlag', () => {
  it('renvoie la valeur par défaut si la clé est absente', () => {
    expect(readFlag('k', true, memoryStore())).toBe(true);
    expect(readFlag('k', false, memoryStore())).toBe(false);
  });

  it.each([
    ['1', true],
    ['true', true],
    [' TRUE ', true],
    ['0', false],
    ['false', false],
  ])('lit %j comme %s', (raw, expected) => {
    expect(readFlag('k', !expected, memoryStore({ k: raw }))).toBe(expected);
  });

  it('ignore une valeur inconnue', () => {
    expect(readFlag('k', true, memoryStore({ k: 'peut-être' }))).toBe(true);
  });

  it('tolère un stockage absent ou qui lève une exception', () => {
    expect(readFlag('k', true, null)).toBe(true);
    expect(readFlag('k', false, throwingStore)).toBe(false);
  });

  it('utilise localStorage par défaut', () => {
    localStorage.setItem('sm-test', '0');
    expect(readFlag('sm-test', true)).toBe(false);
    localStorage.removeItem('sm-test');
  });
});

describe('writeFlag', () => {
  it('écrit 1 / 0', () => {
    const store = memoryStore();
    expect(writeFlag('a', true, store)).toBe(true);
    expect(writeFlag('b', false, store)).toBe(true);
    expect(store.data).toEqual({ a: '1', b: '0' });
  });

  it('renvoie false si le stockage est indisponible', () => {
    expect(writeFlag('a', true, null)).toBe(false);
    expect(writeFlag('a', true, throwingStore)).toBe(false);
  });
});

describe('préférences SpiceMobile', () => {
  it('vue mobile activée par défaut, désactivable et mémorisée', () => {
    const store = memoryStore();
    expect(isEnabled(store)).toBe(true);
    saveEnabled(false, store);
    expect(store.data[STORAGE_KEYS.enabled]).toBe('0');
    expect(isEnabled(store)).toBe(false);
    saveEnabled(true, store);
    expect(isEnabled(store)).toBe(true);
  });

  it('compatibilité v0.1 : seule la valeur "0" désactive', () => {
    expect(isEnabled(memoryStore({ [STORAGE_KEYS.enabled]: '1' }))).toBe(true);
    expect(isEnabled(memoryStore({ [STORAGE_KEYS.enabled]: '0' }))).toBe(false);
  });

  it('debug désactivé par défaut, activable', () => {
    const store = memoryStore();
    expect(isDebug(store)).toBe(false);
    saveDebug(true, store);
    expect(isDebug(store)).toBe(true);
  });

  it('tout reste utilisable si le stockage lève une exception', () => {
    expect(isEnabled(throwingStore)).toBe(true);
    expect(isDebug(throwingStore)).toBe(false);
    expect(saveEnabled(false, throwingStore)).toBe(false);
  });
});
