/* =========================================
   NOCLIP // LIMINAL ECHOES
   FINAL MASTER SCRIPT
========================================= */

// =========================================
// CORE
// =========================================

let scene;
let camera;
let renderer;

let gameRunning = false;
let isDead = false;
let time = 0;

const clock = {
    delta: 0,
    last: performance.now()
};

// =========================================
// PLAYER
// =========================================

const player = {
    x: 5,
    z: 5,
    y: 1.7,

    rotation: Math.PI / 4,

    stamina: 100,
    speed: 0.12,

    health: 100
};

// =========================================
// GAME STATE
// =========================================

let level = 0;
let currentLevelName = "THE LOBBY";

let sanity = 72;
let notesFound = 0;

let maze = [];
let entities = [];
let items = [];
let safeZones = [];
let particles = [];

const MAZE_SIZE = 45;

// =========================================
// INPUT
// =========================================

const keys = {};

let mobileInput = {
    active: false,
    moveX: 0,
    moveZ: 0,
    running: false
};

// =========================================
// INVENTORY
// =========================================

let inventory = [];

// =========================================
// AUDIO
// =========================================

const audioCtx = new (
    window.AudioContext ||
    window.webkitAudioContext
)();

function playSound(
    type = "buzz",
    volume = 0.5,
    frequency = 300
){

    if(!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type =
        type === "scream"
            ? "sawtooth"
            : type === "ambient"
                ? "triangle"
                : "sine";

    osc.frequency.setValueAtTime(
        frequency,
        audioCtx.currentTime
    );

    gain.gain.value = volume;

    filter.type = "lowpass";
    filter.frequency.value =
        type === "ambient"
            ? 600
            : 1800;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();

    setTimeout(() => {
        osc.stop();
    }, type === "ambient" ? 1800 : 550);
}

// =========================================
// LEVEL THEMES
// =========================================

const levelThemes = [

    {
        name: "THE LOBBY",
        wall: 0xccbb77,
        floor: 0xe5d48c,
        fog: 0x111d2b,
        light: 0xffeecc
    },

    {
        name: "HABITABLE ZONE",
        wall: 0x777777,
        floor: 0x4d4d4d,
        fog: 0x182222,
        light: 0xaaddff
    },

    {
        name: "PIPE DREAMS",
        wall: 0x556677,
        floor: 0x2f3438,
        fog: 0x0c1720,
        light: 0xffaa44
    },

    {
        name: "ELECTRICAL STATION",
        wall: 0x334455,
        floor: 0x202833,
        fog: 0x020912,
        light: 0x88eeff
    },

    {
        name: "THE VOID",
        wall: 0x190d19,
        floor: 0x000000,
        fog: 0x000000,
        light: 0x660000
    }
];

// =========================================
// INITIALIZE
// =========================================

function init(){

    setupRenderer();

    bindEvents();

    setupButtons();

    console.log(
        "%cNOCLIP // LIMINAL ECHOES",
        "color:#00f5ff;font-size:18px;font-family:monospace;"
    );
}

// =========================================
// RENDERER
// =========================================

function setupRenderer(){

    const canvas =
        document.getElementById("game-canvas");

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;
}

// =========================================
// WORLD GENERATION
// =========================================

function generateMazeForLevel(lvl){

    maze = Array(MAZE_SIZE)
        .fill()
        .map(() => Array(MAZE_SIZE).fill(1));

    const step = lvl > 2 ? 2 : 3;

    for(let x = 2; x < MAZE_SIZE - 2; x += step){

        for(let z = 2; z < MAZE_SIZE - 2; z++){

            maze[x][z] = 0;
        }
    }

    for(let z = 2; z < MAZE_SIZE - 2; z += step){

        for(let x = 2; x < MAZE_SIZE - 2; x++){

            maze[x][z] = 0;
        }
    }

    for(let i = 0; i < 30; i++){

        const roomX =
            4 +
            Math.floor(
                Math.random() * (MAZE_SIZE - 14)
            );

        const roomZ =
            4 +
            Math.floor(
                Math.random() * (MAZE_SIZE - 14)
            );

        const size =
            4 +
            Math.floor(Math.random() * 8);

        for(let x = roomX; x < roomX + size; x++){

            for(let z = roomZ; z < roomZ + size; z++){

                if(
                    x > 1 &&
                    x < MAZE_SIZE - 1 &&
                    z > 1 &&
                    z < MAZE_SIZE - 1
                ){
                    maze[x][z] = 0;
                }
            }
        }
    }

    maze[5][5] = 0;
}

// =========================================
// SAFE ZONES
// =========================================

function spawnSafeZones(){

    safeZones = [];

    safeZones.push({
        x: 18,
        z: 18,
        size: 7
    });
}

// =========================================
// ITEMS
// =========================================

function spawnItems(lvl){

    items = [];

    const amount = 18 + lvl * 5;

    for(let i = 0; i < amount; i++){

        const ix =
            7 +
            Math.random() *
            (MAZE_SIZE - 14);

        const iz =
            7 +
            Math.random() *
            (MAZE_SIZE - 14);

        if(
            maze[Math.floor(ix)][Math.floor(iz)] === 0
        ){

            items.push({

                x: ix - MAZE_SIZE / 2,
                z: iz - MAZE_SIZE / 2,

                collected: false,

                type:
                    Math.random() > 0.6
                        ? "almond_water"
                        : Math.random() > 0.5
                            ? "note"
                            : "battery"
            });
        }
    }
}

// =========================================
// ENTITIES
// =========================================

function spawnEntities(lvl){

    entities = [];

    const count = 10 + lvl * 4;

    for(let i = 0; i < count; i++){

        const ex =
            10 +
            Math.random() *
            (MAZE_SIZE - 20);

        const ez =
            10 +
            Math.random() *
            (MAZE_SIZE - 20);

        if(
            maze[Math.floor(ex)][Math.floor(ez)] === 0
        ){

            entities.push({

                x: ex - MAZE_SIZE / 2,
                z: ez - MAZE_SIZE / 2,

                type:
                    lvl >= 4
                        ? "void"
                        : Math.random() > 0.5
                            ? "hound"
                            : "faceling",

                angle:
                    Math.random() *
                    Math.PI *
                    2,

                speed:
                    0.03 +
                    lvl * 0.009
            });
        }
    }
}

// =========================================
// THREE.JS WORLD
// =========================================

function buildWorld(){

    scene = new THREE.Scene();

    const theme =
        levelThemes[
            level % levelThemes.length
        ];

    scene.fog = new THREE.Fog(
        theme.fog,
        10,
        65
    );

    camera = new THREE.PerspectiveCamera(
        68,
        window.innerWidth /
        window.innerHeight,
        0.1,
        150
    );

    camera.position.set(
        player.x,
        player.y,
        player.z
    );

    // =====================================
    // LIGHTS
    // =====================================

    scene.add(
        new THREE.AmbientLight(
            0x223344,
            0.55
        )
    );

    scene.add(
        new THREE.HemisphereLight(
            0x99aabb,
            0x111111,
            0.75
        )
    );

    window.dynamicLights = [];

    for(let i = 0; i < 28; i++){

        const light =
            new THREE.PointLight(
                theme.light,
                2.2,
                50
            );

        light.position.set(
            Math.random() * MAZE_SIZE -
            MAZE_SIZE / 2,

            4.3,

            Math.random() * MAZE_SIZE -
            MAZE_SIZE / 2
        );

        scene.add(light);

        window.dynamicLights.push(light);
    }

    // =====================================
    // FLOOR
    // =====================================

    const floor =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                180,
                180
            ),

            new THREE.MeshLambertMaterial({
                color: theme.floor
            })
        );

    floor.rotation.x = -Math.PI / 2;

    floor.receiveShadow = true;

    scene.add(floor);

    // =====================================
    // WALLS
    // =====================================

    const wallMaterial =
        new THREE.MeshLambertMaterial({

            color: theme.wall,

            emissive: 0x221100,

            emissiveIntensity: 0.25
        });

    for(let x = 0; x < MAZE_SIZE; x++){

        for(let z = 0; z < MAZE_SIZE; z++){

            if(maze[x][z] === 1){

                const wall =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            1,
                            5,
                            1
                        ),

                        wallMaterial
                    );

                wall.position.set(
                    x - MAZE_SIZE / 2,
                    2.5,
                    z - MAZE_SIZE / 2
                );

                wall.castShadow = true;
                wall.receiveShadow = true;

                scene.add(wall);
            }
        }
    }

    // =====================================
    // SAFE ZONE VISUALS
    // =====================================

    safeZones.forEach(zone => {

        const safeMesh =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    zone.size,
                    zone.size,
                    0.2,
                    32
                ),

                new THREE.MeshBasicMaterial({

                    color: 0x00ff88,

                    transparent: true,

                    opacity: 0.25
                })
            );

        safeMesh.position.set(
            zone.x,
            0.05,
            zone.z
        );

        scene.add(safeMesh);
    });
}

