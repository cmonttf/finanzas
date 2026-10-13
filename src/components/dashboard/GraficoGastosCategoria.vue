<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { GastoCategoriaGrafico } from '@/viewmodels/composables/useResumenDashboard'
import { useFormateadores } from '@/viewmodels/composables/useFormateadores'
import { useStorePreferencias } from '@/viewmodels/stores/storePreferencias'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

/** Barras horizontales de gastos por categoría del mes (RF-10). */
const props = defineProps<{ gastosPorCategoria: GastoCategoriaGrafico[]; nombreMes: string }>()

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
  return {
    labels: props.gastosPorCategoria.map((gasto) => gasto.nombreCategoria),
    datasets: [
      {
        label: 'Gastos',
        data: props.gastosPorCategoria.map((gasto) => gasto.total),
        backgroundColor: leerVariableCss('--grafico-serie-gastos'),
        borderRadius: 4,
        borderSkipped: 'start',
        maxBarThickness: 28,
      },
    ],
  }
})

const opcionesGrafico = computed<ChartOptions<'bar'>>(() => {
  void storePreferencias.temaActual
  const colorTexto = leerVariableCss('--grafico-texto')
  const colorGrilla = leerVariableCss('--grafico-grilla')
  return {
    indexAxis: 'y',
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (contexto) => ` ${formatearPesos(Number(contexto.raw))}` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: colorGrilla },
        border: { display: false },
        ticks: {
          color: colorTexto,
          maxTicksLimit: 5,
          maxRotation: 0,
          callback: (valor) => formatearPesos(Number(valor)),
        },
      },
      y: { grid: { display: false }, ticks: { color: colorTexto } },
    },
  }
})

const alturaGrafico = computed(() => `${Math.max(12, props.gastosPorCategoria.length * 3)}rem`)
const resumenAccesible = computed(() =>
  props.gastosPorCategoria
    .map((gasto) => `${gasto.nombreCategoria}: ${formatearPesos(gasto.total)}`)
    .join('; '),
)
</script>

<template>
  <section class="grafico-gastos-categoria" aria-labelledby="titulo-gastos-categoria">
    <h2 id="titulo-gastos-categoria">Gastos por categoría</h2>
    <p class="grafico-gastos-categoria__subtitulo">{{ nombreMes }}</p>

    <p v-if="gastosPorCategoria.length === 0" class="grafico-gastos-categoria__vacio">
      Aún no registras gastos este mes.
    </p>
    <template v-else>
      <div
        class="grafico-gastos-categoria__lienzo"
        :style="{ height: alturaGrafico }"
        role="img"
        :aria-label="`Gráfico de barras de gastos por categoría. ${resumenAccesible}`"
      >
        <Bar :data="datosGrafico" :options="opcionesGrafico" />
      </div>
      <details class="grafico-gastos-categoria__tabla">
        <summary>Ver datos en tabla</summary>
        <table>
          <caption class="visualmente-oculto">
            Gastos por categoría,
            {{
              nombreMes
            }}
          </caption>
          <thead>
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gasto in gastosPorCategoria" :key="gasto.nombreCategoria">
              <th scope="row">{{ gasto.nombreCategoria }}</th>
              <td class="numero-tabular">{{ formatearPesos(gasto.total) }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
  </section>
</template>

<style scoped lang="scss">
.grafico-gastos-categoria {
  @include tarjeta;
  min-width: 0;

  &__subtitulo,
  &__vacio {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }

  &__subtitulo::first-letter {
    text-transform: uppercase;
  }

  &__vacio {
    padding-block: $espaciado-lg;
  }

  &__lienzo {
    position: relative;
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
