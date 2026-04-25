
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export class ZombieSystem {
  constructor(scene, player, ui) {
    this.scene = scene;
    this.player = player;
    this.ui = ui;

    this.zombies = [];
    this.frame = 0;

    this.spawnRate = 100;
    this.speed = 0.05;

    this.lanes = [-2, 0, 2];

    this.material = new THREE.MeshStandardMaterial({
      color: 0x2b0000,
      roughness: 1
    });
  }

  spawn() {
    const z = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      this.material
    );

    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    z.position.set(
      lane,
      1,
      this.player.position.z - 40 - Math.random() * 20
    );

    this.scene.add(z);
    this.zombies.push(z);
  }

  removeZombie(index) {
    this.scene.remove(this.zombies[index]);
    this.zombies.splice(index, 1);
  }

  update() {
    this.frame++;

    if (this.frame % this.spawnRate === 0) {
      this.spawn();
    }

    for (let i = 0; i < this.zombies.length; i++) {
      const z = this.zombies[i];

      z.position.z += this.speed;

      const dx = this.player.position.x - z.position.x;
      z.position.x += dx * 0.01;

      // player collision damage
      const dist = z.position.distanceTo(this.player.position);

      if (dist < 1.2) {
        this.ui.damage(10);
        this.removeZombie(i);
        i--;
        continue;
      }

      if (z.position.z > this.player.position.z + 10) {
        this.removeZombie(i);
        i--;
      }
    }
  }
}
