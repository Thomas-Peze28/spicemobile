import { isDebug } from './storage.js';

const PREFIX = '[SpiceMobile]';

/** Log affiché uniquement en mode debug. */
export function log(...args) {
  if (isDebug()) console.log(PREFIX, ...args);
}

/** Avertissement affiché uniquement en mode debug. */
export function warn(...args) {
  if (isDebug()) console.warn(PREFIX, ...args);
}

export { PREFIX };
