import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { LogOut, Play, Download, Plus, AlertCircle, Trash2 } from 'lucide-react';

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
      
      // Actualizar historial
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

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-2xl font-bold">RurAI Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-indigo-100 text-sm">
                Plan: <span className="font-bold bg-indigo-700 px-2 py-1 rounded">{user?.plan}</span>
              </span>
              <button
                onClick={logout}
                className="text-white hover:text-indigo-200 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex gap-6 flex-col md:flex-row">
        
        {/* Columna Izquierda: Formulario de Generación */}
        <div className="md:w-1/3 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-indigo-500">
            <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
              <Plus className="mr-2" /> Nueva Actividad
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
                <AlertCircle className="shrink-0 mr-2 h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm break-all">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleGenerar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motor Lúdico</label>
                <select
                  name="motor"
                  value={formData.motor}
                  onChange={handleChange}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="RPG">RPG (Duelo de Decisiones)</option>
                  <option value="TD">Tower Defense (Clasificador)</option>
                  <option value="SIM">Simulador (Gestión de Recursos)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área</label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Matemática">Matemática</option>
                    <option value="Comunicación">Comunicación</option>
                    <option value="Ciencia y Tecnología">Ciencia y Tecnología</option>
                    <option value="Ciencias Sociales">Ciencias Sociales</option>
                    <option value="Desarrollo Personal, Ciudadanía y Cívica">DPCC</option>
                    <option value="Inglés">Inglés</option>
                    <option value="Educación para el Trabajo">Educación para el Trabajo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grado</label>
                  <select
                    name="grado"
                    value={formData.grado}
                    onChange={handleChange}
                    className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="1ro">1ro de Secundaria</option>
                    <option value="2do">2do de Secundaria</option>
                    <option value="3ro">3ro de Secundaria</option>
                    <option value="4to">4to de Secundaria</option>
                    <option value="5to">5to de Secundaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tema Curricular</label>
                <select
                  name="temaId"
                  value={formData.temaId}
                  onChange={handleChange}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-100"
                  disabled={temasFiltrados.length === 0}
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Añadida</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ej: Enfocarse en ejemplos de la vida diaria, usar temática espacial, etc."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={generando}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-slate-400"
              >
                {generando ? 'Generando con IA...' : 'Generar Actividad'}
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Historial */}
        <div className="md:w-2/3">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Historial de Actividades</h3>
            </div>
            
            {deleteMsg && (
              <div className="px-6 py-3 bg-red-50 text-red-700 border-b border-red-100 text-sm font-medium">
                {deleteMsg}
              </div>
            )}
            
            {loading ? (
              <div className="p-6 text-center text-slate-500">Cargando historial...</div>
            ) : historial.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No has generado ninguna actividad aún.</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {historial.map((act) => (
                  <li key={act.id} className="hover:bg-slate-50 transition-colors">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">{act.titulo}</p>
                        <p className="text-sm text-slate-500">
                          <span className="font-semibold text-slate-700">{act.tipoMotor}</span> • 
                          Token: <span className="font-mono bg-slate-100 px-1 rounded">{act.tokenCorto}</span> • 
                          {new Date(act.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <a 
                          href={`/play/${act.tokenCorto}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                          title="Jugar"
                        >
                          <Play className="h-4 w-4" />
                        </a>
                        <button 
                          onClick={() => handleExportar(act.id, act.titulo)}
                          className="inline-flex items-center p-2 border border-slate-300 rounded-full shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
                          title="Exportar DOCX"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEliminar(act.id)}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none ml-2"
                          title="Eliminar Actividad"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
