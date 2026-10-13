import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { TEMA_VISUAL, TIPO_MOVIMIENTO } from '@/config/constantes'
import { ErrorReglaNegocio } from '@/models/entidades/ErrorReglaNegocio'
import {
  configurarRepositorioCategorias,
  useStoreCategorias,
} from '@/viewmodels/stores/storeCategorias'
import {
  configurarRepositorioMovimientos,
  useStoreMovimientos,
} from '@/viewmodels/stores/storeMovimientos'
import { useStorePreferencias } from '@/viewmodels/stores/storePreferencias'
import { useStoreSesion } from '@/viewmodels/stores/storeSesion'
import {
  crearMovimientoDePrueba,
  crearRepositorioCategoriasEnMemoria,
  crearRepositorioMovimientosEnMemoria,
} from '../fabricas'

describe('storeMovimientos', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    configurarRepositorioMovimientos(
      crearRepositorioMovimientosEnMemoria([
        crearMovimientoDePrueba({ identificador: 'antiguo', fecha: '2026-01-01', monto: 1000 }),
        crearMovimientoDePrueba({
          identificador: 'reciente',
          fecha: '2026-10-01',
          tipo: TIPO_MOVIMIENTO.INGRESO,
          monto: 5000,
        }),
      ]),
    )
  })

  it('carga los movimientos una sola vez y calcula totales', async () => {
    const storeMovimientos = useStoreMovimientos()
    await Promise.all([
      storeMovimientos.asegurarMovimientosCargados(),
      storeMovimientos.cargarMovimientosRegistrados(),
    ])
    expect(storeMovimientos.movimientosCargados).toBe(true)
    expect(storeMovimientos.estaCargandoMovimientos).toBe(false)
    expect(storeMovimientos.totalIngresos).toBe(5000)
    expect(storeMovimientos.totalGastos).toBe(1000)
    expect(storeMovimientos.saldoActual).toBe(4000)
    expect(storeMovimientos.movimientosOrdenadosPorFecha[0]?.identificador).toBe('reciente')
    expect(storeMovimientos.cantidadMovimientosPorCategoria.get('alimentacion')).toBe(2)
  })

  it('actualiza el saldo al registrar un ingreso', async () => {
    const storeMovimientos = useStoreMovimientos()
    await storeMovimientos.asegurarMovimientosCargados()
    await storeMovimientos.registrarNuevoMovimiento({
      tipo: TIPO_MOVIMIENTO.INGRESO,
      monto: 20000,
      fecha: '2026-10-02',
      identificadorCategoria: 'sueldo',
      descripcion: 'Pago',
    })
    expect(storeMovimientos.saldoActual).toBe(24000)
  })

  it('edita y elimina movimientos', async () => {
    const storeMovimientos = useStoreMovimientos()
    await storeMovimientos.asegurarMovimientosCargados()
    const movimientoOriginal = storeMovimientos.obtenerMovimientoPorIdentificador('antiguo')!
    await storeMovimientos.actualizarMovimientoExistente({ ...movimientoOriginal, monto: 3000 })
    expect(storeMovimientos.totalGastos).toBe(3000)

    await storeMovimientos.eliminarMovimiento('antiguo')
    expect(storeMovimientos.obtenerMovimientoPorIdentificador('antiguo')).toBeUndefined()
    expect(storeMovimientos.saldoActual).toBe(5000)
  })
})

describe('storeCategorias', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    configurarRepositorioCategorias(crearRepositorioCategoriasEnMemoria())
    configurarRepositorioMovimientos(
      crearRepositorioMovimientosEnMemoria([
        crearMovimientoDePrueba({ identificadorCategoria: 'alimentacion' }),
      ]),
    )
  })

  it('carga, ordena y traduce nombres de categorías', async () => {
    const storeCategorias = useStoreCategorias()
    await storeCategorias.cargarCategorias()
    expect(storeCategorias.categoriasCargadas).toBe(true)
    expect(storeCategorias.obtenerNombreCategoria('sueldo')).toBe('Sueldo')
    expect(storeCategorias.obtenerNombreCategoria('inexistente')).toBe('Sin categoría')
  })

  it('crea y renombra categorías validando duplicados', async () => {
    const storeCategorias = useStoreCategorias()
    await storeCategorias.cargarCategorias()
    const categoriaCreada = await storeCategorias.crearCategoria('  Mascotas ')
    expect(categoriaCreada.nombre).toBe('Mascotas')
    await expect(storeCategorias.crearCategoria('mascotas')).rejects.toBeInstanceOf(
      ErrorReglaNegocio,
    )

    await storeCategorias.renombrarCategoria(categoriaCreada.identificador, 'Mascota')
    expect(storeCategorias.obtenerNombreCategoria(categoriaCreada.identificador)).toBe('Mascota')
    await expect(
      storeCategorias.renombrarCategoria(categoriaCreada.identificador, 'Sueldo'),
    ).rejects.toThrow('Ya existe')
    expect(
      storeCategorias.categoriasOrdenadasPorNombre.map((categoria) => categoria.nombre),
    ).toEqual(['Alimentación', 'Mascota', 'Sueldo'])
  })

  it('no elimina categorías con movimientos asociados (RF-08)', async () => {
    const storeMovimientos = useStoreMovimientos()
    const storeCategorias = useStoreCategorias()
    await Promise.all([
      storeMovimientos.cargarMovimientosRegistrados(),
      storeCategorias.cargarCategorias(),
    ])

    await expect(storeCategorias.eliminarCategoria('alimentacion')).rejects.toThrow(
      'movimientos asociados',
    )
    await storeCategorias.eliminarCategoria('sueldo')
    expect(storeCategorias.categorias.map((categoria) => categoria.identificador)).toEqual([
      'alimentacion',
    ])
  })
})

describe('storePreferencias', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('alterna el tema, lo aplica al documento y lo conserva (RF-13)', () => {
    const storePreferencias = useStorePreferencias()
    expect(storePreferencias.temaActual).toBe(TEMA_VISUAL.CLARO)
    storePreferencias.alternarTema()
    expect(storePreferencias.esTemaOscuro).toBe(true)
    expect(document.documentElement.dataset.tema).toBe(TEMA_VISUAL.OSCURO)

    setActivePinia(createPinia())
    expect(useStorePreferencias().temaActual).toBe(TEMA_VISUAL.OSCURO)
  })
})

describe('storeSesion', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('inicia y cierra la sesión simulada', () => {
    const storeSesion = useStoreSesion()
    expect(storeSesion.tieneSesionActiva).toBe(false)
    storeSesion.iniciarSesion(' camilo ')
    expect(storeSesion.nombreUsuario).toBe('camilo')

    setActivePinia(createPinia())
    const storeSesionRecargado = useStoreSesion()
    expect(storeSesionRecargado.tieneSesionActiva).toBe(true)
    storeSesionRecargado.cerrarSesion()
    expect(storeSesionRecargado.tieneSesionActiva).toBe(false)
  })
})
