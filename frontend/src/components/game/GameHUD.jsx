import React, { useEffect } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useGameStore } from '../../store/useGameStore';
import { Heart } from 'lucide-react';

export const GameHUD = () => {
  const { hp, maxHp } = usePlayerStore();
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
      {/* Top Bar: Hearts and Room State */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          {renderHearts()}
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-white drop-shadow-md">
            {roomState === 'QUESTION' && 'Choose a Door'}
            {roomState === 'HOSTILE' && 'Clear the Room!'}
            {roomState === 'CLEAR' && 'Room Cleared'}
          </h2>
        </div>
      </div>

      {/* Center: Question Text */}
      {roomState === 'QUESTION' && currentQuestion && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-black/60 p-4 rounded-xl backdrop-blur-sm border border-white/20">
          <h1 className="text-3xl font-extrabold text-white">
            {currentQuestion.question}
          </h1>
        </div>
      )}
    </div>
  );
};
