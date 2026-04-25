import { Player } from './player.js';
import { EnemySystem } from './enemies.js';
import { ShootingSystem } from './shooting.js';
import { ParticleSystem } from './particles.js';
import { FXSystem } from './fx.js';
import { UI } from './ui.js';
import { AudioEngine } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let gameWidth = 800;
let gameHeight = 600;

class Game {
  constructor() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.ui = new UI(10); // 10 lives
    this.fx = new FXSystem();
    this.particles = new ParticleSystem();
    this.audio = new AudioEngine();

    this.player = new Player(gameWidth / 2, gameHeight - 100);
    this.enemies = new EnemySystem(this.player, this.ui, this.particles);
    this.shooting = new ShootingSystem(this.player, this.enemies, this.ui, this.fx, this.particles, this.audio);

    this.keys = {};
    this.touchMove = null;   // left side drag
    this.isFiring = false;   // right side tap/hold

    this.setupMobileControls();
    this.lastTime = performance.now();
    this.loop();
  }

  resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Keep logical game resolution for drawing (scales automatically)
    gameWidth = 800;
    gameHeight = 600;
  }

  setupMobileControls() {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        const x = (touch.clientX / canvas.clientWidth) * gameWidth;
        if (x < gameWidth / 2) {
          this.touchMove = { id: touch.identifier, x: touch.clientX, startX: this.player.x };
        } else {
          this.isFiring = true;
          this.shooting.startAutoFire();
        }
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        if (this.touchMove && touch.identifier === this.touchMove.id) {
          const dx = (touch.clientX - this.touchMove.x) * (gameWidth / canvas.clientWidth) * 1.8;
          this.player.targetX = Math.max(40, Math.min(gameWidth - 40, this.touchMove.startX + dx));
        }
      }
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        if (this.touchMove && touch.identifier === this.touchMove.id) {
          this.touchMove = null;
        } else {
          this.isFiring = false;
          this.shooting.stopAutoFire();
        }
      }
    });

    // Tap to restart on game over
    canvas.addEventListener('touchstart', () => {
      if (this.ui.gameOver) location.reload();
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

    // Scale drawing to fit screen while keeping aspect
    const scale = Math.min(canvas.width / gameWidth, canvas.height / gameHeight);
    const offsetX = (canvas.width - gameWidth * scale) / 2;
    const offsetY = (canvas.height - gameHeight * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37 % gameWidth);
      const y = (i * 29 + Date.now() * 0.012) % gameHeight;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    this.enemies.draw(ctx);
    this.player.draw(ctx);
    this.shooting.draw(ctx);
    this.particles.draw(ctx);

    ctx.restore();
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
      ctx.translate((Math.random() - 0.5) * this.fx.shake, (Math.random() - 0.5) * this.fx.shake * 0.5);
      this.draw();
      ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

new Game();