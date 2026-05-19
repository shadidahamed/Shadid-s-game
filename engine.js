const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START_SCREEN';
let currentLevel = 1;
const TILE_SIZE = 64;
const MAP_SIZE = 12;

let depthBuffer = new Array(canvas.width);
let player, enemies, inventory;
let keys = {};

// --- MULTI-STAGE PROCEDURAL MAZE ARRAYS ---
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
        [1,0,1,1,1,1,2,1,1,0,1,1],
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

let MAP = MAZES[1];

// Primary Objective & Infiltration Coordinates
const FUEL_CELL = { x: 0, y: 0, collected: false };
const ESCAPE_HATCH = { x: 96, y: 96 };
const SAFE_ZONE = { minX: 64, maxX: 192, minY: 64, maxY: 192 };

// --- DOM REGISTRATION LINK INTERFACES ---
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuSubtitle = document.getElementById('menu-subtitle');
const levelIndicator = document.getElementById('level-indicator');
const btnPrimary = document.getElementById('btn-primary');
const btnRestart = document.getElementById('btn-restart');
const hudOverlay = document.getElementById('hud-overlay');
const damageFlash = document.getElementById('damage-flash');

// --- LEVEL SECTOR INITIATION AND CONFIG MATRIX ---
function initLevel(level) {
    currentLevel = level;
    MAP = MAZES[currentLevel];

    player = {
        x: 96, y: 96, angle: 0.6, fov: Math.PI / 3,
        walkSpeed: 2.5, crouchSpeed: 1.2, rotSpeed: 0.048,
        isCrouching: false, noiseRadius: 0, hp: player ? player.hp : 100, inSafeZone: true
    };

    FUEL_CELL.collected = false;
    
    // Dynamic Level Scattering configuration targets
    if (currentLevel % 2 === 0) {
        FUEL_CELL.x = 10 * TILE_SIZE + 32; FUEL_CELL.y = 1 * TILE_SIZE + 32;
    } else {
        FUEL_CELL.x = 10 * TILE_SIZE + 32; FUEL_CELL.y = 10 * TILE_SIZE + 32;
    }

    // AI configurations: Slowed base movement, but intensified field-of-view alert sensors
    enemies = [
        { 
            id: 1, type: 'Stalker', x: 8 * TILE_SIZE, y: 8 * TILE_SIZE, angle: 0, 
            speed: 0.5 + (currentLevel * 0.08), radius: 12, color: '#ff3300', state: 'PATROL',
            waypoints: [{x: 8 * TILE_SIZE, y: 8 * TILE_SIZE}, {x: 3 * TILE_SIZE, y: 9 * TILE_SIZE}], targetIdx: 0
        },
        { 
            id: 2, type: 'Wanderer', x: 2 * TILE_SIZE, y: 10 * TILE_SIZE, angle: Math.PI, 
            speed: 0.4 + (currentLevel * 0.06), radius: 14, color: '#bd00ff', state: 'PATROL',
            waypoints: [{x: 2 * TILE_SIZE, y: 10 * TILE_SIZE}, {x: 10 * TILE_SIZE, y: 4 * TILE_SIZE}], targetIdx: 0
        }
    ];

    if (level === 1) {
        inventory = { alcohol: 3, binding: 2, blades: 2, medkits: 1, shivs: 0 };
    }
    updateHUD();
}

