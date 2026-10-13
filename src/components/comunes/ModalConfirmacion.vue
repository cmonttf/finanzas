<script setup lang="ts">
import BotonBase from './BotonBase.vue'
import ModalBase from './ModalBase.vue'

/** Modal de confirmación para acciones destructivas (RF-04). */
withDefaults(
  defineProps<{
    abierto: boolean
    titulo: string
    mensaje: string
    textoConfirmar?: string
    estaProcesando?: boolean
  }>(),
  { textoConfirmar: 'Eliminar', estaProcesando: false },
)
const emit = defineEmits<{ confirmar: []; cancelar: [] }>()
</script>

<template>
  <ModalBase :abierto="abierto" :titulo="titulo" @cerrar="emit('cancelar')">
    <p class="modal-confirmacion__mensaje">{{ mensaje }}</p>
    <slot />
    <div class="modal-confirmacion__acciones">
      <BotonBase variante="secundario" @click="emit('cancelar')">Cancelar</BotonBase>
      <BotonBase variante="peligro" :deshabilitado="estaProcesando" @click="emit('confirmar')">
        {{ estaProcesando ? 'Procesando…' : textoConfirmar }}
      </BotonBase>
    </div>
  </ModalBase>
</template>

<style scoped lang="scss">
.modal-confirmacion {
  &__mensaje {
    margin-block-end: $espaciado-md;
  }

  &__acciones {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: $espaciado-sm;
    margin-block-start: $espaciado-lg;
  }
}
</style>
