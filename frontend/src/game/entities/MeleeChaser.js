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
    ctx.fillStyle = '#16a34a'; // Green goblin color
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Goblin face
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 4, this.y + 4, 6, 6);
    ctx.fillRect(this.x + 22, this.y + 4, 6, 6);
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x + 6, this.y + 6, 2, 2);
    ctx.fillRect(this.x + 24, this.y + 6, 2, 2);
    
    // HP Bar
    ctx.fillStyle = 'black';
  }
}
