export class ZombieSystem {
  constructor(character, ui, director) {
    this.character = character;
    this.ui = ui;
    this.director = director;
    this.zombies = [];
    this.timer = 0;
  }

  spawn() {
    const lane = Math.floor(Math.random() * 3);
    this.zombies.push({
      x: 120 + lane * 180,
      y: -40,
      size: 32,
      speed: this.director.zombieSpeed() + Math.random() * 30,
      health: 2 + Math.floor(this.director.wave / 5)
    });
  }

  remove(i) {
    this.zombies.splice(i, 1);
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > this.director.spawnRate()) {
      this.spawn();
      this.timer = 0;
    }

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      z.y += z.speed * dt;

      // hit player?
      if (Math.abs(z.x - this.character.x) < 35 && Math.abs(z.y - this.character.y) < 45) {
        this.ui.damage(18);
        this.remove(i);
        continue;
      }

      if (z.y > 700) this.remove(i);
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#2a0000';
    for (const z of this.zombies) {
      ctx.fillRect(z.x - z.size/2, z.y - z.size, z.size, z.size * 1.6);

      // eyes
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(z.x - 8, z.y - z.size * 0.6, 6, 8);
      ctx.fillRect(z.x + 4, z.y - z.size * 0.6, 6, 8);
      ctx.fillStyle = '#2a0000';
    }
  }
}