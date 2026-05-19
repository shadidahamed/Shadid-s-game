const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME SYSTEM STATE MACHINE ---
// Values: 'START_SCREEN', 'PLAYING', 'PAUSED', 'GAME_OVER', 'VICTORY'
let gameState = 'START_SCREEN';

// --- THE GAME MAP GRID (1 = Wall, 0 = Open Path) ---
const MAP_SIZE = 12;
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,1,0,0,0,0,1], 
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

// --- SAFE ZONE SANCTUARY GRID BOUNDS ---
const SAFE_ZONE = { 
    minX: 1 * TILE_SIZE, 
    maxX: 4 * TILE_SIZE, 
    minY: 1 * TILE_SIZE, 
    maxY: 4 * TILE_SIZE 
};

// --- NEW OBJECTIVE COORDINATES ---
const FUEL_CELL = { x: 10 * TILE_SIZE + 32, y: 1 * TILE_SIZE + 32, size: 16, collected: false };
const ESCAPE_HATCH = { x: 1 * TILE_SIZE + 32, y: 1 * TILE_SIZE + 32, size: 24 };

// Z-Buffer array to manage depth calculations between walls and villains
let depthBuffer = new Array(canvas.width);
let player, enemies, inventory;
let inputs = { moveForward: 0, rotate: 0 };
let isTouchDevice = !window.matchMedia("(pointer: fine)").matches;

// --- DOM OBJECT INTERFACE HOOKS ---
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuSubtitle = document.getElementById('menu-subtitle');
const btnPrimary = document.getElementById('btn-primary');
const btnRestart = document.getElementById('btn-restart');
const hudOverlay = document.getElementById('hud-overlay');

// --- GAME RESETS & INITIALIZATION ---
function initGameData() {
    player = {
        x: 96, y: 160, angle: 0.1, fov: Math.PI / 3,
        walkSpeed: 3.0, crouchSpeed: 1.3,
        rotSpeed: 0.04, isCrouching: false,
        noiseRadius: 0, hp: 100, inSafeZone: true
    };

    FUEL_CELL.collected = false;

    // Exactly two highly intelligent, distinct villains tracking the environment
    enemies = [
        { 
            id: 1, type: 'Runner', x: 450, y: 300, angle: 0, speed: 1.3, radius: 12, color: '#e67e22', 
            waypoints: [{x: 450, y: 300}, {x: 200, y: 550}], targetIndex: 0, state: 'PATROL' 
        },
        { 
            id: 2, type: 'Clicker', x: 600, y: 150, angle: Math.PI, speed: 0.8, radius: 14, color: '#9b59b6', 
            waypoints: [{x: 600, y: 150}, {x: 600, y: 500}], targetIndex: 0, state: 'PATROL' 
        }
    ];

    inventory = { alcohol: 3, binding: 2, blades: 2, medkits: 0, shivs: 1 };
    inputs = { moveForward: 0, rotate: 0 };
    updateHUD();
}

// --- STATE MANAGER ENGINE CONTROLLER ---
function changeState(newState) {
    gameState = newState;
    
    switch(gameState) {
        case 'START_SCREEN':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            menuTitle.innerText = "DEAD ZONE";
            menuTitle.style.color = "#d0021b";
            menuSubtitle.innerText = "A 2.5D RAYCAST SURVIVAL EXPERIENCE";
            btnPrimary.innerText = "START SURVIVAL";
            btnRestart.style.display = 'none';
            break;
            
        case 'PLAYING':
            menuOverlay.style.display = 'none';
            hudOverlay.style.display = 'flex';
            break;
            
        case 'PAUSED':
            menuOverlay.style.display = 'flex';
            menuTitle.innerText = "PAUSED";
            menuTitle.style.color = "#c5a059";
            menuSubtitle.innerText = "SURVIVAL IS SUSPENDED";
            btnPrimary.innerText = "RESUME GAME";
            btnRestart.style.display = 'inline-block';
            break;
            
        case 'GAME_OVER':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            menuTitle.innerText = "YOU DIED";
            menuTitle.style.color = "#ff3333";
            menuSubtitle.innerText = "YOU COULD NOT OUTLIVE THE INFECTED ZONE";
            btnPrimary.innerText = "TRY AGAIN";
            btnRestart.style.display = 'none';
            break;

        case 'VICTORY':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            menuTitle.innerText = "ESCAPED!";
            menuTitle.style.color = "#2ecc71";
            menuSubtitle.innerText = "YOU SECURED THE FUEL CELL AND SURVIVED THE ZONE.";
            btnPrimary.innerText = "PLAY AGAIN";
            btnRestart.style.display = 'none';
            break;
    }
}

