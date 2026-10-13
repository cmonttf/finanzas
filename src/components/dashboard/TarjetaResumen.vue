<script setup lang="ts">
/** Tarjeta con una cifra destacada del dashboard. */
defineProps<{
  titulo: string
  valor: string
  detalle?: string
  variante?: 'neutra' | 'ingreso' | 'gasto'
}>()
</script>

<template>
  <article class="tarjeta-resumen">
    <h2 class="tarjeta-resumen__titulo">{{ titulo }}</h2>
    <p
      class="tarjeta-resumen__valor numero-tabular"
      :class="variante ? `tarjeta-resumen__valor--${variante}` : ''"
    >
      {{ valor }}
    </p>
    <p v-if="detalle" class="tarjeta-resumen__detalle">{{ detalle }}</p>
  </article>
</template>

<style scoped lang="scss">
.tarjeta-resumen {
  @include tarjeta;

  &__titulo {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
    font-weight: $peso-medio;
  }

  &__valor {
    margin-block-start: $espaciado-xs;
    font-size: $tamano-texto-xl;
    font-weight: $peso-negrita;
    line-height: 1.2;
    overflow-wrap: anywhere;

    &--ingreso {
      color: var(--color-ingreso);
    }

    &--gasto {
      color: var(--color-gasto);
    }
  }

  &__detalle {
    margin-block-start: $espaciado-xs;
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }
}
</style>
