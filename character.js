export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.speed = 380;
    this.width = 48;
    this.height = 38;
  }

  update(keys, dt) {
    if (keys['arrowleft'] || keys['a']) this.targetX -= this.speed * dt * 1.4;
    if (keys['arrowright'] || keys['d']) this.targetX += this.speed * dt * 1.4;

    this.targetX = Math.max(30, Math.min(770, this.targetX));
    this.x += (this.targetX - this.x) * 0.22;
  }

  draw(ctx) {
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height/2);
    ctx.lineTo(this.x - this.width/2, this.y + this.height/2);
    ctx.lineTo(this.x + this.width/2, this.y + this.height/2);
    ctx.closePath();
    ctx.fill();

    // cockpit
    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 8, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}