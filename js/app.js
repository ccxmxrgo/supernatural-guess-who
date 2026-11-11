/**
 * Boot and routing. Routes are plain hash names, so links work on any static host and inside
 * embedded viewers that only pass simple #names:
 *   #top (or none)            home; #daily #modes #files #record scroll within it
 *   #play-<mode>              that mode's daily challenge
 *   #play-<mode>-<level>      a random round: easy, medium or hard
 *   #stats  #history  #rules
 */
import { getMode, isAvailable } from './modes/index.js';
import { mountGame } from './core/game.js';
import { renderHome } from './views/home.js';
import { renderStats, renderHistory, renderAbout } from './views/pages.js';
import { msToNextDay, formatCountdown } from './core/daily.js';
import * as sound from './lib/sound.js';

const main = document.getElementById('top');
const nav = document.querySelector('.nav');
let cleanup = null;
let current = null;

function setCurrent(word) {
  document.querySelectorAll('.nav__link[data-route]').forEach(a => {
    if (a.dataset.route === word) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

const HOME_ANCHORS = ['top', 'hero', 'daily', 'modes', 'files', 'record', 'contact'];

function route() {
  const name = location.hash.slice(1);
  if (!name || HOME_ANCHORS.includes(name)) {
    if (current !== 'home') render('home');
    if (name && name !== 'top') document.getElementById(name)?.scrollIntoView();
    else window.scrollTo(0, 0);
    return;
  }
  render(name);
}

function render(name) {
  cleanup?.(); cleanup = null;
  const play = /^play-([a-z]+)(?:-(easy|medium|hard))?$/.exec(name);
  const root = document.documentElement;
  root.classList.toggle('is-game', !!play);
  root.classList.toggle('is-sub', ['stats', 'history', 'rules'].includes(name));
  if (play) {
    const mode = getMode(play[1]);
    if (!mode || !isAvailable(mode)) { location.replace('#top'); return; }
    const level = play[2];
    cleanup = mountGame(main, mode, level ? { daily: false, level } : { daily: true });
    current = name;
    document.title = `${mode.name} · Supernatural Guess Who?`;
    setCurrent('play');
  } else if (name === 'stats') { renderStats(main); current = name; document.title = 'Your stats · Supernatural Guess Who?'; setCurrent('stats'); }
  else if (name === 'history') { renderHistory(main); current = name; document.title = 'Game history · Supernatural Guess Who?'; setCurrent('history'); }
  else if (name === 'rules') { renderAbout(main); current = name; document.title = 'How to play · Supernatural Guess Who?'; setCurrent('about'); }
  else {
    renderHome(main); current = 'home';
    document.title = 'Supernatural Guess Who?: a daily character guessing game for fans';
    setCurrent('');
    const t = setInterval(() => main.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = formatCountdown(msToNextDay()); }), 1000);
    cleanup = () => clearInterval(t);
  }
  closeMenu();
  window.scrollTo(0, 0);
  if (play) main.querySelector('.guess__input:not(:disabled)')?.focus({ preventScroll: true });
}

/* phone and tablet menu sheet */
const toggle = nav.querySelector('.nav__toggle');
function closeMenu() {
  nav.classList.remove('is-open'); document.body.classList.remove('nav-locked');
  toggle.setAttribute('aria-expanded', 'false');
}
toggle.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open); document.body.classList.toggle('nav-locked', open);
  toggle.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', e => { if (e.target.closest('a') && nav.classList.contains('is-open')) closeMenu(); });

/* sound switch */
document.querySelectorAll('[data-sound]').forEach(btn => {
  const paint = () => { btn.setAttribute('aria-pressed', String(sound.isOn())); btn.querySelector('[data-sound-label]').textContent = sound.isOn() ? 'Sound on' : 'Sound off'; };
  paint();
  btn.addEventListener('click', () => { sound.setOn(!sound.isOn()); document.querySelectorAll('[data-sound]').forEach(b => { b.setAttribute('aria-pressed', String(sound.isOn())); b.querySelector('[data-sound-label]').textContent = sound.isOn() ? 'Sound on' : 'Sound off'; }); });
});

document.getElementById('year').textContent = new Date().getFullYear();
window.addEventListener('hashchange', route);
route();

/* the loading veil lifts once the first view is in */
requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
