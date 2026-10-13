import { describe, expect, it } from 'vitest'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import {
  calcularSaldoMovimientos,
  calcularTotalPorTipoMovimiento,
  convertirPesosAIndicador,
} from '@/models/reglas/calculosFinancieros'
import { crearMovimientoDePrueba } from '../fabricas'

describe('calcularTotalPorTipoMovimiento', () => {
  it('suma solo los movimientos del tipo indicado', () => {
    const movimientosDePrueba = [
      crearMovimientoDePrueba({ tipo: TIPO_MOVIMIENTO.GASTO, monto: 1000 }),
      crearMovimientoDePrueba({ tipo: TIPO_MOVIMIENTO.GASTO, monto: 2500 }),
      crearMovimientoDePrueba({ tipo: TIPO_MOVIMIENTO.INGRESO, monto: 9000 }),
    ]
    expect(calcularTotalPorTipoMovimiento(movimientosDePrueba, TIPO_MOVIMIENTO.GASTO)).toBe(3500)
  })
})

describe('calcularSaldoMovimientos', () => {
  it('resta los gastos a los ingresos', () => {
    const movimientosDePrueba = [
      crearMovimientoDePrueba({ tipo: TIPO_MOVIMIENTO.INGRESO, monto: 50000 }),
      crearMovimientoDePrueba({ tipo: TIPO_MOVIMIENTO.GASTO, monto: 12000 }),
    ]
    expect(calcularSaldoMovimientos(movimientosDePrueba)).toBe(38000)
  })

  it('puede ser negativo', () => {
    expect(calcularSaldoMovimientos([crearMovimientoDePrueba({ monto: 500 })])).toBe(-500)
  })

  it('retorna cero cuando no hay movimientos', () => {
    expect(calcularSaldoMovimientos([])).toBe(0)
  })
})

describe('convertirPesosAIndicador', () => {
  it('divide el saldo por el valor del indicador', () => {
    expect(convertirPesosAIndicador(95000, 950)).toBe(100)
  })

  it('lanza RangeError si el valor del indicador no es positivo', () => {
    expect(() => convertirPesosAIndicador(1000, 0)).toThrow(RangeError)
    expect(() => convertirPesosAIndicador(1000, -1)).toThrow(RangeError)
  })
})
