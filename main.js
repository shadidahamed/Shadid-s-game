
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

import { Player } from './player.js';
import { ZombieSystem } from './zombies.js';
import { ShootingSystem } from './shooting.js';
import { UI } from './ui.js';

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 60);

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
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0x222222));

const light = new THREE.DirectionalLight(0xff0000, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 2000),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);

ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Core systems
const ui = new UI();
const player = new Player(camera);
const zombies = new ZombieSystem(scene, player, ui);
const shooting = new ShootingSystem(scene, player, zombies, ui);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Game loop
function animate() {
  requestAnimationFrame(animate);

  if (!ui.gameOver) {
    player.update();
    zombies.update();
    shooting.update();
  }

  renderer.render(scene, camera);
}

animate();
