// Feuilles de style SpiceMobile, chargées en texte (`?raw`) et inlinées au build.
// L'ordre compte : base d'abord, puis une feuille par fonctionnalité.
import base from './base.css?raw';
import layout from './layout.css?raw';
import drawer from './drawer.css?raw';
import player from './player.css?raw';
import tracklist from './tracklist.css?raw';
import nav from './nav.css?raw';

export const STYLESHEETS = { base, layout, drawer, player, tracklist, nav };

export const CSS = Object.values(STYLESHEETS).join('\n');