// --- BUTTON MENU EVENT HANDLERS ---
btnPrimary.addEventListener('click', () => {
    if (gameState === 'START_SCREEN' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        initGameData();
        changeState('PLAYING');
    } else if (gameState === 'PAUSED') {
        changeState('PLAYING');
    }
});

btnRestart.addEventListener('click', () => {
    initGameData();
    changeState('PLAYING');
});

// --- CORE SYSTEM INPUT EVENT LISTENERS ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        if (gameState === 'PLAYING') changeState('PAUSED');
        else if (gameState === 'PAUSED') changeState('PLAYING');
        return;
    }

    if (gameState !== 'PLAYING') return;

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

// --- SURVIVAL CRAFTING LOGIC ---
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
    if (!player) return;
    const hpDisplay = document.getElementById('hp-display');
    hpDisplay.innerText = Math.round(player.hp);
    hpDisplay.style.color = player.inSafeZone ? '#2ecc71' : '#fff';

    let taskText = FUEL_CELL.collected ? "🎯 RETURN TO ELEVATOR START" : "⚡ FIND THE FUEL CELL (Check Radar)";

    document.getElementById('inv-display').innerText = 
        `TASK: ${taskText} || MEDS: ${inventory.medkits} | SHIVS: ${inventory.shivs}`;
}

// --- RENDERING WORK PIPELINE (RAYCAST ENVIRONMENT) ---
function renderGame() {
    // 1. Draw solid background gradients (Ceiling & Floor falloffs)
    ctx.fillStyle = '#11141a'; ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    let numRays = canvas.width;
    let rayAngle = player.angle - player.fov / 2;
    let angleIncrement = player.fov / numRays;

    // 2. Perform math projection ray intersections for walls
    for (let i = 0; i < numRays; i++) {
        let distance = 0, stepSize = 2.0, hitWall = false;
        let cos = Math.cos(rayAngle), sin = Math.sin(rayAngle);

        while (!hitWall && distance < 800) {
            distance += stepSize;
            let checkX = Math.floor((player.x + cos * distance) / TILE_SIZE);
            let checkY = Math.floor((player.y + sin * distance) / TILE_SIZE);

            if (checkX < 0 || checkX >= MAP_SIZE || checkY < 0 || checkY >= MAP_SIZE) {
                hitWall = true; distance = 800;
            } else if (MAP[checkY][checkX] > 0) {
                hitWall = true;
            }
        }

        let correctedDist = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDist; 

        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / correctedDist);
        let brightness = Math.max(15, 180 - (correctedDist * 0.35));
        ctx.fillStyle = `rgb(${brightness * 0.7}, ${brightness * 0.6}, ${brightness * 0.4})`;
        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);

        rayAngle += angleIncrement;
    }

    // 3. Render Objective Items in 3D Space if in field of view
    renderObjective3D();

    // 4. Project 3D terrifying billboard monster shapes onto display
    renderSprites3D();

    // 5. Draw Waypoint HUD Guidance Line right in the center of the display screen
    drawNavigationUI();

    // 6. Safe zone ambient lighting screen filter effect overlays
    if (player.inSafeZone) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 7. Draw 2D Minimap radar layer overlay
    drawMinimap();
}

// --- PROJECT OBJECTIVE ELEMENTS IN 3D ---
function renderObjective3D() {
    // Determine which target item we should render based on progress
    let targetItem = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    let sx = targetItem.x - player.x, sy = targetItem.y - player.y;
    let angle = Math.atan2(sy, sx) - player.angle;

    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;

    let distance = Math.hypot(sx, sy);
    if (distance < 10 || Math.abs(angle) >= player.fov) return;

    if (depthBuffer[Math.floor(canvas.width / 2)] < distance) return; // Hidden by walls

    let size = Math.min(canvas.height, (TILE_SIZE * canvas.height) / distance);
    let screenX = Math.tan(angle) * (canvas.width / 2) + (canvas.width / 2);
    let screenY = canvas.height / 2;

    // Draw bright glowing energy capsule columns
    ctx.fillStyle = !FUEL_CELL.collected ? `hsl(${Date.now() * 0.3 % 360}, 100%, 50%)` : '#2ecc71';
    ctx.fillRect(screenX - size/6, screenY - size/4, size/3, size/2);

    // Floating tag labels over items
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(!FUEL_CELL.collected ? "⚡ FUEL CELL" : "🚪 ESCAPE LIFT", screenX, screenY - size/4 - 10);
}

