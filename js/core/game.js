/**
 * The round engine shared by every mode. A mode describes its answers and clues; this file runs
 * the round: picking the answer (daily or random), guesses, unlocking clues, win and loss,
 * stats, sharing and saving daily progress.
 *
 * A mode object:
 *   id, max                       identity and the number of guesses (names live in lib/i18n.js)
 *   kind                          'character' or 'episode' (which list the guess field searches)
 *   levels                        true when the random round offers Easy / Medium / Hard
 *   pool(level)                   answers for 'easy' | 'medium' | 'hard' | 'daily'
 *   board(answer, st)             HTML for the clue area; st = { wrong, done, won, fresh }
 *   chips(guess, answer)          optional feedback tags for a wrong guess: [{ text, ok }]
 *   mount(el, answer, st)         optional: draw into the board after it renders (canvas modes)
 *   subject(answer)               optional: the character or episode the player must name
 *                                 (Quote Challenge answers are quotes; the guess is the speaker)
 */
import { CHARACTERS } from '../data/characters.js';
import { EPISODES } from '../data/episodes.js';
import { IMAGES } from '../data/images.js';
import { guessInput } from './guessInput.js';
import { dailyItem, dayNumber, msToNextDay, formatCountdown } from './daily.js';
import { recordGame } from './stats.js';
import { load, save, session, saveSession } from '../lib/storage.js';
import { escapeHtml } from '../lib/text.js';
import { play } from '../lib/sound.js';
import { shareText } from '../lib/share.js';
import { t } from '../lib/i18n.js';
import { species } from '../data/loc.js';
import { modeName } from '../modes/index.js';

const byId = new Map([...CHARACTERS, ...EPISODES].map(x => [x.id, x]));
export const lookup = id => byId.get(id);

const LEVELS = ['easy', 'medium', 'hard'];

function pickRandom(mode, level) {
  const pool = mode.pool(level);
  const key = `recent:${mode.id}`;
  const recent = session(key, []);
  const fresh = pool.filter(x => !recent.includes(x.id));
  const choices = fresh.length ? fresh : pool;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  // remember answers seen this session so they do not come back until the pool is used up
  const next = [...recent.filter(id => pool.some(p => p.id === id)), pick.id];
  saveSession(key, next.length >= pool.length ? [pick.id] : next);
  return pick;
}

export function dailyState(mode, day = dayNumber()) {
  return load(`daily:${mode.id}:${day}`, { guesses: [], done: false, won: false });
}

