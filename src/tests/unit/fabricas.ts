import { TIPO_MOVIMIENTO } from '@/config/constantes'
import type { Categoria } from '@/models/entidades/Categoria'
import type { DatosNuevoMovimiento, Movimiento } from '@/models/entidades/Movimiento'
import type { RepositorioCategorias } from '@/models/repositorios/RepositorioCategorias'
import type { RepositorioMovimientos } from '@/models/repositorios/RepositorioMovimientos'

/**
 * Crea un movimiento de prueba con valores por defecto.
 *
 * @param datosParciales Campos que se desean sobrescribir.
 * @returns Movimiento completo para usar en las pruebas.
 */
export function crearMovimientoDePrueba(datosParciales: Partial<Movimiento> = {}): Movimiento {
  return {
    identificador: 'mov-1',
    tipo: TIPO_MOVIMIENTO.GASTO,
    monto: 1000,
    fecha: '2026-10-01',
    identificadorCategoria: 'alimentacion',
    descripcion: '',
    ...datosParciales,
  }
}

/**
 * Crea un repositorio de movimientos en memoria para aislar los stores.
 *
 * @param movimientosIniciales Movimientos con los que parte el repositorio.
 * @returns Repositorio en memoria.
 */
export function crearRepositorioMovimientosEnMemoria(
  movimientosIniciales: Movimiento[] = [],
): RepositorioMovimientos {
  let movimientos = [...movimientosIniciales]
  let contador = 0
  return {
    obtenerTodosLosMovimientos: async () => [...movimientos],
    guardarNuevoMovimiento: async (datosMovimiento: DatosNuevoMovimiento) => {
      contador += 1
      const movimientoNuevo = { identificador: `id-prueba-${contador}`, ...datosMovimiento }
      movimientos.push(movimientoNuevo)
      return movimientoNuevo
    },
    actualizarMovimiento: async (movimientoModificado) => {
      movimientos = movimientos.map((movimiento) =>
        movimiento.identificador === movimientoModificado.identificador
          ? movimientoModificado
          : movimiento,
      )
    },
    eliminarMovimientoPorIdentificador: async (identificador) => {
      movimientos = movimientos.filter((movimiento) => movimiento.identificador !== identificador)
    },
  }
}

/**
 * Crea un repositorio de categorías en memoria para aislar los stores.
 *
 * @param categoriasIniciales Categorías con las que parte el repositorio.
 * @returns Repositorio en memoria.
 */
export function crearRepositorioCategoriasEnMemoria(
  categoriasIniciales: Categoria[] = [
    { identificador: 'alimentacion', nombre: 'Alimentación' },
    { identificador: 'sueldo', nombre: 'Sueldo' },
  ],
): RepositorioCategorias {
  let categorias = [...categoriasIniciales]
  return {
    obtenerTodasLasCategorias: async () => [...categorias],
    guardarNuevaCategoria: async (nombre) => {
      const categoriaNueva = { identificador: `cat-${nombre}`, nombre }
      categorias.push(categoriaNueva)
      return categoriaNueva
    },
    actualizarCategoria: async (categoriaModificada) => {
      categorias = categorias.map((categoria) =>
        categoria.identificador === categoriaModificada.identificador
          ? categoriaModificada
          : categoria,
      )
    },
    eliminarCategoriaPorIdentificador: async (identificador) => {
      categorias = categorias.filter((categoria) => categoria.identificador !== identificador)
    },
  }
}