// --- HUD 3D COMPASS DIRECTION ARROW GUIDE ---
function drawNavigationUI() {
    let target = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    let angleToTarget = Math.atan2(target.y - player.y, target.x - player.x) - player.angle;

    while (angleToTarget < -Math.PI) angleToTarget += Math.PI * 2;
    while (angleToTarget > Math.PI) angleToTarget -= Math.PI * 2;

    ctx.fillStyle = !FUEL_CELL.collected ? '#f1c40f' : '#2ecc71';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';

    // Draw guidance arrow icons depending on which direction you must rotate
    if (angleToTarget < -0.2) {
        ctx.fillText("◀◀ TURN LEFT", canvas.width / 2, canvas.height - 40);
    } else if (angleToTarget > 0.2) {
        ctx.fillText("TURN RIGHT ▶▶", canvas.width / 2, canvas.height - 40);
    } else {
        ctx.fillText("▲ OBJECTIVE STRAIGHT AHEAD ▲", canvas.width / 2, canvas.height - 40);
    }
}

// --- VISUAL SCARY MONSTER VECTOR GRAPHICS BUILDER ---
function renderSprites3D() {
    enemies.sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y));
    
    enemies.forEach(sprite => {
        let sx = sprite.x - player.x, sy = sprite.y - player.y;
        let spriteAngle = Math.atan2(sy, sx) - player.angle;

        while (spriteAngle < -Math.PI) spriteAngle += Math.PI * 2;
        while (spriteAngle > Math.PI) spriteAngle -= Math.PI * 2;

        let distance = Math.hypot(sx, sy);
        if (distance < 10 || Math.abs(spriteAngle) >= player.fov) return;

        let spriteHeight = Math.min(canvas.height * 1.5, (TILE_SIZE * canvas.height) / distance);
        let spriteWidth = spriteHeight / 1.2;
        let screenX = Math.tan(spriteAngle) * (canvas.width / 2) + (canvas.width / 2);
        
        let leftX = Math.floor(screenX - spriteWidth / 2);
        let rightX = Math.floor(screenX + spriteWidth / 2);

        for (let x = leftX; x < rightX; x++) {
            if (x >= 0 && x < canvas.width && depthBuffer[x] > distance) {
                let pct = (x - leftX) / spriteWidth;
                let topY = canvas.height / 2 - spriteHeight / 2;

                ctx.fillStyle = '#050508';
                ctx.fillRect(x, topY, 1, spriteHeight);

                if (Math.sin(x * 0.5) > 0.3) {
                    ctx.fillStyle = sprite.color;
                    ctx.fillRect(x, topY + (spriteHeight * 0.2), 1, spriteHeight * 0.6);
                }

                if (pct > 0.35 && pct < 0.65) {
                    let headHeight = spriteHeight * 0.25;
                    ctx.fillStyle = '#000000';
                    let twitch = (sprite.state === 'HUNTING') ? Math.sin(Date.now() * 0.05) * 2 : 0;
                    ctx.fillRect(x + twitch, topY, 1, headHeight);

                    ctx.fillStyle = sprite.state === 'HUNTING' ? '#ff0000' : '#aa0000';

                    if (Math.abs(pct - 0.44) < 0.03 && (Date.now() % 600 > 40)) {
                        ctx.fillRect(x, topY + (headHeight * 0.4), 2, spriteHeight * 0.03);
                    }
                    if (Math.abs(pct - 0.56) < 0.03 && (Date.now() % 600 > 40)) {
                        ctx.fillRect(x, topY + (headHeight * 0.4), 2, spriteHeight * 0.03);
                    }
                }

                if ((pct < 0.15 || pct > 0.85) && x % 2 === 0) {
                    ctx.fillStyle = '#111';
                    ctx.fillRect(x, topY + (spriteHeight * 0.4), 1, spriteHeight * 0.55);
                }
            }
        }
    });
}

