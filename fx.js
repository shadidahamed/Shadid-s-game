export class FXSystem {
  constructor() { this.shake = 0; }
  burst(v = 4) { this.shake = Math.max(this.shake, v); }
  update(dt) { this.shake *= 0.85; }
}