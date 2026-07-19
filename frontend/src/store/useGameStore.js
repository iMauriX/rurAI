import { create } from 'zustand';

export const useGameStore = create((set) => ({
  roomState: 'QUESTION', // CLEAR, HOSTILE, QUESTION
  currentQuestion: {
    question: "What is 2 + 2?",
    correct: "4",
    distractors: ["3", "5", "6"]
  },
  doors: [], // Array of objects { answer: string, correct: boolean, position: string }
  enemiesAlive: 0,
  
  setRoomState: (state) => set({ roomState: state }),
  
  enterRoom: (isCorrect) => set((state) => {
    // Deprecated from old logic, but keeping for compatibility just in case
    if (isCorrect) return { roomState: 'CLEAR' };
    else return { roomState: 'HOSTILE', enemiesAlive: 3 }; 
  }),

  shootDoor: (isCorrect) => set((state) => {
    if (state.roomState !== 'QUESTION') return state; // Only trigger if in QUESTION state
    
    if (isCorrect) {
      return { roomState: 'CLEAR' }; // Door opens
    } else {
      return { roomState: 'HOSTILE', enemiesAlive: 3 }; // Spawn enemies
    }
  }),
  
  nextRoom: () => set((state) => {
    // Here we would load the next question from data
    // For now we just reset the doors to question state
    return { roomState: 'QUESTION' };
  }),
  
  killEnemy: () => set((state) => {
    const newCount = Math.max(0, state.enemiesAlive - 1);
    return {
      enemiesAlive: newCount,
      roomState: newCount === 0 ? 'QUESTION' : 'HOSTILE' // Go back to QUESTION to try again!
    };
  }),

  setupDoors: (question) => {
    const answers = [
      { text: question.correct, correct: true },
      ...question.distractors.map(d => ({ text: d, correct: false }))
    ];
    // Shuffle array
    answers.sort(() => Math.random() - 0.5);
    
    set({
      currentQuestion: question,
      doors: [
        { ...answers[0], position: 'NORTH' },
        { ...answers[1], position: 'SOUTH' },
        { ...answers[2], position: 'EAST' },
        { ...answers[3], position: 'WEST' },
      ],
      roomState: 'QUESTION'
    });
  }
}));
