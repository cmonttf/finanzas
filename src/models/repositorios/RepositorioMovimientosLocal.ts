import { CLAVE_ALMACENAMIENTO_MOVIMIENTOS } from '@/config/constantes'
import type { DatosNuevoMovimiento, Movimiento } from '@/models/entidades/Movimiento'
import type { RepositorioMovimientos } from './RepositorioMovimientos'

/** Implementación del repositorio de movimientos sobre localStorage. */
export class RepositorioMovimientosLocal implements RepositorioMovimientos {
  /**
   * Lee todos los movimientos persistidos en el navegador.
   *
   * @returns Lista de movimientos; vacía si no hay datos o están corruptos.
   */
  async obtenerTodosLosMovimientos(): Promise<Movimiento[]> {
    const contenidoAlmacenado = localStorage.getItem(CLAVE_ALMACENAMIENTO_MOVIMIENTOS)
    if (!contenidoAlmacenado) return []
    try {
      const movimientosLeidos: unknown = JSON.parse(contenidoAlmacenado)
      return Array.isArray(movimientosLeidos) ? (movimientosLeidos as Movimiento[]) : []
    } catch {
      return []
    }
  }

  /**
   * Crea un movimiento con identificador único y lo persiste.
   *
   * @param datosMovimiento Datos del movimiento sin identificador.
   * @returns Movimiento guardado con su identificador asignado.
   */
  async guardarNuevoMovimiento(datosMovimiento: DatosNuevoMovimiento): Promise<Movimiento> {
    const movimientoNuevo: Movimiento = { identificador: crypto.randomUUID(), ...datosMovimiento }
    const movimientosExistentes = await this.obtenerTodosLosMovimientos()
    this.persistirMovimientos([...movimientosExistentes, movimientoNuevo])
    return movimientoNuevo
  }

  /**
   * Reemplaza un movimiento existente por su versión modificada.
   *
   * @param movimientoModificado Movimiento con los cambios aplicados.
   * @returns Promesa que se resuelve al persistir el cambio.
   */
  async actualizarMovimiento(movimientoModificado: Movimiento): Promise<void> {
    const movimientosExistentes = await this.obtenerTodosLosMovimientos()
    this.persistirMovimientos(
      movimientosExistentes.map((movimiento) =>
        movimiento.identificador === movimientoModificado.identificador
          ? movimientoModificado
          : movimiento,
      ),
    )
  }

  /**
   * Elimina el movimiento que coincide con el identificador recibido.
   *
   * @param identificador Identificador del movimiento a eliminar.
   * @returns Promesa que se resuelve al persistir el cambio.
   */
  async eliminarMovimientoPorIdentificador(identificador: string): Promise<void> {
    const movimientosExistentes = await this.obtenerTodosLosMovimientos()
    this.persistirMovimientos(
      movimientosExistentes.filter((movimiento) => movimiento.identificador !== identificador),
    )
  }

  /**
   * Serializa y guarda la lista completa de movimientos.
   *
   * @param movimientos Lista de movimientos a persistir.
   * @returns No retorna valor.
   */
  private persistirMovimientos(movimientos: Movimiento[]): void {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_MOVIMIENTOS, JSON.stringify(movimientos))
  }
}
