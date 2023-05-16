let canvas;
let context;

let request_id;

let fpsInterval = 1000 / 30;
let now;
let then = Date.now();

let ran = false;

let player = {
    x : 0,
    y : 0,
    width : 64,
    height : 64,
    toleranceX : 16,
    toleranceY : 3,
    xChange : 0,
    yChange : 0,
};

let obstacles = [];
let enemies = [];
let grass1 = [];
let grass2 = [];
let points = [];

let floor;

let moveLeft = false;
let moveUp = false;
let moveRight = false;
let moveDown = false;

let numObstacles = 3;
let numEnemies = 3;
let enemiesAdded = 1;
let obstaclesAdded = 1;
let yScroll = 0;
let score = 0;
let frameCount = 0;
let scrollChange = 0;
let hudOffset = 8;

// Player sprite by Brad Gilberston https://brad-gilbertson.itch.io/16bit-race-car-set
let IMAGES = {player: "player.png", enemy : "enemy.png", obstacle : "obstacle1.png", 
                background: "sand.png", grass1 : "grass1.png", grass2 : "grass2.png", points : "score.png"};

document.addEventListener("DOMContentLoaded", init, false);
document.addEventListener("click", restart, false);

function menu() {
    context.drawImage(IMAGES.background, 0, 0, canvas.width, canvas.height);
    context.drawImage(IMAGES.player, player.x, player.y, player.width, player.height);

    context.strokeStyle = "rgba(255, 255, 255, 0)";
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();

    context.fillStyle = "rgba(0, 0, 0, 0.5)"
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#FFF";
    context.font = "32px Arial";
    context.textAlign = "center";
    context.fillText("Outrun the cops in the desert!", canvas.width / 2, canvas.height / 2 - 200);
    context.font  = "24px Arial";
    context.fillText("Dodge cops and cacti with the arrow keys.", canvas.width / 2, canvas.height / 2 - 88);
    context.fillText("As you draw further into the desert,", canvas.width / 2, canvas.height / 2 - 48);
    context.fillText("more obstacles will stand in your way.", canvas.width / 2, canvas.height / 2 - 8);
    context.fillText("The more cops you outrun, even more", canvas.width / 2, canvas.height / 2 + 32);
    context.fillText("will chase you, and the more aggressively!", canvas.width / 2, canvas.height / 2 + 72);
    context.font = "18px Arial";
    context.fillText("Click to play, or at any time to restart", canvas.width / 2, canvas.height / 2 + 200);
}

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    floor = canvas.height - 128;
    player.x = (canvas.width / 2) - player.width / 2;
    player.y = floor - player.height;


    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);

    if (ran) {draw();} 
    else {
        ran = true;
        load_images(menu);
        //load_images(draw);
    }
}

