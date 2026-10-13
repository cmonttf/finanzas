import axios from 'axios'
import { configuracionAplicacion } from '@/config/configuracionAplicacion'
import { CODIGOS_INDICADORES_ECONOMICOS } from '@/config/constantes'
import type { IndicadorEconomico } from '@/models/entidades/IndicadorEconomico'

/** Forma mínima de cada indicador en la respuesta de mindicador.cl. */
interface IndicadorRespuestaApi {
  nombre: string
  valor: number
  fecha: string
}

const clienteApiIndicadores = axios.create({
  baseURL: configuracionAplicacion.urlApiIndicadores,
  timeout: configuracionAplicacion.tiempoEsperaApiMs,
})

/**
 * Obtiene el valor del día del dólar, euro y UF desde mindicador.cl.
 *
 * @returns Lista de indicadores con código, nombre, valor en pesos y fecha.
 * @throws {Error} Cuando la API no responde o devuelve un formato inesperado.
 */
export async function obtenerIndicadoresEconomicosDelDia(): Promise<IndicadorEconomico[]> {
  const { data: respuestaIndicadores } =
    await clienteApiIndicadores.get<Record<string, IndicadorRespuestaApi | undefined>>('')
  return CODIGOS_INDICADORES_ECONOMICOS.map((codigoIndicador) => {
    const indicadorRecibido = respuestaIndicadores?.[codigoIndicador]
    if (!indicadorRecibido || typeof indicadorRecibido.valor !== 'number') {
      throw new Error(`La API no entregó el indicador ${codigoIndicador}.`)
    }
    return {
      codigo: codigoIndicador,
      nombre: indicadorRecibido.nombre,
      valorEnPesos: indicadorRecibido.valor,
      fecha: indicadorRecibido.fecha,
    }
  })
}
