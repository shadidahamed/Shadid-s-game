export class RecoilSystem {
  constructor(camera) {
    this.camera = camera;
    this.intensity = 0;
  }

  kick(v) {
    this.intensity = v;
  }

  update(dt) {
    this.intensity *= 0.9;
    this.camera.position.x += (Math.random() - 0.5) * this.intensity;
  }
}
