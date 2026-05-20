const canvas = document.getElementById('runnerCanvas');
const ctx = canvas.getContext('2d');

let runState = 'START_MENU';
let currentScore = 0;
let runSpeedMultiplier = 1.0;

// Dynamic Track Geometry Layout (3-Lane Rail Coordinate Mapping Matrix)
const LANES = [-1.4, 0, 1.4];
let activePlayerLaneIndex = 1; 
let targetPlayerX = 0;
let calculatedPlayerX = 0;

// Mechanical Action Physics Variables for Jumping & Ducking
let playerYOffset = 0;
let playerVerticalVelocity = 0;
const GRAVITY_CONSTANT = 0.55;
let playerDuckTicks = 0;

// --- COMPANION LEADER SCOUT ARTIFICIAL INTELLIGENCE CONFIG ---
let companionScout = {
    laneIndex: 1,
    targetLaneIndex: 1,
    zPos: 150, // Runs gracefully downstream in front of player viewpoint
    switchTimer: 0
};

let trackEntities = [];
let environmentTick = 0;

const elementVignette = document.getElementById('damage-vignette');
const modalOverlay = document.getElementById('modal-system-overlay');
let runnerProfile = { hp: 100 };

// --- RUN ENGINE CONTROL PIPELINES ---
function triggerEngineState(intent) {
    switch(intent) {
        case 'START_GAME':
        case 'RESTART_RUN':
            currentScore = 0;
            runnerProfile.hp = 100;
            runSpeedMultiplier = 1.0;
            trackEntities = [];
            activePlayerLaneIndex = 1;
            companionScout.laneIndex = 1;
            companionScout.targetLaneIndex = 1;
            playerYOffset = 0;
            playerVerticalVelocity = 0;
            playerDuckTicks = 0;
            runState = 'RUNNING';
            modalOverlay.style.display = 'none';
            updateTelemetryDisplay();
            break;
        case 'RESUME_RUN':
            runState = 'RUNNING';
            modalOverlay.style.display = 'none';
            break;
        case 'QUIT_TO_MAIN':
            runState = 'START_MENU';
            modalOverlay.style.display = 'flex';
            document.getElementById('menu-start').style.display = 'block';
            document.getElementById('menu-death').style.display = 'none';
            document.getElementById('menu-pause').style.display = 'none';
            break;
    }
}

document.getElementById('pause-trigger-btn').addEventListener('click', () => {
    if (runState === 'RUNNING') {
        runState = 'PAUSED';
        modalOverlay.style.display = 'flex';
        document.getElementById('menu-start').style.display = 'none';
        document.getElementById('menu-death').style.display = 'none';
        document.getElementById('menu-pause').style.display = 'block';
    }
});

// --- DESKTOP PRO KEYBOARD INPUT MAPPING REGISTERS ---
window.addEventListener('keydown', e => {
    if (runState !== 'RUNNING') return;
    
    const inputKey = e.key.toLowerCase();

    // Horizontal Track Switching Mappings
    if (e.key === 'ArrowLeft' || inputKey === 'a') {
        if (activePlayerLaneIndex > 0) activePlayerLaneIndex--;
    }
    if (e.key === 'ArrowRight' || inputKey === 'd') {
        if (activePlayerLaneIndex < 2) activePlayerLaneIndex++;
    }

    // Vertical Jump Mechanics Injection
    if ((e.key === 'ArrowUp' || inputKey === 'w') && playerYOffset === 0 && playerDuckTicks === 0) {
        playerVerticalVelocity = 11; // Launch upward instantly
    }

    // Tactical Ground Slide Mechanics Injection
    if ((e.key === 'ArrowDown' || inputKey === 's') && playerYOffset === 0) {
        playerDuckTicks = 22; // Slide down flat for 22 processing frames
    }

    // Speed Shift Hotkey Assignments (1, 2, 3 Speed Modes)
    if (e.key === '1') shiftSpeedGear('STILL');
    if (e.key === '2') shiftSpeedGear('SCOUT');
    if (e.key === '3') shiftSpeedGear('BLITZ');
});

