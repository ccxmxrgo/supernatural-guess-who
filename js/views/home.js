/** The home page: hero, today's challenges, the modes, the files, the player's record. */
import { CHARACTERS } from '../data/characters.js';
import { EPISODES } from '../data/episodes.js';
import { QUOTES } from '../data/quotes.js';
import { MODES, isAvailable } from '../modes/index.js';
import { dailyState } from '../core/game.js';
import { dayNumber, msToNextDay, formatCountdown } from '../core/daily.js';
import { getStats, winRate, avgGuesses, liveDailyStreak } from '../core/stats.js';
import { escapeHtml } from '../lib/text.js';

const arrow = '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';

/* small live pictures of each mode, drawn in HTML so they read as the real game */
const previews = {
  whoami: `<ol class="mini mini--clues" aria-hidden="true">
      <li><span>1</span>A soldier who was built to follow orders.</li>
      <li><span>2</span>Their name starts with <b>C</b></li>
      <li class="is-locked"><span>3</span>Opens after wrong guess 2</li></ol>`,
  description: `<div class="mini mini--file" aria-hidden="true"><p>Gruff, sharp and secretly sentimental.</p><p>Works out of a house full of books in South Dakota.</p><i></i><i></i></div>`,
  quote: `<div class="mini mini--quote" aria-hidden="true"><p>“Hello, boys.”</p><span class="chip chip--no">Angel</span><span class="chip chip--ok">Demon</span></div>`,
  episode: `<div class="mini mini--ep" aria-hidden="true"><p>A man is caught in a time loop at a roadside attraction.</p><span class="chip chip--no">Season 2, it airs later</span><span class="chip chip--ok">Season 3</span></div>`,
  image: `<div class="mini mini--pix" aria-hidden="true">${Array.from({ length: 48 }, (_, i) => `<i style="--v:${((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1 + 1) % 1}"></i>`).join('')}</div>`,
};

function statusOf(mode, day) {
  if (!isAvailable(mode)) return { text: 'Opens once character pictures are added', cls: 'is-off' };
  const s = dailyState(mode, day);
  if (!s.done) return s.guesses.length ? { text: `In progress, ${s.guesses.length} of ${mode.max} guesses used`, cls: '' } : { text: 'Not played yet', cls: '' };
  return s.won ? { text: `Solved in ${s.guesses.length} of ${mode.max}`, cls: 'is-win' } : { text: 'Missed today', cls: 'is-miss' };
}

