import React, { useEffect } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useGameStore } from '../../store/useGameStore';
import { Heart } from 'lucide-react';

export const GameHUD = () => {
  const { hp, maxHp, lastBonus, damage, fireRate, movementSpeed } = usePlayerStore();
  const { currentQuestion, roomState } = useGameStore();

  const renderHearts = () => {
    const hearts = [];
    const fullHearts = Math.floor(hp / 2);
    const halfHeart = hp % 2 !== 0;

    for (let i = 0; i < maxHp / 2; i++) {
      if (i < fullHearts) {
        hearts.push(<Heart key={i} className="text-red-500 fill-red-500" size={32} />);
      } else if (i === fullHearts && halfHeart) {
        // Simple half heart representation
        hearts.push(
          <div key={i} className="relative w-8 h-8 flex items-center justify-center">
            <Heart className="absolute text-red-500" size={32} />
            <div className="absolute right-0 top-0 w-4 h-8 bg-slate-900 z-10" />
            <Heart className="absolute text-slate-500 z-0" size={32} />
          </div>
        );
      } else {
        hearts.push(<Heart key={i} className="text-slate-500" size={32} />);
      }
    }
    return hearts;
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
      {/* Top Bar: Room State */}
      <div className="flex justify-end items-start">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-white drop-shadow-md">
            {roomState === 'QUESTION' && 'Choose a Door'}
            {roomState === 'HOSTILE' && 'Clear the Room!'}
            {roomState === 'CLEAR' && 'Room Cleared'}
            {roomState === 'BOSS_FIGHT' && 'DEFEAT MAMÁ!'}
          </h2>
        </div>
      </div>

      {/* Bottom Bar: Hearts and Stats */}
      <div className="flex flex-col gap-2 self-start">
        {lastBonus && (
          <div className="bg-yellow-400/90 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm animate-bounce self-start shadow-lg border border-yellow-300">
            {lastBonus}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {renderHearts()}
          </div>
          <div className="flex gap-4 text-sm font-mono text-white/90 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 shadow-xl backdrop-blur-sm">
             <span title="Daño">⚔️ {damage.toFixed(1)}</span>
             <span title="Velocidad Disparo">⏱️ {fireRate}ms</span>
             <span title="Velocidad Movimiento">🏃 {movementSpeed}</span>
          </div>
        </div>
      </div>

      {/* Center: Question Text */}
      {roomState === 'QUESTION' && currentQuestion && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-black/60 p-4 rounded-xl backdrop-blur-sm border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-extrabold text-white">
            {currentQuestion.question}
          </h1>
        </div>
      )}

      {/* BOSS INTRO Overlay */}
      {roomState === 'BOSS_INTRO' && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 pointer-events-none">
          <h1 className="text-7xl font-black text-red-600 mb-8 drop-shadow-[0_0_20px_rgba(220,38,38,1)] animate-[pulse_0.5s_ease-in-out_infinite] scale-150 transform tracking-widest">
            MAMÁ IS HERE!
          </h1>
        </div>
      )}

      {/* GAME OVER Overlay */}
      {roomState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 pointer-events-auto">
          <h1 className="text-6xl font-black text-red-600 mb-8 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">GAME OVER</h1>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* VICTORY Overlay */}
      {roomState === 'VICTORY' && (
        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-50 pointer-events-auto">
          <h1 className="text-6xl font-black text-yellow-500 mb-8 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">¡FELICIDADES!</h1>
          <p className="text-xl font-bold text-slate-800 mb-8">Has derrotado a Mamá</p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg"
            >
              Jugar de Nuevo
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg shadow-lg"
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
