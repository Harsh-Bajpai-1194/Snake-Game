const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const levelGrid = document.getElementById("levelGrid");
const overlay = document.getElementById("levelOverlay");
const gameUI = document.getElementById("gameUI");
const box = 20;
let snake, direction, nextDirection, food, score, level, speed, game;
let doorOpen = false;
const totalLevels = 5;
let unlocked = 5;
for (let i = 1; i <= totalLevels; i++) {
    const div = document.createElement("div");
    div.classList.add("level");
    if (i > unlocked) div.classList.add("locked");
    div.innerText = i;
    const stars = document.createElement("div");
    stars.classList.add("stars");
    stars.innerText = "★★★";
    div.appendChild(stars);
    div.addEventListener("click", () => {
        if (!div.classList.contains("locked")) {
            startGame(i);
        }
    });
    levelGrid.appendChild(div);
}
function isWall(x, y) {
    if (doorOpen) {
        if (level === 1 && x === 0 && y === canvas.height / 2) return false;
        if (level === 2 && x === canvas.width / 2 && y === 0) return false;
        if (level === 3 && x === canvas.width - box && y === canvas.height / 2) return false;
        if (level === 4 && x === canvas.width / 2 && y === canvas.height - box) return false;
        if (level === 5 && x === canvas.width / 2 && y === canvas.height / 2) return false;
    }
    return (
        x === 0 ||
        y === 0 ||
        x === canvas.width - box ||
        y === canvas.height - box
    );
}
function drawWalls() {
    ctx.fillStyle = "brown";
    for (let x = 0; x < canvas.width; x += box) {
        for (let y = 0; y < canvas.height; y += box) {
            if (isWall(x, y)) {
                ctx.fillRect(x, y, box, box);
            }
        }
    }
    if (doorOpen) {
        ctx.fillStyle = "black";
        if (level === 1) ctx.fillRect(0, canvas.height / 2, box, box);
        else if (level === 2) ctx.fillRect(canvas.width / 2, 0, box, box);
        else if (level === 3) ctx.fillRect(canvas.width - box, canvas.height / 2, box, box);
        else if (level === 4) ctx.fillRect(canvas.width / 2, canvas.height - box, box, box);
        else if (level === 5) ctx.fillRect(canvas.width / 2, canvas.height / 2, box, box);
    }
}
function spawnFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
    } while (
        snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
        isWall(newFood.x, newFood.y)
    );
    return newFood;
}
function startGame(lvl) {
    overlay.style.display = "none";
    gameUI.style.display = "flex";
    level = lvl;
    speed = 220 - (lvl * 15);
    snake = [{ x: 5 * box, y: 5 * box }];
    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    doorOpen = false;
    scoreEl.textContent = "Score: " + score;
    levelEl.textContent = "Level: " + level;
    food = spawnFood();
    clearInterval(game);
    game = setInterval(draw, speed);
}
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
    if (event.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
    if (event.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
    if (event.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
});
document.getElementById("btnUp").addEventListener("click", () => {
    if (direction !== "DOWN") nextDirection = "UP";
});
document.getElementById("btnDown").addEventListener("click", () => {
    if (direction !== "UP") nextDirection = "DOWN";
});
document.getElementById("btnLeft").addEventListener("click", () => {
    if (direction !== "RIGHT") nextDirection = "LEFT";
});
document.getElementById("btnRight").addEventListener("click", () => {
    if (direction !== "LEFT") nextDirection = "RIGHT";
});
function draw() {
    direction = nextDirection;
// 1. Fill entire canvas (outside area color)
ctx.fillStyle = "lightblue";  // changed from "#222" to light blue
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 2. Fill inner play area (inside walls)
ctx.fillStyle = "#000";
ctx.fillRect(box, box, canvas.width - 2 * box, canvas.height - 2 * box);
// 3. Draw walls
drawWalls();

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            ctx.fillStyle = "#0f0"; // head
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.fillStyle = "#000"; // eyes
            ctx.fillRect(snake[i].x + 4, snake[i].y + 4, 4, 4);
            ctx.fillRect(snake[i].x + 12, snake[i].y + 4, 4, 4);
        } else {
            ctx.fillStyle = "#0a0"; // body
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
        }
    }

    // Draw food
    ctx.font = box + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍎", food.x + box / 2, food.y + box / 2);

    if (score >= 5) doorOpen = true;

    // Move snake
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;
    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    // Check if ate food
    if (snakeX === food.x && snakeY === food.y) {
        score++;
        scoreEl.textContent = "Score: " + score;
        food = spawnFood();
    } else {
        snake.pop();
    }

    const newHead = { x: snakeX, y: snakeY };

    // --- Game Over condition ---
    if (
        isWall(snakeX, snakeY) ||
        snake.some(s => s.x === newHead.x && s.y === newHead.y)
    ) {
        clearInterval(game);

        // Show Game Over Screen
        const gameOverScreen = document.getElementById("gameOverScreen");
        gameOverScreen.style.display = "flex";
        gameOverScreen.textContent = "       GAME OVER\nScore: " + score;

        // After 3 seconds, return to menu
        setTimeout(() => {
            gameOverScreen.style.display = "none";
            overlay.style.display = "flex";
            gameUI.style.display = "none";
        }, 3000);

        return; // stop here
    }

    // --- Level Cleared condition (check before collision) ---
if (doorOpen) {
    if (
        (level === 1 && snakeX === 0 && snakeY === canvas.height / 2) ||
        (level === 2 && snakeX === canvas.width / 2 && snakeY === 0) ||
        (level === 3 && snakeX === canvas.width - box && snakeY === canvas.height / 2) ||
        (level === 4 && snakeX === canvas.width / 2 && snakeY === canvas.height - box) ||
        (level === 5 && snakeX === canvas.width / 2 && snakeY === canvas.height / 2)
    ) {
        clearInterval(game);

        // Show "Level Cleared"
        const gameOverScreen = document.getElementById("gameOverScreen");
        gameOverScreen.style.display = "flex";
        gameOverScreen.textContent = "🎉 Level " + level + " Cleared!";

        // Return to menu after 2 sec
        setTimeout(() => {
            gameOverScreen.style.display = "none";
            overlay.style.display = "flex";
            gameUI.style.display = "none";
        }, 2000);

        return; // ✅ important, stop draw()
    }
}

// --- Game Over condition ---
if (
    isWall(snakeX, snakeY) ||
    snake.some(s => s.x === snakeX && s.y === snakeY)
) {
    clearInterval(game);

    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "flex";
    gameOverScreen.textContent = "GAME OVER\nScore: " + score;

    setTimeout(() => {
        gameOverScreen.style.display = "none";
        overlay.style.display = "flex";
        gameUI.style.display = "none";
    }, 3000);

    return;
}
    snake.unshift(newHead);
}
const introImage = document.getElementById("introImage");
const introImage1 = document.getElementById("introImage1");
introImage.style.display = "block";
introImage1.style.display = "none";
setTimeout(() => {
    introImage.style.display = "none";
    introImage1.style.display = "block";
    setTimeout(() => {
        introImage1.style.display = "none";
        overlay.style.display = "flex";
    }, 2000);
}, 2000);