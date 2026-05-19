const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START_SCREEN';
let currentLevel = 1;
const TILE_SIZE = 64;

// --- 6 DISTINCT LEVEL MAZES ---
// 1 = Solid Reinforced Structural Concrete Wall
// 2 = Broken/Damaged Wall Panel (Visual contrast variant)
const MAZES = {
    1: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,1,0,0,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    2: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,1],
        [1,1,1,0,1,0,1,0,1,1,0,1],
        [1,0,0,0,1,0,0,0,1,0,0,1],
        [1,0,1,1,1,1,1,1,1,0,1,1],
        [1,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,1,2,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,0,1,0,1],
        [1,1,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,1,0,1,0,1],
        [1,0,1,1,1,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    3: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,1,0,0,1,0,0,0,1],
        [1,1,1,0,1,0,0,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,1,1,0,1,0,1],
        [1,0,0,0,1,0,1,0,0,0,0,1],
        [1,1,1,0,0,0,1,0,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    4: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,0,0,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,2,1,0,1,0,1],
        [1,0,1,0,0,0,0,1,0,0,0,1],
        [1,0,1,0,1,1,0,1,1,1,1,1],
        [1,0,1,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,1,0,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    5: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,1,0,1,0,0,1,0,1,0,1],
        [1,0,1,0,1,1,0,1,0,1,0,1],
        [1,0,1,0,0,0,0,1,0,1,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    6: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,1,0,0,1],
        [1,1,1,0,1,0,1,0,1,0,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,1,0,1,0,0,1,0,1,0,1],
        [1,0,0,0,1,0,0,1,0,0,0,1],
        [1,1,1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
    ]
};

// --- CORE ENGINE VARIABLES ---
let MAP = MAZES[1];
const MAP_SIZE = 12;
let depthBuffer = new Array(canvas.width);
let player, enemies, inventory;
let keys = {};

// Target Configuration Values
const FUEL_CELL = { x: 10 * TILE_SIZE + 32, y: 10 * TILE_SIZE + 32, collected: false };
const ESCAPE_HATCH = { x: 1 * TILE_SIZE + 32, y: 1 * TILE_SIZE + 32 };

// Safe extraction sanctuary space bounds (Start platform)
const SAFE_ZONE = { minX: TILE_SIZE, maxX: TILE_SIZE * 3, minY: TILE_SIZE, maxY: TILE_SIZE * 3 };

// --- DOM INTERFACE OBJECTS ---
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuSubtitle = document.getElementById('menu-subtitle');
const levelIndicator = document.getElementById('level-indicator');
const btnPrimary = document.getElementById('btn-primary');
const btnRestart = document.getElementById('btn-restart');
const hudOverlay = document.getElementById('hud-overlay');

// --- LEVEL MAP INJECTOR & GENERATION INITIALIZER ---
function initLevel(level) {
    currentLevel = level;
    MAP = MAZES[currentLevel];

    player = {
        x: 96, y: 96, angle: 0.5, fov: Math.PI / 3,
        walkSpeed: 2.4, crouchSpeed: 1.1, rotSpeed: 0.045,
        isCrouching: false, noiseRadius: 0, hp: player ? player.hp : 100, inSafeZone: true
    };

    FUEL_CELL.collected = false;
    
    // Dynically scatter points across the map based on the specific current level sequence
    FUEL_CELL.x = (currentLevel % 2 === 0) ? (10 * TILE_SIZE + 32) : (1 * TILE_SIZE + 32);
    FUEL_CELL.y = (currentLevel % 2 === 0) ? (1 * TILE_SIZE + 32) : (10 * TILE_SIZE + 32);

    // AI configurations: Slower base movespeeds, but enhanced proximity checking matrices
    enemies = [
        { 
            id: 1, type: 'Stalker', x: 8 * TILE_SIZE, y: 8 * TILE_SIZE, angle: 0, 
            speed: 0.7 + (currentLevel * 0.08), radius: 12, color: '#ff3300', state: 'PATROL',
            waypoints: [{x: 8 * TILE_SIZE, y: 8 * TILE_SIZE}, {x: 4 * TILE_SIZE, y: 9 * TILE_SIZE}], targetIdx: 0
        },
        { 
            id: 2, type: 'Wanderer', x: 2 * TILE_SIZE, y: 10 * TILE_SIZE, angle: Math.PI, 
            speed: 0.5 + (currentLevel * 0.05), radius: 14, color: '#9900ff', state: 'PATROL',
            waypoints: [{x: 2 * TILE_SIZE, y: 10 * TILE_SIZE}, {x: 10 * TILE_SIZE, y: 5 * TILE_SIZE}], targetIdx: 0
        }
    ];

    // Persist inventory variables between instances unless starting completely over
    if (level === 1) {
        inventory = { alcohol: 3, binding: 2, blades: 2, medkits: 1, shivs: 0 };
    }
    
    updateHUD();
}

