/** Quote Challenge: who said it? Wrong guesses add hints about the speaker. */
import { QUOTES } from '../data/quotes.js';
import { CHARACTERS } from '../data/characters.js';
import { escapeHtml } from '../lib/text.js';
import { t } from '../lib/i18n.js';
import { species, quoteText, quoteContext } from '../data/loc.js';
import { byLevel, characterChips, clueList, p, letter } from './shared.js';

const who = q => CHARACTERS.find(c => c.id === q.by);

export default {
  id: 'quote',
  max: 5,
  kind: 'character',
  levels: true,
  pool: level => byLevel(QUOTES, level),
  subject: who,
  board(q, st) {
    const c = who(q);
    const extra = [
      { label: t('c.species'), html: p(species(c.species)) },
      { label: t('c.firstSeen'), html: p(t('c.firstSeenV', { s: c.first.s })) },
      { label: t('c.letter'), html: letter(c.name) },
      { label: t('c.when'), html: p(quoteContext(q)) },
    ];
    const open = st.done ? extra.length : Math.min(extra.length, st.wrong);
    return `<blockquote class="quote"><p>“${escapeHtml(quoteText(q))}”</p></blockquote>
      ${open || st.done ? clueList(extra, open, st.fresh && open > 1) : `<p class="board__note">${escapeHtml(t('quote.note'))}</p>`}`;
  },
  chips: characterChips,
};
