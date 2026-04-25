import { Player } from './player.js';
import { EnemySystem } from './enemies.js';
import { ShootingSystem } from './shooting.js';
import { ParticleSystem } from './particles.js';
import { FXSystem } from './fx.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

class Game {
  constructor() {
    this.ui = new UI();
    this.fx = new FXSystem();
    this.particles = new ParticleSystem();

    this.player = new Player(canvas.width / 2, canvas.height - 80);
    this.enemies = new EnemySystem(this.player, this.ui, this.particles);
    this.shooting = new ShootingSystem(this.player, this.enemies, this.ui, this.fx, this.particles);

    this.keys = {};
    this.setupControls();

    this.lastTime = performance.now();
    this.loop();
  }

  setupControls() {
    window.addEventListener('keydown', e => {
      this.keys[e.key.toLowerCase()] = true;
      if ((e.key === 'r' || e.key === 'R') && this.ui.gameOver) location.reload();
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.ui.gameOver) {
        const rect = canvas.getBoundingClientRect();
        this.player.targetX = e.clientX - rect.left;
      }
    });

    canvas.addEventListener('mousedown', () => {
      if (!this.ui.gameOver) this.shooting.shoot();
    });
  }

  update(dt) {
    if (this.ui.gameOver) return;

    this.player.update(this.keys, dt);
    this.enemies.update(dt);
    this.shooting.update(dt);
    this.fx.update(dt);
    this.particles.update(dt);
  }

  draw() {
    ctx.fillStyle = '#000411';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 80; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 23 + Date.now() * 0.01) % canvas.height;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    this.enemies.draw(ctx);
    this.player.draw(ctx);
    this.shooting.draw(ctx);
    this.particles.draw(ctx);
  }

  loop() {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1;

    this.update(dt);
    this.draw();

    if (this.fx.shake > 0.3) {
      ctx.save();
      ctx.translate((Math.random()-0.5)*this.fx.shake, (Math.random()-0.5)*this.fx.shake*0.5);
      this.draw();
      ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

new Game();