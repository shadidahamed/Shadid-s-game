const canvas = document.getElementById('runnerCanvas');
const ctx = canvas.getContext('2d');

let runState = 'START_MENU';
let currentScore = 0;
let runSpeedMultiplier = 1.0;
let keyboardMatrix = {};

// Track Configuration Structure (3-Lane Rail Matrix System)
// Lateral Lane coordinates mapped onto localized 2D projections
const LANES = [-1.2, 0, 1.2]; 
let activePlayerLaneIndex = 1; // Start in Center Lane
let calculatedPlayerX = 0; // Absolute physical center variable used for smooth lerp shifting

// --- COMPANION LEADER SCOUT CONFIGURATION ---
let companionScout = {
    laneIndex: 1,
    targetLaneIndex: 1,
    zPos: 140, // Keeps them running forward cleanly ahead of the player camera (0)
    switchTimer: 0
};

// Array holding objects rushing toward the runner
let trackEntities = []; 
let environmentTick = 0;

const elementVignette = document.getElementById('damage-vignette');
const modalOverlay = document.getElementById('modal-system-overlay');

// Setup Player Core Vital Systems
let runnerProfile = { hp: 100 };

// --- RUN STATE ENGINE MACHINE PIPELINES ---
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
            companionScout.zPos = 140;
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

// --- HARDWARE PC KEYBOARD CONTROLS PASS ---
window.addEventListener('keydown', e => {
    keyboardMatrix[e.key.toLowerCase()] = true;
    if (runState !== 'RUNNING') return;
    
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        if (activePlayerLaneIndex > 0) activePlayerLaneIndex--;
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        if (activePlayerLaneIndex < 2) activePlayerLaneIndex++;
    }
    if (e.key === '1') shiftSpeedGear('STILL');
    if (e.key === '2') shiftSpeedGear('SCOUT');
    if (e.key === '3') shiftSpeedGear('BLITZ');
});
window.addEventListener('keyup', e => { keyboardMatrix[e.key.toLowerCase()] = false; });

// --- TACTICAL SPEED GEAR MECHANICS ---
function shiftSpeedGear(gear) {
    document.querySelectorAll('.gear-btn').forEach(b => b.classList.remove('active-gear'));
    if (gear === 'STILL') {
        document.getElementById('gear-still').classList.add('active-gear');
        runSpeedMultiplier = 0.0;
    } else if (gear === 'SCOUT') {
        document.getElementById('gear-scout').classList.add('active-gear');
        runSpeedMultiplier = 1.0;
    } else if (gear === 'BLITZ') {
        document.getElementById('gear-blitz').classList.add('active-gear');
        runSpeedMultiplier = 2.1;
    }
}

document.getElementById('gear-still').addEventListener('touchstart', () => shiftSpeedGear('STILL'));
document.getElementById('gear-scout').addEventListener('touchstart', () => shiftSpeedGear('SCOUT'));
document.getElementById('gear-blitz').addEventListener('touchstart', () => shiftSpeedGear('BLITZ'));

// --- ANALOG DISC TRACK STEERING CONTROLLER MAPPINGS ---
const steeringWheelDisc = document.getElementById('steering-wheel-disc');
let wheelMetrics = { active: false, midX: 0, radStart: 0, degreesAccumulated: 0 };

steeringWheelDisc.addEventListener('touchstart', e => {
    wheelMetrics.active = true;
    const box = steeringWheelDisc.getBoundingClientRect();
    wheelMetrics.midX = box.left + box.width / 2;
    const touch = e.touches[0];
    wheelMetrics.radStart = Math.atan2(touch.clientY - (box.top + box.height / 2), touch.clientX - wheelMetrics.midX);
});

window.addEventListener('touchmove', e => {
    if (!wheelMetrics.active || runState !== 'RUNNING') return;
    const box = steeringWheelDisc.getBoundingClientRect();
    const touch = e.touches[0];
    const currentRad = Math.atan2(touch.clientY - (box.top + box.height / 2), touch.clientX - wheelMetrics.midX);
    let shiftDelta = currentRad - wheelMetrics.radStart;

    while (shiftDelta < -Math.PI) shiftDelta += Math.PI * 2;
    while (shiftDelta > Math.PI) shiftDelta -= Math.PI * 2;

    wheelMetrics.degreesAccumulated += shiftDelta * (180 / Math.PI);
    steeringWheelDisc.style.transform = `rotate(${wheelMetrics.degreesAccumulated}deg)`;

    // Map the wheel angle offsets directly into targeted lane indexes
    if (shiftDelta < -0.15 && activePlayerLaneIndex > 0) {
        activePlayerLaneIndex--;
        wheelMetrics.radStart = currentRad; // Calibrate tracking index
    } else if (shiftDelta > 0.15 && activePlayerLaneIndex < 2) {
        activePlayerLaneIndex++;
        wheelMetrics.radStart = currentRad;
    }
});

