// Préférences mémorisées dans localStorage. Toutes les fonctions tolèrent un
// stockage indisponible (mode privé, quota, sécurité) et retombent sur la
// valeur par défaut.

import { CONFIG, STORAGE_KEYS } from './config.js';

/** @typedef {Pick<Storage, 'getItem' | 'setItem'>} StorageLike */

/** @returns {StorageLike | null} */
function defaultStore() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const TRUE_VALUES = new Set(['1', 'true']);
const FALSE_VALUES = new Set(['0', 'false']);

/**
 * Lit un booléen. Toute valeur inconnue ou absente donne `fallback`.
 * @param {string} key
 * @param {boolean} fallback
 * @param {StorageLike | null} [store]
 * @returns {boolean}
 */
export function readFlag(key, fallback, store = defaultStore()) {
  try {
    const raw = store?.getItem(key);
    if (raw == null) return fallback;
    const value = String(raw).trim().toLowerCase();
    if (TRUE_VALUES.has(value)) return true;
    if (FALSE_VALUES.has(value)) return false;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Écrit un booléen ('1' / '0').
 * @param {string} key
 * @param {boolean} value
 * @param {StorageLike | null} [store]
 * @returns {boolean} true si l'écriture a réussi.
 */
export function writeFlag(key, value, store = defaultStore()) {
  try {
    if (!store) return false;
    store.setItem(key, value ? '1' : '0');
    return true;
  } catch {
    return false;
  }
}

/** Vue mobile activée ? (oui par défaut) */
export const isEnabled = (store) => readFlag(STORAGE_KEYS.enabled, true, store);
export const saveEnabled = (on, store) => writeFlag(STORAGE_KEYS.enabled, on, store);

/** Mode debug ? Activable sans rebuild : localStorage['spicemobile:debug'] = '1'. */
export const isDebug = (store) => readFlag(STORAGE_KEYS.debug, CONFIG.debug, store);
export const saveDebug = (on, store) => writeFlag(STORAGE_KEYS.debug, on, store);

/** Maintien de la lecture écran éteint (son inaudible) ? (oui par défaut) */
export const isKeepAlive = (store) => readFlag(STORAGE_KEYS.keepAlive, true, store);
export const saveKeepAlive = (on, store) => writeFlag(STORAGE_KEYS.keepAlive, on, store);
