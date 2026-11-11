/** The home page, laid out as pages of the hunting journal: the cover, today's cases, the modes, the files, the record. */
import { CHARACTERS } from '../data/characters.js';
import { EPISODES } from '../data/episodes.js';
import { QUOTES } from '../data/quotes.js';
import { IMAGES } from '../data/images.js';
import { hints, description, quoteText, clues } from '../data/loc.js';
import { MODES, isAvailable, modeName, modeBlurb } from '../modes/index.js';
import { dailyState } from '../core/game.js';
import { dayNumber, msToNextDay, formatCountdown } from '../core/daily.js';
import { getStats, winRate, avgGuesses, liveDailyStreak } from '../core/stats.js';
import { escapeHtml } from '../lib/text.js';
import { t } from '../lib/i18n.js';
import { tally } from './tally.js';

const e = escapeHtml;
const byId = id => CHARACTERS.find(c => c.id === id) ?? EPISODES.find(x => x.id === id);

/* small live pictures of each mode, built from the real data so they follow the language */
function preview(id) {
  if (id === 'whoami') {
    return `<ol class="mini mini--clues" aria-hidden="true">
      <li><span>1</span>${e(hints(byId('castiel')).vague)}</li>
      <li><span>2</span><p>${e(t('clue.startsWith'))} <b>C</b></p></li>
      <li class="is-locked"><span>3</span><i></i></li></ol>`;
  }
  if (id === 'description') return `<div class="mini mini--file" aria-hidden="true"><p>${e(description(byId('bobby-singer'))[0])}</p><i></i><i></i></div>`;
  if (id === 'quote') {
    const q = QUOTES.find(x => x.id === 'q-hello-boys');
    return `<div class="mini mini--quote" aria-hidden="true"><p>“${e(quoteText(q))}”</p><s>Castiel</s></div>`;
  }
  if (id === 'episode') return `<div class="mini mini--ep" aria-hidden="true"><p>${e(clues(byId('e-mystery-spot'))[0])}</p><s>Pilot</s></div>`;
  if (id === 'image') return `<div class="mini mini--pix" aria-hidden="true">${Array.from({ length: 48 }, (_, i) => `<i style="--v:${((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1 + 1) % 1}"></i>`).join('')}</div>`;
  return '';
}

function statusOf(mode, day) {
  if (!isAvailable(mode)) return { text: t('daily.noPhotos'), cls: 'is-off' };
  const s = dailyState(mode, day);
  if (!s.done) return { text: s.guesses.length ? t('daily.progress', { n: s.guesses.length, max: mode.max }) : t('daily.notPlayed'), cls: '' };
  return s.won ? { text: t('daily.won', { n: s.guesses.length, max: mode.max }), cls: 'is-win' } : { text: t('daily.lost'), cls: 'is-miss' };
}

