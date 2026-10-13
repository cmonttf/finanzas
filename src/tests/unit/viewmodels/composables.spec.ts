import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import { useFiltrosMovimientos } from '@/viewmodels/composables/useFiltrosMovimientos'
import {
  formatearFechaCorta,
  formatearFechaLarga,
  formatearMontoIndicador,
  formatearPesos,
  formatearTipoMovimiento,
} from '@/viewmodels/composables/useFormateadores'
import { useFormularioIngreso } from '@/viewmodels/composables/useFormularioIngreso'
import { useFormularioMovimiento } from '@/viewmodels/composables/useFormularioMovimiento'
import { useGestionCategorias } from '@/viewmodels/composables/useGestionCategorias'
import { useIndicadoresEconomicos } from '@/viewmodels/composables/useIndicadoresEconomicos'
import { useResumenDashboard } from '@/viewmodels/composables/useResumenDashboard'
import {
  configurarRepositorioCategorias,
  useStoreCategorias,
} from '@/viewmodels/stores/storeCategorias'
import {
  configurarRepositorioMovimientos,
  useStoreMovimientos,
} from '@/viewmodels/stores/storeMovimientos'
import { useStoreSesion } from '@/viewmodels/stores/storeSesion'
import {
  crearMovimientoDePrueba,
  crearRepositorioCategoriasEnMemoria,
  crearRepositorioMovimientosEnMemoria,
} from '../fabricas'

const { obtenerIndicadoresSimulados, descargarArchivoSimulado } = vi.hoisted(() => ({
  obtenerIndicadoresSimulados: vi.fn<() => Promise<unknown>>(),
  descargarArchivoSimulado: vi.fn<(nombre: string, contenido: string) => void>(),
}))

vi.mock('@/models/servicios/servicioIndicadoresEconomicos', () => ({
  obtenerIndicadoresEconomicosDelDia: obtenerIndicadoresSimulados,
}))
vi.mock('@/models/servicios/servicioDescargaArchivos', () => ({
  descargarArchivoTexto: descargarArchivoSimulado,
}))

/**
 * Prepara Pinia y repositorios en memoria con los movimientos indicados.
 *
 * @param cantidadGastos Cantidad de gastos de prueba a generar.
 * @returns Promesa que se resuelve con los stores cargados.
 */
async function prepararStores(cantidadGastos = 3) {
  setActivePinia(createPinia())
  const movimientos = Array.from({ length: cantidadGastos }, (_, indice) =>
    crearMovimientoDePrueba({
      identificador: `gasto-${indice}`,
      fecha: `2026-10-${String((indice % 9) + 1).padStart(2, '0')}`,
      monto: 1000,
    }),
  )
  movimientos.push(
    crearMovimientoDePrueba({
      identificador: 'ingreso',
      tipo: TIPO_MOVIMIENTO.INGRESO,
      identificadorCategoria: 'sueldo',
      fecha: '2026-09-30',
      monto: 100000,
    }),
  )
  configurarRepositorioMovimientos(crearRepositorioMovimientosEnMemoria(movimientos))
  configurarRepositorioCategorias(crearRepositorioCategoriasEnMemoria())
  const storeMovimientos = useStoreMovimientos()
  const storeCategorias = useStoreCategorias()
  await Promise.all([
    storeMovimientos.cargarMovimientosRegistrados(),
    storeCategorias.cargarCategorias(),
  ])
  return { storeMovimientos, storeCategorias }
}

