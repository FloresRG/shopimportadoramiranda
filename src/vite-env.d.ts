/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Añade otras variables VITE_ si las usas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}