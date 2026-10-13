import { format, subMonths } from 'date-fns'

/**
 * Convierte una fecha a formato ISO AAAA-MM-DD según la zona horaria local.
 * Se evita toISOString() porque usa UTC y en Chile adelanta el día durante la noche.
 *
 * @param fecha Fecha a convertir.
 * @returns Fecha en formato AAAA-MM-DD.
 */
export function obtenerFechaIsoLocal(fecha: Date = new Date()): string {
  return format(fecha, 'yyyy-MM-dd')
}

/**
 * Obtiene la clave de mes AAAA-MM de una fecha.
 *
 * @param fecha Fecha de referencia.
 * @returns Clave del mes en formato AAAA-MM.
 */
export function obtenerClaveMes(fecha: Date): string {
  return format(fecha, 'yyyy-MM')
}

/**
 * Genera las claves de los últimos meses, del más antiguo al más reciente, incluyendo el actual.
 *
 * @param cantidadMeses Cantidad de meses a generar.
 * @param fechaReferencia Fecha del mes más reciente.
 * @returns Lista de claves AAAA-MM en orden cronológico.
 */
export function obtenerClavesUltimosMeses(cantidadMeses: number, fechaReferencia: Date): string[] {
  return Array.from({ length: cantidadMeses }, (_, indice) =>
    obtenerClaveMes(subMonths(fechaReferencia, cantidadMeses - 1 - indice)),
  )
}
