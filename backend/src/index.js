import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { db } from './database.js';

import authRoutes from './routes/authRoutes.js';
import actividadRoutes from './routes/actividadRoutes.js';
import generacionRoutes from './routes/generacionRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/actividad', actividadRoutes);
app.use('/api/v1/generar', generacionRoutes);
app.use('/api/v1/exportar', exportRoutes);

// Open Graph Dinámico
app.get('/play/:id', (req, res) => {
  const { id } = req.params;
  const actividad = db.actividades.find(a => a.tokenCorto === id || a.id === id);

  if (!actividad) {
    return res.status(404).send('Actividad no encontrada');
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${actividad.titulo} - RurAI</title>
        
        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="${actividad.titulo}" />
        <meta property="og:description" content="${actividad.descripcion}" />
        <meta property="og:image" content="https://via.placeholder.com/1200x630.png?text=RurAI" />
        <meta property="og:url" content="https://rurai.pe/play/${id}" />
        <meta property="og:type" content="website" />
      </head>
      <body>
        <div id="root"></div>
        <!-- En un entorno real de producción, aquí se inyectaría el script generado por Vite -->
        <script type="module" src="http://localhost:5173/src/main.jsx"></script>
      </body>
    </html>
  `;
  
  res.send(html);
});

// Añadimos un endpoint para consultar los temas (útil para el frontend)
app.get('/api/v1/temas', (req, res) => {
  res.status(200).json(db.temas);
});

// Manejador global de errores
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend de RurAI escuchando en http://localhost:${PORT}`);
});
