export class FXSystem {
  constructor(camera) {
    this.camera = camera;
    this.shake = 0;
  }

  burst() {
    this.shake = 0.6;
  }

  hit() {
    this.shake = 0.9;
  }

  update(dt, ui) {
    this.shake *= 0.85;

    this.camera.position.x += (Math.random() - 0.5) * this.shake;
    this.camera.position.y += (Math.random() - 0.5) * this.shake;
  }
}
