import type { DatosNuevoMovimiento, Movimiento } from '@/models/entidades/Movimiento'

/** Contrato de persistencia de movimientos, independiente del almacenamiento. */
export interface RepositorioMovimientos {
  obtenerTodosLosMovimientos(): Promise<Movimiento[]>
  guardarNuevoMovimiento(datosMovimiento: DatosNuevoMovimiento): Promise<Movimiento>
  actualizarMovimiento(movimiento: Movimiento): Promise<void>
  eliminarMovimientoPorIdentificador(identificador: string): Promise<void>
}
