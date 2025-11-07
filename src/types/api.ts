// src/types/api.ts

export interface Foto {
  id: number;
  foto: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    id_producto: number;
    id_foto: number;
  };
}

export interface Categoria {
  id: number;
  categoria: string;
  created_at: string;
  updated_at: string;
}

export interface Marca {
  id: number;
  marca: string;
  created_at: string;
  updated_at: string;
}

// ✅ Producto completo (el que viene dentro de "producto")
export interface ProductoDetallado {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  precio_descuento: string | null;
  stock: number;
  estado: number;
  estado_producto: string | null;
  fecha: string;
  id_cupo: number;
  id_tipo: number;
  id_categoria: number;
  id_marca: number;
  created_at: string;
  updated_at: string;
  user_id: number | null;
  stock_actual: number;
  stock_sucursal: number;
  categoria: Categoria;
  marca: Marca;
  fotos: Foto[];
}

// ✅ El ítem que viene en productos.data
export interface ProductoItem {
  id: number;
  id_producto: number;
  id_sucursal: number;
  cantidad: number;
  created_at: string;
  updated_at: string;
  id_user: number;
  id_sucursal_origen: number | null;
  id_user_destino: number | null;
  transfer_date: string | null;
  favorito: number;
  nombre: string;
  descripcion: string;
  precio: string;
  precio_descuento: string | null;
  stock: number;
  estado: number;
  estado_producto: string | null;
  fecha: string;
  id_cupo: number;
  id_tipo: number;
  id_categoria: number;
  id_marca: number;
  user_id: number | null;
  producto: ProductoDetallado; // ✅ Ahora coincide exactamente
}

export interface ProductosResponse {
  current_page: number;
  data: ProductoItem[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  sucursal: {
    id: number;
    nombre: string;
    direccion: string;
    created_at: string;
    updated_at: string;
    logo: string | null;
    celular: string | null;
    estado: string | null;
  };
  categorias: Categoria[];
  marcas: Marca[];
  usuarios: any[];
  productos: ProductosResponse;
}