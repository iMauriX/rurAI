import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../../game/core/GameEngine';
import { InputManager } from '../../game/core/InputManager';
import { DoorEntity } from '../../game/entities/DoorEntity';
import { useGameStore } from '../../store/useGameStore';
import { MeleeChaser } from '../../game/entities/MeleeChaser';
import { RangedShooter } from '../../game/entities/RangedShooter';

export const GameCanvas = () => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  
  const doors = useGameStore((state) => state.doors);
  const roomState = useGameStore((state) => state.roomState);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const inputManager = new InputManager();
    const engine = new GameEngine(canvas, inputManager);
    engineRef.current = engine;

    engine.start();

    return () => {
      engine.stop();
      inputManager.cleanup();
    };
  }, []); // Only run once on mount

  // Sync doors when room state changes
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    // Reset doors
    engine.entities.doors = [];
    
    // Create door entities based on store
    doors.forEach(doorData => {
      let x, y, width, height;
      
      // Map positions to overlap slightly into the room bounds (50, 50, 700, 500)
      if (doorData.position === 'NORTH') { x = 350; y = 40; width = 100; height = 20; }
      else if (doorData.position === 'SOUTH') { x = 350; y = 540; width = 100; height = 20; }
      else if (doorData.position === 'WEST') { x = 40; y = 250; width = 20; height = 100; }
      else if (doorData.position === 'EAST') { x = 740; y = 250; width = 20; height = 100; }

      const door = new DoorEntity(x, y, width, height, doorData.position, doorData);
      engine.addEntity(door, 'doors');
    });

    if (roomState === 'CLEAR' || roomState === 'BOSS_FIGHT') {
      engine.entities.projectiles = [];
    }
  }, [doors, roomState]);

  return (
    <canvas 
      ref={canvasRef}
      width={800} 
      height={600} 
      className="rounded-lg shadow-2xl border-4 border-slate-700 mx-auto block"
    />
  );
};
