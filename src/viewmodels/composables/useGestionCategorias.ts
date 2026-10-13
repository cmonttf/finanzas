import { computed, ref } from 'vue'
import { LARGO_MAXIMO_NOMBRE_CATEGORIA } from '@/config/constantes'
import { ErrorReglaNegocio } from '@/models/entidades/ErrorReglaNegocio'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'

/** Categoría con la cantidad de movimientos que la usan. */
export interface CategoriaConUso {
  identificador: string
  nombre: string
  cantidadMovimientos: number
}

/**
 * Traduce un error a un mensaje visible para el usuario.
 *
 * @param error Error capturado.
 * @returns Mensaje de la regla de negocio o uno genérico.
 */
function obtenerMensajeError(error: unknown): string {
  return error instanceof ErrorReglaNegocio
    ? error.message
    : 'Ocurrió un error inesperado. Inténtalo nuevamente.'
}

/**
 * Gestiona la creación, renombrado y eliminación de categorías (RF-08).
 *
 * @returns Categorías con su uso, estado de los formularios y comandos.
 */
export function useGestionCategorias() {
  const storeCategorias = useStoreCategorias()
  const storeMovimientos = useStoreMovimientos()

  const nombreNuevaCategoria = ref('')
  const errorNuevaCategoria = ref('')
  const identificadorEnEdicion = ref<string | null>(null)
  const nombreEnEdicion = ref('')
  const errorEdicion = ref('')
  const mensajeErrorEliminacion = ref('')
  const mensajeEstado = ref('')

  const categoriasConUso = computed<CategoriaConUso[]>(() =>
    storeCategorias.categoriasOrdenadasPorNombre.map((categoria) => ({
      ...categoria,
      cantidadMovimientos:
        storeMovimientos.cantidadMovimientosPorCategoria.get(categoria.identificador) ?? 0,
    })),
  )

  /**
   * Crea la categoría escrita en el formulario.
   *
   * @returns true si se creó; false si hubo un error.
   */
  async function crearCategoria(): Promise<boolean> {
    errorNuevaCategoria.value = ''
    try {
      const categoriaCreada = await storeCategorias.crearCategoria(nombreNuevaCategoria.value)
      mensajeEstado.value = `Categoría «${categoriaCreada.nombre}» creada.`
      nombreNuevaCategoria.value = ''
      return true
    } catch (error) {
      errorNuevaCategoria.value = obtenerMensajeError(error)
      return false
    }
  }

  /**
   * Activa la edición en línea de una categoría.
   *
   * @param categoria Categoría a renombrar.
   * @returns No retorna valor.
   */
  function comenzarEdicion(categoria: CategoriaConUso): void {
    identificadorEnEdicion.value = categoria.identificador
    nombreEnEdicion.value = categoria.nombre
    errorEdicion.value = ''
  }

  /**
   * Cancela la edición en curso.
   *
   * @returns No retorna valor.
   */
  function cancelarEdicion(): void {
    identificadorEnEdicion.value = null
    nombreEnEdicion.value = ''
    errorEdicion.value = ''
  }

  /**
   * Guarda el nuevo nombre de la categoría en edición.
   *
   * @returns true si se guardó; false si hubo un error.
   */
  async function guardarEdicion(): Promise<boolean> {
    if (!identificadorEnEdicion.value) return false
    errorEdicion.value = ''
    try {
      await storeCategorias.renombrarCategoria(identificadorEnEdicion.value, nombreEnEdicion.value)
      mensajeEstado.value = `Categoría renombrada a «${nombreEnEdicion.value.trim()}».`
      cancelarEdicion()
      return true
    } catch (error) {
      errorEdicion.value = obtenerMensajeError(error)
      return false
    }
  }

  /**
   * Elimina una categoría sin movimientos asociados.
   *
   * @param categoria Categoría a eliminar.
   * @returns true si se eliminó; false si hubo un error.
   */
  async function eliminarCategoria(categoria: CategoriaConUso): Promise<boolean> {
    mensajeErrorEliminacion.value = ''
    try {
      await storeCategorias.eliminarCategoria(categoria.identificador)
      mensajeEstado.value = `Categoría «${categoria.nombre}» eliminada.`
      return true
    } catch (error) {
      mensajeErrorEliminacion.value = obtenerMensajeError(error)
      return false
    }
  }

  return {
    categoriasConUso,
    nombreNuevaCategoria,
    errorNuevaCategoria,
    identificadorEnEdicion,
    nombreEnEdicion,
    errorEdicion,
    mensajeErrorEliminacion,
    mensajeEstado,
    largoMaximoNombre: LARGO_MAXIMO_NOMBRE_CATEGORIA,
    crearCategoria,
    comenzarEdicion,
    cancelarEdicion,
    guardarEdicion,
    eliminarCategoria,
  }
}