export function renderHome(root) {
  const day = dayNumber();
  const stats = getStats();
  const streak = liveDailyStreak(stats, day);
  const groups = [
    ['Hunters and humans', CHARACTERS.filter(c => c.tags.includes('human')).length],
    ['Angels and archangels', CHARACTERS.filter(c => c.tags.includes('angel')).length],
    ['Demons', CHARACTERS.filter(c => c.tags.includes('demon')).length],
    ['Gods, horsemen and primordials', CHARACTERS.filter(c => c.tags.includes('god')).length],
    ['Monsters', CHARACTERS.filter(c => c.tags.includes('monster') && !c.tags.includes('human')).length],
  ];
  const playable = MODES.filter(isAvailable);

  root.innerHTML = `
  <section class="hero hero--photo" id="hero" data-enter data-box="none" data-tone="dark" data-calm="left" aria-labelledby="hero-h">
    <img class="hero__bg photo-grade" src="assets/photos/m108358720-2400.webp" srcset="assets/photos/m108358720-1200.webp 1200w, assets/photos/m108358720-2400.webp 2400w" sizes="100vw" alt="An empty gravel road under a dark cliff at dusk" style="--ly-pos: 60% 50%; --ly-pos-phone: 72% 50%" fetchpriority="high">
    <div class="wrap"><div class="hero-text">
      <div class="hero__text">
        <h1 id="hero-h">Supernatural Guess Who?</h1>
        <p class="hero__lead">A daily guessing game about the characters of Supernatural. One new character for every player at midnight UTC, six guesses, and a sharper clue after every miss.</p>
        <div class="btn-row"><a class="btn btn--primary" href="#play-whoami">Start today's challenge${arrow}</a><a class="btn btn--secondary" href="#modes">See the game modes</a></div>
      </div>
      <dl class="hero__facts">
        <div><dt>Today</dt><dd>Day ${day}</dd></div>
        <div><dt>Next character in</dt><dd data-countdown>${formatCountdown(msToNextDay())}</dd></div>
        <div><dt>In the files</dt><dd>${CHARACTERS.length} characters, ${EPISODES.length} episodes</dd></div>
        <div><dt>Your daily streak</dt><dd>${streak} ${streak === 1 ? 'day' : 'days'}</dd></div>
      </dl>
    </div></div>
  </section>

  <section id="daily" aria-labelledby="daily-h">
    <div class="wrap grid grid--middle">
      <div class="span-6">
        <div class="section-head">
          <h2 id="daily-h">Today's challenges. <span class="muted">Day ${day}, the same answers for every player.</span></h2>
        </div>
        <ul class="rows daily-rows">
          ${MODES.map(m => { const s = statusOf(m, day); return `
          <li class="${s.cls}">
            <span class="rows__name">${escapeHtml(m.name)}</span>
            <span class="rows__value">${isAvailable(m) ? `<a class="link" href="#play-${m.id}">${dailyState(m, day).done ? 'See result' : 'Play'}<span class="sr-only"> ${escapeHtml(m.name)}</span></a>` : ''}</span>
            <p>${escapeHtml(s.text)}</p>
          </li>`; }).join('')}
        </ul>
        <p class="daily-next">New challenges in <strong data-countdown>${formatCountdown(msToNextDay())}</strong></p>
      </div>
      <div class="span-5 start-8">
        <div class="photo-frame"><img class="photo-grade" src="assets/photos/m19113729-1200.webp" alt="A smith hammering a glowing iron bar on an anvil" loading="lazy"></div>
      </div>
    </div>
  </section>

  <section id="modes" aria-labelledby="modes-h">
    <div class="wrap">
      <div class="section-head">
        <h2 id="modes-h">Five game modes. <span class="muted">Each has a daily puzzle and endless random rounds.</span></h2>
      </div>
      <div class="grid mode-grid">
        ${MODES.map(m => {
          const on = isAvailable(m);
          return `<${on ? 'a' : 'div'} class="card mode-card span-4${on ? '' : ' is-off'}" ${on ? `href="#play-${m.id}"` : ''}>
            <div class="mode-card__panel">${previews[m.id] ?? ''}</div>
            <h3 class="mode-card__title">${escapeHtml(m.name)}</h3>
            <p class="mode-card__text">${escapeHtml(m.blurb)}</p>
            <p class="mode-card__meta">${on ? `${m.max} guesses` : 'Opens once character pictures are added'}</p>
          </${on ? 'a' : 'div'}>`;
        }).join('')}
        <a class="card mode-card mode-card--random span-4" href="#play-${playable[Math.floor(Math.random() * playable.length)].id}-medium">
          <div class="mode-card__panel"><div class="mini mini--dice" aria-hidden="true"><span>?</span></div></div>
          <h3 class="mode-card__title">Random round</h3>
          <p class="mode-card__text">Drops you into a random mode with a fresh answer. Answers do not repeat until you have seen the whole pool.</p>
          <p class="mode-card__meta">Easy, medium or hard</p>
        </a>
      </div>
    </div>
  </section>

  <section id="files" aria-labelledby="files-h">
    <div class="wrap grid grid--middle">
      <div class="span-5">
        <div class="photo-frame photo-frame--tall"><img class="photo-grade" src="assets/photos/m162973523-1200.webp" alt="Hands gilding the spine of a leather-bound book" loading="lazy"></div>
      </div>
      <div class="span-6 start-7">
        <div class="section-head">
          <h2 id="files-h">The character files. <span class="muted">${CHARACTERS.length} characters across 15 seasons.</span></h2>
          <p class="t-lead measure">From the brothers to one-episode deep cuts. Every clue is written for this game, ranked from easy to hard.</p>
        </div>
        <ul class="rows">
          ${groups.map(([n, v]) => `<li><span class="rows__name">${n}</span><span class="rows__value">${v}</span></li>`).join('')}
          <li><span class="rows__name">Episodes and quotes</span><span class="rows__value">${EPISODES.length} and ${QUOTES.length}</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section id="record" aria-labelledby="record-h">
    <div class="wrap grid grid--middle">
      <div class="span-6">
        <div class="section-head">
          <h2 id="record-h">Your record. <span class="muted">Kept in this browser, no account needed.</span></h2>
        </div>
        <dl class="statgrid">
          <div><dt>Games played</dt><dd>${stats.all.played}</dd></div>
          <div><dt>Win rate</dt><dd>${winRate(stats.all)}%</dd></div>
          <div><dt>Winning streak</dt><dd>${stats.all.streak}</dd></div>
          <div><dt>Longest streak</dt><dd>${stats.all.best}</dd></div>
          <div><dt>Average guesses</dt><dd>${avgGuesses(stats.all)}</dd></div>
          <div><dt>Dailies completed</dt><dd>${stats.daily.completed}</dd></div>
        </dl>
        <div class="btn-row record-actions"><a class="link" href="#stats">See stats by mode</a><a class="link" href="#history">See your game history</a></div>
      </div>
      <div class="span-5 start-8">
        <div class="photo-frame"><img class="photo-grade" src="assets/photos/m130857602-1200.webp" alt="A heavy anvil wrapped in chain in an old forge" loading="lazy"></div>
      </div>
    </div>
  </section>`;
}
