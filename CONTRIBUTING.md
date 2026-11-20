# Contribuer à SpiceMobile

Merci de ton intérêt ! Ce guide explique comment préparer l'environnement,
corriger un sélecteur cassé et proposer une fonctionnalité.

## Règles du projet

SpiceMobile agit **uniquement sur le DOM et le CSS** du lecteur web.

- Pas de blocage de pub : c'est le rôle d'uBlock Origin.
- Pas d'accès aux modules internes, au webpack ou à l'APK de Spotify.
- Aucun contournement de DRM.
- Aucune navigation qui recharge la page : la musique s'arrêterait.
  Clique sur un lien Spotify existant ou passe par `navigate()` (`src/history.js`).
- Aucune dépendance au runtime : seulement des `devDependencies`.

## Environnement

Node.js 20.11 ou plus récent (voir `.nvmrc`).

```bash
npm install
npm run dev      # rebuild à chaque modification + serveur sur le réseau local
npm run lint     # ESLint + vérification Prettier
npm run format   # corrige le formatage
npm test         # Vitest
npm run build    # dist/spicemobile.user.js
```

## Corriger un sélecteur cassé

1. Active le mode debug sur le téléphone, puis recharge la page :
   `localStorage['spicemobile:debug'] = '1'`.
2. Lis le rapport du health check dans la console distante. Tu peux le relancer
   sur une autre page avec `SpiceMobile.healthCheck()`.
3. Inspecte l'élément et trouve un sélecteur stable : `data-testid`, `aria-*`
   ou classes `Root__*`. Évite les classes générées (`.e-9541-…`) : elles changent à chaque build.
4. Ajoute-le en **première** variante de l'entrée dans `src/selectors.js`.
   Garde l'ancienne variante tant qu'elle peut encore servir (déploiement progressif côté Spotify).
5. Si le sélecteur est aussi utilisé dans le CSS, mets à jour `src/styles/`.
   Le test `selectors-css` échoue si un sélecteur du CSS n'est pas déclaré dans `selectors.js`.

## Ajouter une fonctionnalité

Voir la section « Ajouter une feature » du README. En résumé : un module dans `src/`,
une feuille dans `src/styles/`, les sélecteurs dans `src/selectors.js`, des tests
sur la logique pure, puis l'appel dans `src/main.js`.

## Commits et PR

- Messages au format [Conventional Commits](https://www.conventionalcommits.org/fr/) :
  `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `build:`, `ci:`, `chore:`.
  Exemple : `fix(selectors): nouveau data-testid pour la barre de lecture`.
- Une PR par sujet. Remplis le template et ajoute une entrée dans `CHANGELOG.md` (`Unreleased`).
- La CI doit être verte.

## Publier une version (mainteneur)

1. Déplace les entrées `Unreleased` du CHANGELOG sous `## [x.y.z] - AAAA-MM-JJ`.
2. `npm version x.y.z --no-git-tag-version`, puis commit `chore(release): vx.y.z`.
3. `git tag vx.y.z && git push --follow-tags`.
4. Le workflow Release vérifie que le tag correspond à `package.json`, construit le script
   et l'attache à la GitHub Release. Tampermonkey propose ensuite la mise à jour.
