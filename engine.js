const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME SYSTEM STATE MACHINE ---
// Values: 'START_SCREEN', 'PLAYING', 'PAUSED', 'GAME_OVER'
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
        x: 96, y: 96, angle: 0.1, fov: Math.PI / 3,
        walkSpeed: 3.0, crouchSpeed: 1.3,
        rotSpeed: 0.04, isCrouching: false,
        noiseRadius: 0, hp: 100, inSafeZone: true
    };

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
    }
}

// --- BUTTON MENU EVENT HANDLERS ---
btnPrimary.addEventListener('click', () => {
    if (gameState === 'START_SCREEN' || gameState === 'GAME_OVER') {
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
    // Escape key intercepts and flips pause cycles smoothly
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

// Mobile viewport viewport touch event to seamlessly toggle pause state
canvas.addEventListener('touchstart', () => {
    if (gameState === 'PLAYING' && isTouchDevice) {
        setTimeout(() => { if(inputs.moveForward === 0 && inputs.rotate === 0) changeState('PAUSED'); }, 150);
    }
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

    document.getElementById('inv-display').innerText = 
        `ALC: ${inventory.alcohol} | BND: ${inventory.binding} | BLD: ${inventory.blades} || MED: ${inventory.medkits} | SHV: ${inventory.shivs}`;
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
        depthBuffer[i] = correctedDist; // Cache matrix depth inside global index buffer arrays

        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / correctedDist);
        let brightness = Math.max(15, 180 - (correctedDist * 0.35));
        ctx.fillStyle = `rgb(${brightness * 0.7}, ${brightness * 0.6}, ${brightness * 0.4})`;
        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);

        rayAngle += angleIncrement;
    }

    // 3. Project 3D terrifying billboard monster shapes onto display
    renderSprites3D();

    // 4. Safe zone ambient lighting screen filter effect overlays
    if (player.inSafeZone) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.12)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2ecc71'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
        ctx.fillText('SANCTUARY: SAFE AREA (REGENERATING HEALTH)', 20, 30);
    }
    
    // 5. Draw 2D Minimap radar layer overlay
    drawMinimap();
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

        // Scaling constants optimized to create tall, towering proportions
        let spriteHeight = Math.min(canvas.height * 1.5, (TILE_SIZE * canvas.height) / distance);
        let spriteWidth = spriteHeight / 1.2;
        let screenX = Math.tan(spriteAngle) * (canvas.width / 2) + (canvas.width / 2);
        
        let leftX = Math.floor(screenX - spriteWidth / 2);
        let rightX = Math.floor(screenX + spriteWidth / 2);

        // Render monster slices column by column against depth buffers
        for (let x = leftX; x < rightX; x++) {
            if (x >= 0 && x < canvas.width && depthBuffer[x] > distance) {
                let pct = (x - leftX) / spriteWidth;
                let topY = canvas.height / 2 - spriteHeight / 2;

                let bodyColor = '#050508';
                let accentColor = sprite.color;

                // Main shadow torso structure
                ctx.fillStyle = bodyColor;
                ctx.fillRect(x, topY, 1, spriteHeight);

                // Jagged bio-luminescent skin lines running through torso matrix columns
                if (Math.sin(x * 0.5) > 0.3) {
                    ctx.fillStyle = accentColor;
                    ctx.fillRect(x, topY + (spriteHeight * 0.2), 1, spriteHeight * 0.6);
                }

                // Pointy distorted skull processing layer
                if (pct > 0.35 && pct < 0.65) {
                    let headHeight = spriteHeight * 0.25;
                    ctx.fillStyle = '#000000';
                    let twitch = (sprite.state === 'HUNTING') ? Math.sin(Date.now() * 0.05) * 2 : 0;
                    ctx.fillRect(x + twitch, topY, 1, headHeight);

                    // Piercing crimson glowing tracking vectors
                    ctx.fillStyle = sprite.state === 'HUNTING' ? '#ff0000' : '#aa0000';

                    // Draw precise tracking pixels representing glowing left/right pupils
                    if (Math.abs(pct - 0.44) < 0.03 && (Date.now() % 600 > 40)) {
                        ctx.fillRect(x, topY + (headHeight * 0.4), 2, spriteHeight * 0.03);
                    }
                    if (Math.abs(pct - 0.56) < 0.03 && (Date.now() % 600 > 40)) {
                        ctx.fillRect(x, topY + (headHeight * 0.4), 2, spriteHeight * 0.03);
                    }
                }

                // Asymmetric lanky slender claws hanging down on peripheral borders
                if ((pct < 0.15 || pct > 0.85) && x % 2 === 0) {
                    ctx.fillStyle = '#111';
                    ctx.fillRect(x, topY + (spriteHeight * 0.4), 1, spriteHeight * 0.55);
                }

                // Draw floating descriptive tracking metrics directly over head center slices
                if (x === Math.floor(screenX)) {
                    ctx.fillStyle = sprite.state === 'HUNTING' ? '#ff3333' : '#666';
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    let statusLabel = sprite.state === 'HUNTING' ? `⚠️ ALERT: ${sprite.type.toUpperCase()}` : `[${sprite.type}]`;
                    ctx.fillText(statusLabel, screenX, topY - 15);
                }
            }
        }
    });
}

