import type { TipoMovimiento } from '@/config/constantes'

/** Criterios combinables para filtrar movimientos (RF-06). Un valor vacío no filtra. */
export interface FiltrosMovimientos {
  tipo: TipoMovimiento | ''
  identificadorCategoria: string
  fechaDesde: string
  fechaHasta: string
}
