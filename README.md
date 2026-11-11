# Supernatural Guess Who?

Um jogo diário de adivinhação com os personagens de Supernatural, no estilo do LoLdle, com cara de diário
de caça do John Winchester. HTML, CSS e módulos JavaScript puros: sem build, sem servidor, sem contas. Roda
em qualquer hospedagem estática (GitHub Pages, Netlify, Cloudflare Pages).

O site abre em português; o botão **EN** no menu troca para inglês, e a escolha fica salva.

## Rodar

```bash
python3 -m http.server 8080      # depois abra http://localhost:8080
npm test                         # checagem dos dados (Node 18+)
node tests/play.test.cjs         # teste no navegador; sirva na porta 8765 antes, precisa do Playwright
```

## Modos

| Modo | Arquivo | Como funciona |
|---|---|---|
| Quem Sou Eu? | `js/modes/whoami.js` | Seis pistas, do vago ao óbvio; a última é a foto borrada |
| Quem É Esse? | `js/modes/image.js` | Uma foto pixelada que fica mais nítida a cada erro |
| Ficha do Caso | `js/modes/description.js` | Uma descrição escrita; cada erro acrescenta uma linha |
| Quem Disse? | `js/modes/quote.js` | Diga quem falou a frase |
| Detetive de Episódios | `js/modes/episode.js` | Diga o episódio pelas anotações do caso |

Cada modo tem um caso diário (igual para todos, muda às 00:00 UTC, 21:00 em Brasília) e rodadas aleatórias
(fácil, médio, difícil) que não repetem resposta na mesma sessão.

## Fotos

As fotos são retratos dos atores com licença livre, do Wikimedia Commons. A Action
**Fetch character photos** (aba Actions → Run workflow) roda `tools/fetch-photos.mjs`, que:

1. procura o artigo do ator na Wikipédia (lista em `tools/actors.json`),
2. pega a foto principal só se ela tiver licença livre (CC BY, CC BY-SA, CC0, domínio público),
3. salva em `assets/characters/<id>.jpg`, escreve `js/data/images.js` e os créditos em
   `assets/characters/CREDITS.md`, e faz o commit.

Para trocar uma foto, coloque `"file": "Nome do arquivo.jpg"` (do Commons) no personagem em
`tools/actors.json` e rode a Action só com aquele id.

## Adicionar coisas

- **Personagem:** `js/data/characters.js` (inglês) e `js/data/characters.pt.js` (português). `npm test`
  confere campos, nomes repetidos e pistas que entregam o nome, nas duas línguas.
- **Frase ou episódio:** `js/data/quotes.js` / `quotes.pt.js`, `js/data/episodes.js` / `episodes.pt.js`.
- **Textos da interface:** `js/lib/i18n.js`.
- **Modo novo:** um arquivo em `js/modes/` seguindo a nota "mode object" em `js/core/game.js`, listado em
  `js/modes/index.js`.

## Como funciona

- `js/core/game.js` roda cada rodada: resposta, chutes, pistas, vitória, derrota e compartilhamento.
- `js/core/daily.js` escolhe a resposta do dia com um embaralhamento com semente, então todo mundo recebe a
  mesma sem servidor.
- `js/core/stats.js` guarda números e histórico no `localStorage`.
- As rotas são nomes simples (`#play-whoami`, `#play-quote-hard`, `#stats`).

Sem servidor, a lista de respostas vai para o navegador junto com o resto; a resposta do dia é calculada na
hora e nunca escrita na página, mas alguém determinado conseguiria descobrir.

## Visual

Feito com as regras da skill Taste (tasteskill.dev): um só acento (vermelho de sangue seco), papel envelhecido
com pauta e margem vermelha, letra à mão (Caveat) sobre texto datilografado (Courier Prime), fotos como
retratos colados com fita, sem inclinação e sem filtro.

## Aviso

Projeto de fã, não oficial, sem ligação com Warner Bros., The CW ou Kripke Enterprises. Pistas e descrições
são textos próprios; as frases são falas curtas para curiosidade.
