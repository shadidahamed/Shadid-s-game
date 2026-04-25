import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class AudioEngine {
  init(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
  }

  playShot() {}
  playHit() {}
}