// --- RADAR RADIAL 2D HUD MAPPER ---
function drawMinimap() {
    const scale = 0.15, offset = 15;
    const mapOffsetLeft = canvas.width - (MAP_SIZE * TILE_SIZE * scale) - offset;
    
    // Background plate
    ctx.fillStyle = 'rgba(11, 12, 16, 0.85)';
    ctx.fillRect(mapOffsetLeft, offset, MAP_SIZE * TILE_SIZE * scale, MAP_SIZE * TILE_SIZE * scale);

    // Draw Sanctuary bounds highlight boxes
    ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
    ctx.fillRect(mapOffsetLeft + (SAFE_ZONE.minX * scale), offset + (SAFE_ZONE.minY * scale), (SAFE_ZONE.maxX - SAFE_ZONE.minX) * scale, (SAFE_ZONE.maxY - SAFE_ZONE.minY) * scale);
    ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 1;
    ctx.strokeRect(mapOffsetLeft + (SAFE_ZONE.minX * scale), offset + (SAFE_ZONE.minY * scale), (SAFE_ZONE.maxX - SAFE_ZONE.minX) * scale, (SAFE_ZONE.maxY - SAFE_ZONE.minY) * scale);

    // Render structural walls layout geometry blocks
    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            if (MAP[r][c] > 0) {
                ctx.fillStyle = '#1f2833';
                ctx.fillRect(mapOffsetLeft + (c * TILE_SIZE * scale), offset + (r * TILE_SIZE * scale), TILE_SIZE * scale, TILE_SIZE * scale);
            }
        }
    }
    
    // Draw player node tracker location points
    let px = mapOffsetLeft + (player.x * scale), py = offset + (player.y * scale);
    ctx.fillStyle = player.inSafeZone ? '#2ecc71' : (player.isCrouching ? '#4a90e2' : '#50e3c2');
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();

    // Map monster markers positions onto minimap coordinates panel
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(mapOffsetLeft + (e.x * scale), offset + (e.y * scale), 3, 0, Math.PI * 2); ctx.fill();
    });
}

