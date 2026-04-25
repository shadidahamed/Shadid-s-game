
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export class ShootingSystem {
  constructor(scene, player, zombies, ui) {
    this.scene = scene;
    this.player = player;
    this.zombies = zombies;
    this.ui = ui;

    this.bullets = [];
    this.speed = 0.9;

    this.cooldown = 0;
    this.cooldownMax = 10;

    this.material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x550000
    });

    this.initInput();
  }

  initInput() {
    window.addEventListener('click', () => this.shoot());
    window.addEventListener('touchstart', () => this.shoot());
  }

  shoot() {
    if (this.cooldown > 0) return;

    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      this.material
    );

    bullet.position.copy(this.player.position);
    bullet.position.z -= 2;

    this.scene.add(bullet);
    this.bullets.push(bullet);

    this.cooldown = this.cooldownMax;
  }

  update() {
    if (this.cooldown > 0) this.cooldown--;

    for (let i = 0; i < this.bullets.length; i++) {
      const b = this.bullets[i];
      b.position.z -= this.speed;

      // collision with zombies
      for (let j = 0; j < this.zombies.zombies.length; j++) {
        const z = this.zombies.zombies[j];

        const dx = b.position.x - z.position.x;
        const dz = b.position.z - z.position.z;

        if (Math.sqrt(dx * dx + dz * dz) < 0.9) {
          this.scene.remove(b);
          this.bullets.splice(i, 1);
          i--;

          this.zombies.removeZombie(j);
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
  }
}
