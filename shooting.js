export class ShootingSystem {
  constructor(character, zombies, ui, audio, fx, particles) {
    this.character = character;
    this.zombies = zombies;
    this.ui = ui;
    this.audio = audio;
    this.fx = fx;
    this.particles = particles;
    this.bullets = [];
  }

  shoot() {
    const data = this.character.shoot();
    if (!data) return;

    this.audio.playShot();
    this.fx.burst(4);

    this.particles.muzzleFlash(this.character.x, this.character.y - 45, data.level);

    this.bullets.push({
      x: data.x,
      y: data.y,
      speed: data.speed,
      power: data.power,
      radius: 7 + data.level * 1.5
    });
  }

  update(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y -= b.speed * dt;

      if (b.y < -30) {
        this.bullets.splice(i, 1);
        continue;
      }

      for (let j = this.zombies.zombies.length - 1; j >= 0; j--) {
        const z = this.zombies.zombies[j];
        if (Math.hypot(b.x - z.x, b.y - z.y) < 30) {
          this.zombies.hit(j, b.power);
          this.particles.sparkBurst(b.x, b.y);
          this.bullets.splice(i, 1);
          this.audio.playHit();
          this.fx.hit();
          break;
        }
      }
    }
  }

  draw(ctx) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff5555';
    ctx.fillStyle = '#ff2a2a';

    for (const b of this.bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      ctx.globalAlpha = 0.5;
      ctx.fillRect(b.x - 4, b.y + 10, 8, 25);
      ctx.globalAlpha = 1;
    }
    ctx.shadowBlur = 0;
  }
}