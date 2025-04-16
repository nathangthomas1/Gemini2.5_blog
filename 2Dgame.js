const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// --- Game Constants & Variables ---
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GROUND_Y = CANVAS_HEIGHT - 50; // Y position of the ground
const DINO_WIDTH = 40;
const DINO_HEIGHT = 60;
const OBSTACLE_MIN_WIDTH = 20;
const OBSTACLE_MAX_WIDTH = 50;
const OBSTACLE_HEIGHT = 45;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12; // Negative value means moving upwards
const INITIAL_GAME_SPEED = 5;
const GAME_SPEED_INCREMENT = 0.001; // How much speed increases over time
const MIN_OBSTACLE_SPAWN_INTERVAL = 50; // Minimum frames between spawns
const MAX_OBSTACLE_SPAWN_INTERVAL = 120; // Maximum frames between spawns

let dino = {
    x: 50,
    y: GROUND_Y - DINO_HEIGHT,
    width: DINO_WIDTH,
    height: DINO_HEIGHT,
    dy: 0, // Vertical velocity
    isJumping: false
};

let obstacles = [];
let score = 0;
let frameCount = 0;
let gameSpeed = INITIAL_GAME_SPEED;
let nextObstacleSpawnFrame = 0; // Frame count when next obstacle should spawn
let isGameOver = false;
let animationFrameId = null; // To store the requestAnimationFrame ID

// --- Drawing Functions ---

function drawGround() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
}

function drawDino() {
    ctx.fillStyle = 'green';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacle(obstacle) {
    ctx.fillStyle = 'red';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawScore() {
    scoreDisplay.textContent = `Score: ${Math.floor(score)}`;
}

// --- Game Logic Functions ---

function updateDino() {
    // Apply gravity
    if (dino.y + dino.height < GROUND_Y || dino.dy < 0) {
        dino.dy += GRAVITY;
        dino.y += dino.dy;
    }

    // Prevent falling through ground
    if (dino.y + dino.height > GROUND_Y) {
        dino.y = GROUND_Y - dino.height;
        dino.dy = 0;
        dino.isJumping = false;
    }
}

function jump() {
    if (!dino.isJumping && !isGameOver) {
        dino.dy = JUMP_STRENGTH;
        dino.isJumping = true;
    }
}

function spawnObstacle() {
    const width = Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH) + OBSTACLE_MIN_WIDTH;
    const obstacle = {
        x: CANVAS_WIDTH,
        y: GROUND_Y - OBSTACLE_HEIGHT,
        width: width,
        height: OBSTACLE_HEIGHT
    };
    obstacles.push(obstacle);

    // Set next spawn time
    const spawnInterval = Math.floor(Math.random() * (MAX_OBSTACLE_SPAWN_INTERVAL - MIN_OBSTACLE_SPAWN_INTERVAL + 1)) + MIN_OBSTACLE_SPAWN_INTERVAL;
    nextObstacleSpawnFrame = frameCount + spawnInterval;
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= gameSpeed;

        // Remove obstacles that are off-screen
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function checkCollision() {
    for (const obstacle of obstacles) {
        // Simple AABB (Axis-Aligned Bounding Box) collision detection
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function updateScore() {
    score += 0.1; // Increment score based on time/frames survived
}

function increaseGameSpeed() {
    gameSpeed += GAME_SPEED_INCREMENT;
}

function resetGame() {
    // Reset all variables to initial states
    dino = {
        x: 50,
        y: GROUND_Y - DINO_HEIGHT,
        width: DINO_WIDTH,
        height: DINO_HEIGHT,
        dy: 0,
        isJumping: false
    };
    obstacles = [];
    score = 0;
    frameCount = 0;
    gameSpeed = INITIAL_GAME_SPEED;
    isGameOver = false;
    nextObstacleSpawnFrame = Math.floor(Math.random() * (MAX_OBSTACLE_SPAWN_INTERVAL - MIN_OBSTACLE_SPAWN_INTERVAL + 1)) + MIN_OBSTACLE_SPAWN_INTERVAL; // Initial spawn time


    // Hide game over screen and restart button
    gameOverDisplay.style.display = 'none';

    // Clear any previous animation frame request
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // Start the game loop again
    gameLoop();
}


// --- Game Loop ---

function gameLoop() {
    if (isGameOver) {
        gameOverDisplay.style.display = 'flex'; // Show game over screen
        return; // Stop the loop
    }

    // 1. Clear Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Update Game State
    frameCount++;
    updateDino();
    updateObstacles();
    updateScore();
    increaseGameSpeed();

    // Spawn obstacles based on frame count
    if (frameCount >= nextObstacleSpawnFrame) {
        spawnObstacle();
    }

    // Check for collisions
    if (checkCollision()) {
        isGameOver = true;
    }

    // 3. Draw Everything
    drawGround();
    drawDino();
    obstacles.forEach(drawObstacle);
    drawScore();

    // 4. Request Next Frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Event Listeners ---

document.addEventListener('keydown', (event) => {
    // Use ' ' or 'Space' depending on browser implementation
    if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); // Prevent spacebar from scrolling the page
        jump();
    }
});

// Also allow jump on touch/click for mobile friendliness
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent default touch behavior (like scrolling)
    jump();
});
canvas.addEventListener('mousedown', (event) => {
    event.preventDefault(); // Prevent text selection on canvas
    jump();
});


restartButton.addEventListener('click', resetGame);

// --- Start the Game ---
resetGame(); // Initialize and start the game loop
