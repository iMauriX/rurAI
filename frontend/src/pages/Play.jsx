import { Suspense, lazy, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useActividad } from '../hooks/useActividad';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import api from '../utils/api';

// Lazy loading de los motores lúdicos
const DueloDecisiones      = lazy(() => import('../components/motors/DueloDecisiones'));
const ClasificadorDefensivo = lazy(() => import('../components/motors/ClasificadorDefensivo'));
const DungeonCrawler        = lazy(() => import('../components/motors/DungeonCrawler'));

const Play = () => {
  const { id } = useParams();
  const { actividad, loading, error } = useActividad(id);

  const [studentInfo, setStudentInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('rurai_student_info');
      return saved ? JSON.parse(saved) : { nombre: '', seccion: '' };
    } catch (e) {
      return { nombre: '', seccion: '' };
    }
  });
  
  const [isRegistered, setIsRegistered] = useState(() => {
    try {
      const saved = localStorage.getItem('rurai_student_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!(parsed.nombre && parsed.seccion);
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
    return false;
  });

  const [nombreInput, setNombreInput] = useState(() => studentInfo?.nombre || '');
  const [seccionInput, setSeccionInput] = useState(() => studentInfo?.seccion || '');
  const [validationError, setValidationError] = useState('');

  const [gameState, setGameState] = useState('playing'); // playing | ranking
  const [rankingData, setRankingData] = useState(null);

  const handleGameEnd = async (stats) => {
    try {
      // 1. Enviar el score al backend
      await api.post(`/actividad/token/${id}/score`, {
        nombre: studentInfo.nombre,
        seccion: studentInfo.seccion,
        aciertos: stats.aciertos,
        errores: stats.errores
      });

      // 2. Traer el ranking
      const { data } = await api.get(`/actividad/token/${id}/ranking`);
      setRankingData(data);
      setGameState('ranking');
    } catch (e) {
      console.error("Error al enviar el score o traer el ranking", e);
      // Fallback a mostrar algo vacio
      setRankingData({ general: [], bySection: { A: [], B: [] } });
      setGameState('ranking');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const currentNombre = nombreInput || '';
    const currentSeccion = seccionInput || '';
    
    if (!currentNombre.trim()) {
      setValidationError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!currentSeccion.trim()) {
      setValidationError('Por favor ingresa tu sección (ej. 5to B).');
      return;
    }

    const info = { nombre: currentNombre.trim(), seccion: currentSeccion.trim() };
    try {
      localStorage.setItem('rurai_student_info', JSON.stringify(info));
    } catch(err) {
      console.warn("No se pudo guardar en localStorage", err);
    }
    setStudentInfo(info);
    setIsRegistered(true);
    setValidationError('');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 16,
      }}>
        <div style={{
          fontSize: 28,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: 2,
          textShadow: '0 0 30px #6366f1',
          fontFamily: 'system-ui, sans-serif',
        }}>
          ⚔️ Cargando RurAI...
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  if (error || !actividad) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1a2744 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
          color: '#fecaca',
          padding: '32px 40px',
          borderRadius: 16,
          maxWidth: 420,
          textAlign: 'center',
          border: '2px solid #ef4444',
          boxShadow: '0 0 40px #ef444444',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Error</h2>
          <p style={{ margin: 0 }}>{error || 'Actividad no encontrada'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 40%, #0a0f1e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 12px',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Formulario de registro previo */}
      {!isRegistered && (
        <div style={{
          width: '100%',
          maxWidth: 450,
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.15), 0 20px 25px -5px rgba(0,0,0,0.5)',
          borderRadius: 24,
          padding: '40px 32px',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            fontSize: 54,
            marginBottom: 16,
          }}>
            🎮
          </div>
          
          <h2 style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 8,
            letterSpacing: -0.5,
            background: 'linear-gradient(to right, #818cf8, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ¡Prepárate para Jugar!
          </h2>
          
          <p style={{
            color: '#94a3b8',
            fontSize: 14,
            marginBottom: 32,
            lineHeight: 1.5
          }}>
            Ingresa tus datos para registrar tus logros en la actividad actual: <strong>{actividad.titulo}</strong>
          </p>

          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <label style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700, marginLeft: 4 }}>
                Nombre Completo:
              </label>
              <input
                type="text"
                placeholder="Ej. Luis Choque"
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1.5px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <label style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700, marginLeft: 4 }}>
                Sección del Curso:
              </label>
              <select
                value={seccionInput}
                onChange={(e) => setSeccionInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1.5px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled style={{ color: '#000' }}>Selecciona tu sección</option>
                <option value="A" style={{ color: '#000' }}>Sección A</option>
                <option value="B" style={{ color: '#000' }}>Sección B</option>
              </select>
            </div>

            {validationError && (
              <div style={{
                color: '#f87171',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'left',
                paddingLeft: 4
              }}>
                ⚠️ {validationError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                marginTop: 8
              }}
            >
              ⚔️ Registrar e Iniciar
            </button>
          </form>
        </div>
      )}

      {/* Header del Estudiante Registrado */}
      {isRegistered && (
        <div style={{
          width: '100%',
          maxWidth: 860,
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
          boxSizing: 'border-box'
        }}>
          <div>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#818cf8',
              letterSpacing: 1.5,
              display: 'block'
            }}>
              Actividad en curso
            </span>
            <h1 style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#fff',
              margin: 0,
            }}>
              {actividad.titulo || 'Misión RurAI'}
            </h1>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>Estudiante</div>
              <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: 15 }}>
                👤 {studentInfo.nombre}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 12 }}>
                🏫 Sección: {studentInfo.seccion}
              </div>
            </div>
            <button
              onClick={() => setIsRegistered(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Motor de juego */}
      {isRegistered && gameState === 'playing' && (
        <div style={{ width: '100%', maxWidth: 860 }}>
          <Suspense fallback={<SkeletonLoader />}>
            {actividad.tipoMotor === 'RPG' && <DueloDecisiones data={actividad.dataIa} onGameEnd={handleGameEnd} />}
            {actividad.tipoMotor === 'TD' && <ClasificadorDefensivo data={actividad.dataIa} onGameEnd={handleGameEnd} />}
            {actividad.tipoMotor === 'ACCION' && <DungeonCrawler data={actividad.dataIa} onGameEnd={handleGameEnd} />}
          </Suspense>
        </div>
      )}

      {/* Pantalla de Ranking Final */}
      {isRegistered && gameState === 'ranking' && rankingData && (
        <div style={{
          width: '100%',
          maxWidth: 900,
          background: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 24,
          padding: '32px',
          boxShadow: '0 0 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          color: '#fff',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: '#38bdf8' }}>🏆 ¡Juego Terminado! 🏆</h2>
            <p style={{ color: '#cbd5e1' }}>Revisa la tabla de posiciones actual para esta actividad.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            
            {/* General Ranking */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fcd34d', borderBottom: '2px solid rgba(252, 211, 77, 0.3)', paddingBottom: 12, marginBottom: 16 }}>
                Top General
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rankingData.general?.length > 0 ? rankingData.general.slice(0, 10).map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: r.nombre === studentInfo.nombre ? 'rgba(99, 102, 241, 0.2)' : 'transparent', padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 900, fontSize: 18, color: i < 3 ? '#fcd34d' : '#94a3b8' }}>#{i+1}</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.nombre}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>Sección {r.seccion}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#4ade80' }}>{r.score} pts</div>
                  </div>
                )) : <div style={{ color: '#64748b' }}>Nadie ha jugado aún.</div>}
              </div>
            </div>

            {/* Ranking by Section */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa', borderBottom: '2px solid rgba(167, 139, 250, 0.3)', paddingBottom: 12, marginBottom: 16 }}>
                Top de tu Sección ({studentInfo.seccion})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(rankingData.bySection?.[studentInfo.seccion]?.length > 0) ? rankingData.bySection[studentInfo.seccion].slice(0, 10).map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: r.nombre === studentInfo.nombre ? 'rgba(167, 139, 250, 0.2)' : 'transparent', padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 900, fontSize: 18, color: i < 3 ? '#c4b5fd' : '#94a3b8' }}>#{i+1}</span>
                      <div style={{ fontWeight: 700 }}>{r.nombre}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#4ade80' }}>{r.score} pts</div>
                  </div>
                )) : <div style={{ color: '#64748b' }}>Nadie ha jugado aún.</div>}
              </div>
            </div>

          </div>
          
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginTop: 12 }}
          >
            Volver a Jugar
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 16, color: '#1e293b', fontSize: 12 }}>
        Powered by RurAI · Experiencias Educativas
      </div>
    </div>
  );
};

export default Play;
