import { useState } from 'react';

const SimuladorDestino = ({ data }) => {
  const [recursos, setRecursos] = useState(data.recursos_iniciales);
  const [eventoIndex, setEventoIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const eventoActual = data.eventos[eventoIndex];

  const handleDecision = (aceptar) => {
    if (gameOver) return;

    if (aceptar) {
      const nuevosRecursos = { ...recursos };
      for (const [key, value] of Object.entries(eventoActual.impacto)) {
        nuevosRecursos[key] = (nuevosRecursos[key] || 0) + value;
      }
      setRecursos(nuevosRecursos);
    }

    if (eventoIndex + 1 < data.eventos.length) {
      setEventoIndex(eventoIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900 text-slate-100 rounded-xl shadow-xl">
      <div className="flex justify-around mb-8 p-4 bg-slate-800 rounded-lg">
        {Object.entries(recursos).map(([key, value]) => (
          <div key={key} className="text-center">
            <p className="text-sm text-slate-400 uppercase tracking-wider">{key}</p>
            <p className="text-3xl font-bold text-teal-400">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 p-8 rounded-lg min-h-64 flex flex-col justify-between">
        {gameOver ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">¡Simulación Terminada!</h2>
            <p className="text-slate-300">Estos son tus recursos finales.</p>
          </div>
        ) : (
          <>
            <div>
              <span className="inline-block bg-teal-900 text-teal-300 px-2 py-1 rounded text-xs font-semibold mb-4">
                Día {eventoIndex + 1}
              </span>
              <h2 className="text-xl leading-relaxed">{eventoActual.descripcion}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => handleDecision(false)}
                className="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={() => handleDecision(true)}
                className="py-3 px-6 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors"
              >
                Aceptar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimuladorDestino;