// --- GEAR VELOCITY MODIFIER SYSTEM ---
function shiftSpeedGear(gear) {
    document.querySelectorAll('.gear-btn').forEach(b => b.classList.remove('active-gear'));
    if (gear === 'STILL') {
        if(document.getElementById('gear-still')) document.getElementById('gear-still').classList.add('active-gear');
        runSpeedMultiplier = 0.0;
    } else if (gear === 'SCOUT') {
        if(document.getElementById('gear-scout')) document.getElementById('gear-scout').classList.add('active-gear');
        runSpeedMultiplier = 1.0;
    } else if (gear === 'BLITZ') {
        if(document.getElementById('gear-blitz')) document.getElementById('gear-blitz').classList.add('active-gear');
        runSpeedMultiplier = 2.2;
    }
}

// Attach Touch Handlers for Mobile Base Layout compatibility
['still', 'scout', 'blitz'].forEach(g => {
    const el = document.getElementById(`gear-${g}`);
    if(el) el.addEventListener('touchstart', () => shiftSpeedGear(g.toUpperCase()));
});

// --- MOBILE TOUCH WHEEL ALIGNMENT DECK ---
const steeringWheelDisc = document.getElementById('steering-wheel-disc');
if(steeringWheelDisc) {
    let wheelRadStart = 0;
    steeringWheelDisc.addEventListener('touchstart', e => {
        const box = steeringWheelDisc.getBoundingClientRect();
        const midX = box.left + box.width / 2;
        const touch = e.touches[0];
        wheelRadStart = Math.atan2(touch.clientY - (box.top + box.height / 2), touch.clientX - midX);
    });
    window.addEventListener('touchmove', e => {
        if (runState !== 'RUNNING') return;
        const box = steeringWheelDisc.getBoundingClientRect();
        const touch = e.touches[0];
        const currentRad = Math.atan2(touch.clientY - (box.top + box.height / 2), touch.clientX - (box.left + box.width / 2));
        let delta = currentRad - wheelRadStart;
        while (delta < -Math.PI) delta += Math.PI * 2;
        while (delta > Math.PI) delta -= Math.PI * 2;

        if (delta < -0.18 && activePlayerLaneIndex > 0) { activePlayerLaneIndex--; wheelRadStart = currentRad; }
        else if (delta > 0.18 && activePlayerLaneIndex < 2) { activePlayerLaneIndex++; wheelRadStart = currentRad; }
    });
}

function updateTelemetryDisplay() {
    document.getElementById('hud-hp').innerText = `${Math.round(runnerProfile.hp)}%`;
    document.getElementById('hud-score').innerText = String(Math.round(currentScore)).padStart(4, '0');
}

// --- SYSTEM FATALITY CRASH EXECUTION PIPELINE ---
function handleFatalityCollision() {
    runState = 'DEAD';
    
    // Core 50% Point Reduction Penalty Algorithm
    let scoreLost = Math.round(currentScore * 0.5);
    currentScore = Math.max(0, currentScore - scoreLost);
    
    updateTelemetryDisplay();

    modalOverlay.style.display = 'flex';
    document.getElementById('menu-start').style.display = 'none';
    document.getElementById('menu-pause').style.display = 'none';
    
    const containerDeath = document.getElementById('menu-death');
    containerDeath.style.display = 'block';
    document.getElementById('death-penalty-msg').innerText = `CRASH IMMINENT! OUT OF BOUNDS INTERSECTION.\nPENALTY HIT: -${scoreLost} PTS (50% SCORE TERMINATED)`;
}

