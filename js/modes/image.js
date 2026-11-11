/** Who's That? A pixelated picture that sharpens with every wrong guess. Needs pictures in data/images.js. */
import { CHARACTERS } from '../data/characters.js';
import { IMAGES } from '../data/images.js';
import { byLevel, characterChips } from './shared.js';

const BLOCKS = [36, 24, 16, 10, 6, 3];
const withImages = () => CHARACTERS.filter(c => IMAGES[c.id]);
const cache = new Map();

function draw(canvas, src, block) {
  const ctx = canvas.getContext('2d');
  const paint = img => {
    const w = canvas.width, h = canvas.height;
    const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * r, ih = img.naturalHeight * r;
    if (block <= 1) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih); return; }
    const sw = Math.max(1, Math.round(w / block)), sh = Math.max(1, Math.round(h / block));
    const off = document.createElement('canvas'); off.width = sw; off.height = sh;
    const o = off.getContext('2d');
    o.drawImage(img, (sw - iw / block) / 2, (sh - ih / block) / 2, iw / block, ih / block);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(off, 0, 0, w, h);
  };
  let img = cache.get(src);
  if (img?.complete) return paint(img);
  img = new Image(); img.src = src; cache.set(src, img);
  img.onload = () => paint(img);
}

export default {
  id: 'image',
  name: 'Who\'s That?',
  short: 'A pixelated picture that sharpens',
  blurb: 'A picture so blocky it could be anyone. Every wrong guess sharpens it.',
  max: 6,
  kind: 'character',
  levels: true,
  minImages: 6,
  available: () => withImages().length >= 6,
  pool: level => { const l = byLevel(withImages(), level); return l.length ? l : withImages(); },
  board: (c, st) => `<div class="pixel"><canvas width="480" height="480" role="img" aria-label="A pixelated picture of the character"></canvas></div>`,
  mount(el, c, st) {
    const canvas = el.querySelector('canvas');
    draw(canvas, IMAGES[c.id], st.done ? 1 : BLOCKS[Math.min(st.wrong, BLOCKS.length - 1)]);
  },
  chips: characterChips,
};
