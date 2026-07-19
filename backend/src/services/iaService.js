import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar el JSON del CNEB de manera sincrónica al iniciar el servicio
const cnebDataPath = path.join(__dirname, '../data/cneb.json');
let cnebData = null;
try {
  const rawData = fs.readFileSync(cnebDataPath, 'utf8');
  cnebData = JSON.parse(rawData).curricula_cneb;
} catch (error) {
  console.error("Error al cargar cneb.json:", error);
}

// Función auxiliar para obtener temas basados en área y grado
const obtenerTemas = (area, grado) => {
  if (!cnebData) return ['Tema general'];
  
  // Buscar el área. El id es 'area_mat', pero params.area podría ser 'Matemática'
  // Haremos match tanto por id como por nombre exacto.
  const areaEncontrada = cnebData.find(a => a.area.toLowerCase() === area.toLowerCase() || a.id === area);
  
  if (areaEncontrada) {
    // Usamos includes porque params.grado puede venir como '1ro' en lugar de '1ro de Secundaria'
    const gradoEncontrado = areaEncontrada.grados.find(g => g.grado.toLowerCase().includes(grado.toLowerCase()));
    if (gradoEncontrado) {
      return gradoEncontrado.temas;
    }
  }
  return [`Tema general de ${area} para ${grado}`];
};

export const generateMockContent = (motor, params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = {};
      
      const area = params.area || 'Matemática';
      const grado = params.grado || '1ro de Secundaria';
      const temas = obtenerTemas(area, grado);
      
      // Seleccionar un par de temas aleatorios para las preguntas o usar los primeros
      const tema1 = temas[0] || 'Conceptos básicos';
      const tema2 = temas[1] || tema1;
      const tema3 = temas[2] || tema2;
      
      switch (motor) {
        case 'RPG':
          data = {
            personajes: [
              { nombre: 'Héroe Estudiante', hp: 100 }, 
              { nombre: 'Monstruo', hp: 80 }
            ],
            escenas: [
              { 
                pregunta: `Pregunta nivel 1 sobre: ${tema1}`, 
                content: `Genera un arreglo JSON con 9 preguntas de opción múltiple basadas estrictamente en la siguiente información del CNEB:
            ${contexto}
            
            Reglas:
            1. Formato requerido: [{"pregunta": "...", "opciones": ["...", "...", "...", "..."], "respuesta": 0}]
            2. Exactamente 4 opciones por pregunta.
            3. "respuesta" es el índice (0-3) de la opción correcta.
            4. Solo devuelve el JSON, sin texto adicional.`, 
                opciones: ['Respuesta Incorrecta A', 'Respuesta Correcta', 'Respuesta Incorrecta B', 'Respuesta Incorrecta C'], 
                respuesta: 1 
              },
              { 
                pregunta: `Pregunta nivel 2 sobre: ${tema2}`, 
                opciones: ['Respuesta Correcta', 'Respuesta Incorrecta A', 'Respuesta Incorrecta B', 'Respuesta Incorrecta C'], 
                respuesta: 0 
              },
              { 
                pregunta: `Pregunta nivel 3 sobre: ${tema3}`, 
                opciones: ['Respuesta Incorrecta A', 'Respuesta Incorrecta B', 'Respuesta Correcta', 'Respuesta Incorrecta C'], 
                respuesta: 2 
              },
              { 
                pregunta: `Pregunta nivel 4 sobre: ${tema1} y ${tema2}`, 
                opciones: ['Respuesta Incorrecta A', 'Respuesta Incorrecta B', 'Respuesta Incorrecta C', 'Respuesta Correcta'], 
                respuesta: 3 
              }
            ]
          };
          break;
        case 'TD':
          data = {
            preguntasTrivia: Array.from({ length: 9 }, (_, i) => ({
              pregunta: `Pregunta de desafío ${i + 1} sobre: ${i % 2 === 0 ? tema1 : tema2}`,
              opciones: ['Respuesta Correcta', 'Distractor A', 'Distractor B', 'Distractor C'],
              respuesta: 0
            }))
          };
          break;
        case 'SIM':
          data = {
            recursos_iniciales: { energia: 100, puntos: 50 },
            eventos: [
              { descripcion: `Situación inicial: Aplicando ${tema1} en la vida real.`, impacto: { energia: -10, puntos: 20 } },
              { descripcion: `Desafío: Surge un problema sobre ${tema2}.`, impacto: { energia: -20, puntos: 50 } },
              { descripcion: `Resolución: Comprendiendo ${tema3}.`, impacto: { energia: 30, puntos: -10 } }
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
