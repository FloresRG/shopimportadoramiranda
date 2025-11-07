import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Categorias from "./components/Categorias";
import TodosLosProductos from "./components/TodosLosProductos";

import FloatingCart from "./components/carrito/FloatingCart";
import { CartProvider, useCart } from "./components/carrito/CarritoContext";

import CategoriaProductos from "./components/CategoriaProductos";
import FormularioCompraPasos from "./components/steepformulario/index";
import FormularioMAyor from "./components/Mayoristas/steepformulario1/index1";
import Promociones from "./components/PromotionCard";
import CatalogoMayoristas from "./components/Mayoristas/CatalogoMayoristas";
import MainScreen from "./components/Mayoristas/MainScreen";
import { AuthProvider } from "./components/protec/AuthContext";
import ProtectedRoute from "./components/protec/ProtectedRoute";
import "./index.css";
import ProductDetails from "./components/detalle/ProductDetails";
import { fetchProducts } from "./utils/api";
import { ProductCarousel } from "./components/principal/product-carousel";
import PromotionDetails from "./components/detalle/PromotionDetails";
import Categoriasuno from "./components/categhoria/Categoriasuno";
import PromotionCardUno from "./components/PromotionCarduno";
import CategoriasMayor from "./components/Mayoristas/CategoriasMayor";
import HeaderMayorista from "./components/Mayoristas/HeaderMayorista";
import ProductosMayorista from "./components/Mayoristas/ProductosMayorista";
import CategoriaProductosMayor from "./components/Mayoristas/CategoriaProductosMayor";
import ProductDetailsMayor from "./components/Mayoristas/ProductDetailsMayor";
import PreventaComponent from "./components/preventa/preventa-component";
import SucursalesSection from "./components/SucursalesSection/SucursalesSection";
import SolicitudForm from "./components/trabaja_con_nosotros/trabaja_con_nosotros";
import Formulario from "./components/pedido/steps/Formulario";
import Formulario1 from "./components/pedido/steps_1/Formulario";
import Reserva from "./components/Reserva";
import { Toaster } from "sonner";

import PreimonFloatingCart from "./components/PreimonFloatingCart";
import ReservaConfirmada from "./components/ReservaConfirmada";

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio_extra: string;
  imageUrl: string;
  fotos: Array<{ foto: string }>;
  stock: number;
}

const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  const hiddenFooterPaths = ["/catalogo", "/main"];
  if (hiddenFooterPaths.includes(location.pathname)) return null;
  return <Footer />;
};

// 👇 COMPONENTE ACTUALIZADO PARA CONTROLAR AMBOS CARRITOS
const ConditionalCarts: React.FC<{
  isCartOpen: boolean;
  onOpenCart: () => void;
  onCloseCart: () => void;
}> = ({ isCartOpen, onOpenCart, onCloseCart }) => {
  const location = useLocation();

  // ✅ Ocultar TODO en la página de confirmación
  if (location.pathname === '/reservaconfirmada') {
    return null;
  }

  return (
    <>
      {/* Carrito tradicional: NO en /Reserva ni en /reservaconfirmada */}
      {location.pathname !== '/Reserva' && (
        <>
          <CartIcon onOpenCart={onOpenCart} />
          {isCartOpen && <FloatingCart isCartOpen={isCartOpen} onClose={onCloseCart} />}
        </>
      )}

      {/* Carrito Preimon: visible en todas excepto /reservaconfirmada */}
      <PreimonFloatingCart />
    </>
  );
};

