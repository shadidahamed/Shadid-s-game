/* ORPHEUS ENGINE — EVENTS SYSTEM (events.js)
   Psychological Horror Event Director (Liminal Simulation Layer)
*/

const Events = {
  timers: [],
  lastEvent: 0,

  state: {
    chaos: 0.5,
    distortionActive: false
  },

  init() {
    this.timers = [];

    // recurring systemic events
    setInterval(() => this.randomWhispers(), 8000);
    setInterval(() => this.randomFootsteps(), 12000);
    setInterval(() => this.randomRadioChatter(), 15000);
    setInterval(() => this.randomPowerFailure(), 30000);
    setInterval(() => this.randomRealityDistortion(), 20000);
  },

  update(delta) {
    this.lastEvent += delta;

    if (!window.Player) return;

    const sanity = window.Player.sanity || 100;

    // sanity-driven hallucination pressure
    if (sanity < 70 && Math.random() < 0.002) this.fakeFootsteps();
    if (sanity < 50 && Math.random() < 0.002) this.distantScream();
    if (sanity < 30 && Math.random() < 0.001) this.impossibleGeometryEvent();

    // chase trigger escalation
    if (window.AI && AI.entities.length > 0) {
      const near = AI.entities.some(e => e.state === "chase");
      if (near) this.triggerChaseEvent();
    }
  },

  randomWhispers() {
    if (!window.AudioSys) return;
    if (Math.random() < 0.5) AudioSys.playWhisper();
  },

  randomFootsteps() {
    if (!window.AudioSys) return;
    if (Math.random() < 0.4) AudioSys.playFootstep(0.5);
  },

  randomRadioChatter() {
    if (!window.AudioSys) return;

    if (Math.random() < 0.3) {
      // reuse whisper as placeholder radio distortion
      AudioSys.playWhisper();
    }
  },

  randomPowerFailure() {
    if (window.LightingSys && Math.random() < 0.25) {
      LightingSys.triggerRandomBlackout();
    }
  },

  randomRealityDistortion() {
    if (!window.Engine) return;

    if (Math.random() < 0.2) {
      this.state.distortionActive = true;

      Engine.addTrauma(0.2);

      setTimeout(() => {
        this.state.distortionActive = false;
      }, 3000);
    }
  },

  fakeFootsteps() {
    if (!window.AudioSys) return;

    // sound appears behind player
    AudioSys.playFootstep(0.7);
  },

  distantScream() {
    if (window.AudioSys) AudioSys.playScream();
  },

  impossibleGeometryEvent() {
    if (!window.WorldGen || !window.Engine) return;

    const x = Math.floor(Math.random() * WorldGen.size);
    const z = Math.floor(Math.random() * WorldGen.size);

    WorldGen.grid[z][x] = 6; // anomaly injection

    Engine.addTrauma(0.5);

    // visual distortion pulse
    document.body.style.filter = "contrast(1.3) brightness(0.8) hue-rotate(20deg)";

    setTimeout(() => {
      document.body.style.filter = "none";
    }, 2500);
  },

  triggerChaseEvent() {
    if (!window.Engine) return;

    Engine.setFOV(68);
    Engine.addTrauma(0.3);

    if (window.AudioSys) {
      AudioSys.setChase(true);
    }

    setTimeout(() => {
      if (window.AudioSys) AudioSys.setChase(false);
    }, 5000);
  },

  spawnAmbush(x, z) {
    if (window.AI) {
      const e = AI.spawn(x, z, "ambush");
      e.state = "ambush";
    }
  },

  injectLiminalEcho() {
    // "I've been here before" effect trigger
    if (!window.Engine) return;

    Engine.addTrauma(0.1);

    const flicker = document.createElement("div");
    flicker.style.position = "absolute";
    flicker.style.top = 0;
    flicker.style.left = 0;
    flicker.style.width = "100%";
    flicker.style.height = "100%";
    flicker.style.background = "rgba(255,255,255,0.03)";
    flicker.style.pointerEvents = "none";
    flicker.style.zIndex = 9999;

    document.body.appendChild(flicker);

    setTimeout(() => flicker.remove(), 120);
  }
};

window.Events = Events;

window.addEventListener("load", () => Events.init());
