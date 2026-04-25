export class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lane = 1;           // 0, 1, 2
    this.laneWidth = 170;
    this.weaponLevel = 0;
    this.cooldown = 0;
    this.size = 30;
  }

  cycleWeapon() {
    this.weaponLevel = (this.weaponLevel + 1) % 3;
  }

  update(keys, dt) {
    // Lane movement only (no free dragging)
    if (keys['arrowleft'] || keys['a']) {
      this.lane = Math.max(0, this.lane - 1);
      keys['arrowleft'] = keys['a'] = false; // prevent holding to spam
    }
    if (keys['arrowright'] || keys['d']) {
      this.lane = Math.min(2, this.lane + 1);
      keys['arrowright'] = keys['d'] = false;
    }

    const targetX = 115 + this.lane * this.laneWidth;
    this.x += (targetX - this.x) * 22 * dt;   // smooth lerp to lane

    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot() {
    if (!this.canShoot()) return null;

    this.cooldown = 0.085 - this.weaponLevel * 0.022;

    return {
      x: this.x,
      y: this.y - 28,
      power: 18 + this.weaponLevel * 15,
      speed: 740,
      level: this.weaponLevel
    };
  }

  draw(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.ellipse(this.x + 3, this.y + 20, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(this.x - 17, this.y - 38, 34, 58);

    // Head
    ctx.fillStyle = '#00eeff';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 30, 13.5, 0, Math.PI * 2);
    ctx.fill();

    // Weapon
    const weaponColors = ['#00ffaa', '#ffee33', '#ff3366'];
    ctx.fillStyle = weaponColors[this.weaponLevel];
    ctx.fillRect(this.x - 6, this.y - 55, 12, 32);

    ctx.shadowColor = weaponColors[this.weaponLevel];
    ctx.shadowBlur = 18;
    ctx.fillRect(this.x - 6, this.y - 55, 12, 32);
    ctx.shadowBlur = 0;
  }
}