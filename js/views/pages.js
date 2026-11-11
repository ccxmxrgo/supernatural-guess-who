/** Stats, history and about pages. */
import { MODES, getMode } from '../modes/index.js';
import { getStats, winRate, avgGuesses, liveDailyStreak, resetStats } from '../core/stats.js';
import { dayNumber } from '../core/daily.js';
import { escapeHtml } from '../lib/text.js';

const page = (id, title, lead, body) => `
  <section class="page" aria-labelledby="${id}-h">
    <div class="wrap">
      <a class="link game__back" href="#top">Home</a>
      <div class="section-head"><h1 id="${id}-h">${title}</h1>${lead ? `<p class="t-lead measure">${lead}</p>` : ''}</div>
      ${body}
    </div>
  </section>`;

function distBars(m, max) {
  const rows = Array.from({ length: max }, (_, i) => [String(i + 1), m.dist[i + 1] ?? 0]);
  rows.push(['X', m.dist.x ?? 0]);
  const top = Math.max(1, ...rows.map(r => r[1]));
  return `<ol class="dist">${rows.map(([k, v]) => `<li><span class="dist__k">${k}</span><span class="dist__bar" style="--w:${(v / top) * 100}%"><span>${v}</span></span></li>`).join('')}</ol>`;
}

export function renderStats(root) {
  const s = getStats();
  const day = dayNumber();
  root.innerHTML = page('stats', 'Your stats', 'Everything here is stored in this browser only. Clearing site data or switching device starts it fresh.', `
    <dl class="statgrid statgrid--wide">
      <div><dt>Games played</dt><dd>${s.all.played}</dd></div>
      <div><dt>Correct answers</dt><dd>${s.all.wins}</dd></div>
      <div><dt>Win rate</dt><dd>${winRate(s.all)}%</dd></div>
      <div><dt>Winning streak</dt><dd>${s.all.streak}</dd></div>
      <div><dt>Longest streak</dt><dd>${s.all.best}</dd></div>
      <div><dt>Average guesses</dt><dd>${avgGuesses(s.all)}</dd></div>
      <div><dt>Dailies completed</dt><dd>${s.daily.completed}</dd></div>
      <div><dt>Daily streak</dt><dd>${liveDailyStreak(s, day)} ${liveDailyStreak(s, day) === 1 ? 'day' : 'days'}</dd></div>
    </dl>
    <h2 class="page__h2">By mode</h2>
    <div class="grid">
      ${MODES.map(m => { const x = s.modes[m.id] ?? { played: 0, wins: 0, streak: 0, best: 0, guessTotal: 0, dist: {} }; return `
      <div class="card span-6 mode-stats">
        <h3>${escapeHtml(m.name)}</h3>
        <p class="muted">${x.played} played, ${winRate(x)}% won, average ${avgGuesses(x)} guesses, best streak ${x.best}</p>
        ${distBars(x, m.max)}
      </div>`; }).join('')}
    </div>
    <div class="btn-row page__actions"><button class="btn btn--secondary" type="button" data-reset>Reset all stats</button><p class="muted" role="status" data-reset-status></p></div>`);
  const btn = root.querySelector('[data-reset]');
  btn.addEventListener('click', () => {
    if (btn.dataset.armed) { resetStats(); renderStats(root); root.querySelector('[data-reset-status]').textContent = 'Stats cleared.'; return; }
    btn.dataset.armed = '1'; btn.textContent = 'Press again to reset';
  });
}

export function renderHistory(root) {
  const s = getStats();
  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  root.innerHTML = page('history', 'Game history', 'Your last 200 rounds, newest first.', s.history.length ? `
    <ul class="rows history">
      ${s.history.map(h => `<li class="${h.won ? 'is-win' : 'is-miss'}">
        <span class="rows__name">${escapeHtml(h.answer)}</span>
        <span class="rows__value">${h.won ? `${h.guesses}/${h.maxGuesses}` : `X/${h.maxGuesses}`}</span>
        <p>${escapeHtml(getMode(h.mode)?.name ?? h.mode)}, ${h.day ? `daily, day ${h.day}` : 'random round'}, ${fmt.format(h.at)}</p>
      </li>`).join('')}
    </ul>` : `<p class="empty">No rounds yet. <a class="link" href="#play-whoami">Start today's challenge</a></p>`);
}

export function renderAbout(root) {
  root.innerHTML = page('about', 'How to play', '', `
    <div class="grid about">
      <div class="span-6 prose">
        <h2>The rules</h2>
        <p>Pick a mode, then type a name. The field suggests characters (or episodes) as you type; nicknames such as Cas, Squirrel or Fergus work too.</p>
        <p>A wrong guess opens the next clue. Solve it before you run out of guesses to keep your streak.</p>
        <p>Each mode has one daily puzzle, the same for every player, that changes at 00:00 UTC. Random rounds are endless and let you pick easy, medium or hard files.</p>
        <p>Sharing a result copies coloured squares and your score, never the answer.</p>
      </div>
      <div class="span-5 start-8 prose">
        <h2>About this game</h2>
        <p>Supernatural Guess Who? is an unofficial fan game. It is not affiliated with or endorsed by Warner Bros., The CW or Kripke Enterprises. Supernatural and its characters belong to their owners.</p>
        <p>Clues and descriptions are written for this game. Quotes are short lines used for a trivia game.</p>
        <p>Your stats stay in this browser. There are no accounts, trackers or ads.</p>
      </div>
    </div>`);
}
