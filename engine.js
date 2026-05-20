/* ORPHEUS ENGINE — CORE ENGINE (engine.js)
   Cinematic Backrooms Horror Core Runtime
*/

const Engine = {
  scene: null,
  camera: null,
  renderer: null,
  clock: null,

  world: null,
  dynamic: null,

  isRunning: false,

  // Camera FX
  cameraShake: 0,
  cameraTilt: 0,
  fovTarget: 50,

  // Lighting refs
  flashlight: null,

  init() {
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initWorld();
    this.initLighting();

    this.clock = new THREE.Clock();

    window.addEventListener("resize", () => this.onResize());

    this.animate();
  },

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05070c, 0.03);

    this.world = new THREE.Group();
    this.dynamic = new THREE.Group();

    this.scene.add(this.world);
    this.scene.add(this.dynamic);
  },

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    document.getElementById("viewport-container").appendChild(this.renderer.domElement);
  },

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 3, 8);
  },

  initWorld() {
    const ambient = new THREE.AmbientLight(0x1a1f2a, 0.6);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xc4a267, 0.8);
    dir.position.set(20, 40, 10);
    dir.castShadow = true;
    this.scene.add(dir);

    // subtle base floor fog atmosphere
    this.scene.background = new THREE.Color(0x05070c);
  },

  initLighting() {
    // Flashlight (volumetric illusion)
    this.flashlight = new THREE.SpotLight(
      0xffffff,
      2.2,
      40,
      Math.PI / 6,
      0.4,
      1.2
    );

    this.flashlight.castShadow = true;
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);
    this.scene.add(this.camera);
  },

  updateCameraFX(delta) {
    // CAMERA SHAKE (trauma system)
    if (this.cameraShake > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= 0.92;
    }

    // BREATHING MOTION
    const t = this.clock.elapsedTime;
    this.camera.position.y += Math.sin(t * 1.5) * 0.002;

    // FOV smoothing
    this.camera.fov += (this.fovTarget - this.camera.fov) * 5 * delta;
    this.camera.updateProjectionMatrix();
  },

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    if (this.isRunning) {
      if (window.Player?.update) Player.update(delta);
      if (window.AI?.update) AI.update(delta);
      if (window.WorldGen?.update) WorldGen.update(delta);
      if (window.Events?.update) Events.update(delta);
      if (window.AudioSys?.update) AudioSys.update(delta);
    }

    this.updateCameraFX(delta);

    this.renderer.render(this.scene, this.camera);
  },

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  addTrauma(amount) {
    this.cameraShake = Math.min(0.8, this.cameraShake + amount);
  },

  setFOV(target) {
    this.fovTarget = target;
  },

  start() {
    this.isRunning = true;
  }
};

window.Engine = Engine;

window.addEventListener("load", () => {
  Engine.init();
});
