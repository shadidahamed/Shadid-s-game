/* ORPHEUS ENGINE — PLAYER SYSTEM (player.js)
   AAA Movement + Horror Feel Controller
*/

const Player = {
  x: 10,
  z: 10,
  y: 0,

  vx: 0,
  vz: 0,

  angle: 0,

  stamina: 100,
  sanity: 100,

  crouching: false,
  sprinting: false,
  moving: false,

  flashlightOn: true,

  bobTime: 0,
  breathTime: 0,

  baseSpeed: 4.5,
  sprintMultiplier: 2.1,
  crouchMultiplier: 0.5,

  init() {
    window.addEventListener("keydown", (e) => this.keyDown(e));
    window.addEventListener("keyup", (e) => this.keyUp(e));
  },

  keyDown(e) {
    switch (e.key.toLowerCase()) {
      case "shift": this.sprinting = true; break;
      case "control": this.crouching = true; break;
      case "f": this.flashlightOn = !this.flashlightOn; break;
    }
  },

  keyUp(e) {
    switch (e.key.toLowerCase()) {
      case "shift": this.sprinting = false; break;
      case "control": this.crouching = false; break;
    }
  },

  update(delta) {
    this.handleMovement(delta);
    this.handleCameraEffects(delta);
    this.handleStamina(delta);
    this.handleSanity(delta);
    this.syncToEngine();
  },

  handleMovement(delta) {
    let speed = this.baseSpeed;

    if (this.sprinting && this.stamina > 5) {
      speed *= this.sprintMultiplier;
      this.stamina -= delta * 18;
    } else if (this.crouching) {
      speed *= this.crouchMultiplier;
    } else {
      this.stamina += delta * 10;
    }

    this.stamina = Math.max(0, Math.min(100, this.stamina));

    const forward = Input.isDown("w");
    const back = Input.isDown("s");
    const left = Input.isDown("a");
    const right = Input.isDown("d");

    let dx = 0;
    let dz = 0;

    if (forward) dz -= 1;
    if (back) dz += 1;
    if (left) dx -= 1;
    if (right) dx += 1;

    this.moving = dx !== 0 || dz !== 0;

    const len = Math.hypot(dx, dz);
    if (len > 0) {
      dx /= len;
      dz /= len;
    }

    const moveSpeed = speed * delta;

    const sin = Math.sin(this.angle);
    const cos = Math.cos(this.angle);

    const nx = this.x + (dx * cos - dz * sin) * moveSpeed;
    const nz = this.z + (dx * sin + dz * cos) * moveSpeed;

    // collision
    if (!WorldGen.isWall(Math.floor(nx), Math.floor(this.z))) {
      this.x = nx;
    }
    if (!WorldGen.isWall(Math.floor(this.x), Math.floor(nz))) {
      this.z = nz;
    }
  },

  handleCameraEffects(delta) {
    if (!Engine || !Engine.camera) return;

    this.bobTime += delta * (this.moving ? 10 : 3);
    this.breathTime += delta;

    const bob = Math.sin(this.bobTime) * (this.moving ? 0.08 : 0.02);

    const breath = Math.sin(this.breathTime * 1.5) * 0.03;

    const sprintFOV = this.sprinting ? 68 : 60;
    const targetFOV = this.moving ? sprintFOV : 55;

    Engine.camera.fov += (targetFOV - Engine.camera.fov) * 0.08;
    Engine.camera.updateProjectionMatrix();

    // trauma shake
    const trauma = Engine.trauma || 0;
    const shakeX = (Math.random() - 0.5) * trauma;
    const shakeY = (Math.random() - 0.5) * trauma;

    Engine.camera.position.x += shakeX;
    Engine.camera.position.y += shakeY;

    // apply camera
    Engine.camera.position.x = this.x + shakeX;
    Engine.camera.position.z = this.z + bob;
    Engine.camera.position.y = 1.6 + breath;

    Engine.camera.rotation.y = this.angle;
  },

  handleStamina(delta) {
    if (!this.sprinting) {
      this.stamina += delta * 12;
    }

    this.stamina = Math.max(0, Math.min(100, this.stamina));
  },

  handleSanity(delta) {
    const nearThreat = AI?.entities?.some(e => {
      const dx = e.x - this.x;
      const dz = e.z - this.z;
      return Math.sqrt(dx * dx + dz * dz) < 6;
    });

    if (nearThreat) {
      this.sanity -= delta * 8;
      Engine.addTrauma(0.03);
    } else {
      this.sanity += delta * 2;
    }

    this.sanity = Math.max(0, Math.min(100, this.sanity));
  },

  syncToEngine() {
    if (!Engine) return;

    Engine.player = this;
  }
};

// simple input helper
const Input = {
  keys: {},

  init() {
    window.addEventListener("keydown", e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => this.keys[e.key.toLowerCase()] = false);
  },

  isDown(key) {
    return this.keys[key.toLowerCase()];
  }
};

window.Player = Player;
window.Input = Input;

window.addEventListener("load", () => {
  Input.init();
  Player.init();
});
