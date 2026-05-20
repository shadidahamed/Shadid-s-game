/* ORPHEUS ENGINE — LIGHTING SYSTEM (lighting.js)
   Cinematic Horror Lighting + Power Failure Simulation
*/

const LightingSys = {
  lights: [],
  flickerTimers: [],

  state: {
    powerLevel: 1.0,
    isPowerFailure: false,
    flickerIntensity: 0
  },

  init() {
    this.lights = [];
    this.flickerTimers = [];

    this.setupGlobalLighting();
  },

  setupGlobalLighting() {
    const ambient = new THREE.AmbientLight(0x0b0f1a, 0.4);
    Engine.scene.add(ambient);

    const moonLight = new THREE.DirectionalLight(0xc4a267, 0.6);
    moonLight.position.set(10, 30, 10);
    moonLight.castShadow = true;

    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;

    Engine.scene.add(moonLight);

    this.moonLight = moonLight;
    this.ambient = ambient;

    // fog density for liminal depth
    Engine.scene.fog = new THREE.FogExp2(0x05070c, 0.035);
  },

  addFlickeringTubeLight(x, y, z, intensity = 1) {
    const light = new THREE.PointLight(0xffffff, intensity, 12);
    light.position.set(x, y, z);
    Engine.scene.add(light);

    const flicker = {
      light,
      baseIntensity: intensity,
      timer: Math.random() * 1000,
      broken: Math.random() < 0.15
    };

    this.lights.push(flicker);
    return flicker;
  },

  addEmergencyLight(x, y, z) {
    const light = new THREE.PointLight(0xff0000, 2.0, 18);
    light.position.set(x, y, z);
    Engine.scene.add(light);

    return { light, rotation: 0 };
  },

  setPowerFailure(state) {
    this.state.isPowerFailure = state;

    if (state) {
      this.state.powerLevel = 0.25;
    } else {
      this.state.powerLevel = 1.0;
    }
  },

  update(delta) {
    this.updateFlickeringLights(delta);
    this.updatePowerState(delta);
    this.updateAtmosphere();
  },

  updateFlickeringLights(delta) {
    for (let f of this.lights) {
      f.timer += delta * 10;

      let flicker = Math.sin(f.timer) * 0.5 + Math.random() * 0.3;

      if (f.broken) {
        flicker *= Math.random() < 0.1 ? 0 : 1;
      }

      const intensity = f.baseIntensity * this.state.powerLevel * (0.5 + flicker);

      f.light.intensity = Math.max(0, intensity);

      // occasional blackout pulse
      if (Math.random() < 0.001 && !this.state.isPowerFailure) {
        f.light.intensity = 0;
      }
    }
  },

  updatePowerState(delta) {
    if (this.state.isPowerFailure) {
      this.state.flickerIntensity += delta * 2;

      const pulse = Math.sin(this.state.flickerIntensity * 8) * 0.5 + 0.5;

      this.ambient.intensity = 0.1 + pulse * 0.2;
      this.moonLight.intensity = 0.2 + pulse * 0.3;

      Engine.addTrauma(0.005);
    }
  },

  updateAtmosphere() {
    // dynamic fog density based on global power
    Engine.scene.fog.density = 0.02 + (1 - this.state.powerLevel) * 0.03;
  },

  // volumetric flashlight simulation
  createFlashlightCone(player) {
    if (!this.flashlight) {
      const spot = new THREE.SpotLight(0xffffff, 2.5, 25, Math.PI / 6, 0.5);
      spot.castShadow = true;

      Engine.camera.add(spot);
      this.flashlight = spot;
    }

    this.flashlight.position.set(0, 0, 0);

    this.flashlight.target.position.set(
      Math.sin(player.angle) * 10,
      -1,
      Math.cos(player.angle) * 10
    );

    Engine.scene.add(this.flashlight.target);
  },

  triggerRandomBlackout() {
    this.setPowerFailure(true);

    setTimeout(() => {
      this.setPowerFailure(false);
    }, 4000 + Math.random() * 6000);
  },

  spawnShadowPocket(x, z) {
    // creates darkness anomaly zone
    const fakeLight = new THREE.PointLight(0x000000, 0, 10);
    fakeLight.position.set(x, 2, z);

    Engine.scene.add(fakeLight);
    return fakeLight;
  }
};

window.LightingSys = LightingSys;

window.addEventListener("load", () => LightingSys.init());
