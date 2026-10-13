import { LARGO_MAXIMO_NOMBRE_CATEGORIA } from '@/config/constantes'
import type { Categoria } from '@/models/entidades/Categoria'
import type { Movimiento } from '@/models/entidades/Movimiento'

/**
 * Valida el nombre de una categoría nueva o renombrada.
 *
 * @param nombreCategoria Nombre ingresado.
 * @param categoriasExistentes Categorías ya registradas.
 * @param identificadorExcluido Categoría que se está renombrando, para no compararla consigo misma.
 * @returns Mensaje de error o null si el nombre es válido.
 */
export function validarNombreCategoria(
  nombreCategoria: string,
  categoriasExistentes: Categoria[],
  identificadorExcluido?: string,
): string | null {
  const nombreNormalizado = nombreCategoria.trim()
  if (!nombreNormalizado) return 'Ingresa un nombre para la categoría.'
  if (nombreNormalizado.length > LARGO_MAXIMO_NOMBRE_CATEGORIA) {
    return `Máximo ${LARGO_MAXIMO_NOMBRE_CATEGORIA} caracteres.`
  }
  const existeDuplicado = categoriasExistentes.some(
    (categoria) =>
      categoria.identificador !== identificadorExcluido &&
      categoria.nombre.localeCompare(nombreNormalizado, 'es', { sensitivity: 'base' }) === 0,
  )
  return existeDuplicado ? 'Ya existe una categoría con ese nombre.' : null
}

/**
 * Indica si una categoría tiene movimientos asociados (RF-08).
 *
 * @param identificadorCategoria Categoría a revisar.
 * @param movimientos Movimientos registrados.
 * @returns true si al menos un movimiento usa la categoría.
 */
export function categoriaTieneMovimientosAsociados(
  identificadorCategoria: string,
  movimientos: Movimiento[],
): boolean {
  return movimientos.some(
    (movimiento) => movimiento.identificadorCategoria === identificadorCategoria,
  )
}
