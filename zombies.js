import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class ZombieSystem {
  constructor(scene, character, ui, director) {
    this.scene = scene;
    this.character = character;
    this.ui = ui;
    this.director = director;

    this.zombies = [];
    this.timer = 0;

    this.lanes = [-2, 0, 2];

    this.mat = new THREE.MeshStandardMaterial({ color: 0x220000 });
  }

  spawn() {
    const z = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      this.mat
    );

    z.position.set(
      this.lanes[Math.floor(Math.random() * 3)],
      1,
      this.character.position.z - 40
    );

    this.scene.add(z);
    this.zombies.push(z);
  }

  remove(i) {
    this.scene.remove(this.zombies[i]);
    this.zombies.splice(i, 1);
  }

  update(dt) {
    this.timer += dt;

    if (this.timer > this.director.getSpawnRate()) {
      this.spawn();
      this.timer = 0;
    }

    const speed = this.director.getZombieSpeed();

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];

      z.position.z += speed * dt;

      const dx = Math.abs(z.position.x - this.character.position.x);
      const dz = Math.abs(z.position.z - this.character.position.z);

      if (dx < 1 && dz < 1.2) {
        this.ui.damage(15);
        this.remove(i);
      }

      if (z.position.z > this.character.position.z + 10) {
        this.remove(i);
      }
    }
  }
}
