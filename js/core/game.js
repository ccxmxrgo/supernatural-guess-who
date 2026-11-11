/**
 * The round engine shared by every mode. A mode describes its answers and clues; this file runs
 * the round: picking the answer (daily or random), guesses, unlocking clues, win and loss,
 * stats, sharing and saving daily progress.
 *
 * A mode object:
 *   id, name, max                 identity and the number of guesses
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

const byId = new Map([...CHARACTERS, ...EPISODES].map(x => [x.id, x]));
export const lookup = id => byId.get(id);

const LEVELS = [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']];

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

  root.innerHTML = `
    <section class="game" aria-labelledby="game-h" data-mode="${mode.id}">
      <div class="wrap">
        <div class="game__head">
          <a class="link game__back" href="#top">All modes</a>
          <h1 id="game-h">${escapeHtml(mode.name)}</h1>
          <p class="game__meta"></p>
          <div class="game__switch" role="group" aria-label="Round type">
            <a class="seg${daily ? ' is-on' : ''}" href="#play-${mode.id}" ${daily ? 'aria-current="page"' : ''}>Daily</a>
            ${LEVELS.map(([v, t]) => `<a class="seg${!daily && level === v ? ' is-on' : ''}" href="#play-${mode.id}-${v}" ${!daily && level === v ? 'aria-current="page"' : ''}>${t}</a>`).join('')}
          </div>
        </div>
        <div class="game__grid">
          <div class="game__main">
            <div class="board" aria-live="polite"></div>
            <div class="game__input"></div>
            <ol class="pips" aria-label="Guesses used"></ol>
          </div>
          <aside class="game__side" aria-labelledby="tries-h">
            <h2 id="tries-h" class="game__side-h">Guesses</h2>
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
    label: mode.kind === 'episode' ? 'Name the episode' : 'Name the character',
    placeholder: mode.kind === 'episode' ? 'Episode title' : 'Character name or nickname',
    onGuess: guess,
  });
  $('.game__input').append(input.el);

  function renderMeta() {
    meta.textContent = daily
      ? `Daily challenge, day ${day}. ${st.done ? `Next one in ${formatCountdown(msToNextDay())}.` : `Same answer for everyone until 00:00 UTC.`}`
      : `Random round, ${level} files. ${mode.max} guesses.`;
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
            <span class="try__name">${escapeHtml(g.name ?? g.title)}</span>
            ${chips.length ? `<span class="try__chips">${chips.map(c => `<span class="chip ${c.ok ? 'chip--ok' : 'chip--no'}">${escapeHtml(c.text)}</span>`).join('')}</span>` : ''}
          </li>`;
        }).join('')
      : `<li class="try try--empty">No guesses yet. A wrong guess opens the next clue.</li>`;
    pips.innerHTML = Array.from({ length: mode.max }, (_, i) => {
      const g = st.guesses[i];
      const cls = g == null ? '' : g === target.id ? ' pip--win' : ' pip--miss';
      return `<li class="pip${cls}"><span class="sr-only">Guess ${i + 1}: ${g == null ? 'unused' : g === target.id ? 'correct' : 'wrong'}</span></li>`;
    }).join('');
  }

  function shareLine() {
    const sq = Array.from({ length: mode.max }, (_, i) => {
      const g = st.guesses[i];
      return g == null ? '⬛' : g === target.id ? '🟩' : '🟥';
    }).join('');
    const score = st.won ? `${st.guesses.length}/${mode.max}` : `X/${mode.max}`;
    const where = daily ? `day ${day}` : `${level}`;
    const url = location.href.split('#')[0];
    return `Supernatural Guess Who? · ${mode.name} · ${where}\n${sq} ${score}\n${url}`;
  }

  function renderResult(justFinished = false) {
    if (!st.done) { result.hidden = true; return; }
    const name = target.name ?? target.title;
    const img = mode.kind === 'character' ? IMAGES[target.id] : null;
    result.hidden = false;
    result.className = `result ${st.won ? 'result--win' : 'result--lose'}${justFinished ? ' is-new' : ''}`;
    result.innerHTML = `
      <div class="result__card">
        ${img ? `<img class="result__img" src="${escapeHtml(img)}" alt="${escapeHtml(name)}">` : ''}
        <div class="result__text">
          <p class="result__verdict">${st.won ? `Solved in ${st.guesses.length} ${st.guesses.length === 1 ? 'guess' : 'guesses'}.` : 'Out of guesses.'}</p>
          <h2 class="result__name">${st.won ? '' : 'It was '}${escapeHtml(name)}</h2>
          <p class="result__facts">${mode.kind === 'episode'
            ? `Season ${target.s}, episode ${target.e}.`
            : `${escapeHtml(target.species)}. First seen in season ${target.first.s}, episode ${target.first.e}, “${escapeHtml(target.first.title)}”.`}</p>
          ${mode.extra ? `<p class="result__extra">${mode.extra(answer)}</p>` : ''}
          <div class="btn-row">
            <button class="btn btn--primary" type="button" data-act="share">Share your result</button>
            ${daily
              ? `<a class="btn btn--secondary" href="#play-${mode.id}-medium">Start a random round</a>`
              : `<button class="btn btn--secondary" type="button" data-act="again">Start another round</button>`}
          </div>
          <p class="result__status" role="status"></p>
          ${daily ? `<p class="result__next">Next ${escapeHtml(mode.name)} challenge in <span data-count>${formatCountdown(msToNextDay())}</span></p>` : ''}
        </div>
      </div>`;
    result.querySelector('[data-act="share"]').addEventListener('click', async () => {
      const r = await shareText(shareLine());
      result.querySelector('.result__status').textContent =
        r === 'copied' ? 'Result copied. It shows your squares, never the answer.' : r === 'shared' ? 'Shared.' : r === 'cancelled' ? '' : 'Could not copy. Your browser blocked the clipboard.';
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
