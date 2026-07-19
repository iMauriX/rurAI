# Pitch Deck: RurAI

Esta es la estructura propuesta para tu presentación del prototipo (Pitch Deck). Cada sección representa una diapositiva (Slide) e incluye los puntos visuales que debes poner en la pantalla y el discurso sugerido para ti (Speaker Notes).

````carousel
## Slide 1: Portada
**Título:** RurAI
**Subtítulo:** Gamificación Educativa Impulsada por IA
**Visual:** Logo de RurAI (si lo tienes) o un collage con un icono de cerebro/IA + iconos de videojuegos. Tu nombre/equipo en la esquina inferior.

> [!NOTE]
> **Tu discurso (Speaker Notes):**
> "Hola a todos. Hoy venimos a presentar RurAI, una plataforma que está a punto de cambiar cómo los profesores enseñan y cómo los estudiantes interactúan con su aprendizaje, fusionando el currículo educativo con el poder de la Inteligencia Artificial y los videojuegos."
<!-- slide -->
## Slide 2: El Problema
**Título:** El desafío de captar la atención
**Puntos clave:**
- 📉 Estudiantes perdiendo interés en métodos tradicionales.
- 🕒 Profesores sobrecargados de trabajo sin tiempo para crear material interactivo.
- 🎮 Desconexión entre cómo aprenden los jóvenes hoy (jugando) y cómo se les enseña.
**Visual:** Imagen de un estudiante aburrido en clase vs. un estudiante concentrado jugando videojuegos.

> [!NOTE]
> **Tu discurso (Speaker Notes):**
> "Todos sabemos que los métodos tradicionales ya no captan la atención de los estudiantes nativos digitales. Sin embargo, pedirle a un profesor, que ya está sobrecargado, que programe o diseñe videojuegos educativos es imposible. Hay una brecha gigante entre el aula y el mundo digital interactivo."
<!-- slide -->
## Slide 3: La Solución - ¿Qué es RurAI?
**Título:** RurAI: De un clic al juego
**Puntos clave:**
- 🤖 **IA Generativa:** Transforma el Currículo Nacional (CNEB) directamente en datos interactivos.
- 🕹️ **Motores Lúdicos:** Múltiples estilos de juego para diferentes tipos de aprendizaje.
- ⚡ **Despliegue Instantáneo:** Generación y publicación de actividades en segundos mediante un PIN corto.
**Visual:** Diagrama simple: [CNEB/Tema Curricular] ➡️ [Motor RurAI] ➡️ [Videojuego Educativo Listo para Jugar].

> [!NOTE]
> **Tu discurso (Speaker Notes):**
> "Nuestra solución es RurAI. Una plataforma donde un profesor simplemente selecciona un tema del currículo nacional (CNEB), y nuestra Inteligencia Artificial se encarga de crear el contenido, las preguntas y las respuestas, inyectándolas automáticamente en diferentes motores de videojuegos web listos para jugar."
<!-- slide -->
## Slide 4: El Prototipo en Acción (Demo)
**Título:** Nuestra suite de juegos
**Puntos clave:**
1. **Duelo de Decisiones (RPG):** Combate por turnos respondiendo correctamente.
2. **Clasificador Defensivo (Tower Defense):** Trivia y estrategia, gastando "Bits" ganados para defender.
3. **Dungeon Crawler (Acción):** Exploración y reflejos, disparando y superando puertas (jefes finales).
**Visual:** 3 capturas de pantalla de los tres juegos que hemos desarrollado, ordenadas atractivamente.

> [!NOTE]
> **Tu discurso (Speaker Notes):**
> "Para este prototipo hemos desarrollado tres motores nativos: un RPG para decisiones pausadas, un Tower Defense para estrategia y administración de recursos mediante preguntas, y un juego de Acción pura (Dungeon Crawler) donde el jugador debe esquivar, disparar y resolver trivias para avanzar."
<!-- slide -->
## Slide 5: ¿Cómo Funciona? (Arquitectura Técnica)
**Título:** Magia bajo el capó
**Puntos clave:**
- **Frontend:** React + Vite + Zustand (Store) para rendimiento ultra rápido a 60fps usando Canvas HTML5.
- **Backend:** Node.js conectando con agentes/prompts de IA para parsear el currículo.
- **Escalabilidad:** Cada motor es agnóstico, la IA solo necesita entregar el JSON con el formato esperado.
**Visual:** Iconos de React, Node, y un icono de IA conectados por líneas de datos.

> [!NOTE]
> **Tu discurso (Speaker Notes):**
> "Técnicamente, no dependemos de pesados motores de terceros. Hemos construido motores ligeros usando React y HTML5 Canvas que corren a 60fps en cualquier navegador escolar. Nuestro backend en Node.js orquesta la IA para que entregue la metadata estructurada, logrando una arquitectura altamente escalable."
<!-- slide -->
## Slide 6: Modelo de Impacto / Negocio
**Título:** El futuro de RurAI
**Puntos clave:**
- **Colegios e Instituciones:** Licencias SaaS B2B para integración completa de currículos.
- **Profesores Independientes:** Herramienta Freemium para clases particulares.
- **Datos y Métricas:** En el futuro, RurAI proveerá analíticas del rendimiento de los alumnos.
**Visual:** Un gráfico ascendente o iconos de escuelas, profesores y gráficas de barras.

> [!NOTE]
> **Tu discurso (Speaker Notes):**
> "RurAI está pensado para escalar como un SaaS B2B para colegios, permitiendo que la institución genere material oficial alineado al Ministerio, y a la vez ofreciendo analíticas de dónde fallan más los alumnos, convirtiendo los juegos en poderosas herramientas de evaluación."
<!-- slide -->
## Slide 7: Cierre y Preguntas
**Título:** El aprendizaje debe ser una aventura.
**Puntos clave:**
- ¡Gracias!
- Demo en vivo disponible.
- ¿Preguntas?
**Visual:** Un código QR apuntando al `localhost` / túnel ngrok de tu aplicación para que el jurado pueda entrar al dashboard, junto con tu información de contacto.

> [!NOTE]
> **Tu discurso (Speaker Notes):**
> "Creemos que la educación no tiene por qué competir contra el entretenimiento; puede ser uno mismo. El aprendizaje debe ser una aventura. Muchas gracias, los invito a probar la plataforma si tienen sus teléfonos a la mano. ¿Alguna pregunta?"
````

### Consejos para tu presentación:
1. **Haz la Demo en vivo:** Si puedes, minimiza el PPT rápido en la Diapositiva 4 y muéstrales el **Dungeon Crawler** o el **Tower Defense** funcionando. Dispara a las cajas o pon torres; el movimiento fluído enamorará al jurado.
2. **Resalta la IA:** Enfatiza que el profesor **no** tuvo que programar a los Goblins ni crear el nivel. El profesor solo hizo un clic en "Generar" y el sistema hizo todo el trabajo pesado.
3. **Controla los tiempos:** Ensaya las *Speaker Notes*. Deberías tomar aproximadamente 45 segundos por diapositiva.
