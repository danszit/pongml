const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;
const R_max = 0.1763;
const R_min = -0.1763;
const speedmod_large = 0.1;
const speedmod_small = 0.05;
// Array to store ball trail positions
const ballTrail = [];
const maxTrailLength = 10; // Number of trail balls before they disappear
const paddleSpeed = 6;

let ballSpeed = 2;
let theta_in;
let theta_out;
let R;
let R_new;


// Initialize player scores
let leftPlayerScore = 0;
let rightPlayerScore = 0;

const leftPaddle = {
    // start in the middle of the game on the left side
    x: grid * 2,
    y: canvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,
    dy: 0 // paddle velocity
};
const rightPaddle = {
    // start in the middle of the game on the right side
    x: canvas.width - grid * 3,
    y: canvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,
    dy: 0 // paddle velocity
};

const degree_init = 45;
const theta_init = degree_init * (Math.PI / 180);
const R_init = 1 / Math.tan((theta_init));

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: grid,
    height: grid,
    resetting: false,
    dx: (R_init*ballSpeed)/Math.sqrt(R_init*R_init+1) * (Math.random() < 0.5 ? 1 : -1),
    dy: (ballSpeed)/Math.sqrt(R_init*R_init+1) * (Math.random() < 0.5 ? 1 : -1)
};

function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

function bounceback(isleft, anglechange){
    theta_in = Math.atan(ball.dy/ball.dx);
    theta_out = Math.abs(theta_in) + anglechange;

    R = 1 / Math.tan((theta_out));
    if(theta_out <= 1.3962634 && theta_out >= 0){
        ballSpeed *= 1 + speedmod_large;
        ball.dx = Math.abs((R*ballSpeed)/Math.sqrt(R*R+1));
        ball.dy = Math.abs((ballSpeed)/Math.sqrt(R*R+1));
        direction_check(isleft);
    }
    else{
        R = 1/Math.tan(-theta_in);
        ballSpeed *= 1 + speedmod_large;
        ball.dx = Math.abs(R*ballSpeed)/Math.sqrt(R*R+1);
        ball.dy = Math.abs(ballSpeed)/Math.sqrt(R*R+1);
        direction_check(isleft);
    }
    console.log("theta in: " + theta_in * (180/Math.PI));
    console.log("theta out: " + Math.atan(ball.dy/ball.dx) * (180/Math.PI));
    console.log("angle: " + anglechange*(180/Math.PI));
    console.log("ball speed: " + ballSpeed);
}

function direction_check(isleft){
    if(isleft){
        if(theta_in < 0){
            ball.dx = ball.dx;
            ball.dy = ball.dy;
        }
        else{
            ball.dx = ball.dx;
            ball.dy = -ball.dy;
        }
    }
    else{
        if(theta_in < 0){
            ball.dx = -ball.dx;
            ball.dy = -ball.dy;
        }
        else{
            ball.dx = -ball.dx;
            ball.dy = ball.dy;
        }
    }
}

// Main game loop
function loop() {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Move paddles by their velocity
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // Prevent paddles from going through walls
    leftPaddle.y = Math.max(grid, Math.min(maxPaddleY, leftPaddle.y));
    rightPaddle.y = Math.max(grid, Math.min(maxPaddleY, rightPaddle.y));

    // Draw paddles
    context.fillStyle = 'white';

    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Move ball by its velocity
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top/bottom walls
    if (ball.y < grid || ball.y + grid > canvas.height - grid) {
        ball.dy *= -1;
        ball.y = Math.max(grid, Math.min(canvas.height - grid - ball.height, ball.y));
    }

    // Reset ball and update scores when it goes past the paddles
    if (ball.x < 0 && !ball.resetting) {
        ball.resetting = true;
        rightPlayerScore++;
        resetBall();
    } else if (ball.x > canvas.width && !ball.resetting) {
        ball.resetting = true;
        leftPlayerScore++;
        resetBall();
    }

    // Ball collision with paddles
    if (collides(ball, leftPaddle)) {
        fromThebotton = Math.atan(ball.dy/ball.dx) < 0 ? true : false;
        let angle_change = checkcollition_pos(ball, leftPaddle, !fromThebotton);
        bounceback(true, angle_change);
        ball.x = leftPaddle.x + leftPaddle.width;
    } else if (collides(ball, rightPaddle)) {
        fromThebotton = Math.atan(ball.dy/ball.dx) < 0 ? false : true;
        let angle_change = checkcollition_pos(ball, rightPaddle, !fromThebotton);
        bounceback(false, angle_change);
        ball.x = rightPaddle.x - ball.width;
    }

    // Draw ball
    //context.fillRect(ball.x, ball.y, ball.width, ball.height);
    // Draw the ball trail
    //drawBallTrail();

    // Draw the current ball
    drawBall();

    // Draw walls
    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, canvas.width, grid);
    context.fillRect(0, canvas.height - grid, canvas.width, grid);

    // Draw dotted line down the middle
    for (let i = grid; i < canvas.height - grid; i += grid * 2) {
        context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
    }

    // Draw scores
    // context.fillStyle = 'white';
    // context.font = '30px Arial';
    // context.fillText(leftPlayerScore, canvas.width / 4, 50);
    // context.fillText(rightPlayerScore, (canvas.width * 3) / 4, 50);
    drawScores();

}

