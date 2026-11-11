/**
 * Boot and routing. Routes are plain hash names, so links work on any static host and inside
 * embedded viewers that only pass simple #names:
 *   #top (or none)            home; #daily #modes #files #record scroll within it
 *   #play-<mode>              that mode's daily case
 *   #play-<mode>-<level>      a random round: easy, medium or hard
 *   #stats  #history  #rules
 */
import { getMode, isAvailable, modeName } from './modes/index.js';
import { mountGame } from './core/game.js';
import { renderHome } from './views/home.js';
import { renderStats, renderHistory, renderAbout } from './views/pages.js';
import { msToNextDay, formatCountdown } from './core/daily.js';
import { t, getLang, setLang, applyStatic } from './lib/i18n.js';
import * as sound from './lib/sound.js';
import { ICONS } from './views/icons.js';

const main = document.getElementById('top');
let cleanup = null;
let current = null;

function setCurrent(word) {
  document.querySelectorAll('[data-route]').forEach(a => {
    if (a.dataset.route === word) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

const HOME_ANCHORS = ['top', 'modes', 'daily'];
const PAGES = { stats: [renderStats, 'stats.h'], history: [renderHistory, 'hist.h'], rules: [renderAbout, 'rules.h'] };

function route() {
  const name = location.hash.slice(1);
  if (!name || HOME_ANCHORS.includes(name)) {
    if (current !== 'home') render('home');
    window.scrollTo(0, 0);
    return;
  }
  render(name);
}

function render(name) {
  cleanup?.(); cleanup = null;
  const play = /^play-([a-z]+)(?:-(easy|medium|hard))?$/.exec(name);
  const root = document.documentElement;
  root.classList.toggle('is-game', !!play);
  root.classList.toggle('is-sub', name in PAGES);
  if (play) {
    const mode = getMode(play[1]);
    if (!mode || !isAvailable(mode)) { location.replace('#modes'); return; }
    const level = play[2];
    cleanup = mountGame(main, mode, level ? { daily: false, level } : { daily: true });
    current = name;
    document.title = `${modeName(mode)} · Supernatural Guess Who?`;
    setCurrent('play');
  } else if (PAGES[name]) {
    const [fn, title] = PAGES[name];
    fn(main); current = name;
    document.title = `${t(title)} · Supernatural Guess Who?`;
    setCurrent(name);
  } else {
    renderHome(main); current = 'home';
    document.title = t('title.home');
    setCurrent('');
    const tm = setInterval(() => main.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = formatCountdown(msToNextDay()); }), 1000);
    cleanup = () => clearInterval(tm);
  }
  closeMenu();
  window.scrollTo(0, 0);
  if (play && matchMedia('(hover: hover)').matches) main.querySelector('.guess__input:not(:disabled)')?.focus({ preventScroll: true });
}

/* header tools get their icons */
document.querySelectorAll('[data-tool]').forEach(a => { a.insertAdjacentHTML('afterbegin', ICONS[a.dataset.tool]); });
function closeMenu() {}

/* sound switch */
function paintSound() {
  document.querySelectorAll('[data-sound]').forEach(b => {
    b.setAttribute('aria-pressed', String(sound.isOn()));
    b.querySelector('[data-sound-label]').textContent = t(sound.isOn() ? 'sound.on' : 'sound.off');
    b.title = t(sound.isOn() ? 'sound.on' : 'sound.off');
  });
}
document.querySelectorAll('[data-sound]').forEach(btn => btn.addEventListener('click', () => { sound.setOn(!sound.isOn()); paintSound(); }));

/* language switch: Portuguese by default, English as the second language */
function paintLang() {
  applyStatic();
  paintSound();
  document.querySelectorAll('[data-tool]').forEach(a => { a.title = a.textContent.trim(); });
  document.querySelectorAll('[data-lang]').forEach(b => { b.lang = getLang() === 'pt' ? 'en' : 'pt-BR'; b.title = t('lang.switch'); });
}
document.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
  setLang(getLang() === 'pt' ? 'en' : 'pt');
  paintLang();
  const y = window.scrollY;
  current = null;
  route();
  if (!location.hash.slice(1) || HOME_ANCHORS.includes(location.hash.slice(1))) window.scrollTo(0, y);
}));

setLang(getLang());
paintLang();
document.getElementById('year').textContent = new Date().getFullYear();
window.addEventListener('hashchange', route);
route();
