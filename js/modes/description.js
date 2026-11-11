/** Character Description: a case file without the name. Wrong guesses add lines to it. */
import { escapeHtml } from '../lib/text.js';
import { characterPool, characterChips } from './shared.js';

const lines = c => [...c.description, `Species: ${c.species}.`, `Name starts with “${c.name[0]}”.`];

export default {
  id: 'description',
  name: 'Case File',
  short: 'Name them from a written description',
  blurb: 'A hunter\'s notes on someone, name withheld. Each miss adds a line.',
  max: 6,
  kind: 'character',
  levels: true,
  pool: characterPool,
  board(c, st) {
    const all = lines(c);
    const open = st.done ? all.length : Math.min(all.length, st.wrong + 1);
    return `<div class="file">
      <p class="file__label">Case file, name withheld</p>
      ${all.map((t, i) => i < open
        ? `<p class="file__line${st.fresh && i === open - 1 && i > 0 ? ' is-new' : ''}">${escapeHtml(t)}</p>`
        : `<p class="file__line file__line--locked" aria-hidden="true"><span></span></p>`).join('')}
    </div>`;
  },
  chips: characterChips,
};
