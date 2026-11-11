#!/usr/bin/env node
/**
 * Fetches a freely licensed portrait of each character's actor from Wikipedia / Wikimedia Commons
 * and writes:
 *   assets/characters/<id>.jpg      600px-wide thumbnail
 *   js/data/images.js               { id: { src, by, licence, page } }
 *   assets/characters/CREDITS.md    author and licence for every picture
 *
 * Only pictures Wikipedia marks as free (pilicense=free) are used, and the licence name must be a
 * Creative Commons, public-domain or similar free licence. Run with Node 18+:
 *   node tools/fetch-photos.mjs            (all characters in tools/actors.json)
 *   node tools/fetch-photos.mjs castiel    (only these ids)
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'spn-guess-photo-fetch/1.0 (static fan game; GitHub Actions)';
const WIDTH = 600;
const FREE = /^(cc[ -]?by|cc[ -]?by-sa|cc0|cc-zero|public domain|pd|attribution|gfdl|fal)/i;
const PERSON = /act(or|ress)|performer|comedian|singer|model|television|film|voice/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  for (let attempt = 0; attempt < 5; attempt++) {
    let res;
    try { res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA }, signal: AbortSignal.timeout(20000) }); }
    catch (err) { console.log(`  retry after ${err.name}: ${host}`); await sleep(4000 * 2 ** attempt); continue; }
    if (res.ok) return res.json();
    console.log(`  ${res.status} from ${host}`);
    if (res.status === 429 || res.status >= 500) { await sleep(4000 * 2 ** attempt); continue; }
    throw new Error(`${res.status} ${url}`);
  }
  throw new Error(`gave up: ${url}`);
}

/** Wikipedia page for the actor: exact title first, then a search. Returns {title, file} or null. */
async function findPortrait(actor, title) {
  const tryTitles = async (titles) => {
    const data = await api('en.wikipedia.org', {
      action: 'query', titles: titles.join('|'), redirects: '1',
      prop: 'pageimages|pageprops|description', piprop: 'name', pilicense: 'free',
    });
    for (const page of data.query?.pages ?? []) {
      if (page.missing || page.pageprops?.disambiguation !== undefined) continue;
      if (!PERSON.test(page.description ?? '')) continue;
      if (page.pageimage) return { title: page.title, file: page.pageimage };
    }
    return null;
  };
  const first = await tryTitles([title ?? actor]);
  if (first) return first;
  const search = await api('en.wikipedia.org', { action: 'query', list: 'search', srsearch: `${actor} actor`, srlimit: '5' });
  const surname = actor.split(' ').filter((w) => !/^(jr\.?|sr\.?)$/i.test(w)).pop().toLowerCase();
  const candidates = (search.query?.search ?? []).map((r) => r.title).filter((t) => t.toLowerCase().includes(surname));
  return candidates.length ? tryTitles(candidates) : null;
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const strip = (html = '') => html.replace(/<[^>]*>/g, '')
  .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, k) => k[0] === '#' ? String.fromCodePoint(k[1].toLowerCase() === 'x' ? parseInt(k.slice(2), 16) : +k.slice(1)) : ENT[k] ?? m)
  .replace(/\s+/g, ' ').trim();

async function fileInfo(file) {
  const data = await api('commons.wikimedia.org', {
    action: 'query', titles: `File:${file}`, prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime', iiurlwidth: String(WIDTH),
  });
  const page = data.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    thumb: info.thumburl ?? info.url,
    page: info.descriptionurl,
    by: strip(meta.Artist?.value) || strip(meta.Credit?.value) || 'unknown',
    licence: strip(meta.LicenseShortName?.value) || strip(meta.License?.value) || '',
  };
}

async function main() {
  const actors = JSON.parse(await readFile(join(ROOT, 'tools/actors.json'), 'utf8'));
  delete actors._note;
  const only = process.argv.slice(2);
  const imagesPath = join(ROOT, 'js/data/images.js');
  let existing = {};
  try {
    const mod = await import(imagesPath + `?t=${Date.now()}`);
    existing = mod.IMAGES ?? {};
  } catch { /* first run */ }
  const out = { ...existing };
  await mkdir(join(ROOT, 'assets/characters'), { recursive: true });

  const ids = Object.keys(actors).filter((id) => !only.length || only.includes(id));
  const missed = [];
  for (const id of ids) {
    const { actor, title, file: pinned } = actors[id];
    console.log(`..  ${id} (${actor})`);
    try {
      const hit = pinned ? { title: actor, file: pinned } : await findPortrait(actor, title);
      if (!hit) { missed.push(`${id} (${actor}): no free portrait`); continue; }
      const info = await fileInfo(hit.file);
      if (!info) { missed.push(`${id}: no file info for ${hit.file}`); continue; }
      if (!FREE.test(info.licence)) { missed.push(`${id}: licence "${info.licence}" not accepted`); continue; }
      const res = await fetch(info.thumb, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) { missed.push(`${id}: download ${res.status}`); continue; }
      const ext = /\.png($|\?)/i.test(info.thumb) ? 'png' : 'jpg';
      const src = `assets/characters/${id}.${ext}`;
      await writeFile(join(ROOT, src), Buffer.from(await res.arrayBuffer()));
      out[id] = { src, by: info.by, licence: info.licence, page: info.page, actor };
      console.log(`ok  ${id.padEnd(20)} ${hit.file}  [${info.licence}] ${info.by}`);
    } catch (err) {
      missed.push(`${id}: ${err.message}`);
    }
    await sleep(1500);
  }

  const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
  const body = Object.entries(sorted)
    .map(([id, v]) => `  ${JSON.stringify(id)}: ${JSON.stringify(v)},`).join('\n');
  await writeFile(imagesPath, `/**
 * Character pictures: freely licensed portraits of the actors, from Wikimedia Commons.
 * Generated by tools/fetch-photos.mjs. Credits are shown in the game and in assets/characters/CREDITS.md.
 */
export const IMAGES = {
${body}
};
`);
  const credits = Object.entries(sorted)
    .map(([id, v]) => `- **${id}** (${v.actor ?? ''}): ${v.by}, ${v.licence}. ${v.page}`).join('\n');
  await writeFile(join(ROOT, 'assets/characters/CREDITS.md'),
    `# Photo credits\n\nPortraits of the actors, from Wikimedia Commons, under the licences listed.\n\n${credits}\n`);

  console.log(`\n${Object.keys(sorted).length} pictures in images.js`);
  if (missed.length) console.log(`missed ${missed.length}:\n  ` + missed.join('\n  '));
}

main().catch((err) => { console.error(err); process.exit(1); });
