import { EnemyEntity } from './EnemyEntity';

export class MeleeChaser extends EnemyEntity {
  constructor(x, y) {
    super(x, y, 32, 32, 2.5, 10); // Slower than player, 10 hp
  }

  update(dt, gameEngine) {
    const player = gameEngine.entities.players[0];
    if (player) {
      // Calculate direction vector towards player
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        dx /= dist;
        dy /= dist;
      }
      
      // Apply movement
      this.vx += dx * this.acceleration;
      this.vy += dy * this.acceleration;

      // Limit speed
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (currentSpeed > this.speed) {
        this.vx = (this.vx / currentSpeed) * this.speed;
        this.vy = (this.vy / currentSpeed) * this.speed;
      }
    }

    super.update(dt, gameEngine);
  }

  draw(ctx) {
    ctx.fillStyle = '#ef4444'; // Red enemy
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Draw angry eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(this.x + 5, this.y + 5);
    ctx.lineTo(this.x + 12, this.y + 10);
    ctx.lineTo(this.x + 5, this.y + 12);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(this.x + 27, this.y + 5);
    ctx.lineTo(this.x + 20, this.y + 10);
    ctx.lineTo(this.x + 27, this.y + 12);
    ctx.fill();
  }
}
