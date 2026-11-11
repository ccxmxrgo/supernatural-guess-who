// Data checks: run with `node tests/data.test.mjs`
import { CHARACTERS } from '../js/data/characters.js';
import { EPISODES } from '../js/data/episodes.js';
import { QUOTES } from '../js/data/quotes.js';
import { normalize } from '../js/lib/text.js';
import { dailyItem } from '../js/core/daily.js';

let fail = 0;
const bad = m => { fail++; console.error('FAIL', m); };
const ids = new Set();
const names = new Map();
for (const c of CHARACTERS) {
  if (ids.has(c.id)) bad(`duplicate id ${c.id}`); ids.add(c.id);
  for (const k of ['vague', 'relation', 'history', 'look']) if (!c.hints?.[k]) bad(`${c.id} missing hint ${k}`);
  if (!c.first?.s || !c.first?.e || !c.first?.title) bad(`${c.id} first appearance`);
  if (!(c.description?.length >= 4)) bad(`${c.id} needs 4 description lines`);
  if (![1, 2, 3].includes(c.difficulty)) bad(`${c.id} difficulty`);
  for (const n of [c.name, ...c.aliases]) {
    const k = normalize(n);
    if (names.has(k) && names.get(k) !== c.id) bad(`name "${n}" used by ${names.get(k)} and ${c.id}`);
    names.set(k, c.id);
  }
  // clues must not give the answer away by name
  const own = [c.name, c.name.split(' ')[0], ...c.aliases].filter(n => n.length > 3).map(n => n.toLowerCase());
  const text = [c.hints.vague, c.hints.relation, c.hints.history, ...c.description].join(' ').toLowerCase();
  for (const n of own) if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)) bad(`${c.id} clue mentions "${n}"`);
}
for (const q of QUOTES) if (!ids.has(q.by)) bad(`quote ${q.id} speaker ${q.by} unknown`);
const eids = new Set();
for (const e of EPISODES) {
  if (eids.has(e.id)) bad(`duplicate episode ${e.id}`); eids.add(e.id);
  if (e.clues.length !== 5) bad(`${e.id} needs 5 clues`);
  if (e.clues.join(' ').toLowerCase().includes(e.title.toLowerCase()) && e.title.length > 5) bad(`${e.id} clue names the title`);
}
// the daily walk covers the whole pool before repeating
const pool = CHARACTERS.filter(c => c.difficulty <= 2);
const seen = new Set();
for (let d = 1; d <= pool.length; d++) seen.add(dailyItem('whoami', pool, d).id);
if (seen.size !== pool.length) bad(`daily walk repeats within a cycle (${seen.size}/${pool.length})`);
console.log(`${CHARACTERS.length} characters, ${EPISODES.length} episodes, ${QUOTES.length} quotes: ${fail ? fail + ' problems' : 'all checks pass'}`);
process.exit(fail ? 1 : 0);
