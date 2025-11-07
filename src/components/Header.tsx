"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, X, Menu, ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  height?: string;
}

// Interface para el producto
interface Product {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio_extra?: string;
  precio?: string;
  fotos?: Array<{
    id: number;
    foto: string;
  }>;
}

// Componente para mostrar los resultados de búsqueda
const SearchResultCard: React.FC<{
  product: Product;
  onSelect: (productId: string | number) => void;
}> = ({ product, onSelect }) => {
  const handleClick = () => {
    onSelect(product.id);
  };

  // Determinar la imagen a mostrar
  const productImage =
    product.fotos && product.fotos.length > 0
      ? `https://importadoramiranda.com/storage/${product.fotos[0].foto}`
      : "/placeholder.jpg";

  // Determinar el precio a mostrar (precio_extra tiene prioridad)
  const displayPrice = product.precio_extra || product.precio || "0";

  return (
    <div
      onClick={handleClick}
      className="bg-white hover:bg-purple-50 transition-colors duration-200 rounded-lg overflow-hidden shadow-md flex cursor-pointer p-2"
    >
      {/* Imagen del producto */}
      <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
        <img
          src={productImage || "/placeholder.svg"}
          alt={product.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.jpg";
          }}
        />
      </div>

      {/* Información del producto */}
      <div className="flex-1 p-2">
        <h3 className="text-sm font-medium text-purple-900 line-clamp-2 mb-1">
          {product.nombre}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-purple-700 font-bold">Bs. {displayPrice}</span>
          <span className="text-xs text-purple-600 hover:text-purple-800">
            Ver →
          </span>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ height = "h-16" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Estado general
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados para el buscador
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Para mantener el foco en el input
  const hasFocus = useRef<boolean>(false);

  // Funciones de scroll
  const handleScroll = () => {
    const currentScrollY = window.pageYOffset;
    setIsScrolled(currentScrollY > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detectar clics fuera del buscador para cerrar resultados
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Limpiar búsqueda al cambiar de ruta
  useEffect(() => {
    // Limpiar la búsqueda cuando el usuario navega a otra página
    setSearchQuery("");
    setShowResults(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  // Obtener productos de la API
  const fetchCategoriesAndProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://importadoramiranda.com/api/lupe/categorias`
      );
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const products = data.flatMap(
        (category: any) => category.productos || []
      );
      setAllProducts(products);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, []);

  // Función para buscar productos
  const searchProducts = useCallback(
    (query: string) => {
      if (query.trim() === "") {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // Filtrar productos que coincidan con la búsqueda
      const filteredResults = allProducts.filter(
        (product: Product) =>
          product.nombre.toLowerCase().includes(query.toLowerCase()) ||
          (product.descripcion &&
            product.descripcion.toLowerCase().includes(query.toLowerCase())) ||
          (product.precio && product.precio.toString().includes(query)) ||
          (product.precio_extra &&
            product.precio_extra.toString().includes(query))
      );

      setSearchResults(filteredResults);
      setIsSearching(false);
    },
    [allProducts]
  );

  // Manejar cambios en la búsqueda con mejor rendimiento
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);

      // Mostrar resultados solo si hay texto
      if (query.length > 0) {
        setShowResults(true);
      } else {
        setShowResults(false);
        setSearchResults([]);
      }

      // Cancelar búsqueda anterior si existe
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Programar nueva búsqueda después de un breve retraso
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(query);
      }, 300);
    },
    [searchProducts]
  );

  // Manejo de búsqueda por Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/busqueda?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  // Alternar búsqueda móvil
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      // Resetear la búsqueda al abrir
      setShowResults(false);
      setSearchQuery("");
      // Dar foco al input cuando se abre
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          hasFocus.current = true;
        }
      }, 100);
    }
  };

  // Manejar selección de producto
  const handleProductSelect = (productId: string | number) => {
    navigate(`/producto/${productId}`);
    // Limpiar búsqueda y cerrar resultados
    setSearchQuery("");
    setShowResults(false);
    setIsMobileSearchOpen(false);
  };

  // Efecto para restaurar el foco después de renderizado
  useEffect(() => {
    if (hasFocus.current && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchResults, showResults, searchQuery]); // Re-aplicar el foco después de cambios en estos estados

  // Componente de barra de búsqueda
  const SearchBar: React.FC<{
    searchQuery: string;
    handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isFullWidth?: boolean;
  }> = ({ searchQuery, handleSearchInputChange, isFullWidth = false }) => {
    return (
      <form
        onSubmit={handleSearchSubmit}
        className={`relative ${isFullWidth ? "w-full" : "w-full max-w-md"}`}
      >
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-4 w-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="w-full px-4 py-2 pl-10 pr-10 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-200 ease-in-out bg-white/90 backdrop-blur-sm"
            autoComplete="off"
            onFocus={() => {
              hasFocus.current = true;
            }}
            onBlur={() => {
              hasFocus.current = false;
            }}
            spellCheck={false}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSearchQuery("");
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                  hasFocus.current = true;
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    );
  };

  // Componente de resultados de búsqueda mejorado
  const SearchResults: React.FC<{
    searchResults: Product[];
    isSearching: boolean;
    onProductSelect: (productId: string | number) => void;
  }> = ({ searchResults, isSearching, onProductSelect }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute z-50 mt-2 w-full max-w-md bg-white rounded-xl shadow-lg overflow-y-auto max-h-96 border border-purple-200"
      >
        <div className="p-4">
          <div className="flex justify-between items-center border-b border-purple-100 pb-2 mb-3">
            <h4 className="text-lg font-semibold text-purple-900">
              {isSearching
                ? "Buscando..."
                : `Resultados (${searchResults.length})`}
            </h4>
            <button
              onClick={() => {
                setShowResults(false);
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                  hasFocus.current = true;
                }
              }}
              className="text-purple-500 hover:text-purple-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isSearching ? (
            <div className="p-4 text-center text-purple-600">Buscando...</div>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-3">
              {searchResults.slice(0, 5).map((product) => (
                <motion.div
                  key={`product-${product.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchResultCard
                    product={product}
                    onSelect={onProductSelect}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">
                No se encontraron productos que coincidan con tu búsqueda
              </p>
              <p className="text-sm text-purple-600 mt-2">
                Intenta con otras palabras o categorías
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render principal
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "shadow-lg bg-purple-900/95 backdrop-blur-md"
          : "bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900"
      }`}
    >
      {/* Top Banner */}
      <motion.div
        initial={{ height: 40, opacity: 1 }}
        animate={{ height: isScrolled ? 0 : 40, opacity: isScrolled ? 0 : 1 }}
        className="bg-gradient-to-r from-purple-600 to-purple-800 text-white text-center overflow-hidden"
      >
        <div className="py-2 text-sm font-medium flex items-center justify-center gap-2">
          <span className="inline-block animate-pulse">✨</span>
          Importadora Miranda - A un clic del producto que necesitas
          <span className="inline-block animate-pulse">✨</span>
        </div>
      </motion.div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and Brand */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-4"
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="relative h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-white/10 p-1 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Importadora Miranda"
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/40x40?text=IM";
                  }}
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white">
                  Importadora Miranda
                </h1>
                <p className="text-purple-200 text-xs">
                  A un clic del producto que necesitas
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <div className="w-full max-w-xl relative" ref={searchRef}>
              <SearchBar
                searchQuery={searchQuery}
                handleSearchInputChange={handleSearchInputChange}
                isFullWidth={true}
              />

              {/* Search Results (Desktop) */}
              <AnimatePresence>
                {showResults && searchQuery.trim() !== "" && (
                  <SearchResults
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onProductSelect={handleProductSelect}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {[
              { path: "/", label: "Home" },
              { path: "/categorias", label: "Categorías" },
              { path: "/todos-productos", label: "Productos" },
              { path: "/promociones", label: "Ofertas" },
              { path: "/Reserva", label: "Reserva" },
              { path: "/trabaja-con-nosotros", label: "Trabaja con nosotros" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative group ${
                  currentPath === item.path
                    ? "text-white font-semibold"
                    : "text-purple-200 hover:text-white"
                } transition-colors duration-200`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-purple-400 transform transition-transform duration-200 ${
                    currentPath === item.path
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}

            {/* Iconos adicionales */}
            {/* <div className="flex items-center gap-4 ml-2">
              <Link to="/favoritos" className="text-purple-200 hover:text-white transition-colors">
                <Heart className="h-5 w-5" />
              </Link>
              <Link to="/carrito" className="text-purple-200 hover:text-white transition-colors">
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </div> */}
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleMobileSearch}
              className="text-white focus:outline-none p-2 hover:bg-purple-800/50 rounded-full transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none p-2 hover:bg-purple-800/50 rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mb-4 overflow-hidden"
              ref={searchRef}
            >
              <SearchBar
                searchQuery={searchQuery}
                handleSearchInputChange={handleSearchInputChange}
                isFullWidth={true}
              />

              {/* Search Results (Mobile) */}
              <AnimatePresence>
                {showResults && searchQuery.trim() !== "" && (
                  <SearchResults
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onProductSelect={handleProductSelect}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-purple-800/95 backdrop-blur-md rounded-lg mt-2 shadow-lg"
            >
              {[
                { path: "/", label: "Home", icon: "" },
                { path: "/categorias", label: "Categorías", icon: "" },
                { path: "/todos-productos", label: "Productos", icon: "" },
                { path: "/promociones", label: "Ofertas", icon: "" },
                { path: "/reserva", label: "Reserva" },
                {
                  path: "/trabaja-con-nosotros",
                  label: "Trabaja con nosotros",
                },
                // { path: "/favoritos", label: "Favoritos", icon: "" },
                // { path: "/carrito", label: "Carrito", icon: "🛒" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-6 py-4 ${
                    currentPath === item.path
                      ? "bg-purple-700/50 text-white font-semibold"
                      : "text-purple-200 hover:bg-purple-700/30 hover:text-white"
                  } transition-colors border-b border-purple-700/30 last:border-0`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