// =========================================
// ENTITY AI
// =========================================

function updateEntities(){

    entities.forEach(entity => {

        const dx =
            player.x - entity.x;

        const dz =
            player.z - entity.z;

        const dist =
            Math.hypot(dx, dz);

        if(dist < 30){

            const target =
                Math.atan2(dx, dz);

            entity.angle =
                entity.angle * 0.78 +
                target * 0.22;

            if(dist > 1.7){

                entity.x +=
                    Math.sin(entity.angle) *
                    entity.speed;

                entity.z +=
                    Math.cos(entity.angle) *
                    entity.speed;
            }

            if(dist < 1.8){

                sanity -=
                    level > 3
                        ? 26
                        : 14;

                flashWarning(
                    "THEY SEE YOU"
                );

                playSound(
                    "scream",
                    0.9,
                    80
                );

                if(sanity <= 0){

                    triggerDeath();
                }
            }
        }
    });
}

// =========================================
// INTERACTIONS
// =========================================

function checkInteractions(){

    // SAFE ZONES

    safeZones.forEach(zone => {

        const dist =
            Math.hypot(
                player.x - zone.x,
                player.z - zone.z
            );

        if(dist < zone.size){

            sanity =
                Math.min(
                    100,
                    sanity + 0.16
                );
        }
    });

    // ITEMS

    items.forEach(item => {

        if(item.collected) return;

        const dist =
            Math.hypot(
                player.x - item.x,
                player.z - item.z
            );

        if(dist < 1.8){

            item.collected = true;

            inventory.push(item.type);

            updateInventoryUI();

            playSound(
                "buzz",
                0.4,
                850
            );

            if(item.type === "almond_water"){

                sanity =
                    Math.min(
                        100,
                        sanity + 30
                    );

                addLog(
                    "Consumed Almond Water."
                );
            }

            if(item.type === "note"){

                notesFound++;

                addLog(
                    `Found Note #${notesFound}`
                );
            }

            if(item.type === "battery"){

                addLog(
                    "Battery collected."
                );
            }
        }
    });
}

