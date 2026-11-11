/**
 * Local player statistics. Everything lives in this browser; nothing is sent anywhere.
 * Shape: { modes: { [modeId]: ModeStats }, all: ModeStats, daily: { completed, streak, best, lastDay }, history: [] }
 */
import { load, save } from '../lib/storage.js';

const KEY = 'stats-v1';
const blank = () => ({ played: 0, wins: 0, streak: 0, best: 0, guessTotal: 0, dist: {} });

export function getStats() {
  const s = load(KEY, null) ?? {};
  return {
    modes: s.modes ?? {},
    all: { ...blank(), ...(s.all ?? {}) },
    daily: { completed: 0, wins: 0, streak: 0, best: 0, lastDay: null, ...(s.daily ?? {}) },
    history: s.history ?? [],
  };
}

function bump(m, won, guesses) {
  m.played++;
  if (won) {
    m.wins++; m.streak++; m.best = Math.max(m.best, m.streak);
    m.guessTotal += guesses;
    m.dist[guesses] = (m.dist[guesses] ?? 0) + 1;
  } else {
    m.streak = 0;
    m.dist.x = (m.dist.x ?? 0) + 1;
  }
}

/** Record a finished round. `day` is the daily number for daily rounds, else null. */
export function recordGame({ mode, won, guesses, maxGuesses, answer, day = null }) {
  const s = getStats();
  s.modes[mode] = { ...blank(), ...(s.modes[mode] ?? {}) };
  bump(s.modes[mode], won, guesses);
  bump(s.all, won, guesses);
  if (day != null) {
    // the daily streak counts days with at least one daily challenge solved
    s.daily.completed++;
    if (won) {
      s.daily.wins++;
      if (s.daily.lastDay !== day) {
        s.daily.streak = s.daily.lastDay === day - 1 ? s.daily.streak + 1 : 1;
        s.daily.lastDay = day;
      }
      s.daily.best = Math.max(s.daily.best, s.daily.streak);
    }
  }
  s.history.unshift({ mode, won, guesses, maxGuesses, answer, day, at: Date.now() });
  s.history = s.history.slice(0, 200);
  save(KEY, s);
  return s;
}

export const winRate = m => (m.played ? Math.round((m.wins / m.played) * 100) : 0);
export const avgGuesses = m => (m.wins ? (m.guessTotal / m.wins).toFixed(1) : '–');

/** A daily streak only counts while it is unbroken: a day with no daily solved shows it as 0. */
export function liveDailyStreak(s, today) {
  return s.daily.lastDay != null && s.daily.lastDay >= today - 1 ? s.daily.streak : 0;
}

export function resetStats() { save(KEY, null); }
