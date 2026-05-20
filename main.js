window.Game = {
  Engine: null,
  Player: null,
  AI: null,
  Audio: null,
  Lighting: null,
  Events: null,
  UI: null
};

/* ORPHEUS ENGINE — MAIN BOOTSTRAP (AAA+ PATCH) */

window.Engine = {
  scene: null,
  camera: null,
  renderer: null,
  clock: new THREE.Clock(),

  trauma: 0,
  player: null,
  fovTarget: 60,

  init(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    Player.init?.();
    Input.init?.();

    LightingSys.init?.();
    AudioSys.init?.();
    WorldGen.init?.(40);
    Events.init?.();
    UI.init?.();

    this.loop();
  },

  loop() {
    requestAnimationFrame(() => this.loop());

    const delta = this.clock.getDelta();

    // CORE UPDATES
    Player.update(delta);
    AI.update(delta);
    AudioSys.update(delta);
    LightingSys.update(delta);
    Events.update(delta);
    UI.update(delta);

    // TRAUMA decay (cinematic stabilization)
    this.trauma *= 0.92;

    // CAMERA FOV smoothing
    this.camera.fov += (this.fovTarget - this.camera.fov) * 0.08;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  },

  addTrauma(v) {
    this.trauma = Math.min(1, this.trauma + v);
  },

  setFOV(v) {
    this.fovTarget = v;
  }
};
