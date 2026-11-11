/** Stats, history and rules pages. */
import { MODES, getMode, modeName } from '../modes/index.js';
import { getStats, winRate, avgGuesses, liveDailyStreak, resetStats } from '../core/stats.js';
import { dayNumber } from '../core/daily.js';
import { escapeHtml } from '../lib/text.js';
import { t, getLang } from '../lib/i18n.js';
import { tally } from './tally.js';

const e = escapeHtml;

const page = (id, title, lead, body) => `
  <section class="page" aria-labelledby="${id}-h">
    <div class="wrap">
      <a class="link back" href="#top">${e(t('pages.home'))}</a>
      <header class="sheet__head"><h1 id="${id}-h">${e(title)}</h1>${lead ? `<p class="muted measure">${e(lead)}</p>` : ''}</header>
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
  const ds = liveDailyStreak(s, dayNumber());
  const cell = (k, v, n) => `<div><dt>${e(t(k))}</dt><dd>${v}</dd>${n != null ? `<span class="statgrid__tally">${tally(n)}</span>` : ''}</div>`;
  root.innerHTML = page('stats', t('stats.h'), t('stats.lead'), `
    <dl class="statgrid statgrid--wide">
      ${cell('stat.played', s.all.played, s.all.played)}
      ${cell('stat.wins', s.all.wins, s.all.wins)}
      ${cell('stat.rate', `${winRate(s.all)}%`)}
      ${cell('stat.streak', s.all.streak, s.all.streak)}
      ${cell('stat.best', s.all.best)}
      ${cell('stat.avg', avgGuesses(s.all))}
      ${cell('stat.dailies', s.daily.completed)}
      ${cell('stat.dailyStreak', e(t(ds === 1 ? 'day' : 'days', { n: ds })))}
    </dl>
    <h2 class="page__h2">${e(t('stats.byMode'))}</h2>
    <div class="cards cards--two">
      ${MODES.map(m => { const x = s.modes[m.id] ?? { played: 0, wins: 0, streak: 0, best: 0, guessTotal: 0, dist: {} }; return `
      <div class="card card--flat mode-stats">
        <h3 class="card__title">${e(modeName(m))}</h3>
        <p class="muted">${e(t('stats.line', { p: x.played, r: winRate(x), a: avgGuesses(x), b: x.best }))}</p>
        ${distBars(x, m.max)}
      </div>`; }).join('')}
    </div>
    <div class="btn-row page__actions"><button class="btn btn--secondary" type="button" data-reset>${e(t('stats.reset'))}</button><p class="muted" role="status" data-reset-status></p></div>`);
  const btn = root.querySelector('[data-reset]');
  btn.addEventListener('click', () => {
    if (btn.dataset.armed) { resetStats(); renderStats(root); root.querySelector('[data-reset-status]').textContent = t('stats.cleared'); return; }
    btn.dataset.armed = '1'; btn.textContent = t('stats.resetAgain');
  });
}

export function renderHistory(root) {
  const s = getStats();
  const fmt = new Intl.DateTimeFormat(getLang() === 'pt' ? 'pt-BR' : 'en', { dateStyle: 'medium', timeStyle: 'short' });
  root.innerHTML = page('history', t('hist.h'), t('hist.lead'), s.history.length ? `
    <ul class="log">
      ${s.history.map(h => { const m = getMode(h.mode); return `<li class="${h.won ? 'is-win' : 'is-miss'}">
        <span class="log__name">${h.won ? `<span class="circled">${e(h.answer)}</span>` : `<s>${e(h.answer)}</s>`}</span>
        <span class="log__score">${h.won ? `${h.guesses}/${h.maxGuesses}` : `X/${h.maxGuesses}`}</span>
        <p class="log__meta">${e(m ? modeName(m) : h.mode)}, ${e(h.day ? t('hist.daily', { day: h.day }) : t('hist.random'))}, ${e(fmt.format(h.at))}</p>
      </li>`; }).join('')}
    </ul>` : `<p class="empty">${e(t('hist.none'))} <a class="link" href="#play-whoami">${e(t('cta.today'))}</a></p>`);
}

export function renderAbout(root) {
  root.innerHTML = page('rules', t('rules.h'), '', `
    <div class="split prose">
      <div>
        <h2>${e(t('rules.h1'))}</h2>
        ${['rules.p1', 'rules.p2', 'rules.p3', 'rules.p4'].map(k => `<p>${e(t(k))}</p>`).join('')}
      </div>
      <div>
        <h2>${e(t('rules.h2'))}</h2>
        ${['rules.p5', 'rules.p6', 'rules.p7'].map(k => `<p>${e(t(k))}</p>`).join('')}
      </div>
    </div>`);
}
