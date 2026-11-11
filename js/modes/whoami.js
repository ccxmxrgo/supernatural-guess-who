/** Who Am I? Six clues, from vague to obvious. Each wrong guess opens the next one. */
import { IMAGES } from '../data/images.js';
import { escapeHtml } from '../lib/text.js';
import { characterPool, characterChips, clueList, p } from './shared.js';

function clues(c) {
  const img = IMAGES[c.id];
  return [
    { label: 'Who they are', html: p(c.hints.vague) },
    { label: 'First letter', html: `<p>Their name starts with <strong class="clue__big">${escapeHtml(c.name[0])}</strong></p>` },
    { label: 'First appearance', html: p(`Season ${c.first.s}, episode ${c.first.e}.`) },
    { label: 'Ties', html: p(c.hints.relation) },
    { label: 'History', html: p(c.hints.history) },
    { label: 'Look', html: img ? `<img class="clue__img" src="${escapeHtml(img)}" alt="A blurred picture of the character">` : p(c.hints.look) },
  ];
}

export default {
  id: 'whoami',
  name: 'Who Am I?',
  short: 'Six clues, from vague to obvious',
  blurb: 'One vague clue to start. Each miss opens a sharper one, ending with their look.',
  max: 6,
  kind: 'character',
  levels: true,
  pool: characterPool,
  board: (c, st) => clueList(clues(c), st.done ? 6 : Math.min(6, st.wrong + 1), st.fresh),
  chips: characterChips,
};
