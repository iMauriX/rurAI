import { useState, useEffect } from 'react';
import axios from 'axios';

// Usamos axios directamente (sin el interceptor) porque la vista Play es pública
export const useActividad = (token) => {
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActividad = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/v1/actividad/token/${token}`);
        setActividad(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar la actividad');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchActividad();
    }
  }, [token]);

  return { actividad, loading, error };
};
