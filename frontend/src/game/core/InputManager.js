export class InputManager {
  constructor() {
    this.keys = {};
    
    this.handleKeyDown = (e) => {
      this.keys[e.key] = true;
      if (e.key.length === 1) {
        this.keys[e.key.toLowerCase()] = true; // handle CapsLock/Shift
      }
    };
    
    this.handleKeyUp = (e) => {
      this.keys[e.key] = false;
      if (e.key.length === 1) {
        this.keys[e.key.toLowerCase()] = false;
      }
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  isKeyDown(key) {
    return !!this.keys[key];
  }
  
  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
