import { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { useActividad } from '../hooks/useActividad';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

// Lazy loading de los motores lúdicos para mantener el bundle pequeño
const DueloDecisiones = lazy(() => import('../components/motors/DueloDecisiones'));
const ClasificadorDefensivo = lazy(() => import('../components/motors/ClasificadorDefensivo'));
const SimuladorDestino = lazy(() => import('../components/motors/SimuladorDestino'));

const Play = () => {
  const { id } = useParams(); // Puede ser ID o token corto
  const { actividad, loading, error } = useActividad(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-white text-2xl font-bold mb-8">Cargando RurAI...</h1>
        <SkeletonLoader />
      </div>
    );
  }

  if (error || !actividad) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500 text-white p-8 rounded-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error || 'Actividad no encontrada'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl mb-8 text-center text-white">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
          {actividad.titulo}
        </h1>
        <p className="mt-4 text-slate-300 text-lg md:text-xl">
          {actividad.descripcion}
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <Suspense fallback={<SkeletonLoader />}>
          {actividad.tipoMotor === 'RPG' && <DueloDecisiones data={actividad.data} />}
          {actividad.tipoMotor === 'TD' && <ClasificadorDefensivo data={actividad.data} />}
          {actividad.tipoMotor === 'SIM' && <SimuladorDestino data={actividad.data} />}
        </Suspense>
      </div>
      
      <div className="mt-12 text-slate-500 text-sm">
        Creado con RurAI - Experiencias Educativas
      </div>
    </div>
  );
};

export default Play;
