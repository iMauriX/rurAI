import { Physics } from './Physics';
import { PlayerEntity } from '../entities/PlayerEntity';
import { useGameStore } from '../../store/useGameStore';
import { usePlayerStore } from '../../store/usePlayerStore';

export class GameEngine {
  constructor(canvas, inputManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.inputManager = inputManager;
    
    this.lastTime = 0;
    this.animationId = null;
    
    this.entities = {
      players: [],
      enemies: [],
      projectiles: [],
      doors: [],
      items: []
    };
    
    this.roomBounds = {
      x: 50,
      y: 50,
      width: 700,
      height: 500
    };

    // Initialize player in the center of the static room
    this.addEntity(new PlayerEntity(400, 300), 'players');
  }

  start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  addEntity(entity, group) {
    if (this.entities[group]) {
      this.entities[group].push(entity);
    }
  }

  loop(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000 * 60; // normalized delta time (60 fps basis)
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame((ts) => this.loop(ts));
  }

  update(dt) {
    const gameStore = useGameStore.getState();
    const playerStore = usePlayerStore.getState();

    // 1. Update all entities
    Object.keys(this.entities).forEach(group => {
      this.entities[group].forEach(entity => {
        entity.update(dt, this.inputManager, this);
        
        // Wall collisions
        if (group !== 'doors') {
          const hitWall = Physics.resolveWallCollision(entity, this.roomBounds);
          if (hitWall && group === 'projectiles') {
            entity.markedForDeletion = true;
          }
        }
      });
    });

    // 2. Check Collisions
    const player = this.entities.players[0];
    
    if (player) {
      // Player vs Doors (Room Transition when CLEAR)
      if (gameStore.roomState === 'CLEAR') {
        this.entities.doors.forEach(door => {
          // If door is correct and we collide with it, we go to next room
          if (door.answerData.correct && Physics.checkAABB(player, door)) {
            gameStore.nextRoom();
            player.x = 400;
            player.y = 300;
            this.entities.projectiles = [];
          }
        });
      }

      // Player vs Enemies (Melee damage)
      this.entities.enemies.forEach(enemy => {
        if (Physics.checkAABB(player, enemy)) {
          playerStore.takeDamage(enemy.damage);
          // Knockback
          player.vx += (player.x - enemy.x) * 0.5;
          player.vy += (player.y - enemy.y) * 0.5;
        }
      });
    }

    // Projectiles vs Entities
    this.entities.projectiles.forEach(proj => {
      if (proj.isEnemyProjectile) {
        if (player && Physics.checkAABB(proj, player)) {
          playerStore.takeDamage(proj.damage);
          proj.markedForDeletion = true;
        }
      } else {
        // Player Projectiles vs Enemies
        this.entities.enemies.forEach(enemy => {
          if (Physics.checkAABB(proj, enemy)) {
            enemy.takeDamage(proj.damage);
            proj.markedForDeletion = true;
            enemy.vx += proj.vx * 0.2;
            enemy.vy += proj.vy * 0.2;
          }
        });
        
        // Player Projectiles vs Doors
        this.entities.doors.forEach(door => {
          if (Physics.checkAABB(proj, door)) {
            proj.markedForDeletion = true;
            
            // Si le disparamos a una puerta en estado de QUESTION
            if (gameStore.roomState === 'QUESTION') {
              const isCorrect = door.answerData.correct;
              gameStore.shootDoor(isCorrect);
              
              if (isCorrect) {
                // Mejora de arma
                playerStore.upgradeStat('damage', 1); // +1 Daño
                playerStore.upgradeStat('fireRate', -50); // Dispara más rápido
              }
            }
          }
        });
      }
    });

    // 3. Remove deleted entities
    Object.keys(this.entities).forEach(group => {
      this.entities[group] = this.entities[group].filter(e => !e.markedForDeletion);
    });
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1e293b'; // Slate-800 bg
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Room
    this.ctx.fillStyle = '#cbd5e1'; // Slate-300 floor
    this.ctx.fillRect(
      this.roomBounds.x,
      this.roomBounds.y,
      this.roomBounds.width,
      this.roomBounds.height
    );

    // Draw entities
    this.entities.doors.forEach(e => e.draw(this.ctx));
    this.entities.items.forEach(e => e.draw(this.ctx));
    this.entities.enemies.forEach(e => e.draw(this.ctx));
    this.entities.players.forEach(e => e.draw(this.ctx));
    this.entities.projectiles.forEach(e => e.draw(this.ctx));
  }
}
