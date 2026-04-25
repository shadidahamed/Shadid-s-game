export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.speed = 480;
  }

  update(keys, dt) {
    this.x += (this.targetX - this.x) * 0.28; // super smooth lerp
  }

  draw(ctx) {
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 28);
    ctx.lineTo(this.x - 26, this.y + 22);
    ctx.lineTo(this.x + 26, this.y + 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 8, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}