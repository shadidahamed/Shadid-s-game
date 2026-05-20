const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START_SCREEN';
let currentLevel = 1;
let playerScore = 0;
const TILE_SIZE = 64;

// Operational Configuration Arrays
let depthBuffer = new Array(canvas.width);
let player, companion, enemies, coins;
let keys = {};

// Steering Wheel Variable Matrices
let wheelState = { isDragging: false, angle: 0, startAngle: 0, baseRotation: 0 };
let currentPaceMode = 'WALK'; // Options: 'STILL', 'WALK', 'DASH'

// Map Symbols Glossary: 
// 0=Empty Path, 1=Industrial Core Wall, 3=Directory Arrow Up, 4=Arrow Right, 5=Arrow Left, 9=DEADLINE Hazard Wall Block
const MAZES = {
    1: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,0,3,1],
        [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1],
        [1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1],
        [1,1,1,1,5,0,0,1,0,1,0,1,0,1,1,1],
        [1,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1],
        [1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,1,4,1],
        [1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,1,1,0,1,0,1,1,1,1,0,1,1,1,0,1],
        [1,0,0,0,1,0,1,9,9,1,0,0,0,1,0,1],
        [1,0,1,0,0,0,1,9,9,1,1,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    2: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,0,0,1,0,1,1,1,1,1,1,0,1],
        [1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,0,1,0,1,1,0,1,3,1],
        [1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,1],
        [1,1,4,1,0,0,1,1,1,1,1,0,1,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,1,1,1,1,1,1,5,1,1,0,1,0,1,1],
        [1,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [1,0,1,0,1,1,0,1,0,1,1,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,0,1,9,9,9,1,0,1],
        [1,1,1,1,1,0,1,1,0,1,9,9,9,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    3: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,1],
        [1,0,1,0,0,0,1,0,0,0,0,1,0,1,4,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,1,0,1,9,9,1,0,0,0,1],
        [1,1,1,3,1,0,1,0,1,9,9,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,1,9,9,1,0,0,0,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1],
        [1,0,1,0,0,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,1,5,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    4: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1],
        [1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,1],
        [1,3,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,1,0,1,9,9,9,1,0,1,0,0,1,5,1],
        [1,0,1,0,1,9,9,9,1,0,1,1,0,1,0,1],
        [1,0,0,0,1,9,9,9,1,0,0,1,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
        [1,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [1,4,1,0,1,1,0,1,0,1,1,1,1,1,0,1],
        [1,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,1,1,1,1,1,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    5: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,3,1],
        [1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1],
        [1,0,0,0,1,0,1,9,9,1,0,1,0,0,0,1],
        [1,0,1,1,1,0,1,9,9,1,0,1,1,1,0,1],
        [1,0,1,0,0,0,1,1,1,1,0,0,0,1,4,1],
        [1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1],
        [1,5,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,9,9,9,9,9,9,1,0,1,9,9,9,9,9,1],
        [1,9,9,9,9,9,9,1,0,1,9,9,9,9,9,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
};

let MAP = MAZES[1];
const MAP_HEIGHT = 16;
const MAP_WIDTH = 16;

// Target Extraction Parameter Nodes
const TARGET_CELL = { x: 14 * TILE_SIZE + 32, y: 14 * TILE_SIZE + 32 };

// Document Interface Mapping Links
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuSubtitle = document.getElementById('menu-subtitle');
const levelIndicator = document.getElementById('level-indicator');
const btnPrimary = document.getElementById('btn-primary');
const deathModal = document.getElementById('death-modal');
const btnModalRestart = document.getElementById('btn-modal-restart');
const hudOverlay = document.getElementById('hud-overlay');
const damageFlash = document.getElementById('damage-flash');
const btnPauseToggle = document.getElementById('btn-pause-toggle');
const btnQuitGame = document.getElementById('btn-quit-game');

const wheelDisc = document.getElementById('steering-wheel-disc');
const wheelIndicator = document.getElementById('wheel-indicator-dot');

// --- GAME INITIATION ENGINE MATRIX ---
function initLevel(level) {
    currentLevel = level;
    MAP = MAZES[currentLevel];

    player = {
        x: 1 * TILE_SIZE + 32,
        y: 1 * TILE_SIZE + 32,
        angle: 0.0,
        fov: Math.PI / 3.2,
        baseSpeed: 1.8,
        hp: 100
    };

    // Instantiate Companion running 40 units out directly ahead of Player Angle vector vectors
    companion = {
        x: player.x + 30,
        y: player.y,
        angle: 0.0,
        speed: 1.9,
        active: true,
        radius: 10,
        color: '#00ccff'
    };

    // Populate Level Target Coins
    coins = [
        { x: 3 * TILE_SIZE + 32, y: 1 * TILE_SIZE + 32, active: true },
        { x: 7 * TILE_SIZE + 32, y: 5 * TILE_SIZE + 32, active: true },
        { x: 13 * TILE_SIZE + 32, y: 3 * TILE_SIZE + 32, active: true },
        { x: 11 * TILE_SIZE + 32, y: 11 * TILE_SIZE + 32, active: true },
        { x: 2 * TILE_SIZE + 32, y: 13 * TILE_SIZE + 32, active: true }
    ];

    // Instantiate 4 Independent AI Threat Units
    enemies = [
        { id: 1, x: 5 * TILE_SIZE + 32, y: 3 * TILE_SIZE + 32, speed: 0.7 + (level * 0.1), color: '#ff2200', angle: 0 },
        { id: 2, x: 13 * TILE_SIZE + 32, y: 7 * TILE_SIZE + 32, speed: 0.6 + (level * 0.1), color: '#ff2200', angle: Math.PI },
        { id: 3, x: 3 * TILE_SIZE + 32, y: 9 * TILE_SIZE + 32, speed: 0.8 + (level * 0.08), color: '#ff5500', angle: Math.PI / 2 },
        { id: 4, x: 9 * TILE_SIZE + 32, y: 13 * TILE_SIZE + 32, speed: 0.5 + (level * 0.12), color: '#ff0055', angle: -Math.PI / 2 }
    ];

    updateHUD();
}

// --- STATE MANAGEMENT PIPELINE MANAGER ---
function changeState(newState) {
    gameState = newState;
    switch(gameState) {
        case 'START_SCREEN':
            menuOverlay.style.display = 'flex';
            deathModal.style.display = 'none';
            levelIndicator.style.display = 'none';
            menuTitle.innerText = "DEAD ZONE";
            btnPrimary.innerText = "ENGAGE INFILTRATION";
            break;
        case 'PLAYING':
            menuOverlay.style.display = 'none';
            deathModal.style.display = 'none';
            break;
        case 'PAUSED':
            menuOverlay.style.display = 'flex';
            menuTitle.innerText = "SYSTEM PAUSED";
            btnPrimary.innerText = "RESUME RUN";
            break;
        case 'GAME_OVER':
            menuOverlay.style.display = 'none';
            deathModal.style.display = 'flex';
            break;
        case 'LEVEL_CLEAR':
            menuOverlay.style.display = 'flex';
            levelIndicator.style.display = 'block';
            levelIndicator.innerText = `SECTOR ${currentLevel} EXTRACTED`;
            menuTitle.innerText = "GATE OPENED";
            btnPrimary.innerText = "PROCEED TO NEXT SECTOR";
            break;
        case 'VICTORY':
            menuOverlay.style.display = 'flex';
            levelIndicator.style.display = 'none';
            menuTitle.innerText = "CORE ESCAPED";
            menuTitle.style.color = "#00ff66";
            btnPrimary.innerText = "RE-ENGAGE MASTER SYSTEM";
            break;
    }
}

// --- HARDWARE INTERFACE HOOK ATTACHMENTS ---
btnPrimary.addEventListener('click', () => {
    if (gameState === 'START_SCREEN' || gameState === 'VICTORY') {
        playerScore = 0; initLevel(1); changeState('PLAYING');
    } else if (gameState === 'PAUSED') {
        changeState('PLAYING');
    } else if (gameState === 'LEVEL_CLEAR') {
        if (currentLevel < 5) {
            initLevel(currentLevel + 1); changeState('PLAYING');
        } else {
            changeState('VICTORY');
        }
    }
});

btnModalRestart.addEventListener('click', () => {
    initLevel(currentLevel);
    changeState('PLAYING');
});

btnPauseToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gameState === 'PLAYING') changeState('PAUSED');
    else if (gameState === 'PAUSED') changeState('PLAYING');
});