// --- STATE MACHINE ROUTINES ---
function changeState(newState) {
    gameState = newState;
    switch(gameState) {
        case 'START_SCREEN':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            levelIndicator.style.display = 'none';
            menuTitle.innerText = "DEAD ZONE";
            menuTitle.style.color = "#ff3300";
            menuSubtitle.innerText = "A 2.5D SURVIVAL CHRONICLE";
            btnPrimary.innerText = "START INFILTRATION";
            btnRestart.style.display = 'none';
            break;
        case 'PLAYING':
            menuOverlay.style.display = 'none';
            hudOverlay.style.display = 'flex';
            break;
        case 'GAME_OVER':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            levelIndicator.style.display = 'none';
            menuTitle.innerText = "CRITICAL FAILURE";
            menuTitle.style.color = "#ff0000";
            menuSubtitle.innerText = "YOUR VITAL SIGNS FLATLINED IN THE MAZE";
            btnPrimary.innerText = "TRY AGAIN";
            btnRestart.style.display = 'none';
            break;
        case 'LEVEL_CLEAR':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            levelIndicator.style.display = 'block';
            levelIndicator.innerText = `ZONE ${currentLevel} SECURED`;
            menuTitle.innerText = "EXTRACTED";
            menuTitle.style.color = "#00ff66";
            menuSubtitle.innerText = "LOADING NEXT SECURED SECTOR PROFILE...";
            btnPrimary.innerText = "ENTER NEXT SECTOR";
            btnRestart.style.display = 'none';
            break;
        case 'VICTORY':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            levelIndicator.style.display = 'none';
            menuTitle.innerText = "ALL ZONES CLEAR";
            menuTitle.style.color = "#00ff66";
            menuSubtitle.innerText = "YOU OUTMANEUVERED THE MAZE AND SURVIVED THE INFECTION";
            btnPrimary.innerText = "RESTART RECON";
            btnRestart.style.display = 'none';
            break;
    }
}

// --- BUTTON TRIGGERS ---
btnPrimary.addEventListener('click', () => {
    if (gameState === 'START_SCREEN' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        initLevel(1);
        changeState('PLAYING');
    } else if (gameState === 'LEVEL_CLEAR') {
        initLevel(currentLevel + 1);
        changeState('PLAYING');
    }
});

// --- PLATFORM PERIPHERAL INPUT DECK LISTENERS ---
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { 
    keys[e.key.toLowerCase()] = false; 
    if (e.key.toLowerCase() === 'a') craftItem('medkit');
    if (e.key.toLowerCase() === 'd') craftItem('shiv');
    if (e.key.toLowerCase() === 'q') useMedkit();
    if (e.key === ' ') player.isCrouching = !player.isCrouching;
});

// --- CRAFTING LOGIC ---
function craftItem(type) {
    if (type === 'medkit' && inventory.alcohol >= 1 && inventory.binding >= 1) {
        inventory.alcohol--; inventory.binding--; inventory.medkits++;
    } else if (type === 'shiv' && inventory.blades >= 1 && inventory.binding >= 1) {
        inventory.blades--; inventory.binding--; inventory.shivs++;
    }
    updateHUD();
}

function useMedkit() {
    if (inventory.medkits > 0 && player.hp < 100) {
        inventory.medkits--; player.hp = Math.min(100, player.hp + 40);
        updateHUD();
    }
}

function updateHUD() {
    document.getElementById('hp-display').innerText = Math.round(player.hp);
    document.getElementById('level-display').innerText = currentLevel;
    let task = !FUEL_CELL.collected ? "⚡ EXTRACT THE AMPOULE CELL" : "🚪 RETURN TO LIFT EXTRACTION POINT";
    document.getElementById('inv-display').innerText = `${task} | MEDS: ${inventory.medkits} | SHIVS: ${inventory.shivs} [SPACE: STEALTH]`;
}