// =========================================
// PLAYER MOVEMENT
// =========================================

function updatePlayer(){

    let moveX = 0;
    let moveZ = 0;

    const running =
        (
            keys["Shift"] ||
            mobileInput.running
        ) &&
        player.stamina > 10;

    const speed =
        running
            ? 0.2
            : 0.12;

    if(keys["w"] || keys["ArrowUp"]){

        moveX += Math.sin(player.rotation);

        moveZ += Math.cos(player.rotation);
    }

    if(keys["s"] || keys["ArrowDown"]){

        moveX -=
            Math.sin(player.rotation) * 0.7;

        moveZ -=
            Math.cos(player.rotation) * 0.7;
    }

    if(keys["a"] || keys["ArrowLeft"]){

        player.rotation -= 0.05;
    }

    if(keys["d"] || keys["ArrowRight"]){

        player.rotation += 0.05;
    }

    // MOBILE

    moveX += mobileInput.moveX;
    moveZ += mobileInput.moveZ;

    const nextX =
        player.x + moveX * speed;

    const nextZ =
        player.z + moveZ * speed;

    const mapX =
        Math.floor(nextX + MAZE_SIZE / 2);

    const mapZ =
        Math.floor(nextZ + MAZE_SIZE / 2);

    if(
        mapX >= 0 &&
        mapX < MAZE_SIZE &&
        mapZ >= 0 &&
        mapZ < MAZE_SIZE &&
        maze[mapX][mapZ] === 0
    ){

        player.x = nextX;
        player.z = nextZ;

        if(running){

            player.stamina -= 0.5;
        }
    }

    player.stamina =
        Math.min(
            100,
            player.stamina + 0.3
        );

    camera.position.set(
        player.x,
        player.y +
        Math.sin(time * 11) * 0.01,
        player.z
    );

    camera.rotation.y =
        player.rotation +
        Math.sin(time * 8) * 0.005;
}

