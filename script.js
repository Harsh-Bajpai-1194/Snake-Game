const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const levelGrid = document.getElementById("levelGrid");
const overlay = document.getElementById("levelOverlay");
const colorOverlay = document.getElementById("colorSelectionOverlay");
const colorGrid = document.getElementById("colorGrid");
const backBtn = document.getElementById("backToColors");
const gameUI = document.getElementById("gameUI");
const box = 20;

let snake, direction, nextDirection, food, score, level, speed, game;
let doorOpen = false;
const totalLevels = 7;
let unlocked = 7;

// ⚡ Gate blinking variables
let gateBlinkColor = "black";
let blinkInterval = null;

// --- COLOR SELECTION SYSTEM (From GitHub Issue Style) ---
const snakeColors = [
    { name: "Green", head: "#00FF00", body: "#00aa00" },
    { name: "Blue", head: "#007BFF", body: "#0056b3" },
    { name: "Purple", head: "#A020F0", body: "#6a0dad" },
    { name: "Orange", head: "#FF4500", body: "#cc3700" },
    { name: "Red", head: "#DC3545", body: "#a71d2a" },
    { name: "Yellow", head: "#FFFF00", body: "#cccc00" }
];

let selectedColor = snakeColors[0]; // Default color configuration

const level7Reference = { width: 577, height: 536 };
const level7CornerWalls = [
    sourceRect(44, 18, 82, 74, "top-left"),
    sourceRect(465, 18, 83, 78, "top-right"),
    sourceRect(44, 442, 86, 79, "bottom-left"),
    sourceRect(459, 436, 86, 85, "bottom-right")
];

const level7WallRects = [
    ...level7CornerWalls,
    sourceRect(126, 19, 339, 25),
    sourceRect(44, 92, 25, 350),
    sourceRect(519, 96, 25, 340),
    sourceRect(130, 494, 329, 25)
];

const level7CornerDetailRects = [
    sourceRect(76, 44, 15, 1),
    sourceRect(94, 44, 27, 1),
    sourceRect(69, 48, 1, 20),
    sourceRect(69, 71, 1, 16),
    sourceRect(470, 44, 21, 1),
    sourceRect(494, 44, 22, 1),
    sourceRect(518, 47, 1, 20),
    sourceRect(518, 70, 1, 21),
    sourceRect(69, 447, 1, 21),
    sourceRect(69, 471, 1, 20),
    sourceRect(77, 493, 18, 1),
    sourceRect(98, 493, 26, 1),
    sourceRect(466, 493, 25, 1),
    sourceRect(494, 493, 21, 1),
    sourceRect(518, 443, 1, 21),
    sourceRect(518, 467, 1, 24)
];

function sourceRect(x, y, width, height, type) {
    const scaleX = canvas.width / level7Reference.width;
    const scaleY = canvas.height / level7Reference.height;

    return {
        x: x * scaleX,
        y: y * scaleY,
        width: width * scaleX,
        height: height * scaleY,
        type
    };
}

function getGatePosition(lvl) {
    const gates = {
        1: { x: 0, y: canvas.height / 2 },
        2: { x: canvas.width / 2, y: 0 },
        3: { x: canvas.width - box, y: canvas.height / 2 },
        4: { x: canvas.width / 2, y: canvas.height - box },
        5: { x: canvas.width / 2, y: 0 },
        6: { x: canvas.width - box, y: canvas.height / 2 + 4 * box },
        7: { x: canvas.width - box, y: canvas.height / 2 + 4 * box }
    };

    return gates[lvl];
}

function getLevelSpeed(lvl) {
    return lvl >= 6 ? 220 - (6 * 15) : 220 - (lvl * 15);
}

// 1. Generate Flat Color Grid Blocks
snakeColors.forEach(color => {
    const block = document.createElement("div");
    block.classList.add("color-box");
    block.style.backgroundColor = color.head;
    
    block.addEventListener("click", () => {
        selectedColor = color;
        colorOverlay.style.display = "none";
        overlay.style.display = "flex"; // Navigate to Level Select screen
    });
    colorGrid.appendChild(block);
});

// 2. Back Navigation Logic
if (backBtn) {
    backBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        colorOverlay.style.display = "flex"; // Return to choice matrix
    });
}

// --- Create Level Buttons ---
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
        if (!div.classList.contains("locked")) startGame(i);
    });
    levelGrid.appendChild(div);
}

// --- WALL LOGIC ---
function isWall(x, y) {
    const gate = getGatePosition(level);
    if (doorOpen) {
        if (gate && x === gate.x && y === gate.y) return false;
    }

    if (level === 7) {
        return level7WallRects.some(rect => isInsideRect(x, y, rect));
    }

    return (
        x === 0 ||
        y === 0 ||
        x === canvas.width - box ||
        y === canvas.height - box
    );
}

