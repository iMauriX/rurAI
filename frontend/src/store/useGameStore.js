import { create } from 'zustand';
import { usePlayerStore } from './usePlayerStore';

export const useGameStore = create((set, get) => ({
  roomState: 'QUESTION', // QUESTION, HOSTILE, BOSS_FIGHT, GAME_OVER, VICTORY
  questions: [],
  roomsCleared: 0,
  currentQuestion: null,
  doors: [], // Array of objects { answer: string, correct: boolean, position: string }
  enemiesAlive: 0,
  
  setRoomState: (state) => set({ roomState: state }),
  
  setupGame: (data) => {
    let qs = [];
    if (data && data.escenas && data.escenas.length > 0) {
      qs = data.escenas;
    } else if (data && data.preguntas && data.preguntas.length > 0) {
      qs = data.preguntas;
    } else {
      qs = Array.from({length: 5}, (_, i) => ({
        pregunta: `¿Pregunta de prueba ${i+1}?`,
        opciones: ["Correcta", "Falsa 1", "Falsa 2", "Falsa 3"],
        respuesta: 0
      }));
    }
    
    set({ questions: qs, roomsCleared: 0, roomState: 'QUESTION' });
    get().loadRoom(0);
  },

  loadRoom: (index, isPenalized = false) => {
    const { questions } = get();
    if (index >= 5 || index >= questions.length) {
      set({ roomState: 'BOSS_INTRO', doors: [] });
      setTimeout(() => {
        set({ roomState: 'BOSS_FIGHT' });
      }, 3000);
      return;
    }

    const q = questions[index];
    const correctIdx = q.respuesta !== undefined ? q.respuesta : q.correctIndex || 0;
    const distractors = q.opciones ? q.opciones.filter((_, i) => i !== correctIdx) : q.distractors || ["A", "B", "C"];
    const correctText = q.opciones ? q.opciones[correctIdx] : q.correct || "Correcta";

    const answers = [
      { text: correctText, correct: true },
      ...distractors.map(d => ({ text: d, correct: false }))
    ];
    answers.sort(() => Math.random() - 0.5);
    
    set({
      currentQuestion: { question: q.pregunta || q.question },
      doors: isPenalized ? [] : [
        { ...answers[0], position: 'NORTH' },
        { ...answers[1], position: 'SOUTH' },
        { ...answers[2], position: 'EAST' },
        { ...answers[3], position: 'WEST' },
      ],
      roomState: isPenalized ? 'HOSTILE' : 'QUESTION',
      enemiesAlive: isPenalized ? 3 : 0,
      roomsCleared: index
    });
  },

  enterDoor: (isCorrect) => {
    const { roomState, roomsCleared } = get();
    if (roomState !== 'QUESTION') return;
    
    if (isCorrect) {
      usePlayerStore.getState().applyRandomBonus();
      get().loadRoom(roomsCleared + 1, false);
    } else {
      // Advance to next room immediately but penalized (HOSTILE with no doors)
      get().loadRoom(roomsCleared + 1, true);
    }
  },
  
  killEnemy: () => set((state) => {
    const newCount = Math.max(0, state.enemiesAlive - 1);
    if (newCount === 0 && state.roomState === 'HOSTILE') {
      // Once enemies are dead, we advance to next room immediately
      setTimeout(() => {
        get().loadRoom(state.roomsCleared + 1);
      }, 500); // Small delay to let player see the last enemy die
    }
    return { enemiesAlive: newCount };
  }),
}));
