# RurAI - Especificación de Requerimientos para MVP (Implementación con Datos Mockeados)

**Versión:** 1.0.0  
**Fecha:** 2026-07-15  
**Objetivo:** Generar el código completo (Backend + Frontend) de una plataforma educativa gamificada llamada "RurAI". **Este es un MVP (Producto Mínimo Viable). NO se debe conectar a bases de datos reales, NO se debe consumir APIs de IA (OpenAI/Gemini), y TODOS los datos deben ser MOCKEADOS en memoria.**

—


0. RESUMEN EJECUTIVO (CONTEXTO DEL PROYECTO)
RurAI es una plataforma web diseñada para docentes de secundaria en Perú que desean crear experiencias de aprendizaje lúdicas basadas en el Currículo Nacional de Educación Básica (ministerio de educación).

El problema: Los docentes suelen tener dificultades para motivar a los estudiantes con contenido teórico. Crear juegos educativos desde cero requiere programación o herramientas complejas.

La solución (MVP): RurAI permite al docente:

Seleccionar un tema curricular (ej. "Fracciones" para 2do de secundaria).

Elegir un motor de juego (RPG de combate, Tower Defense de clasificación, o Simulador de gestión).

El sistema simula la generación de un videojuego completo (devuelve un JSON).

El docente recibe un enlace corto (ej. https://rurai.pe/play/ABC123) para compartir por WhatsApp con sus estudiantes.

El estudiante abre el enlace y juega directamente desde el navegador, sin necesidad de registrarse.

Alcance del MVP: Este es un prototipo funcional para demostrar la interacción. No se conecta a bases de datos reales ni a APIs de IA. Todos los datos (usuarios, actividades, JSONs de juegos) están mockeados en memoria para agilizar el desarrollo y pruebas. El enfoque está en la arquitectura modular, el rendimiento (<500KB de bundle inicial) y la experiencia de usuario (Open Graph para compartir en WhatsApp).

1. RESTRICCIONES TÉCNICAS ABSOLUTAS (NO NEGOCIABLES)
El asistente que ejecute esta especificación debe cumplir estrictamente con las siguientes reglas:

❌ Prohibido usar PostgreSQL, MySQL, MongoDB o cualquier base de datos real.

❌ Prohibido usar ORMs (Prisma, TypeORM, Sequelize, Mongoose).

❌ Prohibido usar Axios para llamar a OpenAI, Gemini o cualquier API externa real.

✅ Toda la persistencia se hará en memoria volátil (objetos globales en Node.js o un simple Map).

✅ Toda la generación de contenido lúdico se hará con funciones mock que devuelvan JSONs predefinidos usando setTimeout para simular latencia.

✅ El bundle inicial del frontend (vista de juego) debe pesar < 500 KB (usar Lazy Loading y code splitting). Esto es crítico para que los estudiantes en zonas rurales con conexiones lentas puedan cargar el juego rápidamente.

2. STACK TECNOLÓGICO OBLIGATORIO
Backend: Node.js + Express (sin ORM). Puerto 3000.

Frontend: React + Vite + TailwindCSS + React Router DOM.

Librerías permitidas (backend): express, cors, jsonwebtoken (mock), docx (para exportación mock), nanoid (para tokens de 6 dígitos).

Librerías permitidas (frontend): react, react-dom, react-router-dom, axios.


## 1. RESTRICCIONES TÉCNICAS ABSOLUTAS (NO NEGOCIABLES)

El asistente que ejecute esta especificación debe cumplir **estrictamente** con las siguientes reglas:

- ❌ **Prohibido usar PostgreSQL, MySQL, MongoDB o cualquier base de datos real.**
- ❌ **Prohibido usar ORMs (Prisma, TypeORM, Sequelize, Mongoose).**
- ❌ **Prohibido usar Axios para llamar a OpenAI, Gemini o cualquier API externa real.**
- ✅ **Toda la persistencia** se hará en **memoria volátil** (objetos globales en Node.js o un simple `Map`).
- ✅ **Toda la generación de contenido lúdico** se hará con **funciones mock** que devuelvan JSONs predefinidos usando `setTimeout` para simular latencia.
- ✅ **El bundle inicial del frontend (vista de juego) debe pesar < 500 KB** (usar Lazy Loading y code splitting).

---

## 2. STACK TECNOLÓGICO OBLIGATORIO

- **Backend:** Node.js + Express (sin ORM). Puerto `3000`.
- **Frontend:** React + Vite + TailwindCSS + React Router DOM.
- **Librerías permitidas (backend):** `express`, `cors`, `jsonwebtoken` (mock), `docx` (para exportación mock), `nanoid` (para tokens de 6 dígitos).
- **Librerías permitidas (frontend):** `react`, `react-dom`, `react-router-dom`, `axios`.

---

## 3. ESTRUCTURA DE CARPETAS (DEBEN GENERARSE TODOS LOS ARCHIVOS)

El asistente debe generar la siguiente jerarquía **exacta**. No se permite omitir ningún archivo:

```text
rurai-mvp/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── database.js                # <-- Aquí viven los objetos mock (usuarios, actividades, temas)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── actividadRoutes.js
│   │   │   ├── generacionRoutes.js
│   │   │   └── exportRoutes.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── actividadController.js
│   │   │   ├── generacionController.js
│   │   │   └── exportController.js
│   │   ├── services/
│   │   │   ├── iaService.js          # <-- Funciones que devuelven JSONs mock (RPG, TD, SIM)
│   │   │   ├── tokenService.js       # <-- Generador de códigos de 6 dígitos (ej. 'ABC123')
│   │   │   └── exportService.js      # <-- Generador de DOCX mock (usa la librería 'docx')
│   │   └── middlewares/
│   │       ├── auth.js               # <-- Verificación de JWT mock (solo valida que exista)
│   │       └── errorHandler.js       # <-- Manejador global de errores
│   └── .env (opcional, solo para puerto)
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── utils/
        │   └── api.js                 # <-- Cliente Axios con interceptores de refresh
        ├── context/
        │   └── AuthContext.jsx        # <-- Contexto para manejar login/logout mock
        ├── hooks/
        │   └── useActividad.js        # <-- Hook para cargar actividad por ID o Token
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx          # <-- Panel del docente (historial + formulario de generación)
        │   └── Play.jsx               # <-- Vista pública del juego (con Lazy Loading y Open Graph)
        └── components/
            ├── ui/
            │   └── SkeletonLoader.jsx
            └── motors/                # <-- CARPETA OBLIGATORIA (Los 3 motores)
                ├── DueloDecisiones.jsx
                ├── ClasificadorDefensivo.jsx
                └── SimuladorDestino.jsx
```

---

## 4. DATOS INICIALES MOCKEADOS (database.js)

El archivo `backend/src/database.js` **DEBE** contener los siguientes objetos con estos datos de ejemplo. Los IDs deben ser estáticos para facilitar las pruebas.

```javascript
// backend/src/database.js

// Simulación de UUIDs manuales para evitar dependencias
export const db = {
  // Usuarios docentes
  usuarios: [
    { 
      id: 'usr-1', 
      nombre: 'Carlos', 
      apellido: 'Ramos', 
      correo: 'carlos@mail.com', 
      password: '123456', // En un mock no es necesario hashear, pero si se quiere simular Argon2, se puede omitir
      plan: 'Free', 
      generacionesMes: 5 // Ha usado 5 de 15 este mes
    },
    { 
      id: 'usr-2', 
      nombre: 'Ana', 
      apellido: 'Lopez', 
      correo: 'ana@mail.com', 
      password: '123456', 
      plan: 'Free', 
      generacionesMes: 14 // A punto de llegar al límite
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
          { pregunta: '¿Cuánto es 1/2 + 1/4?', opciones: ['1/6', '3/4', '2/6'], respuesta: 1 },
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
      titulo: 'Clasifica Verbos', 
      descripcion: 'Arrastra los verbos a su tiempo correcto',
      dataIa: { 
        zonas: ['Presente', 'Pasado', 'Futuro'], 
        conceptos: [
          { id: 1, texto: 'Camino', zona_correcta: 'Presente' },
          { id: 2, texto: 'Caminé', zona_correcta: 'Pasado' },
          { id: 3, texto: 'Caminaré', zona_correcta: 'Futuro' }
        ] 
      },
      createdAt: new Date().toISOString()
    }
  ],

  // Catálogo de temas curriculares (para el selector del docente)
  temas: [
    { id: 'tema-1', nombre: 'Fracciones', descripcion: 'Suma y resta de fracciones', grado: '2do', area: 'Matemática' },
    { id: 'tema-2', nombre: 'Verbos', descripcion: 'Conjugación en pasado, presente y futuro', grado: '3ro', area: 'Comunicación' },
    { id: 'tema-3', nombre: 'Ecosistemas', descripcion: 'Cadena alimenticia y adaptaciones', grado: '4to', area: 'Ciencia y Tecnología' }
  ]
};
```

---

## 5. CONTRATO DE LAS APIS (RESPUESTAS JSON ESTRICTAS)

El backend debe exponer los siguientes endpoints. **Las respuestas deben ser EXACTAMENTE como se indican**. No se permiten campos extra ni nombres diferentes.

### 5.1. Autenticación

| Método | Endpoint | Body (JSON) | Respuesta Exitosa (200/201) | Errores |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | `{ "nombre": "Juan", "apellido": "Perez", "correo": "juan@mail.com", "password": "123456" }` | `{ "status": "success", "userId": "usr-3", "token": "mock-jwt-abc", "refresh": "mock-refresh-xyz" }` | `409` si correo existe <br> `400` si faltan datos |
| **POST** | `/api/v1/auth/login` | `{ "correo": "juan@mail.com", "password": "123456" }` | `{ "accessToken": "mock-jwt-abc", "refreshToken": "mock-refresh-xyz", "perfil": { "id": "usr-1", "plan": "Free" } }` | `401` si credenciales incorrectas |
| **POST** | `/api/v1/auth/refresh` | `{ "refresh": "mock-refresh-xyz" }` | `{ "accessToken": "nuevo-mock-jwt", "refreshToken": "nuevo-mock-refresh" }` | `401` si refresh inválido |

### 5.2. Actividades (Acceso Estudiante y Docente)

| Método | Endpoint | Headers | Respuesta Exitosa (200) | Errores |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/actividad/token/:token` | (Opcional) | `{ "id": "act-1", "tipoMotor": "RPG", "data": { ...dataIa... }, "titulo": "Fracciones", "descripcion": "..." }` | `404` si token no existe |
| **GET** | `/api/v1/actividad/historial` | `Authorization: Bearer {token}` | `{ "data": [ { "id": "act-1", "titulo": "Fracciones", "tipoMotor": "RPG", "createdAt": "2026-...", "tokenCorto": "ABC123" } ], "total": 1, "page": 1, "limit": 10 }` | `401` si no hay token |

### 5.3. Generación de Contenido (Simulación IA)

| Método | Endpoint | Body (JSON) | Respuesta Exitosa (200) | Errores |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/generar` | `{ "temaId": "tema-1", "motor": "RPG", "params": { "area": "Matemática", "grado": "2do", "contexto": "Urbano" } }` | `{ "actividadId": "act-3", "tipoMotor": "RPG", "data": { ...json_del_motor... }, "token": "DEF456", "cache": false }` <br> Si ya existe: `"cache": true` | `403` si generacionesMes >= 15 <br> `404` si temaId no existe |

### 5.4. Exportación DOCX (Mock)

| Método | Endpoint | Headers | Respuesta Exitosa (200) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/exportar/:actividadId` | `Authorization: Bearer {token}` | **Archivo binario** (Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Debe usar la librería `docx` para generar un .docx simple con los datos de la actividad. |

---

## 6. ESPECIFICACIÓN DE COMPONENTES FRONTEND (Motores Lúdicos)

Cada motor debe ser un componente **agnóstico** que reciba únicamente la prop `data` (el JSON de `dataIa`) y renderice el juego correspondiente.

### Motor A: `DueloDecisiones.jsx` (RPG - Combate por turnos)
- **Prop esperada:** `{ personajes: [{ nombre, hp, ataque? }], escenas: [{ pregunta, opciones: [], respuesta: 0 }] }`
- **Comportamiento:** Muestra el HP del jugador y del enemigo. Presenta una pregunta con opciones. Al hacer clic, verifica si es la correcta (índice `respuesta`). Si es correcta, el enemigo pierde 15 HP; si es incorrecta, el jugador pierde 10 HP. Avanza a la siguiente escena. Cuando se acaban las escenas o el HP llega a 0, muestra mensaje de fin de juego.
- **UI:** Usar Tailwind para botones y barras de vida.

### Motor B: `ClasificadorDefensivo.jsx` (TD - Arrastrar y Soltar)
- **Prop esperada:** `{ zonas: ["A", "B"], conceptos: [{ id: 1, texto: "X", zona_correcta: "A" }] }`
- **Comportamiento:** Muestra los conceptos como elementos arrastrables (`draggable`). Muestra las zonas como contenedores con `onDrop`. Al soltar un concepto en una zona, verifica si coincide con `zona_correcta`. Si es correcto, el concepto desaparece; si es incorrecto, vuelve a su lugar o se marca error. **No usar librerías externas de DnD** (usar HTML5 Drag & Drop API nativo para mantener el bundle ligero).

### Motor C: `SimuladorDestino.jsx` (SIM - Gestión de Recursos)
- **Prop esperada:** `{ recursos_iniciales: { energia: 100, dinero: 50 }, eventos: [{ descripcion: "...", impacto: { energia: -10 } }] }`
- **Comportamiento:** Muestra los recursos actuales en tarjetas. Muestra el evento actual. Permite al usuario elegir entre "Aceptar" (aplica el impacto) o "Rechazar" (no pasa nada). Al tomar una decisión, carga el siguiente evento. Al final, muestra recursos finales.

---

## 7. OPEN GRAPH DINÁMICO (Compartir por WhatsApp)

El backend debe manejar la ruta `GET /play/:id` (donde `:id` puede ser un UUID o un token corto).
- Debe buscar la actividad en `database.js`. Si no existe, devolver 404.
- Debe construir un HTML con las metaetiquetas:
  - `<meta property="og:title" content="[Titulo de la actividad]" />`
  - `<meta property="og:description" content="[Descripcion de la actividad]" />`
  - `<meta property="og:image" content="https://via.placeholder.com/1200x630.png?text=RurAI" />` (o una imagen mock estática).
  - `<meta property="og:url" content="https://rurai.pe/play/[id]" />`
- El HTML debe incluir el script de React (apuntando al build de producción) para que, al abrir el enlace en un navegador, cargue la SPA.

---

## 8. REGLAS DE IMPLEMENTACIÓN PARA EL CODIFICADOR

1.  **Código completo:** Está terminantemente **prohibido** usar comentarios como `// lógica aquí` o `// implementar después`. Cada función debe tener su lógica completa escrita.
2.  **Manejo de errores:** Todas las funciones asíncronas deben tener `try/catch` y usar el `errorHandler` para devolver errores con el código HTTP adecuado.
3.  **Lazy Loading:** En el frontend, los 3 motores (RPG, TD, SIM) deben cargarse con `lazy(() => import(...))` dentro de `Play.jsx`. El `vite.config.js` debe configurar `manualChunks` para separar estos motores en chunks diferentes.
4.  **Persistencia en memoria:** Para simular el "historial" y el "cache" de actividades, simplemente se añaden o modifican los objetos dentro del array `db.actividades` en tiempo de ejecución.
5.  **Tokens:** El generador de tokens (6 caracteres) debe intentar crear un código único (revisar que no exista en `db.actividades` antes de asignarlo).
6.  **Límite Freemium:** El contador `generacionesMes` se incrementa en 1 cada vez que se genera una actividad exitosamente. Si el usuario tiene 15 o más, se bloquea el POST `/generar` con 403.

---

## 9. INSTRUCCIONES DE ENTREGA

El asistente debe generar el código de **todos** los archivos listados en la sección 3. La respuesta debe organizarse claramente mostrando la ruta del archivo y su contenido completo.

**Ejemplo de formato de salida esperado:**

```text
### backend/package.json
[contenido del archivo]

### backend/src/index.js
[contenido del archivo]
...
```

**¡Adelante! Genera el código completo de RurAI MVP.**


// backend/src/database.js
// Versión EXTENDIDA del catálogo de temas (cubre 5 grados y 9 áreas)

export const db = {
  // ... (usuarios y actividades se mantienen igual) ...

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
    { id: 'tema-5-4', nombre: 'Filosofía y Ética', descripcion: 'Corrientes filosóficas y dilemas morales actuales.', grado: '5to', area: 'Comunicación' }, // (A veces se ve en DPCC o Comunicación)
    { id: 'tema-5-5', nombre: 'Biología Molecular', descripcion: 'ADN, ARN y síntesis de proteínas.', grado: '5to', area: 'Ciencia y Tecnología' },
    { id: 'tema-5-6', nombre: 'Física Moderna', descripcion: 'Relatividad, física cuántica y sus aplicaciones.', grado: '5to', area: 'Ciencia y Tecnología' },
    { id: 'tema-5-7', nombre: 'Globalización', descripcion: 'Impacto económico, cultural y político en el Perú.', grado: '5to', area: 'Ciencias Sociales' },
    { id: 'tema-5-8', nombre: 'Planificación Financiera', descripcion: 'Presupuesto personal, ahorro e inversión.', grado: '5to', area: 'Educación para el Trabajo' },
    { id: 'tema-5-9', nombre: 'Inglés: Future Tenses', descripcion: 'Uso de will, going to y presente continuo para futuro.', grado: '5to', area: 'Inglés' },
  ]
};
