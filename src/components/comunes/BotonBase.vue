<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

/** Botón reutilizable; si recibe `hacia`, se muestra como enlace de navegación. */
withDefaults(
  defineProps<{
    variante?: 'primario' | 'secundario' | 'peligro'
    tipo?: 'button' | 'submit'
    deshabilitado?: boolean
    hacia?: RouteLocationRaw
  }>(),
  { variante: 'primario', tipo: 'button', deshabilitado: false, hacia: undefined },
)
</script>

<template>
  <RouterLink v-if="hacia" :to="hacia" class="boton-base" :class="`boton-base--${variante}`">
    <slot />
  </RouterLink>
  <button
    v-else
    :type="tipo"
    class="boton-base"
    :class="`boton-base--${variante}`"
    :disabled="deshabilitado"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.boton-base {
  &--primario {
    @include boton-primario;
  }

  &--secundario {
    @include boton-secundario;
  }

  &--peligro {
    @include boton-peligro;
  }
}
</style>