// --- STATE MANAGER PIPELINE ---
function changeState(newState) {
    gameState = newState;
    switch(gameState) {
        case 'START_SCREEN':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            levelIndicator.style.display = 'none';
            menuTitle.innerText = "DEAD ZONE";
            menuTitle.style.color = "#ff3300";
            btnPrimary.innerText = "ENGAGE INFILTRATION";
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
            menuTitle.innerText = "BIO-SIGN FLATLINE";
            menuTitle.style.color = "#ff0000";
            menuSubtitle.innerText = "SECTOR SECURE MATRIX HAS CRASHED.";
            btnPrimary.innerText = "RE-ENGAGE SYSTEM";
            btnRestart.style.display = 'none';
            break;
        case 'LEVEL_CLEAR':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            levelIndicator.style.display = 'block';
            levelIndicator.innerText = `SECTOR ${currentLevel} COMPROMISED & CLEARED`;
            menuTitle.innerText = "ZONE EXTRACTED";
            menuTitle.style.color = "#00ff66";
            menuSubtitle.innerText = "PROCEED TO THE NEXT SECTOR LIFT DECK GATE.";
            btnPrimary.innerText = "DEVIATE TO NEXT SECTOR";
            btnRestart.style.display = 'none';
            break;
        case 'VICTORY':
            menuOverlay.style.display = 'flex';
            hudOverlay.style.display = 'none';
            levelIndicator.style.display = 'none';
            menuTitle.innerText = "MISSION SUCCESS";
            menuTitle.style.color = "#00ff66";
            menuSubtitle.innerText = "ALL FUEL CAPSULES SECURED. RECON DATA ARCHIVED.";
            btnPrimary.innerText = "RE-EXECUTE SURVIVAL REC";
            btnRestart.style.display = 'none';
            break;
    }
}

// --- CONTROL TERMINAL EVENT BINDINGS ---
btnPrimary.addEventListener('click', () => {
    if (gameState === 'START_SCREEN' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        initLevel(1); changeState('PLAYING');
    } else if (gameState === 'LEVEL_CLEAR') {
        initLevel(currentLevel + 1); changeState('PLAYING');
    }
});

// --- HARDWARE INTERFACE CAPTURE PLATFORMS ---
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { 
    keys[e.key.toLowerCase()] = false; 
    if (e.key.toLowerCase() === 'a') craftItem('medkit');
    if (e.key.toLowerCase() === 'd') craftItem('shiv');
    if (e.key.toLowerCase() === 'q') useMedkit();
    if (e.key === ' ') { player.isCrouching = !player.isCrouching; updateHUD(); }
});

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
        inventory.medkits--; player.hp = Math.min(100, player.hp + 45);
        updateHUD();
    }
}

function updateHUD() {
    const hpEl = document.getElementById('hp-display');
    hpEl.innerText = Math.round(player.hp);
    hpEl.style.color = player.inSafeZone ? '#00ff66' : (player.hp < 35 ? '#ff2200' : '#ffffff');
    document.getElementById('level-display').innerText = currentLevel;
    
    let taskText = !FUEL_CELL.collected ? "⚠️ FETCH IMMUNIZATION CELL" : "⚡ CELL EXTRACTED. GET TO ELEVATOR START";
    document.getElementById('inv-display').innerText = `${taskText} || MEDS: ${inventory.medkits} | SHIVS: ${inventory.shivs} ${player.isCrouching ? '[STEALTH ENGAGED]' : ''}`;
}

// --- ELASTIC TOUCH JOYSTICK SYSTEM CONTROL ---
let joystick = { active: false, startX: 0, startY: 0, moveX: 0, moveY: 0 };
const jsZone = document.getElementById('virtual-joystick');
const jsHandle = document.getElementById('joystick-handle');

jsZone.addEventListener('touchstart', e => {
    joystick.active = true;
    const t = e.touches[0];
    const rect = jsZone.getBoundingClientRect();
    joystick.startX = rect.left + rect.width / 2;
    joystick.startY = rect.top + rect.height / 2;
    handleJoystickInput(t);
});

jsZone.addEventListener('touchmove', e => {
    if (!joystick.active) return;
    handleJoystickInput(e.touches[0]);
});

jsZone.addEventListener('touchend', () => {
    joystick.active = false; joystick.moveX = 0; joystick.moveY = 0;
    jsHandle.style.transform = "translate(0px, 0px)";
});

