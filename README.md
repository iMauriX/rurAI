# RurAI - MVP (Producto Mínimo Viable)

RurAI es una plataforma educativa gamificada diseñada para docentes de secundaria en Perú. Permite la creación y personalización de experiencias lúdicas basadas en el Currículo Nacional de Educación Básica de manera rápida e intuitiva.

Este repositorio contiene la implementación del **MVP (Producto Mínimo Viable)** con persistencia en memoria y datos mockeados para agilizar las pruebas y el despliegue inicial.

---

## 🎯 El Problema que Resuelve

El proyecto aborda principalmente **el desinterés y la falta de motivación de los estudiantes en secundaria**. Para solucionar esto, RurAI facilita a los docentes la creación de herramientas de gamificación interactivas y atractivas, todo ello sin requerir conocimientos técnicos previos por parte del profesorado.

---

## 💻 Stack Tecnológico

La aplicación sigue una arquitectura **Cliente-Servidor (SPA - Single Page Application)** y utiliza las siguientes tecnologías:

- **Frontend:**
  - [React](https://reactjs.org/) - Biblioteca para construir interfaces de usuario.
  - [Vite](https://vitejs.dev/) - Entorno de desarrollo rápido.
  - [Tailwind CSS](https://tailwindcss.com/) - Framework de utilidades para estilos ágiles y responsivos.
- **Backend:**
  - [Node.js](https://nodejs.org/) - Entorno de ejecución para JavaScript.
  - [Express](https://expressjs.com/) - Framework web para crear la API REST.
- **Integración IA (Producción):**
  - Actualmente, la generación de contenido en el MVP es simulada con latencia y plantillas para mayor agilidad, pero la arquitectura está preparada para integrarse con modelos reales como **OpenAI (GPT)** en futuras versiones.

---

## ✨ Características Principales

1. **Generación de minijuegos educativos mediante IA:** Creación de dinámicas interactivas como Duelo de Decisiones (RPG), Clasificador Defensivo (TD) y Simuladores de Destino.
2. **Alineación con el Currículo Nacional:** Los contenidos generados están directamente vinculados al Currículo Nacional de Educación Básica de Perú.
3. **Acceso rápido para estudiantes:** Los alumnos no necesitan registrarse; acceden a los minijuegos generados directamente mediante un código de 6 caracteres.
4. **Exportación de reportes:** Permite a los docentes descargar reportes y planificadores de las actividades en formato Word (.docx).

---

## 🛠️ Guía de Instalación y Ejecución

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- npm (generalmente viene con Node.js)

### 1. Levantar el Backend (Puerto 3000)
1. Dirígete a la carpeta del backend:
   ```bash
   cd rurai-mvp/backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *El servidor correrá en `http://localhost:3000`.*

### 2. Levantar el Frontend
1. Abre una nueva terminal y dirígete a la carpeta del frontend:
   ```bash
   cd rurai-mvp/frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   *La aplicación frontend estará disponible en la dirección que indique la consola (típicamente `http://localhost:5173`).*

---

## 🎮 Flujos de Usuario (Docente / Estudiante)

### Credenciales de Prueba (Docente)
El backend cuenta con los siguientes usuarios en memoria para iniciar sesión:
| Correo | Contraseña | Plan | Rol |
| :--- | :--- | :--- | :--- |
| `carlos@mail.com` | `123456` | Free | Docente |
| `ana@mail.com` | `123456` | Free | Docente |

### Flujo del Docente (Dashboard)
1. Inicia sesión con cualquiera de los usuarios mockeados.
2. Explora el **Historial de Actividades**.
3. Selecciona un tema curricular, grado, área, y elige uno de los tres motores de juego.
4. Genera el juego y obtén el **código de 6 caracteres** (ej. `ABC123`) o un enlace corto.
5. *(Opcional)* Exporta el reporte de la actividad en formato `.docx`.

### Flujo del Estudiante (Modo Juego)
1. El estudiante recibe el código del docente.
2. Accede a la URL del juego (ej. `/play/ABC123`).
3. El estudiante juega directamente desde su navegador sin iniciar sesión.

---

## 🚀 Siguientes Pasos (Roadmap)
Al ser un MVP, el proyecto cuenta con ciertas limitaciones (como persistencia en memoria y simulaciones) que serán abordadas en los próximos hitos:
- **Integrar bases de datos reales:** Migrar a una solución de base de datos robusta (como PostgreSQL o MongoDB).
- **Implementar IA generativa real:** Conectar la plataforma a APIs de modelos grandes de lenguaje (ej. OpenAI) para la creación dinámica y genuina del contenido de los minijuegos.
- **Añadir más tipos de juegos:** Expandir la biblioteca de plantillas y motores de juego para diversificar la experiencia educativa.
