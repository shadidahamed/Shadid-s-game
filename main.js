import { Character } from './character.js';
import { ZombieSystem } from './zombies.js';
import { ShootingSystem } from './shooting.js';
import { UI } from './ui.js';
import { FXSystem } from './fx.js';
import { Director } from './director.js';
import { AudioEngine } from './audio.js';
import { ParticleSystem } from './particles.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: true });

class Game {
  constructor() {
    this.canvas = canvas;
    this.ctx = ctx;

    this.ui = new UI();
    this.audio = new AudioEngine();
    this.fx = new FXSystem();
    this.particles = new ParticleSystem();
    this.director = new Director();

    this.character = new Character(this.canvas.width / 2, this.canvas.height - 90);
    
    this.zombies = new ZombieSystem(this.character, this.ui, this.director, this.particles);
    this.shooting = new ShootingSystem(this.character, this.zombies, this.ui, this.audio, this.fx, this.particles);

    this.keys = {};
    this.setupControls();

    this.lastTime = performance.now();
    this.gameOver = false;

    this.loop();
  }

  setupControls() {
    window.addEventListener('keydown', e => {
      this.keys[e.key.toLowerCase()] = true;

      if ((e.key === 'q' || e.key === 'Q') && !this.ui.gameOver) {
        this.character.cycleWeapon();
      }
      if ((e.key === 'r' || e.key === 'R') && this.ui.gameOver) {
        this.restart();
      }
      if (e.key === ' ' && !this.ui.gameOver) {
        this.shooting.shoot();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener('mousedown', () => {
      if (!this.ui.gameOver) this.shooting.shoot();
    });
  }

  restart() {
    location.reload(); // Clean restart for now (can be improved later)
  }

  update(dt) {
    if (this.ui.gameOver) return;

    this.character.update(this.keys, dt);
    this.zombies.update(dt);
    this.shooting.update(dt);
    this.director.update(dt);
    this.fx.update(dt);
    this.particles.update(dt);
  }

  draw() {
    // Background
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Road
    this.ctx.strokeStyle = '#1f1f1f';
    this.ctx.lineWidth = 6;
    for (let i = 1; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.canvas.width / 4, 0);
      this.ctx.lineTo(i * this.canvas.width / 4, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw order
    this.zombies.draw(this.ctx);
    this.character.draw(this.ctx);
    this.shooting.draw(this.ctx);
    this.particles.draw(this.ctx);
    this.fx.draw(this.ctx); // shake is handled in main draw
  }

  loop() {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1;

    this.update(dt);
    this.draw();

    // Apply screen shake
    if (this.fx.shake > 0.3) {
      this.ctx.save();
      this.ctx.translate(
        (Math.random() - 0.5) * this.fx.shake,
        (Math.random() - 0.5) * this.fx.shake * 0.6
      );
      this.draw(); // redraw with shake offset (simple but effective)
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

new Game();