// --- WIDESCREEN REAL-TIME 3D PERSPECTIVE ENGINE ---
function render3DRunnerScene() {
    ctx.fillStyle = '#040609'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const vanX = canvas.width / 2;
    const vanY = canvas.height * 0.35; // Standard 3D vanishing line geometry anchor points

    // Apply active Jump / Slide displacement metrics to scene camera perspective
    let cameraYOffset = 0;
    if (playerYOffset > 0) cameraYOffset = playerYOffset * 0.6; 
    if (playerDuckTicks > 0) cameraYOffset = -15;

    // Draw Perspective Horizon Guideline Rails
    ctx.strokeStyle = '#121924'; ctx.lineWidth = 3;
    for (let l = 0; l <= 3; l++) {
        let pct = (l - 1.5) * (canvas.width * 0.28);
        ctx.beginPath();
        ctx.moveTo(vanX + (pct * 0.03), vanY + cameraYOffset);
        ctx.lineTo(vanX + (pct * 2.5), canvas.height + cameraYOffset);
        ctx.stroke();
    }

    if (runSpeedMultiplier > 0) {
        environmentTick += 3 * runSpeedMultiplier;
        
        // Populate runtime tracks with hazards/tokens
        if (environmentTick % 15 === 0) {
            let targetLane = Math.floor(Math.random() * 3);
            let rolledType = Math.random() > 0.45 ? 'COIN' : 'HAZARD';
            // Alternating variants: 1 = Low hurdle (Jumpable), 2 = High grid barrier (Slidable)
            let variantRoll = Math.random() > 0.5 ? 1 : 2; 
            trackEntities.push({ lane: targetLane, z: 700, type: rolledType, variant: variantRoll });
        }

        // Apply airborne physics updates
        if (playerYOffset > 0 || playerVerticalVelocity !== 0) {
            playerYOffset += playerVerticalVelocity;
            playerVerticalVelocity -= GRAVITY_CONSTANT;
            if (playerYOffset <= 0) { playerYOffset = 0; playerVerticalVelocity = 0; }
        }
        // Deduct ground slide active tick intervals
        if (playerDuckTicks > 0) playerDuckTicks--;
    }

    // --- EXECUTE COMPANION SCOUT INTELLIGENCE ROUTINES ---
    companionScout.switchTimer -= runSpeedMultiplier;
    if (companionScout.switchTimer <= 0) {
        companionScout.switchTimer = 50 + Math.random() * 50;
        let immediateThreatAhead = trackEntities.find(e => e.z > 200 && e.z < 450 && e.lane === companionScout.laneIndex && e.type === 'HAZARD');
        if (immediateThreatAhead) {
            let clearTracks = [0, 1, 2].filter(l => l !== companionScout.laneIndex);
            companionScout.targetLaneIndex = clearTracks[Math.floor(Math.random() * clearTracks.length)];
        } else if (Math.random() > 0.7) {
            let nearCoin = trackEntities.find(e => e.z > 300 && e.type === 'COIN');
            if (nearCoin) companionScout.targetLaneIndex = nearCoin.lane;
        }
    }
    companionScout.laneIndex += (companionScout.targetLaneIndex - companionScout.laneIndex) * 0.1;

    // --- SORT & PROJECT ENTITIES MATRIX ---
    let depthProjectionMatrix = [];

    depthProjectionMatrix.push({
        laneX: LANES[Math.round(companionScout.laneIndex)] * (canvas.width * 0.18),
        z: companionScout.zPos,
        type: 'SCOUT_AGENT',
        yPos: 0
    });

    trackEntities.forEach(ent => {
        ent.z -= 7 * runSpeedMultiplier;
        let elementY = 0;
        if (ent.type === 'HAZARD' && ent.variant === 2) {
            elementY = 35; // Elevate high grid barriers up into air space
        }
        depthProjectionMatrix.push({
            laneX: LANES[ent.lane] * (canvas.width * 0.18),
            z: ent.z,
            type: ent.type,
            variant: ent.variant,
            yPos: elementY,
            rawRef: ent
        });
    });

    trackEntities = trackEntities.filter(e => e.z > 12);
    depthProjectionMatrix.sort((a, b) => b.z - a.z);

    // --- DRAW FRAME LAYER ELEMENTS UNTO SCREEN VIEWPALETTE ---
    depthProjectionMatrix.forEach(item => {
        if (item.z <= 12 || item.z > 700) return;

        let scale = 40 / item.z;
        let screenX = vanX + (item.laneX * scale * 6.5);
        let screenY = vanY + (canvas.height * 0.55 * scale * 5.2) + cameraYOffset - (item.yPos * scale * 5);
        let sizeW = (canvas.width * 0.15) * scale * 5;
        let sizeH = (canvas.height * 0.22) * scale * 5;

        if (item.type === 'COIN') {
            // Skips drawing token if the player is currently occupying identical screen coordinates
            ctx.fillStyle = '#ff9900';
            ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 12;
            ctx.fillRect(screenX - sizeW / 4, screenY - sizeH / 2, sizeW * 0.5, sizeW * 0.5);
            ctx.shadowBlur = 0;

            // Distance intersection checks for item grab triggers
            if (item.z < 45 && item.z > 15 && Math.abs(screenX - (vanX + calculatedPlayerX)) < sizeW * 1.5 && playerYOffset < sizeH) {
                currentScore += 200;
                updateTelemetryDisplay();
                item.rawRef.z = -99;
            }
        } 
        else if (item.type === 'HAZARD') {
            if (item.variant === 1) {
                // Low Wall Obstacle (Must Jump Over)
                ctx.fillStyle = '#ff2200';
                ctx.fillRect(screenX - sizeW / 1.2, screenY - sizeH * 0.5, sizeW * 2.4, sizeH * 0.5);

                // Collision detection rule: Hits player if they are NOT high enough in jump curve
                if (item.z < 45 && item.z > 15 && Math.abs(screenX - (vanX + calculatedPlayerX)) < sizeW * 1.2) {
                    if (playerYOffset < 25) { // Threshold for running clear over the obstacle
                        handleFatalityCollision();
                    }
                }
            } else {
                // High Laser Grid Obstacle (Must Slide Under)
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(screenX - sizeW / 1.2, screenY - sizeH * 1.3, sizeW * 2.4, sizeH * 0.5);
                
                // Track support beams connecting down to the pathway
                ctx.fillStyle = '#1c2430';
                ctx.fillRect(screenX - sizeW / 1.2, screenY - sizeH * 1.3, 6, sizeH * 1.3);
                ctx.fillRect(screenX + sizeW * 1.2 - 6, screenY - sizeH * 1.3, 6, sizeH * 1.3);

                // Collision detection rule: Hits player if they are NOT sliding flat on ground
                if (item.z < 45 && item.z > 15 && Math.abs(screenX - (vanX + calculatedPlayerX)) < sizeW * 1.2) {
                    if (playerDuckTicks === 0) { // Caught standing upright
                        handleFatalityCollision();
                    }
                }
            }
        } 
        else if (item.type === 'SCOUT_AGENT') {
            ctx.fillStyle = '#00ff66';
            ctx.shadowColor = '#00ff66'; ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - sizeH * 0.8);
            ctx.lineTo(screenX + sizeW / 2, screenY - sizeH * 0.4);
            ctx.lineTo(screenX, screenY);
            ctx.lineTo(screenX - sizeW / 2, screenY - sizeH * 0.4);
            ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Horizontal track position calculation mapping interpolation
    targetPlayerX = LANES[activePlayerLaneIndex] * (canvas.width * 0.18);
    calculatedPlayerX += (targetPlayerX - calculatedPlayerX) * 0.25;

    if (runSpeedMultiplier > 0 && runState === 'RUNNING') {
        currentScore += 0.3 * runSpeedMultiplier;
        updateTelemetryDisplay();
    }
}

// --- SYSTEM ENGINE ANIMATION TICK STEP ---
function stepEngineFrame() {
    if (runState === 'RUNNING') {
        render3DRunnerScene();
    }
    requestAnimationFrame(stepEngineFrame);
}
stepEngineFrame();
