const initialDB = {
  usuarios: [
    { 
      id: 'usr-1', 
      nombre: 'Carlos', 
      apellido: 'Ramos', 
      correo: 'carlos@mail.com', 
      password: '123456', 
      plan: 'Institucional', 
      generacionesMes: 0 
    },
    { 
      id: 'usr-2', 
      nombre: 'Ana', 
      apellido: 'Lopez', 
      correo: 'ana@mail.com', 
      password: '123456', 
      plan: 'Free', 
      generacionesMes: 14 
    }
  ],
  actividades: [
    { 
      id: 'act-1', 
      temaId: 'tema-1', 
      tipoMotor: 'RPG', 
      usuarioId: 'usr-1', 
      tokenCorto: 'ABC123', 
      titulo: 'Fracciones en Acción', 
      descripcion: 'Aprende a sumar fracciones con el dragón',
      dataIa: { 
        personajes: [{ nombre: 'Héroe', hp: 100 }, { nombre: 'Dragón', hp: 80 }], 
        escenas: [
          { pregunta: '¿Cuánto es 1/2 + 1/4?', opciones: ['3/4', '1/6', '2/6', '1/2'], respuesta: 0 },
          { pregunta: '¿Cuánto es 2/3 - 1/3?', opciones: ['1/3', '1/6', '1/2', '2/3'], respuesta: 0 }
        ] 
      },
      scores: [],
      createdAt: new Date().toISOString()
    },
    { 
      id: 'act-2', 
      temaId: 'tema-2', 
      tipoMotor: 'TD', 
      usuarioId: 'usr-2', 
      tokenCorto: 'XYZ789', 
      titulo: 'Trivia Defensiva', 
      descripcion: 'Defiende tu base respondiendo preguntas correctamente',
      dataIa: { 
        preguntasTrivia: [
          { pregunta: '¿Cuál es el verbo en pasado?', opciones: ['Caminé', 'Camino', 'Caminaré'], respuesta: 0 },
          { pregunta: '¿Cuál es el verbo en futuro?', opciones: ['Cantará', 'Canta', 'Cantó'], respuesta: 0 },
          { pregunta: '¿Cuál es el verbo en presente?', opciones: ['Juego', 'Jugué', 'Jugaré'], respuesta: 0 },
          { pregunta: '¿Cuál es un verbo en infinitivo?', opciones: ['Correr', 'Corriendo', 'Corrió'], respuesta: 0 },
          { pregunta: '¿Qué tiempo es "Había comido"?', opciones: ['Pretérito pluscuamperfecto', 'Presente', 'Futuro'], respuesta: 0 }
        ] 
      },
      scores: [],
      createdAt: new Date().toISOString()
    }
  ],
  temas: [
    { id: 'tema-1-1', nombre: 'Números Enteros', descripcion: 'Suma, resta, multiplicación y división de números enteros.', grado: '1ro', area: 'Matemática' },
    { id: 'tema-1-2', nombre: 'Fracciones y Decimales', descripcion: 'Operaciones combinadas con fracciones y su relación con decimales.', grado: '1ro', area: 'Matemática' },
    { id: 'tema-1-3', nombre: 'Geometría Básica', descripcion: 'Ángulos, triángulos y propiedades de las figuras planas.', grado: '1ro', area: 'Matemática' },
    { id: 'tema-1-4', nombre: 'La Narración', descripcion: 'Estructura de un cuento, novela y mitos.', grado: '1ro', area: 'Comunicación' },
    { id: 'tema-1-5', nombre: 'Comprensión Lectora', descripcion: 'Identificación de ideas principales y secundarias.', grado: '1ro', area: 'Comunicación' }
  ]
};

const getDB = () => {
  const dbStr = localStorage.getItem('rurai_db');
  if (!dbStr) {
    localStorage.setItem('rurai_db', JSON.stringify(initialDB));
    return initialDB;
  }
  return JSON.parse(dbStr);
};

const saveDB = (db) => {
  localStorage.setItem('rurai_db', JSON.stringify(db));
};

export const getUsuarios = () => getDB().usuarios;
export const getActividades = () => getDB().actividades;
export const getTemas = () => getDB().temas;

export const getUserByEmail = (correo) => getUsuarios().find(u => u.correo === correo);
export const getUserById = (id) => getUsuarios().find(u => u.id === id);

export const addUser = (userData) => {
  const db = getDB();
  const newUserId = `usr-${db.usuarios.length + 1}`;
  const newUser = {
    id: newUserId,
    ...userData,
    plan: userData.plan || 'Free',
    generacionesMes: 0
  };
  db.usuarios.push(newUser);
  saveDB(db);
  return newUser;
};

export const updateUserPlan = (id, plan) => {
  const db = getDB();
  const userIndex = db.usuarios.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    db.usuarios[userIndex].plan = plan;
    saveDB(db);
  }
};

export const addActivity = (actividad) => {
  const db = getDB();
  db.actividades.push(actividad);
  saveDB(db);
};

export const deleteActivity = (id) => {
  const db = getDB();
  db.actividades = db.actividades.filter(a => a.id !== id);
  saveDB(db);
};

export const getActivityByToken = (token) => getActividades().find(a => a.tokenCorto === token);
export const getActivityById = (id) => getActividades().find(a => a.id === id);

export const addScore = (actividadId, scoreData) => {
  const db = getDB();
  const act = db.actividades.find(a => a.id === actividadId);
  if (act) {
    if (!act.scores) act.scores = [];
    act.scores.push(scoreData);
    saveDB(db);
  }
};

export const generateMockIaData = (motor) => {
  let data = {};
  switch (motor) {
    case 'RPG':
      data = {
        personajes: [
          { nombre: 'Héroe Estudiante', hp: 100 }, 
          { nombre: 'Monstruo', hp: 80 }
        ],
        escenas: [
          { pregunta: `Pregunta generada IA nivel 1`, opciones: ['Opción A', 'Opción B (Correcta)', 'Opción C', 'Opción D'], respuesta: 1 },
          { pregunta: `Pregunta generada IA nivel 2`, opciones: ['Opción Correcta', 'Opción B', 'Opción C', 'Opción D'], respuesta: 0 },
          { pregunta: `Pregunta generada IA nivel 3`, opciones: ['Opción A', 'Opción B', 'Opción Correcta', 'Opción D'], respuesta: 2 },
          { pregunta: `Pregunta generada IA nivel 4`, opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción Correcta'], respuesta: 3 }
        ]
      };
      break;
    case 'TD':
      data = {
        preguntasTrivia: Array.from({ length: 9 }, (_, i) => ({
          pregunta: `Pregunta de trivia ${i + 1}`,
          opciones: ['Respuesta Correcta', 'Distractor A', 'Distractor B', 'Distractor C'],
          respuesta: 0
        }))
      };
      break;
    case 'ACCION':
      data = {
        recursos_iniciales: { energia: 100, puntos: 50 },
        eventos: [
          { descripcion: `Situación inicial generada.`, impacto: { energia: -10, puntos: 20 } },
          { descripcion: `Desafío inesperado.`, impacto: { energia: -20, puntos: 50 } },
          { descripcion: `Resolución épica.`, impacto: { energia: 30, puntos: -10 } }
        ]
      };
      break;
    default:
      data = { error: 'Motor no soportado' };
  }
  return data;
};
