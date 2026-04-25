import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

import { Player } from "./player.js";
import { ZombieSystem } from "./zombies.js";
import { ShootingSystem } from "./shooting.js";
import { UI } from "./ui.js";

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 10, 60);

    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.ui = new UI();

    this.player = new Player(this.camera);
    this.zombies = new ZombieSystem(this.scene, this.player, this.ui);
    this.shooting = new ShootingSystem(this.scene, this.player, this.zombies, this.ui);

    this._setupWorld();
    this._setupLights();
    this._setupResize();

    this.animate();
  }

  _setupWorld() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 2000),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );

    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  }

  _setupLights() {
    this.scene.add(new THREE.AmbientLight(0x222222));

    const dir = new THREE.DirectionalLight(0xff0000, 1);
    dir.position.set(5, 10, 5);
    this.scene.add(dir);
  }

  _setupResize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();

    if (!this.ui.gameOver) {
      this.player.update(dt);
      this.zombies.update(dt);
      this.shooting.update(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