describe('useFormularioMovimiento', () => {
  beforeEach(() => prepararStores(0))

  it('no guarda si hay errores de validación', async () => {
    const formulario = useFormularioMovimiento()
    expect(await formulario.enviarFormularioMovimiento()).toBe(false)
    expect(formulario.erroresFormulario.value.monto).toBeDefined()
    expect(formulario.erroresFormulario.value.identificadorCategoria).toBeDefined()
    expect(formulario.esModoEdicion).toBe(false)
  })

  it('registra un movimiento válido y limpia el formulario', async () => {
    const storeMovimientos = useStoreMovimientos()
    const formulario = useFormularioMovimiento()
    Object.assign(formulario.datosFormulario, {
      monto: 2500,
      fecha: '2026-10-01',
      identificadorCategoria: 'alimentacion',
      descripcion: '  Pan  ',
    })
    expect(formulario.caracteresRestantesDescripcion.value).toBe(113)
    expect(await formulario.enviarFormularioMovimiento()).toBe(true)
    expect(storeMovimientos.movimientos.at(-1)?.descripcion).toBe('Pan')
    expect(formulario.datosFormulario.monto).toBe('')
  })

  it('edita un movimiento existente', async () => {
    const storeMovimientos = useStoreMovimientos()
    const movimientoIngreso = storeMovimientos.obtenerMovimientoPorIdentificador('ingreso')!
    const formulario = useFormularioMovimiento(movimientoIngreso)
    expect(formulario.esModoEdicion).toBe(true)
    formulario.datosFormulario.monto = 120000
    expect(await formulario.enviarFormularioMovimiento()).toBe(true)
    expect(storeMovimientos.obtenerMovimientoPorIdentificador('ingreso')?.monto).toBe(120000)
  })

  it('muestra un mensaje si el guardado falla', async () => {
    const storeMovimientos = useStoreMovimientos()
    vi.spyOn(storeMovimientos, 'registrarNuevoMovimiento').mockRejectedValueOnce(new Error('cuota'))
    const formulario = useFormularioMovimiento()
    Object.assign(formulario.datosFormulario, {
      monto: 100,
      fecha: '2026-10-01',
      identificadorCategoria: 'alimentacion',
    })
    expect(await formulario.enviarFormularioMovimiento()).toBe(false)
    expect(formulario.mensajeErrorGuardado.value).not.toBe('')
  })
})