function test_draw_paddle_slices()
{
    context.fillStyle = 'red';

    context.fillRect(leftPaddle.x, leftPaddle.y+leftPaddle.height/2, leftPaddle.width, 2);
    context.fillRect(rightPaddle.x, rightPaddle.y+rightPaddle.height/2, rightPaddle.width, 2);

    context.fillStyle = 'red';

    context.fillRect(leftPaddle.x, leftPaddle.y+leftPaddle.height/2/3, leftPaddle.width, 2);
    context.fillRect(rightPaddle.x, rightPaddle.y+rightPaddle.height/2/3, rightPaddle.width, 2);

    context.fillStyle = 'red';

    context.fillRect(leftPaddle.x, leftPaddle.y+leftPaddle.height/2/3*2, leftPaddle.width, 2);
    context.fillRect(rightPaddle.x, rightPaddle.y+rightPaddle.height/2/3*2, rightPaddle.width, 2);

    context.fillStyle = 'red';

    context.fillRect(leftPaddle.x, leftPaddle.y+leftPaddle.height/2+leftPaddle.height/2/3, leftPaddle.width, 2);
    context.fillRect(rightPaddle.x, rightPaddle.y+rightPaddle.height/2+rightPaddle.height/2/3, rightPaddle.width, 2);

    context.fillStyle = 'red';

    context.fillRect(leftPaddle.x, leftPaddle.y+leftPaddle.height/2+leftPaddle.height/2/3*2, leftPaddle.width, 2);
    context.fillRect(rightPaddle.x, rightPaddle.y+rightPaddle.height/2+rightPaddle.height/2/3*2, rightPaddle.width, 2);
}

function test_ball_center(){
    context.fillStyle = 'red';

    context.fillRect(ball.x, ball.y + ball.height / 2, ball.width,2);
}

function checkcollition_pos(obj1, obj2, isFromBotton){
    ball_center_y = obj1.y + (obj1.height/2);
    //paddle_ball_distance = obj2.y + (obj2.height/2) - obj1.y + (obj1.height/2);
    splitter = obj2.height/6;

    if (ball_center_y < obj2.y + splitter){
        return isFromBotton ? (8 * (Math.PI/180)) : (-8 * (Math.PI/180));
    }
    else if (ball_center_y < obj2.y + 2 * splitter){
        return isFromBotton ? (4 * (Math.PI/180)) : (-4 * (Math.PI/180));
    }
    else if (ball_center_y < obj2.y + 3 * splitter){
        return isFromBotton ? (2 * (Math.PI/180)) : (-2 * (Math.PI/180));
    }
    else if (ball_center_y < obj2.y + 4 * splitter){
        return isFromBotton ? (-2 * (Math.PI/180)) : (2 * (Math.PI/180));
    }
    else if (ball_center_y < obj2.y + 5 * splitter){
        return isFromBotton ? (-4 * (Math.PI/180)) : (4 * (Math.PI/180));
    }
    else if (ball_center_y > obj2.y + 5 * splitter){
        return isFromBotton ? (-8 * (Math.PI/180)) : (8 * (Math.PI/180));
    }
    else{
        return (0 * (Math.PI/180));
    }


    // if (paddle_ball_distance >= 0 && paddle_ball_distance < splitter){
    //     return isFromBotton ? (2 * (Math.PI/180)) : (-2 * (Math.PI/180));
    // }
    // else if (paddle_ball_distance > splitter && paddle_ball_distance < (splitter * 2)){
    //     return isFromBotton ? (4 * (Math.PI/180)) : (-4 * (Math.PI/180));
    // }
    // else if (paddle_ball_distance > (splitter * 2)){
    //     return isFromBotton ? (8 * (Math.PI/180)) : (-8 * (Math.PI/180));
    // }
    // else if (paddle_ball_distance < 0 && paddle_ball_distance > (-splitter)){
    //     return isFromBotton ? (-2 * (Math.PI/180)) : (2 * (Math.PI/180));
    // }
    // else if ((paddle_ball_distance < (-splitter)) && paddle_ball_distance > ((-splitter) * 2)){
    //     return isFromBotton ? (-4 * (Math.PI/180)) : (4 * (Math.PI/180));
    // }
    // else if (paddle_ball_distance < ((-splitter) * 2)){
    //     return isFromBotton ? (-8 * (Math.PI/180)) : (8 * (Math.PI/180));
    // }
    // else{
    //     return (0 * (Math.PI/180));
    // }
}

