const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = 640, SCREEN_HEIGHT = 480;
const BALL_SIZE = 20;
const PADDLE_WIDTH = 10, PADDLE_HEIGHT = 60;
const INITIAL_BALL_SPEED_X = 5, INITIAL_BALL_SPEED_Y = 5;
const BALL_SPEED_INCREMENT = 0.2;
const PADDLE_SPEED = 7;
const BOUNDARY_THICKNESS = 10;
const FLASH_DURATION = 10;

let ballColor, paddleColor, boundaryColor;
let ball_x = SCREEN_WIDTH / 2, ball_y = SCREEN_HEIGHT / 2;
let ball_speed_x = INITIAL_BALL_SPEED_X, ball_speed_y = INITIAL_BALL_SPEED_Y;
let paddle1_y = (SCREEN_HEIGHT - PADDLE_HEIGHT) / 2;
let paddle2_y = (SCREEN_HEIGHT - PADDLE_HEIGHT) / 2;
let score_left = 0, score_right = 0;
let flash_counter_left = 0, flash_counter_right = 0;
let offset1 = 0, offset2 = 0;
let frameCount = 0;

function initializeColors() {
    ballColor = getRandomColor();
    paddleColor = getRandomColor();
    boundaryColor = getRandomColor();
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function draw() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw boundary lines with randomized color
        ctx.fillStyle = boundaryColor;
        ctx.fillRect(0, 0, SCREEN_WIDTH, BOUNDARY_THICKNESS);
        ctx.fillRect(0, SCREEN_HEIGHT - BOUNDARY_THICKNESS, SCREEN_WIDTH, BOUNDARY_THICKNESS);

    // Draw paddles with flash effect and randomized color
       ctx.fillStyle = flash_counter_left > 0 ? 'red' : paddleColor;
       ctx.fillRect(0, paddle1_y, PADDLE_WIDTH, PADDLE_HEIGHT);
       ctx.fillStyle = flash_counter_right > 0 ? 'red' : paddleColor;
       ctx.fillRect(SCREEN_WIDTH - PADDLE_WIDTH, paddle2_y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball with randomized color
       ctx.beginPath();
       ctx.arc(ball_x, ball_y, BALL_SIZE / 2, 0, Math.PI * 2, false);
       ctx.fillStyle = ballColor;
       ctx.fill();
    
    // Draw score
        ctx.font = '50px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`${score_left} - ${score_right}`, SCREEN_WIDTH / 2 - 50, 50);
    }

function update() {
    ball_x += ball_speed_x;
    ball_y += ball_speed_y;

    // Ball collision with top/bottom boundaries
    if (ball_y <= BOUNDARY_THICKNESS || ball_y >= SCREEN_HEIGHT - BALL_SIZE - BOUNDARY_THICKNESS) {
        ball_speed_y *= -1;
    }

    // Ball collision with paddles
    if (ball_x <= PADDLE_WIDTH && paddle1_y < ball_y && ball_y < paddle1_y + PADDLE_HEIGHT) {
        ball_speed_x *= -1;
        ball_speed_x += BALL_SPEED_INCREMENT * Math.sign(ball_speed_x);
        flash_counter_left = FLASH_DURATION;
    } else if (ball_x >= SCREEN_WIDTH - PADDLE_WIDTH - BALL_SIZE && paddle2_y < ball_y && ball_y < paddle2_y + PADDLE_HEIGHT) {
        ball_speed_x *= -1;
        ball_speed_x += BALL_SPEED_INCREMENT * Math.sign(ball_speed_x);
        flash_counter_right = FLASH_DURATION;
    }

    // Update randomness every 30 frames
    if (frameCount % 30 === 0) {
        offset1 = Math.random() * 20 - 10;
        offset2 = Math.random() * 20 - 10;
    }
    frameCount++;

    movePaddle();

    // Check scores for reset
    if (ball_x < 0 || ball_x > SCREEN_WIDTH) {
        if (ball_x < 0) score_right++;
        else score_left++;

        if (score_left === 3 || score_right === 3) {
            flashScreen();
            resetGame();
        } else {
            resetBall();
        }
    }

    // Update flash counters
    if (flash_counter_left > 0) flash_counter_left--;
    if (flash_counter_right > 0) flash_counter_right--;

    draw();
}

function movePaddle() {
    // Move left paddle only when ball is moving towards it
    if (ball_speed_x < 0) {
        if (paddle1_y + PADDLE_HEIGHT / 2 < ball_y + offset1) {
            paddle1_y += Math.min(PADDLE_SPEED, ball_y - (paddle1_y + PADDLE_HEIGHT / 2) + offset1);
        } else if (paddle1_y + PADDLE_HEIGHT / 2 > ball_y + offset1) {
            paddle1_y -= Math.min(PADDLE_SPEED, (paddle1_y + PADDLE_HEIGHT / 2) - ball_y - offset1);
        }
    }

    // Move right paddle only when ball is moving towards it
    if (ball_speed_x > 0) {
        if (paddle2_y + PADDLE_HEIGHT / 2 < ball_y + offset2) {
            paddle2_y += Math.min(PADDLE_SPEED, ball_y - (paddle2_y + PADDLE_HEIGHT / 2) + offset2);
        } else if (paddle2_y + PADDLE_HEIGHT / 2 > ball_y + offset2) {
            paddle2_y -= Math.min(PADDLE_SPEED, (paddle2_y + PADDLE_HEIGHT / 2) - ball_y - offset2);
        }
    }
}

function resetBall() {
    ball_x = SCREEN_WIDTH / 2;
    ball_y = SCREEN_HEIGHT / 2;
   // ball_speed_x = INITIAL_BALL_SPEED_X * Math.sign(Math.random() * 2 - 1); // Randomize initial direction
   // ball_speed_y = INITIAL_BALL_SPEED_Y * Math.sign(Math.random() * 2 - 1);
}

function resetGame() {
    resetBall();
    ball_speed_x = INITIAL_BALL_SPEED_X;
    ball_speed_y = INITIAL_BALL_SPEED_Y;
    score_left = 0;
    score_right = 0;
    frameCount = 0;
    initializeColors(); // Randomize colors upon reset
}

function flashScreen() {
    const randomColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    canvas.style.backgroundColor = randomColor;
    setTimeout(() => {
        canvas.style.backgroundColor = 'black';
    }, 100); // Flash duration in milliseconds
}

// Initialize colors at the start of the game
initializeColors();
setInterval(update, 1000 / 60); // Update at 60 frames per second
