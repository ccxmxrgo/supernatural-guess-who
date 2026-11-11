/** Episode Detective: name the episode from case notes. */
import { EPISODES } from '../data/episodes.js';
import { t } from '../lib/i18n.js';
import { clues as notes } from '../data/loc.js';
import { clueList, p, byLevel } from './shared.js';

function clues(ep) {
  const [a, ...rest] = notes(ep);
  const labels = ['ep.setting', 'ep.against', 'ep.happens', 'ep.giveaway'];
  return [
    { label: t('ep.case'), html: p(a) },
    { label: t('ep.season'), html: p(t('ep.seasonV', { s: ep.s })) },
    ...rest.map((x, i) => ({ label: t(labels[i] ?? 'ep.happens'), html: p(x) })),
  ];
}

export default {
  id: 'episode',
  max: 6,
  kind: 'episode',
  levels: true,
  pool: level => byLevel(EPISODES, level),
  board: (ep, st) => clueList(clues(ep), st.done ? 6 : Math.min(6, st.wrong + 1), st.fresh),
  chips(guess, ep) {
    const d = ep.s - guess.s;
    return [{ text: t(d === 0 ? 'chip.epRight' : d > 0 ? 'chip.epLater' : 'chip.epEarlier', { s: guess.s }), ok: d === 0 }];
  },
};
