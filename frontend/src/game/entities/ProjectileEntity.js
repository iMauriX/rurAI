import { Entity } from './Entity';

export class ProjectileEntity extends Entity {
  constructor(x, y, vx, vy, damage, range) {
    super(x, y, 16, 16, 0); // Fixed size 16x16
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.range = range;
    
    this.startX = x;
    this.startY = y;
    
    // Projectiles shouldn't slow down with friction in this engine
    this.friction = 1.0; 
  }

  update(dt) {
    super.update(dt);
    
    // Calculate distance traveled
    const dx = this.x - this.startX;
    const dy = this.y - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Disappear if range is exceeded
    if (dist > this.range) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#60a5fa'; // Light blue tear/bullet
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
