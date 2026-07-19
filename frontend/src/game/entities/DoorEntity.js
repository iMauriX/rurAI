import { Entity } from './Entity';
import { useGameStore } from '../../store/useGameStore';

export class DoorEntity extends Entity {
  constructor(x, y, width, height, position, answerData) {
    super(x, y, width, height, 0);
    this.position = position; // NORTH, SOUTH, EAST, WEST
    this.answerData = answerData; // { text: "4", correct: true }
    this.isSolid = false;
  }

  update(dt, gameEngine) {
    // If room is hostile, doors become solid walls
    const state = useGameStore.getState().roomState;
    this.isSolid = (state === 'HOSTILE');
  }

  draw(ctx) {
    const roomState = useGameStore.getState().roomState;
    
    // Determine door color based on state
    let doorColor = '#0f172a'; // Default slate
    if (roomState === 'CLEAR') {
      doorColor = this.answerData.correct ? '#22c55e' : '#334155'; // Green for correct, dark grey for incorrect
    } else if (roomState === 'HOSTILE') {
      doorColor = '#ef4444'; // Red for locked/hostile
    }

    // Draw door frame
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Fill if solid
    if (this.isSolid || (roomState === 'CLEAR' && !this.answerData.correct)) {
      ctx.fillStyle = doorColor;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Draw answer text above/next to the door
    if (this.answerData && this.answerData.text) {
      // Hide text for incorrect doors when clear
      if (roomState === 'CLEAR' && !this.answerData.correct) return;

      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px system-ui';
      ctx.textAlign = 'center';
      
      // Position text based on door position
      let textX = this.x + this.width / 2;
      let textY = this.y - 15;
      
      // If it's a vertical door (West/East), adjust text to not overlap
      if (this.position === 'WEST') {
        textX = this.x - 10;
        textY = this.y + this.height / 2 + 7;
        ctx.textAlign = 'right';
      } else if (this.position === 'EAST') {
        textX = this.x + this.width + 10;
        textY = this.y + this.height / 2 + 7;
        ctx.textAlign = 'left';
      } else if (this.position === 'NORTH') {
        textY = this.y + this.height + 25; // Draw text below north door so it's inside the room
      }
      
      ctx.fillText(this.answerData.text, textX, textY);
    }
  }
}
