import { Entity } from './Entity';
import { useGameStore } from '../../store/useGameStore';

export class EnemyEntity extends Entity {
  constructor(x, y, width, height, speed, hp) {
    super(x, y, width, height, speed);
    this.hp = hp;
    this.maxHp = hp;
    this.damage = 1; // Contact damage to player
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.markedForDeletion = true;
    useGameStore.getState().killEnemy();
  }

  // Base enemy doesn't move on its own, subclasses override this
  update(dt, gameEngine) {
    super.update(dt);
  }
}
