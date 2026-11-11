/** Case File: a hunter's notes without the name. Wrong guesses add lines to it. */
import { escapeHtml } from '../lib/text.js';
import { t } from '../lib/i18n.js';
import { description, species } from '../data/loc.js';
import { characterPool, characterChips } from './shared.js';

const lines = c => [...description(c), t('file.species', { v: species(c.species) }), t('file.letter', { v: c.name[0] })];

export default {
  id: 'description',
  max: 6,
  kind: 'character',
  levels: true,
  pool: characterPool,
  board(c, st) {
    const all = lines(c);
    const open = st.done ? all.length : Math.min(all.length, st.wrong + 1);
    return `<div class="file">
      <p class="file__label">${escapeHtml(t('file.label'))}</p>
      ${all.map((x, i) => i < open
        ? `<p class="file__line${st.fresh && i === open - 1 && i > 0 ? ' is-new' : ''}">${escapeHtml(x)}</p>`
        : `<p class="file__line file__line--locked" aria-hidden="true"><span></span></p>`).join('')}
    </div>`;
  },
  chips: characterChips,
};
