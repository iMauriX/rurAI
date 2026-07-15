import { useState } from 'react';

const DueloDecisiones = ({ data }) => {
  const [escenaIndex, setEscenaIndex] = useState(0);
  const [hpJugador, setHpJugador] = useState(data.personajes[0]?.hp || 100);
  const [hpEnemigo, setHpEnemigo] = useState(data.personajes[1]?.hp || 100);
  const [gameOver, setGameOver] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const escenaActual = data.escenas[escenaIndex];

  const handleOpcion = (index) => {
    if (gameOver) return;

    if (index === escenaActual.respuesta) {
      const nuevoHp = Math.max(0, hpEnemigo - 15);
      setHpEnemigo(nuevoHp);
      setMensaje('¡Correcto! El enemigo pierde 15 HP.');
      if (nuevoHp === 0) return endJuego(true);
    } else {
      const nuevoHp = Math.max(0, hpJugador - 10);
      setHpJugador(nuevoHp);
      setMensaje('¡Incorrecto! Pierdes 10 HP.');
      if (nuevoHp === 0) return endJuego(false);
    }

    setTimeout(() => {
      setMensaje('');
      if (escenaIndex + 1 < data.escenas.length) {
        setEscenaIndex(escenaIndex + 1);
      } else {
        endJuego(hpEnemigo <= hpJugador);
      }
    }, 1500);
  };

  const endJuego = (victoria) => {
    setGameOver(true);
    setMensaje(victoria ? '¡Has ganado el duelo!' : 'Has sido derrotado. ¡Inténtalo de nuevo!');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-slate-800 text-white rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div className="w-1/3">
          <p className="font-bold text-lg mb-1">{data.personajes[0]?.nombre}</p>
          <div className="w-full bg-slate-600 rounded-full h-4">
            <div className="bg-green-500 h-4 rounded-full transition-all duration-300" style={{ width: `${hpJugador}%` }}></div>
          </div>
          <p className="text-right text-sm mt-1">{hpJugador} HP</p>
        </div>
        <div className="text-4xl font-bold text-yellow-400">VS</div>
        <div className="w-1/3">
          <p className="font-bold text-lg mb-1 text-right">{data.personajes[1]?.nombre}</p>
          <div className="w-full bg-slate-600 rounded-full h-4">
            <div className="bg-red-500 h-4 rounded-full transition-all duration-300" style={{ width: `${hpEnemigo}%` }}></div>
          </div>
          <p className="text-right text-sm mt-1">{hpEnemigo} HP</p>
        </div>
      </div>

      <div className="bg-slate-700 p-6 rounded-lg text-center min-h-64 flex flex-col justify-center">
        {mensaje ? (
          <h2 className="text-2xl font-bold text-yellow-300 animate-pulse">{mensaje}</h2>
        ) : (
          !gameOver && (
            <>
              <h2 className="text-xl mb-6">{escenaActual.pregunta}</h2>
              <div className="space-y-3">
                {escenaActual.opciones.map((opcion, index) => (
                  <button
                    key={index}
                    onClick={() => handleOpcion(index)}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default DueloDecisiones;
