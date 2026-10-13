import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { NOMBRE_CATEGORIA_DESCONOCIDA } from '@/config/constantes'
import type { Categoria } from '@/models/entidades/Categoria'
import { ErrorReglaNegocio } from '@/models/entidades/ErrorReglaNegocio'
import {
  categoriaTieneMovimientosAsociados,
  validarNombreCategoria,
} from '@/models/reglas/validacionesCategoria'
import type { RepositorioCategorias } from '@/models/repositorios/RepositorioCategorias'
import { RepositorioCategoriasLocal } from '@/models/repositorios/RepositorioCategoriasLocal'
import { useStoreMovimientos } from './storeMovimientos'

let repositorioCategorias: RepositorioCategorias = new RepositorioCategoriasLocal()

/**
 * Reemplaza el repositorio usado por el store. Pensado para pruebas o para la v2.0 con API.
 *
 * @param nuevoRepositorio Implementación del repositorio a utilizar.
 * @returns No retorna valor.
 */
export function configurarRepositorioCategorias(nuevoRepositorio: RepositorioCategorias): void {
  repositorioCategorias = nuevoRepositorio
}

export const useStoreCategorias = defineStore('categorias', () => {
  const categorias = ref<Categoria[]>([])
  const categoriasCargadas = ref(false)

  const categoriasOrdenadasPorNombre = computed(() =>
    [...categorias.value].sort((primera, segunda) =>
      primera.nombre.localeCompare(segunda.nombre, 'es'),
    ),
  )
  const nombresPorIdentificador = computed(
    () => new Map(categorias.value.map((categoria) => [categoria.identificador, categoria.nombre])),
  )

  /**
   * Traduce un identificador de categoría a su nombre visible.
   *
   * @param identificadorCategoria Identificador de la categoría.
   * @returns Nombre de la categoría o un texto genérico si no existe.
   */
  function obtenerNombreCategoria(identificadorCategoria: string): string {
    return nombresPorIdentificador.value.get(identificadorCategoria) ?? NOMBRE_CATEGORIA_DESCONOCIDA
  }

  /**
   * Carga las categorías desde el repositorio.
   *
   * @returns Promesa que se resuelve cuando las categorías quedan en el estado.
   */
  async function cargarCategorias(): Promise<void> {
    categorias.value = await repositorioCategorias.obtenerTodasLasCategorias()
    categoriasCargadas.value = true
  }

  /**
   * Crea una categoría después de validar su nombre.
   *
   * @param nombreCategoria Nombre ingresado.
   * @returns Categoría creada.
   * @throws {ErrorReglaNegocio} Si el nombre es inválido o está repetido.
   */
  async function crearCategoria(nombreCategoria: string): Promise<Categoria> {
    const mensajeError = validarNombreCategoria(nombreCategoria, categorias.value)
    if (mensajeError) throw new ErrorReglaNegocio(mensajeError)
    const categoriaCreada = await repositorioCategorias.guardarNuevaCategoria(
      nombreCategoria.trim(),
    )
    categorias.value.push(categoriaCreada)
    return categoriaCreada
  }

  /**
   * Cambia el nombre de una categoría existente.
   *
   * @param identificador Identificador de la categoría.
   * @param nuevoNombre Nombre nuevo.
   * @returns Promesa que se resuelve al persistir el cambio.
   * @throws {ErrorReglaNegocio} Si el nombre es inválido o está repetido.
   */
  async function renombrarCategoria(identificador: string, nuevoNombre: string): Promise<void> {
    const mensajeError = validarNombreCategoria(nuevoNombre, categorias.value, identificador)
    if (mensajeError) throw new ErrorReglaNegocio(mensajeError)
    const categoriaModificada: Categoria = { identificador, nombre: nuevoNombre.trim() }
    await repositorioCategorias.actualizarCategoria(categoriaModificada)
    categorias.value = categorias.value.map((categoria) =>
      categoria.identificador === identificador ? categoriaModificada : categoria,
    )
  }

  /**
   * Elimina una categoría sin movimientos asociados (RF-08).
   *
   * @param identificador Identificador de la categoría.
   * @returns Promesa que se resuelve al completar la eliminación.
   * @throws {ErrorReglaNegocio} Si la categoría tiene movimientos asociados.
   */
  async function eliminarCategoria(identificador: string): Promise<void> {
    const storeMovimientos = useStoreMovimientos()
    if (categoriaTieneMovimientosAsociados(identificador, storeMovimientos.movimientos)) {
      throw new ErrorReglaNegocio(
        'No puedes eliminar una categoría que tiene movimientos asociados.',
      )
    }
    await repositorioCategorias.eliminarCategoriaPorIdentificador(identificador)
    categorias.value = categorias.value.filter(
      (categoria) => categoria.identificador !== identificador,
    )
  }

  return {
    categorias,
    categoriasCargadas,
    categoriasOrdenadasPorNombre,
    obtenerNombreCategoria,
    cargarCategorias,
    crearCategoria,
    renombrarCategoria,
    eliminarCategoria,
  }
})
