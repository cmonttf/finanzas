/** Tipos de movimiento financiero admitidos por la aplicación. */
export const TIPO_MOVIMIENTO = {
  INGRESO: 'INGRESO',
  GASTO: 'GASTO',
} as const

export type TipoMovimiento = (typeof TIPO_MOVIMIENTO)[keyof typeof TIPO_MOVIMIENTO]

/** Etiquetas legibles de cada tipo de movimiento. */
export const ETIQUETAS_TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  INGRESO: 'Ingreso',
  GASTO: 'Gasto',
}

/** Códigos de indicadores que se consultan en mindicador.cl. */
export const CODIGOS_INDICADORES_ECONOMICOS = ['dolar', 'euro', 'uf'] as const

export type CodigoIndicadorEconomico = (typeof CODIGOS_INDICADORES_ECONOMICOS)[number]

/** Unidad en que se expresa el saldo convertido a cada indicador. */
export const UNIDADES_INDICADORES_ECONOMICOS: Record<
  CodigoIndicadorEconomico,
  { etiqueta: string; codigoMoneda?: string; decimales: number }
> = {
  dolar: { etiqueta: 'Dólar', codigoMoneda: 'USD', decimales: 2 },
  euro: { etiqueta: 'Euro', codigoMoneda: 'EUR', decimales: 2 },
  uf: { etiqueta: 'UF', decimales: 2 },
}

/** Claves usadas para persistir datos en localStorage. */
export const CLAVE_ALMACENAMIENTO_MOVIMIENTOS = 'mis-finanzas:movimientos'
export const CLAVE_ALMACENAMIENTO_CATEGORIAS = 'mis-finanzas:categorias'
export const CLAVE_ALMACENAMIENTO_TEMA = 'mis-finanzas:tema'
export const CLAVE_ALMACENAMIENTO_SESION = 'mis-finanzas:sesion'

/** Límites de validación de formularios. */
export const LARGO_MAXIMO_DESCRIPCION_MOVIMIENTO = 120
export const LARGO_MAXIMO_NOMBRE_CATEGORIA = 40
export const LARGO_MINIMO_CONTRASENA = 4

/** Temas visuales disponibles (RF-13). */
export const TEMA_VISUAL = {
  CLARO: 'claro',
  OSCURO: 'oscuro',
} as const

export type TemaVisual = (typeof TEMA_VISUAL)[keyof typeof TEMA_VISUAL]

/** Categorías con las que parte la aplicación (RN-04). */
export const CATEGORIAS_INICIALES = [
  { identificador: 'alimentacion', nombre: 'Alimentación' },
  { identificador: 'transporte', nombre: 'Transporte' },
  { identificador: 'vivienda', nombre: 'Vivienda' },
  { identificador: 'salud', nombre: 'Salud' },
  { identificador: 'entretencion', nombre: 'Entretención' },
  { identificador: 'educacion', nombre: 'Educación' },
  { identificador: 'sueldo', nombre: 'Sueldo' },
  { identificador: 'otros', nombre: 'Otros' },
] as const

/** Nombre mostrado cuando un movimiento referencia una categoría inexistente. */
export const NOMBRE_CATEGORIA_DESCONOCIDA = 'Sin categoría'

/** Configuración regional usada para formatear montos y fechas. */
export const CONFIGURACION_REGIONAL = 'es-CL'