window.addEventListener('touchend', () => { wheelMetrics.active = false; });

function updateTelemetryDisplay() {
    document.getElementById('hud-hp').innerText = `${Math.round(runnerProfile.hp)}%`;
    document.getElementById('hud-score').innerText = String(Math.round(currentScore)).padStart(4, '0');
}

// --- SYSTEM FATALITY CRASH EXECUTIONS ---
function handleFatalityCollision() {
    runState = 'DEAD';
    
    // Exact 50% score reduction penalty rule implementation
    let scoreLost = Math.round(currentScore * 0.5);
    currentScore = Math.max(0, currentScore - scoreLost);
    
    updateTelemetryDisplay();

    // Trigger Pop-up Modal Deck UI adjustments
    modalOverlay.style.display = 'flex';
    document.getElementById('menu-start').style.display = 'none';
    document.getElementById('menu-pause').style.display = 'none';
    
    const containerDeath = document.getElementById('menu-death');
    containerDeath.style.display = 'block';
    document.getElementById('death-penalty-msg').innerText = `CRASH TRIGGERED! HAZARD DETECTED.\nPENALTY LOSS: -${scoreLost} PTS (50% LIQUIDATED)`;
}

// --- FORWARD 3D PERSPECTIVE RENDERING PIPELINE ---
function render3DRunnerScene() {
    // Render deep charcoal horizon background textures
    ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const vanX = canvas.width / 2;
    const vanY = canvas.height * 0.40; // Horizon vanishing anchor coordinate points
    
    // Draw the 3D Running Lane Lines mapping forward paths down the track
    ctx.strokeStyle = '#1a2436'; ctx.lineWidth = 2;
    for (let l = 0; l <= 3; l++) {
        let pct = (l - 1.5) * 160;
        ctx.beginPath();
        ctx.moveTo(vanX + (pct * 0.05), vanY);
        ctx.lineTo(vanX + (pct * 2.2), canvas.height);
        ctx.stroke();
    }

    // --- EXECUTE TICK CALCULATIONS AND PROCEDURAL TRACK SPOTS ---
    if (runSpeedMultiplier > 0) {
        environmentTick += 4 * runSpeedMultiplier;
        
        // Procedural distribution configuration rules for item objects down tracks
        if (environmentTick % 12 === 0) {
            let selectedLane = Math.floor(Math.random() * 3);
            let rolledType = Math.random() > 0.45 ? 'COIN' : 'HAZARD';
            trackEntities.push({ lane: selectedLane, z: 600, type: rolledType, variant: Math.random() > 0.5 ? 1 : 2 });
        }
    }

    // --- PROCESS COMPANION LEADER SCOUT ARTIFICIAL INTELLIGENCE PASS ---
    companionScout.switchTimer -= runSpeedMultiplier;
    if (companionScout.switchTimer <= 0) {
        companionScout.switchTimer = 40 + Math.random() * 60;
        
        // Scan upcoming tracks to safely calculate lane tracks to lead the player forward
        let criticalThreatAhead = trackEntities.find(e => e.z > 250 && e.z < 500 && e.lane === companionScout.laneIndex && e.type === 'HAZARD');
        if (criticalThreatAhead) {
            let openLanes = [0, 1, 2].filter(l => l !== companionScout.laneIndex);
            companionScout.targetLaneIndex = openLanes[Math.floor(Math.random() * openLanes.length)];
        } else if (Math.random() > 0.6) {
            // Find nearby paths containing coins to guide the player toward points
            let coinTarget = trackEntities.find(e => e.z > 300 && e.type === 'COIN');
            if (coinTarget) companionScout.targetLaneIndex = coinTarget.lane;
        }
    }

    // Smooth lateral movement mapping for the Lead Scout avatar
    companionScout.laneIndex += (companionScout.targetLaneIndex - companionScout.laneIndex) * 0.08;

    // --- PROJECT COINS, SENTINEL BLOCKS, AND CHARACTERS DOWN TRACKS ---
    let projectedEntities = [];

    // Map Companion Scout metrics into the active depth array
    projectedEntities.push({
        laneX: LANES[Math.round(companionScout.laneIndex)] * 110,
        z: companionScout.zPos,
        type: 'SCOUT_AGENT'
    });

    trackEntities.forEach(ent => {
        ent.z -= 6 * runSpeedMultiplier; // Move entities closer down the track
        projectedEntities.push({
            laneX: LANES[ent.lane] * 110,
            z: ent.z,
            type: ent.type,
            variant: ent.variant,
            rawRef: ent
        });
    });

    // Clean out dead elements behind the camera perspective to free processing registers
    trackEntities = trackEntities.filter(e => e.z > 10);

    // Sort entities by depth to accurately project sizes over one another
    projectedEntities.sort((a, b) => b.z - a.z);

    // Project each active component into 2D screenspace coordinate points
    projectedEntities.forEach(item => {
        if (item.z <= 15 || item.z > 650) return;

        // Calculate size ratios based on distance down the track
        let horizonScaleRatio = 32 / item.z; 
        let screenX = vanX + (item.laneX * horizonScaleRatio * 7.5);
        let screenY = vanY + (canvas.height * 0.45 * horizonScaleRatio * 7.0);
        let sizeWidth = 80 * horizonScaleRatio * 6.0;
        let sizeHeight = 100 * horizonScaleRatio * 6.0;

        if (item.type === 'COIN') {
            // Draw Glowing Hazard Orange Currency Energy Cubes
            ctx.fillStyle = '#ff9900';
            ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 10;
            ctx.fillRect(screenX - sizeWidth / 3, screenY - sizeHeight / 1.5, sizeWidth * 0.6, sizeWidth * 0.6);
            ctx.shadowBlur = 0; // Reset canvas context state pipelines

            // Core proximity tracking calculations
            if (item.z < 45 && item.z > 15 && Math.abs(screenX - (vanX + calculatedPlayerX)) < sizeWidth * 1.5) {
                currentScore += 150;
                updateTelemetryDisplay();
                item.rawRef.z = -99; // Flag for instant clearing
            }
        } else if (item.type === 'HAZARD') {
            // Draw Impenetrable Terminal Walls
            if (item.variant === 1) {
                ctx.fillStyle = '#ff2200'; // Flashing Crimson Hazard Gates
                ctx.fillRect(screenX - sizeWidth / 1.1, screenY - sizeHeight, sizeWidth * 1.8, sizeHeight * 0.8);
            } else {
                ctx.fillStyle = '#252e3d'; // Solid Infrastructure Obstacles
                ctx.fillRect(screenX - sizeWidth / 1.5, screenY - sizeHeight * 1.2, sizeWidth * 1.3, sizeHeight * 1.2);
            }

            // High-Performance Collision Intersection Check
            if (item.z < 42 && item.z > 18 && Math.abs(screenX - (vanX + calculatedPlayerX)) < sizeWidth * 1.1) {
                item.rawRef.z = -99;
                elementVignette.style.boxShadow = "inset 0 0 50px rgba(255, 0, 0, 0.85)";
                setTimeout(() => { elementVignette.style.boxShadow = "inset 0 0 50px rgba(255, 0, 0, 0)"; }, 90);
                handleFatalityCollision();
            }
        } else if (item.type === 'SCOUT_AGENT') {
            // Draw the Companion Agent leading the path ahead
            ctx.fillStyle = '#00ff66';
            ctx.shadowColor = '#00ff66'; ctx.shadowBlur = 12;
            
            // Draw a diamond chevron shape representing the squad leader
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - sizeHeight * 1.1);
            ctx.lineTo(screenX + sizeWidth / 2, screenY - sizeHeight * 0.6);
            ctx.lineTo(screenX, screenY - sizeHeight * 0.1);
            ctx.lineTo(screenX - sizeWidth / 2, screenY - sizeHeight * 0.6);
            ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Smooth out character lane shifts
    let targetPlayerX = LANES[activePlayerLaneIndex] * 110;
    calculatedPlayerX += (targetPlayerX - calculatedPlayerX) * 0.22;

    // Draw Score tick values dynamically over distance tracks
    if (runSpeedMultiplier > 0 && runState === 'RUNNING') {
        currentScore += 0.25 * runSpeedMultiplier;
        updateTelemetryDisplay();
    }
}

// --- MASTER ANIMATION REFRESH CYCLE ---
function stepEngineFrame() {
    if (runState === 'RUNNING') {
        render3DRunnerScene();
    }
    requestAnimationFrame(stepEngineFrame);
}
stepEngineFrame();
