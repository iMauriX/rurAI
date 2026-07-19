export const db = {
  // Usuarios docentes
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

  // Actividades generadas (historial)
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
          { pregunta: '¿Cuánto es 6 + 7?', opciones: ['1/6', '3/4', '2/6'], respuesta: 1 },
          { pregunta: '¿Cuánto es 2/3 - 1/3?', opciones: ['1/3', '1/6', '1/2'], respuesta: 0 }
        ] 
      },
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
      createdAt: new Date().toISOString()
    }
  ],

  // Catálogo de temas curriculares (para el selector del docente)
  temas: [
    // ========== 1ER GRADO DE SECUNDARIA ==========
    // Matemática
    { id: 'tema-1-1', nombre: 'Números Enteros', descripcion: 'Suma, resta, multiplicación y división de números enteros.', grado: '1ro', area: 'Matemática' },
    { id: 'tema-1-2', nombre: 'Fracciones y Decimales', descripcion: 'Operaciones combinadas con fracciones y su relación con decimales.', grado: '1ro', area: 'Matemática' },
    { id: 'tema-1-3', nombre: 'Geometría Básica', descripcion: 'Ángulos, triángulos y propiedades de las figuras planas.', grado: '1ro', area: 'Matemática' },
    // Comunicación
    { id: 'tema-1-4', nombre: 'La Narración', descripcion: 'Estructura de un cuento, novela y mitos.', grado: '1ro', area: 'Comunicación' },
    { id: 'tema-1-5', nombre: 'Comprensión Lectora', descripcion: 'Identificación de ideas principales y secundarias.', grado: '1ro', area: 'Comunicación' },
    // Ciencia y Tecnología
    { id: 'tema-1-6', nombre: 'La Célula', descripcion: 'Estructura celular, tipos de células y organelos.', grado: '1ro', area: 'Ciencia y Tecnología' },
    { id: 'tema-1-7', nombre: 'Ecosistemas', descripcion: 'Cadenas tróficas y relaciones entre seres vivos.', grado: '1ro', area: 'Ciencia y Tecnología' },
    // Ciencias Sociales
    { id: 'tema-1-8', nombre: 'Las Civilizaciones Antiguas', descripcion: 'Egipto, Mesopotamia y su legado.', grado: '1ro', area: 'Ciencias Sociales' },
    // DPCC
    { id: 'tema-1-9', nombre: 'Identidad y Autoestima', descripcion: 'Construcción de la identidad personal.', grado: '1ro', area: 'Desarrollo Personal, Ciudadanía y Cívica' },

    // ========== 2DO GRADO DE SECUNDARIA ==========
    { id: 'tema-2-1', nombre: 'Álgebra', descripcion: 'Monomios, polinomios y productos notables.', grado: '2do', area: 'Matemática' },
    { id: 'tema-2-2', nombre: 'Ecuaciones Lineales', descripcion: 'Resolución de ecuaciones de primer grado.', grado: '2do', area: 'Matemática' },
    { id: 'tema-2-3', nombre: 'Teorema de Pitágoras', descripcion: 'Aplicación del teorema en figuras geométricas.', grado: '2do', area: 'Matemática' },
    { id: 'tema-2-4', nombre: 'Textos Argumentativos', descripcion: 'Estructura y elaboración de ensayos cortos.', grado: '2do', area: 'Comunicación' },
    { id: 'tema-2-5', nombre: 'La Química en la Vida', descripcion: 'Mezclas, compuestos y reacciones químicas simples.', grado: '2do', area: 'Ciencia y Tecnología' },
    { id: 'tema-2-6', nombre: 'El Virreinato del Perú', descripcion: 'Organización política y económica durante la colonia.', grado: '2do', area: 'Ciencias Sociales' },
    { id: 'tema-2-7', nombre: 'Ciudadanía Digital', descripcion: 'Uso responsable de redes sociales y tecnología.', grado: '2do', area: 'Desarrollo Personal, Ciudadanía y Cívica' },

    // ========== 3ER GRADO DE SECUNDARIA ==========
    { id: 'tema-3-1', nombre: 'Funciones y Gráficas', descripcion: 'Función lineal, afín y cuadrática.', grado: '3ro', area: 'Matemática' },
    { id: 'tema-3-2', nombre: 'Trigonometría', descripcion: 'Razones trigonométricas en triángulos rectángulos.', grado: '3ro', area: 'Matemática' },
    { id: 'tema-3-3', nombre: 'Estadística', descripcion: 'Medidas de tendencia central (media, mediana, moda).', grado: '3ro', area: 'Matemática' },
    { id: 'tema-3-4', nombre: 'Literatura Peruana', descripcion: 'Autores y obras del siglo XIX y XX.', grado: '3ro', area: 'Comunicación' },
    { id: 'tema-3-5', nombre: 'Genética', descripcion: 'Leyes de Mendel y herencia genética.', grado: '3ro', area: 'Ciencia y Tecnología' },
    { id: 'tema-3-6', nombre: 'Física: Movimiento', descripcion: 'Velocidad, aceleración y leyes de Newton.', grado: '3ro', area: 'Ciencia y Tecnología' },
    { id: 'tema-3-7', nombre: 'La República Aristocrática', descripcion: 'Perú a inicios del siglo XX.', grado: '3ro', area: 'Ciencias Sociales' },
    { id: 'tema-3-8', nombre: 'Derechos Humanos', descripcion: 'Declaración Universal y su aplicación en el Perú.', grado: '3ro', area: 'Desarrollo Personal, Ciudadanía y Cívica' },
    { id: 'tema-3-9', nombre: 'Inglés: Present Simple', descripcion: 'Uso del presente simple para hábitos y rutinas.', grado: '3ro', area: 'Inglés' },

    // ========== 4TO GRADO DE SECUNDARIA ==========
    { id: 'tema-4-1', nombre: 'Matrices y Determinantes', descripcion: 'Operaciones con matrices y cálculo de determinantes.', grado: '4to', area: 'Matemática' },
    { id: 'tema-4-2', nombre: 'Logaritmos', descripcion: 'Propiedades y ecuaciones logarítmicas.', grado: '4to', area: 'Matemática' },
    { id: 'tema-4-3', nombre: 'Probabilidad', descripcion: 'Cálculo de probabilidades en experimentos aleatorios.', grado: '4to', area: 'Matemática' },
    { id: 'tema-4-4', nombre: 'Textos Científicos', descripcion: 'Comprensión y producción de artículos de divulgación.', grado: '4to', area: 'Comunicación' },
    { id: 'tema-4-5', nombre: 'Química Orgánica', descripcion: 'Hidrocarburos y grupos funcionales.', grado: '4to', area: 'Ciencia y Tecnología' },
    { id: 'tema-4-6', nombre: 'Electromagnetismo', descripcion: 'Circuitos eléctricos, imanes y fuerzas magnéticas.', grado: '4to', area: 'Ciencia y Tecnología' },
    { id: 'tema-4-7', nombre: 'La Guerra del Pacífico', descripcion: 'Causas, consecuencias y héroes.', grado: '4to', area: 'Ciencias Sociales' },
    { id: 'tema-4-8', nombre: 'Emprendimiento Social', descripcion: 'Cómo crear proyectos que impacten en la comunidad.', grado: '4to', area: 'Educación para el Trabajo' },
    { id: 'tema-4-9', nombre: 'Inglés: Past Simple', descripcion: 'Uso del pasado simple en narraciones.', grado: '4to', area: 'Inglés' },

    // ========== 5TO GRADO DE SECUNDARIA ==========
    { id: 'tema-5-1', nombre: 'Derivadas', descripcion: 'Introducción al cálculo diferencial (límites y derivadas).', grado: '5to', area: 'Matemática' },
    { id: 'tema-5-2', nombre: 'Integrales', descripcion: 'Introducción al cálculo integral y áreas bajo la curva.', grado: '5to', area: 'Matemática' },
    { id: 'tema-5-3', nombre: 'Análisis Combinatorio', descripcion: 'Permutaciones y combinaciones.', grado: '5to', area: 'Matemática' },
    { id: 'tema-5-4', nombre: 'Filosofía y Ética', descripcion: 'Corrientes filosóficas y dilemas morales actuales.', grado: '5to', area: 'Comunicación' },
    { id: 'tema-5-5', nombre: 'Biología Molecular', descripcion: 'ADN, ARN y síntesis de proteínas.', grado: '5to', area: 'Ciencia y Tecnología' },
    { id: 'tema-5-6', nombre: 'Física Moderna', descripcion: 'Relatividad, física cuántica y sus aplicaciones.', grado: '5to', area: 'Ciencia y Tecnología' },
    { id: 'tema-5-7', nombre: 'Globalización', descripcion: 'Impacto económico, cultural y político en el Perú.', grado: '5to', area: 'Ciencias Sociales' },
    { id: 'tema-5-8', nombre: 'Planificación Financiera', descripcion: 'Presupuesto personal, ahorro e inversión.', grado: '5to', area: 'Educación para el Trabajo' },
    { id: 'tema-5-9', nombre: 'Inglés: Future Tenses', descripcion: 'Uso de will, going to y presente continuo para futuro.', grado: '5to', area: 'Inglés' }
  ]
};
