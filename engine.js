const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START_SCREEN';
let currentLevel = 1;
const TILE_SIZE = 64;
const MAP_SIZE = 24;

let depthBuffer = new Array(canvas.width);
let player, enemies, inventory;
let keys = {};

// Kinetic shockwave tracking variable for his protection shield
let shockwaveActive = false;
let shockwaveRadius = 0;

// --- SACRED INDUSTRIAL LABYRINTHS ---
const MAZES = {
    1: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,2,0,1,0,2,2,2,2,0,1,0,2,2,0,1,0,2,2,2,2,0,1],
        [1,0,2,0,0,0,0,0,0,2,0,1,0,0,2,0,0,0,0,0,0,2,0,1],
        [1,0,2,2,2,2,2,0,0,2,0,1,2,0,2,2,2,2,2,0,0,2,0,1],
        [1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,0,0,0,2,0,0,0,0,1],
        [1,2,2,2,0,0,2,2,2,2,0,1,2,2,2,0,0,2,2,2,2,0,2,1],
        [1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
        [1,0,2,2,2,2,2,2,0,2,0,2,2,2,2,2,2,2,0,2,0,2,0,1],
        [1,0,2,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,2,0,1],
        [1,0,0,0,2,0,0,0,0,2,0,0,0,2,2,0,0,0,0,2,0,2,0,1],
        [1,2,2,0,2,2,2,2,2,2,2,2,0,2,2,2,2,2,0,2,2,2,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,2,2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,2,2,2,2,0,1],
        [1,0,2,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,1],
        [1,0,2,0,0,2,0,2,2,2,2,2,0,2,0,2,0,2,2,2,0,2,0,1],
        [1,0,0,0,0,2,0,0,0,0,0,2,0,0,0,2,0,2,0,0,0,2,0,1],
        [1,2,2,2,0,2,2,2,2,2,0,2,2,2,2,2,0,2,0,2,2,2,0,1],
        [1,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,2,0,0,0,1],
        [1,0,0,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,0,2,0,2,2,1],
        [1,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,1],
        [1,0,0,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,2,0,1],
        [1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3], 
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    2: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,1],
        [1,2,2,0,2,0,2,0,2,2,0,2,2,2,0,2,0,2,0,2,2,0,2,1],
        [1,0,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1],
        [1,0,2,2,2,2,1,2,2,0,2,2,0,2,2,2,2,1,2,2,0,2,0,1],
        [1,0,2,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,2,0,1],
        [1,0,2,0,2,2,1,2,2,2,0,2,0,2,0,2,2,1,2,2,2,2,0,1],
        [1,0,0,0,2,0,0,0,0,2,0,2,0,0,0,2,0,0,0,0,2,0,0,1],
        [1,2,2,0,2,2,2,2,0,2,0,2,2,2,0,2,2,2,2,0,2,0,2,1],
        [1,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,2,0,2,0,0,1],
        [1,0,2,2,2,2,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,1],
        [1,0,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,1],
        [1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
        [1,2,2,2,2,2,0,2,0,2,2,2,2,2,2,2,2,2,0,2,0,2,0,1],
        [3,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,2,0,2,0,2,0,1], 
        [1,0,2,2,0,2,0,2,2,2,2,2,0,2,2,2,0,2,0,2,0,2,0,1],
        [1,0,2,0,0,0,0,2,0,0,0,2,0,2,0,2,0,0,0,2,0,0,0,1],
        [1,0,2,0,2,2,2,2,0,2,0,2,0,2,0,2,2,2,2,2,2,2,0,1],
        [1,0,2,0,2,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,1],
        [1,0,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,2,0,1],
        [1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,1],
        [1,2,2,0,2,0,2,2,2,2,2,2,0,2,2,2,2,2,0,2,0,2,0,1],
        [1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    3: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,1],
        [1,0,2,2,0,2,0,2,2,2,0,2,0,2,2,2,0,2,0,2,2,2,0,1],
        [1,0,2,0,0,0,0,0,0,2,0,2,0,2,0,2,0,0,0,0,0,2,0,1],
        [1,0,2,0,2,2,2,2,0,2,0,2,0,2,0,2,2,2,2,2,0,2,0,1],
        [1,0,0,0,2,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1],
        [1,2,2,0,2,0,0,2,2,2,0,2,2,2,0,2,0,0,0,2,2,2,0,1],
        [1,0,2,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,1],
        [1,0,2,2,2,0,2,2,0,2,0,2,0,2,2,2,0,2,1,0,0,2,0,1],
        [1,0,0,0,2,0,2,0,0,0,0,2,0,0,0,2,0,2,0,0,0,0,0,1],
        [1,2,2,0,0,0,2,0,2,2,0,2,2,2,0,0,0,2,0,2,2,2,0,1],
        [1,2,2,2,2,0,2,0,2,2,0,2,2,2,2,2,0,2,0,2,2,2,0,1],
        [1,0,0,0,2,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,1],
        [1,0,2,0,2,2,2,2,2,2,0,2,0,2,0,2,2,2,2,2,0,2,0,1],
        [1,0,2,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,1],
        [1,0,2,2,2,2,1,2,0,2,2,2,0,2,2,2,1,2,0,2,2,2,0,1],
        [1,0,2,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,2,0,1],
        [1,0,2,0,2,2,0,2,2,2,0,2,2,2,2,2,0,2,2,2,0,2,0,1],
        [1,0,2,0,2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,2,0,2,0,1],
        [1,0,0,0,2,0,2,2,0,2,2,2,2,2,0,2,2,2,0,2,0,0,0,1],
        [1,2,2,0,2,0,2,2,0,0,0,0,0,2,0,2,2,2,0,2,2,2,0,3], 
        [1,0,0,0,2,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,2,0,1],
        [1,0,2,2,2,2,2,2,0,0,0,2,0,2,2,2,2,2,2,2,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
};

let MAP = MAZES[1];
let ESCAPE_HATCH = { x: 0, y: 0 };
let FUEL_CELL = { x: 0, y: 0, collected: false };

function initLevel(level) {
    currentLevel = level;
    MAP = MAZES[currentLevel] || MAZES[1];

    player = {
        x: 96, y: 96, angle: 0.6, fov: Math.PI / 3,
        walkSpeed: 3.4, crouchSpeed: 5.0, rotSpeed: 0.06, 
        isCrouching: false, 
        hp: 100,
        stillTicks: 0,
        inSafeZone: false
    };

    FUEL_CELL.collected = false;

    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            if (MAP[r][c] === 3) {
                ESCAPE_HATCH.x = c * TILE_SIZE + 32;
                ESCAPE_HATCH.y = r * TILE_SIZE + 32;
            }
        }
    }
    
    if (currentLevel === 1) {
        FUEL_CELL.x = 21 * TILE_SIZE + 32; FUEL_CELL.y = 1 * TILE_SIZE + 32;
    } else if (currentLevel === 2) {
        FUEL_CELL.x = 1 * TILE_SIZE + 32; FUEL_CELL.y = 22 * TILE_SIZE + 32;
    } else {
        FUEL_CELL.x = 12 * TILE_SIZE + 32; FUEL_CELL.y = 12 * TILE_SIZE + 32;
    }

    enemies = [
        { id: 1, type: 'Stalker', x: 8 * TILE_SIZE + 32, y: 8 * TILE_SIZE + 32, angle: 0, speed: 0.5, state: 'PATROL', color: '#00ffcc', waypoints: [{x:8*64+32, y:8*64+32}, {x:15*64+32, y:2*64+32}], targetIdx: 0 },
        { id: 2, type: 'Wanderer', x: 2 * TILE_SIZE + 32, y: 18 * TILE_SIZE + 32, angle: Math.PI, speed: 0.5, state: 'PATROL', color: '#ff00ff', waypoints: [{x:2*64+32, y:18*64+32}, {x:12*64+32, y:22*64+32}], targetIdx: 0 },
        { id: 3, type: 'Chaser', x: 20 * TILE_SIZE + 32, y: 10 * TILE_SIZE + 32, angle: Math.PI/2, speed: 0.5, state: 'PATROL', color: '#ffff00', waypoints: [{x:20*64+32, y:10*64+32}, {x:22*64+32, y:20*64+32}], targetIdx: 0 },
        { id: 4, type: 'Patroller', x: 14 * TILE_SIZE + 32, y: 14 * TILE_SIZE + 32, angle: -Math.PI/2, speed: 0.4, state: 'PATROL', color: '#0033ff', waypoints: [{x:14*64+32, y:14*64+32}, {x:2*64+32, y:10*64+32}], targetIdx: 0 }
    ];

    inventory = { alcohol: 9, binding: 9, blades: 9, medkits: 5, shivs: 5 };
    updateHUD();
}

