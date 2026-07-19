import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Sparkles } from 'lucide-react';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(correo, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#fafafa',
      fontFamily: "'Poppins', system-ui, sans-serif",
    }}>
      {/* Panel Izquierdo — Branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blobs decorativos */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            marginBottom: 24,
          }}>
            <Sparkles style={{ color: '#818cf8', width: 36, height: 36 }} />
            <span style={{
              fontSize: 48, fontWeight: 900, color: '#fff',
              letterSpacing: '-1px',
            }}>
              RurAI
            </span>
          </div>
          <p style={{
            color: '#94a3b8', fontSize: 18, maxWidth: 380,
            lineHeight: 1.6, margin: '0 auto',
          }}>
            Experiencias educativas gamificadas con Inteligencia Artificial para el sistema peruano.
          </p>

          <div style={{
            marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center',
          }}>
            {[
              { num: '3', label: 'Motores de Juego' },
              { num: '6', label: 'Áreas Curriculares' },
              { num: '∞', label: 'Preguntas con IA' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#818cf8' }}>{s.num}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Derecho — Formulario */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: '#0f172a',
            marginBottom: 6,
          }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>
            Ingresa tus credenciales para continuar
          </p>
          
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', padding: '12px 16px', borderRadius: 12,
              fontSize: 14, marginBottom: 24, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 18, height: 18, color: '#94a3b8',
                }} />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 14px 14px 44px',
                    border: '2px solid #e2e8f0', borderRadius: 14,
                    fontSize: 15, outline: 'none',
                    transition: 'border-color 0.2s ease',
                    background: '#fff',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#818cf8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 18, height: 18, color: '#94a3b8',
                }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 14px 14px 44px',
                    border: '2px solid #e2e8f0', borderRadius: 14,
                    fontSize: 15, outline: 'none',
                    transition: 'border-color 0.2s ease',
                    background: '#fff',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#818cf8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '16px',
                background: isLoading ? '#94a3b8' : '#0f172a',
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 16, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(15,23,42,0.25)',
              }}
              onMouseEnter={e => { if (!isLoading) e.target.style.background = '#1e293b'; }}
              onMouseLeave={e => { if (!isLoading) e.target.style.background = '#0f172a'; }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#64748b' }}>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
