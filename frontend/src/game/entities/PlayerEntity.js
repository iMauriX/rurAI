import { Entity } from './Entity';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ProjectileEntity } from './ProjectileEntity';

export class PlayerEntity extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32, 0); // Speed will come from store
    this.lastFireTime = 0;
  }

  update(dt, inputManager, gameEngine) {
    // Read stats directly from Zustand store
    const stats = usePlayerStore.getState();
    this.speed = stats.movementSpeed;

    // Movement (WASD)
    let dx = 0;
    let dy = 0;

    if (inputManager.isKeyDown('w')) dy -= 1;
    if (inputManager.isKeyDown('s')) dy += 1;
    if (inputManager.isKeyDown('a')) dx -= 1;
    if (inputManager.isKeyDown('d')) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    // Apply acceleration
    this.vx += dx * this.acceleration;
    this.vy += dy * this.acceleration;
    
    // Limit to max speed
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > this.speed) {
      this.vx = (this.vx / currentSpeed) * this.speed;
      this.vy = (this.vy / currentSpeed) * this.speed;
    }

    super.update(dt); // Applies velocity to position and friction

    // Shooting (Arrow Keys)
    const now = performance.now();
    if (now - this.lastFireTime > stats.fireRate) {
      let shootDirX = 0;
      let shootDirY = 0;

      if (inputManager.isKeyDown('ArrowUp')) shootDirY -= 1;
      else if (inputManager.isKeyDown('ArrowDown')) shootDirY += 1;
      else if (inputManager.isKeyDown('ArrowLeft')) shootDirX -= 1;
      else if (inputManager.isKeyDown('ArrowRight')) shootDirX += 1;

      if (shootDirX !== 0 || shootDirY !== 0) {
        this.shoot(shootDirX, shootDirY, stats, gameEngine);
        this.lastFireTime = now;
      }
    }
  }

  shoot(dirX, dirY, stats, gameEngine) {
    const momentumFactor = 0.3; // Fraction of player's velocity inherited by projectile
    
    const pVx = (dirX * stats.shotSpeed) + (this.vx * momentumFactor);
    const pVy = (dirY * stats.shotSpeed) + (this.vy * momentumFactor);

    // Spawn projectile from center of player
    const projectile = new ProjectileEntity(
      this.x + this.width / 2 - 8, // Offset by half proj size
      this.y + this.height / 2 - 8,
      pVx,
      pVy,
      stats.damage,
      stats.range
    );
    
    gameEngine.addEntity(projectile, 'projectiles');
  }

  draw(ctx) {
    ctx.fillStyle = '#3b82f6'; // Blue avatar
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Draw some simple eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 4, this.y + 4, 8, 8);
    ctx.fillRect(this.x + 20, this.y + 4, 8, 8);
  }
}
