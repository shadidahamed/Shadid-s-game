export class UI {
  
  constructor() {
    this.score = 0;
    this.health = 100;
    this.gameOver = false;

    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.el.style.top = '10px';
    this.el.style.right = '10px';
    this.el.style.color = 'red';
    document.body.appendChild(this.el);

    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.innerText = 'GAME OVER';
    this.gameOverScreen.style.display = 'none';
    this.gameOverScreen.style.position = 'absolute';
    this.gameOverScreen.style.top = '50%';
    this.gameOverScreen.style.left = '50%';
    this.gameOverScreen.style.transform = 'translate(-50%, -50%)';
    this.gameOverScreen.style.fontSize = '40px';
    this.gameOverScreen.style.color = 'red';

    document.body.appendChild(this.gameOverScreen);

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
      this.gameOverScreen.style.display = 'block';
    }

    this.render();
  }

  render() {
    this.el.innerHTML = `SCORE: ${this.score} | HP: ${this.health}`;
  }
}
