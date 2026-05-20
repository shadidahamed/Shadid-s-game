// NOCLIP: LIMINAL ECHOES - Final Polished Version
let scene, camera, renderer;
let player = { x: 4, z: 4, rotation: Math.PI / 4, stamina: 100 };
let keys = {};
let sanity = 72;
let gameRunning = false;
let time = 0;
let level = 0;
let currentLevelName = "THE LOBBY";
let isDead = false;

let maze = [];
const MAZE_SIZE = 45;
let entities = [];
let items = [];
let safeZones = [];
let particles = [];

let inventory = [];
let hallucinations = { active: false, intensity: 0, timer: 0 };
let notesFound = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const levelThemes = [
    { name: "THE LOBBY", wall: 0xccbb77, fog: 0x112233, light: 0xffeecc },
    { name: "HABITABLE ZONE", wall: 0x777777, fog: 0x1a2222, light: 0xaaddff },
    { name: "PIPE DREAMS", wall: 0x556677, fog: 0x0a1a22, light: 0xffaa44 },
    { name: "ELECTRICAL STATION", wall: 0x334455, fog: 0x000811, light: 0x88eeff },
    { name: "THE VOID", wall: 0x221122, fog: 0x000000, light: 0x880000 }
];

function playSound(type, volume = 0.7, freq = 400) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    gain.gain.value = volume;
    osc.type = (type === 'buzz' || type === 'scream') ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.value = type === 'distant' ? 600 : 1800;
    osc.connect(filter).connect(gain).connect(audioCtx.destination);
    osc.start();
    setTimeout(() => osc.stop(), type === 'long' ? 1800 : 650);
}

function initThree() {
    const canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(1280, 720);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();
    const theme = levelThemes[level % levelThemes.length];
    scene.fog = new THREE.Fog(theme.fog, 10, 62);

    camera = new THREE.PerspectiveCamera(66, 1280/720, 0.1, 140);
    camera.position.set(0, 1.72, 0);

    scene.add(new THREE.AmbientLight(0x223355, 0.55));
    scene.add(new THREE.HemisphereLight(0x99aabb, 0x112233, 0.75));

    window.lights = [];
    for (let i = 0; i < 26; i++) {
        const light = new THREE.PointLight(theme.light, 2.1, 48);
        light.position.set(Math.random()*MAZE_SIZE - MAZE_SIZE/2, 4.3, Math.random()*MAZE_SIZE - MAZE_SIZE/2);
        scene.add(light);
        window.lights.push(light);
    }

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), new THREE.MeshLambertMaterial({ color: level > 2 ? 0x333333 : 0xeedd99 }));
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    const wallMat = new THREE.MeshLambertMaterial({ color: levelThemes[level % levelThemes.length].wall, emissive: 0x221100, emissiveIntensity: 0.3 });
    for (let x = 0; x < MAZE_SIZE; x++) {
        for (let z = 0; z < MAZE_SIZE; z++) {
            if (maze[x][z] === 1) {
                const wall = new THREE.Mesh(new THREE.BoxGeometry(1, 4.8, 1), wallMat);
                wall.position.set(x - MAZE_SIZE/2, 2.4, z - MAZE_SIZE/2);
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
            }
        }
    }
}

// ... (Rest of the game logic from previous Part 5 - full version)

function generateMazeForLevel(lvl) {
    maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(1));
    const step = lvl > 2 ? 2 : 3;
    for (let x = 2; x < MAZE_SIZE-2; x += step) for (let z = 2; z < MAZE_SIZE-2; z++) maze[x][z] = 0;
    for (let z = 2; z < MAZE_SIZE-2; z += step) for (let x = 2; x < MAZE_SIZE-2; x++) maze[x][z] = 0;

    for (let i = 0; i < 28; i++) {
        const rx = 4 + Math.floor(Math.random() * (MAZE_SIZE-14));
        const rz = 4 + Math.floor(Math.random() * (MAZE_SIZE-14));
        const sz = 4 + Math.floor(Math.random() * 7);
        for (let x = rx; x < rx+sz; x++) 
            for (let z = rz; z < rz+sz; z++) 
                if (x>1 && x<MAZE_SIZE-1 && z>1 && z<MAZE_SIZE-1) maze[x][z] = 0;
    }
    maze[5][5] = 0;
}

function startGame() {
    document.getElementById('intro-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('intro-screen').style.display = 'none';
        gameRunning = true;
        generateMazeForLevel(0);
        spawnMEGBase();
        spawnEntities(0);
        spawnItems(0);
        initThree();
        gameLoop();
        addLog("You no-clipped. Find a way out.");
        playSound('buzz', 0.7);
    }, 2600);
}

// Full game loop, controls, etc. are in the previous complete version I gave you.
// For brevity in this response, use the full game.js from Part 5 and merge.

console.log("%cNOCLIP: LIMINAL ECHOES - FINAL POLISHED BUILD", "color:#00ffcc;font-size:18px");
