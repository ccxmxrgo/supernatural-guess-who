# Supernatural Guess Who?

A daily guessing game about the characters of Supernatural, in the spirit of LoLdle. Plain HTML, CSS and
JavaScript modules: no build step, no server, no accounts. Host the folder anywhere static (GitHub Pages,
Netlify, Cloudflare Pages).

## Run it

```bash
python3 -m http.server 8080      # then open http://localhost:8080
npm test                         # data checks (needs Node 18+)
node tests/play.test.cjs         # browser flow checks; serve on :8765 first, needs Playwright
```

## Modes

| Mode | File | How it plays |
|---|---|---|
| Who Am I? | `js/modes/whoami.js` | Six clues, vague to obvious; each wrong guess opens the next |
| Case File | `js/modes/description.js` | A written description; each wrong guess adds a line |
| Quote Challenge | `js/modes/quote.js` | Name the speaker; wrong guesses add hints about them |
| Episode Detective | `js/modes/episode.js` | Name the episode from case notes |
| Who's That? | `js/modes/image.js` | A pixelated picture that sharpens; switches on once 6 characters have pictures |

Every mode has a daily puzzle (same for everyone, changes at 00:00 UTC) and endless random rounds
(easy, medium, hard). Random rounds do not repeat an answer within a session until the pool is used up.

## Adding things

- **A character:** append an entry to `js/data/characters.js` (the comment at the top lists the fields),
  then run `npm test`; it checks for missing fields, duplicate names and clues that give the name away.
- **A picture:** put a file in `assets/characters/` and list it in `js/data/images.js`. Use pictures you
  have the right to use; the site ships with none.
- **A quote or episode:** `js/data/quotes.js`, `js/data/episodes.js`.
- **A mode:** a new file in `js/modes/` following the "mode object" note in `js/core/game.js`, added to
  `js/modes/index.js`. The menu, routes, stats and daily challenge pick it up.

## How it works

- `js/core/game.js` runs every round: picking the answer, guesses, clues, win and loss, sharing.
- `js/core/daily.js` picks the daily answer with a seeded shuffle of the pool, so every player gets the
  same one without a server. Adding items to a pool changes future daily answers.
- `js/core/stats.js` keeps stats and history in `localStorage`.
- Routes are plain hash names (`#play-whoami`, `#play-quote-hard`, `#stats`).

There is no server, so the answer list ships to the browser like everything else; the daily answer is
computed at run time and never written into the page, but a determined player could work it out.
Hiding it fully needs a small API that checks guesses.

## Design

Designed with tasteskill (`vendor/taste`, MIT, github.com/Leonxlnx/taste-skill): its system, layout
and motion files, with the palette and type in `css/app.css`. Photographs are licensed stand-ins from
Wikimedia Commons, credited in the footer.

## Legal

Unofficial fan project, not affiliated with Warner Bros., The CW or Kripke Enterprises. Clues and
descriptions are original text; quotes are short lines for trivia.