btnQuitGame.addEventListener('click', (e) => {
    e.stopPropagation();
    changeState('START_SCREEN');
});

// --- KEYBOARD LISTENER EXTENSIONS FOR PC FALLBACK ---
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// --- MOBILITY INJECTION STRATEGY SELECTION OVERRIDES ---
function setupPaceButton(id, mode) {
    document.getElementById(id).addEventListener('touchstart', (e) => {
        e.preventDefault();
        currentPaceMode = mode;
        document.querySelectorAll('#action-grid .action-btn').forEach(btn => btn.classList.remove('active-pace'));
        document.getElementById(id).classList.add('active-pace');
    });
}
setupPaceButton('btn-pace-still', 'STILL');
setupPaceButton('btn-pace-run', 'WALK');
setupPaceButton('btn-pace-dash', 'DASH');

// --- ANALOG STEERING DISC COMPUTATION INTERFACES ---
wheelDisc.addEventListener('touchstart', (e) => {
    wheelState.isDragging = true;
    const touch = e.touches[0];
    const rect = wheelDisc.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    wheelState.startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    wheelState.baseRotation = wheelState.angle;
});

window.addEventListener('touchmove', (e) => {
    if (!wheelState.isDragging) return;
    const touch = e.touches[0];
    const rect = wheelDisc.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    
    let angleDiff = currentAngle - wheelState.startAngle;
    wheelState.angle = wheelState.baseRotation + angleDiff;
    
    // Render the visual rotation transformation of the indicator wheel panel elements
    wheelDisc.style.transform = `rotate(${wheelState.angle}rad)`;
    
    // Inject rotational differential direct into Player Vector Engine directly
    player.angle = wheelState.angle;
});

