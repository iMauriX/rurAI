import * as docx from "docx";

export const generateDocx = async (actividad) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: actividad.titulo,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Descripción: ", bold: true }),
              new TextRun(actividad.descripcion),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Motor Lúdico: ", bold: true }),
              new TextRun(actividad.tipoMotor),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "URL del juego: ", bold: true }),
              new TextRun(`https://rurai.pe/play/${actividad.tokenCorto}`),
            ],
          }),
          new Paragraph({
            text: "\nDatos de IA Generados:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: JSON.stringify(actividad.dataIa, null, 2),
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
