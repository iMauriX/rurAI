import { Physics } from './Physics';
import { PlayerEntity } from '../entities/PlayerEntity';
import { WallEntity } from '../entities/WallEntity';
import { BossEntity } from '../entities/BossEntity';
import { MeleeChaser } from '../entities/MeleeChaser';
import { RangedShooter } from '../entities/RangedShooter';
import { FloatingTextEntity } from '../entities/FloatingTextEntity';
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
      items: [],
      walls: [],
      bosses: [],
      effects: []
    };
    
    this.roomBounds = {
      x: 50,
      y: 50,
      width: 700,
      height: 500
    };

    // Keep track of room ID to trigger generation
    this.currentRoomIndex = -1;

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

  generateRoom(roomState, roomsCleared) {
    // Clear room-specific entities
    this.entities.projectiles = [];
    this.entities.walls = [];
    this.entities.enemies = [];
    this.entities.bosses = [];
    this.entities.effects = [];
    
    const player = this.entities.players[0];
    if (player) {
      player.x = 400;
      player.y = 300;
    }

    if (roomState === 'BOSS_FIGHT') {
      this.entities.bosses.push(new BossEntity(this.roomBounds));
      return;
    }

    // Generate random walls
    for(let i=0; i<8; i++) {
      const isDestructible = Math.random() > 0.5;
      const w = 40;
      const h = 40;
      let rx, ry;
      let safe = false;
      let attempts = 0;
      while(!safe && attempts < 50) {
        rx = this.roomBounds.x + 40 + Math.random() * (this.roomBounds.width - 120);
        ry = this.roomBounds.y + 40 + Math.random() * (this.roomBounds.height - 120);
        // Avoid center spawn area
        if (Math.hypot(rx - 400, ry - 300) > 100) {
          safe = true;
        }
        attempts++;
      }
      if (safe) {
        this.addEntity(new WallEntity(rx, ry, w, h, isDestructible), 'walls');
      }
    }
  }

  loop(timestamp) {
    const gameStore = useGameStore.getState();
    if (gameStore.roomState === 'GAME_OVER' || gameStore.roomState === 'VICTORY' || gameStore.roomState === 'BOSS_INTRO') {
       // Allow effects to animate during INTRO or freeze if OVER/VICTORY
       if (gameStore.roomState === 'BOSS_INTRO') {
          const dt = (timestamp - this.lastTime) / 1000 * 60;
          this.lastTime = timestamp;
          this.entities.effects.forEach(e => e.update(dt));
          this.render();
          this.animationId = requestAnimationFrame((ts) => this.loop(ts));
       }
       return;
    }

    const dt = (timestamp - this.lastTime) / 1000 * 60; // normalized delta time
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame((ts) => this.loop(ts));
  }

  update(dt) {
    const gameStore = useGameStore.getState();
    const playerStore = usePlayerStore.getState();

    // Check if room changed
    if (gameStore.roomsCleared !== this.currentRoomIndex || (gameStore.roomState === 'BOSS_FIGHT' && this.entities.bosses.length === 0)) {
      this.currentRoomIndex = gameStore.roomsCleared;
      this.generateRoom(gameStore.roomState, gameStore.roomsCleared);
    }

    // Boss spawning enemies trigger (hostile state handled via enterDoor)
    if (gameStore.roomState === 'HOSTILE' && this.entities.enemies.length === 0 && gameStore.enemiesAlive > 0) {
       for(let i=0; i<3; i++) {
         const EnemyType = Math.random() > 0.5 ? MeleeChaser : RangedShooter;
         this.addEntity(new EnemyType(
           this.roomBounds.x + 100 + Math.random()*500,
           this.roomBounds.y + 100 + Math.random()*300
         ), 'enemies');
       }
    }

    // Check Game Over
    if (playerStore.hp <= 0 && gameStore.roomState !== 'GAME_OVER') {
       gameStore.setRoomState('GAME_OVER');
    }

    // 1. Update entities
    Object.keys(this.entities).forEach(group => {
      this.entities[group].forEach(entity => {
        // Boss and Enemies receive gameEngine instead of inputManager
        if (group === 'bosses' || group === 'enemies') {
          entity.update(dt, this);
        } else {
          entity.update(dt, this.inputManager, this);
        }
        
        // Wall collisions (bounding box limits)
        if (group !== 'doors' && group !== 'bosses' && group !== 'walls' && group !== 'effects') {
          const hitWall = Physics.resolveWallCollision(entity, this.roomBounds);
          if (hitWall && group === 'projectiles') {
            entity.markedForDeletion = true;
          }
        }
      });
    });

    const player = this.entities.players[0];
    
    if (player) {
      // Dynamic internal wall collisions
      this.entities.walls.forEach(wall => {
         Physics.resolveAABBCollision(player, wall);
      });

      this.entities.enemies.forEach((enemy, index) => {
        // Enforce enemy vs enemy separation
        for (let j = index + 1; j < this.entities.enemies.length; j++) {
           const other = this.entities.enemies[j];
           if (Physics.checkAABB(enemy, other)) {
              const dx = enemy.x - other.x;
              const dy = enemy.y - other.y;
              if (enemy.vx !== undefined && other.vx !== undefined) {
                 enemy.x += dx * 0.05;
                 enemy.y += dy * 0.05;
                 other.x -= dx * 0.05;
                 other.y -= dy * 0.05;
              }
           }
        }

        // Enemies vs walls
        this.entities.walls.forEach(wall => {
          if (Physics.checkAABB(enemy, wall)) {
             if (enemy.type === 'FOOT') {
                wall.takeDamage(3);
             } else if (enemy.vx !== undefined) {
                Physics.resolveAABBCollision(enemy, wall);
             }
          }
        });

        // Player vs Enemies
        if (Physics.checkAABB(player, enemy)) {
          if (enemy.damage && player.iFrames <= 0) {
            playerStore.takeDamage(enemy.damage);
            this.addEntity(new FloatingTextEntity(player.x + player.width/2, player.y - 10, `-${enemy.damage}`, '#ef4444'), 'effects');
            player.vx += (player.x - enemy.x) * 0.5;
            player.vy += (player.y - enemy.y) * 0.5;
            player.iFrames = 60; // 1 second invincibility (assuming 60fps)
          }
        }
      });

      // Player vs Doors (Enter Door)
      if (gameStore.roomState === 'QUESTION') {
        this.entities.doors.forEach(door => {
          if (Physics.checkAABB(player, door)) {
             const isCorrect = door.answerData.correct;
             gameStore.enterDoor(isCorrect);
          }
        });
      }
    }

    // Projectiles Collisions
    this.entities.projectiles.forEach(proj => {
      // Proj vs Walls
      this.entities.walls.forEach(wall => {
         if (Physics.checkAABB(proj, wall)) {
            proj.markedForDeletion = true;
            wall.takeDamage(1);
         }
      });

      if (proj.isEnemyProjectile) {
        if (player && Physics.checkAABB(proj, player) && player.iFrames <= 0) {
          playerStore.takeDamage(proj.damage);
          this.addEntity(new FloatingTextEntity(player.x + player.width/2, player.y - 10, `-${proj.damage}`, '#ef4444'), 'effects');
          player.iFrames = 60;
          proj.markedForDeletion = true;
        }
      } else {
        // Player Proj vs Enemies (including boss parts)
        let hit = false;
        
        // Check bosses first
        this.entities.bosses.forEach(boss => {
          boss.parts.forEach(part => {
            if (!hit && Physics.checkAABB(proj, part)) {
              if (part.type !== 'SHADOW') { // Don't damage shadow
                part.takeDamage(proj.damage);
                this.addEntity(new FloatingTextEntity(part.x + part.width/2, part.y - 10, proj.damage, '#fbbf24'), 'effects');
                proj.markedForDeletion = true;
                hit = true;
              }
            }
          });
        });

        if (!hit) {
          this.entities.enemies.forEach(enemy => {
            if (!hit && Physics.checkAABB(proj, enemy)) {
              enemy.takeDamage(proj.damage);
              this.addEntity(new FloatingTextEntity(enemy.x + enemy.width/2, enemy.y - 10, proj.damage, '#fbbf24'), 'effects');
              proj.markedForDeletion = true;
              hit = true;
            }
          });
        }
      }
    });

    // Cleanup marked for deletion
    Object.keys(this.entities).forEach(group => {
      this.entities[group] = this.entities[group].filter(e => !e.markedForDeletion);
    });
  }

  render() {
    this.ctx.fillStyle = '#1e293b'; // Slate-800 bg
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Floor
    const gameStore = useGameStore.getState();
    this.ctx.fillStyle = gameStore.roomState === 'BOSS_FIGHT' ? '#451a03' : '#cbd5e1'; 
    this.ctx.fillRect(this.roomBounds.x, this.roomBounds.y, this.roomBounds.width, this.roomBounds.height);

    // Draw entities
    this.entities.doors.forEach(e => e.draw(this.ctx));
    this.entities.walls.forEach(e => e.draw(this.ctx));
    this.entities.items.forEach(e => e.draw(this.ctx));
    this.entities.enemies.forEach(e => e.draw(this.ctx));
    this.entities.players.forEach(e => e.draw(this.ctx));
    this.entities.projectiles.forEach(e => e.draw(this.ctx));
    this.entities.bosses.forEach(e => e.draw(this.ctx)); // HP Bar
  }
}
