export class EnemySystem {
  constructor(player, ui, particles) {
    this.player = player;
    this.ui = ui;
    this.particles = particles;
    this.enemies = [];
    this.spawnTimer = 0;
    this.wave = 1;
  }

  spawn() {
    const count = 3 + Math.floor(this.wave / 2);
    for (let i = 0; i < count; i++) {
      this.enemies.push({
        x: 80 + Math.random() * 640,
        y: -40 - i * 60,
        speed: 140 + this.wave * 18,
        size: 32,
        health: 1 + Math.floor(this.wave / 4)
      });
    }
  }

  update(dt) {
    this.spawnTimer += dt;
    if (this.spawnTimer > 1.8 - this.wave * 0.08) {
      this.spawn();
      this.spawnTimer = 0;
      if (Math.random() < 0.3) this.wave++;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.speed * dt;

      if (e.y > 650) {
        this.enemies.splice(i, 1);
        this.ui.loseLife();
        continue;
      }

      // collision with player
      if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < 38) {
        this.ui.loseLife();
        this.particles.explosion(e.x, e.y);
        this.enemies.splice(i, 1);
      }
    }
  }

  hit(index, damage) {
    const e = this.enemies[index];
    e.health -= damage;
    if (e.health <= 0) {
      this.particles.explosion(e.x, e.y, 30);
      this.ui.addScore(100 + this.wave * 20);
      this.enemies.splice(index, 1);
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#f44';
    for (const e of this.enemies) {
      ctx.fillRect(e.x - e.size/2, e.y - e.size/2, e.size, e.size);
      ctx.fillStyle = '#ff0';
      ctx.fillRect(e.x - 8, e.y - 12, 6, 8);
      ctx.fillRect(e.x + 4, e.y - 12, 6, 8);
      ctx.fillStyle = '#f44';
    }
  }
}