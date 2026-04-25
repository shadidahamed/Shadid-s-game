export class ZombieSystem {
  constructor(character, ui, director, particles) {
    this.character = character;
    this.ui = ui;
    this.director = director;
    this.particles = particles;
    this.zombies = [];
    this.spawnTimer = 0;
  }

  spawn() {
    const lane = Math.floor(Math.random() * 3);
    this.zombies.push({
      x: 115 + lane * 170,
      y: -50,
      size: 34,
      speed: this.director.zombieSpeed() + Math.random() * 40,
      health: 2 + Math.floor(this.director.wave * 0.6)
    });
  }

  update(dt) {
    this.spawnTimer += dt;
    if (this.spawnTimer > this.director.spawnRate()) {
      this.spawn();
      this.spawnTimer = 0;
    }

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      z.y += z.speed * dt;

      if (Math.hypot(z.x - this.character.x, z.y - this.character.y) < 42) {
        this.ui.damage(22);
        this.particles.bloodBurst(z.x, z.y);
        this.zombies.splice(i, 1);
        continue;
      }

      if (z.y > 700) this.zombies.splice(i, 1);
    }
  }

  hit(zIndex, damage) {
    const z = this.zombies[zIndex];
    if (!z) return;
    z.health -= damage;

    if (z.health <= 0) {
      this.particles.bloodBurst(z.x, z.y + 10, 25);
      this.ui.addScore(25 + Math.floor(this.director.wave * 3));
      this.zombies.splice(zIndex, 1);
    } else {
      this.particles.bloodBurst(z.x, z.y, 8);
    }
  }

  draw(ctx) {
    for (const z of this.zombies) {
      ctx.fillStyle = '#330000';
      ctx.fillRect(z.x - z.size/2, z.y - z.size * 0.9, z.size, z.size * 1.9);

      ctx.fillStyle = '#ff4444';
      ctx.fillRect(z.x - 10, z.y - z.size * 0.4, 7, 10);
      ctx.fillRect(z.x + 5, z.y - z.size * 0.4, 7, 10);
    }
  }
}