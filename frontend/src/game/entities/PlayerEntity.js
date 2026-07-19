import { Entity } from './Entity';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ProjectileEntity } from './ProjectileEntity';

export class PlayerEntity extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32, 0);
    this.lastFireTime = 0;
    this.aimDirX = 0;
    this.aimDirY = 1; // Default looking down
    this.iFrames = 0;
  }

  update(dt, inputManager, gameEngine) {
    const stats = usePlayerStore.getState();
    this.speed = stats.movementSpeed;

    if (this.iFrames > 0) {
      this.iFrames -= dt;
    }

    // Movement
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
    
    // Update aim direction if moving (and not shooting)
    if (dx !== 0 || dy !== 0) {
      this.aimDirX = dx;
      this.aimDirY = dy;
    }

    this.vx += dx * this.acceleration;
    this.vy += dy * this.acceleration;
    
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > this.speed) {
      this.vx = (this.vx / currentSpeed) * this.speed;
      this.vy = (this.vy / currentSpeed) * this.speed;
    }

    super.update(dt);

    // Aiming
    let aimX = 0;
    let aimY = 0;
    let isShooting = false;
    
    if (inputManager.keys['ArrowUp']) { aimY -= 1; isShooting = true; }
    if (inputManager.keys['ArrowDown']) { aimY += 1; isShooting = true; }
    if (inputManager.keys['ArrowLeft']) { aimX -= 1; isShooting = true; }
    if (inputManager.keys['ArrowRight']) { aimX += 1; isShooting = true; }

    if (isShooting) {
      // Normalize direction
      const len = Math.hypot(aimX, aimY);
      this.aimDirX = aimX / len;
      this.aimDirY = aimY / len;
      
      const now = performance.now();
      if (now - this.lastFireTime > stats.fireRate) {
        this.shoot(this.aimDirX, this.aimDirY, stats, gameEngine);
        this.lastFireTime = now;
      }
    }
  }

  shoot(dirX, dirY, stats, gameEngine) {
    const momentumFactor = 0.3;
    const pVx = (dirX * stats.shotSpeed) + (this.vx * momentumFactor);
    const pVy = (dirY * stats.shotSpeed) + (this.vy * momentumFactor);

    const projectile = new ProjectileEntity(
      this.x + this.width / 2 - 8,
      this.y + this.height / 2 - 8,
      pVx,
      pVy,
      stats.damage,
      stats.range
    );
    
    gameEngine.addEntity(projectile, 'projectiles');
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const angle = Math.atan2(this.aimDirY, this.aimDirX);

    // Body shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + this.height/2, this.width/2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blink if invincible
    if (this.iFrames > 0 && Math.floor(performance.now() / 100) % 2 === 0) {
      return;
    }

    // Body
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Eyes (following aim)
    const eyeOffsetX = this.aimDirX * 3;
    const eyeOffsetY = this.aimDirY * 3;
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 4 + eyeOffsetX, this.y + 4 + eyeOffsetY, 8, 8);
    ctx.fillRect(this.x + 20 + eyeOffsetX, this.y + 4 + eyeOffsetY, 8, 8);
    
    // Pupils
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x + 6 + eyeOffsetX * 1.5, this.y + 6 + eyeOffsetY * 1.5, 4, 4);
    ctx.fillRect(this.x + 22 + eyeOffsetX * 1.5, this.y + 6 + eyeOffsetY * 1.5, 4, 4);
    
    // Gun drawing (Above player)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    
    // Gun stock/handle
    ctx.fillStyle = '#1e293b'; // slate 800
    ctx.fillRect(8, -6, 6, 12);
    // Gun barrel
    ctx.fillStyle = '#64748b'; // slate 500
    ctx.fillRect(10, -3, 16, 6);
    // Gun tip
    ctx.fillStyle = '#0f172a'; // slate 900
    ctx.fillRect(26, -4, 4, 8);

    ctx.restore();
  }
}
