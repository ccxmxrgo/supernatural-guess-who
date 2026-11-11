/** Who Am I? Six clues, from vague to obvious. Each wrong guess opens the next one; the last is the photograph. */
import { IMAGES } from '../data/images.js';
import { escapeHtml } from '../lib/text.js';
import { t } from '../lib/i18n.js';
import { hints } from '../data/loc.js';
import { characterPool, characterChips, clueList, p, letter } from './shared.js';

function clues(c, done) {
  const img = IMAGES[c.id];
  const hh = hints(c);
  return [
    { label: t('c.who'), html: p(hh.vague) },
    { label: t('c.letter'), html: letter(c.name) },
    { label: t('c.first'), html: p(t('c.firstV', { s: c.first.s, e: c.first.e })) },
    { label: t('c.ties'), html: p(hh.relation) },
    { label: t('c.history'), html: p(hh.history) },
    img
      ? { label: t('c.photo'), html: `<figure class="snap${done ? '' : ' snap--blur'}"><img src="${escapeHtml(img.src)}" alt="${escapeHtml(t('c.blurAlt'))}"></figure>` }
      : { label: t('c.look'), html: p(hh.look) },
  ];
}

export default {
  id: 'whoami',
  max: 6,
  kind: 'character',
  levels: true,
  pool: characterPool,
  board: (c, st) => clueList(clues(c, st.done), st.done ? 6 : Math.min(6, st.wrong + 1), st.fresh),
  chips: characterChips,
};
