# SpiceMobile

Un « Spicetify » pour mobile : un userscript qui transforme le lecteur web Spotify (`open.spotify.com`) en interface pensée pour le téléphone.

## Fonctionnalités (v0.1)

- Mise en page en une colonne, à la largeur de l'écran.
- Bibliothèque (sidebar gauche) transformée en tiroir plein écran.
- Barre de navigation en bas : Accueil, Recherche, Biblio, Vue PC.
- Boutons de lecture agrandis (au moins 44 px), volume masqué.
- Listes de titres simplifiées : numéro, titre, durée.
- Swipe sur la barre de lecture : vers la gauche pour le titre suivant, vers la droite pour le précédent.
- Bascule entre vue mobile et vue PC, mémorisée d'une visite à l'autre.

Le blocage des pubs n'est pas dans le script : c'est le rôle d'uBlock Origin.

## Installation sur Android

1. Installe **Firefox** depuis le Play Store.
2. Dans Firefox, installe les modules **uBlock Origin** et **Tampermonkey** (ou **Violentmonkey**).
3. Ouvre l'URL *raw* de `spicemobile.user.js` (sur GitHub) : Tampermonkey propose de l'installer.
4. Ouvre `open.spotify.com` et connecte-toi.
5. Si Firefox demande d'autoriser le contenu protégé par DRM, accepte. Sans ça, il n'y a pas de son.
6. Si Spotify affiche une page « Ouvrir l'appli » au lieu du lecteur, active « Version ordinateur » dans le menu ⋮ de Firefox.
7. Pour que la musique continue en arrière-plan : Paramètres Android > Applis > Firefox > Batterie > « Non restreinte ».

Les champs `@updateURL` et `@downloadURL` pointent vers GitHub. Remplace `VOTRE_PSEUDO` par ton pseudo : Tampermonkey récupérera alors chaque nouvelle version que tu pousses, à condition d'augmenter `@version`.

## Débogage (inspecter le lecteur depuis ton PC)

Spotify change régulièrement son DOM. Pour trouver les bons sélecteurs :

1. Sur le téléphone : active les options pour développeurs et le débogage USB d'Android.
2. Dans Firefox Android : Paramètres > « Débogage distant via USB ».
3. Branche le téléphone au PC, puis ouvre `about:debugging` dans Firefox sur Ubuntu.
4. Connecte l'appareil, puis clique sur « Inspecter » sur l'onglet Spotify : tu as les DevTools complets sur la page du téléphone.

Tous les sélecteurs sont regroupés dans l'objet `SEL` en haut du script, et les styles dans la constante `CSS`. Préfère les attributs stables (`data-testid`, `aria-label`, classes `Root__*`) aux classes générées, qui changent à chaque build.

Mets `CONFIG.debug = true` pour voir des logs `[SpiceMobile]` dans la console.

## Limites connues

- Les sélecteurs n'ont pas encore été vérifiés sur la version actuelle du lecteur. Certains réglages peuvent ne pas s'appliquer avant d'être ajustés.
- En mode « Version ordinateur », Firefox peut ignorer la balise viewport. La page est alors rendue en largeur PC puis réduite : il faut ajuster le zoom.
- Bloquer les pubs va à l'encontre des CGU de Spotify. C'est le même risque qu'avec Brave.

## Idées pour la suite

- Écran « En cours de lecture » plein écran (pochette en grand, gros contrôles).
- Thèmes de couleurs configurables, façon Spicetify.
- Système d'extensions : un module par fonctionnalité, à activer ou désactiver.
- Paroles synchronisées en plein écran.
