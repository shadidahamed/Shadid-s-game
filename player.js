import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export class Player {
  constructor(camera) {
    this.camera = camera;

    this.position = new THREE.Vector3(0, 2, 5);

    this.speed = 0.12;
    this.lane = 0;
    this.laneWidth = 2;

    this.setupControls();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.lane = Math.max(this.lane - 1, -1);
      if (e.key === 'ArrowRight') this.lane = Math.min(this.lane + 1, 1);
    });
  }

  update() {
    this.position.z -= this.speed;

    const targetX = this.lane * this.laneWidth;
    this.position.x += (targetX - this.position.x) * 0.12;

    this.camera.position.set(
      this.position.x,
      this.position.y + 2,
      this.position.z + 6
    );

    this.camera.lookAt(
      this.position.x,
      this.position.y,
      this.position.z - 10
    );
  }
}
