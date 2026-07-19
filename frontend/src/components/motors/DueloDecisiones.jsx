import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────
   Constantes de configuración
───────────────────────────────────────────── */
const COMODIN_MAX = 1;          
const AYUDA_MAX   = 1;          

const BGS = ['/battle_bg.png', '/bg_2.png', '/bg_3.png', '/bg_4.png', '/bg_5.png'];
const HERO_IMG = '/hero_sprite.png';
const ENEMY_IMG = '/enemy_monster.png';

/* ─────────────────────────────────────────────
   Barra de HP 
───────────────────────────────────────────── */
const HpBar = ({ hp, maxHp }) => {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const color =
    pct > 50 ? '#10b981' :
    pct > 25 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 900, color: '#334155' }}>HP</span>
      <div style={{
        flex: 1, height: 16, background: '#e2e8f0',
        borderRadius: 8, overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease-out',
        }} />
      </div>
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 800, minWidth: 50, textAlign: 'right' }}>
        {hp}/{maxHp}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Tarjeta de personaje
───────────────────────────────────────────── */
const CharCard = ({ nombre, nivel, hp, maxHp, extraBorder }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.95)',
    border: `3px solid ${extraBorder || '#334155'}`,
    borderRadius: 16,
    padding: '12px 16px',
    width: 250,
    boxShadow: '0 8px 0 rgba(0,0,0,0.15)',
    backdropFilter: 'blur(4px)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 2 }}>
      <span style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', letterSpacing: '-0.5px' }}>{nombre}</span>
      <span style={{ fontSize: 14, color: '#64748b', fontWeight: 800 }}>Nv{nivel}</span>
    </div>
    <HpBar hp={hp} maxHp={maxHp} />
  </div>
);

/* ─────────────────────────────────────────────
   Sprite animado
───────────────────────────────────────────── */
const Sprite = ({ src, alt, animate, shake, flip, size = 180, hidden, isAttacking, hueRotate = 0 }) => {
  const style = {
    width: size,
    height: size,
    objectFit: 'contain',
    transform: `${flip ? 'scaleX(-1)' : ''} ${animate ? 'scale(1.02)' : 'scale(1)'}`,
    transition: 'transform 0.2s ease, filter 0.2s ease',
    opacity: hidden ? 0 : 1,
    filter: (shake ? 'drop-shadow(0 0 15px #ef4444) brightness(1.5) ' : 'drop-shadow(0 10px 15px rgba(0,0,0,0.3)) ') + `hue-rotate(${hueRotate}deg)`,
    animation: shake 
      ? 'pokemon-shake 0.5s ease' 
      : isAttacking 
        ? 'pokemon-attack 0.5s ease' 
        : animate 
          ? 'pokemon-float 3s ease-in-out infinite' 
          : undefined,
  };
  return (
    <div style={{ position: 'relative' }}>
      <img src={src} alt={alt} style={style} />
      {shake && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontSize: size * 0.5, animation: 'explosion-anim 0.5s ease-out forwards', pointerEvents: 'none', zIndex: 20
        }}>
          💥
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Botones de Acción y Opciones
───────────────────────────────────────────── */
const ActionBtn = ({ label, onClick, disabled, color, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: disabled ? '#f1f5f9' : '#ffffff',
      border: `3px solid ${disabled ? '#cbd5e1' : color}`,
      borderRadius: 12,
      color: disabled ? '#94a3b8' : '#1e293b',
      padding: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontWeight: 800,
      fontSize: 15,
      transition: 'all 0.1s ease',
      boxShadow: disabled ? 'none' : `0 6px 0 ${color}`,
      transform: 'translateY(0)',
    }}
    onMouseDown={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'; } }}
    onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 0 ${color}`; } }}
    onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 0 ${color}`; } }}
  >
    <span style={{ fontSize: 20 }}>{icon}</span>
    {label}
  </button>
);

