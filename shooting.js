import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class ShootingSystem {
  constructor(scene, character, zombies, ui, audio, recoil, fx) {
    this.scene = scene;
    this.character = character;
    this.zombies = zombies;
    this.ui = ui;
    this.audio = audio;
    this.recoil = recoil;
    this.fx = fx;

    this.bullets = [];
    this.speed = 30;

    this.mat = new THREE.MeshStandardMaterial({ color: 0xff2a2a });

    window.addEventListener("click", () => this.shoot());
  }

  shoot() {
    if (!this.character.canShoot()) return;

    const data = this.character.shoot();

    this.audio.playShot();
    this.recoil.kick(0.25);
    this.fx.burst();

    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.12),
      this.mat
    );

    b.position.copy(data.position);

    this.scene.add(b);
    this.bullets.push(b);
  }

  update(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      b.position.z -= this.speed * dt;

      if (b.position.z < this.character.position.z - 50) {
        this.scene.remove(b);
        this.bullets.splice(i, 1);
        continue;
      }

      for (let j = this.zombies.zombies.length - 1; j >= 0; j--) {
        const z = this.zombies.zombies[j];

        if (b.position.distanceTo(z.position) < 1) {
          this.scene.remove(b);
          this.bullets.splice(i, 1);

          this.zombies.remove(j);
          this.ui.addScore(10);

          this.audio.playHit();
          this.fx.hit();
          break;
        }
      }
    }
  }
}