// --- FLEXIBLE ACCELERATION TOUCHSTICK CONTROLLER DECK ---
let joystick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, moveX: 0, moveY: 0 };
const jsZone = document.getElementById('joystick-zone');
const jsHandle = document.getElementById('joystick-handle');

jsZone.addEventListener('touchstart', e => {
    joystick.active = true;
    const t = e.touches[0];
    const rect = jsZone.getBoundingClientRect();
    joystick.startX = rect.left + rect.width / 2;
    joystick.startY = rect.top + rect.height / 2;
    processJoystickMove(t);
});

jsZone.addEventListener('touchmove', e => {
    if (!joystick.active) return;
    processJoystickMove(e.touches[0]);
});

jsZone.addEventListener('touchend', () => {
    joystick.active = false;
    joystick.moveX = 0; joystick.moveY = 0;
    jsHandle.style.transform = `translate(0px, 0px)`;
});

function processJoystickMove(touch) {
    let dx = touch.clientX - joystick.startX;
    let dy = touch.clientY - joystick.startY;
    const maxDist = 35;
    const dist = Math.hypot(dx, dy);
    
    if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
    }
    jsHandle.style.transform = `translate(${dx}px, ${dy}px)`;
    joystick.moveX = dx / maxDist; // Value spectrum range from -1.0 to 1.0
    joystick.moveY = dy / maxDist;
}

// Mobile Button Interfaces
document.getElementById('touch-crouch').addEventListener('touchstart', () => { player.isCrouching = !player.isCrouching; updateHUD(); });
document.getElementById('touch-heal').addEventListener('touchstart', useMedkit);
document.getElementById('touch-craft-a').addEventListener('touchstart', () => craftItem('medkit'));
document.getElementById('touch-craft-d').addEventListener('touchstart', () => craftItem('shiv'));

// --- MATHS PIPELINE PROCESS RENDERING LAYER ---
function renderGame() {
    // Solid background with linear dark shading gradient fallback
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    let numRays = canvas.width;
    let rayAngle = player.angle - player.fov / 2;
    let angleInc = player.fov / numRays;

    for (let i = 0; i < numRays; i++) {
        let distance = 0, step = 2.5, hitWall = false, wallType = 1;
        let cos = Math.cos(rayAngle), sin = Math.sin(rayAngle);

        while (!hitWall && distance < 700) {
            distance += step;
            let cx = Math.floor((player.x + cos * distance) / TILE_SIZE);
            let cy = Math.floor((player.y + sin * distance) / TILE_SIZE);

            if (cx < 0 || cx >= MAP_SIZE || cy < 0 || cy >= MAP_SIZE) {
                hitWall = true; distance = 700;
            } else if (MAP[cy][cx] > 0) {
                hitWall = true; wallType = MAP[cy][cx];
            }
        }

        let correctedDist = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDist;

        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / correctedDist);
        
        // Depth Shade falloff calculation (Darkness atmospheric envelope)
        let shade = Math.max(0, 190 - (correctedDist * 0.45));
        
        // Dynamic environment coloring logic (Orange accents mixed with charcoal tones)
        ctx.fillStyle = wallType === 2 
            ? `rgb(${shade * 0.9}, ${shade * 0.2}, 0)` 
            : `rgb(${shade * 0.4}, ${shade * 0.3}, ${shade * 0.25})`;
            
        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);
        rayAngle += angleInc;
    }

    render3DSprites();
    drawCompassUI();
    drawRadar();
}

