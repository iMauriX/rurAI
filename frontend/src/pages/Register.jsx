import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 14px 14px 44px',
    border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 14,
    fontSize: 14, outline: 'none',
    color: '#fff',
    transition: 'all 0.2s ease',
    background: 'rgba(15, 23, 42, 0.3)',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#090d16',
      fontFamily: "'Poppins', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: 24,
    }}>
      {/* Background Radial Glows */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Main Container Card */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: '40px 32px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
        zIndex: 1,
        boxSizing: 'border-box',
        animation: 'fadeIn 0.6s ease'
      }}>
        {/* Branding Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            marginBottom: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles style={{ color: '#fff', width: 18, height: 18 }} />
            </div>
            <span style={{
              fontSize: 28, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.5px',
            }}>
              RurAI
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, fontWeight: 500 }}>
            Inteligencia Artificial para Experiencias Educativas
          </p>
        </div>

        <h2 style={{
          fontSize: 22, fontWeight: 800, color: '#fff',
          marginBottom: 6, textAlign: 'center', letterSpacing: '-0.3px'
        }}>
          Crea tu cuenta
        </h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, textAlign: 'center' }}>
          Regístrate como docente para empezar a generar actividades
        </p>
        
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171', padding: '12px 16px', borderRadius: 14,
            fontSize: 13, marginBottom: 24, fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First & Last name row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nombre
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: '#64748b',
                }} />
                <input
                  type="text" name="nombre" required placeholder="Juan"
                  value={formData.nombre} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Apellido
              </label>
              <input
                type="text" name="apellido" required placeholder="Pérez"
                value={formData.apellido} onChange={handleChange}
                style={{ ...inputStyle, paddingLeft: 16 }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Email input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 18, height: 18, color: '#64748b',
              }} />
              <input
                type="email" name="correo" required placeholder="ejemplo@correo.com"
                value={formData.correo} onChange={handleChange}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
          
          {/* Password input */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 18, height: 18, color: '#64748b',
              }} />
              <input
                type="password" name="password" required placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '14px',
              background: isLoading ? '#475569' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff', border: 'none', borderRadius: 14,
              fontSize: 15, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: isLoading ? 'none' : '0 4px 12px rgba(99,102,241,0.2)',
            }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.transform = 'none'; }}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            {!isLoading && <ArrowRight style={{ width: 16, height: 16 }} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: '#64748b', margin: '28px 0 0 0' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
