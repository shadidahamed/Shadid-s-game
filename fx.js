export class FXSystem {
  constructor() {
    this.shake = 0;
  }

  burst(amount = 3) {
    this.shake = Math.max(this.shake, amount);
  }

  hit() {
    this.shake = Math.max(this.shake, 7);
  }

  update(dt) {
    this.shake *= 0.84;
    if (this.shake < 0.2) this.shake = 0;
  }

  draw(ctx) {
    // Shake is applied in main.js loop
  }
}