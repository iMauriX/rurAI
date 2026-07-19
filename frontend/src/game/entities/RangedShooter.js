import { EnemyEntity } from './EnemyEntity';
import { ProjectileEntity } from './ProjectileEntity';

export class RangedShooter extends EnemyEntity {
  constructor(x, y) {
    super(x, y, 32, 32, 1.5, 8); // Very slow, 8 hp
    this.lastFireTime = 0;
    this.fireRate = 1500; // shoots every 1.5s
    this.aggroRange = 400; // Will stop to shoot if within this range
  }

  update(dt, gameEngine) {
    const player = gameEngine.entities.players[0];
    if (player) {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > this.aggroRange) {
        // Move closer
        dx /= dist;
        dy /= dist;
        this.vx += dx * this.acceleration;
        this.vy += dy * this.acceleration;
      } else {
        // Stop and shoot
        this.vx *= 0.5; // brake quickly
        this.vy *= 0.5;
        
        const now = performance.now();
        if (now - this.lastFireTime > this.fireRate) {
          this.shoot(dx, dy, dist, gameEngine);
          this.lastFireTime = now;
        }
      }

      // Limit speed
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (currentSpeed > this.speed) {
        this.vx = (this.vx / currentSpeed) * this.speed;
        this.vy = (this.vy / currentSpeed) * this.speed;
      }
    }

    super.update(dt, gameEngine);
  }

  shoot(dx, dy, dist, gameEngine) {
    const dirX = dx / dist;
    const dirY = dy / dist;
    const projSpeed = 4;
    
    const projectile = new ProjectileEntity(
      this.x + this.width / 2 - 8,
      this.y + this.height / 2 - 8,
      dirX * projSpeed,
      dirY * projSpeed,
      1, // 1 damage (half heart)
      this.aggroRange + 100 // Projectile range slightly higher than aggro
    );
    // Mark as enemy projectile so it hurts player, not other enemies
    projectile.isEnemyProjectile = true;
    
    gameEngine.addEntity(projectile, 'projectiles');
  }

  draw(ctx) {
    ctx.fillStyle = '#8b5cf6'; // Purple enemy
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    // Inner eye
    ctx.fillStyle = '#fbbf24'; // Yellow center
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}
