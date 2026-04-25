export class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lane = 1;
    this.laneWidth = 170;
    this.weaponLevel = 0; // 0, 1, 2
    this.cooldown = 0;
    this.size = 30;
  }

  cycleWeapon() {
    this.weaponLevel = (this.weaponLevel + 1) % 3;
  }

  update(keys, dt) {
    if (keys['arrowleft'] || keys['a']) this.lane = Math.max(0, this.lane - 1);
    if (keys['arrowright'] || keys['d']) this.lane = Math.min(2, this.lane + 1);

    const targetX = this.canvas ? 100 + this.lane * this.laneWidth : 120 + this.lane * this.laneWidth;
    this.x += (targetX - this.x) * 18 * dt;

    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot() {
    if (!this.canShoot()) return null;

    this.cooldown = 0.09 - this.weaponLevel * 0.025;

    return {
      x: this.x,
      y: this.y - 25,
      power: 18 + this.weaponLevel * 14,
      speed: 720,
      level: this.weaponLevel
    };
  }

  draw(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(this.x + 4, this.y + 18, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#111111';
    ctx.fillRect(this.x - 18, this.y - 35, 36, 55);

    // Head
    ctx.fillStyle = '#00ddff';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 28, 14, 0, Math.PI * 2);
    ctx.fill();

    // Weapon
    const colors = ['#00ffaa', '#ffee00', '#ff2a2a'];
    ctx.fillStyle = colors[this.weaponLevel];
    ctx.fillRect(this.x - 7, this.y - 52, 14, 28);

    // Glow
    ctx.shadowColor = colors[this.weaponLevel];
    ctx.shadowBlur = 15;
    ctx.fillRect(this.x - 7, this.y - 52, 14, 28);
    ctx.shadowBlur = 0;
  }
}