// --- RADAR RADIAL 2D HUD MAPPER ---
function drawMinimap() {
    const scale = 0.15, offset = 15;
    const mapOffsetLeft = canvas.width - (MAP_SIZE * TILE_SIZE * scale) - offset;
    
    ctx.fillStyle = 'rgba(11, 12, 16, 0.85)';
    ctx.fillRect(mapOffsetLeft, offset, MAP_SIZE * TILE_SIZE * scale, MAP_SIZE * TILE_SIZE * scale);

    // Draw Sanctuary bounds highlight boxes
    ctx.fillStyle = 'rgba(46, 204, 113, 0.15)';
    ctx.fillRect(mapOffsetLeft + (SAFE_ZONE.minX * scale), offset + (SAFE_ZONE.minY * scale), (SAFE_ZONE.maxX - SAFE_ZONE.minX) * scale, (SAFE_ZONE.maxY - SAFE_ZONE.minY) * scale);

    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            if (MAP[r][c] > 0) {
                ctx.fillStyle = '#1f2833';
                ctx.fillRect(mapOffsetLeft + (c * TILE_SIZE * scale), offset + (r * TILE_SIZE * scale), TILE_SIZE * scale, TILE_SIZE * scale);
            }
        }
    }
    
    // Draw objective spots onto radar plate directly
    if (!FUEL_CELL.collected) {
        ctx.fillStyle = '#f1c40f'; // Yellow core cell marker
        ctx.fillRect(mapOffsetLeft + (FUEL_CELL.x * scale) - 2, offset + (FUEL_CELL.y * scale) - 2, 5, 5);
    } else {
        ctx.fillStyle = '#2ecc71'; // Green escape hatch marker
        ctx.fillRect(mapOffsetLeft + (ESCAPE_HATCH.x * scale) - 3, offset + (ESCAPE_HATCH.y * scale) - 3, 6, 6);
    }

    let px = mapOffsetLeft + (player.x * scale), py = offset + (player.y * scale);
    ctx.fillStyle = player.inSafeZone ? '#2ecc71' : '#50e3c2';
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();

    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(mapOffsetLeft + (e.x * scale), offset + (e.y * scale), 3, 0, Math.PI * 2); ctx.fill();
    });
}

// --- PHYSICS ENGINE TICK SIMULATION CONTROLLER ---
function updatePhysics() {
    if (gameState !== 'PLAYING') return;

    player.angle += inputs.rotate * player.rotSpeed;
    let currentSpeed = player.isCrouching ? player.crouchSpeed : player.walkSpeed;
    let moveDist = inputs.moveForward * currentSpeed;
    let newX = player.x + Math.cos(player.angle) * moveDist, newY = player.y + Math.sin(player.angle) * moveDist;

    if (MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(newX / TILE_SIZE)] === 0) player.x = newX;
    if (MAP[Math.floor(newY / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] === 0) player.y = newY;

    // --- CHECK FOR OBJECTIVE PROGRESS COLLISIONS ---
    if (!FUEL_CELL.collected && Math.hypot(player.x - FUEL_CELL.x, player.y - FUEL_CELL.y) < 30) {
        FUEL_CELL.collected = true;
        updateHUD();
    }

    if (FUEL_CELL.collected && Math.hypot(player.x - ESCAPE_HATCH.x, player.y - ESCAPE_HATCH.y) < 30) {
        changeState('VICTORY');
        return;
    }

    player.inSafeZone = (player.x >= SAFE_ZONE.minX && player.x <= SAFE_ZONE.maxX && player.y >= SAFE_ZONE.minY && player.y <= SAFE_ZONE.maxY);
    if (player.inSafeZone && player.hp < 100) {
        player.hp = Math.min(100, player.hp + 0.05); 
        updateHUD();
    }
    player.noiseRadius = (inputs.moveForward !== 0 && !player.isCrouching) ? 170 : 0;

    enemies.forEach(e => {
        let dist = Math.hypot(player.x - e.x, player.y - e.y);
        
        if (player.inSafeZone) {
            e.state = 'PATROL'; 
        } else if (player.noiseRadius > 0 && dist <= player.noiseRadius) {
            e.state = 'HUNTING';
        }

        if (e.state === 'PATROL') {
            let target = e.waypoints[e.targetIndex];
            let tDist = Math.hypot(target.x - e.x, target.y - e.y);
            if (tDist < 10) e.targetIndex = (e.targetIndex + 1) % e.waypoints.length;
            e.angle = Math.atan2(target.y - e.y, target.x - e.x);
        } else {
            e.angle = Math.atan2(player.y - e.y, player.x - e.x); 
        }

        let nEx = e.x + Math.cos(e.angle) * e.speed, nEy = e.y + Math.sin(e.angle) * e.speed;
        if (MAP[Math.floor(e.y / TILE_SIZE)][Math.floor(nEx / TILE_SIZE)] === 0) e.x = nEx;
        if (MAP[Math.floor(nEy / TILE_SIZE)][Math.floor(e.x / TILE_SIZE)] === 0) e.y = nEy;

        if (dist < 22 && !player.inSafeZone) {
            player.hp = Math.max(0, player.hp - 0.5);
            updateHUD();
            if (player.hp <= 0) changeState('GAME_OVER'); 
        }
    });
}

// --- MASTER LOOPER CORE ---
initGameData();
function loop() {
    updatePhysics();
    if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        renderGame();
    }
    requestAnimationFrame(loop);
}
loop();
