import { Character } from './character.js';
import { ZombieSystem } from './zombies.js';
import { ShootingSystem } from './shooting.js';
import { UI } from './ui.js';
import { FXSystem } from './fx.js';
import { Director } from './director.js';
import { AudioEngine } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

class Game {
  constructor() {
    this.clock = { dt: 0, last: performance.now() };

    this.ui = new UI();
    this.character = new Character(canvas.width / 2, canvas.height - 80);
    this.director = new Director();
    this.zombies = new ZombieSystem(this.character, this.ui, this.director);
    this.fx = new FXSystem();
    this.audio = new AudioEngine();

    this.shooting = new ShootingSystem(
      this.character,
      this.zombies,
      this.ui,
      this.audio,
      this.fx
    );

    this.keys = {};
    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      if (e.key === 'q' || e.key === 'Q') this.character.cycleWeapon();
      if ((e.key === 'r' || e.key === 'R') && this.ui.gameOver) this.restart();
    });
    window.addEventListener('keyup', e => this.keys[e.key] = false);

    canvas.addEventListener('click', () => this.shooting.shoot());
    window.addEventListener('keypress', e => {
      if (e.key === ' ') this.shooting.shoot();
    });

    this.loop();
  }

  restart() {
    document.getElementById('gameOver').style.display = 'none';
    location.reload(); // simple restart (you can make it cleaner later)
  }

  loop() {
    requestAnimationFrame(() => this.loop());

    const now = performance.now();
    this.clock.dt = Math.min((now - this.clock.last) / 1000, 0.1);
    this.clock.last = now;

    if (!this.ui.gameOver) {
      this.character.update(this.keys, this.clock.dt);
      this.zombies.update(this.clock.dt);
      this.shooting.update(this.clock.dt);
      this.director.update(this.clock.dt);
    }

    this.fx.update(this.clock.dt);

    // Draw everything
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // faint road lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * canvas.width / 4, 0);
      ctx.lineTo(i * canvas.width / 4, canvas.height);
      ctx.stroke();
    }

    this.zombies.draw(ctx);
    this.character.draw(ctx);
    this.shooting.draw(ctx);
    this.fx.draw(ctx);

    this.ui.render();
  }
}

// Start the game
new Game();