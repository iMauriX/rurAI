import { useState, useEffect, useRef } from 'react';
import { Zap, ShieldAlert, Heart, Play, RefreshCw, AlertTriangle, ArrowUpCircle, Shield, Trash2, Cpu, Crosshair } from 'lucide-react';

const COLS = 20;
const ROWS = 15;
const CELL_SIZE = 40;
const MAX_TOWERS = 15;
const MAX_WAVES = 8;

const PATH_POOL_LEFT = [
  [{ x: -1, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 12 }, { x: 8, y: 12 }, { x: 8, y: 7 }, { x: 10, y: 7 }],
  [{ x: -1, y: 12 }, { x: 3, y: 12 }, { x: 3, y: 3 }, { x: 8, y: 3 }, { x: 8, y: 7 }, { x: 10, y: 7 }]
];
const PATH_POOL_RIGHT = [
  [{ x: 20, y: 12 }, { x: 15, y: 12 }, { x: 15, y: 2 }, { x: 12, y: 2 }, { x: 12, y: 7 }, { x: 10, y: 7 }],
  [{ x: 20, y: 2 }, { x: 16, y: 2 }, { x: 16, y: 11 }, { x: 12, y: 11 }, { x: 12, y: 7 }, { x: 10, y: 7 }]
];
const PATH_POOL_TOP_BOTTOM = [
  [{ x: 10, y: -1 }, { x: 10, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 7 }, { x: 10, y: 7 }],
  [{ x: 10, y: 15 }, { x: 10, y: 12 }, { x: 18, y: 12 }, { x: 18, y: 7 }, { x: 10, y: 7 }]
];

const MAX_HP = 100;
const TOWER_TYPES = {
  'laser': { cost: 60, baseDmg: 80, baseRange: 130, baseCooldown: 30, color: '#3b82f6', label: 'Láser', type: 'single' },
  'escopeta': { cost: 200, baseDmg: 60, baseRange: 95, baseCooldown: 40, color: '#f97316', label: 'Escopeta', type: 'spread' },
  'ballesta': { cost: 450, baseDmg: 40, baseRange: 220, baseCooldown: 8, color: '#10b981', label: 'Ballesta', type: 'fast' }
};

const getUpgradeCost = (type, level) => {
  const baseCost = TOWER_TYPES[type].cost;
  if (level === 1) return baseCost * 2;
  if (level === 2) return baseCost * 4;
  return Infinity;
};

