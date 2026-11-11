// Browser flow check: serve the folder on :8765 first (python3 -m http.server 8765), then `node tests/play.test.cjs`
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error('FAIL', m); } else console.log('ok  ', m); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => m.type() === 'error' && errors.push(m.text()));

  const answerFor = mode => p.evaluate(async m => {
    const { dailyItem } = await import('./js/core/daily.js');
    const { getMode } = await import('./js/modes/index.js');
    const mo = getMode(m); const a = dailyItem(m, mo.pool('daily'));
    const t = mo.subject ? mo.subject(a) : a; return t.name ?? t.title;
  }, mode);

  // Who Am I? daily: one wrong guess, then the right one
  await p.goto(BASE + '#play-whoami');
  const ans = await answerFor('whoami');
  const wrong = ans === 'Garth Fitzgerald IV' ? 'Kali' : 'Garth Fitzgerald IV';
  await p.fill('.guess__input', wrong); await p.keyboard.press('Enter');
  ok(await p.locator('.clue:not(.clue--locked)').count() === 2, 'a wrong guess opens clue 2');
  ok(await p.locator('.try').count() === 1, 'the wrong guess is listed');
  await p.fill('.guess__input', 'xyzzy'); await p.keyboard.press('Enter');
  ok((await p.textContent('.guess__error')).includes('not in the files'), 'unknown names are refused');
  await p.fill('.guess__input', ans); await p.keyboard.press('Enter');
  ok(await p.locator('.result--win').isVisible(), `solving with "${ans}" wins`);
  ok(await p.locator('.guess__input').isDisabled(), 'the field locks after the round');
  await p.click('[data-act="share"]');
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  ok(clip.includes('🟥🟩') && !clip.includes(ans), 'shared text has squares and no answer');

  // reload keeps the finished daily
  await p.reload();
  ok(await p.locator('.result--win').isVisible(), 'the finished daily survives a reload');

  // Case File daily: lose by six wrong guesses
  await p.goto(BASE + '#play-description');
  const ans2 = await answerFor('description');
  const pool = ['Garth Fitzgerald IV', 'Kali', 'Joshua', 'Madison', 'Famine', 'War', 'Tessa'].filter(n => n !== ans2).slice(0, 6);
  for (const n of pool) { await p.fill('.guess__input', n); await p.keyboard.press('Enter'); }
  ok(await p.locator('.result--lose').isVisible(), 'six misses lose and reveal the answer');
  ok((await p.textContent('.result__name')).includes(ans2), 'the reveal names the answer');

  // aliases
  await p.goto(BASE + '#play-quote-easy');
  await p.fill('.guess__input', 'Cas');
  ok((await p.textContent('.guess__list')).includes('Castiel'), 'the nickname "Cas" suggests Castiel');

  // every playable mode renders, daily and random
  for (const m of ['whoami', 'description', 'quote', 'episode']) for (const lv of ['', '-easy', '-hard']) {
    await p.goto(BASE + `#play-${m}${lv}`);
    ok(await p.locator('.board').innerHTML().then(h => h.length > 40), `${m}${lv || ' daily'} renders a board`);
  }
  await p.goto(BASE + '#play-image'); await p.waitForTimeout(300);
  ok(p.url().endsWith('#top'), 'image mode without pictures sends you home');

  // stats and history
  await p.goto(BASE + '#stats');
  ok((await p.textContent('.statgrid')).includes('50%'), 'stats show a 50% win rate after one win, one loss');
  await p.goto(BASE + '#history');
  ok(await p.locator('.history li').count() === 2, 'history lists both rounds');
  await p.goto(BASE + '#top');
  ok((await p.textContent('#daily')).includes('Solved in 2 of 6'), 'home shows today\'s solved daily');

  ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await b.close();
  console.log(fail ? `${fail} failed` : 'all passed');
  process.exit(fail ? 1 : 0);
})();
