/**
 * Two languages: Brazilian Portuguese (default) and English. UI strings live here; translated
 * data (clues, descriptions, quotes, episode notes) lives beside the data in js/data/*.pt.js.
 * t('key', { n: 3 }) fills {n}. A key missing in Portuguese falls back to English.
 */
import { load, save } from './storage.js';

export const LANGS = [['pt', 'Português'], ['en', 'English']];
let lang = load('lang', 'pt');
if (!LANGS.some(([k]) => k === lang)) lang = 'pt';

export const getLang = () => lang;
export function setLang(next) {
  lang = next; save('lang', next);
  document.documentElement.lang = next === 'pt' ? 'pt-BR' : 'en';
}

const S = {
  en: {
    'site.name': 'Supernatural Guess Who?',
    'site.tagline': 'A daily guessing game for Supernatural fans.',
    'nav.modes': 'Modes', 'nav.daily': 'Today', 'nav.stats': 'Stats', 'nav.history': 'History', 'nav.rules': 'Rules',
    'nav.menu': 'Menu', 'nav.showModes': 'Show the modes', 'nav.skip': 'Skip to content',
    'cta.today': "Start today's case",
    'sound.on': 'Sound on', 'sound.off': 'Sound off',
    'lang.switch': 'Ler em português', 'lang.short': 'PT',
    'menu.daily': 'Daily cases', 'menu.more': 'More modes', 'menu.random': 'Random rounds',
    'menu.easy': 'Easy files', 'menu.easy.sub': 'The household names', 'menu.hard': 'Hard files', 'menu.hard.sub': 'Deep cuts for long-time fans',

    'hero.kicker': 'Hunting journal, day {day}',
    'hero.lead': 'A daily guessing game about the characters of Supernatural. One new character for every player at midnight UTC, six guesses, and a sharper clue after every miss.',
    'hero.modes': 'See the game modes',
    'fact.next': 'Next case in', 'fact.files': 'In the journal', 'fact.filesV': '{c} characters, {e} episodes', 'fact.streak': 'Your daily streak',
    'days': '{n} days', 'day': '{n} day',

    'daily.h': "Today's cases.", 'daily.sub': 'Day {day}, the same answers for every hunter.',
    'daily.notPlayed': 'Not played yet', 'daily.progress': 'In progress, {n} of {max} guesses used',
    'daily.won': 'Solved in {n} of {max}', 'daily.lost': 'Missed today', 'daily.noPhotos': 'Opens once the photographs are in',
    'daily.play': 'Play', 'daily.result': 'See result', 'daily.next': 'New cases in',

    'modes.h': 'Five game modes.', 'modes.sub': 'Each has a daily case and endless random rounds.',
    'modes.guesses': '{n} guesses', 'random.title': 'Random round',
    'random.text': 'Drops you into a random mode with a fresh answer. Answers do not repeat until you have seen the whole pool.',
    'random.meta': 'Easy, medium or hard',

    'files.h': 'The character files.', 'files.sub': '{n} characters across 15 seasons.',
    'files.lead': 'From the brothers to one-episode deep cuts. Every clue is written for this game, ranked from easy to hard.',
    'files.humans': 'Hunters and humans', 'files.angels': 'Angels and archangels', 'files.demons': 'Demons',
    'files.gods': 'Gods, horsemen and primordials', 'files.monsters': 'Monsters', 'files.eq': 'Episodes and quotes', 'files.eqV': '{e} and {q}',

    'record.h': 'Your record.', 'record.sub': 'Kept in this browser, no account needed.',
    'stat.played': 'Games played', 'stat.wins': 'Correct answers', 'stat.rate': 'Win rate', 'stat.streak': 'Winning streak',
    'stat.best': 'Longest streak', 'stat.avg': 'Average guesses', 'stat.dailies': 'Dailies completed', 'stat.dailyStreak': 'Daily streak',
    'record.byMode': 'See stats by mode', 'record.history': 'See your game history',

    'close.h': "Today's character is waiting", 'close.lead': 'Six guesses. Same answer for everyone until midnight UTC.', 'close.word': 'Guess Who?',
    'foot.play': 'Play', 'foot.you': 'You', 'foot.game': 'Game', 'foot.quotes': 'Quotes', 'foot.episodes': 'Episodes',
    'foot.legal': 'Unofficial fan game. Not affiliated with or endorsed by Warner Bros., The CW or Kripke Enterprises. Supernatural and its characters belong to their owners.',
    'foot.credits': 'Photographs via Wikimedia Commons',

    'game.allModes': 'All modes', 'game.daily': 'Daily', 'game.easy': 'Easy', 'game.medium': 'Medium', 'game.hard': 'Hard',
    'game.roundType': 'Round type',
    'game.metaDaily': 'Daily case, day {day}. Same answer for everyone until 00:00 UTC.',
    'game.metaDailyDone': 'Daily case, day {day}. Next one in {t}.',
    'game.metaRandom': 'Random round, {level} files. {max} guesses.',
    'game.guesses': 'Guesses', 'game.used': 'Guesses used', 'game.noGuesses': 'No guesses yet. A wrong guess opens the next clue.',
    'game.pip': 'Guess {n}: {s}', 'game.pipUnused': 'unused', 'game.pipRight': 'correct', 'game.pipWrong': 'wrong',
    'game.nameChar': 'Name the character', 'game.nameEp': 'Name the episode',
    'game.phChar': 'Character name or nickname', 'game.phEp': 'Episode title',
    'game.solved': 'Solved in {n} guesses.', 'game.solved1': 'Solved in 1 guess.', 'game.out': 'Out of guesses.', 'game.itWas': 'It was ',
    'game.epFacts': 'Season {s}, episode {e}.', 'game.charFacts': '{species}. First seen in season {s}, episode {e}, “{title}”.',
    'game.share': 'Share your result', 'game.random': 'Start a random round', 'game.again': 'Start another round',
    'game.copied': 'Result copied. It shows your squares, never the answer.', 'game.shared': 'Shared.', 'game.copyFail': 'Could not copy. Your browser blocked the clipboard.',
    'game.next': 'Next {mode} case in', 'game.shareDay': 'day {day}',
    'guess.btn': 'Guess', 'guess.empty': 'Type a name first.', 'guess.unknown': 'That name is not in the journal. Pick one from the list.', 'guess.dupe': 'You already tried that one.',
    'clue.opens': 'Opens after wrong guess {n}.', 'clue.startsWith': 'Their name starts with',
    'chip.season': 'Season {s}', 'chip.later': 'Season {s}, they debut later', 'chip.earlier': 'Season {s}, they debut earlier',
    'chip.epRight': 'Season {s}, right season', 'chip.epLater': 'Season {s}, it airs later', 'chip.epEarlier': 'Season {s}, it airs earlier',

    'pages.home': 'Home',
    'stats.h': 'Your stats', 'stats.lead': 'Everything here is stored in this browser only. Clearing site data or switching device starts it fresh.',
    'stats.byMode': 'By mode', 'stats.line': '{p} played, {r}% won, average {a} guesses, best streak {b}',
    'stats.reset': 'Reset all stats', 'stats.resetAgain': 'Press again to reset', 'stats.cleared': 'Stats cleared.',
    'hist.h': 'Game history', 'hist.lead': 'Your last 200 rounds, newest first.', 'hist.none': 'No rounds yet.',
    'hist.daily': 'daily, day {day}', 'hist.random': 'random round',
    'rules.h': 'How to play', 'rules.h1': 'The rules', 'rules.h2': 'About this game',
    'rules.p1': 'Pick a mode, then type a name. The field suggests characters (or episodes) as you type; nicknames such as Cas, Squirrel or Fergus work too.',
    'rules.p2': 'A wrong guess opens the next clue. Solve it before you run out of guesses to keep your streak.',
    'rules.p3': 'Each mode has one daily case, the same for every player, that changes at 00:00 UTC. Random rounds are endless and let you pick easy, medium or hard files.',
    'rules.p4': 'Sharing a result copies coloured squares and your score, never the answer.',
    'rules.p5': 'Supernatural Guess Who? is an unofficial fan game. It is not affiliated with or endorsed by Warner Bros., The CW or Kripke Enterprises. Supernatural and its characters belong to their owners.',
    'rules.p6': 'Clues and descriptions are written for this game. Quotes are short lines used for a trivia game. Photographs of the actors come from Wikimedia Commons under free licences, credited in the footer.',
    'rules.p7': 'Your stats stay in this browser. There are no accounts, trackers or ads.',

    'mode.whoami': 'Who Am I?', 'mode.whoami.short': 'Six clues, from vague to obvious', 'mode.whoami.blurb': 'One vague clue to start. Each miss opens a sharper one, ending with their photograph.',
    'mode.description': 'Case File', 'mode.description.short': 'Name them from a written description', 'mode.description.blurb': "A hunter's notes on someone, name withheld. Each miss adds a line.",
    'mode.quote': 'Quote Challenge', 'mode.quote.short': 'Who said it?', 'mode.quote.blurb': 'One line from the show, from catchphrases to deep cuts. Name the speaker in five guesses.',
    'mode.episode': 'Episode Detective', 'mode.episode.short': 'Name the episode from case notes', 'mode.episode.blurb': 'Case notes from one of 15 seasons. Each miss adds the season, setting or plot.',
    'mode.image': 'Who’s That?', 'mode.image.short': 'A blurred photograph that sharpens', 'mode.image.blurb': 'A photograph pixelated past recognition. Every wrong guess sharpens it.',

    'c.who': 'Who they are', 'c.letter': 'First letter', 'c.first': 'First appearance', 'c.ties': 'Ties', 'c.history': 'History', 'c.look': 'Look', 'c.photo': 'Photograph',
    'c.firstV': 'Season {s}, episode {e}.', 'c.species': 'Species', 'c.firstSeen': 'First seen', 'c.firstSeenV': 'Season {s}.', 'c.when': 'When it was said',
    'c.blurAlt': 'A blurred photograph of the actor', 'c.pixAlt': 'A pixelated photograph of the actor',
    'file.label': 'Case file, name withheld', 'file.species': 'Species: {v}.', 'file.letter': 'Name starts with “{v}”.',
    'quote.note': 'A wrong guess opens a hint about the speaker.',
    'ep.case': 'The case', 'ep.season': 'Season', 'ep.seasonV': 'Season {s}.', 'ep.setting': 'Setting', 'ep.against': 'What you are up against', 'ep.happens': 'What happens', 'ep.giveaway': 'The giveaway',
    'photo.credit': 'Photo: {by}, {licence}',
    'foot.actorCredits': 'actor photo credits', 'hero.photoAlt': 'An empty gravel road under a dark cliff at dusk', 'files.photos': 'Actor photographs',
    'title.home': 'Supernatural Guess Who?: a daily character guessing game for fans',
  },
  pt: {
    'site.tagline': 'Um jogo diário de adivinhação para fãs de Supernatural.',
    'nav.modes': 'Modos', 'nav.daily': 'Hoje', 'nav.stats': 'Números', 'nav.history': 'Histórico', 'nav.rules': 'Regras',
    'nav.menu': 'Menu', 'nav.showModes': 'Mostrar os modos', 'nav.skip': 'Pular para o conteúdo',
    'cta.today': 'Abrir o caso de hoje',
    'sound.on': 'Som ligado', 'sound.off': 'Som desligado',
    'lang.switch': 'Read in English', 'lang.short': 'EN',
    'menu.daily': 'Casos do dia', 'menu.more': 'Mais modos', 'menu.random': 'Rodadas aleatórias',
    'menu.easy': 'Fichas fáceis', 'menu.easy.sub': 'Os nomes que todo fã conhece', 'menu.hard': 'Fichas difíceis', 'menu.hard.sub': 'Personagens obscuros para veteranos',

    'hero.kicker': 'Diário de caça, dia {day}',
    'hero.lead': 'Um jogo diário de adivinhação com os personagens de Supernatural. Um personagem novo por dia, igual para todo mundo, seis chutes e uma pista mais clara a cada erro.',
    'hero.modes': 'Ver os modos de jogo',
    'fact.next': 'Próximo caso em', 'fact.files': 'No diário', 'fact.filesV': '{c} personagens, {e} episódios', 'fact.streak': 'Sua sequência diária',
    'days': '{n} dias', 'day': '{n} dia',

    'daily.h': 'Casos de hoje.', 'daily.sub': 'Dia {day}, as mesmas respostas para todo caçador.',
    'daily.notPlayed': 'Ainda não jogado', 'daily.progress': 'Em andamento, {n} de {max} chutes usados',
    'daily.won': 'Resolvido em {n} de {max}', 'daily.lost': 'Perdido hoje', 'daily.noPhotos': 'Abre quando as fotos chegarem',
    'daily.play': 'Jogar', 'daily.result': 'Ver resultado', 'daily.next': 'Novos casos em',

    'modes.h': 'Cinco modos de jogo.', 'modes.sub': 'Cada um tem um caso diário e rodadas aleatórias sem fim.',
    'modes.guesses': '{n} chutes', 'random.title': 'Rodada aleatória',
    'random.text': 'Te joga num modo qualquer com uma resposta nova. Nada se repete até você ver todas as fichas.',
    'random.meta': 'Fácil, médio ou difícil',

    'files.h': 'As fichas dos personagens.', 'files.sub': '{n} personagens em 15 temporadas.',
    'files.lead': 'Dos irmãos até figurantes de um episódio só. Todas as pistas foram escritas para este jogo, do fácil ao difícil.',
    'files.humans': 'Caçadores e humanos', 'files.angels': 'Anjos e arcanjos', 'files.demons': 'Demônios',
    'files.gods': 'Deuses, cavaleiros e primordiais', 'files.monsters': 'Monstros', 'files.eq': 'Episódios e frases', 'files.eqV': '{e} e {q}',

    'record.h': 'Seu histórico.', 'record.sub': 'Guardado neste navegador, sem precisar de conta.',
    'stat.played': 'Partidas', 'stat.wins': 'Acertos', 'stat.rate': 'Aproveitamento', 'stat.streak': 'Sequência de vitórias',
    'stat.best': 'Maior sequência', 'stat.avg': 'Média de chutes', 'stat.dailies': 'Casos diários feitos', 'stat.dailyStreak': 'Sequência diária',
    'record.byMode': 'Ver números por modo', 'record.history': 'Ver seu histórico de partidas',

    'close.h': 'O personagem de hoje está esperando', 'close.lead': 'Seis chutes. A mesma resposta para todo mundo até meia-noite UTC.', 'close.word': 'Guess Who?',
    'foot.play': 'Jogar', 'foot.you': 'Você', 'foot.game': 'Jogo', 'foot.quotes': 'Frases', 'foot.episodes': 'Episódios',
    'foot.legal': 'Jogo de fã, não oficial. Sem ligação com Warner Bros., The CW ou Kripke Enterprises. Supernatural e seus personagens pertencem aos seus donos.',
    'foot.credits': 'Fotos via Wikimedia Commons',

    'game.allModes': 'Todos os modos', 'game.daily': 'Diário', 'game.easy': 'Fácil', 'game.medium': 'Médio', 'game.hard': 'Difícil',
    'game.roundType': 'Tipo de rodada',
    'game.metaDaily': 'Caso diário, dia {day}. A mesma resposta para todo mundo até 00:00 UTC.',
    'game.metaDailyDone': 'Caso diário, dia {day}. O próximo sai em {t}.',
    'game.metaRandom': 'Rodada aleatória, fichas de nível {level}. {max} chutes.',
    'game.guesses': 'Chutes', 'game.used': 'Chutes usados', 'game.noGuesses': 'Nenhum chute ainda. Cada erro abre a próxima pista.',
    'game.pip': 'Chute {n}: {s}', 'game.pipUnused': 'não usado', 'game.pipRight': 'certo', 'game.pipWrong': 'errado',
    'game.nameChar': 'Quem é o personagem?', 'game.nameEp': 'Qual é o episódio?',
    'game.phChar': 'Nome ou apelido do personagem', 'game.phEp': 'Título do episódio (em inglês)',
    'game.solved': 'Resolvido em {n} chutes.', 'game.solved1': 'Resolvido de primeira.', 'game.out': 'Acabaram os chutes.', 'game.itWas': 'Era ',
    'game.epFacts': 'Temporada {s}, episódio {e}.', 'game.charFacts': '{species}. Primeira aparição na temporada {s}, episódio {e}, “{title}”.',
    'game.share': 'Compartilhar resultado', 'game.random': 'Jogar rodada aleatória', 'game.again': 'Jogar outra rodada',
    'game.copied': 'Resultado copiado. Mostra seus quadradinhos, nunca a resposta.', 'game.shared': 'Compartilhado.', 'game.copyFail': 'Não deu para copiar. O navegador bloqueou a área de transferência.',
    'game.next': 'Próximo caso de {mode} em', 'game.shareDay': 'dia {day}',
    'guess.btn': 'Chutar', 'guess.empty': 'Digite um nome primeiro.', 'guess.unknown': 'Esse nome não está no diário. Escolha um da lista.', 'guess.dupe': 'Você já tentou esse.',
    'clue.opens': 'Abre depois do {n}º erro.', 'clue.startsWith': 'O nome começa com',
    'chip.season': 'Temporada {s}', 'chip.later': 'Temporada {s}, estreia depois', 'chip.earlier': 'Temporada {s}, estreia antes',
    'chip.epRight': 'Temporada {s}, é essa', 'chip.epLater': 'Temporada {s}, passa depois', 'chip.epEarlier': 'Temporada {s}, passa antes',

    'pages.home': 'Início',
    'stats.h': 'Seus números', 'stats.lead': 'Tudo aqui fica só neste navegador. Limpar os dados do site ou trocar de aparelho começa do zero.',
    'stats.byMode': 'Por modo', 'stats.line': '{p} partidas, {r}% de acertos, média de {a} chutes, melhor sequência {b}',
    'stats.reset': 'Zerar os números', 'stats.resetAgain': 'Toque de novo para zerar', 'stats.cleared': 'Números zerados.',
    'hist.h': 'Histórico de partidas', 'hist.lead': 'Suas últimas 200 rodadas, das mais novas para as mais antigas.', 'hist.none': 'Nenhuma rodada ainda.',
    'hist.daily': 'diário, dia {day}', 'hist.random': 'rodada aleatória',
    'rules.h': 'Como jogar', 'rules.h1': 'As regras', 'rules.h2': 'Sobre o jogo',
    'rules.p1': 'Escolha um modo e digite um nome. O campo sugere personagens (ou episódios) enquanto você digita; apelidos como Cas, Squirrel ou Fergus também valem.',
    'rules.p2': 'Cada chute errado abre a próxima pista. Acerte antes de acabarem os chutes para manter sua sequência.',
    'rules.p3': 'Cada modo tem um caso diário, igual para todo mundo, que muda às 00:00 UTC (21:00 em Brasília). As rodadas aleatórias não acabam e têm fichas fáceis, médias ou difíceis.',
    'rules.p4': 'Compartilhar copia quadradinhos coloridos e sua pontuação, nunca a resposta.',
    'rules.p5': 'Supernatural Guess Who? é um jogo de fã, não oficial. Não tem ligação nem apoio da Warner Bros., The CW ou Kripke Enterprises. Supernatural e seus personagens pertencem aos seus donos.',
    'rules.p6': 'As pistas e descrições foram escritas para este jogo. As frases são falas curtas usadas como curiosidade. As fotos dos atores vêm do Wikimedia Commons com licenças livres, com créditos no rodapé.',
    'rules.p7': 'Seus números ficam neste navegador. Não tem conta, rastreador nem anúncio.',

    'mode.whoami': 'Quem Sou Eu?', 'mode.whoami.short': 'Seis pistas, do vago ao óbvio', 'mode.whoami.blurb': 'Começa com uma pista vaga. Cada erro abre uma mais clara, e a última é a foto.',
    'mode.description': 'Ficha do Caso', 'mode.description.short': 'Descubra pela descrição', 'mode.description.blurb': 'As anotações de um caçador sobre alguém, sem o nome. Cada erro acrescenta uma linha.',
    'mode.quote': 'Quem Disse?', 'mode.quote.short': 'Descubra quem falou', 'mode.quote.blurb': 'Uma fala da série, dos bordões aos detalhes obscuros. Diga quem falou em cinco chutes.',
    'mode.episode': 'Detetive de Episódios', 'mode.episode.short': 'Descubra o episódio pelas anotações', 'mode.episode.blurb': 'Anotações de um caso de uma das 15 temporadas. Cada erro acrescenta temporada, lugar ou trama.',
    'mode.image': 'Quem É Esse?', 'mode.image.short': 'Uma foto borrada que vai clareando', 'mode.image.blurb': 'Uma foto tão pixelada que podia ser qualquer um. Cada erro deixa ela mais nítida.',

    'c.who': 'Quem é', 'c.letter': 'Primeira letra', 'c.first': 'Primeira aparição', 'c.ties': 'Laços', 'c.history': 'História', 'c.look': 'Aparência', 'c.photo': 'Foto',
    'c.firstV': 'Temporada {s}, episódio {e}.', 'c.species': 'Espécie', 'c.firstSeen': 'Estreia', 'c.firstSeenV': 'Temporada {s}.', 'c.when': 'Quando foi dito',
    'c.blurAlt': 'Uma foto borrada do ator', 'c.pixAlt': 'Uma foto pixelada do ator',
    'file.label': 'Ficha do caso, nome ocultado', 'file.species': 'Espécie: {v}.', 'file.letter': 'O nome começa com “{v}”.',
    'quote.note': 'Cada erro abre uma dica sobre quem falou.',
    'ep.case': 'O caso', 'ep.season': 'Temporada', 'ep.seasonV': 'Temporada {s}.', 'ep.setting': 'Lugar', 'ep.against': 'Contra o quê', 'ep.happens': 'O que acontece', 'ep.giveaway': 'A entregada',
    'photo.credit': 'Foto: {by}, {licence}',
    'foot.actorCredits': 'créditos das fotos dos atores', 'hero.photoAlt': 'Uma estrada de cascalho vazia sob um penhasco escuro ao entardecer', 'files.photos': 'Fotos dos atores',
    'title.home': 'Supernatural Guess Who?: um jogo diário de adivinhação para fãs',
  },
};

export function t(key, vars = {}) {
  const s = S[lang]?.[key] ?? S.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

/** Fill every [data-i18n] element under root (static markup in index.html). */
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
}
