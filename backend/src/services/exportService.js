import * as docx from "docx";

export const generateDocx = async (actividad) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

  const children = [
    // Document Title
    new Paragraph({
      text: `RurAI - Planificación Pedagógica y Evaluación`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Tema: ${actividad.titulo}`,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),

    // Header info
    new Paragraph({
      children: [
        new TextRun({ text: "Motor del Juego: ", bold: true }),
        new TextRun(actividad.tipoMotor === 'RPG' ? "Duelo de Decisiones (RPG)" : actividad.tipoMotor === 'TD' ? "Clasificador Defensivo (Trivia)" : "Acción Directa"),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Descripción del Juego: ", bold: true }),
        new TextRun(actividad.descripcion),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Enlace para los Alumnos: ", bold: true }),
        new TextRun({ text: `http://localhost:3000/play/${actividad.tokenCorto}`, color: "0000FF", underline: true }),
      ],
    }),
    new Paragraph({ text: "" }),

    // Session Plan Section
    new Paragraph({
      text: "I. Planificación Curricular (Sesión de Aprendizaje)",
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "• Competencia Curricular: ", bold: true }),
        new TextRun("Alineado a las Competencias del Currículo Nacional de Educación Básica (CNEB) de Secundaria."),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "• Capacidad Evaluada: ", bold: true }),
        new TextRun("Comunica y argumenta afirmaciones sobre relaciones numéricas / Obtiene información relevante."),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "• Secuencia Didáctica Sugerida:\n", bold: true }),
        new TextRun("  1. Inicio (15 min): Introducción al tema y resolución conjunta de la primera pregunta del juego.\n" +
                   "  2. Desarrollo (60 min): Trabajo grupal en tablets/PC o ficha impresa analizando distractores.\n" +
                   "  3. Cierre (15 min): Reflexión y consolidación de conceptos clave en el aula."),
      ],
    }),
    new Paragraph({ text: "" }),

    // Evaluation sheet Section
    new Paragraph({
      text: "II. Ficha de Evaluación Escrita (Material Impreso)",
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: "Instrucciones para el Estudiante: Lee con atención cada situación y marca la alternativa correcta.",
    }),
    new Paragraph({ text: "" }),
  ];

  // Add questions depending on the game type
  if (actividad.dataIa.escenas && Array.isArray(actividad.dataIa.escenas)) {
    actividad.dataIa.escenas.forEach((esc, index) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Pregunta ${index + 1}: `, bold: true }),
          new TextRun(esc.pregunta),
        ],
      }));
      if (esc.opciones) {
        esc.opciones.forEach((op, opIdx) => {
          children.push(new Paragraph({
            text: `   [  ] ${op} ${opIdx === esc.respuesta ? " (Opción Correcta)" : ""}`,
          }));
        });
      }
      children.push(new Paragraph({ text: "" }));
    });
  } else if (actividad.dataIa.preguntasTrivia && Array.isArray(actividad.dataIa.preguntasTrivia)) {
    actividad.dataIa.preguntasTrivia.forEach((trivia, index) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Pregunta ${index + 1}: `, bold: true }),
          new TextRun(trivia.pregunta),
        ],
      }));
      if (trivia.opciones) {
        trivia.opciones.forEach((op, opIdx) => {
          children.push(new Paragraph({
            text: `   [  ] ${op} ${opIdx === trivia.respuesta ? " (Opción Correcta)" : ""}`,
          }));
        });
      }
      children.push(new Paragraph({ text: "" }));
    });
  } else if (actividad.dataIa.eventos && Array.isArray(actividad.dataIa.eventos)) {
    actividad.dataIa.eventos.forEach((evt, index) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Caso / Desafío ${index + 1}: `, bold: true }),
          new TextRun(evt.descripcion),
        ],
      }));
      children.push(new Paragraph({
        text: `   Impacto: Puntos: ${evt.impacto?.puntos || 0} | Energía: ${evt.impacto?.energia || 0}`,
      }));
      children.push(new Paragraph({ text: "" }));
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