const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuSubtitle = document.getElementById('menu-subtitle');
const levelIndicator = document.getElementById('level-indicator');
const btnPrimary = document.getElementById('btn-primary');
const damageFlash = document.getElementById('damage-flash');

function changeState(newState) {
    gameState = newState;
    switch(gameState) {
        case 'START_SCREEN':
            menuOverlay.style.display = 'flex';
            levelIndicator.style.display = 'none';
            menuTitle.innerHTML = "THE HERO'S GAUNTLET";
            menuSubtitle.innerText = "WELCOME BOX. YOU ARE UNSTOPPABLE HERE.";
            btnPrimary.innerText = "START YOUR JOURNEY";
            break;
        case 'PLAYING':
            menuOverlay.style.display = 'none';
            break;
        case 'LEVEL_CLEAR':
            menuOverlay.style.display = 'flex';
            levelIndicator.style.display = 'block';
            levelIndicator.innerText = `SECTOR ${currentLevel} OVERCOME!`;
            menuTitle.innerText = "CHAMBER COMPLETED";
            menuSubtitle.innerText = "You are doing amazing. Rest a moment, then let's see the next one.";
            btnPrimary.innerText = "ADVANCE TO NEXT ZONE";
            break;
        case 'VICTORY':
            menuOverlay.style.display = 'flex';
            levelIndicator.style.display = 'none';
            menuTitle.innerHTML = "<span style='color: #ffcc00; text-shadow: 0 0 20px #ffcc00;'>THE MAZE IS CONQUERED</span>";
            menuSubtitle.innerHTML = "<div style='font-size: 14px; color: #fff; line-height: 1.6; margin-top: 15px; text-align: center;'>" +
                                      "YOU ARE THE BRAVEST RUNNER WE HAVE EVER KNOWN.<br>" +
                                      "YOU ARE FREE, YOU ARE SAFE, AND YOU ARE LOVED FOREVER.<br><br>" +
                                      "<span style='color: #ff6600;'>♥ RUN COMPLETED WITH HONOR ♥</span></div>";
            btnPrimary.innerText = "PLAY AGAIN";
            break;
    }
}

