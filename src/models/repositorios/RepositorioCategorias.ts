import type { Categoria } from '@/models/entidades/Categoria'

/** Contrato de persistencia de categorías, independiente del almacenamiento. */
export interface RepositorioCategorias {
  obtenerTodasLasCategorias(): Promise<Categoria[]>
  guardarNuevaCategoria(nombreCategoria: string): Promise<Categoria>
  actualizarCategoria(categoria: Categoria): Promise<void>
  eliminarCategoriaPorIdentificador(identificador: string): Promise<void>
}
