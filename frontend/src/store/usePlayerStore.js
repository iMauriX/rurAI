import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  hp: 6,
  maxHp: 6,
  damage: 3.5,
  fireRate: 400,
  shotSpeed: 10,
  range: 300,
  movementSpeed: 5,
  lastBonus: null,
  
  takeDamage: (amount) => set((state) => {
    const newHp = Math.max(0, state.hp - amount);
    return { hp: newHp };
  }),
  heal: (amount) => set((state) => ({ hp: Math.min(state.maxHp, state.hp + amount) })),
  upgradeStat: (stat, value) => set((state) => {
    if (stat === 'fireRate') {
      return { fireRate: Math.max(100, state.fireRate + value) };
    }
    return { [stat]: state[stat] + value };
  }),
  clearBonus: () => set({ lastBonus: null }),
  setBonusMessage: (msg) => {
    set({ lastBonus: msg });
    setTimeout(() => {
      usePlayerStore.getState().clearBonus();
    }, 3000);
  },
  applyRandomBonus: () => set((state) => {
    const bonuses = [
      { name: '+Vida', apply: (s) => ({ maxHp: s.maxHp + 2, hp: s.maxHp + 2 }) },
      { name: '+Daño', apply: (s) => ({ damage: s.damage + 1.5 }) },
      { name: '+Velocidad Disparo', apply: (s) => ({ fireRate: Math.max(100, s.fireRate - 50) }) },
      { name: '+Velocidad', apply: (s) => ({ movementSpeed: Math.min(8, s.movementSpeed + 1) }) }
    ];
    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
    
    // Clear after 3 seconds
    setTimeout(() => {
      usePlayerStore.getState().clearBonus();
    }, 3000);

    return { ...bonus.apply(state), lastBonus: bonus.name };
  })
}));
