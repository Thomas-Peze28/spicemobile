import { beforeEach, describe, expect, it } from 'vitest';
import { CLASSES, MOBILE_VIEWPORT } from '../src/config.js';
import { createViewport, wantedViewport } from '../src/viewport.js';

const meta = () => document.querySelector('meta[name="viewport"]');
const setMobile = (on) => document.documentElement.classList.toggle(CLASSES.on, on);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('wantedViewport', () => {
  it('vue mobile -> largeur du téléphone, vue PC -> valeur d’origine', () => {
    expect(wantedViewport(true, 'width=1280')).toBe(MOBILE_VIEWPORT);
    expect(wantedViewport(false, 'width=1280')).toBe('width=1280');
    expect(wantedViewport(false, '')).toBe('');
  });
});

describe('createViewport', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.documentElement.className = '';
  });

  it('crée la balise si elle manque, en vue mobile', () => {
    setMobile(true);
    createViewport(document).sync();
    expect(meta().getAttribute('content')).toBe(MOBILE_VIEWPORT);
  });

  it('ne crée rien en vue PC si la page n’avait pas de balise', () => {
    setMobile(false);
    createViewport(document).sync();
    expect(meta()).toBeNull();
  });

  it('restaure la valeur d’origine en repassant en vue PC', () => {
    document.head.innerHTML = '<meta name="viewport" content="width=1280">';
    const viewport = createViewport(document);
    setMobile(true);
    viewport.sync();
    expect(viewport.original()).toBe('width=1280');
    expect(meta().getAttribute('content')).toBe(MOBILE_VIEWPORT);

    setMobile(false);
    viewport.sync();
    expect(meta().getAttribute('content')).toBe('width=1280');
  });

  it('réapplique la valeur si Spotify réécrit la balise', async () => {
    document.head.innerHTML = '<meta name="viewport" content="width=1280">';
    const viewport = createViewport(document);
    setMobile(true);
    viewport.sync();
    const observer = viewport.watch();

    meta().setAttribute('content', 'width=1024');
    await flush();
    expect(meta().getAttribute('content')).toBe(MOBILE_VIEWPORT);

    document.head.innerHTML = '<meta name="viewport" content="width=1024">';
    await flush();
    expect(meta().getAttribute('content')).toBe(MOBILE_VIEWPORT);
    observer.disconnect();
  });
});
