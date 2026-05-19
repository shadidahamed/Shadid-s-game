const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME LOGIC STATE CONFIGS ---
let player = {
    x: 100, y: 225, radius: 15, angle: 0,
    walkSpeed: 2.5, crouchSpeed: 1.2,
    isCrouching: false, noiseRadius: 0, hp: 100
};

let enemy = {
    x: 600, y: 225, radius: 15, angle: Math.PI,
    speed: 1.2, state: 'PATROL', 
    patrolTargets: [{x: 600, y: 100}, {x: 600, y: 350}],
    targetIndex: 0, targetX: 600, targetY: 100
};

let inventory = { alcohol: 2, binding: 2, blades: 1, medkits: 0, shivs: 1 };
let keys = {};
let isMobile = !window.matchMedia("(pointer: fine)").matches;

// --- DYNAMIC CONTROL VECTOR ---
let inputVector = { x: 0, y: 0 };

// --- EVENT LISTENERS (LAPTOP ARROW KEYS) ---
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowLeft')  inputVector.x = -1;
    if (e.key === 'ArrowRight') inputVector.x = 1;
    if (e.key === 'ArrowUp')    inputVector.y = -1;
    if (e.key === 'ArrowDown')  inputVector.y = 1;
    
    // Command Injections matching prompt specs
    if (e.key === 'a' || e.key === 'A') craftItem('medkit');
    if (e.key === 'd' || e.key === 'D') craftItem('shiv');
    if (e.key === 'q' || e.key === 'Q') useMedkit();
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) inputVector.x = 0;
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) inputVector.y = 0;
});

// --- CRAFTING & INVENTORY MECHANICS ---
function craftItem(type) {
    if (type === 'medkit' && inventory.alcohol >= 1 && inventory.binding >= 1) {
        inventory.alcohol--; inventory.binding--; inventory.medkits++;
    } else if (type === 'shiv' && inventory.blades >= 1 && inventory.binding >= 1) {
        inventory.blades--; inventory.binding--; inventory.shivs++;
    }
    updateUI();
}

function useMedkit() {
    if (inventory.medkits > 0 && player.hp < 100) {
        inventory.medkits--;
        player.hp = Math.min(100, player.hp + 40);
        updateUI();
    }
}

function updateUI() {
    document.getElementById('hp-val').innerText = Math.round(player.hp);
    document.getElementById('inventory-ui').innerText = 
        `Alcohol: ${inventory.alcohol} | Binding: ${inventory.binding} | Blades: ${inventory.blades} | Medkits: ${inventory.medkits} | Shivs: ${inventory.shivs}`;
}

// --- ENGINE REFRESH LOOP ---
function gameLoop() {
    updatePlayerPhysics();
    updateAIPhysics();
    renderFrame();
    requestAnimationFrame(gameLoop);
}

function updatePlayerPhysics() {
    if (player.hp <= 0) return;

    let currentSpeed = player.isCrouching ? player.crouchSpeed : player.walkSpeed;
    player.x += inputVector.x * currentSpeed;
    player.y += inputVector.y * currentSpeed;

    // Bounds check
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // Dynamic rotation mapping
    if (inputVector.x !== 0 || inputVector.y !== 0) {
        player.angle = Math.atan2(inputVector.y, inputVector.x);
        player.noiseRadius = player.isCrouching ? 0 : 150;
    } else {
        player.noiseRadius = 0;
    }
}

function updateAIPhysics() {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let distance = Math.sqrt(dx*dx + dy*dy);

    // Dynamic Sound Radius check
    if (player.noiseRadius > 0 && distance <= player.noiseRadius) {
        enemy.state = 'INVESTIGATE';
        enemy.targetX = player.x;
        enemy.targetY = player.y;
    }

    // AI Behavioral Core State machine
    if (enemy.state === 'PATROL') {
        let tDx = enemy.targetX - enemy.x;
        let tDy = enemy.targetY - enemy.y;
        let tDist = Math.sqrt(tDx*tDx + tDy*tDy);
        
        if (tDist < 5) {
            enemy.targetIndex = (enemy.targetIndex + 1) % enemy.patrolTargets.length;
            enemy.targetX = enemy.patrolTargets[enemy.targetIndex].x;
            enemy.targetY = enemy.patrolTargets[enemy.targetIndex].y;
        }
        enemy.angle = Math.atan2(tDy, tDx);
    } else if (enemy.state === 'INVESTIGATE') {
        let tDx = enemy.targetX - enemy.x;
        let tDy = enemy.targetY - enemy.y;
        if (Math.sqrt(tDx*tDx + tDy*tDy) < 5) enemy.state = 'PATROL';
        enemy.angle = Math.atan2(tDy, tDx);
    }

    enemy.x += Math.cos(enemy.angle) * enemy.speed;
    enemy.y += Math.sin(enemy.angle) * enemy.speed;

    // Direct Attacking Logic
    if (distance < (player.radius + enemy.radius)) {
        player.hp = Math.max(0, player.hp - 0.4);
        updateUI();
    }
}

function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Sound Indicator Ring
    if (player.noiseRadius > 0) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.noiseRadius, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw Player Unit
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = player.isCrouching ? '#4a90e2' : '#50e3c2';
    ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(0, -3, 15, 6); // Aiming Sight line indicator
    ctx.restore();

    // Draw Infected Unit
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle);
    ctx.fillStyle = '#d0021b';
    ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(0, -3, 12, 6);
    ctx.restore();
}

// --- VIRTUAL MOBILE JOYSTICK LOGIC TRACKER ---
if (isMobile) {
    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');
    
    base.addEventListener('touchmove', (e) => {
        e.preventDefault();
        let touch = e.touches[0];
        let rect = base.getBoundingClientRect();
        let centerX = rect.left + rect.width / 2;
        let centerY = rect.top + rect.height / 2;
        
        let jDx = touch.clientX - centerX;
        let jDy = touch.clientY - centerY;
        let jDist = Math.sqrt(jDx*jDx + jDy*jDy);
        
        if (jDist > 40) { jDx = (jDx / jDist) * 40; jDy = (jDy / jDist) * 40; }
        
        knob.style.transform = `translate(${jDx}px, ${jDy}px)`;
        
        inputVector.x = jDx / 40;
        inputVector.y = jDy / 40;
    });

    base.addEventListener('touchend', () => {
        knob.style.transform = 'translate(0px, 0px)';
        inputVector = { x: 0, y: 0 };
    });

    // Touch Screen Bottom Buttons Binding Map
    document.getElementById('btn-crouch').addEventListener('touchstart', () => {
        player.isCrouching = !player.isCrouching;
    });
    document.getElementById('btn-heal').addEventListener('touchstart', useMedkit);
    document.getElementById('btn-craft-a').addEventListener('touchstart', () => craftItem('medkit'));
    document.getElementById('btn-craft-d').addEventListener('touchstart', () => craftItem('shiv'));
}

// Start core system instantiation 
gameLoop();
