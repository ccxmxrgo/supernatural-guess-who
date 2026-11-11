/**
 * The daily challenge. Days roll over at 00:00 UTC so everyone on Earth shares the same puzzle.
 * Each mode walks through its own shuffled order of answers; an answer only repeats once the whole
 * pool has been used. The order depends on the sorted ids, so adding an item reshuffles future days
 * (past days are recorded in each player's history).
 */
import { seededShuffle } from '../lib/rng.js';

const EPOCH = Date.UTC(2026, 10, 11); // 11 Nov 2026 is day 1
const DAY = 86400000;

export function dayNumber(now = Date.now()) {
  return Math.floor((now - EPOCH) / DAY) + 1;
}

export function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

export function msToNextDay(now = Date.now()) {
  return DAY - ((now - EPOCH) % DAY + DAY) % DAY;
}

export function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

/** The daily item for a mode: a fixed walk through a seeded order of the pool. */
export function dailyItem(modeId, pool, day = dayNumber()) {
  const sorted = pool.slice().sort((a, b) => a.id.localeCompare(b.id));
  const n = sorted.length;
  const index = ((day - 1) % n + n) % n;
  const cycle = Math.floor((day - 1) / n);
  const order = seededShuffle(sorted, `spn-guess:${modeId}:cycle:${cycle}`);
  return order[index];
}
