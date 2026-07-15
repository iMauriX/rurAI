import { useState } from 'react';

const ClasificadorDefensivo = ({ data }) => {
  const [conceptos, setConceptos] = useState(data.conceptos);
  const [mensaje, setMensaje] = useState('');

  const handleDragStart = (e, concepto) => {
    e.dataTransfer.setData('concepto', JSON.stringify(concepto));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, zona) => {
    const conceptoStr = e.dataTransfer.getData('concepto');
    if (!conceptoStr) return;
    
    const concepto = JSON.parse(conceptoStr);

    if (concepto.zona_correcta === zona) {
      setMensaje('¡Correcto!');
      setConceptos(conceptos.filter(c => c.id !== concepto.id));
    } else {
      setMensaje(`Incorrecto, "${concepto.texto}" no va en ${zona}.`);
    }

    setTimeout(() => setMensaje(''), 2000);
  };

  if (conceptos.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-green-100 rounded-xl border border-green-300">
        <h2 className="text-3xl font-bold text-green-700">¡Nivel Completado!</h2>
        <p className="mt-4 text-green-600">Has clasificado todos los conceptos correctamente.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {mensaje && (
        <div className={`p-4 mb-4 text-center text-white font-bold rounded-lg ${mensaje === '¡Correcto!' ? 'bg-green-500' : 'bg-red-500'}`}>
          {mensaje}
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Conceptos a clasificar:</h3>
        <div className="flex flex-wrap gap-4">
          {conceptos.map(concepto => (
            <div
              key={concepto.id}
              draggable
              onDragStart={(e) => handleDragStart(e, concepto)}
              className="px-4 py-2 bg-indigo-500 text-white rounded shadow cursor-grab active:cursor-grabbing hover:bg-indigo-600 transition-colors"
            >
              {concepto.texto}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.zonas.map(zona => (
          <div
            key={zona}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, zona)}
            className="min-h-48 bg-slate-100 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center p-4 transition-colors hover:bg-slate-200"
          >
            <h4 className="font-bold text-slate-600 text-xl">{zona}</h4>
            <p className="text-sm text-slate-400 mt-2">Suelta aquí</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClasificadorDefensivo;
