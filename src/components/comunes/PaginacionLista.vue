<script setup lang="ts">
/** Controles de paginación accesibles: anterior, indicador y siguiente. */
const props = defineProps<{ paginaActual: number; totalPaginas: number }>()
const emit = defineEmits<{ cambiarPagina: [numeroPagina: number] }>()
</script>

<template>
  <nav
    v-if="props.totalPaginas > 1"
    class="paginacion-lista"
    aria-label="Paginación de movimientos"
  >
    <button
      type="button"
      class="paginacion-lista__boton"
      :disabled="paginaActual <= 1"
      @click="emit('cambiarPagina', paginaActual - 1)"
    >
      <span aria-hidden="true">←</span> Anterior
    </button>
    <p class="paginacion-lista__estado" aria-live="polite">
      Página {{ paginaActual }} de {{ totalPaginas }}
    </p>
    <button
      type="button"
      class="paginacion-lista__boton"
      :disabled="paginaActual >= totalPaginas"
      @click="emit('cambiarPagina', paginaActual + 1)"
    >
      Siguiente <span aria-hidden="true">→</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.paginacion-lista {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $espaciado-md;
  margin-block-start: $espaciado-lg;

  &__boton {
    @include boton-secundario;
  }

  &__estado {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }
}
</style>
