#!/usr/bin/env node
/**
 * Fetches a picture of each character (a still from the show) from the Supernatural Wiki on Fandom:
 * the lead image of the character's wiki page. Writes
 *   assets/characters/<id>.<ext>   about 600px wide
 *   js/data/images.js              { id: { src, by, licence, page } }
 *   assets/characters/CREDITS.md   where each picture came from
 * Run with Node 18+:  node tools/fetch-character-images.mjs [ids...]
 * A character whose wiki page has a different name, or whose lead image is wrong, can be pinned in
 * tools/wiki-titles.json as { "id": "Wiki page title" } or { "id": { "file": "File name.jpg" } }.
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTERS } from '../js/data/characters.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WIKI = 'https://supernatural.fandom.com';
const UA = 'spn-guess-image-fetch/1.0 (static fan game; GitHub Actions)';
const WIDTH = 600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = 'json') {
  for (let attempt = 0; attempt < 5; attempt++) {
    let res;
    try { res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) }); }
    catch (err) { console.log(`  retry after ${err.name}`); await sleep(3000 * 2 ** attempt); continue; }
    if (res.ok) return as === 'json' ? res.json() : Buffer.from(await res.arrayBuffer());
    console.log(`  ${res.status} ${url.slice(0, 90)}`);
    if (res.status === 429 || res.status >= 500) { await sleep(3000 * 2 ** attempt); continue; }
    return null;
  }
  return null;
}
const api = (params) => get(`${WIKI}/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', ...params }));

/** Lead image of a page (following redirects), or of the first search hit that carries the name. */
async function leadImage(titles, name) {
  const d = await api({ action: 'query', titles: titles.join('|'), redirects: '1', prop: 'pageimages', piprop: 'thumbnail|name', pithumbsize: String(WIDTH) });
  for (const p of d?.query?.pages ?? []) if (!p.missing && p.thumbnail?.source) return { title: p.title, thumb: p.thumbnail.source };
  const s = await api({ action: 'query', list: 'search', srsearch: name, srlimit: '5', srnamespace: '0' });
  const first = name.toLowerCase().split(' ')[0];
  const hits = (s?.query?.search ?? []).map((r) => r.title).filter((t) => t.toLowerCase().includes(first));
  if (!hits.length) return null;
  const d2 = await api({ action: 'query', titles: hits.join('|'), prop: 'pageimages', piprop: 'thumbnail|name', pithumbsize: String(WIDTH) });
  for (const t of hits) {
    const p = (d2?.query?.pages ?? []).find((x) => x.title === t);
    if (p?.thumbnail?.source) return { title: p.title, thumb: p.thumbnail.source };
  }
  return null;
}

async function pinnedFile(file) {
  const d = await api({ action: 'query', titles: `File:${file}`, prop: 'imageinfo', iiprop: 'url', iiurlwidth: String(WIDTH) });
  const info = d?.query?.pages?.[0]?.imageinfo?.[0];
  return info ? { title: `File:${file}`, thumb: info.thumburl ?? info.url } : null;
}

async function main() {
  let pins = {};
  try { pins = JSON.parse(await readFile(join(ROOT, 'tools/wiki-titles.json'), 'utf8')); } catch { /* none */ }
  const only = process.argv.slice(2);
  const imagesPath = join(ROOT, 'js/data/images.js');
  let out = {};
  if (only.length) { try { out = { ...(await import(imagesPath + `?t=${Date.now()}`)).IMAGES }; } catch { /* first run */ } }
  const dir = join(ROOT, 'assets/characters');
  await mkdir(dir, { recursive: true });
  if (!only.length) for (const f of await readdir(dir)) if (/\.(jpe?g|png|webp|gif)$/i.test(f)) await unlink(join(dir, f));

  const missed = [];
  for (const c of CHARACTERS.filter((x) => !only.length || only.includes(x.id))) {
    const pin = pins[c.id];
    if (pin === null) { missed.push(`${c.id}: skipped in wiki-titles.json`); continue; }
    try {
      const hit = pin?.file ? await pinnedFile(pin.file)
        : await leadImage([...new Set([typeof pin === 'string' ? pin : null, c.name, ...c.aliases.slice(0, 1)].filter(Boolean))], c.name);
      if (!hit) { missed.push(`${c.id}: no image found`); continue; }
      const buf = await get(hit.thumb, 'buffer');
      if (!buf) { missed.push(`${c.id}: download failed`); continue; }
      const ext = buf[0] === 0x89 ? 'png' : buf.slice(8, 12).toString() === 'WEBP' ? 'webp' : 'jpg';
      const src = `assets/characters/${c.id}.${ext}`;
      await writeFile(join(ROOT, src), buf);
      out[c.id] = { src, by: 'Supernatural Wiki', licence: 'Warner Bros.', page: `${WIKI}/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}` };
      console.log(`ok  ${c.id.padEnd(20)} ${hit.title}`);
    } catch (err) { missed.push(`${c.id}: ${err.message}`); }
    await sleep(700);
  }

  const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(imagesPath, `/**
 * Character pictures: stills from the show, taken from the Supernatural Wiki (supernatural.fandom.com).
 * Generated by tools/fetch-character-images.mjs. Image mode switches itself on once six characters have one.
 */
export const IMAGES = {
${Object.entries(sorted).map(([id, v]) => `  ${JSON.stringify(id)}: ${JSON.stringify(v)},`).join('\n')}
};
`);
  await writeFile(join(dir, 'CREDITS.md'), `# Image credits\n\nStills from Supernatural (© Warner Bros. Entertainment), via the Supernatural Wiki on Fandom. Used in an unofficial, non-commercial fan game.\n\n${Object.entries(sorted).map(([id, v]) => `- **${id}**: ${v.page}`).join('\n')}\n`);
  console.log(`\n${Object.keys(sorted).length} pictures in images.js`);
  if (missed.length) console.log(`missed ${missed.length}:\n  ` + missed.join('\n  '));
}

main().catch((err) => { console.error(err); process.exit(1); });
