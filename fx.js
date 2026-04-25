export class FXSystem {
  constructor(scene, camera) {
    this.camera = camera;
    this.shake = 0;

    this.overlay = document.createElement("div");
    this.overlay.style.position = "absolute";
    this.overlay.style.width = "100%";
    this.overlay.style.height = "100%";
    this.overlay.style.background = "radial-gradient(circle, transparent 25%, black)";
    this.overlay.style.opacity = "0.6";

    document.body.appendChild(this.overlay);
  }

  update(dt, character, ui) {
    this.shake *= 0.9;

    this.camera.position.x += (Math.random() - 0.5) * this.shake;
    this.camera.position.y += (Math.random() - 0.5) * this.shake;

    this.overlay.style.opacity = 0.3 + (1 - ui.health / 100) * 0.6;
  }
}
