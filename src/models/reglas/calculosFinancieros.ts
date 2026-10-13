import { TIPO_MOVIMIENTO } from '@/config/constantes'
import type { Movimiento } from '@/models/entidades/Movimiento'

/**
 * Suma los montos de los movimientos de un tipo específico.
 *
 * @param movimientos Lista de movimientos a considerar.
 * @param tipo Tipo de movimiento que se desea totalizar.
 * @returns Total en pesos chilenos de los movimientos del tipo indicado.
 */
export function calcularTotalPorTipoMovimiento(
  movimientos: Movimiento[],
  tipo: Movimiento['tipo'],
): number {
  return movimientos
    .filter((movimiento) => movimiento.tipo === tipo)
    .reduce((totalAcumulado, movimiento) => totalAcumulado + movimiento.monto, 0)
}

/**
 * Calcula el saldo como ingresos menos gastos (RN-01).
 *
 * @param movimientos Lista de movimientos registrados.
 * @returns Saldo en pesos chilenos; puede ser negativo.
 */
export function calcularSaldoMovimientos(movimientos: Movimiento[]): number {
  const totalIngresos = calcularTotalPorTipoMovimiento(movimientos, TIPO_MOVIMIENTO.INGRESO)
  const totalGastos = calcularTotalPorTipoMovimiento(movimientos, TIPO_MOVIMIENTO.GASTO)
  return totalIngresos - totalGastos
}

/**
 * Convierte un monto en pesos a la unidad de un indicador económico (RN-03).
 *
 * @param montoEnPesos Monto en pesos chilenos.
 * @param valorIndicadorEnPesos Valor del indicador expresado en pesos.
 * @returns Monto convertido a la unidad del indicador.
 * @throws {RangeError} Cuando el valor del indicador es menor o igual a cero.
 */
export function convertirPesosAIndicador(
  montoEnPesos: number,
  valorIndicadorEnPesos: number,
): number {
  if (valorIndicadorEnPesos <= 0) {
    throw new RangeError('El valor del indicador debe ser mayor que cero.')
  }
  return montoEnPesos / valorIndicadorEnPesos
}
