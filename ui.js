export class UI {
  constructor() {
    this.score = 0;
    this.health = 100;
    this.gameOver = false;

    this.el = document.createElement("div");
    this.el.style.position = "absolute";
    this.el.style.top = "10px";
    this.el.style.right = "10px";
    this.el.style.color = "red";
    document.body.appendChild(this.el);

    this.render();
  }

  addScore(v) {
    if (this.gameOver) return;
    this.score += v;
    this.render();
  }

  damage(v) {
    if (this.gameOver) return;

    this.health -= v;

    if (this.health <= 0) {
      this.health = 0;
      this.gameOver = true;
      this._gameOver();
    }

    this.render();
  }

  _gameOver() {
    const g = document.createElement("div");
    g.innerText = "GAME OVER";
    g.style.position = "absolute";
    g.style.top = "50%";
    g.style.left = "50%";
    g.style.transform = "translate(-50%,-50%)";
    g.style.color = "red";
    g.style.fontSize = "50px";

    document.body.appendChild(g);
  }

  render() {
    this.el.innerHTML = `SCORE: ${this.score} | HP: ${this.health}`;
  }
}
