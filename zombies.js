import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class ZombieSystem {
  constructor(scene, player, ui) {
    this.scene = scene;
    this.player = player;
    this.ui = ui;

    this.zombies = [];
    this.timer = 0;

    this.spawnRate = 2.0; // seconds
    this.speed = 3;

    this.lanes = [-2, 0, 2];

    this.material = new THREE.MeshStandardMaterial({
      color: 0x2b0000
    });
  }

  spawn() {
    const z = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      this.material
    );

    z.position.set(
      this.lanes[Math.floor(Math.random() * this.lanes.length)],
      1,
      this.player.position.z - 40
    );

    this.scene.add(z);
    this.zombies.push(z);
  }

  remove(index) {
    this.scene.remove(this.zombies[index]);
    this.zombies.splice(index, 1);
  }

  update(dt) {
    this.timer += dt;

    if (this.timer > this.spawnRate) {
      this.spawn();
      this.timer = 0;
    }

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];

      z.position.z += this.speed * dt;

      const dx = Math.abs(z.position.x - this.player.position.x);
      const dz = Math.abs(z.position.z - this.player.position.z);

      if (dx < 1 && dz < 1.2) {
        this.ui.damage(10);
        this.remove(i);
        continue;
      }

      if (z.position.z > this.player.position.z + 10) {
        this.remove(i);
      }
    }
  }
}
