/** The home page: the game's name, today's case number, and one button per mode. Nothing else in the way. */
import { MODES, isAvailable, modeName, modeShort } from '../modes/index.js';
import { dailyState } from '../core/game.js';
import { dayNumber, msToNextDay, formatCountdown } from '../core/daily.js';
import { getStats, winRate, liveDailyStreak } from '../core/stats.js';
import { escapeHtml } from '../lib/text.js';
import { t } from '../lib/i18n.js';
import { ICONS } from './icons.js';

const e = escapeHtml;

function statusOf(mode, day) {
  if (!isAvailable(mode)) return { text: t('daily.noPhotos'), cls: 'is-off', mark: '' };
  const s = dailyState(mode, day);
  if (!s.done) return s.guesses.length
    ? { text: t('daily.progress', { n: s.guesses.length, max: mode.max }), cls: 'is-going', mark: `${s.guesses.length}/${mode.max}` }
    : { text: t('daily.notPlayed'), cls: '', mark: '' };
  return s.won
    ? { text: t('daily.won', { n: s.guesses.length, max: mode.max }), cls: 'is-win', mark: ICONS.check }
    : { text: t('daily.lost'), cls: 'is-miss', mark: ICONS.cross };
}

export function renderHome(root) {
  const day = dayNumber();
  const stats = getStats();
  const streak = liveDailyStreak(stats, day);
  const playable = MODES.filter(isAvailable);
  const solved = MODES.filter(m => dailyState(m, day).done).length;

  root.innerHTML = `
  <section class="home" aria-labelledby="home-h">
    <header class="title">
      <p class="title__over">Supernatural</p>
      <h1 id="home-h" class="title__h">Guess Who?</h1>
      <p class="title__day">${e(t('home.case', { day }))} · ${e(t('fact.next'))} <strong data-countdown>${formatCountdown(msToNextDay())}</strong></p>
    </header>

    <ul class="modes" id="modes">
      ${MODES.map(m => {
        const s = statusOf(m, day); const on = isAvailable(m);
        const tag = on ? 'a' : 'div';
        return `<li><${tag} class="mode ${s.cls}" ${on ? `href="#play-${m.id}"` : ''}>
          <span class="mode__icon">${ICONS[m.id]}</span>
          <span class="mode__text"><span class="mode__name">${e(modeName(m))}</span><span class="mode__sub">${e(on ? modeShort(m) : s.text)}</span></span>
          <span class="mode__mark" ${s.mark ? `title="${e(s.text)}"` : ''}>${s.mark}${s.mark ? `<span class="sr-only">${e(s.text)}</span>` : ''}</span>
        </${tag}></li>`;
      }).join('')}
      <li><a class="mode mode--random" href="#play-${playable[Math.floor(Math.random() * playable.length)].id}-medium">
        <span class="mode__icon">${ICONS.random}</span>
        <span class="mode__text"><span class="mode__name">${e(t('random.title'))}</span><span class="mode__sub">${e(t('random.meta'))}</span></span>
        <span class="mode__mark"></span>
      </a></li>
    </ul>

    <dl class="strip">
      <div><dt>${e(t('home.today'))}</dt><dd>${solved}/${MODES.length}</dd></div>
      <div><dt>${e(t('stat.dailyStreak'))}</dt><dd>${streak}</dd></div>
      <div><dt>${e(t('stat.played'))}</dt><dd>${stats.all.played}</dd></div>
      <div><dt>${e(t('stat.rate'))}</dt><dd>${winRate(stats.all)}%</dd></div>
    </dl>
    <p class="home__links"><a class="link" href="#stats">${e(t('record.byMode'))}</a> · <a class="link" href="#rules">${e(t('rules.h'))}</a></p>
  </section>`;
}