function draw() {
    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(IMAGES.background, 0, ((yScroll % (canvas.height*2)) - canvas.height)*-1, canvas.width, canvas.height + 1);
    context.drawImage(IMAGES.background, 0, (((yScroll+canvas.height) % (canvas.height*2)) - canvas.height)*-1, canvas.width, canvas.height + 1);

    //  Add a new enemy every 1000 points
    if (score >= enemiesAdded * 1000 && numEnemies < 5) { 
        numEnemies = numEnemies + 1;
        enemiesAdded = enemiesAdded + 1;
    }
    // Add a new obstacle every 500 points
    if (score >= obstaclesAdded * 500 && numObstacles < 10) {
        numObstacles = numObstacles + 1;
        obstaclesAdded = obstaclesAdded + 1;
    }

    // Spawn grass at random positions
    if (grass1.length < 3) {
        let grass = {
            x : randint(0, canvas.width), 
            y : randint(canvas.height, canvas.height + 600),
            width: 32,
            height: 32
        }
        grass1.push(grass);
    }
    if (grass2.length < 3) {
        let grass = {
            x : randint(0, canvas.width), 
            y : randint(canvas.height, canvas.height + 600),
            width: 32,
            height: 32
        }
        grass2.push(grass);
    }

    // If there are less enemies than wanted for the current score, create a new enemy at a random position above the screen
    // 3 enemies are created at the start of every game
    if (enemies.length < numEnemies) {
        let enemy = {
            x : randint(0, canvas.width),
            y: randint(-96, -128),
            width: 96,
            height: 96,
            toleranceX: 32,
            toleranceY: 16,
            frame : randint(1, 2),
            xChange : 0,
            yChange : 0,
            delay : randint(0, 10),
            destroyed : false,
            evading : false,
        }
        enemies.push(enemy)
    }
   // If there are less obstacles than wanted for the current score, create a new obstacle at a random position below the screen
   // 3 obstacles are created at the start of every game
   if (obstacles.length < numObstacles) {
    let obstacle = {
        x : randint(0, canvas.width), 
        y : randint(canvas.height, canvas.height + 600),
        width: 64,
        height: 64,
        toleranceX : 12,
        toleranceY : 6,
        size : 32
        };
    obstacles.push(obstacle);
    }

    // If a grass sprite moves off the screen, move it to below the screen at a ranom X position
    for (let g of grass1 ) {
        if (g.y + g.height < 0) {
            g.x = randint(0, canvas.width);
            g.y = randint(canvas.height, canvas.height + 600);
            }   else {
                g.y = g.y - scrollChange;
            }
        }
    for (let g of grass1) {
        context.drawImage(IMAGES.grass1, g.x, g.y, g.width, g.height);
    }
    for (let g of grass2 ) {
        if (g.y + g.height < 0) {
            g.x = randint(0, canvas.width);
            g.y = randint(canvas.height, canvas.height + 600);
            }   else {
                g.y = g.y - scrollChange;
            }
        }
    for (let g of grass2) {
        context.drawImage(IMAGES.grass2, g.x, g.y, g.width, g.height);
    }

    // Drawing obstacles and enemies each frame
    for (let o of obstacles) {
        context.drawImage(IMAGES.obstacle, o.x, o.y, o.width, o.height);
    }
    for (let e of enemies) {
        context.drawImage(IMAGES.enemy, 
            e.frame * 96, 0, 96, 96,
            e.x, e.y, e.width, e.height)
    }

    // Draw player
    context.drawImage(IMAGES.player, player.x, player.y, player.width, player.height);

    // Delete points sprites if they go off screen, otherwise move them up
    for (let p of points) {
        if (p.y + p.height < 0) {
            let pointIndex = points.indexOf(p);
            points.splice(pointIndex, 1);    
            }   else {
                p.y = p.y - scrollChange - 1;
            }
        }
    for (let p of points) {
        context.drawImage(IMAGES.points, p.x, p.y, 64, 64);
    }

    // Drawing the HUD to show score
    context.font = "16px Arial";
    context.fillStyle = "#000000";
    context.fillText("Score: "+score, 8, 20);

    // Debug HUD stuff
/*     context.fillText(numObstacles + " Obstacles: "+ obstacles.length, 8, 35);
    context.fillText(numEnemies + " Enemies: "+ enemies.length, 8, 50);
    context.fillText("Grass1: " + grass1.length, 8, 65);
 */

    // Handle key presses
    if (moveLeft) {
        player.xChange = player.xChange - 0.5;        
        player.frameY = 1;
    }
    if (moveRight) {
        player.xChange = player.xChange + 0.5;
        player.frameY = 2;
    }
    if (moveUp) {
        player.yChange = player.yChange - 0.5;
    }
    if (moveDown) {
        player.yChange = player.yChange + 1.5;
    }

    // Update the player
    player.x = player.x + player.xChange;
    player.y = player.y - scrollChange + player.yChange;

    // Update the other objects

    // Physics
    player.xChange = player.xChange * 0.9; // friction
    player.yChange = player.yChange * 0.9; // friction
    for (let enemy of enemies) {
        enemy.xChange = enemy.xChange * 0.9; // friction
        enemy.yChange = enemy.yChange * 0.9;
    }


    // Going off left or right
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }

    // Going off top or bottom
    if (player.y + player.height < 0) {
        player_kill();
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // Accelerating the scroll speed at the beginning of the game
    if (scrollChange < 10) {
        scrollChange = scrollChange + 0.1;
    }

    // Scrolling upwards each frame
    yScroll = yScroll + scrollChange;

    // Adding points over time (1 point for frame, in increments of 10)
    if (frameCount > 10) {
        frameCount = 0;
        score = score + 10;
    }

    // Counting the number of frames drawn, used above to add points
    frameCount = frameCount + 1;


    /* --- Enemy Animation and AI --- */
    for (let e of enemies ) {
        if (!e.destroyed) {
            // Reset position when enemy goes off bottom of screen
            if (e.y > canvas.height) {
                e.x = randint(0, canvas.width);
                e.y = randint(0, -64);
            }   else {
                    // Move towards the player's position on the X and Y axis
                    if (e.y < player.y) {
                        e.yChange = e.yChange + 1.15;
                    } else if (e.y > player.y) {
                        e.yChange = e.yChange - 0.5;
                        }
                    // The enemies' X acceleration scales with the number of obstacles to follow the player through them better
                    /* for (let enemy of enemies) {
                        if (e !== enemy){
                            context.fillText("pain", 400, 20);
                            if (0 < enemy.y - e.y < 80) {
                                enemy.evading = true;
                                if (0 < enemy.x - e.x < 64) {
                                    enemy.xChange = enemy.xChange - 0.2;
                                }
                                else if (0 > enemy.x - e.x > -1) {
                                    e.xChange = e.xChange + 0.2;
                                }
                                context.fillText("bogos", 200, 20);
                                e.yChange = e.yChange - 0.2;
                            }
                            else if (-80 < e.y - enemy.y < 0) {
                                enemy.yChange = enemy.yChange - 5.5;
                                context.fillText("binted", 200, 20);
                            }
                        }
                        
                    } */
                    if (e.x < player.x) {
                        e.xChange = e.xChange + 0.1 * obstaclesAdded;
                    } else if (e.x > player.x) {
                        e.xChange = e.xChange - 0.1 * obstaclesAdded;
                        }
                    // Animations for flashing lights
                    if (e.delay % 10 === 0) {
                        if (e.frame === 1) { e.frame = 2;}
                        else if (e.frame === 2) {e.frame = 1;}
                        }
                    }
                }
        // Make the enemy stop dead if it crashes
        else if (e.destroyed) {
            e.xChange = 0;
            e.yChange = 0;
        }
                    // Move the enemy accounting for both the scroll speed and their movement speed
                    e.y = e.y - scrollChange + e.yChange;
                    e.x = e.x + e.xChange;
                    e.delay = e.delay + 1;
            // Kill the player if they collide with an enemy
            if (player_collides(e)) {
                player_kill();
            }
            // Kill the enemy if they collide with another enemy
            for (let enemy of enemies) {
                if (e !== enemy) {
                    if (enemy_collides(enemy, e) && !enemy.destroyed){
                        enemy_kill(enemy);
                    }
                }
            }
            // If a destroyed enemy goes off screen, remove it from the enemy pool so an undestroyed one takes its place
            if (e.destroyed && e.y + e.height < 0) {
                let enemyIndex = enemies.indexOf(e);
                enemies.splice(enemyIndex, 1);
            }
    }

    /* --- Animation and collision detection for obstacles --- */
    for (let o of obstacles ) {
        // If an obstacle goes off screen, replace it below the screen at a random position. Otherwise move it up with scroll speed
        if (o.y + o.height < 0) {
            o.x = randint(0, canvas.width);
            o.y = randint(canvas.height, canvas.height + 480);
        }   else {
                o.y = o.y - scrollChange;
            }
        // Kill players and enemies when they collide with osbtacles
        if (player_collides(o)) {
            player_kill();
        }
        for (let e of enemies) {
            if (enemy_collides(e, o) && !e.destroyed) {
                enemy_kill(e);
            }
        }
    }
}

