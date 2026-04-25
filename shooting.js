import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export class ShootingSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.bullets = [];
    this.bulletSpeed = 0.8;

    this.cooldown = 0;
    this.cooldownMax = 12; // fire rate control

    this._initInput();
    this._initBulletMaterial();
  }

  _initBulletMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x550000
    });
  }

  _initInput() {
    window.addEventListener('click', () => {
      this.shoot();
    });

    window.addEventListener('touchstart', () => {
      this.shoot();
    });
  }

  shoot() {
    if (this.cooldown > 0) return;

    const geometry = new THREE.SphereGeometry(0.15, 8, 8);
    const bullet = new THREE.Mesh(geometry, this.material);

    bullet.position.set(
      this.player.position.x,
      this.player.position.y,
      this.player.position.z - 2
    );

    this.scene.add(bullet);
    this.bullets.push(bullet);

    this.cooldown = this.cooldownMax;
  }

  update() {
    if (this.cooldown > 0) this.cooldown--;

    for (let i = 0; i < this.bullets.length; i++) {
      const b = this.bullets[i];

      b.position.z -= this.bulletSpeed;

      // cleanup far bullets
      if (b.position.z < this.player.position.z - 100) {
        this.scene.remove(b);
        this.bullets.splice(i, 1);
        i--;
      }
    }
  }
}
