export class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lane = 1;           // 0, 1, 2
    this.laneWidth = 180;
    this.weaponLevel = 0;    // 0-2
    this.cooldown = 0;
    this.size = 28;
  }

  cycleWeapon() {
    this.weaponLevel = (this.weaponLevel + 1) % 3;
  }

  update(keys, dt) {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.lane = Math.max(0, this.lane - 1);
    if (keys['ArrowRight'] || keys['d'] || keys['D']) this.lane = Math.min(2, this.lane + 1);

    const targetX = 120 + this.lane * this.laneWidth;
    this.x += (targetX - this.x) * 15 * dt;

    this.cooldown -= dt;
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot() {
    if (!this.canShoot()) return null;

    this.cooldown = 0.08 - this.weaponLevel * 0.02; // faster with upgrades

    return {
      x: this.x,
      y: this.y - 20,
      power: 15 + this.weaponLevel * 12,
      speed: 650
    };
  }

  draw(ctx) {
    // body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(this.x - this.size/2, this.y - this.size, this.size, this.size * 1.8);

    // head
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.6, 12, 0, Math.PI * 2);
    ctx.fill();

    // weapon glow
    ctx.fillStyle = this.weaponLevel === 2 ? '#ff2a2a' : this.weaponLevel === 1 ? '#ffff00' : '#00ffaa';
    ctx.fillRect(this.x - 6, this.y - this.size * 1.3, 12, 25);
  }
}