// =========================================
// UI
// =========================================

function updateUI(){

    document.getElementById(
        "sanity-fill"
    ).style.width =
        sanity + "%";

    document.getElementById(
        "sanity-text"
    ).textContent =
        Math.floor(sanity);

    document.getElementById(
        "stamina-text"
    ).textContent =
        Math.floor(player.stamina);

    document.getElementById(
        "level-num"
    ).textContent =
        level;

    document.getElementById(
        "level-name"
    ).textContent =
        currentLevelName;

    document.getElementById(
        "coord-x"
    ).textContent =
        player.x.toFixed(1);

    document.getElementById(
        "coord-z"
    ).textContent =
        player.z.toFixed(1);
}

// =========================================
// MINIMAP
// =========================================

function updateMinimap(){

    const map =
        document.getElementById("minimap");

    const ctx =
        map.getContext("2d");

    ctx.clearRect(0,0,240,240);

    ctx.fillStyle = "#001122";

    ctx.fillRect(0,0,240,240);

    const scale =
        240 / MAZE_SIZE;

    // WALLS

    ctx.fillStyle = "#998866";

    for(let x = 0; x < MAZE_SIZE; x++){

        for(let z = 0; z < MAZE_SIZE; z++){

            if(maze[x][z]){

                ctx.fillRect(
                    x * scale,
                    z * scale,
                    scale,
                    scale
                );
            }
        }
    }

    // SAFE ZONES

    ctx.fillStyle = "#00ff88";

    safeZones.forEach(zone => {

        ctx.fillRect(
            (zone.x + MAZE_SIZE / 2 - 4) * scale,
            (zone.z + MAZE_SIZE / 2 - 4) * scale,
            8 * scale,
            8 * scale
        );
    });

    // ITEMS

    ctx.fillStyle = "#00ffff";

    items.forEach(item => {

        if(item.collected) return;

        ctx.fillRect(
            (item.x + MAZE_SIZE / 2) * scale - 3,
            (item.z + MAZE_SIZE / 2) * scale - 3,
            6,
            6
        );
    });

    // ENTITIES

    ctx.fillStyle = "#ff0033";

    entities.forEach(entity => {

        ctx.fillRect(
            (entity.x + MAZE_SIZE / 2) * scale - 4,
            (entity.z + MAZE_SIZE / 2) * scale - 4,
            8,
            8
        );
    });

    // PLAYER

    ctx.save();

    ctx.translate(
        (player.x + MAZE_SIZE / 2) * scale,
        (player.z + MAZE_SIZE / 2) * scale
    );

    ctx.rotate(player.rotation);

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        -5,
        -12,
        10,
        24
    );

    ctx.restore();
}

// =========================================
// LOG
// =========================================

function addLog(message){

    const content =
        document.getElementById(
            "log-content"
        );

    const log =
        document.getElementById("log");

    log.style.display = "block";

    const entry =
        document.createElement("div");

    entry.className = "log-entry";

    entry.textContent =
        "> " + message;

    content.appendChild(entry);

    while(content.children.length > 7){

        content.removeChild(
            content.children[0]
        );
    }
}

// =========================================
// INVENTORY UI
// =========================================

function updateInventoryUI(){

    const grid =
        document.getElementById(
            "inventory-grid"
        );

    grid.innerHTML = "";

    inventory.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "item";

        div.textContent =
            item === "almond_water"
                ? "💧"
                : item === "note"
                    ? "📜"
                    : "🔋";

        grid.appendChild(div);
    });
}

// =========================================
// WARNING
// =========================================

function flashWarning(text){

    const warning =
        document.getElementById("warning");

    warning.textContent = text;

    warning.style.opacity = 1;

    setTimeout(() => {

        warning.style.opacity = 0;

    }, 1200);
}

// =========================================
// GAME LOOP
// =========================================