// Function to draw the ball with a trailing effect
function drawBallTrail() {
    // Add the current ball position to the trail
    ballTrail.push({ x: ball.x, y: ball.y });

    // Limit the length of the trail
    if (ballTrail.length > maxTrailLength) {
        ballTrail.shift(); // Remove the oldest position if the trail is too long
    }

    // Draw each position in the trail with progressively decreasing opacity
    for (let i = 0; i < ballTrail.length; i++) {
        const opacity = (i / maxTrailLength); // Calculate opacity based on position in the trail
        context.fillStyle = `rgba(255, 255, 255, ${opacity})`; // White color with varying opacity
        const trailBall = ballTrail[i];
        context.beginPath();
        context.arc(trailBall.x + ball.width / 2, trailBall.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2);
        context.fill();
    }
}

// Function to draw the ball itself
function drawBall() {
    // context.fillStyle = 'white';
    // context.fillRect(ball.x, ball.y, ball.width, ball.height);
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2);
    context.fill();
}

// Function to create a rainbow gradient for the score
function getRainbowGradient(context, x, y, width) {
    const gradient = context.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.16, 'orange');
    gradient.addColorStop(0.33, 'yellow');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(0.66, 'lightblue');
    gradient.addColorStop(0.83, 'indigo');
    gradient.addColorStop(1, 'violet');
    return gradient;
}

// Draw scores with rainbow effect if score > 10
function drawScores() {
    context.font = '30px Arial';

    // Left player score
    if (leftPlayerScore > 10) {
        context.fillStyle = getRainbowGradient(context, canvas.width / 4, 0, 50);
    } else {
        context.fillStyle = 'white';
    }
    context.fillText(leftPlayerScore, canvas.width / 4, 50);

    // Right player score
    if (rightPlayerScore > 10) {
        context.fillStyle = getRainbowGradient(context, (canvas.width * 3) / 4, 0, 50);
    } else {
        context.fillStyle = 'white';
    }
    context.fillText(rightPlayerScore, (canvas.width * 3) / 4, 50);
}

function resetBall() {
    setTimeout(() => {
        ballSpeed = 2;
        ball.resetting = false;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;

        theta_reset = Math.atan(ball.dy/ball.dx);

        R = 1 / Math.tan((theta_reset));

        ball.dx = (R*ballSpeed)/Math.sqrt(R*R+1);
        ball.dy = (ballSpeed)/Math.sqrt(R*R+1);
        //ball.dx = - ballSpeed;//0 * (Math.random() < 0.5 ? 1 : -1); // Randomize initial direction
        //ball.dy = -2* ballSpeed;// * (Math.random() < 0.5 ? 1 : -1);
    }, 400);
}

// Listen to keyboard events to move the paddles
document.addEventListener('keydown', function (e) {
    if (e.which === 38) { // Up arrow key
        rightPaddle.dy = -paddleSpeed;
    } else if (e.which === 40) { // Down arrow key
        rightPaddle.dy = paddleSpeed;
    }
    if (e.which === 87) { // 'W' key
        leftPaddle.dy = -paddleSpeed;
    } else if (e.which === 83) { // 'S' key
        leftPaddle.dy = paddleSpeed;
    }
});

// Stop the paddles when the key is released
document.addEventListener('keyup', function (e) {
    if (e.which === 38 || e.which === 40) {
        rightPaddle.dy = 0;
    }
    if (e.which === 87 || e.which === 83) {
        leftPaddle.dy = 0;
    }
});

// Start the game
requestAnimationFrame(loop);
