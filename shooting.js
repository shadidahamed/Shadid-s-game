import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class ShootingSystem {
  constructor(scene, player, zombies, ui) {
    this.scene = scene;
    this.player = player;
    this.zombies = zombies;
    this.ui = ui;

    this.bullets = [];
    this.speed = 20;

    this.cooldown = 0;

    this.material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x550000
    });

    window.addEventListener("click", () => this.shoot());
  }

  shoot() {
    if (this.cooldown > 0) return;

    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.15),
      this.material
    );

    b.position.copy(this.player.position);
    b.position.z -= 2;

    this.scene.add(b);
    this.bullets.push(b);

    this.cooldown = 0.15;
  }

  update(dt) {
    this.cooldown -= dt;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      b.position.z -= this.speed * dt;

      for (let j = this.zombies.zombies.length - 1; j >= 0; j--) {
        const z = this.zombies.zombies[j];

        if (b.position.distanceTo(z.position) < 1) {
          this.scene.remove(b);
          this.bullets.splice(i, 1);

          this.zombies.remove(j);
          this.ui.addScore(10);
          break;
        }
      }

      if (b.position.z < this.player.position.z - 100) {
        this.scene.remove(b);
        this.bullets.splice(i, 1);
      }
    }
  }
}