function handleJoystickInput(touch) {
    let dx = touch.clientX - joystick.startX;
    let dy = touch.clientY - joystick.startY;
    const boundary = 32;
    const distance = Math.hypot(dx, dy);

    if (distance > boundary) {
        dx = (dx / distance) * boundary;
        dy = (dy / distance) * boundary;
    }
    jsHandle.style.transform = `translate(${dx}px, ${dy}px)`;
    joystick.moveX = dx / boundary;
    joystick.moveY = dy / boundary;
}

// Mobile Tactical Button Hooks
document.getElementById('touch-crouch').addEventListener('touchstart', () => { player.isCrouching = !player.isCrouching; updateHUD(); });
document.getElementById('touch-heal').addEventListener('touchstart', useMedkit);
document.getElementById('touch-craft-a').addEventListener('touchstart', () => craftItem('medkit'));
document.getElementById('touch-craft-d').addEventListener('touchstart', () => craftItem('shiv'));

// --- HIGH-PERFORMANCE PSEUDO-3D CORE RAYCAST RENDERING PIPELINE ---
function renderGame() {
    // Ceiling and Floor rendering arrays
    ctx.fillStyle = '#06080b'; ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = '#020305'; ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    let numRays = canvas.width;
    let rayAngle = player.angle - player.fov / 2;
    let increment = player.fov / numRays;

    for (let i = 0; i < numRays; i++) {
        let distance = 0, step = 2.0, hitWall = false, wallType = 1;
        let cos = Math.cos(rayAngle), sin = Math.sin(rayAngle);

        while (!hitWall && distance < 650) {
            distance += step;
            let cx = Math.floor((player.x + cos * distance) / TILE_SIZE);
            let cy = Math.floor((player.y + sin * distance) / TILE_SIZE);

            if (cx < 0 || cx >= MAP_SIZE || cy < 0 || cy >= MAP_SIZE) {
                hitWall = true; distance = 650;
            } else if (MAP[cy][cx] > 0) {
                hitWall = true; wallType = MAP[cy][cx];
            }
        }

        let correctedDist = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDist;

        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / correctedDist);
        let shade = Math.max(0, 180 - (correctedDist * 0.42));

        // Procedural Custom Textured Wall Shader Layers
        if (wallType === 2) {
            // Leaking Chemical Wall Variant (Hazard Orange Accents)
            let textureStripe = Math.sin(i * 0.2) > 0.4 ? 1.1 : 0.7;
            ctx.fillStyle = `rgb(${shade * 0.9 * textureStripe}, ${shade * 0.25 * textureStripe}, 0)`;
        } else {
            // Metallic Industrial Columns Variant (Deep Charcoal Tint)
            let texturePlate = i % 16 < 2 ? 0.5 : 1.0;
            ctx.fillStyle = `rgb(${shade * 0.35 * texturePlate}, ${shade * 0.38 * texturePlate}, ${shade * 0.42 * texturePlate})`;
        }

        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);
        rayAngle += increment;
    }

    render3DEntities();
    drawTrackerCompass();
    drawRadarOverlay();

    // Safezone Ambient Overlay HUD Glow Filter Effect
    if (player.inSafeZone) {
        ctx.fillStyle = 'rgba(0, 255, 102, 0.04)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// --- BILLBOARD ENTITY RENDERING ENGINE LAYERS ---
function render3DEntities() {
    let entities = [];
    let objective = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    entities.push({ x: objective.x, y: objective.y, isItem: true, color: !FUEL_CELL.collected ? '#ff5500' : '#00ff66' });

    enemies.forEach(e => { entities.push({ x: e.x, y: e.y, isItem: false, color: e.color, state: e.state }); });
    entities.sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y));

    entities.forEach(ent => {
        let sx = ent.x - player.x, sy = ent.y - player.y;
        let angle = Math.atan2(sy, sx) - player.angle;

        while (angle < -Math.PI) angle += Math.PI * 2;
        while (angle > Math.PI) angle -= Math.PI * 2;

        let dist = Math.hypot(sx, sy);
        if (dist < 12 || Math.abs(angle) >= player.fov) return;

        let size = Math.min(canvas.height * 1.3, (TILE_SIZE * canvas.height) / dist);
        let screenX = Math.tan(angle) * (canvas.width / 2) + (canvas.width / 2);
        let topY = canvas.height / 2 - size / 2;

        let leftX = Math.floor(screenX - size / 4);
        let rightX = Math.floor(screenX + size / 4);

        for (let x = leftX; x < rightX; x++) {
            if (x >= 0 && x < canvas.width && depthBuffer[x] > dist) {
                if (ent.isItem) {
                    ctx.fillStyle = ent.color;
                    ctx.fillRect(x, topY + size * 0.25, 1, size * 0.5);
                } else {
                    ctx.fillStyle = '#07090c'; ctx.fillRect(x, topY, 1, size); // Silhouette
                    if (Math.sin(x * 0.3) > -0.2) {
                        ctx.fillStyle = ent.state === 'HUNTING' ? '#ff1100' : ent.color;
                        ctx.fillRect(x, topY + size * 0.15, 1, size * 0.7);
                    }
                }
            }
        }
    });
}

