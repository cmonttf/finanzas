import { CATEGORIAS_INICIALES, CLAVE_ALMACENAMIENTO_CATEGORIAS } from '@/config/constantes'
import type { Categoria } from '@/models/entidades/Categoria'
import type { RepositorioCategorias } from './RepositorioCategorias'

/** Implementación del repositorio de categorías sobre localStorage. */
export class RepositorioCategoriasLocal implements RepositorioCategorias {
  /**
   * Lee las categorías persistidas; la primera vez guarda las categorías iniciales (RN-04).
   *
   * @returns Lista de categorías registradas.
   */
  async obtenerTodasLasCategorias(): Promise<Categoria[]> {
    const contenidoAlmacenado = localStorage.getItem(CLAVE_ALMACENAMIENTO_CATEGORIAS)
    if (contenidoAlmacenado) {
      try {
        const categoriasLeidas: unknown = JSON.parse(contenidoAlmacenado)
        if (Array.isArray(categoriasLeidas)) return categoriasLeidas as Categoria[]
      } catch {
        // Datos corruptos: se restauran las categorías iniciales.
      }
    }
    const categoriasIniciales = CATEGORIAS_INICIALES.map((categoria) => ({ ...categoria }))
    this.persistirCategorias(categoriasIniciales)
    return categoriasIniciales
  }

  /**
   * Crea una categoría con identificador único y la persiste.
   *
   * @param nombreCategoria Nombre validado de la categoría.
   * @returns Categoría creada.
   */
  async guardarNuevaCategoria(nombreCategoria: string): Promise<Categoria> {
    const categoriaNueva: Categoria = {
      identificador: crypto.randomUUID(),
      nombre: nombreCategoria,
    }
    const categoriasExistentes = await this.obtenerTodasLasCategorias()
    this.persistirCategorias([...categoriasExistentes, categoriaNueva])
    return categoriaNueva
  }

  /**
   * Reemplaza una categoría existente por su versión modificada.
   *
   * @param categoriaModificada Categoría con los cambios aplicados.
   * @returns Promesa que se resuelve al persistir el cambio.
   */
  async actualizarCategoria(categoriaModificada: Categoria): Promise<void> {
    const categoriasExistentes = await this.obtenerTodasLasCategorias()
    this.persistirCategorias(
      categoriasExistentes.map((categoria) =>
        categoria.identificador === categoriaModificada.identificador
          ? categoriaModificada
          : categoria,
      ),
    )
  }

  /**
   * Elimina la categoría que coincide con el identificador recibido.
   *
   * @param identificador Identificador de la categoría.
   * @returns Promesa que se resuelve al persistir el cambio.
   */
  async eliminarCategoriaPorIdentificador(identificador: string): Promise<void> {
    const categoriasExistentes = await this.obtenerTodasLasCategorias()
    this.persistirCategorias(
      categoriasExistentes.filter((categoria) => categoria.identificador !== identificador),
    )
  }

  /**
   * Serializa y guarda la lista completa de categorías.
   *
   * @param categorias Lista de categorías a persistir.
   * @returns No retorna valor.
   */
  private persistirCategorias(categorias: Categoria[]): void {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_CATEGORIAS, JSON.stringify(categorias))
  }
}
