
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { Player } from './player.js';
import { ZombieSystem } from './zombies.js';

// Scene
const scene = new THREE.Scene();
const zombies = new ZombieSystem(scene, player);
scene.fog = new THREE.Fog(0x000000, 10, 50);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff0000, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Ground
const geometry = new THREE.PlaneGeometry(100, 1000);
const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
const ground = new THREE.Mesh(geometry, material);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Player
const player = new Player(camera);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
zombies.update();
  // Update player movement
  player.update();

  renderer.render(scene, camera);
}

animate();
