import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useActividad = (token) => {
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActividad = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/actividad/token/${token}`);
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
