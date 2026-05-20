/* ORPHEUS ENGINE — UI SYSTEM (ui.js)
   Cinematic Horror HUD + Objective + Sanity Interface Layer
*/

const UI = {
  objectives: [],
  messages: [],
  lastMessageTime: 0,

  init() {
    this.cacheElements();
    this.addObjective("Find an exit signal.");

    setInterval(() => this.randomSystemMessage(), 9000);
  },

  cacheElements() {
    this.el = {
      stamina: document.getElementById("ui-stamina"),
      sanity: document.getElementById("ui-sanity"),
      battery: document.getElementById("ui-battery"),
      objective: document.getElementById("ui-objective"),
      message: document.getElementById("ui-message"),
      overlay: document.getElementById("ui-overlay")
    };
  },

  update(delta) {
    if (!window.Player) return;

    this.updateBars();
    this.updateObjectives();
    this.updateGlitch();
    this.updateMessages(delta);
  },

  updateBars() {
    const p = Player;

    this.setBar(this.el.stamina, p.stamina);
    this.setBar(this.el.sanity, p.sanity);

    // battery is tied to flashlight
    const battery = p.flashlightOn ? 100 : 35;
    this.setBar(this.el.battery, battery);
  },

  setBar(el, value) {
    if (!el) return;
    el.style.width = `${Math.max(0, Math.min(100, value))}%`;
  },

  updateObjectives() {
    if (!this.el.objective) return;
    if (this.objectives.length === 0) return;

    this.el.objective.innerText = this.objectives[0];
  },

  addObjective(text) {
    this.objectives.push(text);
  },

  completeObjective() {
    this.objectives.shift();

    if (this.objectives.length === 0) {
      this.addObjective("Signal lost... find a new path.");
    }
  },

  updateGlitch() {
    if (!Player) return;

    const sanity = Player.sanity;

    const glitch = (100 - sanity) / 100;

    if (this.el.overlay) {
      this.el.overlay.style.opacity = glitch * 0.4;
      this.el.overlay.style.transform = `translate(${Math.random() * glitch * 4}px, ${Math.random() * glitch * 4}px)`;
    }

    if (Math.random() < glitch * 0.02) {
      document.body.style.filter = "hue-rotate(20deg) contrast(1.2)";

      setTimeout(() => {
        document.body.style.filter = "none";
      }, 200);
    }
  },

  updateMessages(delta) {
    this.lastMessageTime += delta;

    if (this.lastMessageTime > 6) {
      this.clearMessage();
    }
  },

  showMessage(text, duration = 3) {
    if (!this.el.message) return;

    this.el.message.innerText = text;
    this.el.message.style.opacity = 1;

    setTimeout(() => this.clearMessage(), duration * 1000);
  },

  clearMessage() {
    if (!this.el.message) return;
    this.el.message.style.opacity = 0;
  },

  randomSystemMessage() {
    const msgs = [
      "YOU ARE NOT ALONE",
      "SIGNAL CORRUPTION DETECTED",
      "ECHOES ARE GETTING CLOSER",
      "DO NOT TRUST THE LIGHT",
      "SOMETHING IS FOLLOWING YOU",
      "REALITY UNSTABLE"
    ];

    if (Math.random() < 0.6) {
      this.showMessage(msgs[Math.floor(Math.random() * msgs.length)], 2.5);
    }
  },

  triggerWarning(text) {
    this.showMessage(text, 4);

    Engine?.addTrauma?.(0.2);
  },

  gameOverScreen(text) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = 0;
    div.style.left = 0;
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.background = "rgba(0,0,0,0.9)";
    div.style.color = "white";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.fontSize = "24px";
    div.style.fontFamily = "monospace";

    div.innerText = text || "YOU LOST YOURSELF IN THE STRUCTURE";

    document.body.appendChild(div);
  }
};

window.UI = UI;

window.addEventListener("load", () => UI.init());
