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

// Array to store wall distances for sprite depth-sorting Z-Buffering
let depthBuffer = new Array(canvas.width);

// --- PLAYER STATE ---
let player = {
    x: 96, y: 96, angle: 0.1, fov: Math.PI / 3,
    walkSpeed: 3.0, crouchSpeed: 1.3,
    rotSpeed: 0.04, isCrouching: false,
    noiseRadius: 0, hp: 100
};

// --- MULTIPLE UNIQUE ENEMIES ---
let enemies = [
    {
        id: 1, type: 'Runner', x: 450, y: 300, angle: 0, speed: 1.2, radius: 12, color: '#e67e22',
        waypoints: [{x: 450, y: 300}, {x: 200, y: 550}], targetIndex: 0, state: 'PATROL'
    },
    {
        id: 2, type: 'Clicker', x: 600, y: 150, angle: Math.PI, speed: 0.8, radius: 14, color: '#9b59b6',
        waypoints: [{x: 600, y: 150}, {x: 600, y: 500}], targetIndex: 0, state: 'PATROL'
    },
    {
        id: 3, type: 'Stalker', x: 250, y: 150, angle: Math.PI/2, speed: 1.5, radius: 12, color: '#d35400',
        waypoints: [{x: 250, y: 150}, {x: 500, y: 150}], targetIndex: 0, state: 'PATROL'
    }
];

let inventory = { alcohol: 3, binding: 2, blades: 2, medkits: 0, shivs: 1 };
let isTouchDevice = !window.matchMedia("(pointer: fine)").matches;
let inputs = { moveForward: 0, rotate: 0 };

// --- DESKTOP KEYBOARD CONTROLS (ARROW KEYS) ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')    inputs.moveForward = 1;
    if (e.key === 'ArrowDown')  inputs.moveForward = -1;
    if (e.key === 'ArrowLeft')  inputs.rotate = -1;
    if (e.key === 'ArrowRight') inputs.rotate = 1;

    if (e.key === 'a' || e.key === 'A') craftItem('medkit');
    if (e.key === 'd' || e.key === 'D') craftItem('shiv');
    if (e.key === 'q' || e.key === 'Q') useMedkit();
});

window.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) inputs.moveForward = 0;
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) inputs.rotate = 0;
});

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

// --- CORE RENDERING ENGINE (RAYCASTING + BILLBOARD SPRITES) ---
function renderGame() {
    // 1. Draw Environment (Sky & Ground)
    ctx.fillStyle = '#11141a'; ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    // 2. Raycast Walls
    let numRays = canvas.width;
    let rayAngle = player.angle - player.fov / 2;
    let angleIncrement = player.fov / numRays;

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

        let correctedDist = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDist; // Save to Z-Buffer for enemy rendering visibility check

        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / correctedDist);
        let brightness = Math.max(15, 180 - (correctedDist * 0.35));
        ctx.fillStyle = `rgb(${brightness * 0.7}, ${brightness * 0.6}, ${brightness * 0.4})`;
        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);

        rayAngle += angleIncrement;
    }

    // 3. Project 3D Enemy Sprites
    renderSprites3D();

    // 4. Draw HUD Minimap Layer
    drawMinimap();
}

function renderSprites3D() {
    // Sort enemies by distance from player (far to near) to render correctly
    enemies.sort((a, b) => {
        let distA = Math.hypot(a.x - player.x, a.y - player.y);
        let distB = Math.hypot(b.x - player.x, b.y - player.y);
        return distB - distA;
    });

    enemies.forEach(sprite => {
        let sx = sprite.x - player.x;
        let sy = sprite.y - player.y;

        // Transform sprite position relative to player orientation angle
        let spriteAngle = Math.atan2(sy, sx) - player.angle;

        // Normalize angle loop wrapper
        while (spriteAngle < -Math.PI) spriteAngle += Math.PI * 2;
        while (spriteAngle > Math.PI) spriteAngle -= Math.PI * 2;

        let distance = Math.hypot(sx, sy);
        if (distance < 10) return; // Inside player footprint bounds

        // If within field of view limits
        if (Math.abs(spriteAngle) < player.fov) {
            let spriteHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / distance);
            let spriteWidth = spriteHeight / 1.5;

            // Calculate horizontal projection position on current window frame
            let screenX = Math.tan(spriteAngle) * (canvas.width / 2) + (canvas.width / 2);
            let screenY = canvas.height / 2;

            // Simple column slicing loop simulation with Z-buffer intersection verification
            let leftX = Math.floor(screenX - spriteWidth / 2);
            let rightX = Math.floor(screenX + spriteWidth / 2);

            for (let x = leftX; x < rightX; x++) {
                if (x >= 0 && x < canvas.width && depthBuffer[x] > distance) {
                    // Draw vertical column strip line representing the enemy billboard
                    ctx.fillStyle = sprite.color;
                    ctx.fillRect(x, screenY - spriteHeight / 2, 1, spriteHeight);

                    // Render small text tracking tags over their 3D heads
                    if (x === Math.floor(screenX)) {
                        ctx.fillStyle = '#fff';
                        ctx.font = '10px monospace';
                        ctx.textAlign = 'center';
                        ctx.fillText(sprite.type, screenX, screenY - spriteHeight / 2 - 10);
                    }
                }
            }
        }
    });
}