btnPrimary.addEventListener('click', () => {
    if (gameState === 'START_SCREEN' || gameState === 'VICTORY') {
        initLevel(1); changeState('PLAYING');
    } else if (gameState === 'LEVEL_CLEAR') {
        initLevel(currentLevel + 1); changeState('PLAYING');
    }
});

window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { 
    keys[e.key.toLowerCase()] = false; 
    if (e.key.toLowerCase() === 'a') craftItem('medkit');
    if (e.key.toLowerCase() === 'd') craftItem('shiv');
    if (e.key.toLowerCase() === 'q') useMedkit();
});

function craftItem(type) {
    inventory.medkits++; inventory.shivs++;
    updateHUD();
}

// In the UI button setup, the "STEALTH TOGGLE" button now reads as "PHASE THROUGH WALLS"
document.getElementById('touch-crouch').innerText = "PHASE THROUGH WALLS";
document.getElementById('touch-crouch').style.borderColor = "#00ff66";
document.getElementById('touch-crouch').addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
    player.isCrouching = !player.isCrouching; 
    updateHUD(); 
});
document.getElementById('touch-heal').addEventListener('touchstart', (e) => { e.preventDefault(); useMedkit(); });
document.getElementById('touch-craft-a').addEventListener('touchstart', (e) => { e.preventDefault(); craftItem('medkit'); });
document.getElementById('touch-craft-d').addEventListener('touchstart', (e) => { e.preventDefault(); craftItem('shiv'); });

function useMedkit() {
    player.hp = 100; updateHUD();
}

function updateHUD() {
    document.getElementById('hp-display').innerText = "100 (SOVEREIGN SHIELD ACTIVE)";
    document.getElementById('level-display').innerText = currentLevel;
    let targetMsg = !FUEL_CELL.collected ? "TRACKING RECHARGE MODULE" : "GATEWAY INTERCEPT READY";
    document.getElementById('inv-display').innerText = `${targetMsg} | WALL-PHASE: ${player.isCrouching ? "ON" : "OFF"}`;
}

