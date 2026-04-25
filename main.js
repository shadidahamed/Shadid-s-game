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

    this.ui = new UI(10);
    this.fx = new FXSystem();
    this.particles = new ParticleSystem();
    this.audio = new AudioEngine();

    this.player = new Player(gameWidth / 2, gameHeight - 100);
    this.enemies = new EnemySystem(this.player, this.ui, this.particles);
    this.shooting = new ShootingSystem(this.player, this.enemies, this.ui, this.fx, this.particles, this.audio);

    this.isRunning = false;
    this.isPaused = false;
    this.touchMove = null;
    this.lastTime = performance.now();

    this.setupUIButtons();
    this.setupMobileControls();

    // Show start screen initially
    document.getElementById('startScreen').style.display = 'flex';
  }

  resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameWidth = 800;
    gameHeight = 600;
  }

  setupUIButtons() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restartBtn');
    const restartFromPauseBtn = document.getElementById('restartFromPauseBtn');

    startBtn.addEventListener('click', () => this.startGame());
    pauseBtn.addEventListener('click', () => this.togglePause());
    resumeBtn.addEventListener('click', () => this.togglePause());
    restartBtn.addEventListener('click', () => this.restartGame());
    restartFromPauseBtn.addEventListener('click', () => this.restartGame());
  }

  startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'block';
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop();
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    document.getElementById('pauseScreen').style.display = this.isPaused ? 'flex' : 'none';
    document.getElementById('pauseBtn').textContent = this.isPaused ? 'RESUME' : 'PAUSE';
  }

  restartGame() {
    location.reload(); // Clean full restart (simple & reliable on mobile)
  }

  setupMobileControls() {
    canvas.addEventListener('touchstart', (e) => {
      if (!this.isRunning || this.isPaused) return;
      e.preventDefault();

      for (let touch of e.changedTouches) {
        const x = (touch.clientX / canvas.clientWidth) * gameWidth;
        if (x < gameWidth / 2) {
          this.touchMove = { id: touch.identifier, startX: this.player.x, lastX: touch.clientX };
        } else {
          this.shooting.startAutoFire();
        }
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (!this.isRunning || this.isPaused) return;
      e.preventDefault();

      for (let touch of e.changedTouches) {
        if (this.touchMove && touch.identifier === this.touchMove.id) {
          const dx = (touch.clientX - this.touchMove.lastX) * (gameWidth / canvas.clientWidth) * 2.2;
          this.player.targetX = Math.max(40, Math.min(gameWidth - 40, this.player.targetX + dx));
          this.touchMove.lastX = touch.clientX;
        }
      }
    });

    canvas.addEventListener('touchend', (e) => {
      if (!this.isRunning || this.isPaused) return;
      e.preventDefault();

      for (let touch of e.changedTouches) {
        if (this.touchMove && touch.identifier === this.touchMove.id) {
          this.touchMove = null;
        } else {
          this.shooting.stopAutoFire();
        }
      }
    });
  }

  update(dt) {
    if (!this.isRunning || this.isPaused) return;

    this.player.update({}, dt);
    this.enemies.update(dt);
    this.shooting.update(dt);
    this.fx.update(dt);
    this.particles.update(dt);
  }

  draw() {
    ctx.fillStyle = '#000411';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width / gameWidth, canvas.height / gameHeight);
    const offsetX = (canvas.width - gameWidth * scale) / 2;
    const offsetY = (canvas.height - gameHeight * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Background stars
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
    if (!this.isRunning) return;

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1;

    this.update(dt);
    this.draw();

    // Screen shake
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