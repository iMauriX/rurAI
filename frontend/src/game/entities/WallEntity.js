import { Entity } from './Entity';
import { usePlayerStore } from '../../store/usePlayerStore';

export class WallEntity extends Entity {
  constructor(x, y, width, height, destructible = false) {
    super(x, y, width, height, 0); // No speed
    this.destructible = destructible;
    this.hp = destructible ? 3 : Infinity; // 3 hits to break if destructible
    this.markedForDeletion = false;
  }

  takeDamage(amount) {
    if (!this.destructible) return;
    this.hp -= amount;
    if (this.hp <= 0 && !this.markedForDeletion) {
      this.markedForDeletion = true;
      
      // Random drop
      const roll = Math.random();
      if (roll >= 0.5) { // 50% chance of nothing (roll < 0.5), so we process if roll >= 0.5
         const isFull = roll >= 0.85; // 15% chance for full heart (0.85 to 1.0)
         // The remaining 35% (0.5 to 0.85) is half heart
         const healAmount = isFull ? 2 : 1;
         usePlayerStore.getState().heal(healAmount);
         usePlayerStore.getState().setBonusMessage(isFull ? '+ 1 Corazón' : '+ 1/2 Corazón');
      }
    }
  }

  draw(ctx) {
    if (this.destructible) {
      // Brown box for destructible
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      // Draw crate lines
      ctx.strokeStyle = '#5c2e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.moveTo(this.x + this.width, this.y);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.stroke();
    } else {
      // Dark gray box for indestructible
      ctx.fillStyle = '#475569';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
