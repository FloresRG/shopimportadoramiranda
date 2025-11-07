// src/components/FloatingCart.tsx
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const FloatingCart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0 && !isOpen) return null;

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 z-50"
        aria-label="Carrito"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </div>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={() => setIsOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-xs bg-white border-l border-gray-200 shadow-xl overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Carrito ({getTotalItems()})</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">
                <X size={24} />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500">Tu carrito está vacío.</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border-b">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={item.nombre}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          📦
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{item.nombre}</p>
                        <p className="text-sm text-gray-600">Bs. {item.precio.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <p className="text-lg font-bold text-black">
                    Total: Bs. {getTotalPrice().toFixed(2)}
                  </p>
                  <button
                    onClick={() => {
                      console.log('Enviar carrito:', items);
                      toast.success('¡Pedido enviado!');
                      // fetch('/api/pedido', { method: 'POST', body: JSON.stringify(items) })
                    }}
                    className="mt-3 w-full py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                  >
                    Confirmar Pedido
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Vaciar carrito?')) clearCart();
                    }}
                    className="mt-2 w-full py-1 text-sm text-red-500"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCart;