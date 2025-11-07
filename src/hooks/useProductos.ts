// src/hooks/useProductos.ts
import { useEffect, useState } from 'react';
import { ApiResponse } from '../types/api';

const useProductos = (search: string = '') => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const url = `${import.meta.env.VITE_API_BASE_URL}/productos-moderna/1?search=${encodeURIComponent(search)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error en la red');
        const json: ApiResponse = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [search]);

  return { data, loading, error };
};

export default useProductos;