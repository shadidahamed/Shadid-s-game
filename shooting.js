export class ShootingSystem {
  constructor(player, enemies, ui, fx, particles) {
    this.player = player;
    this.enemies = enemies;
    this.ui = ui;
    this.fx = fx;
    this.particles = particles;
    this.bullets = [];
    this.fireRate = 0.12;
    this.lastShot = 0;
  }

  shoot() {
    const now = performance.now();
    if (now - this.lastShot < this.fireRate * 1000) return;

    this.lastShot = now;
    this.fx.burst(2);
    this.particles.muzzle(this.player.x, this.player.y - 30);

    this.bullets.push({
      x: this.player.x,
      y: this.player.y - 25,
      speed: 850
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
        if (Math.hypot(b.x - e.x, b.y - e.y) < 24) {
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
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#0f0';
    for (const b of this.bullets) {
      ctx.fillRect(b.x - 3, b.y - 12, 6, 22);
    }
    ctx.shadowBlur = 0;
  }
}