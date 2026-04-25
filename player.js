import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Player {
  constructor(camera) {
    this.camera = camera;

    this.position = new THREE.Vector3(0, 2, 5);

    this.lane = 0;
    this.laneWidth = 2;

    this.speed = 6;

    this._initControls();
  }

  _initControls() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.lane = Math.max(this.lane - 1, -1);
      if (e.key === "ArrowRight") this.lane = Math.min(this.lane + 1, 1);
    });
  }

  update(dt) {
    this.position.z -= this.speed * dt;

    const targetX = this.lane * this.laneWidth;
    this.position.x += (targetX - this.position.x) * 10 * dt;

    const camTarget = new THREE.Vector3(
      this.position.x,
      this.position.y + 2,
      this.position.z + 6
    );

    this.camera.position.lerp(camTarget, 8 * dt);

    this.camera.lookAt(
      this.position.x,
      this.position.y,
      this.position.z - 10
    );
  }
}