// --- BILLBOARD ENTITY RENDERING (OBJECTIVES & IMMUNIZED ASSETS) ---
function render3DSprites() {
    let targets = [];
    let goal = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    targets.push({ x: goal.x, y: goal.y, isItem: true, color: !FUEL_CELL.collected ? '#ff7700' : '#00ff66', name: !FUEL_CELL.collected ? 'CELL' : 'ESCAPE' });

    enemies.forEach(e => { targets.push({ x: e.x, y: e.y, isItem: false, color: e.color, state: e.state }); });

    // Distance metric matrix depth buffer sort
    targets.sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y));

    targets.forEach(sp => {
        let sx = sp.x - player.x, sy = sp.y - player.y;
        let angle = Math.atan2(sy, sx) - player.angle;

        while (angle < -Math.PI) angle += Math.PI * 2;
        while (angle > Math.PI) angle -= Math.PI * 2;

        let dist = Math.hypot(sx, sy);
        if (dist < 12 || Math.abs(angle) >= player.fov) return;

        let size = Math.min(canvas.height * 1.2, (TILE_SIZE * canvas.height) / dist);
        let screenX = Math.tan(angle) * (canvas.width / 2) + (canvas.width / 2);
        let topY = canvas.height / 2 - size / 2;

        let startX = Math.floor(screenX - size / 4);
        let endX = Math.floor(screenX + size / 4);

        for (let x = startX; x < endX; x++) {
            if (x >= 0 && x < canvas.width && depthBuffer[x] > dist) {
                if (sp.isItem) {
                    ctx.fillStyle = sp.color;
                    ctx.fillRect(x, topY + size*0.3, 1, size * 0.4);
                } else {
                    // Draw solid charcoal base silhouette for villains
                    ctx.fillStyle = '#11141a';
                    ctx.fillRect(x, topY, 1, size);
                    
                    // Layer dynamic tracking indicators
                    if (Math.sin(x * 0.4) > 0.0) {
                        ctx.fillStyle = sp.state === 'HUNTING' ? '#ff0000' : sp.color;
                        ctx.fillRect(x, topY + size * 0.2, 1, size * 0.6);
                    }
                }
            }
        }
    });
}

// --- HUD LOOKUP NAVIGATION GUIDE ---
function drawCompassUI() {
    let goal = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    let diff = Math.atan2(goal.y - player.y, goal.x - player.x) - player.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    ctx.fillStyle = '#ff7700';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    
    if (diff < -0.25) ctx.fillText("◀◀ ANTENNA TRACKING LEFT", canvas.width/2, canvas.height - 25);
    else if (diff > 0.25) ctx.fillText("ANTENNA TRACKING RIGHT ▶▶", canvas.width/2, canvas.height - 25);
    else ctx.fillText("▲ SIGNAL ACQUIRED: FORWARD ▲", canvas.width/2, canvas.height - 25);
}

// --- ATMOSPHERIC COLLATERAL MINIMAP RADAR LAYER ---
function drawRadar() {
    const scale = 0.12, pad = 15;
    const startX = canvas.width - (MAP_SIZE * TILE_SIZE * scale) - pad;

    ctx.fillStyle = 'rgba(11, 12, 16, 0.85)';
    ctx.fillRect(startX, pad, MAP_SIZE * TILE_SIZE * scale, MAP_SIZE * TILE_SIZE * scale);

    // Draw Sanctuary bounds highlight boxes
    ctx.fillStyle = 'rgba(0, 255, 102, 0.12)';
    ctx.fillRect(startX + (SAFE_ZONE.minX * scale), pad + (SAFE_ZONE.minY * scale), (SAFE_ZONE.maxX - SAFE_ZONE.minX) * scale, (SAFE_ZONE.maxY - SAFE_ZONE.minY) * scale);

    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            if (MAP[r][c] > 0) {
                ctx.fillStyle = '#1f2833';
                ctx.fillRect(startX + (c * TILE_SIZE * scale), pad + (r * TILE_SIZE * scale), TILE_SIZE * scale - 1, TILE_SIZE * scale - 1);
            }
        }
    }

    // Goal point positioning markers
    let goal = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    ctx.fillStyle = !FUEL_CELL.collected ? '#ff7700' : '#00ff66';
    ctx.fillRect(startX + (goal.x * scale) - 2, pad + (goal.y * scale) - 2, 4, 4);

    // Player arrow draw rotation coordinate tracker
    let px = startX + player.x * scale, py = pad + player.y * scale;
    ctx.fillStyle = player.isCrouching ? '#ffcc00' : '#fff';
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();

    // AI position markers on radar (Blips fade if player is stealth crouching)
    enemies.forEach(e => {
        let d = Math.hypot(player.x - e.x, player.y - e.y);
        if (!player.isCrouching || d < 150 || e.state === 'HUNTING') {
            ctx.fillStyle = e.state === 'HUNTING' ? '#ff0000' : e.color;
            ctx.beginPath(); ctx.arc(startX + e.x * scale, pad + e.y * scale, 2.5, 0, Math.PI * 2); ctx.fill();
        }
    });
}

