/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOMBRE_APLICACION?: string
  readonly VITE_URL_API_INDICADORES: string
  readonly VITE_TIEMPO_ESPERA_API_MS?: string
  readonly VITE_REQUIERE_INICIO_SESION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
