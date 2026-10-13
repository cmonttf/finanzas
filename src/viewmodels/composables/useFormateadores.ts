import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CONFIGURACION_REGIONAL,
  ETIQUETAS_TIPO_MOVIMIENTO,
  UNIDADES_INDICADORES_ECONOMICOS,
  type CodigoIndicadorEconomico,
  type TipoMovimiento,
} from '@/config/constantes'

const formateadorPesos = new Intl.NumberFormat(CONFIGURACION_REGIONAL, {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

/**
 * Formatea un monto entero en pesos chilenos.
 *
 * @param montoEnPesos Monto en CLP.
 * @returns Texto como "$12.345".
 */
export function formatearPesos(montoEnPesos: number): string {
  return formateadorPesos.format(montoEnPesos)
}

/**
 * Formatea un monto expresado en la unidad de un indicador económico.
 *
 * @param codigoIndicador Indicador al que se convirtió el monto.
 * @param monto Monto convertido.
 * @returns Texto como "US$ 12,34" o "1,23 UF".
 */
export function formatearMontoIndicador(
  codigoIndicador: CodigoIndicadorEconomico,
  monto: number,
): string {
  const unidad = UNIDADES_INDICADORES_ECONOMICOS[codigoIndicador]
  const opcionesNumero = {
    minimumFractionDigits: unidad.decimales,
    maximumFractionDigits: unidad.decimales,
  }
  if (unidad.codigoMoneda) {
    return new Intl.NumberFormat(CONFIGURACION_REGIONAL, {
      ...opcionesNumero,
      style: 'currency',
      currency: unidad.codigoMoneda,
    }).format(monto)
  }
  return `${new Intl.NumberFormat(CONFIGURACION_REGIONAL, opcionesNumero).format(monto)} ${unidad.etiqueta}`
}

/**
 * Formatea una fecha ISO AAAA-MM-DD en formato largo legible.
 *
 * @param fechaIso Fecha en formato ISO.
 * @returns Texto como "12 de octubre de 2026".
 */
export function formatearFechaLarga(fechaIso: string): string {
  return format(parseISO(fechaIso), "d 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Formatea una fecha ISO AAAA-MM-DD en formato corto.
 *
 * @param fechaIso Fecha en formato ISO.
 * @returns Texto como "12-10-2026".
 */
export function formatearFechaCorta(fechaIso: string): string {
  return format(parseISO(fechaIso), 'dd-MM-yyyy')
}

/**
 * Obtiene la etiqueta legible de un tipo de movimiento.
 *
 * @param tipo Tipo de movimiento.
 * @returns "Ingreso" o "Gasto".
 */
export function formatearTipoMovimiento(tipo: TipoMovimiento): string {
  return ETIQUETAS_TIPO_MOVIMIENTO[tipo]
}

/**
 * Agrupa los formateadores de presentación para usarlos desde las vistas.
 *
 * @returns Funciones de formato de montos, fechas y tipos.
 */
export function useFormateadores() {
  return {
    formatearPesos,
    formatearMontoIndicador,
    formatearFechaLarga,
    formatearFechaCorta,
    formatearTipoMovimiento,
  }
}
