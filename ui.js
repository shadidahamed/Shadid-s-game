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
      this.finalScoreEl.textContent = `FINAL SCORE: ${this.score.toString().padStart(5, '0')}`;
      this.gameOverScreen.style.display = 'block';
    }
    this.render();
  }

  render() {
    if (this.gameOver) return;
    this.hud.textContent = `SCORE: ${this.score.toString().padStart(5, '0')} | HP: ${Math.floor(this.health)}`;
  }
}