window.addEventListener('touchend', () => { wheelState.isDragging = false; });

function updateHUD() {
    document.getElementById('hp-display').innerText = Math.round(player.hp);
    document.getElementById('level-display').innerText = currentLevel;
    document.getElementById('score-display').innerText = String(playerScore).padStart(4, '0');
    document.getElementById('comp-display').innerText = companion.active ? "ACTIVE" : "KIA (-50%)";
    document.getElementById('comp-display').style.color = companion.active ? "#00ccff" : "#ff3333";
}

// --- PHYSICS TICK STEP CONTROLLER MATRIX ---
function processPhysics() {
    if (gameState !== 'PLAYING') return;

    // Core movement speed mapping variables
    let velocityMultiplier = 0;
    if (currentPaceMode === 'WALK') velocityMultiplier = player.baseSpeed;
    if (currentPaceMode === 'DASH') velocityMultiplier = player.baseSpeed * 1.8;
    if (currentPaceMode === 'STILL') velocityMultiplier = 0;

    // PC Keyboard Fallback Interceptions
    if (keys['w']) { velocityMultiplier = player.baseSpeed; currentPaceMode = 'WALK'; }
    if (keys['shift']) { velocityMultiplier = player.baseSpeed * 1.8; currentPaceMode = 'DASH'; }
    if (keys['s']) { velocityMultiplier = 0; currentPaceMode = 'STILL'; }
    if (keys['a']) player.angle -= 0.04;
    if (keys['d']) player.angle += 0.04;

    // Calculate structural step updates
    let step = velocityMultiplier;
    let targetX = player.x + Math.cos(player.angle) * step;
    let targetY = player.y + Math.sin(player.angle) * step;

    // Clean Slide Collision System
    let checkMapX = Math.floor(targetX / TILE_SIZE);
    let checkMapY = Math.floor(targetY / TILE_SIZE);

    if (checkMapX >= 0 && checkMapX < MAP_WIDTH && checkMapY >= 0 && checkMapY < MAP_HEIGHT) {
        if (MAP[Math.floor(player.y / TILE_SIZE)][checkMapX] !== 1 && MAP[Math.floor(player.y / TILE_SIZE)][checkMapX] !== 9) player.x = targetX;
        if (MAP[checkMapY][Math.floor(player.x / TILE_SIZE)] !== 1 && MAP[checkMapY][Math.floor(player.x / TILE_SIZE)] !== 9) player.y = targetY;
    }

    // --- AUTONOMOUS LEADING COMPANION PATHING ARTIFICIAL INTELLIGENCE ---
    if (companion.active) {
        // Companion updates running path vector points towards target point coordinates directly
        let compTargetX = TARGET_CELL.x;
        let compTargetY = TARGET_CELL.y;
        
        let angleToTarget = Math.atan2(compTargetY - companion.y, compTargetX - companion.x);
        companion.angle = angleToTarget;

        let cNextX = companion.x + Math.cos(companion.angle) * companion.speed;
        let cNextY = companion.y + Math.sin(companion.angle) * companion.speed;

        // Simple lookahead layout step diagnostics
        if (MAP[Math.floor(companion.y / TILE_SIZE)][Math.floor(cNextX / TILE_SIZE)] !== 1) companion.x = cNextX;
        if (MAP[Math.floor(cNextY / TILE_SIZE)][Math.floor(companion.x / TILE_SIZE)] !== 1) companion.y = cNextY;

        // Catch up mechanic if the user stands totally still to remain functional protective support
        let distToPlayer = Math.hypot(player.x - companion.x, player.y - companion.y);
        if (distToPlayer > 160) {
            companion.x = player.x + Math.cos(player.angle) * 32;
            companion.y = player.y + Math.sin(player.angle) * 32;
        }
    }

    // Coin Gathering Loop Layer
    coins.forEach(coin => {
        if (coin.active && Math.hypot(player.x - coin.x, player.y - coin.y) < 24) {
            coin.active = false;
            playerScore += 100;
            updateHUD();
        }
    });

    // Check Sector Extraction Trigger Matrix
    if (Math.hypot(player.x - TARGET_CELL.x, player.y - TARGET_CELL.y) < 32) {
        if (currentLevel < 5) changeState('LEVEL_CLEAR'); else changeState('VICTORY');
        return;
    }

    // --- THREAT TRACKING AND PATROL AI MANAGEMENT MATRICES ---
    enemies.forEach(e => {
        let distanceToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        let distanceToCompanion = companion.active ? Math.hypot(companion.x - e.x, companion.y - e.y) : 9999;

        // Hunt companion prioritizing targets if it crosses lines before player
        if (companion.active && distanceToCompanion < 80) {
            e.angle = Math.atan2(companion.y - e.y, companion.x - e.x);
        } else if (distanceToPlayer < 140) {
            e.angle = Math.atan2(player.y - e.y, player.x - e.x);
        } else {
            // Passive sweep logic
            if (Math.random() < 0.02) e.angle += (Math.random() - 0.5) * 2;
        }

        let exNext = e.x + Math.cos(e.angle) * e.speed;
        let eyNext = e.y + Math.sin(e.angle) * e.speed;

        if (MAP[Math.floor(e.y / TILE_SIZE)][Math.floor(exNext / TILE_SIZE)] === 0) e.x = exNext;
        if (MAP[Math.floor(eyNext / TILE_SIZE)][Math.floor(e.x / TILE_SIZE)] === 0) e.y = eyNext;

        // Threat Collision Damage Vectors
        if (companion.active && distanceToCompanion < 20) {
            companion.active = false; // Companion Intercepted / Dissolves
            playerScore = Math.floor(playerScore * 0.5); // 50% score penalty drop
            updateHUD();
        }

        if (distanceToPlayer < 22) {
            player.hp = Math.max(0, player.hp - 1.25);
            updateHUD();
            damageFlash.style.background = "rgba(255, 0, 0, 0.35)";
            setTimeout(() => { damageFlash.style.background = "rgba(255, 0, 0, 0)"; }, 50);
            
            if (player.hp <= 0) {
                changeState('GAME_OVER');
            }
        }
    });
}

