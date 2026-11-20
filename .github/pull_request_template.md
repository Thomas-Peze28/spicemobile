## Résumé

<!-- Ce que change cette PR, et pourquoi. Lien vers l'issue : Fixes #… -->

## Type de changement

- [ ] Correction de sélecteur (mise à jour de Spotify)
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Refactor / outillage / docs

## Vérifications

- [ ] `npm run lint`, `npm test` et `npm run build` passent en local.
- [ ] Testé sur Firefox Android avec le script de `dist/` (préciser la version de Firefox).
- [ ] Tout nouveau sélecteur Spotify est déclaré dans `src/selectors.js`, avec son groupe.
- [ ] `SpiceMobile.healthCheck()` ne signale aucun sélecteur `core` manquant.
- [ ] Aucune navigation qui recharge la page.
- [ ] Rien d'autre que du DOM et du CSS : pas de blocage de pub, pas d'accès aux modules internes de Spotify.
- [ ] `CHANGELOG.md` mis à jour (section `Unreleased`).

## Captures d'écran

<!-- Avant / après sur téléphone, si l'interface change. -->
