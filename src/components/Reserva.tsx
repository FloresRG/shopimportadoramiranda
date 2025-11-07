// src/components/Reserva.tsx
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePreimonCart } from '../context/PreimonCartContext';
import { ApiResponse, ProductoItem } from '../types/api';

const Reserva = () => {
  const { addToCart } = usePreimonCart();

  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://192.168.1.213:8000/api/productos-moderna/1?search=${encodeURIComponent(debouncedSearchTerm)}`
        );
        if (!res.ok) throw new Error('Error al cargar los productos');
        const response: ApiResponse = await res.json();
        setProductos(response.productos.data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [debouncedSearchTerm]);

  const handleAddToCart = (producto: ProductoItem) => {
    if (producto.stock <= 0) {
      toast.error('Este producto está agotado');
      return;
    }

    const precioRaw = producto.producto.precio_descuento || producto.producto.precio;
    const precio = typeof precioRaw === 'string' ? parseFloat(precioRaw) : precioRaw;

    if (isNaN(precio)) {
      toast.error('Precio inválido para este producto');
      return;
    }

    const item = {
      id: producto.id,
      nombre: producto.nombre,
      precio,
      foto: producto.producto.fotos[0]?.foto
        ? `http://192.168.1.213:8000/storage/${producto.producto.fotos[0].foto}`
        : '',
    };

    addToCart(item);
    toast.success('Producto agregado al carrito ✅');
  };

  const renderStockStatus = (stock: number) => {
    if (stock <= 0) return <span className="text-red-500 font-medium">Agotado</span>;
    if (stock < 5) return <span className="text-orange-500 text-sm">¡Pocas unidades!</span>;
    return <span className="text-green-600 text-sm">Disponible</span>;
  };

  return (
    <div className="p-4 pt-24 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Productos para Reserva</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
        />
      </div>

      {error && <div className="text-red-500 text-center mb-6">{error}</div>}
      {loading && <p className="text-black text-center">Cargando...</p>}
      {!loading && productos.length === 0 && !error && (
        <p className="text-black text-center">No se encontraron productos.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="border rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            {producto.producto.fotos.length > 0 ? (
              <img
                src={`http://192.168.1.213:8000/storage/${producto.producto.fotos[0].foto}`}
                alt={producto.nombre}
                className="w-full h-40 object-cover rounded-lg mb-3"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}

            <h3 className="font-semibold text-black line-clamp-1">{producto.nombre}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">{producto.descripcion}</p>
            <p className="text-black font-bold text-lg">
              Bs. {producto.producto.precio_descuento || producto.producto.precio}
            </p>
            <div className="mt-1">{renderStockStatus(producto.stock)}</div>

            <button
              onClick={() => handleAddToCart(producto)}
              disabled={producto.stock <= 0}
              className={`mt-3 py-2 rounded-lg font-medium transition-colors ${
                producto.stock <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {producto.stock <= 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reserva;