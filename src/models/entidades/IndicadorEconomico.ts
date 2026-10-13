import type { CodigoIndicadorEconomico } from '@/config/constantes'

/** Valor diario de un indicador económico expresado en pesos chilenos. */
export interface IndicadorEconomico {
  codigo: CodigoIndicadorEconomico
  nombre: string
  valorEnPesos: number
  fecha: string
}
