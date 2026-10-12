(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayHint = document.getElementById("overlay-hint");

  const TILE = 20;
  const COLS = canvas.width / TILE;
  const ROWS = canvas.height / TILE;
  const START_MS = 140;
  const MIN_MS = 70;
  const BEST_KEY = "ghw-snake-best";

  const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

  let snake;
  let dir;
  let queuedDir;
  let food;
  let score;
  let best = Number(localStorage.getItem(BEST_KEY) || 0);
  let running = false;
  let dead = false;
  let timer = null;

  bestEl.textContent = String(best);

  function reset() {
    const midX = Math.floor(COLS / 2);
    const midY = Math.floor(ROWS / 2);
    snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
    ];
    dir = "right";
    queuedDir = "right";
    score = 0;
    dead = false;
    running = false;
    scoreEl.textContent = "0";
    placeFood();
    draw();
    showOverlay("Ready?", "Use arrow keys or WASD. Press Space to start.");
  }

  function placeFood() {
    const taken = new Set(snake.map((s) => `${s.x},${s.y}`));
    let spot;
    do {
      spot = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (taken.has(`${spot.x},${spot.y}`));
    food = spot;
  }

  function tick() {
    dir = queuedDir;
    const head = snake[0];
    const next = { x: head.x + DIRS[dir].x, y: head.y + DIRS[dir].y };

    const hitWall = next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS;
    const hitSelf = snake.some((seg) => seg.x === next.x && seg.y === next.y);

    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    snake.unshift(next);

    if (next.x === food.x && next.y === food.y) {
      score += 10;
      scoreEl.textContent = String(score);
      if (score > best) {
        best = score;
        localStorage.setItem(BEST_KEY, String(best));
        bestEl.textContent = String(best);
      }
      placeFood();
      schedule(Math.max(MIN_MS, START_MS - score));
    } else {
      snake.pop();
    }

    draw();
  }

  function schedule(ms) {
    clearInterval(timer);
    timer = setInterval(tick, ms);
  }

  function start() {
    if (dead) reset();
    if (running) return;
    running = true;
    overlay.classList.add("hidden");
    schedule(Math.max(MIN_MS, START_MS - score));
  }

  function pause() {
    if (!running || dead) return;
    running = false;
    clearInterval(timer);
    showOverlay("Paused", "Press Space to continue.");
  }

  function gameOver() {
    dead = true;
    running = false;
    clearInterval(timer);
    draw();
    showOverlay("Game over", "Press Enter or Space to play again.");
  }

  function showOverlay(title, hint) {
    overlayTitle.textContent = title;
    overlayHint.textContent = hint;
    overlay.classList.remove("hidden");
  }

  function draw() {
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    for (let x = 0; x <= COLS; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * TILE, 0);
      ctx.lineTo(x * TILE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE);
      ctx.lineTo(canvas.width, y * TILE);
      ctx.stroke();
    }

    ctx.fillStyle = "#f43f5e";
    roundRect(food.x * TILE + 3, food.y * TILE + 3, TILE - 6, TILE - 6, 4);

    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#4ade80" : "#22c55e";
      roundRect(seg.x * TILE + 1, seg.y * TILE + 1, TILE - 2, TILE - 2, 5);
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  function setDir(next) {
    if (!DIRS[next]) return;
    if (OPPOSITE[dir] === next && snake.length > 1) return;
    queuedDir = next;
    if (!running && !dead) start();
  }

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    a: "left",
    s: "down",
    d: "right",
    W: "up",
    A: "left",
    S: "down",
    D: "right",
  };

  window.addEventListener("keydown", (event) => {
    const mapped = keyMap[event.key];
    if (mapped) {
      event.preventDefault();
      setDir(mapped);
      return;
    }

    if (event.key === " " || event.code === "Space") {
      event.preventDefault();
      if (running) pause();
      else start();
    }

    if (event.key === "Enter" && dead) start();
  });

  document.querySelectorAll("[data-dir]").forEach((button) => {
    button.addEventListener("click", () => setDir(button.dataset.dir));
  });

  reset();
})();
