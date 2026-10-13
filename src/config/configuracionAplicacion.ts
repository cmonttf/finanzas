/**
 * Configuración de la aplicación obtenida desde las variables de entorno.
 * Es el único archivo que lee import.meta.env.
 */
export const configuracionAplicacion = {
  nombreAplicacion: import.meta.env.VITE_NOMBRE_APLICACION ?? 'Mis Finanzas',
  urlApiIndicadores: import.meta.env.VITE_URL_API_INDICADORES,
  tiempoEsperaApiMs: Number(import.meta.env.VITE_TIEMPO_ESPERA_API_MS ?? 8000),
  requiereInicioSesion: import.meta.env.VITE_REQUIERE_INICIO_SESION !== 'false',
  urlBaseEnrutador: import.meta.env.BASE_URL,
  movimientosPorPagina: 10,
  mesesHistorialGrafico: 6,
} as const
