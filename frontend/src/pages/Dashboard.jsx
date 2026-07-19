import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { LogOut, Play, Download, Plus, AlertCircle, Trash2, Sparkles, Gamepad2, Clock, Zap } from 'lucide-react';

const MOTOR_INFO = {
  RPG: { label: 'Duelo de Decisiones', icon: '⚔️', color: '#6366f1' },
  TD:  { label: 'Clasificador Defensivo', icon: '🏰', color: '#f59e0b' },
  ACCION: { label: 'Acción', icon: '🔥', color: '#ef4444' },
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [historial, setHistorial] = useState([]);
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  
  const [formData, setFormData] = useState({
    temaId: '',
    motor: 'RPG',
    area: 'Matemática',
    grado: '2do',
    descripcion: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historialRes, temasRes] = await Promise.all([
          api.get('/actividad/historial'),
          api.get('http://localhost:3000/api/v1/temas')
        ]);
        setHistorial(historialRes.data.data);
        setTemas(temasRes.data);
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (temas.length > 0) {
      const filtered = temas.filter(t => t.area === formData.area && t.grado === formData.grado);
      if (filtered.length > 0) {
        setFormData(prev => {
          if (!filtered.some(t => t.id === prev.temaId)) {
            return { ...prev, temaId: filtered[0].id };
          }
          return prev;
        });
      } else {
        setFormData(prev => prev.temaId !== '' ? { ...prev, temaId: '' } : prev);
      }
    }
  }, [formData.area, formData.grado, temas]);

  const temasFiltrados = temas.filter(t => t.area === formData.area && t.grado === formData.grado);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerar = async (e) => {
    e.preventDefault();
    setGenerando(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const response = await api.post('/generar', {
        temaId: formData.temaId,
        motor: formData.motor,
        params: {
          area: formData.area,
          grado: formData.grado,
          descripcion: formData.descripcion
        }
      });
      
      setSuccessMsg(`¡Actividad generada! Enlace: https://rurai.pe/play/${response.data.token}`);
      
      const historialRes = await api.get('/actividad/historial');
      setHistorial(historialRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar actividad');
    } finally {
      setGenerando(false);
    }
  };

  const handleExportar = async (actividadId, titulo) => {
    try {
      const response = await api.get(`/exportar/${actividadId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${titulo.replace(/\s+/g, '_')}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al exportar', err);
    }
  };

  const handleEliminar = async (actividadId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;
    
    try {
      await api.delete(`/actividad/${actividadId}`);
      setHistorial(prev => prev.filter(act => act.id !== actividadId));
      setDeleteMsg('¡Actividad eliminada exitosamente!');
      setTimeout(() => setDeleteMsg(''), 4000);
    } catch (err) {
      console.error('Error al eliminar', err);
      alert('Error al eliminar la actividad');
    }
  };

  const selectStyle = {
    width: '100%', padding: '12px 14px',
    border: '2px solid #e2e8f0', borderRadius: 12,
    fontSize: 14, outline: 'none', background: '#fff',
    transition: 'border-color 0.2s ease',
    appearance: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: "'Poppins', system-ui, sans-serif",
    }}>
      {/* ── Navbar ── */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles style={{ color: '#6366f1', width: 24, height: 24 }} />
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              RurAI
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              background: '#f1f5f9', padding: '6px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: 700, color: '#475569',
            }}>
              Plan: <span style={{ color: '#6366f1' }}>{user?.plan || 'Free'}</span>
            </div>
            <button
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '2px solid #e2e8f0',
                padding: '8px 16px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, color: '#64748b',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
            >
              <LogOut style={{ width: 16, height: 16 }} />
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '32px 32px',
        display: 'flex', gap: 32,
        flexWrap: 'wrap',
      }}>
        {/* ── Columna Izquierda: Generación ── */}
        <div style={{ flex: '0 0 380px', maxWidth: 380 }}>
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus style={{ width: 20, height: 20, color: '#6366f1' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Nueva Actividad
              </h2>
            </div>
            
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', padding: '12px 16px', borderRadius: 12,
                fontSize: 13, marginBottom: 20, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                {error}
              </div>
            )}
            
            {successMsg && (
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#16a34a', padding: '12px 16px', borderRadius: 12,
                fontSize: 13, marginBottom: 20, fontWeight: 500, wordBreak: 'break-all',
              }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleGenerar}>
              {/* Motor Selector — Cards */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
                  Motor de Juego
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {Object.entries(MOTOR_INFO).map(([key, info]) => (
                    <button
                      key={key} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, motor: key }))}
                      style={{
                        flex: 1, padding: '14px 8px', borderRadius: 14,
                        border: formData.motor === key ? `2px solid ${info.color}` : '2px solid #e2e8f0',
                        background: formData.motor === key ? `${info.color}10` : '#fff',
                        cursor: 'pointer', textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{info.icon}</div>
                      <div style={{
                        fontSize: 11, fontWeight: 700,
                        color: formData.motor === key ? info.color : '#64748b',
                      }}>
                        {key}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                    Área
                  </label>
                  <select name="area" value={formData.area} onChange={handleChange} style={selectStyle}>
                    <option value="Matemática">Matemática</option>
                    <option value="Comunicación">Comunicación</option>
                    <option value="Ciencia y Tecnología">Ciencia y Tecnología</option>
                    <option value="Ciencias Sociales">Ciencias Sociales</option>
                    <option value="Desarrollo Personal, Ciudadanía y Cívica">DPCC</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Educación para el Trabajo">Educación para el Trabajo</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                    Grado
                  </label>
                  <select name="grado" value={formData.grado} onChange={handleChange} style={selectStyle}>
                    <option value="1ro">1ro de Secundaria</option>
                    <option value="2do">2do de Secundaria</option>
                    <option value="3ro">3ro de Secundaria</option>
                    <option value="4to">4to de Secundaria</option>
                    <option value="5to">5to de Secundaria</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                  Tema Curricular
                </label>
                <select
                  name="temaId" value={formData.temaId} onChange={handleChange}
                  disabled={temasFiltrados.length === 0}
                  style={{ ...selectStyle, opacity: temasFiltrados.length === 0 ? 0.5 : 1 }}
                >
                  {temasFiltrados.length === 0 ? (
                    <option value="">No hay temas para esta área y grado</option>
                  ) : (
                    temasFiltrados.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                  Instrucciones Adicionales
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Ej: Enfocarse en ejemplos cotidianos, usar temática espacial..."
                  style={{
                    ...selectStyle,
                    resize: 'vertical',
                    backgroundImage: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={generando}
                style={{
                  width: '100%', padding: '16px',
                  background: generando ? '#94a3b8' : '#0f172a',
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 700,
                  cursor: generando ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s ease',
                  boxShadow: generando ? 'none' : '0 4px 14px rgba(15,23,42,0.2)',
                }}
                onMouseEnter={e => { if (!generando) e.currentTarget.style.background = '#1e293b'; }}
                onMouseLeave={e => { if (!generando) e.currentTarget.style.background = '#0f172a'; }}
              >
                <Zap style={{ width: 18, height: 18 }} />
                {generando ? 'Generando con IA...' : 'Generar Actividad'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Columna Derecha: Historial ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              padding: '20px 28px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Clock style={{ width: 18, height: 18, color: '#94a3b8' }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Historial de Actividades
              </h3>
              <span style={{
                marginLeft: 'auto', background: '#f1f5f9',
                padding: '4px 10px', borderRadius: 8,
                fontSize: 12, fontWeight: 700, color: '#64748b',
              }}>
                {historial.length} total
              </span>
            </div>

            {deleteMsg && (
              <div style={{
                padding: '12px 28px', background: '#fef2f2',
                borderBottom: '1px solid #fecaca', fontSize: 13, fontWeight: 600, color: '#dc2626',
              }}>
                {deleteMsg}
              </div>
            )}

            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                Cargando historial...
              </div>
            ) : historial.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Gamepad2 style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 16px' }} />
                <p style={{ color: '#94a3b8', fontSize: 15, fontWeight: 600 }}>
                  No has generado ninguna actividad aún.
                </p>
                <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>
                  Usa el formulario de la izquierda para crear tu primera.
                </p>
              </div>
            ) : (
              <div>
                {historial.map((act, idx) => {
                  const motorInfo = MOTOR_INFO[act.tipoMotor] || { icon: '🎮', color: '#6366f1', label: act.tipoMotor };
                  return (
                    <div
                      key={act.id}
                      style={{
                        padding: '18px 28px',
                        borderBottom: idx < historial.length - 1 ? '1px solid #f1f5f9' : 'none',
                        display: 'flex', alignItems: 'center', gap: 16,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${motorInfo.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, flexShrink: 0,
                      }}>
                        {motorInfo.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 15, fontWeight: 700, color: '#0f172a',
                          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {act.titulo}
                        </p>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          fontSize: 13, color: '#94a3b8', marginTop: 4,
                        }}>
                          <span style={{
                            background: `${motorInfo.color}18`, color: motorInfo.color,
                            padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: 12,
                          }}>
                            {motorInfo.label}
                          </span>
                          <span style={{
                            fontFamily: 'monospace', background: '#f1f5f9',
                            padding: '2px 6px', borderRadius: 4, fontSize: 12,
                          }}>
                            {act.tokenCorto}
                          </span>
                          <span>{new Date(act.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <a
                          href={`/play/${act.tokenCorto}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Jugar"
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: '#10b981', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Play style={{ width: 16, height: 16, color: '#fff' }} />
                        </a>
                        <button
                          onClick={() => handleExportar(act.id, act.titulo)}
                          title="Exportar DOCX"
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: '#fff', border: '2px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                          <Download style={{ width: 16, height: 16, color: '#64748b' }} />
                        </button>
                        <button
                          onClick={() => handleEliminar(act.id)}
                          title="Eliminar"
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: '#fff', border: '2px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                        >
                          <Trash2 style={{ width: 16, height: 16, color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
