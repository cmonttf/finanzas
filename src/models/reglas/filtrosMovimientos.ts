import type { FiltrosMovimientos } from '@/models/entidades/FiltrosMovimientos'
import type { Movimiento } from '@/models/entidades/Movimiento'

/**
 * Ordena los movimientos por fecha descendente sin modificar la lista original.
 *
 * @param movimientos Lista de movimientos.
 * @returns Nueva lista ordenada del más reciente al más antiguo.
 */
export function ordenarMovimientosPorFechaDescendente(movimientos: Movimiento[]): Movimiento[] {
  return [...movimientos].sort((primero, segundo) => segundo.fecha.localeCompare(primero.fecha))
}

/**
 * Aplica los filtros combinables de tipo, categoría y rango de fechas (RF-06).
 *
 * @param movimientos Lista de movimientos.
 * @param filtros Criterios; los valores vacíos no filtran.
 * @returns Movimientos que cumplen todos los criterios.
 */
export function filtrarMovimientos(
  movimientos: Movimiento[],
  filtros: FiltrosMovimientos,
): Movimiento[] {
  return movimientos.filter(
    (movimiento) =>
      (!filtros.tipo || movimiento.tipo === filtros.tipo) &&
      (!filtros.identificadorCategoria ||
        movimiento.identificadorCategoria === filtros.identificadorCategoria) &&
      (!filtros.fechaDesde || movimiento.fecha >= filtros.fechaDesde) &&
      (!filtros.fechaHasta || movimiento.fecha <= filtros.fechaHasta),
  )
}

/**
 * Indica si el rango de fechas de los filtros es inválido (desde posterior a hasta).
 *
 * @param filtros Criterios de filtrado.
 * @returns true si ambas fechas existen y la inicial es posterior a la final.
 */
export function tieneRangoFechasInvalido(filtros: FiltrosMovimientos): boolean {
  return Boolean(
    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
  )
}

/**
 * Calcula la cantidad de páginas necesarias para mostrar una lista.
 *
 * @param cantidadElementos Total de elementos.
 * @param elementosPorPagina Elementos que caben en cada página.
 * @returns Cantidad de páginas; al menos 1.
 */
export function calcularTotalPaginas(
  cantidadElementos: number,
  elementosPorPagina: number,
): number {
  return Math.max(1, Math.ceil(cantidadElementos / elementosPorPagina))
}

/**
 * Obtiene los elementos de una página específica.
 *
 * @param elementos Lista completa.
 * @param numeroPagina Número de página, comenzando en 1.
 * @param elementosPorPagina Elementos por página.
 * @returns Elementos de la página solicitada.
 */
export function obtenerPagina<T>(
  elementos: T[],
  numeroPagina: number,
  elementosPorPagina: number,
): T[] {
  const indiceInicial = (numeroPagina - 1) * elementosPorPagina
  return elementos.slice(indiceInicial, indiceInicial + elementosPorPagina)
}
