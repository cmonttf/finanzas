import type { TipoMovimiento } from '@/config/constantes'

/** Movimiento financiero registrado por el usuario. Montos en CLP enteros (RN-02). */
export interface Movimiento {
  identificador: string
  tipo: TipoMovimiento
  monto: number
  fecha: string // Formato ISO AAAA-MM-DD
  identificadorCategoria: string
  descripcion: string
}

/** Datos necesarios para crear un movimiento, antes de asignarle identificador. */
export type DatosNuevoMovimiento = Omit<Movimiento, 'identificador'>