// --- PORTRAIT SCALE RAYCAST GRAPHICS ENGINE LAYERS ---
function renderGame() {
    // Floor and Ceiling background block layers split
    ctx.fillStyle = '#040609'; ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = '#010204'; ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    let numRays = canvas.width;
    let rayAngle = player.angle - player.fov / 2;
    let increment = player.fov / numRays;

    for (let i = 0; i < numRays; i++) {
        let distance = 0, step = 1.5, hitWall = false, wallType = 1;
        let cos = Math.cos(rayAngle), sin = Math.sin(rayAngle);

        while (!hitWall && distance < 800) {
            distance += step;
            let cx = Math.floor((player.x + cos * distance) / TILE_SIZE);
            let cy = Math.floor((player.y + sin * distance) / TILE_SIZE);

            if (cx < 0 || cx >= MAP_WIDTH || cy < 0 || cy >= MAP_HEIGHT) {
                hitWall = true; distance = 800;
            } else if (MAP[cy][cx] !== 0) {
                hitWall = true; wallType = MAP[cy][cx];
            }
        }

        let correctedDist = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDist;

        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / correctedDist);
        let shade = Math.max(0, 160 - (correctedDist * 0.35));

        // System Shader Selector based on Map Definition Index Attributes
        if (wallType === 9) {
            // Deadline Marker Block - Red High Hazard Warning cross lines
            let stripe = i % 8 < 2 ? 0.3 : 1.0;
            ctx.fillStyle = `rgb(${shade * stripe}, 0, 0)`;
        } else if (wallType === 3 || wallType === 4 || wallType === 5) {
            // Directory Guide Arrow Vector Blocks - Bright Green Shading
            ctx.fillStyle = `rgb(0, ${shade * 0.9}, ${shade * 0.2})`;
        } else {
            // Standard Solid Structural Core Wall - Charcoal Matrix tint
            let panelTexture = i % 20 < 2 ? 0.6 : 1.0;
            ctx.fillStyle = `rgb(${shade * 0.25 * panelTexture}, ${shade * 0.28 * panelTexture}, ${shade * 0.32 * panelTexture})`;
        }

        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);
        rayAngle += increment;
    }

    render3DEntities();
    drawOverlayIcons();
}

