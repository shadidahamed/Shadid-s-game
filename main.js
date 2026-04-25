import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

import { Character } from "./character.js";
import { ZombieSystem } from "./zombies.js";
import { ShootingSystem } from "./shooting.js";
import { UI } from "./ui.js";
import { FXSystem } from "./fx.js";
import { Director } from "./director.js";
import { RecoilSystem } from "./recoil.js";
import { AudioEngine } from "./audio.js";
import { AnimationSystem } from "./animation.js";

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050505, 0.035);

    this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    this.ui = new UI();

    this.character = new Character(this.scene);

    this.director = new Director();

    this.zombies = new ZombieSystem(this.scene, this.character, this.ui, this.director);

    this.recoil = new RecoilSystem(this.camera);

    this.fx = new FXSystem(this.camera);

    this.audio = new AudioEngine();
    this.audio.init(this.camera);

    this.anim = new AnimationSystem(this.character);

    this.shooting = new ShootingSystem(
      this.scene,
      this.character,
      this.zombies,
      this.ui,
      this.audio,
      this.recoil,
      this.fx
    );

    this._world();
    this._light();
    this._resize();

    this.loop();
  }

  _world() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 3000),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
    );

    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  }

  _light() {
    this.scene.add(new THREE.AmbientLight(0x111111));

    const red = new THREE.DirectionalLight(0xff2a2a, 1.2);
    red.position.set(5, 10, 5);
    this.scene.add(red);
  }

  _resize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
  }

  loop() {
    requestAnimationFrame(() => this.loop());

    const dt = this.clock.getDelta();

    this.director.update(dt);

    if (!this.ui.gameOver) {
      this.character.update(dt);
      this.zombies.update(dt);
      this.shooting.update(dt);
      this.anim.update(dt, this.character);
    }

    this.recoil.update(dt);
    this.fx.update(dt, this.ui);

    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
