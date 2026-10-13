<script setup lang="ts">
import { onMounted } from 'vue'
import EstadoCarga from '@/components/comunes/EstadoCarga.vue'
import { useFormateadores } from '@/viewmodels/composables/useFormateadores'
import { useIndicadoresEconomicos } from '@/viewmodels/composables/useIndicadoresEconomicos'

const {
  indicadoresConSaldoConvertido,
  estaCargandoIndicadores,
  mensajeErrorIndicadores,
  cargarIndicadoresEconomicos,
} = useIndicadoresEconomicos()
const { formatearPesos, formatearMontoIndicador, formatearFechaCorta } = useFormateadores()

onMounted(cargarIndicadoresEconomicos)
</script>

<template>
  <section class="panel-indicadores" aria-labelledby="titulo-indicadores">
    <h2 id="titulo-indicadores">Tu saldo en otras monedas</h2>
    <p class="panel-indicadores__fuente">Valores del día según mindicador.cl</p>

    <EstadoCarga
      :esta-cargando="estaCargandoIndicadores"
      :mensaje-error="mensajeErrorIndicadores"
      texto-carga="Consultando indicadores económicos…"
      @reintentar="cargarIndicadoresEconomicos"
    />

    <ul
      v-if="!estaCargandoIndicadores && !mensajeErrorIndicadores"
      class="panel-indicadores__lista"
      role="list"
    >
      <li
        v-for="indicador in indicadoresConSaldoConvertido"
        :key="indicador.codigo"
        class="panel-indicadores__item"
      >
        <h3 class="panel-indicadores__nombre">{{ indicador.nombre }}</h3>
        <p class="panel-indicadores__convertido numero-tabular">
          {{ formatearMontoIndicador(indicador.codigo, indicador.saldoConvertido) }}
        </p>
        <p class="panel-indicadores__valor numero-tabular">
          Valor: {{ formatearPesos(Math.round(indicador.valorEnPesos)) }} ·
          <time :datetime="indicador.fecha">{{
            formatearFechaCorta(indicador.fecha.slice(0, 10))
          }}</time>
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.panel-indicadores {
  @include tarjeta;

  &__fuente {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }

  &__lista {
    display: grid;
    gap: $espaciado-md;
    margin-block-start: $espaciado-md;

    @include desde-pantalla(tablet) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__item {
    padding: $espaciado-md;
    border: 1px solid var(--color-borde);
    border-radius: $radio-borde;
  }

  &__nombre {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
    font-weight: $peso-medio;
  }

  &__convertido {
    font-size: $tamano-texto-lg;
    font-weight: $peso-negrita;
    overflow-wrap: anywhere;
  }

  &__valor {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-xs;
  }
}
</style>
