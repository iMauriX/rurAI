import { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { useActividad } from '../hooks/useActividad';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

// Lazy loading de los motores lúdicos
const DueloDecisiones      = lazy(() => import('../components/motors/DueloDecisiones'));
const ClasificadorDefensivo = lazy(() => import('../components/motors/ClasificadorDefensivo'));
const DungeonCrawler        = lazy(() => import('../components/motors/DungeonCrawler'));

const Play = () => {
  const { id } = useParams();
  const { actividad, loading, error } = useActividad(id);

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



      {/* Motor de juego */}
      <div style={{ width: '100%', maxWidth: 860 }}>
        <Suspense fallback={<SkeletonLoader />}>
          {actividad.tipoMotor === 'RPG' && <DueloDecisiones data={actividad.data} />}
          {actividad.tipoMotor === 'TD'  && <ClasificadorDefensivo data={actividad.data} />}
          {actividad.tipoMotor === 'SIM' && <DungeonCrawler data={actividad.data} />}
        </Suspense>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 16, color: '#1e293b', fontSize: 12 }}>
        Powered by RurAI · Experiencias Educativas
      </div>
    </div>
  );
};

export default Play;
