/* ORPHEUS ENGINE — AI SYSTEM (ai.js)
   State Machine Horror Entity AI
*/

const AI = {
  entities: [],

  init() {
    this.entities = [];
  },

  register(entity) {
    this.entities.push(entity);
  },

  update(delta) {
    for (let e of this.entities) {
      this.updateEntity(e, delta);
    }
  },

  updateEntity(e, delta) {
    if (!e.state) e.state = "patrol";

    const player = window.Player;
    if (!player) return;

    const dx = player.x - e.x;
    const dz = player.z - e.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // HEARING SYSTEM (sound awareness)
    if (player.moving && dist < 8) {
      e.lastHeard = { x: player.x, z: player.z };
      if (e.state === "patrol") e.state = "investigate";
    }

    // LIGHT SENSITIVITY (flashlight fear)
    if (player.flashlightOn && dist < 10) {
      e.fear += delta * 2;
    } else {
      e.fear *= 0.98;
    }

    switch (e.state) {
      case "patrol":
        this.patrol(e, delta);
        if (dist < 6) e.state = "chase";
        break;

      case "investigate":
        this.investigate(e, delta);
        if (dist < 6) e.state = "chase";
        break;

      case "chase":
        this.chase(e, delta);
        if (dist > 14) e.state = "lose";
        break;

      case "lose":
        this.lose(e, delta);
        if (dist < 8) e.state = "chase";
        break;

      case "ambush":
        this.ambush(e, delta);
        break;
    }

    // sanity pressure
    if (dist < 5) {
      player.sanity -= delta * 8;
      Engine.addTrauma(0.05);
    }
  },

  patrol(e, delta) {
    e.angle += delta * 0.5;
    e.x += Math.cos(e.angle) * delta * 1.2;
    e.z += Math.sin(e.angle) * delta * 1.2;
  },

  investigate(e, delta) {
    if (!e.lastHeard) return;

    const dx = e.lastHeard.x - e.x;
    const dz = e.lastHeard.z - e.z;

    e.x += dx * delta * 1.5;
    e.z += dz * delta * 1.5;
  },

  chase(e, delta) {
    const player = window.Player;

    const dx = player.x - e.x;
    const dz = player.z - e.z;

    e.x += dx * delta * 2.5;
    e.z += dz * delta * 2.5;

    // horror aggression
    Engine.addTrauma(0.02);
  },

  lose(e, delta) {
    // wandering search pattern
    e.angle += delta * 1.2;
    e.x += Math.cos(e.angle) * delta;
    e.z += Math.sin(e.angle) * delta;
  },

  ambush(e, delta) {
    // sudden teleport behavior (liminal distortion)
    if (Math.random() < 0.005) {
      const player = window.Player;
      e.x = player.x + (Math.random() - 0.5) * 6;
      e.z = player.z + (Math.random() - 0.5) * 6;

      Engine.addTrauma(0.4);
    }
  },

  spawn(x, z, type = "stalker") {
    const entity = {
      x,
      z,
      type,
      state: "patrol",
      angle: Math.random() * Math.PI * 2,
      fear: 0,
      lastHeard: null
    };

    this.entities.push(entity);
    return entity;
  }
};

window.AI = AI;

window.addEventListener("load", () => AI.init());
