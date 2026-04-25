import { Player } from './player.js';
import { EnemySystem } from './enemies.js';
import { ShootingSystem } from './shooting.js';
import { ParticleSystem } from './particles.js';
import { FXSystem } from './fx.js';
import { UI } from './ui.js';
import { AudioEngine } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let gameWidth = 800, gameHeight = 600;

class Game {
  constructor() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.ui = new UI(10);
    this.fx = new FXSystem();
    this.particles = new ParticleSystem();
    this.audio = new AudioEngine();

    this.player = new Player(gameWidth/2, gameHeight-110);
    this.enemies = new EnemySystem(this.player, this.ui, this.particles);
    this.shooting = new ShootingSystem(this.player, this.enemies, this.ui, this.fx, this.particles, this.audio);

    this.isRunning = false;
    this.isPaused = false;
    this.isTouching = false;
    this.lastTime = performance.now();
    this.highScore = parseInt(localStorage.getItem('voidBlastHS')) || 0;

    this.updateHighScoreDisplay();
    this.setupButtons();
    this.setupOneFingerControls();

    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('startHighScore').textContent = `HIGH SCORE: ${this.highScore.toString().padStart(5,'0')}`;
  }

  resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  setupButtons() {
    document.getElementById('startBtn').onclick = () => this.start();
    document.getElementById('pauseBtn').onclick = () => this.togglePause();
    document.getElementById('resumeBtn').onclick = () => this.togglePause();
    document.getElementById('restartBtn').onclick = () => location.reload();
    document.getElementById('restartFromPauseBtn').onclick = () => location.reload();
  }

  start() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'block';
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    document.getElementById('pauseScreen').style.display = this.isPaused ? 'flex' : 'none';
    document.getElementById('pauseBtn').textContent = this.isPaused ? 'RESUME' : 'PAUSE';
  }

  gameOver() {
    this.isRunning = false;
    document.getElementById('pauseBtn').style.display = 'none';

    const final = this.ui.score;
    const isNew = final > this.highScore;
    if (isNew) {
      this.highScore = final;
      localStorage.setItem('voidBlastHS', final);
      this.updateHighScoreDisplay();
    }

    document.getElementById('finalScore').textContent = `FINAL SCORE: ${final.toString().padStart(5,'0')}`;
    document.getElementById('newHighScore').style.display = isNew ? 'block' : 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
  }

  updateHighScoreDisplay() {
    document.getElementById('highScore').textContent = `HI: ${this.highScore.toString().padStart(5,'0')}`;
  }

  setupOneFingerControls() {
    canvas.addEventListener('touchstart', e => {
      if (!this.isRunning || this.isPaused) return;
      e.preventDefault();
      this.isTouching = true;
      this.handleTouch(e.changedTouches[0]);
      this.shooting.startAutoFire();
    });

    canvas.addEventListener('touchmove', e => {
      if (!this.isRunning || this.isPaused || !this.isTouching) return;
      e.preventDefault();
      this.handleTouch(e.changedTouches[0]);
    });

    canvas.addEventListener('touchend', e => {
      if (!this.isRunning || this.isPaused) return;
      e.preventDefault();
      this.isTouching = false;
      this.shooting.stopAutoFire();
    });
  }

  handleTouch(touch) {
    const rect = canvas.getBoundingClientRect();
    const touchX = ((touch.clientX - rect.left) / rect.width) * gameWidth;
    this.player.targetX = Math.max(40, Math.min(gameWidth - 40, touchX));
  }

  update(dt) {
    if (!this.isRunning || this.isPaused) return;

    this.player.update({}, dt);           // smooth follow
    this.enemies.update(dt);
    this.shooting.update(dt);
    this.fx.update(dt);
    this.particles.update(dt);

    if (this.ui.gameOver) this.gameOver();
  }

  draw() {
    ctx.fillStyle = '#000411';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width / gameWidth, canvas.height / gameHeight);
    const ox = (canvas.width - gameWidth * scale) / 2;
    const oy = (canvas.height - gameHeight * scale) / 2;

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    // Background stars (fast & juicy)
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 120; i++) {
      const x = (i * 37 % gameWidth);
      const y = (i * 29 + Date.now() * 0.022) % gameHeight;
      ctx.globalAlpha = 0.5 + Math.sin(i + Date.now()/300) * 0.5;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;

    this.enemies.draw(ctx);
    this.player.draw(ctx);
    this.shooting.draw(ctx);
    this.particles.draw(ctx);

    ctx.restore();
  }

  loop() {
    if (!this.isRunning) return;
    const now = performance.now();
    let dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(dt);
    this.draw();

    if (this.fx.shake > 0.2) {
      ctx.save();
      ctx.translate((Math.random()-0.5)*this.fx.shake * 1.2, (Math.random()-0.5)*this.fx.shake*0.7);
      this.draw();
      ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

new Game();