function activate(event) {
    let key = event.key;
    if (key === "ArrowLeft") {
        moveLeft = true;
    } else if (key === "ArrowUp") {
        moveUp = true;
    } else if (key === "ArrowRight") {
        moveRight = true;
    } else if (key === "ArrowDown") {
        moveDown = true;
    }
}

function deactivate(event) {
    let key = event.key;
    if (key === "ArrowLeft") {
        moveLeft = false;
    } else if (key === "ArrowUp") {
        moveUp = false;
    } else if (key === "ArrowRight") {
        moveRight = false;
    } else if (key === "ArrowDown") {
        moveDown = false;
    }
}

function load_images(callback) {
    let num_images = Object.keys(IMAGES).length;
    let loaded = function() {
        num_images = num_images - 1;
        if (num_images === 0 ) {
            callback();
        }
    };
    for (let name of Object.keys(IMAGES)) {
        let img =  new Image();
        img.addEventListener("load", loaded, false);
        img.src = IMAGES[name];
        IMAGES[name] = img;
    }
}

function player_collides(o) {
    if (player.x + player.width - player.toleranceX < o.x + o.toleranceX ||
        o.x + o.width - o.toleranceX < player.x + player.toleranceX ||
        player.y + player.toleranceY > o.y + o.height - o.toleranceY ||
        o.y + o.toleranceY > player.y + player.height - player.toleranceY) {
            return false;
        }
        else {
            return true;
        }
    }

