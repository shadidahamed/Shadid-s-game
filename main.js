import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Light (dark horror tone)
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff0000, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Ground (dark road)
const geometry = new THREE.PlaneGeometry(100, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
const ground = new THREE.Mesh(geometry, material);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Simple foggy atmosphere particles (optional aesthetic)
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 500;

const positions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 100;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const starsMaterial = new THREE.PointsMaterial({
  color: 0x555555,
  size: 0.2
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Slight motion for atmosphere
  stars.rotation.y += 0.0005;

  renderer.render(scene, camera);
}

animate();
