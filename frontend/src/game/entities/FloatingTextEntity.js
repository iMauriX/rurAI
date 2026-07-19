import { Entity } from './Entity';

export class FloatingTextEntity extends Entity {
  constructor(x, y, text, color = '#ef4444', isCrit = false) {
    super(x, y, 0, 0, 0);
    this.text = text;
    this.color = color;
    this.lifeTime = 60; // 1 second
    this.maxLife = 60;
    this.vy = -1.5; // Float upwards
    this.isCrit = isCrit;
  }

  update(dt) {
    this.y += this.vy * (dt || 1);
    this.lifeTime -= (dt || 1);
    if (this.lifeTime <= 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const alpha = Math.max(0, this.lifeTime / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    
    let fontSize = this.isCrit ? 24 : 16;
    if (this.lifeTime > this.maxLife - 10) {
      // Pop effect
      fontSize += (this.maxLife - this.lifeTime);
    }
    
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    
    ctx.restore();
  }
}
