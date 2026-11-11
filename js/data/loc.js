/** Localized views of the data: English is the source, Portuguese overrides where present. */
import { getLang } from '../lib/i18n.js';
import { CHARACTERS_PT, SPECIES_PT } from './characters.pt.js';
import { EPISODES_PT } from './episodes.pt.js';
import { QUOTES_PT } from './quotes.pt.js';

const pt = () => getLang() === 'pt';
export const species = s => (pt() ? SPECIES_PT[s] ?? s : s);
export const hints = c => (pt() && CHARACTERS_PT[c.id]?.hints) || c.hints;
export const description = c => (pt() && CHARACTERS_PT[c.id]?.description) || c.description;
export const clues = e => (pt() && EPISODES_PT[e.id]) || e.clues;
export const quoteText = q => (pt() && QUOTES_PT[q.id]?.text) || q.text;
export const quoteContext = q => (pt() && QUOTES_PT[q.id]?.context) || q.context;