function gameLoop(){

    if(!gameRunning || isDead) return;

    requestAnimationFrame(gameLoop);

    const now = performance.now();

    clock.delta =
        (now - clock.last) / 1000;

    clock.last = now;

    time += clock.delta;

    updatePlayer();

    updateEntities();

    checkInteractions();

    updateUI();

    updateMinimap();

    // SANITY DRAIN

    sanity -=
        0.015 +
        Math.random() * 0.01;

    // HALLUCINATIONS

    if(
        sanity < 35 &&
        Math.random() < 0.02
    ){

        flashWarning(
            Math.random() > 0.5
                ? "NOT REAL"
                : "BEHIND YOU"
        );
    }

    // LIGHT FLICKER

    if(window.dynamicLights){

        window.dynamicLights.forEach(light => {

            if(Math.random() < 0.08){

                light.intensity =
                    1.2 +
                    Math.random() * 2.8;
            }
        });
    }

    // RANDOM SOUNDS

    if(Math.random() < 0.003){

        playSound(
            "ambient",
            0.18,
            120
        );
    }

    renderer.render(scene, camera);
}

// =========================================
// GAME FLOW
// =========================================

function startGame(){

    showLoadingScreen();

    setTimeout(() => {

        hideAllScreens();

        beginLevel(0);

        gameRunning = true;

        gameLoop();

        addLog(
            "You no-clipped into reality."
        );

        playSound(
            "buzz",
            0.5,
            350
        );

    }, 2600);
}

function beginLevel(lvl){

    level = lvl;

    currentLevelName =
        levelThemes[
            lvl % levelThemes.length
        ].name;

    generateMazeForLevel(lvl);

    spawnSafeZones();

    spawnItems(lvl);

    spawnEntities(lvl);

    buildWorld();

    player.x = 5;
    player.z = 5;
}

function nextLevel(){

    level++;

    if(level >= 5){

        showEnding();

        return;
    }

    showTransitionScreen();

    setTimeout(() => {

        hideAllScreens();

        beginLevel(level);

        gameRunning = true;

        gameLoop();

        addLog(
            `Entered ${currentLevelName}`
        );

    }, 2500);
}

// =========================================
// SCREENS
// =========================================

function hideAllScreens(){

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.style.display = "none";
        });
}

function showLoadingScreen(){

    hideAllScreens();

    const screen =
        document.getElementById(
            "loading-screen"
        );

    screen.style.display = "flex";

    const fill =
        document.getElementById(
            "loading-fill"
        );

    let progress = 0;

    const interval =
        setInterval(() => {

            progress +=
                Math.random() * 12;

            fill.style.width =
                Math.min(progress,100) + "%";

            if(progress >= 100){

                clearInterval(interval);
            }

        }, 120);
}

function showTransitionScreen(){

    gameRunning = false;

    hideAllScreens();

    const screen =
        document.getElementById(
            "transition-screen"
        );

    const content =
        document.getElementById(
            "transition-content"
        );

    content.innerHTML = `

        <div style="
            height:100%;
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
            text-align:center;
            padding:50px;
            color:#ffcc66;
        ">

            <h1 style="
                font-size:48px;
                margin-bottom:25px;
            ">
                LEVEL ${level}
            </h1>

            <p style="
                font-size:26px;
                line-height:1.8;
            ">
                M.E.G. SIGNAL DETECTED
            </p>

            <p style="
                margin-top:30px;
                font-size:20px;
                color:#ff6666;
            ">
                NEXT:
                ${currentLevelName}
            </p>

        </div>
    `;

    screen.style.display = "flex";
}

function triggerDeath(){

    if(isDead) return;

    isDead = true;

    gameRunning = false;

    playSound(
        "scream",
        1,
        60
    );

    hideAllScreens();

    document.getElementById(
        "death-screen"
    ).style.display = "flex";

    document.getElementById(
        "death-level"
    ).textContent = level;

    document.getElementById(
        "death-notes"
    ).textContent = notesFound;
}

function showEnding(){

    gameRunning = false;

    hideAllScreens();

    document.getElementById(
        "ending-screen"
    ).style.display = "flex";

    playSound(
        "ambient",
        0.25,
        180
    );
}

// =========================================
// SAVE SYSTEM
// =========================================

function saveGame(){

    const data = {

        level,

        sanity,

        notesFound,

        inventory,

        player: {

            x: player.x,

            z: player.z
        }
    };

    localStorage.setItem(
        "noclip_save",
        JSON.stringify(data)
    );

    addLog(
        "Progress saved."
    );
}

