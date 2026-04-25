export class UI {
  constructor() {
    this.score = 0;
    this.health = 100;
    this.gameOver = false;

    this.el = document.getElementById("hud");
    this.render();
  }

  addScore(v) {
    this.score += v;
    this.render();
  }

  damage(v) {
    this.health -= v;

    if (this.health <= 0) {
      this.health = 0;
      this.gameOver = true;

      this.el.innerHTML = "SYSTEM FAILURE // ENTITY LOST";
    }

    this.render();
  }

  render() {
    if (!this.gameOver) {
      this.el.innerHTML = `SCORE:${this.score} | HP:${this.health}`;
    }
  }
}
