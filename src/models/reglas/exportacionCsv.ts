import { ETIQUETAS_TIPO_MOVIMIENTO } from '@/config/constantes'
import type { Movimiento } from '@/models/entidades/Movimiento'

const SEPARADOR_CSV = ';'
const ENCABEZADOS_CSV = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto (CLP)']

/**
 * Escapa un valor para CSV y neutraliza fórmulas que una planilla podría ejecutar.
 *
 * @param valor Texto de la celda.
 * @returns Celda segura entre comillas dobles.
 */
export function escaparCeldaCsv(valor: string): string {
  const valorSinFormula = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor
  return `"${valorSinFormula.replaceAll('"', '""')}"`
}

/**
 * Genera el contenido CSV de una lista de movimientos (RF-12).
 *
 * @param movimientos Movimientos a exportar, una fila por movimiento.
 * @param obtenerNombreCategoria Traduce el identificador de categoría a su nombre.
 * @returns Texto CSV con encabezados, separado por punto y coma para Excel en español.
 */
export function generarCsvMovimientos(
  movimientos: Movimiento[],
  obtenerNombreCategoria: (identificadorCategoria: string) => string,
): string {
  const filas = movimientos.map((movimiento) =>
    [
      escaparCeldaCsv(movimiento.fecha),
      escaparCeldaCsv(ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]),
      escaparCeldaCsv(obtenerNombreCategoria(movimiento.identificadorCategoria)),
      escaparCeldaCsv(movimiento.descripcion),
      String(movimiento.monto),
    ].join(SEPARADOR_CSV),
  )
  return [ENCABEZADOS_CSV.map(escaparCeldaCsv).join(SEPARADOR_CSV), ...filas].join('\r\n')
}
