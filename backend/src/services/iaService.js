export const generateMockContent = (motor, params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = {};
      
      switch (motor) {
        case 'RPG':
          data = {
            personajes: [
              { nombre: 'Héroe Estudiante', hp: 100 }, 
              { nombre: 'Monstruo de la Ignorancia', hp: 80 }
            ],
            escenas: [
              { pregunta: 'Pregunta generada nivel 1 (' + params.area + ' - ' + params.grado + ')', opciones: ['Opción A', 'Opción B (Correcta)', 'Opción C'], respuesta: 1 },
              { pregunta: 'Pregunta generada nivel 2 (' + params.area + ' - ' + params.grado + ')', opciones: ['Opción A (Correcta)', 'Opción B', 'Opción C'], respuesta: 0 },
              { pregunta: 'Pregunta generada nivel 3 (' + params.area + ' - ' + params.grado + ')', opciones: ['Opción A', 'Opción B', 'Opción C (Correcta)'], respuesta: 2 }
            ]
          };
          break;
        case 'TD':
          data = {
            zonas: ['Categoría 1', 'Categoría 2', 'Categoría 3'],
            conceptos: [
              { id: 1, texto: 'Concepto A', zona_correcta: 'Categoría 1' },
              { id: 2, texto: 'Concepto B', zona_correcta: 'Categoría 2' },
              { id: 3, texto: 'Concepto C', zona_correcta: 'Categoría 3' },
              { id: 4, texto: 'Concepto D', zona_correcta: 'Categoría 1' }
            ]
          };
          break;
        case 'SIM':
          data = {
            recursos_iniciales: { energia: 100, puntos: 50 },
            eventos: [
              { descripcion: 'Evento 1: Ocurre una situación imprevista.', impacto: { energia: -10, puntos: 20 } },
              { descripcion: 'Evento 2: Oportunidad de inversión.', impacto: { energia: -20, puntos: 50 } },
              { descripcion: 'Evento 3: Descanso necesario.', impacto: { energia: 30, puntos: -10 } }
            ]
          };
          break;
        default:
          data = { error: 'Motor no soportado' };
      }
      
      resolve(data);
    }, 1500); // 1.5s de latencia simulada
  });
};
