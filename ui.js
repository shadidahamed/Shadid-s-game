export class UI {
  constructor() {
    this.score = 0;
    this.health = 100;
    this.gameOver = false;
    this.hud = document.getElementById('hud');
    this.gameOverScreen = document.getElementById('gameOver');
    this.finalScoreEl = document.getElementById('finalScore');
  }

  addScore(v) {
    this.score += v;
    this.render();
  }

  damage(v) {
    this.health = Math.max(0, this.health - v);
    if (this.health <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.finalScoreEl.textContent = this.score;
      this.gameOverScreen.style.display = 'block';
    }
    this.render();
  }

  render() {
    if (this.gameOver) return;
    this.hud.textContent = `SCORE: ${this.score} | HP: ${this.health}`;
  }
}