// src/components/Reserva.tsx
import { useState, useEffect } from 'react';
import { ApiResponse, ProductoItem } from '../../types/api';

const Reserva = () => {
  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchProductos = async (pageNum: number) => {
    try {
      const search = '';
      const res = await fetch(
        `${API_BASE_URL}/productos-moderna/1?search=${encodeURIComponent(search)}&page=${pageNum}`
      );
      if (!res.ok) throw new Error('Error al cargar los productos');

      const response: ApiResponse = await res.json(); // ✅ Tipado explícito

      const { productos: paginatedProductos } = response; // renombramos para evitar confusión

      if (pageNum === 1) {
        setProductos(paginatedProductos.data);
      } else {
        setProductos((prev) => [...prev, ...paginatedProductos.data]);
      }

      setHasMore(pageNum < paginatedProductos.last_page);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchProductos(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProductos(nextPage);
  };

  if (initialLoad && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-black">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Productos para Reserva</h1>

      {error && (
        <div className="text-red-500 text-center mb-6">
          {error}
        </div>
      )}

      {productos.length === 0 && !loading && !error && (
        <p className="text-black text-center">No se encontraron productos.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {producto.producto.fotos.length > 0 ? (
              <img
                src={`http://192.168.1.208:8000/${producto.producto.fotos[0].foto}`}
                alt={producto.nombre}
                className="w-full h-40 object-cover rounded mb-3"
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500">
                Sin imagen
              </div>
            )}
            <h3 className="font-semibold text-black">{producto.nombre}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{producto.descripcion}</p>
            <p className="text-black font-bold mt-2">
              Bs. {producto.producto.precio_descuento || producto.producto.precio}
            </p>
            <p className="text-sm text-gray-500">Stock: {producto.stock}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Ver más'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Reserva;