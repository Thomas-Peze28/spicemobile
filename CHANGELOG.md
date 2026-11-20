# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/).

## [Unreleased]

## [0.2.6] - 2026-11-20

### Modifié

- Barre de lecture réorganisée en lignes pleine largeur : pochette, titre et artiste ;
  boutons de lecture ; progression ; puis file d'attente et appareils à gauche, volume
  à droite. Le titre n'est plus tronqué par le volume.

## [0.2.5] - 2026-11-20

### Corrigé

D'après le diagnostic de la vraie page (Firefox Android) :

- Barre de lecture cachée sous la barre du bas : Spotify impose une hauteur minimale
  à sa grille, qui annulait la limite de SpiceMobile (`min-height: 0` forcé).
- Boutons de lecture et progression invisibles (colonne centrale à 0 px) :
  `now-playing-widget` n'existe plus. La rangée de la barre de lecture est maintenant
  trouvée à partir du bouton lecture, sans ce repère.
- Barre du haut de Spotify masquée : une fois masquée, elle mesurait 0 et n'était plus
  reconnue. Elle est maintenant reconnue à son contenu (liens, boutons), après le contenu
  principal (`<main>` ou `#main-view`).

## [0.2.4] - 2026-11-20

### Corrigé

- La barre du bas SpiceMobile pouvait être prise pour la barre du haut de Spotify
  et se retrouver en haut de l'écran : les éléments SpiceMobile sont maintenant ignorés.
- Barre de lecture toujours coupée en bas : quand Spotify la place hors de la grille
  de mise en page, SpiceMobile la fixe au-dessus de la barre du bas.

### Ajouté

- Diagnostic de mise en page : appui long sur « Vue PC » (ou `SpiceMobile.diag()`).
  Affiche la structure de la page, avec un bouton pour la copier et la joindre à un ticket.

## [0.2.3] - 2026-11-20

### Corrigé

- Barre de lecture coupée sous la barre du bas et barre du haut de Spotify invisible :
  la barre du haut est hors de la grille de mise en page. SpiceMobile la repère, la fixe
  en haut de l'écran, et fixe la grille entre elle et la barre du bas.

### Modifié

- Le volume est de nouveau affiché, en version compacte, à droite du titre en cours.
  Les boutons paroles, plein écran, mini-lecteur et « En cours de lecture » restent masqués.

## [0.2.2] - 2026-11-20

### Corrigé

- Vue mobile toujours en colonnes (contenu écrasé à gauche, barre de lecture coupée) :
  Spotify n'utilise plus les classes `Root__*`. SpiceMobile repère maintenant la grille
  de mise en page à partir de la bibliothèque, classe ses zones d'après leur contenu
  et les réempile en une seule colonne.

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

[Unreleased]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.6...HEAD
[0.2.6]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/Thomas-Peze28/spicemobile/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Thomas-Peze28/spicemobile/releases/tag/v0.2.0
