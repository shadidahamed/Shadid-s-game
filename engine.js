const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- THE GAME MAP GRID (1 = Wall, 0 = Open Path) ---
const MAP_SIZE = 12;
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,0,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,0,1,1,0,0,0,0,1],
    [1,1,1,0,0,1,1,0,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];
const TILE_SIZE = 64;

// --- CORE SYSTEM ENTITIES ---
let player = {
    x: 96, y: 96, angle: 0.1, fov: Math.PI / 3,
    walkSpeed: 3.0, crouchSpeed: 1.3,
    rotSpeed: 0.04, isCrouching: false,
    noiseRadius: 0, hp: 100
};

let enemy = {
    x: 450, y: 300, state: 'PATROL',
    angle: 0, speed: 1.0, radius: 12,
    waypoints: [{x: 450, y: 300}, {x: 200, y: 550}],
    targetIndex: 0
};

let inventory = { alcohol: 3, binding: 2, blades: 2, medkits: 0, shivs: 1 };
let isTouchDevice = !window.matchMedia("(pointer: fine)").matches;
let inputs = { moveForward: 0, rotate: 0 };

// --- DESKTOP KEYBOARD CONTROLS (USING ARROW KEYS ONLY) ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')    inputs.moveForward = 1;
    if (e.key === 'ArrowDown')  inputs.moveForward = -1;
    if (e.key === 'ArrowLeft')  inputs.rotate = -1;
    if (e.key === 'ArrowRight') inputs.rotate = 1;

    // Prompt Specs Mapping
    if (e.key === 'a' || e.key === 'A') craftItem('medkit');
    if (e.key === 'd' || e.key === 'D') craftItem('shiv');
    if (e.key === 'q' || e.key === 'Q') useMedkit();
});

window.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) inputs.moveForward = 0;
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) inputs.rotate = 0;
});

// --- INVENTORY & LOGIC RULES ---
function craftItem(item) {
    if (item === 'medkit' && inventory.alcohol >= 1 && inventory.binding >= 1) {
        inventory.alcohol--; inventory.binding--; inventory.medkits++;
    } else if (item === 'shiv' && inventory.blades >= 1 && inventory.binding >= 1) {
        inventory.blades--; inventory.binding--; inventory.shivs++;
    }
    updateHUD();
}

function useMedkit() {
    if (inventory.medkits > 0 && player.hp < 100) {
        inventory.medkits--;
        player.hp = Math.min(100, player.hp + 35);
        updateHUD();
    }
}

function updateHUD() {
    document.getElementById('hp-display').innerText = Math.round(player.hp);
    document.getElementById('inv-display').innerText = 
        `ALC: ${inventory.alcohol} | BND: ${inventory.binding} | BLD: ${inventory.blades} || MED: ${inventory.medkits} | SHV: ${inventory.shivs}`;
}

// --- MATHEMATICAL RAYCASTING ENGINE (2D MAP -> 3D DISPLAY) ---
function render3DView() {
    let numRays = canvas.width;
    let rayAngle = player.angle - player.fov / 2;
    let angleIncrement = player.fov / numRays;

    // Draw Floor & Ceiling Environment background
    ctx.fillStyle = '#11141a'; ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    for (let i = 0; i < numRays; i++) {
        let distance = 0;
        let stepSize = 2.0; 
        let hitWall = false;

        let cos = Math.cos(rayAngle);
        let sin = Math.sin(rayAngle);

        while (!hitWall && distance < 800) {
            distance += stepSize;
            let checkX = Math.floor((player.x + cos * distance) / TILE_SIZE);
            let checkY = Math.floor((player.y + sin * distance) / TILE_SIZE);

            if (checkX < 0 || checkX >= MAP_SIZE || checkY < 0 || checkY >= MAP_SIZE) {
                hitWall = true;
                distance = 800;
            } else if (MAP[checkY][checkX] > 0) {
                hitWall = true;
            }
        }

        // Correct fish-eye distortion matrix lens
        let correctedDist = distance * Math.cos(rayAngle - player.angle);
        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / correctedDist);

        // Calculate fog color shading depth parameters
        let brightness = Math.max(15, 180 - (correctedDist * 0.35));
        ctx.fillStyle = `rgb(${brightness * 0.7}, ${brightness * 0.6}, ${brightness * 0.4})`;
        
        // Render slice strip
        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);
        rayAngle += angleIncrement;
    }
}

