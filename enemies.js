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
    // Fewer enemies per spawn for better balance
    const count = 2 + Math.floor(this.wave / 4); // starts with 2, grows slowly
    for (let i = 0; i < count; i++) {
      this.enemies.push({
        x: 60 + Math.random() * 680,
        y: -50 - i * 70,
        speed: 140 + this.wave * 12,   // slower ramp
        size: 34,
        health: 1 + Math.floor(this.wave / 5),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt) {
    this.spawnTimer += dt;

    // Slower spawn rate early on (more breathing room)
    const spawnInterval = Math.max(1.1, 2.2 - this.wave * 0.08);

    if (this.spawnTimer > spawnInterval) {
      this.spawn();
      this.spawnTimer = 0;

      // Gradual wave increase
      if (Math.random() < 0.35) this.wave++;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.speed * dt;
      e.phase += dt * 8;

      if (e.y > 650) {
        this.enemies.splice(i, 1);
        this.ui.loseLife();
        continue;
      }

      // Collision with player
      if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < 40) {
        this.ui.loseLife();
        this.particles.explosion(e.x, e.y);
        this.enemies.splice(i, 1);
      }
    }
  }

  hit(index, damage) {
    const e = this.enemies[index];
    if (!e) return;
    e.health -= damage;
    if (e.health <= 0) {
      this.particles.explosion(e.x, e.y, 35);
      this.ui.addScore(120 + this.wave * 25);
      this.enemies.splice(index, 1);
    }
  }

  draw(ctx) {
    for (const e of this.enemies) {
      const pulse = Math.sin(e.phase) * 3;

      ctx.fillStyle = '#f33';
      ctx.fillRect(e.x - e.size/2, e.y - e.size/2 + pulse, e.size, e.size);

      // Glowing eyes
      ctx.fillStyle = '#ff0';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff0';
      ctx.fillRect(e.x - 11, e.y - 10, 7, 9);
      ctx.fillRect(e.x + 6, e.y - 10, 7, 9);
      ctx.shadowBlur = 0;
    }
  }
}