export function renderHome(root) {
  const day = dayNumber();
  const stats = getStats();
  const streak = liveDailyStreak(stats, day);
  const count = tag => CHARACTERS.filter(c => c.tags.includes(tag)).length;
  const groups = [
    [t('files.humans'), count('human')],
    [t('files.angels'), count('angel')],
    [t('files.demons'), count('demon')],
    [t('files.gods'), count('god')],
    [t('files.monsters'), CHARACTERS.filter(c => c.tags.includes('monster') && !c.tags.includes('human')).length],
  ];
  const playable = MODES.filter(isAvailable);
  const photos = Object.keys(IMAGES).length;
  const countdown = formatCountdown(msToNextDay());

  root.innerHTML = `
  <section class="hero" id="hero" aria-labelledby="hero-h">
    <div class="wrap hero__grid">
      <div class="hero__text">
        <p class="kicker">${e(t('hero.kicker', { day }))}</p>
        <h1 id="hero-h" class="hero__h">Supernatural <span>Guess Who?</span></h1>
        <p class="lead">${e(t('hero.lead'))}</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="#play-whoami">${e(t('cta.today'))}</a>
          <a class="btn btn--secondary" href="#modes">${e(t('hero.modes'))}</a>
        </div>
      </div>
      <div class="hero__side">
        <figure class="print print--wide">
          <img src="assets/photos/m108358720-1200.webp" alt="${e(t('hero.photoAlt'))}" width="1200" height="658" fetchpriority="high">
        </figure>
        <dl class="facts">
          <div><dt>${e(t('fact.next'))}</dt><dd data-countdown>${countdown}</dd></div>
          <div><dt>${e(t('fact.files'))}</dt><dd>${e(t('fact.filesV', { c: CHARACTERS.length, e: EPISODES.length }))}</dd></div>
          <div><dt>${e(t('fact.streak'))}</dt><dd>${e(t(streak === 1 ? 'day' : 'days', { n: streak }))}</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="sheet" id="daily" aria-labelledby="daily-h">
    <div class="wrap">
      <header class="sheet__head">
        <h2 id="daily-h">${e(t('daily.h'))}</h2>
        <p class="muted">${e(t('daily.sub', { day }))}</p>
      </header>
      <ul class="checklist">
        ${MODES.map(m => { const s = statusOf(m, day); const on = isAvailable(m); return `
        <li class="${s.cls}">
          <span class="checklist__box" aria-hidden="true"></span>
          <span class="checklist__name">${e(modeName(m))}</span>
          <span class="checklist__state">${e(s.text)}</span>
          ${on ? `<a class="link checklist__go" href="#play-${m.id}">${e(t(dailyState(m, day).done ? 'daily.result' : 'daily.play'))}<span class="sr-only"> ${e(modeName(m))}</span></a>` : '<span></span>'}
        </li>`; }).join('')}
      </ul>
      <p class="sheet__foot">${e(t('daily.next'))} <strong data-countdown>${countdown}</strong></p>
    </div>
  </section>

  <section class="sheet" id="modes" aria-labelledby="modes-h">
    <div class="wrap">
      <header class="sheet__head">
        <h2 id="modes-h">${e(t('modes.h'))}</h2>
        <p class="muted">${e(t('modes.sub'))}</p>
      </header>
      <div class="cards">
        ${MODES.map(m => {
          const on = isAvailable(m);
          const tag = on ? 'a' : 'div';
          return `<${tag} class="card${on ? '' : ' is-off'}" ${on ? `href="#play-${m.id}"` : ''}>
            <div class="card__panel">${preview(m.id)}</div>
            <h3 class="card__title">${e(modeName(m))}</h3>
            <p class="card__text">${e(modeBlurb(m))}</p>
            <p class="card__meta">${e(on ? t('modes.guesses', { n: m.max }) : t('daily.noPhotos'))}</p>
          </${tag}>`;
        }).join('')}
        <a class="card card--random" href="#play-${playable[Math.floor(Math.random() * playable.length)].id}-medium">
          <div class="card__panel"><div class="mini mini--dice" aria-hidden="true"><span>?</span></div></div>
          <h3 class="card__title">${e(t('random.title'))}</h3>
          <p class="card__text">${e(t('random.text'))}</p>
          <p class="card__meta">${e(t('random.meta'))}</p>
        </a>
      </div>
    </div>
  </section>

  <section class="sheet" id="files" aria-labelledby="files-h">
    <div class="wrap split">
      <div>
        <header class="sheet__head">
          <h2 id="files-h">${e(t('files.h'))}</h2>
          <p class="muted">${e(t('files.sub', { n: CHARACTERS.length }))}</p>
        </header>
        <p class="lead">${e(t('files.lead'))}</p>
      </div>
      <ul class="index">
        ${groups.map(([n, v]) => `<li><span class="index__name">${e(n)}</span><span class="index__tally">${tally(v)}</span><span class="index__n">${v}</span></li>`).join('')}
        <li><span class="index__name">${e(t('files.eq'))}</span><span class="index__tally"></span><span class="index__n">${e(t('files.eqV', { e: EPISODES.length, q: QUOTES.length }))}</span></li>
        <li><span class="index__name">${e(t('files.photos'))}</span><span class="index__tally"></span><span class="index__n">${photos}</span></li>
      </ul>
    </div>
  </section>

  <section class="sheet" id="record" aria-labelledby="record-h">
    <div class="wrap">
      <header class="sheet__head">
        <h2 id="record-h">${e(t('record.h'))}</h2>
        <p class="muted">${e(t('record.sub'))}</p>
      </header>
      <dl class="statgrid">
        <div><dt>${e(t('stat.played'))}</dt><dd>${stats.all.played}</dd><span class="statgrid__tally">${tally(stats.all.played)}</span></div>
        <div><dt>${e(t('stat.rate'))}</dt><dd>${winRate(stats.all)}%</dd></div>
        <div><dt>${e(t('stat.streak'))}</dt><dd>${stats.all.streak}</dd><span class="statgrid__tally">${tally(stats.all.streak)}</span></div>
        <div><dt>${e(t('stat.best'))}</dt><dd>${stats.all.best}</dd></div>
        <div><dt>${e(t('stat.avg'))}</dt><dd>${avgGuesses(stats.all)}</dd></div>
        <div><dt>${e(t('stat.dailies'))}</dt><dd>${stats.daily.completed}</dd></div>
      </dl>
      <div class="btn-row"><a class="link" href="#stats">${e(t('record.byMode'))}</a><a class="link" href="#history">${e(t('record.history'))}</a></div>
    </div>
  </section>`;
}
