# Snake — Global Hack Week Week 2

A small browser Snake game for [Global Hack Week](https://ghw.mlh.com) (Hacktoberfest week, 9–15 Oct 2026). Open `index.html` in a browser — no build step, no dependencies.

## Play

- Arrow keys or WASD to move
- Space to start or pause
- Enter to restart after a game over
- On a phone, use the on-screen buttons

Eat the red food to grow and score. Hitting a wall or your own tail ends the run. Speed ticks up as the score rises. High score is stored in `localStorage`.

## Files

- `index.html` — page shell
- `style.css` — layout and overlay
- `game.js` — grid loop, input, collision, scoring

## Run locally

```bash
# any static server is fine; opening the file also works
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
