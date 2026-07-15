# RurAI - MVP (Producto Mínimo Viable)

RurAI es una plataforma educativa gamificada diseñada para docentes de secundaria en Perú. Permite la creación y personalización de experiencias lúdicas basadas en el Currículo Nacional de Educación Básica. 

Este repositorio contiene la implementación del **MVP (Producto Mínimo Viable)** con persistencia en memoria y datos mockeados para agilizar las pruebas y el despliegue inicial.

---

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) (generalmente viene con Node.js)

---

## 📁 Estructura del Proyecto

El proyecto está dividido en dos partes principales ubicadas en la carpeta `rurai-mvp/`:
- `backend/`: API REST construida con Node.js + Express.
- `frontend/`: Aplicación de una sola página (SPA) construida con React + Vite + TailwindCSS.

---

## 🛠️ Instrucciones de Instalación y Ejecución

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

## 📝 Credenciales de Prueba (Datos Mockeados)

El backend cuenta con los siguientes usuarios predefinidos en memoria (`database.js`) para que puedas iniciar sesión de inmediato:

| Correo | Contraseña | Plan | Rol |
| :--- | :--- | :--- | :--- |
| `carlos@mail.com` | `123456` | Free | Docente |
| `ana@mail.com` | `123456` | Free | Docente |

---

## 🧪 Pruebas del Sistema

### Flujo del Docente (Dashboard)
1. Inicia sesión con cualquiera de los usuarios mockeados.
2. Explora el **Historial de Actividades**.
3. Selecciona un tema curricular, grado, área, y elige uno de los tres motores de juego disponibles:
   - **Duelo de Decisiones (RPG):** Combate por turnos respondiendo preguntas.
   - **Clasificador Defensivo (TD):** Arrastrar y soltar conceptos en zonas correspondientes.
   - **Simulador de Destino (SIM):** Gestión de recursos basada en la toma de decisiones.
4. Genera el juego y obtén el **código de 6 caracteres** (ej. `ABC123`) o enlace corto.
5. Puedes exportar el reporte/planificador de la actividad en formato `.docx` (Mock).

### Flujo del Estudiante (Modo Juego)
1. Accede directamente mediante la URL `/play/:token` (donde `:token` es el código de 6 caracteres generado, ej. `/play/ABC123`).
2. El estudiante no necesita registrarse ni iniciar sesión; jugará directamente en el navegador.

---

## 🔒 Restricciones Técnicas del MVP
- **Persistencia Temporal:** Toda la información se guarda en memoria volátil en el backend. Si el servidor se reinicia, los datos volverán a su estado inicial.
- **Límite Freemium:** Cada docente tiene un límite máximo de 15 generaciones al mes en su plan gratuito.
- **Simulación de IA:** La creación de contenido utiliza plantillas y latencia simulada (`setTimeout`) para recrear el comportamiento de un modelo LLM de forma rápida y gratuita.
