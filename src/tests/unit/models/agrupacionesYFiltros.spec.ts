import { describe, expect, it } from 'vitest'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import {
  agruparGastosPorCategoria,
  calcularHistorialMensual,
  contarMovimientosPorCategoria,
  filtrarMovimientosDelMes,
} from '@/models/reglas/agrupacionesMovimientos'
import { escaparCeldaCsv, generarCsvMovimientos } from '@/models/reglas/exportacionCsv'
import {
  calcularTotalPaginas,
  filtrarMovimientos,
  obtenerPagina,
  ordenarMovimientosPorFechaDescendente,
  tieneRangoFechasInvalido,
} from '@/models/reglas/filtrosMovimientos'
import { crearMovimientoDePrueba } from '../fabricas'

const movimientosDePrueba = [
  crearMovimientoDePrueba({ identificador: 'a', fecha: '2026-10-05', monto: 3000 }),
  crearMovimientoDePrueba({
    identificador: 'b',
    fecha: '2026-10-10',
    monto: 7000,
    identificadorCategoria: 'transporte',
  }),
  crearMovimientoDePrueba({
    identificador: 'c',
    fecha: '2026-09-20',
    tipo: TIPO_MOVIMIENTO.INGRESO,
    monto: 500000,
    identificadorCategoria: 'sueldo',
  }),
  crearMovimientoDePrueba({ identificador: 'd', fecha: '2026-05-01', monto: 1000 }),
]
const filtrosVacios = {
  tipo: '' as const,
  identificadorCategoria: '',
  fechaDesde: '',
  fechaHasta: '',
}

describe('agrupaciones de movimientos', () => {
  it('filtra los movimientos del mes de referencia', () => {
    const delMes = filtrarMovimientosDelMes(movimientosDePrueba, new Date(2026, 9, 12))
    expect(delMes.map((movimiento) => movimiento.identificador)).toEqual(['a', 'b'])
  })

  it('agrupa gastos por categoría ordenados de mayor a menor e ignora ingresos', () => {
    expect(agruparGastosPorCategoria(movimientosDePrueba)).toEqual([
      { identificadorCategoria: 'transporte', total: 7000 },
      { identificadorCategoria: 'alimentacion', total: 4000 },
    ])
  })

  it('genera el historial de los últimos meses incluyendo meses vacíos', () => {
    const historial = calcularHistorialMensual(movimientosDePrueba, 6, new Date(2026, 9, 12))
    expect(historial.map((mes) => mes.claveMes)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ])
    expect(historial[0]).toEqual({ claveMes: '2026-05', totalIngresos: 0, totalGastos: 1000 })
    expect(historial[4]?.totalIngresos).toBe(500000)
    expect(historial[5]?.totalGastos).toBe(10000)
  })

  it('cuenta movimientos por categoría', () => {
    const conteo = contarMovimientosPorCategoria(movimientosDePrueba)
    expect(conteo.get('alimentacion')).toBe(2)
    expect(conteo.get('sueldo')).toBe(1)
  })
})

describe('filtros y paginación', () => {
  it('ordena por fecha descendente sin mutar la lista original', () => {
    const ordenados = ordenarMovimientosPorFechaDescendente(movimientosDePrueba)
    expect(ordenados.map((movimiento) => movimiento.identificador)).toEqual(['b', 'a', 'c', 'd'])
    expect(movimientosDePrueba[0]?.identificador).toBe('a')
  })

  it('sin criterios no filtra nada', () => {
    expect(filtrarMovimientos(movimientosDePrueba, filtrosVacios)).toHaveLength(4)
  })

  it('combina tipo, categoría y rango de fechas', () => {
    const resultado = filtrarMovimientos(movimientosDePrueba, {
      tipo: TIPO_MOVIMIENTO.GASTO,
      identificadorCategoria: 'alimentacion',
      fechaDesde: '2026-10-01',
      fechaHasta: '2026-10-31',
    })
    expect(resultado.map((movimiento) => movimiento.identificador)).toEqual(['a'])
  })

  it('detecta rangos de fechas invertidos', () => {
    expect(
      tieneRangoFechasInvalido({
        ...filtrosVacios,
        fechaDesde: '2026-10-10',
        fechaHasta: '2026-10-01',
      }),
    ).toBe(true)
    expect(tieneRangoFechasInvalido({ ...filtrosVacios, fechaDesde: '2026-10-10' })).toBe(false)
  })

  it('calcula páginas y obtiene la página solicitada', () => {
    const numeros = Array.from({ length: 23 }, (_, indice) => indice + 1)
    expect(calcularTotalPaginas(23, 10)).toBe(3)
    expect(calcularTotalPaginas(0, 10)).toBe(1)
    expect(obtenerPagina(numeros, 3, 10)).toEqual([21, 22, 23])
  })
})

describe('exportación CSV', () => {
  it('genera encabezados y una fila por movimiento', () => {
    const csv = generarCsvMovimientos(movimientosDePrueba.slice(0, 2), (id) => `Cat ${id}`)
    const filas = csv.split('\r\n')
    expect(filas).toHaveLength(3)
    expect(filas[0]).toContain('"Fecha"')
    expect(filas[1]).toBe('"2026-10-05";"Gasto";"Cat alimentacion";"";3000')
  })

  it('escapa comillas y neutraliza fórmulas', () => {
    expect(escaparCeldaCsv('Dice "hola"')).toBe('"Dice ""hola"""')
    expect(escaparCeldaCsv('=SUMA(A1)')).toBe(`"'=SUMA(A1)"`)
  })
})