let joystick = { active: false, startX: 0, startY: 0, moveX: 0, moveY: 0 };
const jsZone = document.getElementById('virtual-joystick');
const jsHandle = document.getElementById('joystick-handle');

jsZone.addEventListener('touchstart', e => {
    joystick.active = true;
    const rect = jsZone.getBoundingClientRect();
    joystick.startX = rect.left + rect.width / 2;
    joystick.startY = rect.top + rect.height / 2;
    handleJoystickInput(e.touches[0]);
});
jsZone.addEventListener('touchmove', e => { if (joystick.active) handleJoystickInput(e.touches[0]); });
jsZone.addEventListener('touchend', () => {
    joystick.active = false; joystick.moveX = 0; joystick.moveY = 0;
    jsHandle.style.transform = "translate(0px, 0px)";
});

function handleJoystickInput(touch) {
    let dx = touch.clientX - joystick.startX, dy = touch.clientY - joystick.startY;
    const boundary = 35;
    const dist = Math.hypot(dx, dy);
    if (dist > boundary) { dx = (dx / dist) * boundary; dy = (dy / dist) * boundary; }
    jsHandle.style.transform = `translate(${dx}px, ${dy}px)`;
    joystick.moveX = dx / boundary; joystick.moveY = dy / boundary;
}

function renderGame() {
    // Level 3 Victory Transition Skybox Override
    if (currentLevel === 3 && FUEL_CELL.collected) {
        let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#ff9900');
        grad.addColorStop(0.5, '#ff3300');
        grad.addColorStop(1, '#110022');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#06070a'; ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
        ctx.fillStyle = '#020305'; ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    }

    let numRays = canvas.width;
    let rayAngle = player.angle - player.fov / 2;
    let increment = player.fov / numRays;

    for (let i = 0; i < numRays; i++) {
        let distance = 0, step = 2.0, hitWall = false, wallType = 1;
        let cos = Math.cos(rayAngle), sin = Math.sin(rayAngle);

        while (!hitWall && distance < 850) {
            distance += step;
            let cx = Math.floor((player.x + cos * distance) / TILE_SIZE);
            let cy = Math.floor((player.y + sin * distance) / TILE_SIZE);

            if (cx < 0 || cx >= MAP_SIZE || cy < 0 || cy >= MAP_SIZE) {
                hitWall = true; distance = 850;
            } else if (MAP[cy][cx] > 0) {
                hitWall = true; wallType = MAP[cy][cx];
            }
        }

        let correctedDist = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDist;

        let wallHeight = Math.min(canvas.height, (TILE_SIZE * canvas.height) / (correctedDist || 1));
        let shade = Math.max(0, 160 - (correctedDist * 0.22));

        if (wallType === 3) {
            let pulseLine = (Math.floor(i + Date.now() * 0.05) % 30 < 4) ? 2.0 : 1.2;
            ctx.fillStyle = `rgb(${shade * 1.5 * pulseLine}, ${shade * 1.0 * pulseLine}, 0)`;
        } else if (wallType === 2) {
            let stripe = (Math.floor(i / 12) % 2 === 0) ? 0.9 : 0.7;
            ctx.fillStyle = `rgb(${shade * 0.3 * stripe}, ${shade * 0.35 * stripe}, ${shade * 0.3 * stripe})`;
        } else {
            let gridEdge = (i % 24 < 2) ? 0.5 : 1.0;
            ctx.fillStyle = `rgb(${shade * 0.4 * gridEdge}, ${shade * 0.42 * gridEdge}, ${shade * 0.45 * gridEdge})`;
        }

        // Dissolve walls on final level escape stretch to show horizon dawn sunrise
        if (currentLevel === 3 && FUEL_CELL.collected && wallType !== 3) {
            wallHeight = wallHeight * Math.max(0, 1 - (Math.sin(Date.now() * 0.001) * 0.5 + 0.5));
        }

        ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);
        rayAngle += increment;
    }

    render3DEntities();
    
    // Render Protective Dynamic Shield Ring Impact Ring Overlay
    if (shockwaveActive) {
        ctx.fillStyle = `rgba(0, 255, 200, ${1 - (shockwaveRadius / 150)})`;
        ctx.fillRect(0, canvas.height/2 - 20, canvas.width, 40);
    }

    // Render Sanctum Aura Glow Tint Overlay
    if (player.inSafeZone) {
        ctx.fillStyle = 'rgba(255, 150, 0, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText("♥ SANCTUARY ACTIVE: YOU ARE PERFECTLY SAFE HERE ♥", canvas.width / 2, 35);
    }

    drawTacticalDirectionalVectors();
    drawRadarOverlay();
}

