/** localStorage with a namespace; every access is guarded (private mode, blocked storage). */
const NS = 'spnguess:';
const memory = new Map();

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return memory.has(key) ? memory.get(key) : fallback;
  }
}

export function save(key, value) {
  memory.set(key, value);
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch { /* memory only */ }
}

export function remove(key) {
  memory.delete(key);
  try { localStorage.removeItem(NS + key); } catch { /* ignore */ }
}

export function session(key, fallback) {
  try { const raw = sessionStorage.getItem(NS + key); return raw == null ? fallback : JSON.parse(raw); }
  catch { return fallback; }
}
export function saveSession(key, value) {
  try { sessionStorage.setItem(NS + key, JSON.stringify(value)); } catch { /* ignore */ }
}