function enemy_collides(enemy, o) {
    if (enemy.x + enemy.width - enemy.toleranceX < o.x + o.toleranceX ||
        o.x + o.width - o.toleranceX < enemy.x + enemy.toleranceX ||
        enemy.y + enemy.toleranceY > o.y + o.height - o.toleranceY ||
        o.y + o.toleranceY > enemy.y + enemy.height - enemy.toleranceY) {
            return false;
        }
        else {
            return true;
        }
    }

function enemy_kill(enemy) {
    if (enemy.y + enemy.toleranceY > 0) {
        score = score + 100;
    }
    let point = {
        x : enemy.x,
        y: enemy.y
    }

    let enemyIndex = enemies.indexOf(enemy);
    enemies.splice(enemyIndex, 1);

    /* enemy.frame = 0;
    enemy.destroyed = true; */

    points.push(point);
}

function player_kill() {
    context.strokeStyle = "rgba(255, 255, 255, 0)";
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();

    context.fillStyle = "rgba(0, 0, 0, 0.5)"
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#FF0000";
    context.font = "64px Arial Black";
    context.textAlign = "center";
    context.fillText("You Died!", canvas.width / 2, canvas.height / 2 - 48);
    context.fillText("Score: "+score, canvas.width / 2, canvas.height / 2 + 48);
    context.font = "32px Arial";
    context.fillText("Click to restart", canvas.width /2, canvas.height / 2 + 100);
    stop();
}

function randint(min, max) {
    return Math.round(Math.random() * (max-min)) + min;
}

function stop() {
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    window.cancelAnimationFrame(request_id);
}

function restart() {
    player.xChange = 0;
    player.yChange = 0;

    obstacles = [];
    enemies = [];

    moveLeft = false;
    moveUp = false;
    moveRight = false;
    moveDown = false;

    numObstacles = 3;
    numEnemies = 3;
    enemiesAdded = 1;
    obstaclesAdded = 1;
    yScroll = 0;
    score = 0;
    frameCount = 0;
    scrollChange = 0;
    context.textAlign = "left";
    points = [];

    hudOffset = 8;

    init();
}