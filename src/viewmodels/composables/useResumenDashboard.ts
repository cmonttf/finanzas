import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { configuracionAplicacion } from '@/config/configuracionAplicacion'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import {
  agruparGastosPorCategoria,
  calcularHistorialMensual,
  filtrarMovimientosDelMes,
} from '@/models/reglas/agrupacionesMovimientos'
import { calcularTotalPorTipoMovimiento } from '@/models/reglas/calculosFinancieros'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'

/** Gasto total de una categoría, listo para graficar. */
export interface GastoCategoriaGrafico {
  nombreCategoria: string
  total: number
}

/** Ingresos y gastos de un mes, listos para graficar. */
export interface MesHistorialGrafico {
  etiquetaMes: string
  totalIngresos: number
  totalGastos: number
}

/**
 * Expone los totales y datos de gráficos del dashboard (RF-09, RF-10).
 *
 * @param fechaReferencia Fecha que define el mes en curso (inyectable en pruebas).
 * @returns Saldo, totales del mes y series para los gráficos.
 */
export function useResumenDashboard(fechaReferencia: MaybeRefOrGetter<Date> = () => new Date()) {
  const storeMovimientos = useStoreMovimientos()
  const storeCategorias = useStoreCategorias()

  const movimientosDelMes = computed(() =>
    filtrarMovimientosDelMes(storeMovimientos.movimientos, toValue(fechaReferencia)),
  )
  const nombreMesActual = computed(() =>
    format(toValue(fechaReferencia), "MMMM 'de' yyyy", { locale: es }),
  )
  const saldoActual = computed(() => storeMovimientos.saldoActual)
  const totalIngresosMes = computed(() =>
    calcularTotalPorTipoMovimiento(movimientosDelMes.value, TIPO_MOVIMIENTO.INGRESO),
  )
  const totalGastosMes = computed(() =>
    calcularTotalPorTipoMovimiento(movimientosDelMes.value, TIPO_MOVIMIENTO.GASTO),
  )
  const gastosPorCategoriaMes = computed<GastoCategoriaGrafico[]>(() =>
    agruparGastosPorCategoria(movimientosDelMes.value).map((totalCategoria) => ({
      nombreCategoria: storeCategorias.obtenerNombreCategoria(
        totalCategoria.identificadorCategoria,
      ),
      total: totalCategoria.total,
    })),
  )
  const historialMensual = computed<MesHistorialGrafico[]>(() =>
    calcularHistorialMensual(
      storeMovimientos.movimientos,
      configuracionAplicacion.mesesHistorialGrafico,
      toValue(fechaReferencia),
    ).map((totalesMes) => ({
      etiquetaMes: format(parseISO(`${totalesMes.claveMes}-01`), 'MMM yyyy', { locale: es }),
      totalIngresos: totalesMes.totalIngresos,
      totalGastos: totalesMes.totalGastos,
    })),
  )
  const hayMovimientosEnHistorial = computed(() =>
    historialMensual.value.some((mes) => mes.totalIngresos > 0 || mes.totalGastos > 0),
  )

  return {
    nombreMesActual,
    saldoActual,
    totalIngresosMes,
    totalGastosMes,
    gastosPorCategoriaMes,
    historialMensual,
    hayMovimientosEnHistorial,
    mesesHistorial: configuracionAplicacion.mesesHistorialGrafico,
  }
}
