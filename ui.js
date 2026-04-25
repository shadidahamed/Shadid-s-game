export class UI {
  constructor() {
    this.score = 0;

    this.scoreElement = document.createElement('div');
    this.scoreElement.style.position = 'absolute';
    this.scoreElement.style.top = '10px';
    this.scoreElement.style.right = '10px';
    this.scoreElement.style.color = 'red';
    this.scoreElement.style.fontSize = '20px';
    this.scoreElement.style.textShadow = '0 0 10px red';

    document.body.appendChild(this.scoreElement);

    this.update();
  }

  addScore(value) {
    this.score += value;
    this.update();
  }

  update() {
    this.scoreElement.innerText = `SCORE: ${this.score}`;
  }
}
