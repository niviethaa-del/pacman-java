
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const statusElement = document.getElementById("status");

const TILE = 32;

// X = wall, . = food, P = Pac-Man, G = ghost
const originalMap = [
  "XXXXXXXXXXXXXXXXXXX",
  "X........X........X",
  "X.XX.XX.X.XX.XX.X.X",
  "X.................X",
  "X.XX.X.XXXXX.X.XX.X",
  "X....X.......X....X",
  "XXXX.XXXX.XXXX.XXXX",
  "X.................X",
  "X.XX.X.XXX.X.X.XX.X",
  "X....X...G...X....X",
  "XXXX.X.XXXXX.X.XXXX",
  "X.................X",
  "X.XX.X.XXXXX.X.XX.X",
  "X....X...G...X....X",
  "X.XX.XX.X.XX.XX.X.X",
  "X......P..........X",
  "XX.X.X.XXXXX.X.X.XX",
  "X....X.......X....X",
  "X.XXXXXX.X.XXXXXX.X",
  "X.................X",
  "XXXXXXXXXXXXXXXXXXX"
];

let map;
let pacman;
let ghosts;
let score;
let gameOver;
let won;
let lastTime = 0;
let moveTimer = 0;

const images = {};
const spriteFiles = {
  wall: "wall.png",
  up: "pacmanUp.png",
  down: "pacmanDown.png",
  left: "pacmanLeft.png",
  right: "pacmanRight.png",
  red: "redGhost.png",
  blue: "blueGhost.png",
  pink: "pinkGhost.png",
  orange: "orangeGhost.png"
};

for (const [name, src] of Object.entries(spriteFiles)) {
  const img = new Image();
  img.src = src;
  images[name] = img;
}

function resetGame() {
  map = originalMap.map(row => row.split(""));
  pacman = { x: 7, y: 15, dir: "right", nextDir: "right" };
  ghosts = [
    { x: 9, y: 9, dir: "left", image: "red" },
    { x: 9, y: 13, dir: "right", image: "blue" }
  ];
  score = 0;
  gameOver = false;
  won = false;
  scoreElement.textContent = score;
  statusElement.textContent = "Use arrow keys or WASD to play!";
}

function isWall(x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
    return true;
  }
  return map[y][x] === "X";
}

function canMove(x, y, dir) {
  let nx = x;
  let ny = y;

  if (dir === "up") ny--;
  if (dir === "down") ny++;
  if (dir === "left") nx--;
  if (dir === "right") nx++;

  return !isWall(nx, ny);
}

function movePacman() {
  if (canMove(pacman.x, pacman.y, pacman.nextDir)) {
    pacman.dir = pacman.nextDir;
  }

  if (canMove(pacman.x, pacman.y, pacman.dir)) {
    if (pacman.dir === "up") pacman.y--;
    if (pacman.dir === "down") pacman.y++;
    if (pacman.dir === "left") pacman.x--;
    if (pacman.dir === "right") pacman.x++;
  }

  // Eat food
  if (map[pacman.y][pacman.x] === ".") {
    map[pacman.y][pacman.x] = " ";
    score += 10;
    scoreElement.textContent = score;
  }

  // Check ghost collision
  for (const ghost of ghosts) {
    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      gameOver = true;
      statusElement.textContent = "Game over! Press Enter to restart.";
    }
  }

  const remainingFood = map.some(row => row.includes("."));
  if (!remainingFood && !gameOver) {
    won = true;
    gameOver = true;
    statusElement.textContent = "You win! Press Enter to play again.";
  }
}

function moveGhosts() {
  for (const ghost of ghosts) {
    const options = ["up", "down", "left", "right"]
      .filter(dir => canMove(ghost.x, ghost.y, dir));

    if (options.length && (!canMove(ghost.x, ghost.y, ghost.dir) ||
        Math.random() < 0.3)) {
      ghost.dir = options[Math.floor(Math.random() * options.length)];
    }

    if (canMove(ghost.x, ghost.y, ghost.dir)) {
      if (ghost.dir === "up") ghost.y--;
      if (ghost.dir === "down") ghost.y++;
      if (ghost.dir === "left") ghost.x--;
      if (ghost.dir === "right") ghost.x++;
    }

    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      gameOver = true;
      statusElement.textContent = "Game over! Press Enter to restart.";
    }
  }
}

function drawSprite(name, x, y, fallbackColor) {
  const img = images[name];

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x * TILE, y * TILE, TILE, TILE);
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x * TILE + 4, y * TILE + 4, TILE - 8, TILE - 8);
  }
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const tile = map[y][x];

      if (tile === "X") {
        drawSprite("wall", x, y, "#204bff");
      } else if (tile === ".") {
        ctx.fillStyle = "#ffe6b3";
        ctx.beginPath();
        ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawSprite(pacman.dir, pacman.x, pacman.y, "#ffe500");

  for (const ghost of ghosts) {
    drawSprite(ghost.image, ghost.x, ghost.y, "#ff4b8b");
  }
}

function frame(time) {
  const delta = time - lastTime;
  lastTime = time;
  moveTimer += delta;

  if (moveTimer > 150 && !gameOver) {
    movePacman();
    moveGhosts();
    moveTimer = 0;
  }

  draw();
  requestAnimationFrame(frame);
}

const keyDirections = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right"
};

document.addEventListener("keydown", event => {
  if (keyDirections[event.key]) {
    event.preventDefault();
    pacman.nextDir = keyDirections[event.key];
  }

  if (event.key === "Enter" && gameOver) {
    resetGame();
  }
});

resetGame();
requestAnimationFrame(frame);