const OptionBtn = ({ label, index, onClick, disabled, revealed }) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
  const color = revealed ? '#10b981' : colors[index % colors.length];

  return (
    <button
      onClick={() => onClick(index)}
      disabled={disabled}
      style={{
        background: revealed ? '#dcfce7' : '#ffffff',
        border: `3px solid ${disabled && !revealed ? '#cbd5e1' : color}`,
        borderRadius: 16,
        color: disabled && !revealed ? '#94a3b8' : '#1e293b',
        padding: '16px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontWeight: 800,
        fontSize: 16,
        transition: 'all 0.1s ease',
        boxShadow: disabled ? 'none' : `0 6px 0 ${color}`,
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseDown={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'; } }}
      onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 0 ${color}`; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 0 ${color}`; } }}
    >
      <div style={{
        background: color, color: '#fff', borderRadius: '50%',
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 16
      }}>
        {['A','B','C','D'][index]}
      </div>
      <span style={{ flex: 1 }}>{label}</span>
      {revealed && <div style={{ position: 'absolute', right: 16, fontSize: 24, animation: 'pulse 1s infinite' }}>⭐</div>}
    </button>
  );
};

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
const DueloDecisiones = ({ data }) => {
  const maxHpJugador = data.personajes[0]?.hp || 100;
  const maxHpEnemigo = data.personajes[1]?.hp || 100;

  // Assets: fondo aleatorio, héroe y enemigo fijos
  const [bgUrl] = useState(() => BGS[Math.floor(Math.random() * BGS.length)]);
  const heroUrl = HERO_IMG;
  const enemyUrl = ENEMY_IMG;

  const [escenaIndex, setEscenaIndex]  = useState(0);
  const [hpJugador,  setHpJugador]     = useState(maxHpJugador);
  const [hpEnemigo,  setHpEnemigo]     = useState(maxHpEnemigo);
  const [gameOver,   setGameOver]      = useState(false);
  const [victoria,   setVictoria]      = useState(false);
  const [mensaje,    setMensaje]       = useState('');
  
  // Fases: inicio -> intro_enemy -> intro_hero -> turno_enemigo -> turno_jugador -> evaluacion
  const [fase, setFase] = useState('inicio'); 
  const [shakeJugador, setShakeJugador] = useState(false);
  const [shakeEnemigo, setShakeEnemigo] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [showQuestionAnim, setShowQuestionAnim] = useState(false);
  
  // Menús del jugador
  const [menuFase, setMenuFase] = useState('principal'); // 'principal' o 'opciones'
  const [dificultad, setDificultad] = useState(1);

  // Poderes
  const [comodines,  setComodines]  = useState(COMODIN_MAX);
  const [ayudas,     setAyudas]     = useState(AYUDA_MAX);
  const [dobleDaño,  setDobleDaño]  = useState(false);
  const [opReveal,   setOpReveal]   = useState(null);   

  const totalEscenas = data.escenas.length;
  const escena = data.escenas[escenaIndex % totalEscenas];

  const nombreJugador = data.personajes[0]?.nombre || 'Héroe';
  const nombreEnemigo = 'Monstruo'; // Forzar siempre el nombre Monstruo

  // Control de Cinemática Inicial
  useEffect(() => {
    if (fase === 'inicio') {
      setTimeout(() => {
        setFase('intro_enemy');
        setMensaje(`¡Un ${nombreEnemigo} salvaje apareció!`);
      }, 1000);
    } else if (fase === 'intro_enemy') {
      setTimeout(() => {
        setFase('intro_hero');
        setMensaje(`¡Adelante, ${nombreJugador}!`);
      }, 2500);
    } else if (fase === 'intro_hero') {
      setTimeout(() => {
        iniciarTurnoEnemigo();
      }, 2500);
    }
  }, [fase, nombreEnemigo, nombreJugador]);

  const generarDificultad = () => Math.floor(Math.random() * 3) + 1;

  const iniciarTurnoEnemigo = () => {
    setFase('turno_enemigo');
    setDificultad(generarDificultad());
    setMensaje(`${nombreEnemigo} se prepara para atacar...`);
    
    // Animación de ataque del monstruo lanzando la pregunta
    setTimeout(() => {
      setIsEnemyAttacking(true);
      setShowQuestionAnim(true); // Activar animación de "❓❓" volando
      setMensaje(`¡${nombreEnemigo} lanza una PREGUNTA!`);
      
      setTimeout(() => {
        setIsEnemyAttacking(false);
        setTimeout(() => {
          setShowQuestionAnim(false);
          setFase('turno_jugador');
          setMenuFase('principal');
        }, 500);
      }, 1000);
    }, 1500);
  };

  const getDaño = (esCorrecta, diff) => {
    if (esCorrecta) {
      if (diff === 1) return Math.floor(Math.random() * 6) + 10; // 10-15
      if (diff === 2) return Math.floor(Math.random() * 10) + 16; // 16-25
      return Math.floor(Math.random() * 10) + 26; // 26-35
    } else {
      if (diff === 1) return Math.floor(Math.random() * 3) + 18; // 18-20
      if (diff === 2) return Math.floor(Math.random() * 4) + 14; // 14-17
      return Math.floor(Math.random() * 4) + 10; // 10-13
    }
  };

  const evaluarRespuesta = (index) => {
    setFase('evaluacion');
    const esCorrecta = index === escena.respuesta;
    let dmg = getDaño(esCorrecta, dificultad);

    if (esCorrecta) {
      if (dobleDaño) dmg *= 2;
      const nuevoHp = Math.max(0, hpEnemigo - dmg);
      setHpEnemigo(nuevoHp);
      setShakeEnemigo(true);
      setMensaje(dobleDaño ? `¡Respuesta Correcta! ¡Daño doble crítico de ${dmg} HP!` : `¡Respuesta Correcta! El enemigo recibe ${dmg} HP.`);
      setTimeout(() => setShakeEnemigo(false), 800);
      avanzarSiguiente(nuevoHp, hpJugador);
    } else {
      const nuevoHp = Math.max(0, hpJugador - dmg);
      setHpJugador(nuevoHp);
      setShakeJugador(true);
      setMensaje(`¡Fallaste la respuesta! Recibes ${dmg} HP de daño.`);
      setTimeout(() => setShakeJugador(false), 800);
      avanzarSiguiente(hpEnemigo, nuevoHp);
    }
  };

  const avanzarSiguiente = (hpE, hpJ) => {
    setTimeout(() => {
      setOpReveal(null);
      setDobleDaño(false);
      
      if (hpE <= 0) return terminar(true);
      if (hpJ <= 0) return terminar(false);
      
      setEscenaIndex(i => i + 1);
      iniciarTurnoEnemigo();
    }, 2500);
  };

  const pasarPregunta = () => {
    setFase('evaluacion');
    const dmg = 20;
    const nuevoHp = Math.max(0, hpJugador - dmg);
    setHpJugador(nuevoHp);
    setShakeJugador(true);
    setMensaje(`Pasaste la pregunta y perdiste ${dmg} HP por evadir.`);
    setTimeout(() => setShakeJugador(false), 800);
    avanzarSiguiente(hpEnemigo, nuevoHp);
  };

  const terminar = (win) => {
    setGameOver(true);
    setVictoria(win);
    setMensaje(win ? '¡Has derrotado al monstruo de manera épica!' : 'Te quedaste sin energía...');
  };

  const estrellasDificultad = '⭐'.repeat(dificultad);

  return (
    <div style={{
      width: '100%',
      maxWidth: 1000,
      height: 700,
      margin: '0 auto',
      position: 'relative',
      borderRadius: 24,
      overflow: 'hidden',
      userSelect: 'none',
      boxShadow: '0 24px 50px rgba(0,0,0,0.6)',
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      
      {/* ── ESTILOS GLOBALES DE ANIMACIÓN ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes explosion-anim {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes flying-question {
          0% { transform: translate(0, 0) scale(0.5) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(-500px, 200px) scale(3) rotate(-360deg); opacity: 0; }
        }
      `}</style>

      {fase === 'inicio' && (
        <div style={{ position: 'absolute', inset: 0, background: '#0f172a', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, animation: 'pulse 1.5s infinite' }}>
            Generando mundo aleatorio...
          </div>
        </div>
      )}

      {/* ── PERSONAJES Y HUD ── */}
      <div style={{
        position: 'absolute', top: 30, left: 30, zIndex: 10,
        opacity: (fase !== 'inicio') ? 1 : 0, transition: 'opacity 0.5s ease',
      }}>
        <CharCard nombre={nombreEnemigo} nivel={100} hp={hpEnemigo} maxHp={maxHpEnemigo} extraBorder="#ef4444" />
      </div>

      <div style={{
        position: 'absolute', top: 70, right: 100, zIndex: 5,
        transform: fase === 'inicio' ? 'translateX(400px)' : 'translateX(0)',
        transition: 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        opacity: fase !== 'inicio' ? 1 : 0
      }}>
        <Sprite src={enemyUrl} alt={nombreEnemigo} animate={!gameOver && fase !== 'turno_enemigo'} isAttacking={isEnemyAttacking} shake={shakeEnemigo} flip={true} size={280} />
        
        {/* Animación de la pregunta volando */}
        {showQuestionAnim && (
          <div style={{
            position: 'absolute', left: -50, top: 100, fontSize: 80, zIndex: 15,
            animation: 'flying-question 1s ease-in forwards', pointerEvents: 'none'
          }}>
            ❓
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 270, right: 30, zIndex: 10,
        opacity: (fase !== 'inicio' && fase !== 'intro_enemy') ? 1 : 0, transition: 'opacity 0.5s ease',
      }}>
        <CharCard nombre={nombreJugador} nivel={100} hp={hpJugador} maxHp={maxHpJugador} extraBorder="#3b82f6" />
      </div>

      <div style={{
        position: 'absolute', bottom: 230, left: 80, zIndex: 6,
        transform: (fase !== 'inicio' && fase !== 'intro_enemy') ? 'translateX(0)' : 'translateX(-400px)',
        transition: 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        opacity: (fase !== 'inicio' && fase !== 'intro_enemy') ? 1 : 0
      }}>
        <Sprite src={heroUrl} alt={nombreJugador} animate={!gameOver} shake={shakeJugador} flip={false} size={320} />
      </div>

      {/* ── PANEL INFERIOR (250px height) ── */}
      {(fase === 'turno_jugador' || fase === 'evaluacion' || gameOver) && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 30,
          display: 'flex',
          gap: 30,
          alignItems: 'stretch',
          height: 250,
          zIndex: 20,
          animation: 'slide-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          
          {/* Opciones o Menú Principal */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!gameOver && menuFase === 'principal' && fase === 'turno_jugador' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
                <ActionBtn icon="⚔️" label="Responder" color="#3b82f6" onClick={() => setMenuFase('opciones')} />
                <ActionBtn 
                  icon="🃏" label={`Comodín (${comodines})`} color="#8b5cf6" 
                  disabled={comodines <= 0 || dobleDaño} 
                  onClick={() => { setComodines(c => c - 1); setDobleDaño(true); }} 
                />
                <ActionBtn 
                  icon="💡" label={`Pista (${ayudas})`} color="#f59e0b" 
                  disabled={ayudas <= 0 || opReveal !== null} 
                  onClick={() => { setAyudas(a => a - 1); setOpReveal(escena.respuesta); }} 
                />
                <ActionBtn icon="🏃" label="Pasar (-20 HP)" color="#ef4444" onClick={pasarPregunta} />
              </div>
            )}

            {!gameOver && menuFase === 'opciones' && fase === 'turno_jugador' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
                {escena.opciones.map((op, i) => (
                  <OptionBtn
                    key={i} index={i} label={op}
                    onClick={evaluarRespuesta}
                    disabled={fase === 'evaluacion'}
                    revealed={opReveal === i}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Caja PREGUNTA */}
          <div style={{
            width: 380,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '4px solid #1e293b',
            borderRadius: 20,
            padding: '30px 24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 0 rgba(0,0,0,0.15)',
            position: 'relative',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              position: 'absolute', top: -16, left: 24,
              background: '#1e293b', color: '#fff',
              padding: '6px 16px', borderRadius: 10,
              fontSize: 16, fontWeight: 900, letterSpacing: 1
            }}>
              PREGUNTA
            </div>
            <div style={{
              position: 'absolute', top: -16, right: 24,
              background: '#f59e0b', color: '#fff',
              padding: '6px 16px', borderRadius: 10,
              fontSize: 16, fontWeight: 900
            }}>
              {estrellasDificultad}
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a', textAlign: 'center', lineHeight: 1.4 }}>
                {fase === 'evaluacion' || gameOver ? mensaje : escena.pregunta}
              </p>
            </div>
            {dobleDaño && fase !== 'evaluacion' && !gameOver && (
              <div style={{ textAlign: 'center', color: '#8b5cf6', fontWeight: 900, fontSize: 16, marginTop: 12 }}>
                🔥 Daño Doble Activado 🔥
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay Mensajes Cinemática */}
      {(fase === 'intro_enemy' || fase === 'intro_hero' || fase === 'turno_enemigo') && (
        <div style={{
          position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.9)', border: '4px solid #fff', borderRadius: 20,
          padding: '24px 48px', color: '#fff', fontSize: 32, fontWeight: 900,
          zIndex: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          animation: 'fade-in 0.3s ease-out', textAlign: 'center', minWidth: '60%'
        }}>
          {mensaje}
        </div>
      )}

      {gameOver && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.85)',
          zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <h2 style={{ fontSize: 72, fontWeight: 900, color: victoria ? '#facc15' : '#ef4444', textShadow: '0 10px 20px rgba(0,0,0,0.5)', margin: '0 0 40px 0' }}>
            {victoria ? '¡VICTORIA!' : 'DERROTA'}
          </h2>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '20px 40px', background: '#fff', border: 'none', borderRadius: 16,
              fontSize: 24, fontWeight: 900, color: '#1e293b', cursor: 'pointer',
              boxShadow: '0 8px 0 #cbd5e1', transition: 'all 0.1s ease'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Volver a Jugar
          </button>
        </div>
      )}
    </div>
  );
};

export default DueloDecisiones;
