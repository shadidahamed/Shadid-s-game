import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export class Player {
  constructor(camera) {
    this.camera = camera;

    // Player position
    this.position = new THREE.Vector3(0, 2, 5);

    // Movement settings
    this.speed = 0.1;
    this.lane = 0; // -1 = left, 0 = center, 1 = right
    this.laneWidth = 2;

    this.setupControls();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.lane = Math.max(this.lane - 1, -1);
      }
      if (e.key === 'ArrowRight') {
        this.lane = Math.min(this.lane + 1, 1);
      }
    });
  }

  update() {
    // Forward movement (auto-run)
    this.position.z -= this.speed;

    // Smooth lane switching
    const targetX = this.lane * this.laneWidth;
    this.position.x += (targetX - this.position.x) * 0.1;

    // Update camera position
    this.camera.position.copy(this.position);
    this.camera.lookAt(this.position.x, this.position.y, this.position.z - 10);
  }
}
