/** Text helpers: matching guesses against names and aliases. */
export function normalize(s) {
  return String(s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`".,!?:;()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every name an item answers to, normalized. Works for characters (name) and episodes (title). */
export function namesOf(item) {
  return [item.name ?? item.title, ...(item.aliases ?? [])].map(normalize).filter(Boolean);
}

/**
 * Rank items for a typed query. Prefix matches on the main name rank first, then word-prefix
 * matches, then alias matches, then substring matches.
 */
export function search(items, query, limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  const out = [];
  for (const item of items) {
    const main = normalize(item.name ?? item.title);
    const aliases = (item.aliases ?? []).map(a => [a, normalize(a)]);
    let score = -1, via = null;
    if (main.startsWith(q)) score = 100;
    else if (main.split(' ').some(w => w.startsWith(q))) score = 80;
    else {
      const hit = aliases.find(([, n]) => n.startsWith(q) || n.split(' ').some(w => w.startsWith(q)));
      if (hit) { score = 60; via = hit[0]; }
      else if (main.includes(q)) score = 40;
      else {
        const sub = aliases.find(([, n]) => n.includes(q));
        if (sub) { score = 20; via = sub[0]; }
      }
    }
    if (score >= 0) out.push({ item, score, via });
  }
  out.sort((a, b) => b.score - a.score || (a.item.name ?? a.item.title).localeCompare(b.item.name ?? b.item.title));
  return out.slice(0, limit);
}

/** Resolve free text to exactly one item (full name or alias match), or null. */
export function resolve(items, text) {
  const q = normalize(text);
  if (!q) return null;
  return items.find(i => namesOf(i).includes(q)) ?? null;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
