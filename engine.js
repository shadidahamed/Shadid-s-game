/* ORPHEUS ENGINE — CORE ENGINE (engine.js)
   AAA+ CINEMATIC HORROR CORE
*/

const Engine = {
  scene: null,
  camera: null,
  renderer: null,
  clock: null,

  world: null,
  dynamic: null,

  gameState: "MENU", // MENU / PLAYING / PAUSED / DEAD
  isRunning: false,

  // Camera FX
  cameraShake: 0,
  cameraTilt: 0,
  fovTarget: 50,

  // Camera motion
  baseCameraY: 3,
  breathingOffset: 0,

  // Lighting
  flashlight: null,

  init() {
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initWorld();
    this.initLighting();

    this.clock = new THREE.Clock();

    window.addEventListener("resize", () => this.onResize());

    console.log("ORPHEUS ENGINE INITIALIZED");
    this.animate();
  },

  /* ---------------- SCENE ---------------- */

  initScene() {
    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color(0x05070c);
    this.scene.fog = new THREE.FogExp2(0x05070c, 0.03);

    this.world = new THREE.Group();
    this.dynamic = new THREE.Group();

    this.scene.add(this.world);
    this.scene.add(this.dynamic);
  },

  /* ---------------- RENDERER ---------------- */

  initRenderer() {
    const container = document.getElementById("viewport-container");

    if (!container) {
      console.error("viewport-container missing");
      return;
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // prevent duplicate canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    container.appendChild(this.renderer.domElement);
  },

  /* ---------------- CAMERA ---------------- */

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, this.baseCameraY, 8);

    this.scene.add(this.camera);
  },

  /* ---------------- WORLD ---------------- */

  initWorld() {
    const ambient = new THREE.AmbientLight(0x1a1f2a, 0.55);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xc4a267, 0.8);

    dir.position.set(20, 40, 10);

    dir.castShadow = true;

    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;

    this.scene.add(dir);
  },

  /* ---------------- FLASHLIGHT ---------------- */

  initLighting() {
    this.flashlight = new THREE.SpotLight(
      0xffffff,
      2.4,
      45,
      Math.PI / 7,
      0.45,
      1.4
    );

    this.flashlight.castShadow = true;

    this.flashlight.position.set(0, 0, 0);

    this.flashlight.target.position.set(0, 0, -10);

    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);
  },

  /* ---------------- START GAME ---------------- */

  start() {
    console.log("GAME STARTED");

    this.gameState = "PLAYING";
    this.isRunning = true;

    // Generate world if available
    if (window.WorldGen?.generate) {
      WorldGen.generate();
    }

    // Start UI
    if (window.UI?.showMessage) {
      UI.showMessage("ENTER THE BACKROOMS", 3);
    }
  },

  /* ---------------- CAMERA FX ---------------- */

  updateCameraFX(delta) {
    const t = this.clock.elapsedTime;

    // Breathing motion
    this.breathingOffset =
      Math.sin(t * 1.5) * 0.03;

    this.camera.position.y =
      this.baseCameraY + this.breathingOffset;

    // Trauma shake
    if (this.cameraShake > 0.001) {
      this.camera.position.x +=
        (Math.random() - 0.5) * this.cameraShake;

      this.camera.position.y +=
        (Math.random() - 0.5) * this.cameraShake;

      this.camera.position.z +=
        (Math.random() - 0.5) * this.cameraShake;

      this.cameraShake *= 0.9;
    }

    // Camera tilt smoothing
    this.camera.rotation.z +=
      (this.cameraTilt - this.camera.rotation.z) *
      4 *
      delta;

    // FOV smoothing
    this.camera.fov +=
      (this.fovTarget - this.camera.fov) *
      4 *
      delta;

    this.camera.updateProjectionMatrix();
  },

  /* ---------------- MAIN LOOP ---------------- */

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.clock) return;

    const delta = this.clock.getDelta();

    if (this.isRunning && this.gameState === "PLAYING") {

      // UPDATE ORDER MATTERS

      if (window.Player?.update) {
        Player.update(delta);
      }

      if (window.AI?.update) {
        AI.update(delta);
      }

      if (window.WorldGen?.update) {
        WorldGen.update(delta);
      }

      if (window.Events?.update) {
        Events.update(delta);
      }

      if (window.AudioSys?.update) {
        AudioSys.update(delta);
      }

      if (window.UI?.update) {
        UI.update(delta);
      }
    }

    this.updateCameraFX(delta);

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  },

  /* ---------------- UTILITIES ---------------- */

  addTrauma(amount) {
    this.cameraShake = Math.min(
      1,
      this.cameraShake + amount
    );
  },

  setFOV(target) {
    this.fovTarget = target;
  },

  setTilt(target) {
    this.cameraTilt = target;
  },

  pause() {
    this.gameState = "PAUSED";
  },

  resume() {
    this.gameState = "PLAYING";
  },

  gameOver() {
    this.gameState = "DEAD";
    this.isRunning = false;

    if (window.UI?.gameOverScreen) {
      UI.gameOverScreen();
    }
  },

  onResize() {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect =
      window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
};

window.Engine = Engine;

/* ---------------- BOOT ---------------- */

window.addEventListener("load", () => {
  Engine.init();

  // IMPORTANT
  // Your button MUST call Engine.start()

  const btn = document.getElementById(
    "initialize-call-trigger"
  );

  if (btn) {
    btn.addEventListener("click", () => {

      const boot =
        document.getElementById("engine-boot-screen");

      if (boot) {
        boot.style.opacity = "0";

        setTimeout(() => {
          boot.style.display = "none";
          Engine.start();
        }, 800);
      } else {
        Engine.start();
      }
    });
  }
});
