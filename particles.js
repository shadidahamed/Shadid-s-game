export class ParticleSystem {
  constructor() { this.particles = []; }

  muzzle(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({x, y, vx: (Math.random()-0.5)*120, vy: -180, life: 0.15, color: '#ff0', size: 5});
    }
  }

  spark(x, y) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({x, y, vx: (Math.random()-0.5)*400, vy: (Math.random()-0.5)*300, life: 0.3, color: '#ff0', size: 3});
    }
  }

  explosion(x, y, count = 25) {
    for (let i = 0; i < count; i++) {
      this.particles.push({x, y, vx: (Math.random()-0.5)*280, vy: (Math.random()-0.5)*280 - 50, life: 0.7, color: '#f80', size: 6});
    }
  }

  update(dt) {
    for (let i = this.particles.length-1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.life * 1.8;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}