// --- RADAR 2D MINIMAP OVERLAY SYSTEM ---
function drawMinimap() {
    const scale = 0.15; // Miniature UI sizing scaling factor
    const offset = 15;   // Screen padding buffer alignment bounding limits

    ctx.fillStyle = 'rgba(11, 12, 16, 0.75)';
    ctx.fillRect(canvas.width - (MAP_SIZE * TILE_SIZE * scale) - offset, offset, MAP_SIZE * TILE_SIZE * scale, MAP_SIZE * TILE_SIZE * scale);

    // Draw Map Walls
    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            if (MAP[r][c] > 0) {
                ctx.fillStyle = '#1f2833';
                ctx.fillRect(
                    canvas.width - (MAP_SIZE * TILE_SIZE * scale) - offset + (c * TILE_SIZE * scale),
                    offset + (r * TILE_SIZE * scale),
                    TILE_SIZE * scale,
                    TILE_SIZE * scale
                );
            }
        }
    }

    // Draw Player dot on minimap
    let px = canvas.width - (MAP_SIZE * TILE_SIZE * scale) - offset + (player.x * scale);
    let py = offset + (player.y * scale);
    ctx.fillStyle = player.isCrouching ? '#4a90e2' : '#50e3c2';
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();

    // Draw View vector indicator cone
    ctx.strokeStyle = 'rgba(80, 227, 194, 0.4)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(player.angle) * 15, py + Math.sin(player.angle) * 15);
    ctx.stroke();

    // Draw Enemies dots directly on minimap radar interface layout
    enemies.forEach(e => {
        let ex = canvas.width - (MAP_SIZE * TILE_SIZE * scale) - offset + (e.x * scale);
        let ey = offset + (e.y * scale);
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
    });
}

// --- ENTITY STATE TRACKING PHYSICS ---
function updatePhysics() {
    if (player.hp <= 0) return;

    player.angle += inputs.rotate * player.rotSpeed;

    let currentSpeed = player.isCrouching ? player.crouchSpeed : player.walkSpeed;
    let moveDist = inputs.moveForward * currentSpeed;
    
    let newX = player.x + Math.cos(player.angle) * moveDist;
    let newY = player.y + Math.sin(player.angle) * moveDist;

    if (MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(newX / TILE_SIZE)] === 0) player.x = newX;
    if (MAP[Math.floor(newY / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] === 0) player.y = newY;

    player.noiseRadius = (inputs.moveForward !== 0 && !player.isCrouching) ? 170 : 0;

    updateEnemiesPhysics();
}

function updateEnemiesPhysics() {
    enemies.forEach(e => {
        let edx = player.x - e.x;
        let edy = player.y - e.y;
        let dist = Math.sqrt(edx*edx + edy*edy);

        // Acoustic response
        if (player.noiseRadius > 0 && dist <= player.noiseRadius) {
            e.state = 'HUNTING';
        }

        if (e.state === 'PATROL') {
            let currentTarget = e.waypoints[e.targetIndex];
            let tdx = currentTarget.x - e.x;
            let tdy = currentTarget.y - e.y;
            let tDist = Math.sqrt(tdx*tdx + tdy*tdy);

            if (tDist < 10) {
                e.targetIndex = (e.targetIndex + 1) % e.waypoints.length;
            }
            e.angle = Math.atan2(tdy, tdx);
        } else {
            e.angle = Math.atan2(edy, edx);
        }

        // Apply map collisions boundary bounds on enemies too
        let nEx = e.x + Math.cos(e.angle) * e.speed;
        let nEy = e.y + Math.sin(e.angle) * e.speed;

        if (MAP[Math.floor(e.y / TILE_SIZE)][Math.floor(nEx / TILE_SIZE)] === 0) e.x = nEx;
        if (MAP[Math.floor(nEy / TILE_SIZE)][Math.floor(e.x / TILE_SIZE)] === 0) e.y = nEy;

        // Damage calculation footprint
        if (dist < 22) {
            player.hp = Math.max(0, player.hp - 0.3);
            updateHUD();
        }
    });
}

// --- TOUCH INTERFACE INITIALIZER ---
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

        inputs.moveForward = -dy / radiusMax;
        inputs.rotate = dx / radiusMax;
    });

    joyBase.addEventListener('touchend', () => {
        joyHandle.style.transform = 'translate(0px, 0px)';
        inputs.moveForward = 0;
        inputs.rotate = 0;
    });

    document.getElementById('touch-crouch').addEventListener('touchstart', () => {
        player.isCrouching = !player.isCrouching;
        document.getElementById('touch-crouch').style.background = player.isCrouching ? '#c5a059' : '#1f2833';
    });
    document.getElementById('touch-heal').addEventListener('touchstart', useMedkit);
    document.getElementById('touch-craft-a').addEventListener('touchstart', () => craftItem('medkit'));
    document.getElementById('touch-craft-d').addEventListener('touchstart', () => craftItem('shiv'));
}

// --- CYCLE LOOPER ---
function loop() {
    updatePhysics();
    renderGame();
    requestAnimationFrame(loop);
}

loop();
