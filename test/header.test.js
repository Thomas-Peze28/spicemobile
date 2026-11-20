import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildHeader, repoUrls } from '../scripts/userscript-header.mjs';

const pkg = JSON.parse(readFileSync(join(import.meta.dirname, '../package.json'), 'utf8'));

const field = (header, key) =>
  header
    .split('\n')
    .filter((line) => line.startsWith(`// @${key} `))
    .map((line) => line.slice(`// @${key} `.length).trim());

describe('buildHeader', () => {
  const header = buildHeader(pkg);

  it('encadre les métadonnées', () => {
    expect(header.startsWith('// ==UserScript==\n')).toBe(true);
    expect(header.trimEnd().endsWith('// ==/UserScript==')).toBe(true);
  });

  it('reprend version et description de package.json', () => {
    expect(field(header, 'version')).toEqual([pkg.version]);
    expect(field(header, 'description')).toEqual([pkg.description]);
    expect(field(header, 'match')).toEqual(pkg.userscript.match);
    expect(field(header, 'grant')).toEqual(['none']);
    expect(field(header, 'run-at')).toEqual(['document-start']);
  });

  it('dérive les URL de mise à jour du pseudo GitHub', () => {
    const { githubUser, repo } = pkg.userscript;
    const expected = `https://github.com/${githubUser}/${repo}/releases/latest/download/spicemobile.user.js`;
    expect(field(header, 'updateURL')).toEqual([expected]);
    expect(field(header, 'downloadURL')).toEqual([expected]);
    expect(field(header, 'namespace')).toEqual([`https://github.com/${githubUser}/${repo}`]);
  });

  it('ne cite le pseudo qu’à travers userscript.githubUser', () => {
    const custom = { ...pkg, userscript: { ...pkg.userscript, githubUser: 'octocat' } };
    const out = buildHeader(custom);
    expect(out).not.toContain(pkg.userscript.githubUser);
    expect(repoUrls(custom).update).toContain('/octocat/');
  });

  it('refuse un package.json incomplet', () => {
    expect(() => buildHeader({ ...pkg, userscript: { name: 'X' } })).toThrow(/githubUser/);
    expect(() => buildHeader({ ...pkg, version: '' })).toThrow(/@version/);
  });
});
