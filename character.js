import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Character {
  constructor(scene) {
    this.scene = scene;

    this.position = new THREE.Vector3(0, 0, 5);

    this.lane = 0;
    this.laneWidth = 2;

    this.speed = 7;

    this.weaponState = 0;
    this.cooldown = 0;

    this.model = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.5, 1),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );

    this.scene.add(this.model);

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.lane = Math.max(-1, this.lane - 1);
      if (e.key === "ArrowRight") this.lane = Math.min(1, this.lane + 1);
      if (e.key === "q") this.weaponState = Math.min(2, this.weaponState + 1);
    });
  }

  update(dt) {
    this.position.z -= this.speed * dt;

    const tx = this.lane * this.laneWidth;
    this.position.x += (tx - this.position.x) * 12 * dt;

    this.model.position.copy(this.position);

    this.cooldown -= dt;
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot() {
    this.cooldown = 0.12;

    return {
      position: this.position.clone(),
      power: 10 + this.weaponState * 10
    };
  }
}