function isInsideRect(x, y, rect) {
    return (
        x < rect.x + rect.width &&
        x + box > rect.x &&
        y < rect.y + rect.height &&
        y + box > rect.y
    );
}

function drawWalls() {
    if (level === 7) {
        drawLevel7Walls();
        return;
    }

    ctx.fillStyle = "brown";
    for (let x = 0; x < canvas.width; x += box) {
        for (let y = 0; y < canvas.height; y += box) {
            if (isWall(x, y)) ctx.fillRect(x, y, box, box);
        }
    }

    if (doorOpen) {
        const gate = getGatePosition(level);
        ctx.fillStyle = gateBlinkColor;
        if (gate) ctx.fillRect(gate.x, gate.y, box, box);
    }
}

function drawLevel7Walls() {
    ctx.fillStyle = "#a52a2a";
    level7WallRects
        .filter(rect => !rect.type)
        .forEach(rect => ctx.fillRect(rect.x, rect.y, rect.width, rect.height));

    ctx.fillStyle = "#ff1a1a";
    level7CornerWalls.forEach(rect => ctx.fillRect(rect.x, rect.y, rect.width, rect.height));
    drawLevel7CornerDetails();

    if (doorOpen) {
        const gate = getGatePosition(level);
        ctx.fillStyle = gateBlinkColor;
        if (gate) ctx.fillRect(gate.x, gate.y, box, box);
    }
}

function drawLevel7CornerDetails() {
    ctx.fillStyle = "#000";
    level7CornerDetailRects.forEach(rect => {
        ctx.fillRect(
            rect.x,
            rect.y,
            Math.max(1, rect.width),
            Math.max(1, rect.height)
        );
    });
}

// --- FOOD SPAWN ---
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

// --- START GAME ---
function startGame(lvl) {
    overlay.style.display = "none";
    gameUI.style.display = "flex";
    level = lvl;
    canvas.style.border = lvl === 7 ? "none" : "2px solid brown";
    speed = getLevelSpeed(lvl);
    snake = [{ x: 5 * box, y: 5 * box }];
    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    doorOpen = false;
    scoreEl.textContent = "Score: " + score;
    levelEl.textContent = "Level: " + level;
    food = spawnFood();

    clearInterval(blinkInterval);
    gateBlinkColor = "black";

    clearInterval(game);
    game = setInterval(draw, speed);
}

// --- CONTROLS ---
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

// --- DRAW LOOP ---
function draw() {
    direction = nextDirection;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (level !== 7) {
        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        ctx.fillRect(box, box, canvas.width - 2 * box, canvas.height - 2 * box);
    }

    drawWalls();

    // Render snake using selected parameters dynamically
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            ctx.fillStyle = selectedColor.head; 
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.fillStyle = "#000";
            ctx.fillRect(snake[i].x + 4, snake[i].y + 4, 4, 4);
            ctx.fillRect(snake[i].x + 12, snake[i].y + 4, 4, 4);
        } else {
            ctx.fillStyle = selectedColor.body; 
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
        }
    }

    // Food
    ctx.font = box + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍎", food.x + box / 2, food.y + box / 2);

    if (score >= 5 && !doorOpen) {
        doorOpen = true;
        blinkInterval = setInterval(() => {
            gateBlinkColor = gateBlinkColor === "black" ? "yellow" : "black";
        }, 400);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;
    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        scoreEl.textContent = "Score: " + score;
        food = spawnFood();
    } else {
        snake.pop();
    }

    const newHead = { x: snakeX, y: snakeY };

    // --- LEVEL CLEARED ---
    if (doorOpen) {
        const gate = getGatePosition(level);
        if (gate && snakeX === gate.x && snakeY === gate.y) {
            clearInterval(game);
            clearInterval(blinkInterval);
            const gameOverScreen = document.getElementById("gameOverScreen");
            gameOverScreen.style.display = "flex";
            gameOverScreen.textContent = "🎉 Level " + level + " Cleared!";
            setTimeout(() => {
                gameOverScreen.style.display = "none";
                overlay.style.display = "flex";
                gameUI.style.display = "none";
            }, 2000);
            return;
        }
    }

    // --- GAME OVER ---
    if (
        isWall(snakeX, snakeY) ||
        snake.some(s => s.x === newHead.x && s.y === newHead.y)
    ) {
        clearInterval(game);
        clearInterval(blinkInterval);
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

// --- INTRO SEQUENCE INTERACTION ---
const introImage = document.getElementById("introImage");
if (introImage) {
    introImage.style.display = "block";
    setTimeout(() => {
        introImage.style.display = "none";
        colorOverlay.style.display = "flex"; 
    }, 2000);
} else {
    colorOverlay.style.display = "flex";
}
