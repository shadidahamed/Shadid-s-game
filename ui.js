
export class UI {
  constructor() {
    this.score = 0;
    this.health = 100;
    this.gameOver = false;

    this.el = document.createElement("div");
    this.el.style.color = "red";
    document.body.appendChild(this.el);

    this.render();
  }

  addScore(v) {
    this.score += v;
    this.render();
  }

  damage(v) {
    this.health -= v;

    if (this.health <= 0) {
      this.gameOver = true;
      this.health = 0;

      const g = document.createElement("div");
      g.innerText = "SYSTEM FAILURE";
      g.style.position = "absolute";
      g.style.top = "50%";
      g.style.left = "50%";
      g.style.transform = "translate(-50%,-50%)";
      g.style.color = "red";
      g.style.fontSize = "40px";

      document.body.appendChild(g);
    }

    this.render();
  }

  render() {
    this.el.innerHTML = `SCORE: ${this.score} | HP: ${this.health}`;
  }
}
