/** Pieces shared by the character modes. */
import { CHARACTERS } from '../data/characters.js';
import { escapeHtml } from '../lib/text.js';

export const byLevel = (list, level, rate = x => x.difficulty) => {
  if (level === 'easy') return list.filter(x => rate(x) === 1);
  if (level === 'medium' || level === 'daily') return list.filter(x => rate(x) <= 2);
  return list.filter(x => rate(x) >= 2); // hard: no gimmes, deep cuts included
};

export const characterPool = level => byLevel(CHARACTERS, level);

/** Feedback for a wrong character guess: same species? earlier or later debut? */
export function characterChips(guess, answer) {
  const chips = [{ text: guess.species, ok: guess.species === answer.species }];
  const d = answer.first.s - guess.first.s;
  chips.push({ text: d === 0 ? `Season ${guess.first.s}` : `Season ${guess.first.s}, they debut ${d > 0 ? 'later' : 'earlier'}`, ok: d === 0 });
  return chips;
}

/**
 * A list of clue cards. clues: [{ label, html }]. `open` cards show; the rest say when they open.
 * The newest card animates once when it was just unlocked.
 */
export function clueList(clues, open, fresh) {
  return `<ol class="clues">${clues.map((c, i) => {
    const isOpen = i < open;
    const isNew = fresh && i === open - 1 && i > 0;
    return isOpen
      ? `<li class="clue${isNew ? ' is-new' : ''}"><span class="clue__n">${i + 1}</span><div><p class="clue__label">${escapeHtml(c.label)}</p><div class="clue__text">${c.html}</div></div></li>`
      : `<li class="clue clue--locked"><span class="clue__n">${i + 1}</span><div><p class="clue__label">${escapeHtml(c.label)}</p><p class="clue__text">Opens after wrong guess ${i}.</p></div></li>`;
  }).join('')}</ol>`;
}

export const p = text => `<p>${escapeHtml(text)}</p>`;