// --- PHYSICS ENGINE TICK SIMULATION CONTROLLER ---
function updatePhysics() {
    if (gameState !== 'PLAYING') return;

    // Process positional angle rotation values
    player.angle += inputs.rotate * player.rotSpeed;
    let currentSpeed = player.isCrouching ? player.crouchSpeed : player.walkSpeed;
    let moveDist = inputs.moveForward * currentSpeed;
    let newX = player.x + Math.cos(player.angle) * moveDist, newY = player.y + Math.sin(player.angle) * moveDist;

    // Axis sliding collision footprint tracking wall boundary matrices
    if (MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(newX / TILE_SIZE)] === 0) player.x = newX;
    if (MAP[Math.floor(newY / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] === 0) player.y = newY;

    // Check sanctuary zone entry thresholds parameters
    player.inSafeZone = (player.x >= SAFE_ZONE.minX && player.x <= SAFE_ZONE.maxX && player.y >= SAFE_ZONE.minY && player.y <= SAFE_ZONE.maxY);
    if (player.inSafeZone && player.hp < 100) {
        player.hp = Math.min(100, player.hp + 0.05); // Slow tick health regeneration
        updateHUD();
    }
    player.noiseRadius = (inputs.moveForward !== 0 && !player.isCrouching) ? 170 : 0;

    // AI logic state updates loop for both remaining enemies
    enemies.forEach(e => {
        let dist = Math.hypot(player.x - e.x, player.y - e.y);
        
        if (player.inSafeZone) {
            e.state = 'PATROL'; // Force instant drop-aggro loop cycles
        } else if (player.noiseRadius > 0 && dist <= player.noiseRadius) {
            e.state = 'HUNTING';
        }

        if (e.state === 'PATROL') {
            let target = e.waypoints[e.targetIndex];
            let tDist = Math.hypot(target.x - e.x, target.y - e.y);
            if (tDist < 10) e.targetIndex = (e.targetIndex + 1) % e.waypoints.length;
            e.angle = Math.atan2(target.y - e.y, target.x - e.x);
        } else {
            e.angle = Math.atan2(player.y - e.y, player.x - e.x); // Lock tracking straight vector line onto player
        }

        let nEx = e.x + Math.cos(e.angle) * e.speed, nEy = e.y + Math.sin(e.angle) * e.speed;
        if (MAP[Math.floor(e.y / TILE_SIZE)][Math.floor(nEx / TILE_SIZE)] === 0) e.x = nEx;
        if (MAP[Math.floor(nEy / TILE_SIZE)][Math.floor(e.x / TILE_SIZE)] === 0) e.y = nEy;

        // Proximity footprint engagement loops mapping active hit bounds checks
        if (dist < 22 && !player.inSafeZone) {
            player.hp = Math.max(0, player.hp - 0.4);
            updateHUD();
            if (player.hp <= 0) changeState('GAME_OVER'); // Force Game Over conditions loop switches
        }
    });
}

// --- TOUCH INTERFACE JOYSTICK CONTROLLERS OVERRIDES ---
if (isTouchDevice) {
    const joyBase = document.getElementById('virtual-joystick'), joyHandle = document.getElementById('joystick-handle');
    joyBase.addEventListener('touchmove', (e) => {
        e.preventDefault(); if(gameState !== 'PLAYING') return;
        let rect = joyBase.getBoundingClientRect(), centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
        let dx = e.touches[0].clientX - centerX, dy = e.touches[0].clientY - centerY, distance = Math.hypot(dx, dy);
        if (distance > 45) { dx = (dx / distance) * 45; dy = (dy / distance) * 45; }
        joyHandle.style.transform = `translate(${dx}px, ${dy}px)`;
        inputs.moveForward = -dy / 45; inputs.rotate = dx / 45;
    });
    joyBase.addEventListener('touchend', () => { joyHandle.style.transform = 'translate(0px, 0px)'; inputs.moveForward = 0; inputs.rotate = 0; });
    document.getElementById('touch-crouch').addEventListener('touchstart', () => { if(gameState==='PLAYING'){ player.isCrouching = !player.isCrouching; document.getElementById('touch-crouch').style.background = player.isCrouching ? '#c5a059' : '#1f2833'; }});
    document.getElementById('touch-heal').addEventListener('touchstart', () => { if(gameState==='PLAYING') useMedkit(); });
    document.getElementById('touch-craft-a').addEventListener('touchstart', () => { if(gameState==='PLAYING') craftItem('medkit'); });
    document.getElementById('touch-craft-d').addEventListener('touchstart', () => { if(gameState==='PLAYING') craftItem('shiv'); });
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
