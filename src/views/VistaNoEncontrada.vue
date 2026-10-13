<script setup lang="ts">
import BotonBase from '@/components/comunes/BotonBase.vue'
</script>

<template>
  <div class="vista-no-encontrada">
    <p class="vista-no-encontrada__codigo" aria-hidden="true">404</p>
    <h1>Página no encontrada</h1>
    <p class="vista-no-encontrada__texto">
      La página o el movimiento que buscas no existe o fue eliminado.
    </p>
    <BotonBase :hacia="{ name: 'dashboard' }">Volver al resumen</BotonBase>
  </div>
</template>

<style scoped lang="scss">
.vista-no-encontrada {
  display: grid;
  justify-items: center;
  gap: $espaciado-md;
  padding-block: $espaciado-xl;
  text-align: center;

  &__codigo {
    color: var(--color-primario);
    font-size: 4rem;
    font-weight: $peso-negrita;
    line-height: 1;
  }

  &__texto {
    color: var(--color-texto-secundario);
  }
}
</style>