// --- ADVANCED GAME PHYSICS ENGINE LOOP TICK ---
function processPhysics() {
    if (gameState !== 'PLAYING') return;

    // Direct Dual-input mapping system processing (Keyboards OR Virtual Mobile Analog Sticks)
    let moveForward = 0, rotate = 0;

    if (keys['arrowup'] || keys['w']) moveForward = 1;
    if (keys['arrowdown'] || keys['s']) moveForward = -1;
    if (keys['arrowleft'] || keys['a']) rotate = -1;
    if (keys['arrowright'] || keys['d']) rotate = 1;

    if (joystick.active) {
        moveForward = -joystick.moveY; // Negative translates perfectly forward along layout vectors
        rotate = joystick.moveX * 0.8;
    }

    player.angle += rotate * player.rotSpeed;
    let currentSpeed = player.isCrouching ? player.crouchSpeed : player.walkSpeed;
    let stepDist = moveForward * currentSpeed;

    let nx = player.x + Math.cos(player.angle) * stepDist;
    let ny = player.y + Math.sin(player.angle) * stepDist;

    // Sliding collision grid-checks
    if (MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(nx / TILE_SIZE)] === 0) player.x = nx;
    if (MAP[Math.floor(ny / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] === 0) player.y = ny;

    // Dynamic environmental state detection
    player.inSafeZone = (player.x >= SAFE_ZONE.minX && player.x <= SAFE_ZONE.maxX && player.y >= SAFE_ZONE.minY && player.y <= SAFE_ZONE.maxY);
    player.noiseRadius = (moveForward !== 0 && !player.isCrouching) ? 190 : 0;

    // Process Safezone recovery parameters
    if (player.inSafeZone && player.hp < 100) {
        player.hp = Math.min(100, player.hp + 0.08);
        updateHUD();
    }

    // Objective Item proximity collision check loops
    if (!FUEL_CELL.collected && Math.hypot(player.x - FUEL_CELL.x, player.y - FUEL_CELL.y) < 28) {
        FUEL_CELL.collected = true;
        updateHUD();
    }

    if (FUEL_CELL.collected && Math.hypot(player.x - ESCAPE_HATCH.x, player.y - ESCAPE_HATCH.y) < 28) {
        if (currentLevel < 6) {
            changeState('LEVEL_CLEAR');
        } else {
            changeState('VICTORY');
        }
        return;
    }

    // Advanced Intelligent AI Tracking state processors
    enemies.forEach(e => {
        let distanceToPlayer = Math.hypot(player.x - e.x, player.y - e.y);

        if (player.inSafeZone) {
            e.state = 'PATROL';
        } else if (player.noiseRadius > 0 && distanceToPlayer <= player.noiseRadius) {
            e.state = 'HUNTING'; // Triggered by sprint noises
        } else if (distanceToPlayer < 90) {
            e.state = 'HUNTING'; // Visually acquired
        }

        if (e.state === 'PATROL') {
            let node = e.waypoints[e.targetIdx];
            if (Math.hypot(node.x - e.x, node.y - e.y) < 15) {
                e.targetIdx = (e.targetIdx + 1) % e.waypoints.length;
            }
            e.angle = Math.atan2(node.y - e.y, node.x - e.x);
        } else {
            e.angle = Math.atan2(player.y - e.y, player.x - e.x);
        }

        let AI_nx = e.x + Math.cos(e.angle) * e.speed;
        let AI_ny = e.y + Math.sin(e.angle) * e.speed;

        if (MAP[Math.floor(e.y / TILE_SIZE)][Math.floor(AI_nx / TILE_SIZE)] === 0) e.x = AI_nx;
        if (MAP[Math.floor(AI_ny / TILE_SIZE)][Math.floor(e.x / TILE_SIZE)] === 0) e.y = AI_ny;

        // Damage Collision matrix checks
        if (distanceToPlayer < 24 && !player.inSafeZone) {
            player.hp = Math.max(0, player.hp - 0.6);
            updateHUD();
            if (player.hp <= 0) changeState('GAME_OVER');
        }
    });
}

// --- GLOBAL MASTER ENGINE LOOP RUNNER ---
initLevel(1);
function runEngine() {
    processPhysics();
    if (gameState === 'PLAYING') {
        renderGame();
    }
    requestAnimationFrame(runEngine);
}
runEngine();