// --- ENTITY STATE TRACKING PHYSICS ---
function updatePhysics() {
    if (player.hp <= 0) return;

    // Turn Rotation Angle
    player.angle += inputs.rotate * player.rotSpeed;

    // Move Vector Calculation
    let currentSpeed = player.isCrouching ? player.crouchSpeed : player.walkSpeed;
    let moveDist = inputs.moveForward * currentSpeed;
    
    let newX = player.x + Math.cos(player.angle) * moveDist;
    let newY = player.y + Math.sin(player.angle) * moveDist;

    // Basic Collision checking
    if (MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(newX / TILE_SIZE)] === 0) player.x = newX;
    if (MAP[Math.floor(newY / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] === 0) player.y = newY;

    // Acoustic Sound signature profiles
    player.noiseRadius = (inputs.moveForward !== 0 && !player.isCrouching) ? 170 : 0;

    updateEnemyAI();
}

function updateEnemyAI() {
    let edx = player.x - enemy.x;
    let edy = player.y - enemy.y;
    let dist = Math.sqrt(edx*edx + edy*edy);

    if (player.noiseRadius > 0 && dist <= player.noiseRadius) {
        enemy.state = 'HUNTING';
    }

    if (enemy.state === 'PATROL') {
        let currentTarget = enemy.waypoints[enemy.targetIndex];
        let tdx = currentTarget.x - enemy.x;
        let tdy = currentTarget.y - enemy.y;
        let tDist = Math.sqrt(tdx*tdx + tdy*tdy);

        if (tDist < 10) {
            enemy.targetIndex = (enemy.targetIndex + 1) % enemy.waypoints.length;
        }
        enemy.angle = Math.atan2(tdy, tdx);
    } else {
        // Hunt Player Position Aggressively
        enemy.angle = Math.atan2(edy, edx);
    }

    enemy.x += Math.cos(enemy.angle) * enemy.speed;
    enemy.y += Math.sin(enemy.angle) * enemy.speed;

    if (dist < 25) {
        player.hp = Math.max(0, player.hp - 0.5);
        updateHUD();
    }
}

// --- TOUCH ZONE CAPTURE SCHEMES ---
if (isTouchDevice) {
    const joyBase = document.getElementById('virtual-joystick');
    const joyHandle = document.getElementById('joystick-handle');
    const radiusMax = 45;

    joyBase.addEventListener('touchmove', (e) => {
        e.preventDefault();
        let touch = e.touches[0];
        let rect = joyBase.getBoundingClientRect();
        let centerX = rect.left + rect.width / 2;
        let centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        let distance = Math.sqrt(dx*dx + dy*dy);

        if (distance > radiusMax) {
            dx = (dx / distance) * radiusMax;
            dy = (dy / distance) * radiusMax;
        }

        joyHandle.style.transform = `translate(${dx}px, ${dy}px)`;

        // Translate vector offset configurations directly into internal controls
        inputs.moveForward = -dy / radiusMax;
        inputs.rotate = dx / radiusMax;
    });

    joyBase.addEventListener('touchend', () => {
        joyHandle.style.transform = 'translate(0px, 0px)';
        inputs.moveForward = 0;
        inputs.rotate = 0;
    });

    // Button Interface Hookups
    document.getElementById('touch-crouch').addEventListener('touchstart', () => {
        player.isCrouching = !player.isCrouching;
        document.getElementById('touch-crouch').style.background = player.isCrouching ? '#c5a059' : '#1f2833';
    });
    document.getElementById('touch-heal').addEventListener('touchstart', useMedkit);
    document.getElementById('touch-craft-a').addEventListener('touchstart', () => craftItem('medkit'));
    document.getElementById('touch-craft-d').addEventListener('touchstart', () => craftItem('shiv'));
}

// --- CYCLE ENGINE DRIVER ---
function loop() {
    updatePhysics();
    render3DView();
    requestAnimationFrame(loop);
}

loop();