function loadGame(){

    const raw =
        localStorage.getItem(
            "noclip_save"
        );

    if(!raw) return;

    try{

        const data =
            JSON.parse(raw);

        level =
            data.level || 0;

        sanity =
            data.sanity || 72;

        notesFound =
            data.notesFound || 0;

        inventory =
            data.inventory || [];

        player.x =
            data.player.x || 5;

        player.z =
            data.player.z || 5;

    }catch(err){

        console.error(err);
    }
}

// =========================================
// BUTTONS
// =========================================

function setupButtons(){

    document
        .getElementById("start-btn")
        .addEventListener(
            "click",
            startGame
        );

    document
        .getElementById("restart-btn")
        .addEventListener(
            "click",
            () => location.reload()
        );

    document
        .getElementById("play-again-btn")
        .addEventListener(
            "click",
            () => location.reload()
        );

    document
        .getElementById("continue-btn")
        .addEventListener(
            "click",
            () => {

                hideAllScreens();

                beginLevel(level);

                gameRunning = true;

                gameLoop();
            }
        );

    document
        .getElementById("mobile-run")
        .addEventListener(
            "touchstart",
            () => mobileInput.running = true
        );

    document
        .getElementById("mobile-run")
        .addEventListener(
            "touchend",
            () => mobileInput.running = false
        );

    document
        .getElementById("mobile-inventory")
        .addEventListener(
            "touchstart",
            toggleInventory
        );
}

// =========================================
// INVENTORY TOGGLE
// =========================================

function toggleInventory(){

    const inv =
        document.getElementById(
            "inventory"
        );

    inv.style.display =
        inv.style.display === "block"
            ? "none"
            : "block";
}

// =========================================
// EVENTS
// =========================================

function bindEvents(){

    window.addEventListener(
        "keydown",
        e => {

            keys[e.key] = true;

            if(
                e.key === "i" ||
                e.key === "I"
            ){

                toggleInventory();
            }

            if(
                e.key === "F5"
            ){

                e.preventDefault();
            }

            if(
                e.key === "s" &&
                e.ctrlKey
            ){

                e.preventDefault();

                saveGame();
            }

            // DEBUG NEXT LEVEL

            if(e.key === "n"){

                nextLevel();
            }
        }
    );

    window.addEventListener(
        "keyup",
        e => {

            keys[e.key] = false;
        }
    );

    // RESIZE

    window.addEventListener(
        "resize",
        () => {

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );

            camera.aspect =
                window.innerWidth /
                window.innerHeight;

            camera.updateProjectionMatrix();
        }
    );

    // MOBILE JOYSTICK

    setupJoystick();
}

// =========================================
// MOBILE JOYSTICK
// =========================================

function setupJoystick(){

    const base =
        document.getElementById(
            "joystick-base"
        );

    const knob =
        document.getElementById(
            "joystick-knob"
        );

    let active = false;

    base.addEventListener(
        "touchstart",
        () => active = true
    );

    base.addEventListener(
        "touchmove",
        e => {

            if(!active) return;

            const touch =
                e.touches[0];

            const rect =
                base.getBoundingClientRect();

            const centerX =
                rect.left + rect.width / 2;

            const centerY =
                rect.top + rect.height / 2;

            let dx =
                touch.clientX - centerX;

            let dy =
                touch.clientY - centerY;

            const distance =
                Math.min(
                    40,
                    Math.hypot(dx,dy)
                );

            const angle =
                Math.atan2(dy,dx);

            const x =
                Math.cos(angle) *
                distance;

            const y =
                Math.sin(angle) *
                distance;

            knob.style.transform =
                `translate(${x}px,${y}px)`;

            mobileInput.moveX =
                Math.cos(angle) * 0.8;

            mobileInput.moveZ =
                Math.sin(angle) * 0.8;

            player.rotation =
                angle - Math.PI / 2;
        }
    );

    base.addEventListener(
        "touchend",
        () => {

            active = false;

            mobileInput.moveX = 0;
            mobileInput.moveZ = 0;

            knob.style.transform =
                "translate(-50%,-50%)";
        }
    );
}

// =========================================
// AUTO SAVE
// =========================================

setInterval(() => {

    if(gameRunning){

        saveGame();
    }

}, 45000);

// =========================================
// START
// =========================================

init();
