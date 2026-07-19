import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  hp: 6, // 6 halves = 3 full hearts
  maxHp: 6,
  damage: 3.5,
  fireRate: 400, // ms between shots
  shotSpeed: 10,
  range: 300,
  movementSpeed: 5,
  
  takeDamage: (amount) => set((state) => ({ hp: Math.max(0, state.hp - amount) })),
  heal: (amount) => set((state) => ({ hp: Math.min(state.maxHp, state.hp + amount) })),
  upgradeStat: (stat, value) => set((state) => ({ [stat]: state[stat] + value })),
}));
