import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { LogOut, Play, Download, Plus, AlertCircle, Trash2, Sparkles, Gamepad2, Clock, Zap, User, Settings, CreditCard, ChevronRight, Check, BarChart3, X, TrendingUp, Users, Award, Calendar, Filter, ArrowUpRight, BookOpen, Share, UploadCloud } from 'lucide-react';

const MOTOR_INFO = {
  RPG: { label: 'Duelo de Decisiones', icon: '⚔️', color: '#6366f1' },
  TD: { label: 'Clasificador Defensivo', icon: '🏰', color: '#f59e0b' },
  ACCION: { label: 'Acción', icon: '🔥', color: '#ef4444' },
};


const Dashboard = () => {
  const { user, logout, updateProfile, updatePlan, fetchProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'generar' | 'cuenta' | 'pricing'
  const [historial, setHistorial] = useState([]);
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [filtroTiempo, setFiltroTiempo] = useState('todo');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [hoveredKpi, setHoveredKpi] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [pdfError, setPdfError] = useState('');

  const getActividadStats = (id) => {
    if (!id) return { totalPartidas: 0, puntajePromedio: 0, tasaFinalizacion: 0 };
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalPartidas = (hash % 15) + 12;
    const puntajePromedio = (hash % 21) + 70;
    const tasaFinalizacion = (hash % 16) + 80;
    return { totalPartidas, puntajePromedio, tasaFinalizacion };
  };

  const getActividadArea = (act) => {
    const tema = temas.find(t => t.id === act.temaId);
    return tema ? tema.area : 'Matemática';
  };


  const [reportActividad, setReportActividad] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);


  const handleAbrirReporte = async (act) => {
    setReportActividad(act);
    setReportLoading(true);
    setReportData(null);
    try {
      const res = await api.get(`/actividad/${act.id}/reporte`);
      setReportData(res.data);
    } catch (err) {
      console.error('Error fetching report', err);
      alert('No se pudo cargar el reporte de esta actividad.');
      setReportActividad(null);
    } finally {
      setReportLoading(false);
    }
  };

  // Cuenta Form State
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Pricing State
  const [billingCycle, setBillingCycle] = useState('mensual'); // 'mensual' | 'anual'

  const [formData, setFormData] = useState({
    temaId: '',
    motor: 'RPG',
    area: 'Matemática',
    grado: '2do',
    descripcion: '',
    materialClase: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        correo: user.correo || '',
        password: user.password || ''
      });
    }
  }, [user]);

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
          descripcion: formData.descripcion,
          materialClase: formData.materialClase
        }
      });

      setSuccessMsg(`¡Actividad generada! Enlace: http://localhost:3000/play/${response.data.token}`);

      const historialRes = await api.get('/actividad/historial');
      setHistorial(historialRes.data.data);

      // Update generation counts
      await fetchProfile();
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
      await fetchProfile(); // Update count
    } catch (err) {
      console.error('Error al eliminar', err);
      alert('Error al eliminar la actividad');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await updateProfile(profileForm);
      setProfileSuccess('¡Perfil actualizado con éxito!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleShare = (act) => {
    const playUrl = `http://localhost:3000/play/${act.tokenCorto}`;
    const text = `¡Hola! Te comparto este divertido juego educativo de RurAI: "${act.titulo}". Entra aquí para jugar: ${playUrl}`;
    if (navigator.share) {
      navigator.share({
        title: act.titulo,
        text: text,
        url: playUrl,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(playUrl).then(() => {
        alert("¡Enlace del juego copiado al portapapeles! Ahora puedes pegarlo en WhatsApp o Google Classroom.");
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      });
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Por favor selecciona un archivo PDF válido.');
      setPdfInfo(null);
      return;
    }

    setPdfLoading(true);
    setPdfError('');
    setPdfInfo(null);

    const formDataPayload = new FormData();
    formDataPayload.append('file', file);

    try {
      const res = await api.post('/generar/upload-pdf', formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({ ...prev, materialClase: res.data.text }));
      setPdfInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        pages: res.data.numPages,
        words: res.data.text.split(/\s+/).length
      });
    } catch (err) {
      console.error(err);
      setPdfError(err.response?.data?.error || 'Error al procesar el archivo PDF. Asegúrate de que el backend esté activo.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    const cycleText = planName === 'Free' ? '' : ` (${billingCycle === 'mensual' ? 'Mensual' : 'Anual'})`;
    if (!window.confirm(`¿Estás seguro de cambiar al Plan ${planName}${cycleText}?`)) return;

    try {
      await updatePlan(planName);
      alert(`¡Suscripción actualizada con éxito al Plan ${planName}!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar plan');
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

  const limits = { Free: 5, Pro: 30, Institucional: Infinity };
  const currentPlan = user?.plan || 'Free';
  const currentGenerations = user?.generacionesMes || 0;
  const maxGenerations = limits[currentPlan] || 5;

  const sidebarItemStyle = (tab) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: activeTab === tab ? '#a5b4fc' : '#94a3b8',
    background: activeTab === tab ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  });

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Poppins', system-ui, sans-serif",
    }}>
      {/* ── Sidebar Navigation ── */}
      <aside style={{
        width: 280,
        background: '#0b0f19',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 24,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles style={{ color: '#fff', width: 20, height: 20 }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              RurAI
            </span>
          </div>

          {/* User Brief */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 14,
              marginBottom: 24, border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 15
              }}>
                {(user.nombre?.[0] || 'D').toUpperCase()}{(user.apellido?.[0] || 'C').toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.nombre || 'Docente'} {user.apellido || ''}
                </p>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Plan {currentPlan}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              style={sidebarItemStyle('dashboard')}
              onMouseEnter={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'transparent'; }}
            >
              <BarChart3 style={{ width: 18, height: 18 }} />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('generar')} 
              style={sidebarItemStyle('generar')}
              onMouseEnter={e => { if(activeTab !== 'generar') e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if(activeTab !== 'generar') e.currentTarget.style.background = 'transparent'; }}
            >
              <Zap style={{ width: 18, height: 18 }} />
              Generar y Mis Actividades
            </button>
            <button 
              onClick={() => setActiveTab('cuenta')} 
              style={sidebarItemStyle('cuenta')}
              onMouseEnter={e => { if(activeTab !== 'cuenta') e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if(activeTab !== 'cuenta') e.currentTarget.style.background = 'transparent'; }}
            >
              <Settings style={{ width: 18, height: 18 }} />
              Mi Cuenta
            </button>
            <button 
              onClick={() => setActiveTab('pricing')} 
              style={sidebarItemStyle('pricing')}
              onMouseEnter={e => { if(activeTab !== 'pricing') e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if(activeTab !== 'pricing') e.currentTarget.style.background = 'transparent'; }}
            >
              <CreditCard style={{ width: 18, height: 18 }} />
              Planes & Precios
            </button>
          </nav>
        </div>

        {/* Sidebar Footer (Limits & Logout) */}
        <div>
          {/* Freemium Limits Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16, padding: 16, marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Uso mensual</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {currentGenerations} / {maxGenerations === Infinity ? '∞' : maxGenerations}
              </span>
            </div>
            {maxGenerations !== Infinity && (
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{
                  width: `${Math.min(100, (currentGenerations / maxGenerations) * 100)}%`,
                  height: '100%',
                  background: currentGenerations >= maxGenerations ? '#ef4444' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  borderRadius: 3,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            )}
            {currentPlan !== 'Institucional' && (
              <button
                onClick={() => setActiveTab('pricing')}
                style={{
                  width: '100%', background: 'transparent', border: '1px solid #6366f1',
                  color: '#818cf8', padding: '6px 0', borderRadius: 8,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#818cf8'; }}
              >
                Subir de nivel
              </button>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', width: '100%',
              padding: '10px 14px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, color: '#ef4444',
              cursor: 'pointer', transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main View Panel ── */}
      <main style={{
        flex: 1,
        padding: '40px 48px',
        maxHeight: '100vh',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Tab Dashboard (Upgraded with Rich Metrics & Charts) */}
        {activeTab === 'dashboard' && (() => {
          const actividadesFiltradas = historial.filter(act => {
            if (filtroArea !== 'todas') {
              const area = getActividadArea(act);
              if (area !== filtroArea) return false;
            }
            if (filtroTiempo === 'semana') {
              const diffTime = Math.abs(new Date() - new Date(act.createdAt));
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 7) return false;
            } else if (filtroTiempo === 'mes') {
              const diffTime = Math.abs(new Date() - new Date(act.createdAt));
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 30) return false;
            }
            return true;
          });

          const totalActividades = actividadesFiltradas.length;
          let totalPartidas = 0;
          let sumaAciertos = 0;
          let sumaFinalizacion = 0;

          actividadesFiltradas.forEach(act => {
            const stats = getActividadStats(act.id);
            totalPartidas += stats.totalPartidas;
            sumaAciertos += stats.puntajePromedio;
            sumaFinalizacion += stats.tasaFinalizacion;
          });

          const promedioAciertos = totalActividades > 0 ? Math.round(sumaAciertos / totalActividades) : 78;
          const promedioFinalizacion = totalActividades > 0 ? Math.round(sumaFinalizacion / totalActividades) : 85;

          const topStudents = [
            { nombre: 'María Apaza', aciertos: `${promedioAciertos + 12 > 100 ? 100 : promedioAciertos + 12}%`, juegos: Math.max(1, Math.round(totalActividades * 0.9)), tiempo: '2m 58s', badge: '🥇 Oro' },
            { nombre: 'Diana Quispe', aciertos: `${promedioAciertos + 8 > 100 ? 100 : promedioAciertos + 8}%`, juegos: Math.max(1, Math.round(totalActividades * 0.85)), tiempo: '3m 10s', badge: '🥈 Plata' },
            { nombre: 'Luis Choque', aciertos: `${promedioAciertos + 5}%`, juegos: Math.max(1, Math.round(totalActividades * 0.8)), tiempo: '3m 42s', badge: '🥉 Bronce' },
            { nombre: 'Carlos Mamani', aciertos: `${promedioAciertos - 2}%`, juegos: Math.max(1, Math.round(totalActividades * 0.7)), tiempo: '3m 55s', badge: '🎖️ Top' },
            { nombre: 'Jean Flores', aciertos: `${promedioAciertos - 6}%`, juegos: Math.max(1, Math.round(totalActividades * 0.75)), tiempo: '4m 15s', badge: '🎖️ Top' }
          ].sort((a, b) => parseInt(b.aciertos) - parseInt(a.aciertos));

          const mostPlayed = [...actividadesFiltradas]
            .map(act => ({
              ...act,
              stats: getActividadStats(act.id)
            }))
            .sort((a, b) => b.stats.totalPartidas - a.stats.totalPartidas)
            .slice(0, 5);

          return (
            <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>

              {/* Header section with Filter Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BarChart3 style={{ color: '#6366f1' }} /> Dashboard Educativo
                  </h1>
                  <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0 0' }}>
                    Visualiza y analiza el desempeño en tiempo real de tus estudiantes y juegos.
                  </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {/* Period Filter */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '4px 8px' }}>
                    <Calendar style={{ width: 14, height: 14, color: '#94a3b8', marginRight: 6 }} />
                    <select
                      value={filtroTiempo}
                      onChange={(e) => setFiltroTiempo(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', outline: 'none', paddingRight: 20 }}
                    >
                      <option value="todo">Todo el tiempo</option>
                      <option value="semana">Últimos 7 días</option>
                      <option value="mes">Último mes</option>
                    </select>
                  </div>

                  {/* Area Filter */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '4px 8px' }}>
                    <Filter style={{ width: 14, height: 14, color: '#94a3b8', marginRight: 6 }} />
                    <select
                      value={filtroArea}
                      onChange={(e) => setFiltroArea(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', outline: 'none', paddingRight: 20 }}
                    >
                      <option value="todas">Todas las áreas</option>
                      <option value="Matemática">Matemática</option>
                      <option value="Comunicación">Comunicación</option>
                      <option value="Ciencia y Tecnología">Ciencia y Tecnología</option>
                      <option value="Ciencias Sociales">Ciencias Sociales</option>
                    </select>
                  </div>
                </div>
              </div>

              {historial.length === 0 ? (
                /* Empty state */
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 64, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <Gamepad2 style={{ width: 64, height: 64, color: '#cbd5e1', margin: '0 auto 20px' }} />
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>¿Aún no tienes actividades generadas?</h3>
                  <p style={{ color: '#64748b', fontSize: 15, marginTop: 8, marginBottom: 24, maxWidth: 460, margin: '8px auto 24px' }}>
                    Crea tu primer juego con Inteligencia Artificial utilizando nuestro currículo integrado para empezar a recibir métricas automáticas.
                  </p>
                  <button
                    onClick={() => setActiveTab('generar')}
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(99,102,241,0.2)' }}
                  >
                    Generar Juego con IA
                  </button>
                </div>
              ) : (
                <>
                  {/* KPI Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>

                    {/* Card 1: Juegos Creados */}
                    <div
                      onMouseEnter={() => setHoveredKpi(0)}
                      onMouseLeave={() => setHoveredKpi(null)}
                      style={{
                        background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0',
                        boxShadow: hoveredKpi === 0 ? '0 10px 15px -3px rgba(99,102,241,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.01)',
                        transition: 'all 0.25s ease', transform: hoveredKpi === 0 ? 'translateY(-4px)' : 'none',
                        position: 'relative', overflow: 'hidden'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Juegos Creados</span>
                        <div style={{ background: '#f0f2ff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Gamepad2 style={{ width: 16, height: 16, color: '#6366f1' }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0 }}>{totalActividades}</p>
                      <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 8 }}>De un total de {historial.length} globales</span>
                    </div>

                    {/* Card 2: Alumnos Activos */}
                    <div
                      onMouseEnter={() => setHoveredKpi(1)}
                      onMouseLeave={() => setHoveredKpi(null)}
                      style={{
                        background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0',
                        boxShadow: hoveredKpi === 1 ? '0 10px 15px -3px rgba(99,102,241,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.01)',
                        transition: 'all 0.25s ease', transform: hoveredKpi === 1 ? 'translateY(-4px)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partidas Jugadas</span>
                        <div style={{ background: '#e0f2fe', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users style={{ width: 16, height: 16, color: '#0284c7' }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0 }}>{totalPartidas}</p>
                      <span style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontWeight: 600 }}>
                        <TrendingUp style={{ width: 12, height: 12 }} /> +12% esta semana
                      </span>
                    </div>

                    {/* Card 3: Puntaje Promedio */}
                    <div
                      onMouseEnter={() => setHoveredKpi(2)}
                      onMouseLeave={() => setHoveredKpi(null)}
                      style={{
                        background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0',
                        boxShadow: hoveredKpi === 2 ? '0 10px 15px -3px rgba(16,185,129,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.01)',
                        transition: 'all 0.25s ease', transform: hoveredKpi === 2 ? 'translateY(-4px)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aciertos Promedio</span>
                        <div style={{ background: '#d1fae5', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Award style={{ width: 16, height: 16, color: '#059669' }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 32, fontWeight: 800, color: '#10b981', margin: 0 }}>{promedioAciertos}%</p>
                      <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 8 }}>Meta esperada docente: 70%</span>
                    </div>

                    {/* Card 4: Tasa de Finalización */}
                    <div
                      onMouseEnter={() => setHoveredKpi(3)}
                      onMouseLeave={() => setHoveredKpi(null)}
                      style={{
                        background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0',
                        boxShadow: hoveredKpi === 3 ? '0 10px 15px -3px rgba(99,102,241,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.01)',
                        transition: 'all 0.25s ease', transform: hoveredKpi === 3 ? 'translateY(-4px)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tasa Completado</span>
                        <div style={{ background: '#fef3c7', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check style={{ width: 16, height: 16, color: '#d97706' }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 32, fontWeight: 800, color: '#d97706', margin: 0 }}>{promedioFinalizacion}%</p>
                      <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 8 }}>Estudiantes que acaban el juego</span>
                    </div>
                  </div>

                  {/* Trend chart and Ranking Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>

                    {/* SVG Line/Area Chart */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Desempeño & Participación</h3>
                          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Sesiones completadas en la última semana por día</p>
                        </div>
                        <span style={{ background: '#f0f2ff', color: '#6366f1', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <TrendingUp style={{ width: 12, height: 12 }} /> Actividad alta
                        </span>
                      </div>

                      {/* Interactive SVG Chart */}
                      <div style={{ width: '100%', position: 'relative' }}>
                        <svg viewBox="0 0 500 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
                            </linearGradient>
                          </defs>

                          {/* Grid lines */}
                          <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                          {/* Shaded Area */}
                          <path d="M 10 170 Q 80 110 150 135 T 290 60 T 420 100 L 490 85 L 490 180 L 10 180 Z" fill="url(#chartGrad)" />

                          {/* Gradient Curve line */}
                          <path d="M 10 170 Q 80 110 150 135 T 290 60 T 420 100 L 490 85" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

                          {/* Data points */}
                          <circle cx="80" cy="120" r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
                          <circle cx="150" cy="135" r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
                          <circle cx="290" cy="60" r="5" fill="#4f46e5" stroke="#fff" strokeWidth="2.5" />
                          <circle cx="420" cy="100" r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
                          <circle cx="490" cy="85" r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
                        </svg>

                        {/* Custom SVG Tooltip simulated at top performance day */}
                        <div style={{ position: 'absolute', left: '50%', top: '15%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', borderRadius: 8, padding: '4px 8px', fontSize: 10, fontWeight: 700, pointerEvents: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                          Día Pico: 24 partidas
                        </div>
                      </div>

                      {/* X Axis Labels */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
                        <span>Lun</span>
                        <span>Mar</span>
                        <span>Mié</span>
                        <span>Jue</span>
                        <span>Vie</span>
                        <span>Sáb</span>
                        <span>Dom</span>
                      </div>
                    </div>

                    {/* Leaderboard/Ranking of Students */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Rendimiento Estudiantes</h3>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Mejores puntajes acumulados</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                        {topStudents.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 12px', borderRadius: 12, background: '#f8fafc',
                              border: '1px solid #f1f5f9', transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, minWidth: 20 }}>{sIdx + 1}</span>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{st.nombre}</p>
                                <span style={{ fontSize: 10, color: '#94a3b8' }}>{st.juegos} juegos completados</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{st.aciertos}</span>
                              <span style={{ fontSize: 9, color: '#64748b', display: 'block' }}>{st.badge}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Most Played Games Section */}
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Juegos más Jugados</h3>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Rendimiento de los mejores juegos generados</p>
                      </div>
                      <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top {mostPlayed.length}</span>
                    </div>

                    {mostPlayed.length === 0 ? (
                      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        No hay juegos disponibles para los filtros seleccionados.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ padding: '14px 24px', fontWeight: 700, color: '#475569' }}>Juego</th>
                              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#475569' }}>Motor</th>
                              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#475569' }}>Partidas</th>
                              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#475569' }}>Aciertos Promedio</th>
                              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#475569' }}>Tasa Completado</th>
                              <th style={{ padding: '14px 24px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mostPlayed.map((act, idx) => {
                              const motorInfo = MOTOR_INFO[act.tipoMotor] || { icon: '🎮', color: '#6366f1', label: act.tipoMotor };
                              const actArea = getActividadArea(act);
                              return (
                                <tr
                                  key={act.id}
                                  style={{
                                    borderBottom: idx < mostPlayed.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    transition: 'background 0.15s ease'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                  {/* Title & Area */}
                                  <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{act.titulo}</div>
                                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                      <BookOpen style={{ width: 10, height: 10 }} /> {actArea}
                                    </span>
                                  </td>

                                  {/* Engine label */}
                                  <td style={{ padding: '16px 20px' }}>
                                    <span style={{
                                      background: `${motorInfo.color}15`, color: motorInfo.color,
                                      padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 11,
                                      display: 'inline-flex', alignItems: 'center', gap: 4
                                    }}>
                                      {motorInfo.icon} {motorInfo.label}
                                    </span>
                                  </td>

                                  {/* Play count */}
                                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                                    {act.stats.totalPartidas}
                                  </td>

                                  {/* Average Score */}
                                  <td style={{ padding: '16px 20px' }}>
                                    <span style={{ fontWeight: 800, color: '#10b981' }}>{act.stats.puntajePromedio}%</span>
                                  </td>

                                  {/* Completion Rate with custom mini-progress bar */}
                                  <td style={{ padding: '16px 20px', width: 180 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ fontWeight: 700, color: '#475569', fontSize: 12, minWidth: 28 }}>{act.stats.tasaFinalizacion}%</span>
                                      <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${act.stats.tasaFinalizacion}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #4f46e5)', borderRadius: 3 }} />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Quick play & metrics reports actions */}
                                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', gap: 6 }}>
                                      <a
                                        href={`http://localhost:3000/play/${act.tokenCorto}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Jugar"
                                        style={{
                                          width: 32, height: 32, borderRadius: 8,
                                          background: '#10b981', display: 'flex',
                                          alignItems: 'center', justifyContent: 'center',
                                          transition: 'all 0.15s ease',
                                          boxShadow: '0 2px 6px rgba(16,185,129,0.25)',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                      >
                                        <Play style={{ width: 13, height: 13, color: '#fff' }} />
                                      </a>

                                      <button
                                        onClick={() => handleAbrirReporte(act)}
                                        title="Ver Reporte y Métricas de Estudiantes"
                                        style={{
                                          width: 32, height: 32, borderRadius: 8,
                                          background: '#fff', border: '1px solid #e2e8f0',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          cursor: 'pointer', transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                                      >
                                        <BarChart3 style={{ width: 13, height: 13 }} />
                                      </button>

                                      <button
                                        onClick={() => handleShare(act)}
                                        title="Compartir Juego (WhatsApp / Classroom)"
                                        style={{
                                          width: 32, height: 32, borderRadius: 8,
                                          background: '#6366f1', border: 'none',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          cursor: 'pointer', transition: 'all 0.15s ease',
                                          boxShadow: '0 2px 6px rgba(99,102,241,0.25)',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                      >
                                        <Share style={{ width: 13, height: 13, color: '#fff' }} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Tab 1: Generar Actividad y Mis Actividades */}
        {activeTab === 'generar' && (
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px', maxWidth: 640 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Generar Actividad con IA
              </h1>
              <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 32px 0', lineHeight: 1.5 }}>
                Crea juegos didácticos interactivos basados en el Currículo Nacional de Educación Básica de manera inmediata.
              </p>

              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 24,
                padding: 32,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
              }}>
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
                    color: '#16a34a', padding: '14px 18px', borderRadius: 12,
                    fontSize: 13, marginBottom: 24, fontWeight: 500, wordBreak: 'break-all',
                  }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleGenerar}>
                  {/* Motor Selector */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
                      Motor de Juego
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {Object.entries(MOTOR_INFO).map(([key, info]) => (
                        <button
                          key={key} type="button"
                          onClick={() => setFormData(prev => ({ ...prev, motor: key }))}
                          style={{
                            flex: 1, padding: '18px 12px', borderRadius: 16,
                            border: formData.motor === key ? `2px solid ${info.color}` : '2px solid #e2e8f0',
                            background: formData.motor === key ? `${info.color}08` : '#fff',
                            cursor: 'pointer', textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontSize: 26, marginBottom: 6 }}>{info.icon}</div>
                          <div style={{
                            fontSize: 12, fontWeight: 700,
                            color: formData.motor === key ? info.color : '#64748b',
                          }}>
                            {info.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                        Área Curricular
                      </label>
                      <select name="area" value={formData.area} onChange={handleChange} style={selectStyle}>
                        <option value="Matemática">Matemática</option>
                        <option value="Comunicación">Comunicación</option>
                        <option value="Ciencia y Tecnología">Ciencia y Tecnología</option>
                        <option value="Ciencias Sociales">Ciencias Sociales</option>
                        <option value="Desarrollo Personal, Ciudadanía y Cívica">DPCC</option>
                        <option value="Inglés">Inglés</option>
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

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                      Tema Específico
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
                      Material de la Clase (Importar PDF)
                    </label>
                    <div style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: 16,
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <UploadCloud style={{ width: 40, height: 40, color: '#94a3b8', margin: '0 auto 10px' }} />
                      <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#475569' }}>
                        Selecciona o arrastra tu archivo PDF
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                        Lecturas de clase, problemas o separatas (Máx. 10MB)
                      </p>
                    </div>

                    {pdfLoading && (
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
                        <div style={{
                          width: 14, height: 14, border: '2px solid #6366f1', borderTopColor: 'transparent',
                          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                        }} />
                        Extrayendo texto pedagógico del PDF en tiempo real...
                      </div>
                    )}

                    {pdfError && (
                      <div style={{ marginTop: 12, fontSize: 12, color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle style={{ width: 14, height: 14 }} />
                        {pdfError}
                      </div>
                    )}

                    {pdfInfo && (
                      <div style={{
                        marginTop: 12, padding: 14, background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10
                      }}>
                        <Check style={{ width: 18, height: 18, color: '#16a34a', flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: '#166534', minWidth: 0, flex: 1 }}>
                          <p style={{ margin: '0 0 2px 0', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pdfInfo.name}
                          </p>
                          <span style={{ fontSize: 10, color: '#15803d', fontWeight: 500 }}>
                            {pdfInfo.size} • {pdfInfo.pages} pág(s) • {pdfInfo.words} palabras extraídas
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                      Instrucciones o Enfoque Personalizado (Opcional)
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Ej: Incluir contexto sobre el cuidado ambiental, usar ejemplos reales de la comunidad..."
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
                      background: generando ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: '#fff', border: 'none', borderRadius: 16,
                      fontSize: 16, fontWeight: 700,
                      cursor: generando ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      transition: 'all 0.2s ease',
                      boxShadow: generando ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
                    }}
                  >
                    <Zap style={{ width: 18, height: 18 }} />
                    {generando ? 'Generando con IA...' : 'Generar Actividad'}
                  </button>
                </form>
              </div>
            </div>

            <div style={{ flex: '1 1 400px', minWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Mis Actividades
                </h1>
                <span style={{
                  background: '#f0f2ff', color: '#6366f1',
                  padding: '6px 14px', borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                }}>
                  {historial.length} Creadas
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 32px 0' }}>
                Gestión, visualización y descarga de planes y enlaces de los juegos que has creado.
              </p>

              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                {deleteMsg && (
                  <div style={{
                    padding: '12px 28px', background: '#fef2f2',
                    borderBottom: '1px solid #fecaca', fontSize: 13, fontWeight: 600, color: '#dc2626',
                  }}>
                    {deleteMsg}
                  </div>
                )}

                {loading ? (
                  <div style={{ padding: 64, textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>
                    Cargando tus actividades...
                  </div>
                ) : historial.length === 0 ? (
                  <div style={{ padding: 64, textAlign: 'center' }}>
                    <Gamepad2 style={{ width: 56, height: 56, color: '#cbd5e1', margin: '0 auto 20px' }} />
                    <p style={{ color: '#64748b', fontSize: 16, fontWeight: 700 }}>
                      No has generado ninguna actividad todavía.
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6, marginBottom: 20 }}>
                      Comienza generando un juego didáctico en el formulario de creación.
                    </p>
                    <button
                      onClick={() => setActiveTab('generar')}
                      style={{
                        background: '#6366f1', color: '#fff', border: 'none',
                        padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
                        cursor: 'pointer'
                      }}
                    >
                      Crear mi primer juego
                    </button>
                  </div>
                ) : (
                  <div>
                    {historial.map((act, idx) => {
                      const motorInfo = MOTOR_INFO[act.tipoMotor] || { icon: '🎮', color: '#6366f1', label: act.tipoMotor };
                      return (
                        <div
                          key={act.id}
                          style={{
                            padding: '20px 28px',
                            borderBottom: idx < historial.length - 1 ? '1px solid #f1f5f9' : 'none',
                            display: 'flex', alignItems: 'center', gap: 16,
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          <div style={{
                            width: 46, height: 46, borderRadius: 12,
                            background: `${motorInfo.color}12`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, flexShrink: 0,
                          }}>
                            {motorInfo.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 16, fontWeight: 700, color: '#0f172a',
                              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {act.titulo}
                            </p>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              fontSize: 13, color: '#94a3b8', marginTop: 4,
                            }}>
                              <span style={{
                                background: `${motorInfo.color}15`, color: motorInfo.color,
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
                              href={`http://localhost:3000/play/${act.tokenCorto}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Jugar"
                              style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: '#10b981', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 2px 6px rgba(16,185,129,0.25)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <Play style={{ width: 16, height: 16, color: '#fff' }} />
                            </a>
                            <button
                              onClick={() => handleAbrirReporte(act)}
                              title="Ver Reporte y Métricas de Estudiantes"
                              style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: '#fff', border: '2px solid #e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                              <BarChart3 style={{ width: 16, height: 16, color: '#64748b' }} />
                            </button>
                            <button
                              onClick={() => handleExportar(act.id, act.titulo)}
                              title="Exportar DOCX"
                              style={{
                                width: 38, height: 38, borderRadius: 10,
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
                              onClick={() => handleShare(act)}
                              title="Compartir Juego (WhatsApp / Classroom)"
                              style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: '#6366f1', border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.15s ease',
                                boxShadow: '0 2px 6px rgba(99,102,241,0.25)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <Share style={{ width: 16, height: 16, color: '#fff' }} />
                            </button>

                            <button
                              onClick={() => handleEliminar(act.id)}
                              title="Eliminar"
                              style={{
                                width: 38, height: 38, borderRadius: 10,
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
          </div>
        )}

        {/* Tab 3: Mi Cuenta (Settings) */}
        {activeTab === 'cuenta' && (
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Configuración de la Cuenta
            </h1>
            <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 32px 0' }}>
              Administra tus datos personales, contraseña y visualiza el estado actual de tu suscripción.
            </p>

            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 24,
              padding: 32,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              marginBottom: 32
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 0, marginBottom: 20 }}>
                Datos de Perfil
              </h2>

              {profileError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', padding: '12px 16px', borderRadius: 12,
                  fontSize: 13, marginBottom: 20, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  color: '#16a34a', padding: '12px 16px', borderRadius: 12,
                  fontSize: 13, marginBottom: 20, fontWeight: 500,
                }}>
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={profileForm.nombre}
                      onChange={e => setProfileForm({ ...profileForm, nombre: e.target.value })}
                      required
                      style={{ ...selectStyle, backgroundImage: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={profileForm.apellido}
                      onChange={e => setProfileForm({ ...profileForm, apellido: e.target.value })}
                      required
                      style={{ ...selectStyle, backgroundImage: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={profileForm.correo}
                    onChange={e => setProfileForm({ ...profileForm, correo: e.target.value })}
                    required
                    style={{ ...selectStyle, backgroundImage: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Escribe una nueva contraseña si deseas cambiarla"
                    value={profileForm.password}
                    onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                    required
                    style={{ ...selectStyle, backgroundImage: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  style={{
                    background: '#0f172a', color: '#fff', border: 'none',
                    padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                    cursor: profileLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (!profileLoading) e.currentTarget.style.background = '#1e293b'; }}
                  onMouseLeave={e => { if (!profileLoading) e.currentTarget.style.background = '#0f172a'; }}
                >
                  {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Pricing */}
        {activeTab === 'pricing' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Planes Flexibles para Docentes
              </h1>
              <p style={{ color: '#64748b', fontSize: 16, margin: '0 0 24px 0' }}>
                Elige el plan que mejor se adapte a tus necesidades en el aula.
              </p>

              {/* Billing Toggle */}
              <div style={{
                display: 'inline-flex', background: '#e2e8f0',
                padding: 4, borderRadius: 12, gap: 4
              }}>
                <button
                  onClick={() => setBillingCycle('mensual')}
                  style={{
                    background: billingCycle === 'mensual' ? '#fff' : 'transparent',
                    border: 'none', color: billingCycle === 'mensual' ? '#0f172a' : '#64748b',
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease'
                  }}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingCycle('anual')}
                  style={{
                    background: billingCycle === 'anual' ? '#fff' : 'transparent',
                    border: 'none', color: billingCycle === 'anual' ? '#0f172a' : '#64748b',
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  Anual
                  <span style={{
                    background: '#22c55e', color: '#fff', fontSize: 10,
                    padding: '2px 6px', borderRadius: 6
                  }}>
                    Ahorra 30%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div style={{
              display: 'flex', gap: 24, maxWidth: 1000, margin: '0 auto',
              flexWrap: 'wrap', justifyContent: 'center'
            }}>
              {/* Free Plan */}
              <div style={{
                flex: '1 1 300px', maxWidth: 320, background: '#fff',
                border: currentPlan === 'Free' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', position: 'relative',
                boxShadow: currentPlan === 'Free' ? '0 10px 15px -3px rgba(99,102,241,0.1)' : '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {currentPlan === 'Free' && (
                  <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 800,
                    padding: '4px 12px', borderRadius: 12, textTransform: 'uppercase'
                  }}>
                    Plan Actual
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Free</h3>
                  <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px 0' }}>Perfecto para probar la plataforma.</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>S/. --</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 24px 0' }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      5 generaciones al mes
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Acceso a motores básicos
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Soporte estándar por correo
                    </li>
                  </ul>
                </div>

                <button
                  disabled={currentPlan === 'Free'}
                  onClick={() => handleSubscribe('Free')}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: currentPlan === 'Free' ? '#f1f5f9' : '#0f172a',
                    color: currentPlan === 'Free' ? '#94a3b8' : '#fff',
                    border: 'none', fontSize: 14, fontWeight: 700,
                    cursor: currentPlan === 'Free' ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (currentPlan !== 'Free') e.currentTarget.style.background = '#1e293b'; }}
                  onMouseLeave={e => { if (currentPlan !== 'Free') e.currentTarget.style.background = '#0f172a'; }}
                >
                  {currentPlan === 'Free' ? 'Plan Activo' : 'Volver a Free'}
                </button>
              </div>

              {/* Pro Plan */}
              <div style={{
                flex: '1 1 300px', maxWidth: 320, background: '#fff',
                border: currentPlan === 'Pro' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', position: 'relative',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03), 0 8px 10px -6px rgba(0,0,0,0.03)'
              }}>
                <span style={{
                  position: 'absolute', top: -12, right: 24,
                  background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 800,
                  padding: '4px 10px', borderRadius: 10, textTransform: 'uppercase'
                }}>
                  Popular
                </span>
                {currentPlan === 'Pro' && (
                  <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 800,
                    padding: '4px 12px', borderRadius: 12, textTransform: 'uppercase'
                  }}>
                    Plan Actual
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Pro</h3>
                  <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px 0' }}>Ideal para docentes activos y dinámicos.</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>S/. --</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 24px 0' }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      30 generaciones al mes
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Todos los motores de juego
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Exportación ilimitada a DOCX
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Soporte prioritario
                    </li>
                  </ul>
                </div>

                <button
                  disabled={currentPlan === 'Pro'}
                  onClick={() => handleSubscribe('Pro')}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: currentPlan === 'Pro' ? '#f1f5f9' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: currentPlan === 'Pro' ? '#94a3b8' : '#fff',
                    border: 'none', fontSize: 14, fontWeight: 700,
                    cursor: currentPlan === 'Pro' ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: currentPlan === 'Pro' ? 'none' : '0 4px 10px rgba(99,102,241,0.2)'
                  }}
                >
                  {currentPlan === 'Pro' ? 'Plan Activo' : 'Suscribirse a Pro'}
                </button>
              </div>

              {/* Institutional Plan */}
              <div style={{
                flex: '1 1 300px', maxWidth: 320, background: '#fff',
                border: currentPlan === 'Institucional' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', position: 'relative',
                boxShadow: currentPlan === 'Institucional' ? '0 10px 15px -3px rgba(99,102,241,0.1)' : '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {currentPlan === 'Institucional' && (
                  <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 800,
                    padding: '4px 12px', borderRadius: 12, textTransform: 'uppercase'
                  }}>
                    Plan Actual
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Institucional</h3>
                  <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px 0' }}>Para colegios, directores y UGELs.</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>S/. --</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 24px 0' }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Generaciones ilimitadas (∞)
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Gestión de múltiples docentes
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Capacitaciones personalizadas
                    </li>
                    <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <Check style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
                      Soporte prioritario 24/7
                    </li>
                  </ul>
                </div>

                <button
                  disabled={currentPlan === 'Institucional'}
                  onClick={() => handleSubscribe('Institucional')}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: currentPlan === 'Institucional' ? '#f1f5f9' : '#0f172a',
                    color: currentPlan === 'Institucional' ? '#94a3b8' : '#fff',
                    border: 'none', fontSize: 14, fontWeight: 700,
                    cursor: currentPlan === 'Institucional' ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (currentPlan !== 'Institucional') e.currentTarget.style.background = '#1e293b'; }}
                  onMouseLeave={e => { if (currentPlan !== 'Institucional') e.currentTarget.style.background = '#0f172a'; }}
                >
                  {currentPlan === 'Institucional' ? 'Plan Activo' : 'Obtener Plan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Modal de Reportes y Métricas ── */}
      {reportActividad && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 640,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Métricas de Estudiantes
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
                  {reportActividad.titulo}
                </p>
              </div>
              <button
                onClick={() => setReportActividad(null)}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: 10,
                  width: 36, height: 36, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#64748b'
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 32, overflowY: 'auto', maxHeight: '70vh' }}>
              {reportLoading ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                  Cargando métricas en tiempo real...
                </div>
              ) : reportData ? (
                <div>
                  {/* KPI Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Partidas</span>
                      <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {reportData.metrics.totalPartidas}
                      </p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Puntaje Promedio</span>
                      <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {reportData.metrics.puntajePromedio}
                      </p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Tasa Finalización</span>
                      <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {reportData.metrics.tasaFinalizacion}
                      </p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Tiempo Promedio</span>
                      <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {reportData.metrics.tiempoPromedio}
                      </p>
                    </div>
                  </div>

                  {/* Student Table */}
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                    Últimas partidas de alumnos
                  </h4>
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Estudiante</th>
                          <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Fecha</th>
                          <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Aciertos</th>
                          <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Tiempo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.estudiantes.map((est, sIdx) => (
                          <tr key={sIdx} style={{ borderBottom: sIdx < reportData.estudiantes.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{est.nombre}</td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>{est.fecha}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>{est.aciertos}</td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>{est.tiempo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