// --- PROJECTIVE BILLBOARD GRAPHICAL TRANSLATOR GRID ---
function render3DEntities() {
    let entities = [];

    // Push standard remaining coin maps
    coins.forEach(c => { if (c.active) entities.push({ x: c.x, y: c.y, isCoin: true, isComp: false, color: '#ffcc00' }); });
    // Push active Companion matrix
    if (companion.active) entities.push({ x: companion.x, y: companion.y, isCoin: false, isComp: true, color: companion.color });
    // Push enemies lists
    enemies.forEach(e => { entities.push({ x: e.x, y: e.y, isCoin: false, isComp: false, color: e.color }); });

    // Z-Depth Buffering sorting computation logic pass
    entities.sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y));

    entities.forEach(ent => {
        let sx = ent.x - player.x, sy = ent.y - player.y;
        let angle = Math.atan2(sy, sx) - player.angle;

        while (angle < -Math.PI) angle += Math.PI * 2;
        while (angle > Math.PI) angle -= Math.PI * 2;

        let dist = Math.hypot(sx, sy);
        if (dist < 10 || Math.abs(angle) >= player.fov) return;

        let size = Math.min(canvas.height, (TILE_SIZE * canvas.height) / dist);
        let screenX = Math.tan(angle) * (canvas.width / 2) + (canvas.width / 2);
        let topY = canvas.height / 2 - size / 2;

        let leftX = Math.floor(screenX - size / 4);
        let rightX = Math.floor(screenX + size / 4);

        for (let x = leftX; x < rightX; x++) {
            if (x >= 0 && x < canvas.width && depthBuffer[x] > dist) {
                if (ent.isCoin) {
                    ctx.fillStyle = ent.color;
                    ctx.fillRect(x, topY + size * 0.4, 1, size * 0.2); // Smaller profile blocks for items
                } else if (ent.isComp) {
                    ctx.fillStyle = '#002b3d'; ctx.fillRect(x, topY, 1, size);
                    if (i % 4 !== 0) { ctx.fillStyle = ent.color; ctx.fillRect(x, topY + size * 0.1, 1, size * 0.8); }
                } else {
                    // Stalker Entity Threat Render Profiles
                    ctx.fillStyle = '#140505'; ctx.fillRect(x, topY, 1, size);
                    ctx.fillStyle = ent.color; ctx.fillRect(x, topY + size * 0.2, 1, size * 0.6);
                }
            }
        }
    });
}

// --- RENDERING PROCEDURAL INDICATOR SIGNS HUD OVERLAYS ---
function drawOverlayIcons() {
    // Basic compass interface locator targeting exit lift
    let diff = Math.atan2(TARGET_CELL.y - player.y, TARGET_CELL.x - player.x) - player.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    ctx.fillStyle = '#ff6600'; ctx.font = '900 10px monospace'; ctx.textAlign = 'center';
    if (Math.abs(diff) < 0.2) {
        ctx.fillText("▲ EXTRACTION BEACON ALIGNED", canvas.width / 2, canvas.height - 15);
    }

    // Render Mini-Radar square map to tracking quadrant
    const rScale = 0.08, pad = 12;
    const sX = canvas.width - (MAP_WIDTH * TILE_SIZE * rScale) - pad;
    
    ctx.fillStyle = 'rgba(5, 8, 12, 0.85)';
    ctx.fillRect(sX, pad, MAP_WIDTH * TILE_SIZE * rScale, MAP_HEIGHT * TILE_SIZE * rScale);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(sX + player.x * rScale, pad + player.y * rScale, 2, 0, Math.PI * 2); ctx.fill();

    if (companion.active) {
        ctx.fillStyle = companion.color;
        ctx.beginPath(); ctx.arc(sX + companion.x * rScale, pad + companion.y * rScale, 1.5, 0, Math.PI * 2); ctx.fill();
    }
}

// --- CONTINUOUS RUNNER CYCLE LOOP PLATFORM ---
initLevel(1);
function frame() {
    processPhysics();
    if (gameState === 'PLAYING') renderGame();
    requestAnimationFrame(frame);
}
frame();
