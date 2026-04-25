export class AnimationSystem {
  update(dt, character) {
    character.model.rotation.y += dt * 2;
  }
}
