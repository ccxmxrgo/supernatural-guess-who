/** Quote Challenge: who said it? Wrong guesses add hints about the speaker. */
import { QUOTES } from '../data/quotes.js';
import { CHARACTERS } from '../data/characters.js';
import { escapeHtml } from '../lib/text.js';
import { byLevel, characterChips, clueList, p } from './shared.js';

const who = q => CHARACTERS.find(c => c.id === q.by);

export default {
  id: 'quote',
  name: 'Quote Challenge',
  short: 'Who said it?',
  blurb: 'One line from the show, from catchphrases to deep cuts. Name the speaker in five guesses.',
  max: 5,
  kind: 'character',
  levels: true,
  pool: level => byLevel(QUOTES, level),
  subject: who,
  board(q, st) {
    const c = who(q);
    const extra = [
      { label: 'Species', html: p(c.species) },
      { label: 'First seen', html: p(`Season ${c.first.s}.`) },
      { label: 'First letter', html: `<p>Their name starts with <strong class="clue__big">${escapeHtml(c.name[0])}</strong></p>` },
      { label: 'When it was said', html: p(q.context) },
    ];
    const open = st.done ? extra.length : Math.min(extra.length, st.wrong);
    return `<blockquote class="quote"><p>“${escapeHtml(q.text)}”</p></blockquote>
      ${open || st.done ? clueList(extra, open, st.fresh && open > 1) : '<p class="board__note">A wrong guess opens a hint about the speaker.</p>'}`;
  },
  chips: characterChips,
};
