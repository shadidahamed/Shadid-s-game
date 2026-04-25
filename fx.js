export class FXSystem {
  constructor() {
    this.shake = 0;
    this.shakeTime = 0;
  }

  burst() {
    this.shake = 3;
  }

  hit() {
    this.shake = 6;
  }

  update(dt) {
    if (this.shake > 0) {
      this.shake *= 0.82;
    }
  }

  draw(ctx) {
    if (this.shake > 0.5) {
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * this.shake,
        (Math.random() - 0.5) * this.shake
      );
      ctx.restore(); // actually applied in main loop by translating whole context if you want, but simple version is fine
    }
  }
}