// --- RADAR COMPASS UI ORIENTATION ROUTINES ---
function drawTrackerCompass() {
    let target = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    let diff = Math.atan2(target.y - player.y, target.x - player.x) - player.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    ctx.fillStyle = '#ff6600'; ctx.font = '900 11px monospace'; ctx.textAlign = 'center';
    if (diff < -0.22) ctx.fillText("📡 BEACON LOCK: ALTER PORT ROTATION", canvas.width / 2, canvas.height - 20);
    else if (diff > 0.22) ctx.fillText("📡 BEACON LOCK: ALTER STARBOARD ROTATION", canvas.width / 2, canvas.height - 20);
    else ctx.fillText("⚡ TARGET LOCK ACQUIRED: MAINTAIN HEADING", canvas.width / 2, canvas.height - 20);
}

// --- MINIMAP RADAR LAYER OVERLAY ---
function drawRadarOverlay() {
    const scale = 0.11, pad = 15;
    const startX = canvas.width - (MAP_SIZE * TILE_SIZE * scale) - pad;

    ctx.fillStyle = 'rgba(7, 9, 13, 0.9)';
    ctx.fillRect(startX, pad, MAP_SIZE * TILE_SIZE * scale, MAP_SIZE * TILE_SIZE * scale);

    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            if (MAP[r][c] > 0) {
                ctx.fillStyle = '#1c232d';
                ctx.fillRect(startX + (c * TILE_SIZE * scale), pad + (r * TILE_SIZE * scale), TILE_SIZE * scale - 0.5, TILE_SIZE * scale - 0.5);
            }
        }
    }

    let objective = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    ctx.fillStyle = !FUEL_CELL.collected ? '#ff6600' : '#00ff66';
    ctx.fillRect(startX + (objective.x * scale) - 1.5, pad + (objective.y * scale) - 1.5, 3, 3);

    ctx.fillStyle = player.isCrouching ? '#ffcc00' : '#ffffff';
    ctx.beginPath(); ctx.arc(startX + player.x * scale, pad + player.y * scale, 2.5, 0, Math.PI * 2); ctx.fill();

    enemies.forEach(e => {
        let dist = Math.hypot(player.x - e.x, player.y - e.y);
        // Blips dissolve on tracking monitors if user is operating silently inside stealth vectors
        if (!player.isCrouching || dist < 140 || e.state === 'HUNTING') {
            ctx.fillStyle = e.state === 'HUNTING' ? '#ff0000' : e.color;
            ctx.beginPath(); ctx.arc(startX + e.x * scale, pad + e.y * scale, 2, 0, Math.PI * 2); ctx.fill();
        }
    });
}

