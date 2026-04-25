export class Director {
  constructor() {
    this.wave = 0;
    this.timer = 0;
  }

  spawnRate() {
    return Math.max(0.35, 1.1 - this.wave * 0.04);
  }

  zombieSpeed() {
    return 220 + this.wave * 18;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > 12) {
      this.wave++;
      this.timer = 0;
    }
  }
}