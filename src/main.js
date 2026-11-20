(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  const CONFIG = {
    swipeThreshold: 60,   // déplacement horizontal minimum (px) pour un swipe
    swipeMaxVertical: 40, // au-delà, on considère que c'est un scroll
    debug: false,         // true => logs dans la console
  };

  // Tous les sélecteurs du DOM Spotify sont ici.
  // Quand Spotify met à jour son lecteur et que quelque chose casse,
  // c'est (presque) toujours ici qu'il faut corriger. Voir README > Débogage.
  const SEL = {
    topContainer: '.Root__top-container',
    mainView: '.Root__main-view',
    leftSidebar: '.Root__nav-bar, #Desktop_LeftSidebar_Id',
    rightSidebar: '.Root__right-sidebar',
    nowPlayingBar: '.Root__now-playing-bar, [data-testid="now-playing-bar"]',
    progressBar: '[data-testid="playback-progressbar"], input[type="range"]',
    playPause: '[data-testid="control-button-playpause"]',
    next: '[data-testid="control-button-skip-forward"]',
    prev: '[data-testid="control-button-skip-back"]',
    homeLink: 'a[href="/"]',
    searchLink: 'a[href^="/search"]',
  };

  const STORAGE_KEY = 'spicemobile:enabled';
  const MOBILE_VIEWPORT = 'width=device-width, initial-scale=1, viewport-fit=cover';
  const root = document.documentElement;
  let originalViewport = null; // contenu d'origine de <meta name="viewport">

  const log = (...args) => CONFIG.debug && console.log('[SpiceMobile]', ...args);

  // ---------------------------------------------------------------------------
  // Styles (actifs uniquement quand <html> a la classe .sm-on)
  // ---------------------------------------------------------------------------
  const CSS = `
:root { --sm-nav-h: calc(56px + env(safe-area-inset-bottom, 0px)); }
html:not(.sm-on) { --sm-nav-h: 0px; }

html.sm-on, html.sm-on body {
  min-width: 0 !important;
  overflow-x: hidden !important;
}
html.sm-on body * { -webkit-tap-highlight-color: transparent; }

/* --- Layout : une seule colonne --- */
html.sm-on .Root__top-container {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
  height: calc(100dvh - var(--sm-nav-h)) !important;
  padding: 0 !important;
  gap: 0 !important;
}
html.sm-on .Root__main-view {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  width: 100% !important;
  border-radius: 0 !important;
}
html.sm-on .Root__right-sidebar { display: none !important; }

/* --- Sidebar gauche (bibliothèque) => tiroir plein écran --- */
html.sm-on .Root__nav-bar,
html.sm-on #Desktop_LeftSidebar_Id { display: none !important; }

html.sm-on.sm-drawer-open .Root__nav-bar,
html.sm-on.sm-drawer-open #Desktop_LeftSidebar_Id {
  display: flex !important;
  position: fixed !important;
  inset: 0 0 var(--sm-nav-h) 0 !important;
  width: 100vw !important;
  max-width: none !important;
  z-index: 9998 !important;
  background: #121212 !important;
}

/* --- Barre de lecture --- */
html.sm-on .Root__now-playing-bar { flex: 0 0 auto !important; min-width: 0 !important; }
html.sm-on [data-testid="now-playing-bar"] {
  min-width: 0 !important;
  height: auto !important;
  padding: 8px !important;
}
/* Volume & co inutiles sur téléphone (boutons physiques) */
html.sm-on [data-testid="volume-bar"],
html.sm-on [data-testid="volume-bar-toggle-mute-button"],
html.sm-on [data-testid="control-button-npv"],
html.sm-on [data-testid="pip-toggle-button"],
html.sm-on [data-testid="fullscreen-mode-button"] { display: none !important; }

/* Cibles tactiles >= 44px */
html.sm-on [data-testid^="control-button-"] {
  min-width: 44px !important;
  min-height: 44px !important;
}
html.sm-on [data-testid="control-button-playpause"] { transform: scale(1.25); }

/* --- Listes de titres : #, titre, durée --- */
html.sm-on [role="grid"] [role="row"][aria-rowindex="1"] { display: none !important; }
html.sm-on [data-testid="tracklist-row"] {
  min-height: 56px !important;
  grid-template-columns: 32px minmax(0, 1fr) auto !important;
  column-gap: 8px !important;
}
html.sm-on [data-testid="tracklist-row"] [aria-colindex="3"]:not(:last-child),
html.sm-on [data-testid="tracklist-row"] [aria-colindex="4"]:not(:last-child) {
  display: none !important;
}

/* --- Barre de navigation SpiceMobile --- */
#sm-nav { display: none; }
html.sm-on #sm-nav {
  display: flex;
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: var(--sm-nav-h);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-sizing: border-box;
  background: #000;
  border-top: 1px solid #282828;
  z-index: 9999;
}
#sm-nav button {
  flex: 1;
  background: none;
  border: 0;
  color: #b3b3b3;
  font: 600 11px/1.2 system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
#sm-nav button .sm-icon { font-size: 20px; }
#sm-nav button.sm-active { color: #fff; }

/* Bouton flottant pour revenir en vue mobile depuis la vue PC */
#sm-fab {
  position: fixed;
  right: 12px; bottom: 96px;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 0;
  background: #1ed760;
  color: #000;
  font: 700 12px system-ui, sans-serif;
  z-index: 9999;
}
html.sm-on #sm-fab { display: none; }
`;

  // ---------------------------------------------------------------------------
  // État (activé / désactivé), mémorisé dans localStorage
  // ---------------------------------------------------------------------------
  function isEnabled() {
    try { return localStorage.getItem(STORAGE_KEY) !== '0'; } catch { return true; }
  }

  function setEnabled(on) {
    try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch { /* stockage indisponible */ }
    root.classList.toggle('sm-on', on);
    closeDrawer();
    syncViewport();
  }

  // ---------------------------------------------------------------------------
  // Viewport : force la largeur de l'écran du téléphone en mode mobile
  // ---------------------------------------------------------------------------
  function syncViewport() {
    const head = document.head || root;
    let meta = document.querySelector('meta[name="viewport"]');
    if (originalViewport === null) originalViewport = meta ? meta.content : '';

    const wanted = root.classList.contains('sm-on') ? MOBILE_VIEWPORT : originalViewport;
    if (!meta) {
      if (!wanted) return;
      meta = document.createElement('meta');
      meta.name = 'viewport';
      head.appendChild(meta);
    }
    if (meta.content !== wanted) meta.content = wanted; // garde anti-boucle avec le MutationObserver
  }

  function injectStyle() {
    if (document.getElementById('sm-style')) return;
    const style = document.createElement('style');
    style.id = 'sm-style';
    style.textContent = CSS;
    (document.head || root).appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Navigation sans rechargement (un rechargement couperait la musique)
  // ---------------------------------------------------------------------------
  function clickFirst(selector) {
    const el = document.querySelector(selector);
    if (el) { el.click(); return true; }
    log('Introuvable :', selector);
    return false;
  }

  function navigate(path, linkSelector) {
    closeDrawer();
    // 1er choix : cliquer sur un vrai lien Spotify (même caché, .click() marche)
    if (linkSelector && clickFirst(linkSelector)) return;
    // Repli : navigation SPA via l'API History
    history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }

  // Prévenir quand l'URL change, pour mettre à jour l'onglet actif
  function patchHistory() {
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event('sm:locationchange'));
        return result;
      };
    }
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('sm:locationchange')));
    window.addEventListener('sm:locationchange', updateActive);
  }

  // ---------------------------------------------------------------------------
  // Tiroir bibliothèque
  // ---------------------------------------------------------------------------
  function openDrawer() { root.classList.add('sm-drawer-open'); updateActive(); }
  function closeDrawer() { root.classList.remove('sm-drawer-open'); updateActive(); }
  function toggleDrawer() {
    if (root.classList.contains('sm-drawer-open')) closeDrawer();
    else openDrawer();
  }

  // Fermer le tiroir quand on choisit une playlist dedans
  function setupDrawerAutoClose() {
    document.addEventListener('click', (e) => {
      if (!root.classList.contains('sm-drawer-open')) return;
      const link = e.target.closest?.('a[href]');
      if (link && link.closest(SEL.leftSidebar)) setTimeout(closeDrawer, 150);
    }, true);
  }

  // ---------------------------------------------------------------------------
  // Barre de navigation du bas + bouton flottant
  // ---------------------------------------------------------------------------
  function buildNav() {
    if (document.getElementById('sm-nav')) return;

    const items = [
      { id: 'home',    icon: '⌂', label: 'Accueil',   action: () => navigate('/', SEL.homeLink) },
      { id: 'search',  icon: '⌕', label: 'Recherche', action: () => navigate('/search', SEL.searchLink) },
      { id: 'library', icon: '≡', label: 'Biblio',    action: toggleDrawer },
      { id: 'desktop', icon: '⇱', label: 'Vue PC',    action: () => setEnabled(false) },
    ];

    const nav = document.createElement('nav');
    nav.id = 'sm-nav';
    for (const item of items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.smId = item.id;

      const icon = document.createElement('span');
      icon.className = 'sm-icon';
      icon.textContent = item.icon;
      const label = document.createElement('span');
      label.textContent = item.label;

      btn.append(icon, label);
      btn.addEventListener('click', item.action);
      nav.appendChild(btn);
    }
    document.body.appendChild(nav);

    const fab = document.createElement('button');
    fab.id = 'sm-fab';
    fab.type = 'button';
    fab.textContent = 'Mob';
    fab.title = 'Revenir à la vue mobile';
    fab.addEventListener('click', () => setEnabled(true));
    document.body.appendChild(fab);
  }

  function updateActive() {
    const nav = document.getElementById('sm-nav');
    if (!nav) return;
    const path = location.pathname;
    const current = root.classList.contains('sm-drawer-open') ? 'library'
      : path === '/' ? 'home'
      : path.startsWith('/search') ? 'search'
      : null;
    for (const btn of nav.querySelectorAll('button')) {
      btn.classList.toggle('sm-active', btn.dataset.smId === current);
    }
  }

  // ---------------------------------------------------------------------------
  // Swipe sur la barre de lecture : gauche = suivant, droite = précédent
  // ---------------------------------------------------------------------------
  function setupSwipe() {
    let start = null;

    document.addEventListener('touchstart', (e) => {
      start = null;
      if (!root.classList.contains('sm-on')) return;
      const target = e.target;
      if (!target.closest?.(SEL.nowPlayingBar)) return;
      if (target.closest(SEL.progressBar)) return; // ne pas gêner la recherche dans le titre
      const t = e.touches[0];
      start = { x: t.clientX, y: t.clientY };
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dx) < CONFIG.swipeThreshold || Math.abs(dy) > CONFIG.swipeMaxVertical) return;
      clickFirst(dx < 0 ? SEL.next : SEL.prev);
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // Démarrage
  // ---------------------------------------------------------------------------
  function init() {
    root.classList.toggle('sm-on', isEnabled());
    injectStyle();
    patchHistory();
    setupSwipe();
    setupDrawerAutoClose();

    const onReady = () => {
      injectStyle();
      syncViewport();
      buildNav();
      updateActive();
      // Spotify peut réécrire le <head> : on resurveille la balise viewport
      new MutationObserver(syncViewport).observe(document.head, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['content'],
      });
      log('Prêt');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady, { once: true });
    } else {
      onReady();
    }
  }

  init();
})();