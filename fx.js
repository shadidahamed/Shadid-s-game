export class FXSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.time = 0;

    this.shakeIntensity = 0;
    this.shakeDecay = 5;

    this._setupFog();
    this._setupScreenOverlay();
    this._setupAudio();
  }

  _setupFog() {
    this.scene.fog.density = 0.02;
  }

  _setupScreenOverlay() {
    this.overlay = document.createElement("div");

    Object.assign(this.overlay.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8))",
      opacity: 0.6
    });

    document.body.appendChild(this.overlay);
  }

  _setupAudio() {
    this.heartbeat = new Audio();
    this.heartbeat.src = "https://cdn.pixabay.com/audio/2022/10/16/audio_2a6f1b4f6f.mp3";
    this.heartbeat.loop = true;
    this.heartbeat.volume = 0.2;

    this.heartbeat.play().catch(() => {});
  }

  addShake(amount) {
    this.shakeIntensity += amount;
  }

  update(dt, player, ui) {
    this.time += dt;

    // Fog breathing effect (horror tension cycle)
    this.scene.fog.density = 0.015 + Math.sin(this.time * 0.5) * 0.005;

    // Screen pulse based on HP
    this.overlay.style.opacity = 0.4 + (1 - ui.health / 100) * 0.5;

    // Camera shake decay
    this.shakeIntensity *= Math.exp(-this.shakeDecay * dt);

    const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
    const shakeY = (Math.random() - 0.5) * this.shakeIntensity;

    this.camera.position.x += shakeX;
    this.camera.position.y += shakeY;
  }
}
