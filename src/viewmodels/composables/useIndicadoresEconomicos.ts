import { computed, ref } from 'vue'
import type { IndicadorEconomico } from '@/models/entidades/IndicadorEconomico'
import { convertirPesosAIndicador } from '@/models/reglas/calculosFinancieros'
import { obtenerIndicadoresEconomicosDelDia } from '@/models/servicios/servicioIndicadoresEconomicos'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'

/** Indicador acompañado del saldo convertido a su unidad. */
export interface IndicadorConSaldoConvertido extends IndicadorEconomico {
  saldoConvertido: number
}

/**
 * Consulta dólar, euro y UF y convierte el saldo actual (RF-11, RN-03).
 *
 * @returns Indicadores, estado de carga y error, y el comando para cargar o reintentar.
 */
export function useIndicadoresEconomicos() {
  const storeMovimientos = useStoreMovimientos()

  const indicadoresEconomicos = ref<IndicadorEconomico[]>([])
  const estaCargandoIndicadores = ref(false)
  const mensajeErrorIndicadores = ref('')

  const indicadoresConSaldoConvertido = computed<IndicadorConSaldoConvertido[]>(() =>
    indicadoresEconomicos.value.map((indicador) => ({
      ...indicador,
      saldoConvertido: convertirPesosAIndicador(
        storeMovimientos.saldoActual,
        indicador.valorEnPesos,
      ),
    })),
  )

  /**
   * Obtiene los indicadores del día; también sirve como comando de reintento.
   *
   * @returns Promesa que se resuelve al terminar la consulta, con o sin éxito.
   */
  async function cargarIndicadoresEconomicos(): Promise<void> {
    estaCargandoIndicadores.value = true
    mensajeErrorIndicadores.value = ''
    try {
      indicadoresEconomicos.value = await obtenerIndicadoresEconomicosDelDia()
    } catch {
      indicadoresEconomicos.value = []
      mensajeErrorIndicadores.value =
        'No pudimos obtener los indicadores económicos. Revisa tu conexión e inténtalo nuevamente.'
    } finally {
      estaCargandoIndicadores.value = false
    }
  }

  return {
    indicadoresConSaldoConvertido,
    estaCargandoIndicadores,
    mensajeErrorIndicadores,
    cargarIndicadoresEconomicos,
  }
}
