export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  muzzleFlash(x, y, level) {
    const count = 6 + level * 4;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 180,
        vy: -80 - Math.random() * 120,
        life: 0.12 + Math.random() * 0.08,
        color: level === 2 ? '#ff4444' : level === 1 ? '#ffff66' : '#88ffaa',
        size: 4 + Math.random() * 5
      });
    }
  }

  sparkBurst(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 300,
        vy: (Math.random() - 0.5) * 300 - 50,
        life: 0.25 + Math.random() * 0.2,
        color: '#ffffaa',
        size: 3
      });
    }
  }

  bloodBurst(x, y, amount = 20) {
    for (let i = 0; i < amount; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.8) * 180,
        life: 0.6 + Math.random() * 0.5,
        color: '#660000',
        size: 4 + Math.random() * 6
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt; // gravity
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0.1, p.life * 2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}