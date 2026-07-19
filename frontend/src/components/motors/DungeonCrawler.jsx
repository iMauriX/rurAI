import React, { useEffect } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { GameHUD } from '../game/GameHUD';
import { useGameStore } from '../../store/useGameStore';

const DungeonCrawler = ({ data }) => {
  const setupDoors = useGameStore((state) => state.setupDoors);

  useEffect(() => {
    // Si data tiene el formato esperado del backend, lo inyectamos
    if (data && data.preguntas && data.preguntas.length > 0) {
      // Cargamos la primera pregunta para inicializar
      const q = data.preguntas[0];
      setupDoors({
        question: q.pregunta || q.question,
        correct: q.correcta || q.correct,
        distractors: q.incorrectas || q.distractors
      });
    } else {
      // Fallback para pruebas sin datos
      setupDoors({
        question: "¿Cuánto es 2 + 2?",
        correct: "4",
        distractors: ["3", "5", "6"]
      });
    }
  }, [data, setupDoors]);

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
