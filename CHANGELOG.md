# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/).

## [Unreleased]

## [0.2.1] - 2026-11-20

### Corrigé

- Vue mobile : le contenu s'affichait dans une colonne étroite, à côté du panneau
  « En cours de lecture ». Chaque zone est maintenant fixée à l'écran (barre du haut,
  contenu, barre de lecture, barre du bas), sans dépendre de la grille de Spotify.
- Le panneau de droite et les poignées de redimensionnement sont masqués.
- La barre de lecture n'est plus coupée sous la barre du bas : elle tient sur deux lignes
  (titre, puis boutons et progression) et sa colonne de droite est masquée.
- Le tiroir Bibliothèque déplie la bibliothèque si Spotify l'affichait réduite
  (pochettes seules, sans les noms).

## [0.2.0] - 2026-11-20

### Ajouté

- Health check des sélecteurs : en mode debug (`localStorage['spicemobile:debug'] = '1'`),
  la console liste les sélecteurs de `src/selectors.js` introuvables sur la page,
  en distinguant `core` (toujours attendus) et `contextual` (selon la page).
- API de console `window.SpiceMobile` : `healthCheck()`, `debug()`, `mobile()`, `version`.
- Mode debug activable sans rebuild, via `localStorage`.
- Build esbuild vers un fichier unique `dist/spicemobile.user.js`, CSS inliné,
  en-tête `==UserScript==` généré depuis `package.json`.
- `npm run dev` : rebuild automatique et serveur local pour installer le script
  depuis le téléphone.
- ESLint, Prettier, tests Vitest + jsdom.
- CI GitHub Actions (lint, test, build) et publication automatique des releases sur tag `v*`.
- LICENSE (MIT), CONTRIBUTING.md, templates d'issue « sélecteur cassé » et de PR.
- Attributs d'accessibilité sur la barre du bas (`aria-current`, `aria-label`).

### Modifié

- Code découpé en modules ES : un fichier par fonctionnalité.
- Tous les sélecteurs Spotify centralisés dans `src/selectors.js`, avec plusieurs
  variantes possibles par élément.
- CSS déplacé dans `src/styles/`, une feuille par fonctionnalité.
- `@updateURL` et `@downloadURL` pointent vers la dernière GitHub Release
  (`releases/latest/download/spicemobile.user.js`).
- Le swipe ignore les gestes à plusieurs doigts et les gestes annulés (`touchcancel`).

## 0.1.0 - 2026-11-20

Version initiale, distribuée hors GitHub Releases.

### Ajouté

- Layout une colonne à la largeur de l'écran.
- Bibliothèque (sidebar gauche) en tiroir plein écran.
- Barre de navigation en bas : Accueil, Recherche, Biblio, Vue PC.
- Boutons de lecture agrandis (44 px minimum), volume masqué.
- Listes de titres simplifiées : numéro, titre, durée.
- Swipe sur la barre de lecture : gauche = suivant, droite = précédent.
- Bascule vue mobile / vue PC, mémorisée dans `localStorage`.

[Unreleased]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Thomas-Peze28/spicemobile/releases/tag/v0.2.0
