<script setup lang="ts">
/** Muestra un indicador de carga o un error con botón de reintento. */
import BotonBase from './BotonBase.vue'

defineProps<{ estaCargando: boolean; mensajeError?: string; textoCarga?: string }>()
const emit = defineEmits<{ reintentar: [] }>()
</script>

<template>
  <div v-if="estaCargando" class="estado-carga" role="status">
    <span class="estado-carga__indicador" aria-hidden="true"></span>
    <span>{{ textoCarga ?? 'Cargando…' }}</span>
  </div>
  <div v-else-if="mensajeError" class="estado-carga estado-carga--error" role="alert">
    <p>{{ mensajeError }}</p>
    <BotonBase variante="secundario" @click="emit('reintentar')">Reintentar</BotonBase>
  </div>
</template>

<style scoped lang="scss">
.estado-carga {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $espaciado-md;
  padding: $espaciado-md 0;
  color: var(--color-texto-secundario);

  &--error {
    padding: $espaciado-md;
    border: 1px solid var(--color-error);
    border-radius: $radio-borde;
    background: var(--color-fondo-error);
    color: var(--color-texto);
  }

  &__indicador {
    width: 1.25rem;
    height: 1.25rem;
    border: 3px solid var(--color-borde);
    border-top-color: var(--color-primario);
    border-radius: 50%;
    animation: girar 0.8s linear infinite;
  }
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
