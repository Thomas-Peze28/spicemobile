# SpiceMobile

[![CI](https://github.com/Thomas-Peze28/spicemobile/actions/workflows/ci.yml/badge.svg)](https://github.com/Thomas-Peze28/spicemobile/actions/workflows/ci.yml)
[![Dernière version](https://img.shields.io/github/v/release/Thomas-Peze28/spicemobile)](https://github.com/Thomas-Peze28/spicemobile/releases/latest)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

Un « Spicetify mobile » : un userscript qui rend le lecteur web Spotify (`open.spotify.com`)
agréable à utiliser sur un téléphone Android.

Le setup visé :

- **Firefox Android**, pour les modules complémentaires ;
- **uBlock Origin**, qui bloque les pubs ;
- **Tampermonkey**, qui exécute SpiceMobile.

Le lecteur web gratuit permet déjà les skips illimités et la lecture dans l'ordre.
SpiceMobile ne touche pas à ça : son seul rôle est l'**interface mobile**.

## Aperçu

<!--
  Captures à ajouter dans docs/screenshots/ (PNG, largeur ~400 px), puis remplacer
  chaque cellule « à venir » par l'image, par exemple :
  ![Accueil](docs/screenshots/accueil.png)
-->

| Accueil                                    | Bibliothèque (tiroir)                     | Playlist                                    | Vue PC + bouton « Mob »                   |
| ------------------------------------------ | ----------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| _À venir : `docs/screenshots/accueil.png`_ | _À venir : `docs/screenshots/tiroir.png`_ | _À venir : `docs/screenshots/playlist.png`_ | _À venir : `docs/screenshots/vue-pc.png`_ |

## Fonctionnalités

- Mise en page en **une colonne**, à la largeur de l'écran.
- **Bibliothèque** (sidebar gauche) transformée en tiroir plein écran.
  Il se referme tout seul quand on choisit une playlist.
- **Barre de navigation en bas** : Accueil, Recherche, Biblio, Vue PC.
- **Gros boutons** de lecture (44 px minimum). Le volume est masqué : le téléphone a ses boutons.
- **Listes de titres** simplifiées : numéro, titre, durée.
- **Swipe** sur la barre de lecture : vers la gauche pour le titre suivant,
  vers la droite pour le précédent. La barre de progression reste utilisable.
- **Bascule vue mobile / vue PC**, mémorisée d'une visite à l'autre.
  En vue PC, un bouton vert « Mob » permet de revenir en vue mobile.
- **Health check** des sélecteurs en mode debug, pour repérer vite ce qui a cassé
  après une mise à jour de Spotify.

SpiceMobile agit uniquement sur le DOM et le CSS de la page. Il ne bloque pas les pubs
(c'est le rôle d'uBlock Origin), ne touche ni à l'application Spotify ni à son code interne,
et ne contourne aucun DRM.

## Installation sur Android

1. **Firefox** : installe [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox)
   depuis le Play Store.
2. **uBlock Origin** : dans Firefox, menu ⋮ > **Modules complémentaires** >
   **Découvrir plus de modules**, cherche « uBlock Origin », puis **Ajouter à Firefox**.
3. **Tampermonkey** : même chemin, cherche « Tampermonkey », puis **Ajouter à Firefox**.
   Violentmonkey fonctionne aussi.
4. **SpiceMobile** : ouvre ce lien dans Firefox :
   <https://github.com/Thomas-Peze28/spicemobile/releases/latest/download/spicemobile.user.js>.
   Tampermonkey affiche la page d'installation : appuie sur **Installer**.
5. **Connexion** : ouvre <https://open.spotify.com> et connecte-toi.
6. **DRM** : la première lecture déclenche une demande d'autorisation du contenu protégé par DRM
   (Widevine). Accepte : sans ça, il n'y a pas de son. Si tu as refusé par erreur :
   cadenas à gauche de l'adresse > autorisations du site > **Contenu protégé par DRM** > Autoriser.
7. **Page « Ouvrir l'appli »** : si Spotify l'affiche à la place du lecteur, active
   **Version ordinateur** dans le menu ⋮ de Firefox.
8. **Lecture en arrière-plan** : Paramètres Android > **Applications** > **Firefox** > **Batterie** >
   **Non restreinte**. Sans ça, Android peut couper la musique écran éteint.
   Le chemin exact varie selon la surcouche (One UI, MIUI…).

### Mises à jour

Le script contient `@updateURL` et `@downloadURL`, qui pointent vers la dernière GitHub Release.
Tampermonkey vérifie régulièrement s'il y a une nouvelle version. Tu peux aussi forcer
la vérification : tableau de bord Tampermonkey > SpiceMobile > **Rechercher des mises à jour**.

## Utilisation

| Geste / bouton            | Effet                                 |
| ------------------------- | ------------------------------------- |
| Accueil, Recherche        | Navigation sans recharger la page     |
| Biblio                    | Ouvre ou ferme le tiroir bibliothèque |
| Vue PC                    | Repasse à l'interface d'origine       |
| Bouton vert « Mob »       | Revient à la vue mobile               |
| Swipe gauche sur la barre | Titre suivant                         |
| Swipe droite sur la barre | Titre précédent                       |

## Débogage

Spotify change régulièrement son DOM. Quand une partie de l'interface ne s'applique plus,
c'est presque toujours un sélecteur de `src/selectors.js` qui ne correspond plus.

### 1. Inspecter le téléphone depuis Ubuntu

1. **Options pour développeurs** : Paramètres Android > **À propos du téléphone**,
   appuie 7 fois sur **Numéro de build**.
2. **Débogage USB** : Paramètres > Système > **Options pour développeurs** > **Débogage USB**.
3. **Firefox Android** : Paramètres > **Débogage USB distant** (section Avancé). Active-le.
4. **Ubuntu** : installe `adb` si Firefox ne voit pas le téléphone :

   ```bash
   sudo apt install adb
   ```

5. Branche le téléphone en USB et accepte l'empreinte du PC sur le téléphone.
6. Dans Firefox sur Ubuntu, ouvre `about:debugging`, puis **Configurer** si besoin,
   et **Connecter** en face de ton téléphone dans la colonne de gauche.
7. Clique sur le téléphone, puis sur **Inspecter** en face de l'onglet `open.spotify.com`.
   Tu as les DevTools complets (Inspecteur, Console, Réseau) sur la page du téléphone.

### 2. Lancer le health check

Dans la console distante :

```js
localStorage['spicemobile:debug'] = '1'; // ou SpiceMobile.debug(true)
location.reload();
```

Au chargement, SpiceMobile attend que la barre de lecture apparaisse, puis affiche :

- un tableau repliable `[SpiceMobile] Health check : 17/19 sélecteurs trouvés`, avec
  pour chaque entrée son groupe, son statut et la variante trouvée ;
- un **avertissement** par sélecteur `core` introuvable. Ceux-là doivent toujours exister :
  c'est ce qui a cassé ;
- une **info** par sélecteur `contextual` absent. C'est normal selon la page
  (par exemple, pas de `tracklistRow` sur l'accueil) ;
- une **erreur** si une variante a une syntaxe CSS invalide.

Pour vérifier une autre page sans recharger (une playlist, par exemple), tape
`SpiceMobile.healthCheck()`. Pour désactiver le mode debug : `SpiceMobile.debug(false)`.

Autres commandes de console :

| Commande                    | Effet                                 |
| --------------------------- | ------------------------------------- |
| `SpiceMobile.version`       | Version installée                     |
| `SpiceMobile.healthCheck()` | Vérifie les sélecteurs sur la page    |
| `SpiceMobile.debug(true)`   | Active les logs `[SpiceMobile]`       |
| `SpiceMobile.mobile(false)` | Passe en vue PC (`true` : vue mobile) |
| `SpiceMobile.selectors`     | Liste des sélecteurs et variantes     |

### 3. Corriger le sélecteur

Inspecte l'élément concerné, choisis un sélecteur stable (`data-testid`, `aria-*`,
classes `Root__*`, jamais une classe générée) et ajoute-le en première variante dans
`src/selectors.js`. Le détail est dans [CONTRIBUTING.md](CONTRIBUTING.md).
Si tu ne sais pas corriger, ouvre une issue « Sélecteur cassé » avec la sortie du health check.

### Tester une modification sur le téléphone

```bash
npm run dev
```

Le terminal affiche une adresse du type `http://192.168.1.20:8000/spicemobile.user.js`.
Ouvre-la dans Firefox Android (même réseau Wi-Fi) : Tampermonkey propose d'installer la version
de développement. Le serveur écoute sur tout le réseau local : ne le lance pas sur un Wi-Fi public.

## Développement

Prérequis : Node.js 20.11 ou plus récent.

```bash
npm install
npm run dev      # rebuild à chaque modification + serveur local
npm run build    # dist/spicemobile.user.js
npm run lint     # ESLint + Prettier (vérification)
npm run format   # Prettier + ESLint (correction)
npm test         # Vitest + jsdom
```

Le pseudo GitHub n'est défini qu'à un endroit : `userscript.githubUser` dans `package.json`.
Le build en dérive `@namespace`, `@homepageURL`, `@supportURL`, `@updateURL` et `@downloadURL`.

## Architecture

```
src/
├── main.js          Point d'entrée : ordre de démarrage
├── config.js        Réglages (seuils du swipe, clés de stockage, classes, ids)
├── selectors.js     TOUS les sélecteurs Spotify (variantes + groupe core/contextual)
├── events.js        Bus d'événements sur window (sm:modechange, sm:drawerchange, sm:locationchange)
├── storage.js       Préférences localStorage, tolérantes aux erreurs
├── log.js           Logs affichés seulement en mode debug
├── dom.js           clickFirst(), onDomReady()
├── layout.js        Vue mobile / PC (classe .sm-on), injection du CSS, bouton « Mob »
├── viewport.js      Balise <meta name="viewport">, resurveillée si Spotify la réécrit
├── drawer.js        Tiroir bibliothèque
├── history.js       Navigation sans rechargement (clic sur lien, sinon History API)
├── nav.js           Barre du bas et onglet actif
├── swipe.js         Détection du swipe sur la barre de lecture
├── health.js        Health check des sélecteurs
├── api.js           window.SpiceMobile (console)
└── styles/          Une feuille CSS par fonctionnalité, inlinée au build
scripts/
├── build.mjs              Build esbuild (et mode --watch avec serveur)
└── userscript-header.mjs  En-tête ==UserScript== généré depuis package.json
test/                      Tests Vitest de la logique pure
```

Principes :

- **Tout le style dépend de `html.sm-on`.** Retirer la classe rend l'interface d'origine,
  sans recharger la page.
- **Les modules ne s'appellent pas en boucle.** Ils se préviennent par événements
  (`events.js`). Exemple : `layout.js` émet `sm:modechange`, `drawer.js` ferme le tiroir
  et `viewport.js` met à jour la balise.
- **Aucun rechargement de page.** Pour naviguer, on clique sur un vrai lien Spotify ;
  à défaut, `history.pushState` + `popstate`, que le routeur de Spotify écoute.
- **Démarrage en deux temps.** À `document-start`, la classe et le CSS sont posés
  pour éviter un flash de l'interface PC. Au `DOMContentLoaded`, la barre du bas,
  le bouton et le viewport sont mis en place.
- **Le CSS est vérifié.** Le test `selectors-css` échoue si une feuille de `src/styles/`
  utilise un sélecteur Spotify absent de `selectors.js`. Ainsi, le health check couvre tout.

## Ajouter une feature

Exemple : un écran « En cours de lecture » plein écran.

1. **Sélecteurs** : déclare dans `src/selectors.js` les éléments Spotify utilisés
   (avec `group` et `description`).
2. **Logique** : crée `src/now-playing.js`. Isole la logique pure dans des fonctions
   exportées sans effet de bord, et la partie DOM dans une fonction `setupNowPlaying()`.
   Pour réagir aux autres modules, écoute leurs événements avec `on(EVENTS.…)`.
3. **Style** : crée `src/styles/now-playing.css`. Préfixe chaque règle par `html.sm-on`,
   puis ajoute la feuille dans `src/styles/index.js`.
4. **Branchement** : appelle `setupNowPlaying()` dans `src/main.js`, avant ou dans
   `onDomReady` selon qu'il faut le `<body>`.
5. **Tests** : ajoute `test/now-playing.test.js` pour la logique pure.
6. **Vérification** : `npm run lint && npm test && npm run build`, puis test sur le
   téléphone avec `npm run dev`.
7. **CHANGELOG** : ajoute une ligne sous `Unreleased`.

## Limites connues

- **Sélecteurs fragiles.** Spotify modifie son DOM sans prévenir. Certains sélecteurs n'ont
  pas encore été vérifiés sur la version actuelle du lecteur : lance le health check.
- **Version ordinateur.** Avec « Version ordinateur » activé, Firefox peut ignorer la balise
  viewport. La page est alors rendue en largeur PC puis réduite : il faut zoomer.
- **Arrière-plan.** La lecture écran éteint dépend des réglages batterie d'Android,
  et certaines surcouches tuent Firefox malgré tout.
- **DRM.** Le lecteur web exige Widevine. Sans autorisation du DRM, pas de son.
  SpiceMobile ne contourne pas cette protection.
- **Interface seulement.** SpiceMobile ne change pas ce que permet le compte gratuit :
  il ne fait qu'adapter l'interface.
- **Pubs.** Le blocage des pubs (par uBlock Origin) va à l'encontre des CGU de Spotify.
  C'est le même risque qu'avec Brave.

## Idées pour la suite

- Écran « En cours de lecture » plein écran (pochette en grand, gros contrôles).
- Thèmes de couleurs configurables, façon Spicetify.
- Système d'extensions : activer ou désactiver chaque module.
- Paroles synchronisées en plein écran.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Les messages de commit suivent
[Conventional Commits](https://www.conventionalcommits.org/fr/).

## Licence

[MIT](LICENSE) © Peze Thomas
