export class ShootingSystem {
  constructor(player, enemies, ui, fx, particles, audio) {
    this.player = player;
    this.enemies = enemies;
    this.ui = ui;
    this.fx = fx;
    this.particles = particles;
    this.audio = audio;
    this.bullets = [];
    this.autoFireInterval = null;
    this.fireRate = 80; // ms
  }

  startAutoFire() {
    if (this.autoFireInterval) return;
    this.shoot();
    this.autoFireInterval = setInterval(() => this.shoot(), this.fireRate);
  }

  stopAutoFire() {
    if (this.autoFireInterval) {
      clearInterval(this.autoFireInterval);
      this.autoFireInterval = null;
    }
  }

  shoot() {
    this.audio.playLaser();
    this.fx.burst(2);
    this.particles.muzzle(this.player.x, this.player.y - 35);

    this.bullets.push({
      x: this.player.x,
      y: this.player.y - 30,
      speed: 920
    });
  }

  update(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y -= b.speed * dt;
      if (b.y < -20) {
        this.bullets.splice(i, 1);
        continue;
      }

      for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies.enemies[j];
        if (Math.hypot(b.x - e.x, b.y - e.y) < 26) {
          this.enemies.hit(j, 1);
          this.particles.spark(b.x, b.y);
          this.bullets.splice(i, 1);
          break;
        }
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#0f0';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#0f0';
    for (const b of this.bullets) {
      ctx.fillRect(b.x - 4, b.y - 14, 8, 28);
    }
    ctx.shadowBlur = 0;
  }
}