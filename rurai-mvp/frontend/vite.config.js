import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'motor-rpg': ['./src/components/motors/DueloDecisiones.jsx'],
          'motor-td': ['./src/components/motors/ClasificadorDefensivo.jsx'],
          'motor-sim': ['./src/components/motors/SimuladorDestino.jsx'],
          'vendor': ['react', 'react-dom', 'react-router-dom', 'axios']
        }
      }
    }
  }
})
