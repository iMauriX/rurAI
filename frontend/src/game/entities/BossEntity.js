import { Entity } from './Entity';
import { EnemyEntity } from './EnemyEntity';
import { MeleeChaser } from './MeleeChaser';

// Represents a vulnerable part of the Boss
class BossPart extends Entity {
  constructor(x, y, width, height, type, bossRef) {
    super(x, y, width, height, 0);
    this.type = type; // 'EYE', 'HAND', 'MEAT', 'FOOT'
    this.bossRef = bossRef;
    this.activeTimer = 0;
    this.hp = 10;
    this.maxHp = 10;
    // Set damage based on part type
    if (type === 'FOOT') {
       this.damage = 0; // No damage during shadow
       this.state = 'SHADOW';
       this.shadowTimer = 60; // 1 second shadow
       this.activeTimer = 180;
    } else if (type === 'HAND') {
       this.damage = 1;
       this.activeTimer = 90;
    } else if (type === 'MEAT') {
       this.damage = 1;
       this.activeTimer = 60;
    } else if (type === 'EYE') {
       this.damage = 0;
       this.activeTimer = 120;
    }
  }
  
  update(dt) {
    super.update(dt);
    
    if (this.type === 'FOOT' && this.state === 'SHADOW') {
      this.shadowTimer -= dt;
      if (this.shadowTimer <= 0) {
        this.state = 'ACTIVE';
        this.damage = 2; // 1 full heart
      }
      return;
    }

    this.activeTimer -= dt;
    if (this.activeTimer <= 0) {
      this.markedForDeletion = true;
    }
  }

  takeDamage(amount) {
    this.bossRef.takeDamage(amount);
  }

  draw(ctx) {
    if (this.type === 'FOOT') {
      if (this.state === 'SHADOW') {
         ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
         ctx.beginPath();
         // Small growing shadow based on timer
         const progress = 1 - (this.shadowTimer / 60);
         ctx.ellipse(this.x + this.width/2, this.y + this.height/2, (this.width/2) * progress, (this.height/4) * progress, 0, 0, Math.PI * 2);
         ctx.fill();
      } else {
         ctx.fillStyle = '#1e293b'; // Shadow first
         ctx.beginPath();
         ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/4, 0, 0, Math.PI * 2);
         ctx.fill();
         // Draw foot
         ctx.fillStyle = '#ef4444';
         ctx.fillRect(this.x, this.y - 20, this.width, this.height + 20);
      }
    } else if (this.type === 'EYE') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'HAND') {
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else if (this.type === 'MEAT') {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    // Draw HP Bar if it has hp
    if (this.hp > 0 && this.maxHp) {
       ctx.fillStyle = 'black';
       ctx.fillRect(this.x, this.y - 10, this.width, 5);
       ctx.fillStyle = '#ef4444';
       ctx.fillRect(this.x, this.y - 10, this.width * (this.hp / this.maxHp), 5);
    }
  }
}

export class BossEntity {
  constructor(roomBounds) {
    this.hp = 100;
    this.maxHp = 100;
    this.markedForDeletion = false;
    this.state = 'IDLE'; // IDLE, ATTACKING
    this.stateTimer = 60; // Wait a bit before first attack
    this.roomBounds = roomBounds;
    this.parts = []; // Active parts (foot, eye, etc.)
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0 && !this.markedForDeletion) {
      this.markedForDeletion = true;
      // All parts die
      this.parts.forEach(p => p.markedForDeletion = true);
      // Trigger VICTORY
      const { useGameStore } = require('../../store/useGameStore');
      useGameStore.getState().setRoomState('VICTORY');
    }
  }

  update(dt, gameEngine) {
    if (this.markedForDeletion) return;
    
    // Sync parts deletion
    this.parts = this.parts.filter(p => !p.markedForDeletion);
    
    this.stateTimer -= dt;
    if (this.stateTimer <= 0) {
      this.performRandomAttack(gameEngine);
      this.stateTimer = 180 + Math.random() * 60; // 3-4 seconds between attacks
    }
  }

  performRandomAttack(gameEngine) {
    const attacks = ['STOMP', 'EYE', 'HAND', 'MEAT'];
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    const player = gameEngine.entities.players[0];
    if (!player) return;

    // Doors positions for Eye, Hand, Meat
    const doors = [
      { x: this.roomBounds.x + this.roomBounds.width/2 - 40, y: this.roomBounds.y - 20, w: 80, h: 40 }, // N
      { x: this.roomBounds.x + this.roomBounds.width/2 - 40, y: this.roomBounds.y + this.roomBounds.height - 20, w: 80, h: 40 }, // S
      { x: this.roomBounds.x - 20, y: this.roomBounds.y + this.roomBounds.height/2 - 40, w: 40, h: 80 }, // W
      { x: this.roomBounds.x + this.roomBounds.width - 20, y: this.roomBounds.y + this.roomBounds.height/2 - 40, w: 40, h: 80 } // E
    ];
    const door = doors[Math.floor(Math.random() * doors.length)];

    if (attack === 'STOMP' || (attack === 'HAND' && Math.random() > 0.5)) {
      // Stomp at player position
      const foot = new BossPart(player.x - 20, player.y - 20, 80, 80, 'FOOT', this);
      this.parts.push(foot);
      gameEngine.addEntity(foot, 'enemies');
      
      // We don't need manual distance check for player damage because GameEngine 
      // now handles enemy contact damage, and we set foot.damage = 2.
    } else if (attack === 'EYE') {
      const eye = new BossPart(door.x, door.y, door.w, door.h, 'EYE', this);
      this.parts.push(eye);
      gameEngine.addEntity(eye, 'enemies');
    } else if (attack === 'HAND') {
      const hand = new BossPart(door.x, door.y, door.w, door.h, 'HAND', this);
      this.parts.push(hand);
      gameEngine.addEntity(hand, 'enemies');
    } else if (attack === 'MEAT') {
      const meat = new BossPart(door.x, door.y, door.w, door.h, 'MEAT', this);
      this.parts.push(meat);
      gameEngine.addEntity(meat, 'enemies');
      
      // Spawn enemies
      setTimeout(() => {
        if (!meat.markedForDeletion && !this.markedForDeletion) {
          // Add basic enemies near meat
          for(let i=0; i<2; i++) {
            const minion = new MeleeChaser(meat.x + (Math.random()*40 - 20), meat.y + (Math.random()*40 - 20));
            minion.bossMinion = true;
            gameEngine.addEntity(minion, 'enemies');
          }
        }
      }, 500);
    }
  }

  draw(ctx) {
    // Boss doesn't draw itself globally, its parts are drawn via enemy list
    // But we can draw the Boss HP bar at the top
    ctx.fillStyle = '#000';
    ctx.fillRect(150, 20, 500, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(152, 22, (496 * (this.hp / this.maxHp)), 16);
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText("MAMÁ", 380, 35);
  }
}