const ClasificadorDefensivo = ({ data, onGameEnd }) => {
  const [fase, setFase] = useState('CINEMATICA_INICIAL'); 
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [preguntasTrivia] = useState(data.preguntasTrivia || []);
  const [preguntasRespondidasEnFase, setPreguntasRespondidasEnFase] = useState(0);
  
  const [energiaUI, setEnergiaUI] = useState(0);
  const [hpUI, setHpUI] = useState(MAX_HP);
  const [oleadaUI, setOleadaUI] = useState(1);
  const [panicUsado, setPanicUsado] = useState(false);
  const [panicTimerUI, setPanicTimerUI] = useState(0);
  
  const [selectedCell, setSelectedCell] = useState(null); 
  const [selectedTowerTypeUI, setSelectedTowerTypeUI] = useState('laser'); 
  const [torresCount, setTorresCount] = useState(0);

  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  const initialActivePaths = [];
  initialActivePaths.push(PATH_POOL_LEFT[Math.floor(Math.random() * PATH_POOL_LEFT.length)]);
  initialActivePaths.push(PATH_POOL_RIGHT[Math.floor(Math.random() * PATH_POOL_RIGHT.length)]);
  if (Math.random() > 0.5) initialActivePaths.push(PATH_POOL_TOP_BOTTOM[Math.floor(Math.random() * PATH_POOL_TOP_BOTTOM.length)]);

  const initialDecorations = [];
  for(let i=0; i<40; i++) {
     initialDecorations.push({
        x: Math.floor(Math.random() * COLS), 
        y: Math.floor(Math.random() * ROWS),
        type: Math.floor(Math.random() * 3)
     });
  }
  
  const gameState = useRef({
    energia: 0,
    hp: MAX_HP,
    oleada: 1,
    enemigos: [],
    torres: [],
    proyectiles: [], 
    particulas: [],
    textos: [],
    frame: 0,
    spawnTimer: 0,
    enemigosRestantesOleada: 15,
    faseActiva: false,
    shakeTimer: 0,
    panicTimer: 0,
    triggerBonus: false,
    bonusCount: 0,
    hoveredCell: null,
    activePaths: initialActivePaths,
    decoraciones: initialDecorations,
    tipoAConstruir: 'laser',
    aciertos: 0,
    errores: 0
  });

  const cambiarTipoTorre = (tipo) => {
    setSelectedTowerTypeUI(tipo);
    gameState.current.tipoAConstruir = tipo;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergiaUI(gameState.current.energia);
      setHpUI(Math.max(0, gameState.current.hp));
      setOleadaUI(gameState.current.oleada);
      setTorresCount(gameState.current.torres.length);
      setPanicTimerUI(gameState.current.panicTimer);
      
      if (gameState.current.hp <= 0 && gameState.current.faseActiva) {
        gameState.current.faseActiva = false;
        setFase('GAME_OVER');
        if (onGameEnd) onGameEnd({ aciertos: gameState.current.aciertos, errores: gameState.current.errores });
      } else if (gameState.current.oleada > MAX_WAVES && gameState.current.enemigos.length === 0 && gameState.current.enemigosRestantesOleada === 0) {
        gameState.current.faseActiva = false;
        setFase('VICTORIA');
        if (onGameEnd) onGameEnd({ aciertos: gameState.current.aciertos, errores: gameState.current.errores });
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fase === 'PREGUNTA_BONUS_TRANSITION') {
      const timer = setTimeout(() => setFase('TRIVIA_BONUS'), 1500);
      return () => clearTimeout(timer);
    }
    if (fase === 'RONDA_TERMINADA') {
      const timer = setTimeout(() => {
        setFase('TRANSICION_TRIVIA');
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (fase === 'TRANSICION_TRIVIA') {
      const timer = setTimeout(() => {
        if (gameState.current.oleada === 1) {
          setFase('TRIVIA_INICIAL');
        } else {
          setFase('TRIVIA_INTER_OLEADA');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [fase]);

  const iniciarJuego = () => {
    setFase('TRANSICION_TRIVIA');
  };

  const spawnFloatingText = (x, y, text, color, fontSize = 16) => {
    gameState.current.textos.push({ x, y, text, color, life: 50, maxLife: 50, fontSize });
  };

  const spawnExplosion = (x, y, color, count = 20) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      gameState.current.particulas.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 15, maxLife: 35, color, size: Math.random() * 4 + 1
      });
    }
  };

  const handleRespuesta = (opcionIndex) => {
    const preguntaActual = preguntasTrivia[triviaIndex % preguntasTrivia.length];
    const esCorrecta = opcionIndex === preguntaActual.respuesta;
    
    if (esCorrecta) {
      gameState.current.aciertos++;
    } else {
      gameState.current.errores++;
    }
    
    if (fase === 'TRIVIA_INICIAL' || fase === 'TRIVIA_INTER_OLEADA' || fase === 'TRIVIA_BONUS') {
      if (esCorrecta) gameState.current.energia += (fase === 'TRIVIA_BONUS' ? 100 : 200);
      
      const respondidas = preguntasRespondidasEnFase + 1;
      const limite = fase === 'TRIVIA_BONUS' ? 1 : 2;
      
      if (respondidas < limite && triviaIndex < preguntasTrivia.length - 1) {
        setPreguntasRespondidasEnFase(respondidas);
        setTriviaIndex(triviaIndex + 1);
      } else {
        setPreguntasRespondidasEnFase(0);
        if (triviaIndex < preguntasTrivia.length - 1) setTriviaIndex(triviaIndex + 1);
        setEnergiaUI(gameState.current.energia);
        setFase('PLAYING');
        gameState.current.faseActiva = true;
      }
    }
  };

  const usarBotonPanico = () => {
    if (panicUsado || !gameState.current.faseActiva) return;
    setPanicUsado(true);
    gameState.current.panicTimer = 900;
  };

  const isPathCell = (cx, cy) => {
    for (const path of gameState.current.activePaths) {
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) return true;
      }
    }
    return false;
  };

  const isAdjacentToTower = (x, y) => {
    return gameState.current.torres.some(t => Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1);
  };

  const drawCyberGrid = (ctx) => {
    ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 800, 600);
    
    ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, 600); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(800, y * CELL_SIZE); ctx.stroke(); }

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    gameState.current.decoraciones.forEach(dec => {
       const dx = dec.x * CELL_SIZE; const dy = dec.y * CELL_SIZE;
       if (!isPathCell(dec.x, dec.y) && !gameState.current.torres.some(t => t.x === dec.x && t.y === dec.y)) {
         if (dec.type === 0) { ctx.beginPath(); ctx.arc(dx + 10, dy + 10, 3, 0, Math.PI*2); ctx.fill(); }
         else if (dec.type === 1) { ctx.beginPath(); ctx.moveTo(dx + 5, dy + 20); ctx.lineTo(dx + 25, dy + 20); ctx.stroke(); }
         else { ctx.strokeRect(dx + 15, dy + 15, 10, 10); }
       }
    });

    ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = '#0ea5e9'; ctx.shadowBlur = 15;
    
    gameState.current.activePaths.forEach(path => {
      ctx.beginPath(); ctx.moveTo(path[0].x * CELL_SIZE + CELL_SIZE/2, path[0].y * CELL_SIZE + CELL_SIZE/2);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x * CELL_SIZE + CELL_SIZE/2, path[i].y * CELL_SIZE + CELL_SIZE/2);
      ctx.stroke();
    });
    
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.shadowBlur = 5;
    gameState.current.activePaths.forEach(path => {
      ctx.beginPath(); ctx.moveTo(path[0].x * CELL_SIZE + CELL_SIZE/2, path[0].y * CELL_SIZE + CELL_SIZE/2);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x * CELL_SIZE + CELL_SIZE/2, path[i].y * CELL_SIZE + CELL_SIZE/2);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;

    gameState.current.activePaths.forEach(path => {
      if (path.length > 1) {
        const sx = path[0].x * CELL_SIZE + CELL_SIZE/2;
        const sy = path[0].y * CELL_SIZE + CELL_SIZE/2;
        const nx = path[1].x * CELL_SIZE + CELL_SIZE/2;
        const ny = path[1].y * CELL_SIZE + CELL_SIZE/2;
        const angle = Math.atan2(ny - sy, nx - sx);
        
        const arrowOffset = (gameState.current.frame % 30) - 15;
        ctx.save(); ctx.translate(sx + Math.cos(angle)*arrowOffset, sy + Math.sin(angle)*arrowOffset); ctx.rotate(angle);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.8)'; ctx.shadowColor = '#0ea5e9'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(20, 0); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    });

    const base = {x: 10, y: 7};
    const nx = base.x * CELL_SIZE + CELL_SIZE/2;
    const ny = base.y * CELL_SIZE + CELL_SIZE/2;
    
    const isGlitch = gameState.current.shakeTimer > 0;
    ctx.shadowColor = isGlitch ? '#ef4444' : '#a855f7';
    ctx.shadowBlur = 30 + Math.sin(gameState.current.frame * 0.2) * 10;
    ctx.fillStyle = isGlitch ? '#ef4444' : '#a855f7';
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = nx + 20 * Math.cos(angle);
      const hy = ny + 20 * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  };

  const updateAndDraw = (ctx) => {
    const state = gameState.current;
    state.frame++;
    ctx.save();
    
    if (state.shakeTimer > 0) {
      ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
      if (state.faseActiva) state.shakeTimer--;
    }

    drawCyberGrid(ctx);

    if (fase === 'CINEMATICA_INICIAL') {
      const scanY = (state.frame * 5) % 600;
      ctx.fillStyle = 'rgba(14, 165, 233, 0.2)'; ctx.fillRect(0, scanY, 800, 20);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, scanY + 10, 800, 2);
      ctx.restore();
      requestRef.current = requestAnimationFrame(() => updateAndDraw(ctx));
      return;
    }

    if (state.faseActiva) {
      if (state.panicTimer > 0 && state.enemigos.length > 0) state.panicTimer--;

      if (state.enemigosRestantesOleada > 0 && state.spawnTimer <= 0) {
        const rand = Math.random();
        let tipo = 'NORMAL', speed = 1.8, hp = 60 + (state.oleada * 50), color = '#ef4444', radius = 12;
        
        const waveMaxEnemies = 25 + (state.oleada * 15);
        const isWave8BossTime = (state.oleada === 8 && state.enemigosRestantesOleada === waveMaxEnemies);
        const isWave4MinibossTime = (state.oleada === 4 && state.enemigosRestantesOleada === Math.floor(waveMaxEnemies / 2));
        
        if (isWave8BossTime) {
           tipo = 'BOSS'; speed = 0.5; hp = (300 + (8 * 80)) * 3; color = '#7e22ce'; radius = 35;
        } else if (isWave4MinibossTime) {
           tipo = 'MINIBOSS'; speed = 1.2; hp = 1000; color = '#d946ef'; radius = 24;
        } else {
           if (state.oleada >= 2 && rand > 0.3 && rand <= 0.5) { tipo = 'SWARM'; speed = 3.5; hp = 40; color = '#f59e0b'; radius = 8; }
           else if (state.oleada >= 2 && rand > 0.5 && rand <= 0.65) { tipo = 'GLITCH'; speed = 4.5; hp = 35; color = '#2dd4bf'; radius = 10; }
           else if (state.oleada >= 3 && rand > 0.65 && rand <= 0.75) { tipo = 'STEALTH'; speed = 2.5; hp = 80; color = '#94a3b8'; radius = 10; }
           else if (state.oleada >= 3 && rand > 0.75 && rand <= 0.85) { tipo = 'TANK'; speed = 0.8; hp = 400 + (state.oleada * 100); color = '#991b1b'; radius = 18; }
           else if (state.oleada >= 4 && rand > 0.85 && rand <= 0.93) { tipo = 'SPLITTER'; speed = 1.2; hp = 200 + (state.oleada * 50); color = '#ec4899'; radius = 14; }
           else if (state.oleada >= 4 && rand > 0.93) { tipo = 'ELITE'; speed = 1.5; hp = 600 + (state.oleada * 150); color = '#fbbf24'; radius = 15; }
        }

        const pathIdx = Math.floor(Math.random() * state.activePaths.length);
        const spawnPath = state.activePaths[pathIdx];

        state.enemigos.push({ tipo, x: spawnPath[0].x * CELL_SIZE + CELL_SIZE/2, y: spawnPath[0].y * CELL_SIZE + CELL_SIZE/2, targetIdx: 1, pathIdx, hp, maxHp: hp, speed, color, radius });
        state.enemigosRestantesOleada--;
        
        let st = 20;
        if (tipo === 'SWARM' || tipo === 'GLITCH') st = 5;
        else if (tipo === 'STEALTH') st = 12;
        else if (tipo === 'SPLITTER') st = 25;
        state.spawnTimer = st; 
      } else state.spawnTimer--;

      if (state.enemigosRestantesOleada === 0 && state.enemigos.length === 0) {
        if (state.oleada < MAX_WAVES) {
          if (state.oleada % 2 === 0) {
            state.faseActiva = false; 
            setFase('RONDA_TERMINADA');
            state.oleada++;
            state.enemigosRestantesOleada = 25 + (state.oleada * 15);
            state.spawnTimer = 60;
          } else {
            state.oleada++;
            state.enemigosRestantesOleada = 25 + (state.oleada * 15);
            state.spawnTimer = 60;
            spawnFloatingText(400, 300, `¡OLEADA ${state.oleada}!`, '#3b82f6', 40);
          }
        } else {
          state.faseActiva = false;
          setFase('VICTORIA');
        }
      }
      
      if (state.triggerBonus) {
        state.triggerBonus = false;
        state.faseActiva = false;
        setFase('PREGUNTA_BONUS_TRANSITION');
      }
    }

    for (let i = state.enemigos.length - 1; i >= 0; i--) {
      const e = state.enemigos[i];
      if (state.faseActiva) {
        const activePath = state.activePaths[e.pathIdx];
        const targetNode = activePath[e.targetIdx];
        if (!targetNode) {
          state.hp -= e.tipo === 'TANK' || e.tipo === 'BOSS' || e.tipo === 'MINIBOSS' ? 20 : 10;
          state.shakeTimer = 15; 
          spawnExplosion(e.x, e.y, '#ef4444', 30);
          spawnFloatingText(e.x, e.y - 20, '-10', '#ef4444', 20);
          state.enemigos.splice(i, 1);
          continue;
        }

        const tx = targetNode.x * CELL_SIZE + CELL_SIZE/2, ty = targetNode.y * CELL_SIZE + CELL_SIZE/2;
        const dx = tx - e.x, dy = ty - e.y, dist = Math.hypot(dx, dy);
        
        if (dist < e.speed) { e.x = tx; e.y = ty; e.targetIdx++; }
        else { e.x += (dx / dist) * e.speed; e.y += (dy / dist) * e.speed; }
      }

      ctx.save();
      ctx.translate(e.x, e.y);
      if (e.tipo === 'STEALTH') ctx.globalAlpha = 0.5;
      else if (e.tipo === 'GLITCH' && Math.random() > 0.6 && state.faseActiva) ctx.globalAlpha = 0.3;
      ctx.shadowColor = e.color; ctx.shadowBlur = 10;
      
      if (e.tipo === 'ELITE') {
        ctx.fillStyle = e.color; ctx.beginPath(); ctx.moveTo(0, -e.radius); ctx.lineTo(e.radius, 0); ctx.lineTo(0, e.radius); ctx.lineTo(-e.radius, 0); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      } else if (e.tipo === 'SPLITTER') {
        ctx.fillStyle = e.color; ctx.beginPath(); ctx.moveTo(0, -e.radius); ctx.lineTo(e.radius, 0); ctx.lineTo(0, e.radius); ctx.lineTo(-e.radius, 0); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill();
      } else if (e.tipo === 'STEALTH') {
        ctx.fillStyle = e.color; ctx.beginPath(); ctx.moveTo(e.radius, 0); ctx.lineTo(-e.radius, e.radius); ctx.lineTo(-e.radius, -e.radius); ctx.fill();
      } else if (e.tipo === 'TANK' || e.tipo === 'BOSS' || e.tipo === 'MINIBOSS') {
        ctx.fillStyle = e.color; ctx.fillRect(-e.radius, -e.radius, e.radius*2, e.radius*2);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(-e.radius, -e.radius, e.radius*2, e.radius*2);
      } else if (e.tipo === 'SWARM') {
        ctx.fillStyle = e.color; ctx.beginPath(); ctx.moveTo(0, -e.radius); ctx.lineTo(e.radius, e.radius); ctx.lineTo(-e.radius, e.radius); ctx.fill();
      } else {
        ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(e.x - 10, e.y - e.radius - 10, 20, 3);
      ctx.fillStyle = '#10b981'; ctx.fillRect(e.x - 10, e.y - e.radius - 10, 20 * (e.hp / e.maxHp), 3);
    }

    state.torres.forEach(t => {
      const typeData = TOWER_TYPES[t.type];
      const damage = typeData.baseDmg * (t.level === 1 ? 1 : t.level === 2 ? 2.5 : 5);
      const range = typeData.baseRange * (1 + (t.level-1)*0.2);
      const tx = t.x * CELL_SIZE + CELL_SIZE/2, ty = t.y * CELL_SIZE + CELL_SIZE/2;
      
      if (state.faseActiva) {
        let objetivo = null, minDist = range;
        state.enemigos.forEach(e => {
          const dist = Math.hypot(e.x - tx, e.y - ty);
          if (dist < minDist) { minDist = dist; objetivo = e; }
        });

        if (objetivo) {
          t.angle = Math.atan2(objetivo.y - ty, objetivo.x - tx);
          if (t.cooldown <= 0) {
            t.attackState = 8; t.cooldown = typeData.baseCooldown;
            if (t.type === 'laser' || t.type === 'ballesta') {
              state.proyectiles.push({ sx: tx, sy: ty, tx: objetivo.x, ty: objetivo.y, color: typeData.color, life: 3, type: t.type });
              objetivo.hp -= damage;
              spawnExplosion(objetivo.x, objetivo.y, typeData.color, 5); 
              spawnFloatingText(objetivo.x + (Math.random()*10-5), objetivo.y - 5, `-${damage}`, '#f87171', 12);
            } else if (t.type === 'escopeta') {
              state.proyectiles.push({ sx: tx, sy: ty, tx: tx + Math.cos(t.angle)*range, ty: ty + Math.sin(t.angle)*range, color: typeData.color, life: 5, type: 'escopeta', angle: t.angle, range });
              state.enemigos.forEach(en => {
                 if (Math.hypot(en.x - tx, en.y - ty) <= range && Math.abs(Math.atan2(en.y - ty, en.x - tx) - t.angle) < Math.PI/3) {
                   en.hp -= damage; spawnExplosion(en.x, en.y, typeData.color, 3); spawnFloatingText(en.x, en.y, `-${damage}`, '#f97316', 12);
                 }
              });
            }

            for (let i = state.enemigos.length - 1; i >= 0; i--) {
              const en = state.enemigos[i];
              if (en.hp <= 0) { 
                if (en.tipo === 'SPLITTER') {
                  state.enemigos.push({ tipo: 'SWARM', x: en.x - 8, y: en.y - 8, targetIdx: en.targetIdx, pathIdx: en.pathIdx, hp: 40, maxHp: 40, speed: 3.5, color: '#f59e0b', radius: 8 });
                  state.enemigos.push({ tipo: 'SWARM', x: en.x + 8, y: en.y + 8, targetIdx: en.targetIdx, pathIdx: en.pathIdx, hp: 40, maxHp: 40, speed: 3.5, color: '#f59e0b', radius: 8 });
                }
                
                let baseReward = 1;
                if (en.tipo === 'GLITCH') baseReward = 3;
                else if (en.tipo === 'STEALTH' || en.tipo === 'SPLITTER') baseReward = 4;
                else if (en.tipo === 'TANK') baseReward = 5;
                else if (en.tipo === 'ELITE') baseReward = 15;
                else if (en.tipo === 'MINIBOSS') baseReward = 50;
                else if (en.tipo === 'BOSS') baseReward = 100;
                
                const multiplier = state.panicTimer > 0 ? 2 : 1;
                const reward = baseReward * multiplier; 
                state.energia += reward; 
                spawnExplosion(en.x, en.y, en.color, 20); 
                spawnFloatingText(en.x, en.y - 15, `+${reward}`, '#4ade80', 16);
                state.enemigos.splice(i, 1);
                
                if (Math.random() < 0.05 && state.oleada > 1 && state.bonusCount < 2 && !state.triggerBonus) {
                  state.triggerBonus = true;
                  state.bonusCount++;
                }
              }
            }
          }
        }
        if (t.cooldown > 0) t.cooldown--;
        if (t.attackState > 0) t.attackState--;
      }

      const hc = state.hoveredCell;
      const isHovered = hc && hc.x === t.x && hc.y === t.y;

      ctx.fillStyle = '#0f172a'; ctx.fillRect(t.x * CELL_SIZE + 4, t.y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      ctx.strokeStyle = typeData.color; ctx.lineWidth = 2; ctx.strokeRect(t.x * CELL_SIZE + 4, t.y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      
      if (isHovered) {
        ctx.beginPath(); ctx.arc(tx, ty, range, 0, Math.PI * 2);
        ctx.fillStyle = `${typeData.color}20`; ctx.fill();
        ctx.strokeStyle = `${typeData.color}80`; ctx.stroke();
      }

      ctx.save(); ctx.translate(tx, ty); ctx.rotate(t.angle || 0);
      const recoil = t.attackState > 0 ? -4 : 0; 
      ctx.fillStyle = typeData.color; ctx.shadowColor = typeData.color; ctx.shadowBlur = 10;
      
      if (t.type === 'laser') { ctx.fillRect(recoil, -4, 18, 8); }
      else if (t.type === 'escopeta') { ctx.fillRect(recoil, -8, 14, 16); }
      else if (t.type === 'ballesta') { ctx.fillRect(recoil, -2, 22, 4); ctx.fillRect(recoil+10, -10, 4, 20); }
      
      ctx.fillStyle = '#fff';
      if (t.level > 1) ctx.fillRect(recoil+5, -5, 4, 10);
      if (t.level > 2) ctx.fillRect(recoil+12, -5, 4, 10);

      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0; ctx.restore();
    });

    for (let i = state.proyectiles.length - 1; i >= 0; i--) {
      const p = state.proyectiles[i];
      if (state.faseActiva) p.life--;
      
      ctx.strokeStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 15;
      if (p.type === 'laser' || p.type === 'ballesta') {
        ctx.lineWidth = p.type === 'laser' ? 4 : 2; ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(p.tx, p.ty); ctx.stroke();
      } else if (p.type === 'escopeta') {
        ctx.fillStyle = `${p.color}40`; ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.arc(p.sx, p.sy, p.range, p.angle - Math.PI/4, p.angle + Math.PI/4); ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (p.life <= 0) state.proyectiles.splice(i, 1);
    }

    for (let i = state.particulas.length - 1; i >= 0; i--) {
      const p = state.particulas[i];
      if (state.faseActiva) { p.x += p.vx; p.y += p.vy; p.life--; p.vx *= 0.92; p.vy *= 0.92; }
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1.0;
      if (p.life <= 0) state.particulas.splice(i, 1);
    }

    for (let i = state.textos.length - 1; i >= 0; i--) {
      const t = state.textos[i];
      if (state.faseActiva) { t.y -= 1; t.life--; }
      ctx.globalAlpha = Math.max(0, t.life / t.maxLife); ctx.fillStyle = t.color;
      ctx.font = `900 ${t.fontSize}px 'Courier New'`; ctx.textAlign = 'center';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(t.text, t.x, t.y); ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1.0;
      if (t.life <= 0) state.textos.splice(i, 1);
    }

    const hc = state.hoveredCell;
    if (hc) {
      const isPath = isPathCell(hc.x, hc.y);
      const hasTower = state.torres.some(t => t.x === hc.x && t.y === hc.y);
      
      if (!isPath && !hasTower) {
        const invalid = isAdjacentToTower(hc.x, hc.y);
        if (invalid || state.torres.length >= MAX_TOWERS) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; ctx.fillRect(hc.x * CELL_SIZE, hc.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fillRect(hc.x * CELL_SIZE, hc.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.strokeRect(hc.x * CELL_SIZE, hc.y * CELL_SIZE, CELL_SIZE, CELL_SIZE); ctx.setLineDash([]);
          
          const typeData = TOWER_TYPES[state.tipoAConstruir];
          ctx.beginPath(); ctx.arc(hc.x * CELL_SIZE + CELL_SIZE/2, hc.y * CELL_SIZE + CELL_SIZE/2, typeData.baseRange, 0, Math.PI * 2);
          ctx.fillStyle = `${typeData.color}20`; ctx.fill(); ctx.strokeStyle = `${typeData.color}80`; ctx.stroke();
        }
      }
    }

    if (selectedCell && selectedCell.hasTower) {
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 3;
      ctx.strokeRect(selectedCell.x * CELL_SIZE + 2, selectedCell.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4); 
      ctx.shadowBlur = 0;
    }

    ctx.restore(); 
    requestRef.current = requestAnimationFrame(() => updateAndDraw(ctx));
  };

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      requestRef.current = requestAnimationFrame(() => updateAndDraw(ctx));
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [fase]); 

  const handleMouseMove = (e) => {
    if (fase !== 'PLAYING') { gameState.current.hoveredCell = null; return; }
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE), y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) { gameState.current.hoveredCell = null; return; }
    gameState.current.hoveredCell = { x, y };
  };
  
  const handleMouseLeave = () => { gameState.current.hoveredCell = null; };

  const handleCanvasClick = (e) => {
    if (fase !== 'PLAYING') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE), y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) { setSelectedCell(null); return; }
    
    const towerInfo = gameState.current.torres.find(t => t.x === x && t.y === y);

    if (towerInfo) {
      setSelectedCell({x, y, hasTower: true, level: towerInfo.level, type: towerInfo.type});
    } else if (!isPathCell(x, y)) {
      setSelectedCell(null);
      
      const invalid = isAdjacentToTower(x, y);
      if (!invalid && gameState.current.torres.length < MAX_TOWERS) {
        const typeData = TOWER_TYPES[gameState.current.tipoAConstruir];
        if (gameState.current.energia >= typeData.cost) {
          gameState.current.energia -= typeData.cost;
          gameState.current.torres.push({ x, y, level: 1, cooldown: 0, attackState: 0, angle: 0, type: gameState.current.tipoAConstruir });
          spawnFloatingText(x * CELL_SIZE, y * CELL_SIZE - 10, "INSTALADO", typeData.color, 16);
          setEnergiaUI(gameState.current.energia);
          setTorresCount(gameState.current.torres.length);
        } else {
          spawnFloatingText(x * CELL_SIZE, y * CELL_SIZE - 10, "SIN BITS", "#ef4444", 16);
        }
      }
    } else {
      setSelectedCell(null);
    }
  };

  const handleUpgrade = () => {
    if (!selectedCell || !selectedCell.hasTower) return;
    const tower = gameState.current.torres.find(t => t.x === selectedCell.x && t.y === selectedCell.y);
    if (!tower) return;
    
    const cost = getUpgradeCost(tower.type, tower.level);
    if (tower.level < 3 && gameState.current.energia >= cost) {
      gameState.current.energia -= cost;
      tower.level += 1;
      setSelectedCell({...selectedCell, level: tower.level});
      spawnFloatingText(tower.x * CELL_SIZE, tower.y * CELL_SIZE - 10, "¡MEJORA!", TOWER_TYPES[tower.type].color, 16);
      setEnergiaUI(gameState.current.energia);
    }
  };

  const handleDelete = () => {
    if (!selectedCell || !selectedCell.hasTower) return;
    const towerIdx = gameState.current.torres.findIndex(t => t.x === selectedCell.x && t.y === selectedCell.y);
    if (towerIdx > -1) {
      const tower = gameState.current.torres[towerIdx];
      const refund = Math.floor(TOWER_TYPES[tower.type].cost * 0.5);
      gameState.current.energia += refund;
      gameState.current.torres.splice(towerIdx, 1);
      spawnExplosion(tower.x * CELL_SIZE + 20, tower.y * CELL_SIZE + 20, '#ffffff', 10);
      spawnFloatingText(tower.x * CELL_SIZE, tower.y * CELL_SIZE - 10, `+${refund} BITS`, '#4ade80', 16);
      setSelectedCell(null);
      setEnergiaUI(gameState.current.energia);
      setTorresCount(gameState.current.torres.length);
    }
  };

  const currentQuestion = preguntasTrivia[triviaIndex % preguntasTrivia.length];

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      
      <div className="w-[800px] flex justify-between items-center bg-slate-950 p-3 rounded-t-xl text-white shadow-lg border-b-2 border-blue-600 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-700">
            <Heart className="text-red-500 w-5 h-5" fill="currentColor" />
            <span className="font-mono text-lg font-bold">{hpUI}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-700">
            <Zap className="text-yellow-400 w-5 h-5" fill="currentColor" />
            <span className="font-mono text-lg font-bold text-yellow-400">{energiaUI} Bits</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-700 text-slate-300 font-mono text-sm">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Torres: {torresCount}/{MAX_TOWERS}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 px-4 py-1 rounded font-mono text-blue-400 border border-blue-800 text-sm font-bold">
            OLEADA {oleadaUI > MAX_WAVES ? MAX_WAVES : oleadaUI}/{MAX_WAVES}
          </div>
          <button 
            onClick={usarBotonPanico}
            disabled={(panicUsado && panicTimerUI <= 0) || gameState.current.enemigos.length === 0}
            className={`flex items-center gap-1 px-4 py-1 rounded font-bold text-sm transition-colors ${
              panicTimerUI > 0 
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_#eab308]' 
                : 'bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> 
            {panicTimerUI > 0 ? `DOBLE BITS (${Math.ceil(panicTimerUI / 60)}s)` : 'ACTIVAR BITS DOBLES'}
          </button>
        </div>
      </div>

      <div className="relative w-[800px] h-[600px] border-4 border-slate-900 bg-[#020617] overflow-hidden">
        
        <canvas 
          ref={canvasRef}
          width={800}
          height={600}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className={`absolute top-0 left-0 cursor-crosshair ${fase !== 'PLAYING' && fase !== 'CINEMATICA_INICIAL' ? 'opacity-30 blur-sm' : ''}`}
        />

        {fase === 'CINEMATICA_INICIAL' && (
          <div className="absolute inset-0 flex items-center justify-center flex-col z-20 bg-slate-950/70 backdrop-blur-sm">
            <Shield className="w-16 h-16 text-blue-500 mb-4 animate-pulse" />
            <h1 className="text-4xl font-black text-blue-400 mb-2">DEFENSA ACTIVADA</h1>
            <button onClick={iniciarJuego} className="mt-6 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all shadow-lg border border-blue-400">
              INICIAR SIMULACIÓN
            </button>
          </div>
        )}

        {fase === 'PREGUNTA_BONUS_TRANSITION' && (
          <div className="absolute inset-0 flex items-center justify-center flex-col z-30 bg-purple-950/90 backdrop-blur-md animate-in zoom-in duration-300">
            <h1 className="text-7xl font-black text-fuchsia-400 tracking-widest drop-shadow-[0_0_30px_rgba(217,70,239,0.8)] text-center animate-pulse">
              ¡PREGUNTA BONUS!
            </h1>
          </div>
        )}

        {fase === 'RONDA_TERMINADA' && (
          <div className="absolute inset-0 flex items-center justify-center flex-col z-30 bg-slate-950/90 backdrop-blur-md animate-in zoom-in duration-300">
            <h1 className="text-6xl font-black text-green-400 tracking-widest drop-shadow-[0_0_20px_rgba(74,222,128,0.8)] text-center">
              ¡OLEADA SUPERADA!
            </h1>
            <p className="mt-4 text-green-200 font-mono text-xl animate-pulse">Iniciando protocolo de trivia...</p>
          </div>
        )}

        {/* TRANSICIÓN TRIVIA ANIMADA */}
        {fase === 'TRANSICION_TRIVIA' && (
          <div className="absolute inset-0 flex items-center justify-center flex-col z-30 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-[0.2em] drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] text-center animate-pulse">
              RONDA DE<br/>PREGUNTAS
            </h1>
            <p className="mt-6 text-cyan-200/70 font-mono tracking-widest uppercase">PREPARANDO ENTORNO DE DATOS...</p>
          </div>
        )}

        {(fase === 'TRIVIA_INICIAL' || fase === 'TRIVIA_INTER_OLEADA' || fase === 'TRIVIA_BONUS') && currentQuestion && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-20 backdrop-blur-md">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-xl p-6 max-w-md w-full text-center shadow-2xl">
              <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-blue-400 mb-1">
                {fase === 'TRIVIA_BONUS' ? '¡PREGUNTA BONUS!' : (fase === 'TRIVIA_INICIAL' ? 'CARGA DE ENERGÍA' : `OLEADA ${oleadaUI - 1} SUPERADA`)}
              </h2>
              <p className="text-slate-400 text-xs mb-4 font-mono">
                Pregunta {preguntasRespondidasEnFase + 1}/{fase === 'TRIVIA_BONUS' ? 1 : 2} - (+{fase === 'TRIVIA_BONUS' ? 100 : 200} BITS)
              </p>
              <p className="text-md text-white mb-6 font-medium">
                {currentQuestion.pregunta}
              </p>
              <div className="flex flex-col gap-2">
                {currentQuestion.opciones.map((opt, i) => (
                  <button key={i} onClick={() => handleRespuesta(i)} className="p-3 bg-slate-800 hover:bg-blue-600 text-white text-sm rounded border border-slate-700 transition-colors text-left font-medium">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {fase === 'PANIC' && currentQuestion && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 p-4 z-20 backdrop-blur-md">
            <div className="bg-slate-900 border-2 border-red-600 rounded-xl p-6 max-w-md w-full text-center shadow-2xl">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2 animate-ping" />
              <h2 className="text-2xl font-black text-red-500 mb-2">¡PÁNICO!</h2>
              <p className="text-red-300 text-sm mb-4">Acierta para inyectar 250 Bits</p>
              <p className="text-md text-white mb-6">{currentQuestion.pregunta}</p>
              <div className="flex flex-col gap-2">
                {currentQuestion.opciones.map((opt, i) => (
                  <button key={i} onClick={() => handleRespuesta(i)} className="p-3 bg-slate-800 hover:bg-red-600 text-white rounded border border-red-900 text-left text-sm font-medium transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {fase === 'GAME_OVER' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 flex-col z-20">
            <h2 className="text-5xl font-black text-red-600 mb-2 tracking-widest drop-shadow-lg">JUEGO TERMINADO</h2>
            <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-700 text-white font-bold rounded hover:bg-red-600 transition-all">REINICIAR</button>
          </div>
        )}
        {fase === 'VICTORIA' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 flex-col z-20">
            <h2 className="text-5xl font-black text-cyan-400 mb-2 tracking-widest drop-shadow-lg animate-pulse">¡JUEGO GANADO!</h2>
            <p className="text-cyan-200 mt-4 font-mono">SOBREVIVISTE A LAS 10 OLEADAS</p>
            <button onClick={() => window.location.href = '/dashboard'} className="mt-8 px-8 py-3 bg-cyan-600 text-white font-bold rounded hover:bg-cyan-500 transition-all">VOLVER</button>
          </div>
        )}

      </div>

      <div className="w-[800px] bg-slate-900 border-x-2 border-b-2 border-blue-900 rounded-b-xl p-3 flex justify-between items-center relative z-10 shadow-lg">
        
        <div className="flex gap-2">
          {Object.keys(TOWER_TYPES).map(type => {
            const t = TOWER_TYPES[type];
            const isSelected = selectedTowerTypeUI === type;
            return (
              <button
                key={type}
                onClick={() => cambiarTipoTorre(type)}
                className={`px-3 py-2 rounded flex flex-col items-center border transition-all ${isSelected ? 'bg-slate-700 border-white shadow-inner scale-105' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 opacity-75'}`}
              >
                <span className="text-xs font-bold text-white mb-1" style={{color: t.color}}>{t.label}</span>
                <span className="text-xs font-mono text-slate-300">{t.cost} BITS</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-end min-w-[300px]">
          {selectedCell && selectedCell.hasTower ? (
            <div className="flex gap-2">
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-900 hover:bg-red-700 text-red-200 border border-red-700 rounded text-sm font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Vender
              </button>
              {selectedCell.level < 3 ? (
                <button 
                  onClick={handleUpgrade}
                  disabled={energiaUI < getUpgradeCost(selectedCell.type, selectedCell.level)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <ArrowUpCircle className="w-4 h-4" /> Mejorar ({getUpgradeCost(selectedCell.type, selectedCell.level)})
                </button>
              ) : (
                <div className="px-4 py-2 bg-slate-800 text-slate-400 rounded text-sm font-bold border border-slate-700">MAX NIVEL</div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-sm font-mono flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> Clic en mapa para construir
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ClasificadorDefensivo;