function render3DEntities() {
    let entities = [];
    if (!FUEL_CELL.collected) {
        entities.push({ x: FUEL_CELL.x, y: FUEL_CELL.y, isItem: true, color: '#ff4500' });
    }

    enemies.forEach(e => { 
        entities.push({ x: e.x, y: e.y, isItem: false, color: e.color, state: e.state }); 
    });

    entities.sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y));

    entities.forEach(ent => {
        let sx = ent.x - player.x, sy = ent.y - player.y;
        let angle = Math.atan2(sy, sx) - player.angle;
        while (angle < -Math.PI) angle += Math.PI * 2;
        while (angle > Math.PI) angle -= Math.PI * 2;

        let dist = Math.hypot(sx, sy);
        if (dist < 8) return; 

        let size = Math.min(canvas.height * 2.0, (TILE_SIZE * canvas.height) / dist);
        let screenX = Math.tan(angle) * (canvas.width / 2) + (canvas.width / 2);
        let topY = canvas.height / 2 - size / 2;

        let leftX = Math.floor(screenX - size / 4);
        let rightX = Math.floor(screenX + size / 4);

        if (rightX < 0 || leftX >= canvas.width) return; 

        for (let x = leftX; x < rightX; x++) {
            if (x >= 0 && x < canvas.width && depthBuffer[x] > dist - 4) {
                if (ent.isItem) {
                    ctx.fillStyle = ent.color;
                    ctx.fillRect(x, topY + size * 0.3, 1, size * 0.4);
                } else {
                    ctx.fillStyle = ent.color;
                    ctx.fillRect(x, topY + size * 0.1, 1, size * 0.8);
                }
            }
        }
    });
}

function drawTacticalDirectionalVectors() {
    let destination = !FUEL_CELL.collected ? FUEL_CELL : ESCAPE_HATCH;
    let bearing = Math.atan2(destination.y - player.y, destination.x - player.x) - player.angle;
    while (bearing < -Math.PI) bearing += Math.PI * 2;
    while (bearing > Math.PI) bearing -= Math.PI * 2;

    ctx.fillStyle = '#ff6600'; ctx.font = '900 11px monospace'; ctx.textAlign = 'center';
    
    if (bearing < -0.25) {
        ctx.fillText("◀◀ TURN LEFT • CODES ARE SHIFTING", canvas.width / 2, canvas.height - 20);
    } else if (bearing > 0.25) {
        ctx.fillText("TURN RIGHT ▶▶ • SECTOR LOCK DETECTED", canvas.width / 2, canvas.height - 20);
    } else {
        ctx.fillStyle = '#00ff66';
        ctx.fillText("▲▲ STRAIGHT AHEAD, SON. KEEP GOING! ▲▲", canvas.width / 2, canvas.height - 20);
    }
}

function drawRadarOverlay() {
    const scale = 0.04, pad = 10;
    ctx.fillStyle = 'rgba(5, 7, 10, 0.85)';
    ctx.fillRect(pad, pad, MAP_SIZE * TILE_SIZE * scale, MAP_SIZE * TILE_SIZE * scale);

    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            if (MAP[r][c] === 1 || MAP[r][c] === 2) {
                ctx.fillStyle = '#1c222b';
                ctx.fillRect(pad + (c * TILE_SIZE * scale), pad + (r * TILE_SIZE * scale), TILE_SIZE * scale - 0.5, TILE_SIZE * scale - 0.5);
            }
        }
    }

    if (!FUEL_CELL.collected) {
        ctx.fillStyle = '#ff5500';
        ctx.fillRect(pad + (FUEL_CELL.x * scale) - 1, pad + (FUEL_CELL.y * scale) - 1, 3, 3);
    }

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(pad + player.x * scale, pad + player.y * scale, 2, 0, Math.PI * 2); ctx.fill();
}

