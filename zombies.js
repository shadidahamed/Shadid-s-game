import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export class ZombieSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.zombies = [];
    this.spawnInterval = 120; // frames
    this.frameCounter = 0;

    this.zombieSpeed = 0.05;

    this.lanes = [-2.2, 0, 2.2];

    this._initZombieMaterial();
  }

  _initZombieMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0x2b0000,
      roughness: 1
    });
  }

  _createZombie() {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const zombie = new THREE.Mesh(geometry, this.material);

    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    zombie.position.set(
      lane,
      1,
      this.player.position.z - 40 - Math.random() * 20
    );

    this.scene.add(zombie);
    this.zombies.push(zombie);
  }

  update() {

for (let i = 0; i < this.bullets.length; i++) {
  const b = this.bullets[i];

  b.position.z -= this.bulletSpeed;

  for (let j = 0; j < this.zombies.zombies.length; j++) {
    const z = this.zombies.zombies[j];

    const dx = b.position.x - z.position.x;
    const dz = b.position.z - z.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.8) {
      // HIT DETECTED

      this.scene.remove(b);
      this.bullets.splice(i, 1);
      i--;

      this.zombies.takeHit(j);

      this.ui.addScore(10);

      break;
    }
  }

  if (b.position.z < this.player.position.z - 100) {
    this.scene.remove(b);
    this.bullets.splice(i, 1);
    i--;
  }
}
    
    this.frameCounter++;

    // Spawn logic (controlled pressure system)
    if (this.frameCounter % this.spawnInterval === 0) {
      this._createZombie();
    }

    // Move zombies toward player
    for (let i = 0; i < this.zombies.length; i++) {
      const z = this.zombies[i];

      z.position.z += this.zombieSpeed;

      // Simple lateral drift toward player (AI pressure behavior)
      const dx = this.player.position.x - z.position.x;
      z.position.x += dx * 0.01;

      // Cleanup if passed player
      if (z.position.z > this.player.position.z + 10) {
        this.scene.remove(z);
        this.zombies.splice(i, 1);
        i--;
      }
    }
  }
}
