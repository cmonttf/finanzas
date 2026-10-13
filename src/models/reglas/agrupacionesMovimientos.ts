import { TIPO_MOVIMIENTO } from '@/config/constantes'
import type { Movimiento } from '@/models/entidades/Movimiento'
import { calcularTotalPorTipoMovimiento } from './calculosFinancieros'
import { obtenerClaveMes, obtenerClavesUltimosMeses } from './fechas'

/** Total gastado en una categoría. */
export interface TotalPorCategoria {
  identificadorCategoria: string
  total: number
}

/** Totales de ingresos y gastos de un mes. */
export interface TotalesMensuales {
  claveMes: string // Formato AAAA-MM
  totalIngresos: number
  totalGastos: number
}

/**
 * Filtra los movimientos que pertenecen al mismo mes que la fecha de referencia.
 *
 * @param movimientos Lista de movimientos.
 * @param fechaReferencia Fecha cuyo mes se desea obtener.
 * @returns Movimientos del mes indicado.
 */
export function filtrarMovimientosDelMes(
  movimientos: Movimiento[],
  fechaReferencia: Date,
): Movimiento[] {
  const claveMes = obtenerClaveMes(fechaReferencia)
  return movimientos.filter((movimiento) => movimiento.fecha.startsWith(claveMes))
}

/**
 * Suma los gastos agrupados por categoría, ordenados de mayor a menor.
 *
 * @param movimientos Lista de movimientos; los ingresos se ignoran.
 * @returns Total gastado por cada categoría con al menos un gasto.
 */
export function agruparGastosPorCategoria(movimientos: Movimiento[]): TotalPorCategoria[] {
  const totalesPorCategoria = new Map<string, number>()
  for (const movimiento of movimientos) {
    if (movimiento.tipo !== TIPO_MOVIMIENTO.GASTO) continue
    const totalPrevio = totalesPorCategoria.get(movimiento.identificadorCategoria) ?? 0
    totalesPorCategoria.set(movimiento.identificadorCategoria, totalPrevio + movimiento.monto)
  }
  return [...totalesPorCategoria.entries()]
    .map(([identificadorCategoria, total]) => ({ identificadorCategoria, total }))
    .sort((primero, segundo) => segundo.total - primero.total)
}

/**
 * Calcula ingresos y gastos de los últimos meses, incluyendo meses sin movimientos.
 *
 * @param movimientos Lista de movimientos.
 * @param cantidadMeses Cantidad de meses del historial.
 * @param fechaReferencia Fecha del mes más reciente.
 * @returns Totales por mes en orden cronológico.
 */
export function calcularHistorialMensual(
  movimientos: Movimiento[],
  cantidadMeses: number,
  fechaReferencia: Date,
): TotalesMensuales[] {
  return obtenerClavesUltimosMeses(cantidadMeses, fechaReferencia).map((claveMes) => {
    const movimientosDelMes = movimientos.filter((movimiento) =>
      movimiento.fecha.startsWith(claveMes),
    )
    return {
      claveMes,
      totalIngresos: calcularTotalPorTipoMovimiento(movimientosDelMes, TIPO_MOVIMIENTO.INGRESO),
      totalGastos: calcularTotalPorTipoMovimiento(movimientosDelMes, TIPO_MOVIMIENTO.GASTO),
    }
  })
}

/**
 * Cuenta cuántos movimientos tiene cada categoría.
 *
 * @param movimientos Lista de movimientos.
 * @returns Mapa de identificador de categoría a cantidad de movimientos.
 */
export function contarMovimientosPorCategoria(movimientos: Movimiento[]): Map<string, number> {
  const cantidadPorCategoria = new Map<string, number>()
  for (const movimiento of movimientos) {
    const cantidadPrevia = cantidadPorCategoria.get(movimiento.identificadorCategoria) ?? 0
    cantidadPorCategoria.set(movimiento.identificadorCategoria, cantidadPrevia + 1)
  }
  return cantidadPorCategoria
}