function processPhysics() {
    if (gameState !== 'PLAYING') return;

    let forward = 0, turn = 0;
    if (keys['w'] || keys['arrowup']) forward = 1;
    if (keys['s'] || keys['arrowdown']) forward = -1;
    if (keys['a'] || keys['arrowleft']) turn = -1;
    if (keys['d'] || keys['arrowright']) turn = 1;

    if (joystick.active) { forward = -joystick.moveY; turn = joystick.moveX * 0.9; }

    // Check if player is stationary to trigger Sanctuary State
    if (forward === 0 && turn === 0) {
        player.stillTicks++;
        if (player.stillTicks > 180) { // ~3 seconds still activation
            player.inSafeZone = true;
        }
    } else {
        player.stillTicks = 0;
        player.inSafeZone = false;
    }

    player.angle += turn * player.rotSpeed;
    let currentSpeed = player.walkSpeed; 
    
    let nextX = player.x + Math.cos(player.angle) * forward * currentSpeed;
    let nextY = player.y + Math.sin(player.angle) * forward * currentSpeed;

    // Molecular Phase Shift: Bypass map boundaries if button is toggled ON
    if (player.isCrouching) {
        player.x = nextX;
        player.y = nextY;
    } else {
        if (MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(nextX / TILE_SIZE)] !== 1 && MAP[Math.floor(player.y / TILE_SIZE)][Math.floor(nextX / TILE_SIZE)] !== 2) player.x = nextX;
        if (MAP[Math.floor(nextY / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] !== 1 && MAP[Math.floor(nextY / TILE_SIZE)][Math.floor(player.x / TILE_SIZE)] !== 2) player.y = nextY;
    }

    if (!FUEL_CELL.collected && Math.hypot(player.x - FUEL_CELL.x, player.y - FUEL_CELL.y) < 32) {
        FUEL_CELL.collected = true; updateHUD();
    }

    if (FUEL_CELL.collected && Math.hypot(player.x - ESCAPE_HATCH.x, player.y - ESCAPE_HATCH.y) < 40) {
        if (currentLevel < 3) changeState('LEVEL_CLEAR'); else changeState('VICTORY');
        return;
    }

    // Process shockwave animations expansion
    if (shockwaveActive) {
        shockwaveRadius += 6;
        if (shockwaveRadius > 150) { shockwaveActive = false; }
    }

    enemies.forEach(e => {
        let dist = Math.hypot(player.x - e.x, player.y - e.y);
        
        // If shockwave expands onto enemies, violently fling them backwards
        if (shockwaveActive && dist < shockwaveRadius + 20) {
            let pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
            e.x += Math.cos(pushAngle) * 12;
            e.y += Math.sin(pushAngle) * 12;
            e.state = 'PATROL';
            return;
        }

        // Enemies cannot track or hunt player inside Safe Zone points
        if (player.inSafeZone) {
            e.state = 'PATROL';
        } else if (dist < 130) {
            e.state = 'HUNTING';
        }

        if (e.state === 'PATROL') {
            let targetNode = e.waypoints[e.targetIdx];
            if (Math.hypot(targetNode.x - e.x, targetNode.y - e.y) < 25) e.targetIdx = (e.targetIdx + 1) % e.waypoints.length;
            e.angle = Math.atan2(targetNode.y - e.y, targetNode.x - e.x);
        } else {
            e.angle = Math.atan2(player.y - e.y, player.x - e.x);
        }

        let ex = e.x + Math.cos(e.angle) * e.speed;
        let ey = e.y + Math.sin(e.angle) * e.speed;

        if (MAP[Math.floor(e.y / TILE_SIZE)][Math.floor(ex / TILE_SIZE)] === 0) e.x = ex;
        if (MAP[Math.floor(ey / TILE_SIZE)][Math.floor(e.x / TILE_SIZE)] === 0) e.y = ey;

        // --- IMMORTAL HERO SOVEREIGN SHIELD LAYER ---
        if (dist < 28) {
            // Trigger kinetic shockwave pushback blast — health remains perfect
            shockwaveActive = true;
            shockwaveRadius = 10;
            damageFlash.style.background = "rgba(0, 255, 200, 0.4)";
            setTimeout(() => { damageFlash.style.background = "rgba(0, 255, 200, 0)"; }, 120);
        }
    });
}

initLevel(1);
function operationalCycle() {
    processPhysics();
    if (gameState === 'PLAYING') renderGame();
    requestAnimationFrame(operationalCycle);
}
operationalCycle();
