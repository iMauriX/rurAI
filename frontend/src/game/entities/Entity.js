export class Entity {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.vx = 0;
    this.vy = 0;
    
    this.speed = speed || 5;
    this.friction = 0.85; // Momentum / inertia
    this.acceleration = 1.2;
    
    this.markedForDeletion = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    // Apply friction to gradually stop when no input is applied
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // Stop completely if velocity is very small to avoid micro-movements
    if (Math.abs(this.vx) < 0.01) this.vx = 0;
    if (Math.abs(this.vy) < 0.01) this.vy = 0;
  }

  draw(ctx) {
    // Basic fallback render
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}
