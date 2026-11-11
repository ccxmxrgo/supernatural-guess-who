/**
 * The guess field: type a name, pick from the suggestions (mouse, touch or arrow keys + Enter).
 * Only names in the database are accepted; nicknames and aliases work too.
 */
import { search, resolve, escapeHtml } from '../lib/text.js';

let uid = 0;

export function guessInput({ items, exclude = () => new Set(), onGuess, label = 'Your guess', placeholder = 'Type a name' }) {
  const id = `guess-${++uid}`;
  const form = document.createElement('form');
  form.className = 'guess';
  form.noValidate = true;
  form.innerHTML = `
    <label class="guess__label" for="${id}">${escapeHtml(label)}</label>
    <div class="guess__row">
      <div class="guess__field">
        <input id="${id}" class="guess__input" type="text" autocomplete="off" autocapitalize="words" spellcheck="false"
          role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list" aria-describedby="${id}-err"
          placeholder="${escapeHtml(placeholder)}">
        <ul class="guess__list" id="${id}-list" role="listbox" hidden></ul>
      </div>
      <button class="btn btn--primary guess__btn" type="submit">Guess</button>
    </div>
    <p class="guess__error" id="${id}-err" aria-live="polite"></p>`;

  const input = form.querySelector('input');
  const list = form.querySelector('ul');
  const err = form.querySelector('.guess__error');
  let results = [], active = -1;

  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
  const paint = () => {
    list.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', `${id}-opt-${active}`);
      list.children[active]?.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  function update() {
    err.textContent = '';
    const taken = exclude();
    results = search(items, input.value, 30).filter(r => !taken.has(r.item.id)).slice(0, 7);
    if (!results.length) return close();
    list.innerHTML = results.map((r, i) => {
      const name = r.item.name ?? r.item.title;
      return `<li id="${id}-opt-${i}" role="option" aria-selected="false" data-i="${i}">
        <span class="guess__name">${escapeHtml(name)}</span>${r.via ? `<span class="guess__via">${escapeHtml(r.via)}</span>` : ''}</li>`;
    }).join('');
    active = 0;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    paint();
  }

  function commit(item) {
    if (!item) return;
    if (exclude().has(item.id)) { err.textContent = 'You already tried that one.'; return; }
    input.value = '';
    close();
    onGuess(item);
  }

  input.addEventListener('input', update);
  input.addEventListener('focus', () => { if (input.value) update(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); if (list.hidden) update(); else { active = (active + 1) % results.length; paint(); } }
    else if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); active = (active - 1 + results.length) % results.length; paint(); }
    else if (e.key === 'Escape') close();
  });
  list.addEventListener('mousedown', e => e.preventDefault()); // keep focus in the field
  list.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (li) commit(results[+li.dataset.i]?.item);
  });
  input.addEventListener('blur', () => setTimeout(close, 120));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) { err.textContent = 'Type a name first.'; return; }
    const picked = !list.hidden && active >= 0 ? results[active]?.item : null;
    const item = picked ?? resolve(items, text) ?? (results.length === 1 ? results[0].item : null);
    if (!item) { err.textContent = 'That name is not in the files. Pick one from the list.'; return; }
    commit(item);
  });

  return {
    el: form,
    focus: () => input.focus({ preventScroll: true }),
    disable() { input.disabled = true; form.querySelector('button').disabled = true; close(); },
  };
}
