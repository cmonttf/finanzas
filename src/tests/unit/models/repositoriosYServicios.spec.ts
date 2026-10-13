import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CATEGORIAS_INICIALES,
  CLAVE_ALMACENAMIENTO_CATEGORIAS,
  CLAVE_ALMACENAMIENTO_MOVIMIENTOS,
  TEMA_VISUAL,
  TIPO_MOVIMIENTO,
} from '@/config/constantes'
import { RepositorioCategoriasLocal } from '@/models/repositorios/RepositorioCategoriasLocal'
import { RepositorioMovimientosLocal } from '@/models/repositorios/RepositorioMovimientosLocal'
import { RepositorioPreferenciasLocal } from '@/models/repositorios/RepositorioPreferenciasLocal'

const { obtenerRespuestaSimulada } = vi.hoisted(() => ({
  obtenerRespuestaSimulada: vi.fn<() => Promise<unknown>>(),
}))

vi.mock('axios', () => ({
  default: { create: () => ({ get: obtenerRespuestaSimulada }) },
}))

describe('RepositorioMovimientosLocal', () => {
  beforeEach(() => localStorage.clear())

  it('guarda, actualiza y elimina movimientos en localStorage', async () => {
    const repositorio = new RepositorioMovimientosLocal()
    const movimientoGuardado = await repositorio.guardarNuevoMovimiento({
      tipo: TIPO_MOVIMIENTO.INGRESO,
      monto: 1000,
      fecha: '2026-10-01',
      identificadorCategoria: 'sueldo',
      descripcion: 'Pago',
    })
    expect(movimientoGuardado.identificador).toBeTruthy()
    expect(await repositorio.obtenerTodosLosMovimientos()).toHaveLength(1)

    await repositorio.actualizarMovimiento({ ...movimientoGuardado, monto: 2000 })
    expect((await repositorio.obtenerTodosLosMovimientos())[0]?.monto).toBe(2000)

    await repositorio.eliminarMovimientoPorIdentificador(movimientoGuardado.identificador)
    expect(await repositorio.obtenerTodosLosMovimientos()).toEqual([])
  })

  it('retorna una lista vacía si los datos están corruptos', async () => {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_MOVIMIENTOS, '{no es json')
    expect(await new RepositorioMovimientosLocal().obtenerTodosLosMovimientos()).toEqual([])
    localStorage.setItem(CLAVE_ALMACENAMIENTO_MOVIMIENTOS, '{"a":1}')
    expect(await new RepositorioMovimientosLocal().obtenerTodosLosMovimientos()).toEqual([])
  })
})

describe('RepositorioCategoriasLocal', () => {
  beforeEach(() => localStorage.clear())

  it('crea las categorías iniciales la primera vez (RN-04)', async () => {
    const categorias = await new RepositorioCategoriasLocal().obtenerTodasLasCategorias()
    expect(categorias.map((categoria) => categoria.nombre)).toEqual(
      CATEGORIAS_INICIALES.map((categoria) => categoria.nombre),
    )
    expect(localStorage.getItem(CLAVE_ALMACENAMIENTO_CATEGORIAS)).not.toBeNull()
  })

  it('crea, renombra y elimina categorías', async () => {
    const repositorio = new RepositorioCategoriasLocal()
    const categoriaNueva = await repositorio.guardarNuevaCategoria('Mascotas')
    await repositorio.actualizarCategoria({ ...categoriaNueva, nombre: 'Mascota' })
    let categorias = await repositorio.obtenerTodasLasCategorias()
    expect(
      categorias.find((categoria) => categoria.identificador === categoriaNueva.identificador)
        ?.nombre,
    ).toBe('Mascota')

    await repositorio.eliminarCategoriaPorIdentificador(categoriaNueva.identificador)
    categorias = await repositorio.obtenerTodasLasCategorias()
    expect(categorias).toHaveLength(CATEGORIAS_INICIALES.length)
  })

  it('restaura las categorías iniciales si los datos están corruptos', async () => {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_CATEGORIAS, 'corrupto')
    expect(await new RepositorioCategoriasLocal().obtenerTodasLasCategorias()).toHaveLength(
      CATEGORIAS_INICIALES.length,
    )
  })
})

describe('RepositorioPreferenciasLocal', () => {
  beforeEach(() => localStorage.clear())

  it('guarda el tema y la sesión', () => {
    const repositorio = new RepositorioPreferenciasLocal()
    expect(repositorio.obtenerTemaGuardado()).toBeNull()
    repositorio.guardarTema(TEMA_VISUAL.OSCURO)
    expect(repositorio.obtenerTemaGuardado()).toBe(TEMA_VISUAL.OSCURO)

    repositorio.guardarUsuarioSesion('camilo')
    expect(repositorio.obtenerUsuarioSesion()).toBe('camilo')
    repositorio.eliminarUsuarioSesion()
    expect(repositorio.obtenerUsuarioSesion()).toBeNull()
  })

  it('ignora temas inválidos', () => {
    localStorage.setItem('mis-finanzas:tema', 'morado')
    expect(new RepositorioPreferenciasLocal().obtenerTemaGuardado()).toBeNull()
  })
})

describe('servicioIndicadoresEconomicos', () => {
  beforeEach(() => obtenerRespuestaSimulada.mockReset())

  it('transforma la respuesta de mindicador.cl', async () => {
    const { obtenerIndicadoresEconomicosDelDia } =
      await import('@/models/servicios/servicioIndicadoresEconomicos')
    obtenerRespuestaSimulada.mockResolvedValue({
      data: {
        dolar: { nombre: 'Dólar observado', valor: 950.5, fecha: '2026-10-12T03:00:00.000Z' },
        euro: { nombre: 'Euro', valor: 1030, fecha: '2026-10-12T03:00:00.000Z' },
        uf: { nombre: 'Unidad de fomento (UF)', valor: 39500, fecha: '2026-10-12T03:00:00.000Z' },
      },
    })
    const indicadores = await obtenerIndicadoresEconomicosDelDia()
    expect(indicadores.map((indicador) => indicador.codigo)).toEqual(['dolar', 'euro', 'uf'])
    expect(indicadores[0]?.valorEnPesos).toBe(950.5)
    expect(axios).toBeDefined()
  })

  it('lanza un error si falta un indicador', async () => {
    const { obtenerIndicadoresEconomicosDelDia } =
      await import('@/models/servicios/servicioIndicadoresEconomicos')
    obtenerRespuestaSimulada.mockResolvedValue({
      data: { dolar: { nombre: 'Dólar', valor: 1, fecha: '' } },
    })
    await expect(obtenerIndicadoresEconomicosDelDia()).rejects.toThrow('euro')
  })
})
