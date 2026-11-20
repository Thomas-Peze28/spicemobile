// Health check : vérifie que chaque sélecteur de selectors.js existe sur la page.
// Lancé automatiquement en mode debug, et à la main via SpiceMobile.healthCheck().
//
// Sert à repérer vite ce qui a cassé après une mise à jour du lecteur Spotify.

import { CONFIG } from './config.js';
import { PREFIX } from './log.js';
import { SEL, SELECTORS } from './selectors.js';

/**
 * @typedef {object} SelectorResult
 * @property {string} name        Clé dans SELECTORS.
 * @property {'core' | 'contextual'} group
 * @property {string} description
 * @property {'ok' | 'missing' | 'invalid'} status
 * @property {string | null} matched  Variante trouvée (la première qui correspond).
 * @property {string[]} variants
 * @property {string[]} invalid       Variantes à la syntaxe CSS invalide.
 */

/**
 * Teste chaque sélecteur sur `root` (logique pure : aucun log).
 * @param {Record<string, import('./selectors.js').SelectorEntry>} [selectors]
 * @param {ParentNode} [root]
 * @returns {SelectorResult[]}
 */
export function checkSelectors(selectors = SELECTORS, root = document) {
  return Object.entries(selectors).map(([name, entry]) => {
    let matched = null;
    const invalid = [];
    for (const variant of entry.variants) {
      try {
        if (root.querySelector(variant)) {
          matched = variant;
          break;
        }
      } catch {
        invalid.push(variant);
      }
    }
    let status = 'ok';
    if (!matched) status = invalid.length === entry.variants.length ? 'invalid' : 'missing';
    return {
      name,
      group: entry.group,
      description: entry.description,
      status,
      matched,
      variants: [...entry.variants],
      invalid,
    };
  });
}

/**
 * @param {SelectorResult[]} results
 * @returns {{ total: number, ok: number, missingCore: SelectorResult[], missingContextual: SelectorResult[], invalid: SelectorResult[], healthy: boolean }}
 */
export function summarize(results) {
  const notFound = results.filter((r) => r.status !== 'ok');
  const missingCore = notFound.filter((r) => r.group === 'core');
  const missingContextual = notFound.filter((r) => r.group === 'contextual');
  const invalid = results.filter((r) => r.invalid.length > 0);
  return {
    total: results.length,
    ok: results.length - notFound.length,
    missingCore,
    missingContextual,
    invalid,
    healthy: missingCore.length === 0 && invalid.length === 0,
  };
}

/**
 * Affiche le rapport dans la console.
 * @param {SelectorResult[]} results
 * @param {Pick<Console, 'groupCollapsed' | 'groupEnd' | 'table' | 'warn' | 'info' | 'error' | 'log'>} [out]
 * @returns {ReturnType<typeof summarize>}
 */
export function report(results, out = console) {
  const summary = summarize(results);
  const title = `${PREFIX} Health check : ${summary.ok}/${summary.total} sélecteurs trouvés`;

  out.groupCollapsed(`${title}${summary.healthy ? ' ✔' : ' ✘'}`);
  out.table(
    results.map((r) => ({
      sélecteur: r.name,
      groupe: r.group,
      statut: r.status,
      trouvé: r.matched ?? '—',
      description: r.description,
    })),
  );
  out.groupEnd();

  for (const r of summary.invalid) {
    out.error(`${PREFIX} Syntaxe invalide pour "${r.name}" :`, r.invalid);
  }
  for (const r of summary.missingCore) {
    out.warn(`${PREFIX} Introuvable (core) "${r.name}" — ${r.description}. Essayé :`, r.variants);
  }
  for (const r of summary.missingContextual) {
    out.info(
      `${PREFIX} Absent de cette page (contextual) "${r.name}" — ${r.description}. Essayé :`,
      r.variants,
    );
  }
  if (summary.healthy) out.log(`${PREFIX} Tous les sélecteurs core sont présents.`);
  return summary;
}

/**
 * Attend que le lecteur Spotify soit rendu (barre de lecture présente),
 * ou `timeout` ms au maximum.
 * @param {number} [timeout]
 * @param {Document} [doc]
 * @returns {Promise<boolean>} true si le lecteur est apparu à temps.
 */
export function waitForPlayer(timeout = CONFIG.healthCheckTimeout, doc = document) {
  const ready = () => Boolean(doc.querySelector(SEL.nowPlayingBar));
  if (ready()) return Promise.resolve(true);

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!ready()) return;
      cleanup();
      resolve(true);
    });
    const timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeout);
    function cleanup() {
      observer.disconnect();
      clearTimeout(timer);
    }
    observer.observe(doc.documentElement, { childList: true, subtree: true });
  });
}

/**
 * Lance le health check et affiche le rapport.
 * @param {{ wait?: boolean }} [options] wait : attendre le rendu du lecteur d'abord.
 * @returns {Promise<SelectorResult[]>}
 */
export async function runHealthCheck({ wait = true } = {}) {
  if (wait) {
    const rendered = await waitForPlayer();
    if (!rendered) {
      console.warn(
        `${PREFIX} Lecteur non détecté après ${CONFIG.healthCheckTimeout} ms : le check tourne quand même.`,
      );
    }
  }
  const results = checkSelectors();
  report(results);
  return results;
}