export function mountGame(root, mode, { daily = true, level = 'medium' } = {}) {
  const day = dayNumber();
  const dkey = `daily:${mode.id}:${day}`;
  const answer = daily ? dailyItem(mode.id, mode.pool('daily'), day) : pickRandom(mode, level);
  const st = daily ? { ...dailyState(mode, day) } : { guesses: [], done: false, won: false };
  const items = mode.kind === 'episode' ? EPISODES : CHARACTERS;
  const target = mode.subject ? mode.subject(answer) : answer;
  let timer = null;
  const name = modeName(mode);

  root.innerHTML = `
    <section class="game" aria-labelledby="game-h" data-mode="${mode.id}">
      <div class="wrap">
        <div class="game__head">
          <a class="link game__back" href="#modes">${t('game.allModes')}</a>
          <h1 id="game-h">${escapeHtml(name)}</h1>
          <p class="game__meta"></p>
          <div class="game__switch" role="group" aria-label="${t('game.roundType')}">
            <a class="seg${daily ? ' is-on' : ''}" href="#play-${mode.id}" ${daily ? 'aria-current="page"' : ''}>${t('game.daily')}</a>
            ${LEVELS.map(v => `<a class="seg${!daily && level === v ? ' is-on' : ''}" href="#play-${mode.id}-${v}" ${!daily && level === v ? 'aria-current="page"' : ''}>${t('game.' + v)}</a>`).join('')}
          </div>
        </div>
        <div class="game__grid">
          <div class="game__main">
            <div class="board" aria-live="polite"></div>
            <div class="game__input"></div>
            <ol class="pips" aria-label="${t('game.used')}"></ol>
          </div>
          <aside class="game__side" aria-labelledby="tries-h">
            <h2 id="tries-h" class="game__side-h">${t('game.guesses')}</h2>
            <ol class="tries"></ol>
          </aside>
        </div>
        <div class="result" hidden></div>
      </div>
    </section>`;

  const $ = s => root.querySelector(s);
  const board = $('.board'), tries = $('.tries'), pips = $('.pips'), result = $('.result'), meta = $('.game__meta');
  const wrongCount = () => st.guesses.filter(g => g !== target.id).length;

  const input = guessInput({
    items,
    exclude: () => new Set(st.guesses),
    label: t(mode.kind === 'episode' ? 'game.nameEp' : 'game.nameChar'),
    placeholder: t(mode.kind === 'episode' ? 'game.phEp' : 'game.phChar'),
    onGuess: guess,
  });
  $('.game__input').append(input.el);

  function renderMeta() {
    meta.textContent = daily
      ? t(st.done ? 'game.metaDailyDone' : 'game.metaDaily', { day, t: formatCountdown(msToNextDay()) })
      : t('game.metaRandom', { level: t('game.' + level).toLowerCase(), max: mode.max });
  }

  function renderBoard(fresh = false) {
    const s = { wrong: wrongCount(), done: st.done, won: st.won, fresh };
    board.innerHTML = mode.board(answer, s);
    mode.mount?.(board, answer, s);
  }

  function renderTries(animateLast = false) {
    const wrong = st.guesses.filter(g => g !== target.id);
    tries.innerHTML = wrong.length
      ? wrong.map((id, i) => {
          const g = lookup(id);
          const chips = mode.chips?.(g, target) ?? [];
          return `<li class="try${animateLast && i === wrong.length - 1 ? ' is-new' : ''}">
            <span class="try__n">${st.guesses.indexOf(id) + 1}</span>
            <s class="try__name">${escapeHtml(g.name ?? g.title)}</s>
            ${chips.length ? `<span class="try__chips">${chips.map(c => `<span class="chip ${c.ok ? 'chip--ok' : 'chip--no'}">${escapeHtml(c.text)}</span>`).join('')}</span>` : ''}
          </li>`;
        }).join('')
      : `<li class="try try--empty">${escapeHtml(t('game.noGuesses'))}</li>`;
    pips.innerHTML = Array.from({ length: mode.max }, (_, i) => {
      const g = st.guesses[i];
      const cls = g == null ? '' : g === target.id ? ' pip--win' : ' pip--miss';
      return `<li class="pip${cls}"><span class="sr-only">${t('game.pip', { n: i + 1, s: t(g == null ? 'game.pipUnused' : g === target.id ? 'game.pipRight' : 'game.pipWrong') })}</span></li>`;
    }).join('');
  }

  function shareLine() {
    const sq = Array.from({ length: mode.max }, (_, i) => {
      const g = st.guesses[i];
      return g == null ? '⬛' : g === target.id ? '🟩' : '🟥';
    }).join('');
    const score = st.won ? `${st.guesses.length}/${mode.max}` : `X/${mode.max}`;
    const where = daily ? t('game.shareDay', { day }) : t('game.' + level);
    const url = location.href.split('#')[0];
    return `Supernatural Guess Who? · ${name} · ${where}\n${sq} ${score}\n${url}`;
  }

  function renderResult(justFinished = false) {
    if (!st.done) { result.hidden = true; return; }
    const who = target.name ?? target.title;
    const img = mode.kind === 'character' ? IMAGES[target.id] : null;
    result.hidden = false;
    result.className = `result ${st.won ? 'result--win' : 'result--lose'}${justFinished ? ' is-new' : ''}`;
    result.innerHTML = `
      <div class="result__card">
        ${img ? `<figure class="result__photo print"><img class="result__img" src="${escapeHtml(img.src)}" alt="${escapeHtml(who)}"><figcaption class="result__credit">${escapeHtml(t('photo.credit', { by: img.by, licence: img.licence }))}</figcaption></figure>` : ''}
        <div class="result__text">
          <p class="result__verdict">${escapeHtml(st.won ? t(st.guesses.length === 1 ? 'game.solved1' : 'game.solved', { n: st.guesses.length }) : t('game.out'))}</p>
          <h2 class="result__name">${st.won ? '' : escapeHtml(t('game.itWas'))}<span class="circled">${escapeHtml(who)}</span></h2>
          <p class="result__facts">${mode.kind === 'episode'
            ? escapeHtml(t('game.epFacts', { s: target.s, e: target.e }))
            : escapeHtml(t('game.charFacts', { species: species(target.species), s: target.first.s, e: target.first.e, title: target.first.title }))}</p>
          ${mode.extra ? `<p class="result__extra">${mode.extra(answer)}</p>` : ''}
          <div class="btn-row">
            <button class="btn btn--primary" type="button" data-act="share">${t('game.share')}</button>
            ${daily
              ? `<a class="btn btn--secondary" href="#play-${mode.id}-medium">${t('game.random')}</a>`
              : `<button class="btn btn--secondary" type="button" data-act="again">${t('game.again')}</button>`}
          </div>
          <p class="result__status" role="status"></p>
          ${daily ? `<p class="result__next">${escapeHtml(t('game.next', { mode: name }))} <span data-count>${formatCountdown(msToNextDay())}</span></p>` : ''}
        </div>
      </div>`;
    result.querySelector('[data-act="share"]').addEventListener('click', async () => {
      const r = await shareText(shareLine());
      result.querySelector('.result__status').textContent =
        r === 'copied' ? t('game.copied') : r === 'shared' ? t('game.shared') : r === 'cancelled' ? '' : t('game.copyFail');
    });
    result.querySelector('[data-act="again"]')?.addEventListener('click', () => mountGame(root, mode, { daily, level }));
  }

  function tick() {
    const ms = msToNextDay();
    const c = root.querySelector('[data-count]');
    if (c) c.textContent = formatCountdown(ms);
    if (daily && st.done) renderMeta();
    if (ms < 1000) { clearInterval(timer); setTimeout(() => location.reload(), 1500); }
  }

  function persist() { if (daily) save(dkey, st); }

  function guess(item) {
    if (st.done) return;
    st.guesses.push(item.id);
    const won = item.id === target.id;
    if (won || st.guesses.length >= mode.max) {
      st.done = true; st.won = won;
      recordGame({ mode: mode.id, won, guesses: st.guesses.length, maxGuesses: mode.max, answer: target.name ?? target.title, day: daily ? day : null });
      play(won ? 'win' : 'lose');
      input.disable();
    } else {
      play('hint');
    }
    persist();
    renderMeta(); renderBoard(!won); renderTries(!won); renderResult(true);
    if (st.done) setTimeout(() => result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }), 250);
    else if (!won) {
      const field = root.querySelector('.guess');
      field.classList.remove('is-wrong'); void field.offsetWidth; field.classList.add('is-wrong');
    }
  }

  renderMeta(); renderBoard(); renderTries(); renderResult();
  if (st.done) input.disable();
  clearInterval(root._roundTimer);
  timer = root._roundTimer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}
