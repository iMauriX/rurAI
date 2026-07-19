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
      if (roomState === 'HOSTILE') return; // Hide text when hostile

      const text = this.answerData.text;
      ctx.font = 'bold 20px system-ui';
      const textMetrics = ctx.measureText(text);
      const paddingX = 12;
      const paddingY = 8;
      const bgWidth = textMetrics.width + paddingX * 2;
      const bgHeight = 30 + paddingY * 2;
      
      let bgX, bgY;
      
      // Position text box to ensure it's inside the room bounds
      if (this.position === 'WEST') {
        bgX = this.x + this.width + 10;
        bgY = this.y + this.height / 2 - bgHeight / 2;
      } else if (this.position === 'EAST') {
        bgX = this.x - bgWidth - 10;
        bgY = this.y + this.height / 2 - bgHeight / 2;
      } else if (this.position === 'NORTH') {
        bgX = this.x + this.width / 2 - bgWidth / 2;
        bgY = this.y + this.height + 10;
      } else { // SOUTH
        bgX = this.x + this.width / 2 - bgWidth / 2;
        bgY = this.y - bgHeight - 10;
      }

      // Draw text background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // Dark slate background, slightly transparent
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bgX + bgWidth / 2, bgY + bgHeight / 2);
    }
  }
}
