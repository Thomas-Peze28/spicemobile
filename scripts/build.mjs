/**
 * Build de SpiceMobile.
 *
 *   node scripts/build.mjs          -> dist/spicemobile.user.js
 *   node scripts/build.mjs --watch  -> rebuild à chaque modification
 *                                      + serveur HTTP sur le réseau local
 */
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import * as esbuild from 'esbuild';
import { buildHeader } from './userscript-header.mjs';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const watch = process.argv.includes('--watch');
const DEV_PORT = Number(process.env.PORT) || 8000;

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/main.js'],
  outfile: 'dist/spicemobile.user.js',
  bundle: true,
  format: 'iife',
  target: 'es2022',
  charset: 'utf8',
  legalComments: 'none',
  // Pas de minification : un userscript doit rester lisible par qui l'installe.
  minify: false,
  loader: { '.css': 'text' },
  define: { __SM_VERSION__: JSON.stringify(pkg.version) },
  banner: { js: buildHeader(pkg) },
  logLevel: 'info',
};

function lanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address);
}

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ host: '0.0.0.0', port: DEV_PORT, servedir: 'dist' });
  console.log('\nInstalle le script de dev depuis le téléphone (même Wi-Fi) :');
  for (const ip of lanAddresses()) {
    console.log(`  http://${ip}:${port}/spicemobile.user.js`);
  }
  console.log('');
} else {
  await esbuild.build(options);
}
