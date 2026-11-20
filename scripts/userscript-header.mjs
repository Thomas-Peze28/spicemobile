/**
 * Génère l'en-tête ==UserScript== à partir de package.json.
 *
 * Le pseudo GitHub n'est défini qu'à un seul endroit : `userscript.githubUser`.
 * Toutes les URL (namespace, page d'accueil, mises à jour) en sont dérivées.
 */

const RELEASE_ASSET = 'spicemobile.user.js';

/**
 * @param {object} pkg Contenu de package.json.
 * @returns {Record<string, string>} URL dérivées du dépôt GitHub.
 */
export function repoUrls(pkg) {
  const { githubUser, repo } = pkg.userscript ?? {};
  if (!githubUser || !repo) {
    throw new Error(
      'package.json : "userscript.githubUser" et "userscript.repo" sont obligatoires.',
    );
  }
  const base = `https://github.com/${githubUser}/${repo}`;
  return {
    homepage: base,
    support: `${base}/issues`,
    update: `${base}/releases/latest/download/${RELEASE_ASSET}`,
  };
}

/**
 * @param {object} pkg Contenu de package.json.
 * @returns {string} Bloc de commentaires ==UserScript== complet.
 */
export function buildHeader(pkg) {
  const meta = pkg.userscript ?? {};
  const urls = repoUrls(pkg);

  /** @type {Array<[string, string]>} */
  const entries = [
    ['name', meta.name ?? pkg.name],
    ['namespace', urls.homepage],
    ['version', pkg.version],
    ['description', pkg.description],
    ['author', pkg.author],
    ['license', pkg.license],
    ['homepageURL', urls.homepage],
    ['supportURL', urls.support],
    ...(meta.match ?? []).map((m) => ['match', m]),
    ['run-at', meta.runAt ?? 'document-idle'],
    ...(meta.grant ?? ['none']).map((g) => ['grant', g]),
    ['updateURL', urls.update],
    ['downloadURL', urls.update],
  ];

  for (const [key, value] of entries) {
    if (value === undefined || value === '') {
      throw new Error(`En-tête userscript : la valeur de @${key} est vide.`);
    }
  }

  const width = Math.max(...entries.map(([key]) => key.length)) + 2;
  const lines = entries.map(([key, value]) => `// @${key.padEnd(width - 1)}${value}`);
  return ['// ==UserScript==', ...lines, '// ==/UserScript==', ''].join('\n');
}