// --- ENVIRONMENTAL FRAME PHYSICS TICK CONTROL ENGINE ---
function processPhysics() {
    if (gameState !== 'PLAYING') return;

    let forwardInput = 0, rotationalInput = 0;

    if (keys['arrowup'] || keys['w']) forwardInput = 1;
    if (keys['arrowdown'] || keys['s']) forwardInput = -1;
    if (keys['arrowleft'] || keys['a']) rotationalInput = -1;
    if (keys['arrowright'] || keys['d']) rotationalInput = 1;

    if (joystick.active) {
        forwardInput = -joystick.moveY; rotationalInput = joystick.moveX * 0.85;
    }

    player.angle += rotationalInput * player.rotSpeed;
    let speed = player.isCrouching ? player.crouchSpeed : player.walkSpeed;
    let step = forwardInput * speed;

    let targetX = player.x + Math.cos(player.angle) * step;
    let targetY = player.y + Math.sin(player.angle) * step;

    if (MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(targetX / TILE_SIZE)] === 0) player.x = targetX;
    if (MAP[Math.floor(targetY / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] === 0) player.y = targetY;

    player.inSafeZone = (player.x >= SAFE_ZONE.minX && player.x <= SAFE_ZONE.maxX && player.y >= SAFE_ZONE.minY && player.y <= SAFE_ZONE.maxY);
    player.noiseRadius = (forwardInput !== 0 && !player.isCrouching) ? 200 : 0;

    if (player.inSafeZone && player.hp < 100) {
        player.hp = Math.min(100, player.hp + 0.1); updateHUD();
    }

    if (!FUEL_CELL.collected && Math.hypot(player.x - FUEL_CELL.x, player.y - FUEL_CELL.y) < 30) {
        FUEL_CELL.collected = true; updateHUD();
    }

    if (FUEL_CELL.collected && Math.hypot(player.x - ESCAPE_HATCH.x, player.y - ESCAPE_HATCH.y) < 30) {
        if (currentLevel < 6) changeState('LEVEL_CLEAR'); else changeState('VICTORY');
        return;
    }

    enemies.forEach(e => {
        let dist = Math.hypot(player.x - e.x, player.y - e.y);

        if (player.inSafeZone) e.state = 'PATROL';
        else if (player.noiseRadius > 0 && dist <= player.noiseRadius) e.state = 'HUNTING';
        else if (dist < 95) e.state = 'HUNTING';

        if (e.state === 'PATROL') {
            let node = e.waypoints[e.targetIdx];
            if (Math.hypot(node.x - e.x, node.y - e.y) < 15) e.targetIdx = (e.targetIdx + 1) % e.waypoints.length;
            e.angle = Math.atan2(node.y - e.y, node.x - e.x);
        } else {
            e.angle = Math.atan2(player.y - e.y, player.x - e.x);
        }

        let exNext = e.x + Math.cos(e.angle) * e.speed;
        let eyNext = e.y + Math.sin(e.angle) * e.speed;

        if (MAP[Math.floor(e.y / TILE_SIZE)][Math.floor(exNext / TILE_SIZE)] === 0) e.x = exNext;
        if (MAP[Math.floor(eyNext / TILE_SIZE)][Math.floor(e.x / TILE_SIZE)] === 0) e.y = eyNext;

        if (dist < 24 && !player.inSafeZone) {
            player.hp = Math.max(0, player.hp - 0.75); updateHUD();
            damageFlash.style.background = "rgba(255, 0, 0, 0.4)";
            setTimeout(() => { damageFlash.style.background = "rgba(255, 0, 0, 0)"; }, 60);
            if (player.hp <= 0) changeState('GAME_OVER');
        }
    });
}

// --- INITIATE CLOCK LOOP ENGINE RUNNERS ---
initLevel(1);
function frame() {
    processPhysics();
    if (gameState === 'PLAYING') renderGame();
    requestAnimationFrame(frame);
}
frame();