const CartIcon: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const location = useLocation();

  const isMayoristaRoute =
    location.pathname.startsWith("/categoriamayor") ||
    location.pathname.startsWith("/productosmayoristas") ||
    location.pathname.startsWith("/main") ||
    location.pathname.startsWith("/productomayor");

  if (location.pathname === "/pedidos" || location.pathname === "/catalogo") {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 ${
        isMayoristaRoute ? "bg-blue-600" : "bg-purple-600"
      } text-white border border-gray-300 shadow-lg p-4 rounded-full cursor-pointer flex items-center`}
      onClick={onOpenCart}
      style={{ zIndex: 1000 }}
    >
      <span style={{ fontSize: "32px" }}>🛒</span>
      {totalItems > 0 && (
        <span
          className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold"
          style={{ transform: "translate(50%, -50%)" }}
        >
          {totalItems}
        </span>
      )}
      {isSmallScreen && (
        <div className="ml-4 text-left bg-white text-black p-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm">{totalItems} productos</p>
          <button
            className={`mt-2 px-4 py-2 ${
              isMayoristaRoute ? "bg-blue-600" : "bg-purple-600"
            } text-white rounded-lg text-sm`}
            onClick={onOpenCart}
          >
            Ver Carrito
          </button>
        </div>
      )}
    </div>
  );
};

const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  const hiddenHeaderPaths = ["/pedidos", "/pedidos_1", "/catalogo", "/main"];
  const mayoristaPaths = [
    "/categoriamayor",
    "/productosmayoristas",
    "/productomayor",
  ];

  const isMayoristaRoute =
    mayoristaPaths.some((path) => location.pathname.startsWith(path)) ||
    location.pathname.startsWith("/categoriamayor/") ||
    location.pathname.startsWith("/productomayor/") ||
    location.pathname.startsWith("/pago1");

  if (isMayoristaRoute) {
    return <HeaderMayorista />;
  }

  if (hiddenHeaderPaths.includes(location.pathname)) {
    return null;
  }

  return <Header height="h-32" />;
};

const MainContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div style={{ paddingTop: "15px" }}>
      <Routes>
        <Route path="/categorias" element={<Categorias />} />
        <Route
          path="/categorias/:categoryName"
          element={<CategoriaProductos />}
        />
        <Route path="/todos-productos" element={<TodosLosProductos />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/pago" element={<FormularioCompraPasos />} />
        <Route path="/promociones" element={<Promociones />} />
        <Route path="/pedidos" element={<Formulario />} />
        <Route path="/pedidos_1" element={<Formulario1 />} />
        <Route path="/catalogo" element={<CatalogoMayoristas />} />
        <Route path="/producto/:productId" element={<ProductDetails />} />
        <Route path="/Reserva" element={<Reserva />} />
        <Route path="/reservaconfirmada" element={<ReservaConfirmada />} />
        <Route
          path="/productomayor/:productId"
          element={<ProductDetailsMayor />}
        />
        <Route path="/promocion/:promotionId" element={<PromotionDetails />} />
        <Route
          path="/categoriamayor/:categoryMayorName"
          element={<CategoriaProductosMayor />}
        />
        <Route path="/categoriamayor" element={<CategoriasMayor />} />
        <Route path="/productosmayoristas" element={<ProductosMayorista />} />
        <Route path="/pago1" element={<FormularioMAyor />} />
        <Route path="/trabaja-con-nosotros" element={<SolicitudForm />} />
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

const HomePage: React.FC = () => {
  const [fallingImages, setFallingImages] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhoneAlert, setShowPhoneAlert] = useState(true);

  const closePhoneAlert = () => {
    setShowPhoneAlert(false);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const getImageCount = () => {
      if (typeof window !== "undefined") {
        return window.innerWidth > 1024
          ? 20
          : window.innerWidth > 768
          ? 15
          : 10;
      }
      return 15;
    };

    const imagesArray = Array.from({ length: getImageCount() }, (_, index) => ({
      id: index,
      size: Math.random() * 60 + 40,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      rotation: Math.random() * 360,
    }));

    setFallingImages(imagesArray);

    const handleResize = () => {
      const newCount = getImageCount();
      if (newCount !== fallingImages.length) {
        const newImagesArray = Array.from({ length: newCount }, (_, index) => ({
          id: index,
          size: Math.random() * 60 + 40,
          left: Math.random() * 100,
          delay: Math.random() * 5,
          rotation: Math.random() * 360,
        }));
        setFallingImages(newImagesArray);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes float { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-100px) rotate(180deg); } 100% { transform: translateY(0) rotate(360deg); } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .falling-logo { position: absolute; top: -100px; animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; z-index: 1; pointer-events: none; }
        @keyframes fall { 0% { transform: translateY(-100px) rotate(0deg); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.7; } 100% { transform: translateY(calc(100vh + 100px)) rotate(360deg); opacity: 0; } }
        .falling-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 0; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <Toaster richColors position="top-center" />

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 overflow-hidden">
        {showPhoneAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-in">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-purple-500"
                    style={{
                      width: `${Math.random() * 20 + 5}px`,
                      height: `${Math.random() * 20 + 5}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.7 + 0.3,
                      animation: `float ${
                        Math.random() * 10 + 10
                      }s linear infinite`,
                      animationDelay: `${Math.random() * 5}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative max-w-md w-[90%] sm:w-[85%] md:w-full mx-auto overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 rounded-2xl animate-gradient"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #9333ea, #ec4899, #3b82f6)",
                  backgroundSize: "200% 200%",
                }}
              ></div>

              <div className="relative m-[3px] bg-gradient-to-br from-purple-900/90 to-purple-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                <div
                  className="fixed top-2 right-2 bg-gradient-to-br from-pink-500 to-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold cursor-pointer shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1 z-50 border-2 border-white/50"
                  onClick={closePhoneAlert}
                >
                  ×
                </div>

                <h2 className="text-3xl font-extrabold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-200 uppercase tracking-wide">
                  ¡ATENCIÓN!
                </h2>

                <div className="bg-purple-900/50 backdrop-blur-sm p-5 rounded-xl mb-5 border-l-4 border-pink-400 shadow-inner">
                  <p className="text-center text-lg font-bold mb-4 text-pink-200">
                    Este es el ÚNICO número oficial de nuestra importadora:
                  </p>

                  <div className="flex items-center justify-center p-4 bg-purple-800/70 rounded-xl shadow-md mb-3 border border-purple-500/30 hover:shadow-purple-400/30 transition-all duration-300 group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-pink-400 mr-3 group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-2xl font-mono font-extrabold text-white tracking-wider">
                      +591 70621016
                    </span>
                  </div>
                </div>

                <p className="text-center font-bold text-pink-200 mb-6">
                  No existe otro número autorizado. Evite estafas.
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={closePhoneAlert}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="falling-background relative">
          {fallingImages.map((image) => (
            <img
              key={image.id}
              src="/logo.png"
              alt="Logo"
              className="falling-logo absolute"
              style={{
                left: `${image.left}%`,
                width: `${image.size}px`,
                height: `${image.size}px`,
                transform: `rotate(${image.rotation}deg)`,
                animationDuration: `${6 + image.delay}s`,
                animationDelay: `${image.delay}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        <main className="relative z-10">
          {loading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                <div className="text-xl sm:text-2xl text-white font-medium">
                  Cargando productos...
                </div>
              </div>
            </div>
          ) : (
            <div>
              <ProductCarousel
                products={products.filter((product) => product.stock > 0)}
              />
            </div>
          )}
        </main>

        <section>
          <Categoriasuno />
        </section>

        <section>
          <PromotionCardUno />
        </section>

        <section>
          <SucursalesSection />
        </section>
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [isCartOpen, setCartOpen] = useState(false);
  const handleOpenCart = () => setCartOpen(true);
  const handleCloseCart = () => setCartOpen(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div>
            <ConditionalHeader />
            <MainContent />
            <ConditionalFooter />
            {/* ✅ CONTROL CENTRALIZADO DE CARRITOS */}
            <ConditionalCarts
              isCartOpen={isCartOpen}
              onOpenCart={handleOpenCart}
              onCloseCart={handleCloseCart}
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;