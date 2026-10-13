<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * Envoltorio accesible de un campo: etiqueta, ayuda y error asociados por id.
 * Entrega por slot los atributos que el control debe enlazar.
 */
const props = defineProps<{ etiqueta: string; mensajeError?: string; ayuda?: string }>()

const idCampo = useId()
const idAyuda = `${idCampo}-ayuda`
const idError = `${idCampo}-error`

const atributosControl = computed(() => ({
  id: idCampo,
  'aria-invalid': props.mensajeError ? ('true' as const) : ('false' as const),
  'aria-describedby':
    [props.ayuda ? idAyuda : '', props.mensajeError ? idError : ''].filter(Boolean).join(' ') ||
    undefined,
}))
</script>

<template>
  <div class="campo-formulario">
    <label :for="idCampo" class="campo-formulario__etiqueta">{{ etiqueta }}</label>
    <slot :atributos="atributosControl" />
    <p v-if="ayuda" :id="idAyuda" class="campo-formulario__ayuda">{{ ayuda }}</p>
    <p v-if="mensajeError" :id="idError" class="campo-formulario__error">
      {{ mensajeError }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.campo-formulario {
  display: grid;
  gap: $espaciado-xs;

  &__etiqueta {
    font-weight: $peso-medio;
  }

  &__ayuda {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }

  &__error {
    color: var(--color-error);
    font-size: $tamano-texto-sm;
    font-weight: $peso-medio;
  }

  :slotted(input),
  :slotted(select),
  :slotted(textarea) {
    @include campo-entrada;
  }
}
</style>
