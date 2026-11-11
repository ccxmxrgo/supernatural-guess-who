/** Episode Detective: name the episode from case notes. */
import { EPISODES } from '../data/episodes.js';
import { clueList, p, byLevel } from './shared.js';

function clues(ep) {
  const [a, ...rest] = ep.clues;
  return [
    { label: 'The case', html: p(a) },
    { label: 'Season', html: p(`Season ${ep.s}.`) },
    ...rest.map((t, i) => ({ label: ['Setting', 'What you are up against', 'What happens', 'The giveaway'][i] ?? 'Clue', html: p(t) })),
  ];
}

export default {
  id: 'episode',
  name: 'Episode Detective',
  short: 'Name the episode from case notes',
  blurb: 'Case notes from one of 15 seasons. Each miss adds the season, setting or plot.',
  max: 6,
  kind: 'episode',
  levels: true,
  pool: level => byLevel(EPISODES, level),
  board: (ep, st) => clueList(clues(ep), st.done ? 6 : Math.min(6, st.wrong + 1), st.fresh),
  chips(guess, ep) {
    const d = ep.s - guess.s;
    return [{ text: d === 0 ? `Season ${guess.s}, right season` : `Season ${guess.s}, it airs ${d > 0 ? 'later' : 'earlier'}`, ok: d === 0 }];
  },
};
