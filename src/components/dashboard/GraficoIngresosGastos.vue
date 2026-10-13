<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { MesHistorialGrafico } from '@/viewmodels/composables/useResumenDashboard'
import { useFormateadores } from '@/viewmodels/composables/useFormateadores'
import { useStorePreferencias } from '@/viewmodels/stores/storePreferencias'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

/** Barras agrupadas de ingresos y gastos de los últimos meses (RF-10). */
const props = defineProps<{
  historialMensual: MesHistorialGrafico[]
  cantidadMeses: number
  hayMovimientos: boolean
}>()

const storePreferencias = useStorePreferencias()
const { formatearPesos } = useFormateadores()

/**
 * Lee una variable CSS del tema actual.
 *
 * @param nombreVariable Nombre de la variable, con guiones.
 * @returns Valor de la variable.
 */
function leerVariableCss(nombreVariable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(nombreVariable).trim()
}

const datosGrafico = computed<ChartData<'bar'>>(() => {
  void storePreferencias.temaActual // Recalcula colores al cambiar de tema.
  const opcionesBarra = { borderRadius: 4, borderSkipped: 'start' as const, maxBarThickness: 32 }
  return {
    labels: props.historialMensual.map((mes) => mes.etiquetaMes),
    datasets: [
      {
        ...opcionesBarra,
        label: 'Ingresos',
        data: props.historialMensual.map((mes) => mes.totalIngresos),
        backgroundColor: leerVariableCss('--grafico-serie-ingresos'),
      },
      {
        ...opcionesBarra,
        label: 'Gastos',
        data: props.historialMensual.map((mes) => mes.totalGastos),
        backgroundColor: leerVariableCss('--grafico-serie-gastos'),
      },
    ],
  }
})

const opcionesGrafico = computed<ChartOptions<'bar'>>(() => {
  void storePreferencias.temaActual
  const colorTexto = leerVariableCss('--grafico-texto')
  const colorGrilla = leerVariableCss('--grafico-grilla')
  return {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          color: colorTexto,
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: true,
          borderRadius: 2,
        },
      },
      tooltip: {
        callbacks: {
          label: (contexto) =>
            ` ${contexto.dataset.label}: ${formatearPesos(Number(contexto.raw))}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: colorTexto } },
      y: {
        beginAtZero: true,
        grid: { color: colorGrilla },
        border: { display: false },
        ticks: { color: colorTexto, callback: (valor) => formatearPesos(Number(valor)) },
      },
    },
  }
})
</script>

<template>
  <section class="grafico-ingresos-gastos" aria-labelledby="titulo-ingresos-gastos">
    <h2 id="titulo-ingresos-gastos">Ingresos vs. gastos</h2>
    <p class="grafico-ingresos-gastos__subtitulo">Últimos {{ cantidadMeses }} meses</p>

    <p v-if="!hayMovimientos" class="grafico-ingresos-gastos__vacio">
      Registra movimientos para ver tu evolución mensual.
    </p>
    <template v-else>
      <div
        class="grafico-ingresos-gastos__lienzo"
        role="img"
        :aria-label="`Gráfico de barras de ingresos y gastos de los últimos ${cantidadMeses} meses. El detalle está en la tabla siguiente.`"
      >
        <Bar :data="datosGrafico" :options="opcionesGrafico" />
      </div>
      <details class="grafico-ingresos-gastos__tabla">
        <summary>Ver datos en tabla</summary>
        <table>
          <caption class="visualmente-oculto">
            Ingresos y gastos por mes
          </caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Ingresos</th>
              <th scope="col">Gastos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mes in historialMensual" :key="mes.etiquetaMes">
              <th scope="row">{{ mes.etiquetaMes }}</th>
              <td class="numero-tabular">{{ formatearPesos(mes.totalIngresos) }}</td>
              <td class="numero-tabular">{{ formatearPesos(mes.totalGastos) }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
  </section>
</template>

<style scoped lang="scss">
.grafico-ingresos-gastos {
  @include tarjeta;
  min-width: 0;

  &__subtitulo,
  &__vacio {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }

  &__vacio {
    padding-block: $espaciado-lg;
  }

  &__lienzo {
    position: relative;
    height: 18rem;
    margin-block-start: $espaciado-md;
  }

  &__tabla {
    margin-block-start: $espaciado-md;
    font-size: $tamano-texto-sm;

    summary {
      cursor: pointer;
      color: var(--color-enlace);
      @include foco-visible;
    }

    table {
      width: 100%;
      margin-block-start: $espaciado-sm;
      border-collapse: collapse;
    }

    th,
    td {
      padding: $espaciado-xs $espaciado-sm;
      border-bottom: 1px solid var(--color-borde);
      text-align: start;
    }

    td {
      text-align: end;
    }
  }
}
</style>
