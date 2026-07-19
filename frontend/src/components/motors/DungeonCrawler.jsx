import React, { useEffect } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { GameHUD } from '../game/GameHUD';
import { useGameStore } from '../../store/useGameStore';

const DungeonCrawler = ({ data }) => {
  const setupGame = useGameStore((state) => state.setupGame);

  useEffect(() => {
    setupGame(data);
  }, [data, setupGame]);

  return (
    <div className="w-full flex justify-center items-center flex-col">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-teal-400">Top-Down Dungeon Crawler</h2>
        <p className="text-slate-400 text-sm">WASD para moverte - Flechas para disparar</p>
      </div>
      <div className="relative" style={{ width: '800px', height: '600px' }}>
        <GameCanvas />
        <GameHUD />
      </div>
    </div>
  );
};

export default DungeonCrawler;
