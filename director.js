export class Director {
  constructor() {
    this.wave = 0;
    this.timer = 0;
  }

  spawnRate() {
    return Math.max(0.28, 1.05 - this.wave * 0.045);
  }

  zombieSpeed() {
    return 210 + this.wave * 22;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > 10) {
      this.wave++;
      this.timer = 0;
    }
  }
}