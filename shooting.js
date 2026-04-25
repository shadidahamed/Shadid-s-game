export class ShootingSystem {
  constructor(character, zombies, ui, audio, fx) {
    this.character = character;
    this.zombies = zombies;
    this.ui = ui;
    this.audio = audio;
    this.fx = fx;
    this.bullets = [];
  }

  shoot() {
    const data = this.character.shoot();
    if (!data) return;

    this.audio.playShot();
    this.fx.burst();

    this.bullets.push({
      x: data.x,
      y: data.y,
      speed: data.speed,
      power: data.power,
      radius: 6
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

      for (let j = this.zombies.zombies.length - 1; j >= 0; j--) {
        const z = this.zombies.zombies[j];
        if (Math.hypot(b.x - z.x, b.y - z.y) < 28) {
          z.health -= b.power;
          this.bullets.splice(i, 1);

          if (z.health <= 0) {
            this.zombies.remove(j);
            this.ui.addScore(20 + Math.floor(this.zombies.director?.wave || 0) * 2);
            this.audio.playHit();
            this.fx.hit();
          } else {
            this.audio.playHit(); // light hit sound
          }
          break;
        }
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#ff2a2a';
    for (const b of this.bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // trail
      ctx.globalAlpha = 0.4;
      ctx.fillRect(b.x - 3, b.y + 8, 6, 18);
      ctx.globalAlpha = 1;
    }
  }
}