/** Tally marks, the way a hunter counts on the inside cover: groups of four strokes crossed by a fifth. */
const stroke = (x, i) => `<path d="M${x} ${3 + (i % 2)} L${x + (i % 3) * 0.6 - 0.6} 21"/>`;

export function tally(n, cap = 30) {
  const count = Math.min(Math.max(0, n | 0), cap);
  if (!count) return '';
  const groups = [];
  for (let left = count, g = 0; left > 0; left -= 5, g++) {
    const k = Math.min(5, left);
    const marks = Array.from({ length: Math.min(4, k) }, (_, i) => stroke(3 + i * 5, i + g)).join('');
    const cross = k === 5 ? '<path d="M0 17 L24 6"/>' : '';
    groups.push(`<svg class="tally" viewBox="0 0 24 24" width="24" height="24">${marks}${cross}</svg>`);
  }
  return `<span class="tallies" aria-hidden="true">${groups.join('')}${n > cap ? '<span class="tallies__more">+</span>' : ''}</span>`;
}
