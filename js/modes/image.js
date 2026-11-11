/** Who's That? A pixelated photograph that sharpens with every wrong guess. Photos: data/images.js. */
import { CHARACTERS } from '../data/characters.js';
import { IMAGES } from '../data/images.js';
import { escapeHtml } from '../lib/text.js';
import { t } from '../lib/i18n.js';
import { byLevel, characterChips } from './shared.js';

const BLOCKS = [40, 26, 17, 11, 7, 4];
const withImages = () => CHARACTERS.filter(c => IMAGES[c.id]);
const cache = new Map();

function draw(canvas, src, block) {
  const ctx = canvas.getContext('2d');
  const paint = img => {
    // the canvas takes the picture's own shape, so wide stills keep every face in frame
    canvas.width = 480; canvas.height = Math.round(480 * img.naturalHeight / img.naturalWidth);
    const w = canvas.width, h = canvas.height;
    // cover, keeping the face (upper third) in frame
    const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * r, ih = img.naturalHeight * r;
    const x = (w - iw) / 2, y = Math.min(0, (h - ih) * 0.25);
    ctx.clearRect(0, 0, w, h);
    if (block <= 1) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, x, y, iw, ih); return; }
    const sw = Math.max(1, Math.round(w / block)), sh = Math.max(1, Math.round(h / block));
    const off = document.createElement('canvas'); off.width = sw; off.height = sh;
    const o = off.getContext('2d');
    o.imageSmoothingEnabled = true;
    o.drawImage(img, x / block, y / block, iw / block, ih / block);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, w, h);
  };
  let img = cache.get(src);
  if (img?.complete && img.naturalWidth) return paint(img);
  if (!img) { img = new Image(); img.src = src; cache.set(src, img); }
  img.addEventListener('load', () => paint(img), { once: true });
}

export default {
  id: 'image',
  max: 6,
  kind: 'character',
  levels: true,
  available: () => withImages().length >= 6,
  pool: level => { const l = byLevel(withImages(), level); return l.length >= 3 ? l : withImages(); },
  board: (c, st) => {
    const img = IMAGES[c.id];
    return `<figure class="snap snap--pixel"><canvas width="480" height="560" role="img" aria-label="${escapeHtml(t('c.pixAlt'))}"></canvas>
      ${st.done && img?.by ? `<figcaption class="snap__credit">${escapeHtml(t('photo.credit', { by: img.by, licence: img.licence }))}</figcaption>` : ''}</figure>`;
  },
  mount(el, c, st) {
    draw(el.querySelector('canvas'), IMAGES[c.id].src, st.done ? 1 : BLOCKS[Math.min(st.wrong, BLOCKS.length - 1)]);
  },
  chips: characterChips,
};
