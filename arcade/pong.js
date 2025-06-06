const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');

let isPaused = false; 
let paddle1YPosition = 160;
let paddle2YPosition = 160;
let paddleSpeed = 20;
let ballXPosition = 290;
let ballYPosition = 190;
let ballXVelocity = 2;
let ballYVelocity = 2;
let player1Score = 0;
let player2Score = 0;

function movePaddles() {
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'w':
                if(paddle1YPosition > 0) paddle1YPosition -= paddleSpeed;
                break;
            case 's':
                if(paddle1YPosition < 320) paddle1YPosition += paddleSpeed;
                break;
            case 'ArrowUp':
                if(paddle2YPosition > 0) paddle2YPosition -= paddleSpeed;
                break;
            case 'ArrowDown':
                if(paddle2YPosition < 320) paddle2YPosition += paddleSpeed;
                break;
        }
        paddle1.style.top = paddle1YPosition + 'px';
        paddle2.style.top = paddle2YPosition + 'px';
    });
}

function moveBall() {

    if (isPaused) {
        return;
    }
    ballXPosition += ballXVelocity;
    ballYPosition += ballYVelocity;

    if(ballYPosition <= 0 || ballYPosition >= 385) ballYVelocity *= -1;

    // Collision with paddles
    if((ballXPosition <= 20 && ballYPosition > paddle1YPosition && ballYPosition < paddle1YPosition + 80) || 
       (ballXPosition >= 565 && ballYPosition > paddle2YPosition && ballYPosition < paddle2YPosition + 80)) {
        ballXVelocity *= -1;
    }

    // Scoring
    if(ballXPosition <= 0) {
        player2Score++;
        score2.innerText = player2Score;
        resetBall();
    } else if(ballXPosition >= 585) {
        player1Score++;
        score1.innerText = player1Score;
        resetBall();
    }

    // Ball position will be updated in the main game loop
}

function resetBall() {
    ballXPosition = 290; // Reset to the center of the game area
    ballYPosition = 190;
    ballXVelocity = ballXVelocity > 0 ? -2 : 2; // Change direction to start towards the scorer
    ballYVelocity = 2;
}

function gameLoop() {
    if (isPaused) {
        return;
    }

    moveBall();
    aiMovePaddle(); // Call AI movement function
    aiMovePaddle2();
    
    ball.style.left = ballXPosition + 'px';
    ball.style.top = ballYPosition + 'px';

   if (!isPaused) {
        requestAnimationFrame(gameLoop); // Continue the loop if not paused
    }
}

function startGame() {
    movePaddles(); // Set up paddle movement event listeners
    gameLoop(); // Start the game loop
}

// Start the game when the page has loaded
window.onload = startGame;

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseMenu').style.display = isPaused ? 'flex' : 'none';
    if (!isPaused) {
        gameLoop(); // Resume the game loop
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        togglePause();
    }
});

// Assume existing variables and game setup code is here

// Modify this part of the movePaddles function or its equivalent in your code
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w':
            if(paddle1YPosition > 0) paddle1YPosition -= paddleSpeed;
            break;
        case 's':
            if(paddle1YPosition < 320) paddle1YPosition += paddleSpeed;
            break;
        // Remove or comment out the controls for paddle2
    }
    paddle1.style.top = paddle1YPosition + 'px';
    // Paddle 2 movement will be controlled by AI logic now
});

function aiMovePaddle() {
    if (isPaused) {
        return;
    } // AI should not move if the game is paused
    
    // Simple AI for moving the paddle
    // This makes the AI paddle follow the ball, but not perfectly for a bit of fairness
    if (ballYPosition < paddle2YPosition + 35) { // The AI paddle moves up if the ball is in the upper half
        paddle2YPosition -= paddleSpeed * 0.5; // Adjust speed for difficulty (slower than human player)
    } else if (ballYPosition > paddle2YPosition + 45) { // The AI paddle moves down if the ball is in the lower half
        paddle2YPosition += paddleSpeed * 0.5; // Adjust speed for difficulty
    }

    // Prevent the AI paddle from moving out of the game area
    paddle2YPosition = Math.max(Math.min(paddle2YPosition, 320), 0);
    paddle2.style.top = paddle2YPosition + 'px';
}

function aiMovePaddle2() {
    if (isPaused) {
        return;
    } // AI should not move if the game is paused
    
    // Simple AI for moving the paddle
    // This makes the AI paddle follow the ball, but not perfectly for a bit of fairness
    if (ballYPosition < paddle1YPosition + 35) { // The AI paddle moves up if the ball is in the upper half
        paddle1YPosition -= paddleSpeed * 0.5; // Adjust speed for difficulty (slower than human player)
    } else if (ballYPosition > paddle1YPosition + 45) { // The AI paddle moves down if the ball is in the lower half
        paddle1YPosition += paddleSpeed * 0.5; // Adjust speed for difficulty
    }

    // Prevent the AI paddle from moving out of the game area
    paddle1YPosition = Math.max(Math.min(paddle1YPosition, 320), 0);
    paddle1.style.top = paddle1YPosition + 'px';
}
