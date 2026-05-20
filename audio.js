/* ORPHEUS ENGINE — AUDIO SYSTEM (audio.js)
   Positional Horror Sound Engine
*/

const AudioSys = {
  listener: null,

  sounds: {
    ambient: null,
    whisper: null,
    scream: null,
    footstep: null,
    breathing: null,
    chase: null
  },

  state: {
    isChasing: false,
    lastFootstep: 0
  },

  init() {
    this.listener = new THREE.AudioListener();
    Engine.camera.add(this.listener);

    this.loadSounds();
  },

  loadSounds() {
    const loader = new THREE.AudioLoader();

    this.sounds.ambient = new THREE.Audio(this.listener);
    this.sounds.whisper = new THREE.Audio(this.listener);
    this.sounds.scream = new THREE.Audio(this.listener);
    this.sounds.footstep = new THREE.Audio(this.listener);
    this.sounds.breathing = new THREE.Audio(this.listener);
    this.sounds.chase = new THREE.Audio(this.listener);

    // NOTE: placeholders (user should replace with real audio files)
    loader.load("assets/ambient.mp3", (buffer) => {
      this.sounds.ambient.setBuffer(buffer);
      this.sounds.ambient.setLoop(true);
      this.sounds.ambient.setVolume(0.4);
      this.sounds.ambient.play();
    });

    loader.load("assets/breathing.mp3", (buffer) => {
      this.sounds.breathing.setBuffer(buffer);
      this.sounds.breathing.setLoop(true);
      this.sounds.breathing.setVolume(0.2);
      this.sounds.breathing.play();
    });
  },

  playFootstep(intensity = 1) {
    if (!this.sounds.footstep) return;

    const s = this.sounds.footstep;
    s.setVolume(0.2 * intensity);
    s.play();
  },

  playWhisper() {
    if (!this.sounds.whisper) return;
    this.sounds.whisper.setVolume(0.6);
    this.sounds.whisper.play();
  },

  playScream() {
    if (!this.sounds.scream) return;
    this.sounds.scream.setVolume(1.0);
    this.sounds.scream.play();

    Engine.addTrauma(0.3);
  },

  setChase(active) {
    this.state.isChasing = active;

    if (active) {
      if (this.sounds.chase) {
        this.sounds.chase.setVolume(0.8);
        this.sounds.chase.play();
      }
    } else {
      if (this.sounds.chase) {
        this.sounds.chase.stop();
      }
    }
  },

  update(delta) {
    const player = window.Player;
    if (!player) return;

    // breathing intensity based on stamina/sanity
    const breathVol = Math.max(0.1, (100 - player.stamina) / 100);
    if (this.sounds.breathing) {
      this.sounds.breathing.setVolume(breathVol);
    }

    // random horror audio events
    if (Math.random() < 0.0008) {
      this.playWhisper();
    }

    if (Math.random() < 0.0003) {
      this.playScream();
    }

    // footstep timing
    if (player.moving) {
      this.state.lastFootstep += delta;

      const interval = player.sprinting ? 0.25 : 0.45;

      if (this.state.lastFootstep > interval) {
        this.playFootstep(player.sprinting ? 1.5 : 0.8);
        this.state.lastFootstep = 0;
      }
    }

    // chase intensity audio
    if (this.state.isChasing) {
      Engine.setFOV(62);
    } else {
      Engine.setFOV(50);
    }
  }
};

window.AudioSys = AudioSys;

window.addEventListener("load", () => AudioSys.init());