describe('useFiltrosMovimientos', () => {
  beforeEach(() => {
    descargarArchivoSimulado.mockReset()
    return prepararStores(25)
  })

  it('pagina de a 10 movimientos y vuelve a la primera página al filtrar', async () => {
    const listado = useFiltrosMovimientos()
    expect(listado.totalPaginas.value).toBe(3)
    expect(listado.movimientosPaginaActual.value).toHaveLength(10)

    listado.irAPagina(99)
    expect(listado.paginaActual.value).toBe(3)
    expect(listado.movimientosPaginaActual.value).toHaveLength(6)

    listado.filtros.tipo = TIPO_MOVIMIENTO.INGRESO
    await nextTick()
    expect(listado.paginaActual.value).toBe(1)
    expect(listado.movimientosFiltrados.value).toHaveLength(1)
    expect(listado.hayFiltrosActivos.value).toBe(true)

    listado.limpiarFiltros()
    expect(listado.hayFiltrosActivos.value).toBe(false)
  })

  it('no muestra resultados si el rango de fechas es inválido', () => {
    const listado = useFiltrosMovimientos()
    listado.filtros.fechaDesde = '2026-10-31'
    listado.filtros.fechaHasta = '2026-10-01'
    expect(listado.hayRangoFechasInvalido.value).toBe(true)
    expect(listado.movimientosFiltrados.value).toEqual([])
  })

  it('exporta los movimientos filtrados a CSV', () => {
    const listado = useFiltrosMovimientos()
    listado.filtros.identificadorCategoria = 'sueldo'
    listado.exportarMovimientosFiltradosCsv()
    expect(descargarArchivoSimulado).toHaveBeenCalledOnce()
    const [nombreArchivo, contenido] = descargarArchivoSimulado.mock.calls[0] as [string, string]
    expect(nombreArchivo).toMatch(/^movimientos-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(contenido.split('\r\n')).toHaveLength(2)
    expect(contenido).toContain('Sueldo')
  })
})

describe('useIndicadoresEconomicos', () => {
  beforeEach(async () => {
    obtenerIndicadoresSimulados.mockReset()
    await prepararStores(0)
  })

  it('convierte el saldo con los indicadores del día (RN-03)', async () => {
    obtenerIndicadoresSimulados.mockResolvedValue([
      { codigo: 'dolar', nombre: 'Dólar', valorEnPesos: 1000, fecha: '2026-10-12' },
    ])
    const indicadores = useIndicadoresEconomicos()
    const carga = indicadores.cargarIndicadoresEconomicos()
    expect(indicadores.estaCargandoIndicadores.value).toBe(true)
    await carga
    expect(indicadores.estaCargandoIndicadores.value).toBe(false)
    expect(indicadores.indicadoresConSaldoConvertido.value[0]?.saldoConvertido).toBe(100)
  })

  it('expone un mensaje de error y permite reintentar', async () => {
    obtenerIndicadoresSimulados.mockRejectedValueOnce(new Error('sin conexión'))
    const indicadores = useIndicadoresEconomicos()
    await indicadores.cargarIndicadoresEconomicos()
    expect(indicadores.mensajeErrorIndicadores.value).not.toBe('')

    obtenerIndicadoresSimulados.mockResolvedValueOnce([])
    await indicadores.cargarIndicadoresEconomicos()
    expect(indicadores.mensajeErrorIndicadores.value).toBe('')
  })
})

describe('useResumenDashboard', () => {
  beforeEach(() => prepararStores(3))

  it('calcula los totales del mes en curso y los datos de gráficos (RF-09, RF-10)', () => {
    const resumen = useResumenDashboard(new Date(2026, 9, 12))
    expect(resumen.totalGastosMes.value).toBe(3000)
    expect(resumen.totalIngresosMes.value).toBe(0)
    expect(resumen.saldoActual.value).toBe(97000)
    expect(resumen.nombreMesActual.value).toBe('octubre de 2026')
    expect(resumen.gastosPorCategoriaMes.value).toEqual([
      { nombreCategoria: 'Alimentación', total: 3000 },
    ])
    expect(resumen.historialMensual.value).toHaveLength(6)
    expect(resumen.historialMensual.value[4]?.totalIngresos).toBe(100000)
    expect(resumen.hayMovimientosEnHistorial.value).toBe(true)
  })
})

describe('useGestionCategorias', () => {
  beforeEach(() => prepararStores(1))

  it('crea, renombra y elimina categorías mostrando mensajes', async () => {
    const gestion = useGestionCategorias()
    expect(
      gestion.categoriasConUso.value.find((c) => c.identificador === 'alimentacion')
        ?.cantidadMovimientos,
    ).toBe(1)

    gestion.nombreNuevaCategoria.value = ''
    expect(await gestion.crearCategoria()).toBe(false)
    expect(gestion.errorNuevaCategoria.value).not.toBe('')

    gestion.nombreNuevaCategoria.value = 'Mascotas'
    expect(await gestion.crearCategoria()).toBe(true)
    expect(gestion.mensajeEstado.value).toContain('Mascotas')

    const mascotas = gestion.categoriasConUso.value.find((c) => c.nombre === 'Mascotas')!
    gestion.comenzarEdicion(mascotas)
    gestion.nombreEnEdicion.value = 'Sueldo'
    expect(await gestion.guardarEdicion()).toBe(false)
    expect(gestion.errorEdicion.value).toContain('Ya existe')
    gestion.nombreEnEdicion.value = 'Mascota'
    expect(await gestion.guardarEdicion()).toBe(true)
    expect(gestion.identificadorEnEdicion.value).toBeNull()

    const alimentacion = gestion.categoriasConUso.value.find(
      (c) => c.identificador === 'alimentacion',
    )!
    expect(await gestion.eliminarCategoria(alimentacion)).toBe(false)
    expect(gestion.mensajeErrorEliminacion.value).toContain('movimientos asociados')

    expect(await gestion.eliminarCategoria({ ...mascotas, nombre: 'Mascota' })).toBe(true)
    gestion.cancelarEdicion()
    expect(await gestion.guardarEdicion()).toBe(false)
  })
})

describe('useFormularioIngreso', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('valida e inicia la sesión simulada', () => {
    const formulario = useFormularioIngreso()
    expect(formulario.enviarFormularioIngreso()).toBe(false)
    formulario.datosIngreso.nombreUsuario = 'camilo'
    formulario.datosIngreso.contrasena = 'secreta'
    expect(formulario.enviarFormularioIngreso()).toBe(true)
    expect(useStoreSesion().nombreUsuario).toBe('camilo')
    expect(formulario.datosIngreso.contrasena).toBe('')
  })
})

describe('useFormateadores', () => {
  it('formatea montos, fechas y tipos en español de Chile', () => {
    expect(formatearPesos(1234567)).toMatch(/\$\s?1\.234\.567/)
    expect(formatearMontoIndicador('uf', 1.5)).toBe('1,50 UF')
    expect(formatearMontoIndicador('dolar', 10)).toContain('10,00')
    expect(formatearFechaLarga('2026-10-12')).toBe('12 de octubre de 2026')
    expect(formatearFechaCorta('2026-10-12')).toBe('12-10-2026')
    expect(formatearTipoMovimiento(TIPO_MOVIMIENTO.INGRESO)).toBe('Ingreso')
  })
})
