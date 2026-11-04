# Take Away

A responsive browser game for two players: Amy starts with 100 coins; each player takes 1–10 available coins; whoever empties the jar wins. Play as Amy against an optimal Beth, or pass the device between two people. Includes move history, hints, a new-game button, and the mathematical explanation.

## Run

Requires Node.js 18+, Python 3, and a modern browser. No npm dependencies; startup builds the standalone page.

```sh
npm start
```

Open port 3000 in your browser. Alternatively, run `python3 -m http.server 3000 --bind 0.0.0.0` from the repository. Google Fonts are optional; system fonts work offline.

## Test

Requires Node.js 18 or newer:

```sh
npm test
```

## Winning strategy

Amy wins with perfect play: take 1 first, leaving 99. After Beth takes x, take 11 − x. Amy leaves multiples of 11 until taking the final coins. A player facing a multiple of 11 cannot leave another multiple of 11 with a legal move; every other positive position can reach one.

Changing opponent mode starts a fresh game. The computer always chooses a winning move when one exists; in a losing position it takes 1.

## Custom starting total

Set **Starting coins** to a whole number from 1 to 10,000, then choose **Apply & restart**. New game and opponent changes reuse the applied total. The strategy explanation updates for that total. The jar illustration shows at most 100 coins; the counter always shows the exact remaining amount. The game API also accepts `newGame(total)` (default: 100).

## ChatGPT preview / standalone HTML

`index.html` is self-contained, including styles and game scripts, so previews do not need to resolve JavaScript module imports or external fonts. After editing `app.js`, `game.js`, `style.css`, or `src/index.template.html`, run `npm run build` to refresh it. `npm start` also builds automatically.

## Maximum coins per turn

Set **Maximum coins per turn** (1–10,000) alongside **Starting coins**, then select **Apply & restart**. Both settings are retained by New game and opponent changes. The minimum move remains 1. Quick choices show up to 20 amounts; larger limits also provide an exact-amount input. Hints, computer moves, rules and strategy all follow the applied limit. With maximum k, losing positions are multiples of k + 1. API: `newGame(total, maxTake)` and `optimalMove(remaining, maxTake)`.


## Publish as a website with GitHub Pages

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/ (root)**, then **Save**.
4. Wait for GitHub's Pages deployment to finish. The site address will be shown in Pages settings (normally https://daiaustinyersin.github.io/Take-Away-Game/).

The committed `index.html` is the complete website. `.nojekyll` makes it a plain static site. After source changes, run `npm run build` and commit the resulting `index.html` before pushing. Once Pages is enabled, pushes to main update the site automatically. No keys, paid hosting or server are needed. The layout adapts to laptop, tablet and phone screens, with touch controls and a Game settings shortcut.
