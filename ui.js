export class UI {
  constructor() {
    this.score = 0;
    this.lives = 10;
    this.gameOver = false;
    this.hud = document.getElementById('hud');
    this.gameOverScreen = document.getElementById('gameOver');
    this.finalScoreEl = document.getElementById('finalScore');
  }

  addScore(v) {
    this.score += v;
    this.render();
  }

  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver = true;
      this.finalScoreEl.textContent = `FINAL SCORE: ${this.score}`;
      this.gameOverScreen.style.display = 'block';
    }
    this.render();
  }

  render() {
    if (this.gameOver) return;
    this.hud.textContent = `SCORE: ${this.score.toString().padStart(5,'0')} | LIVES: ${this.lives}`;
  }
}