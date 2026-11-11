/** Pieces shared by the character modes. */
import { CHARACTERS } from '../data/characters.js';
import { escapeHtml } from '../lib/text.js';
import { t } from '../lib/i18n.js';
import { species } from '../data/loc.js';

export const byLevel = (list, level, rate = x => x.difficulty) => {
  if (level === 'easy') return list.filter(x => rate(x) === 1);
  if (level === 'medium' || level === 'daily') return list.filter(x => rate(x) <= 2);
  return list.filter(x => rate(x) >= 2); // hard: no gimmes, deep cuts included
};

export const characterPool = level => byLevel(CHARACTERS, level);

/** Feedback for a wrong character guess: same species? earlier or later debut? */
export function characterChips(guess, answer) {
  const d = answer.first.s - guess.first.s;
  return [
    { label: t('c.species'), text: species(guess.species), ok: guess.species === answer.species },
    { label: t('c.firstSeen'), text: t('chip.s', { s: guess.first.s }), ok: d === 0, dir: d > 0 ? 'up' : d < 0 ? 'down' : null,
      sr: t(d === 0 ? 'chip.season' : d > 0 ? 'chip.later' : 'chip.earlier', { s: guess.first.s }) },
  ];
}

/**
 * Journal entries, one per clue. `open` entries show; the rest say when they open.
 * The newest entry animates once when it was just unlocked.
 */
export function clueList(clues, open, fresh) {
  return `<ol class="clues">${clues.map((c, i) => {
    const isOpen = i < open;
    const isNew = fresh && i === open - 1 && i > 0;
    return isOpen
      ? `<li class="clue${isNew ? ' is-new' : ''}"><span class="clue__n">${i + 1}</span><div class="clue__body"><p class="clue__label">${escapeHtml(c.label)}</p><div class="clue__text">${c.html}</div></div></li>`
      : `<li class="clue clue--locked"><span class="clue__n">${i + 1}</span><div class="clue__body"><p class="clue__label">${escapeHtml(c.label)}</p><p class="clue__text">${escapeHtml(t('clue.opens', { n: i }))}</p></div></li>`;
  }).join('')}</ol>`;
}

export const p = text => `<p>${escapeHtml(text)}</p>`;
export const letter = name => `<p>${escapeHtml(t('clue.startsWith'))} <strong class="clue__big">${escapeHtml(name[0])}</strong></p>`;
