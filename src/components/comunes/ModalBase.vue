<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

/**
 * Modal accesible sobre <dialog>: atrapa el foco, se cierra con Esc y
 * devuelve el foco al elemento que lo abrió.
 */
const props = defineProps<{ abierto: boolean; titulo: string }>()
const emit = defineEmits<{ cerrar: [] }>()

const idTitulo = useId()
const elementoDialogo = ref<HTMLDialogElement | null>(null)
let elementoConFocoPrevio: HTMLElement | null = null

watch(
  () => props.abierto,
  async (estaAbierto) => {
    await nextTick()
    const dialogo = elementoDialogo.value
    if (!dialogo) return
    if (estaAbierto && !dialogo.open) {
      elementoConFocoPrevio = document.activeElement as HTMLElement | null
      dialogo.showModal()
    } else if (!estaAbierto && dialogo.open) {
      dialogo.close()
    }
  },
  { immediate: true },
)

/**
 * Devuelve el foco al elemento que abrió el modal.
 *
 * @returns No retorna valor.
 */
function restaurarFoco(): void {
  elementoConFocoPrevio?.focus()
  elementoConFocoPrevio = null
}

/**
 * Intercepta Esc para que el padre controle el cierre.
 *
 * @param evento Evento cancel del diálogo.
 * @returns No retorna valor.
 */
function manejarCancelacion(evento: Event): void {
  evento.preventDefault()
  emit('cerrar')
}

/**
 * Cierra el modal al hacer clic en el fondo.
 *
 * @param evento Clic sobre el diálogo.
 * @returns No retorna valor.
 */
function manejarClicFondo(evento: MouseEvent): void {
  if (evento.target === elementoDialogo.value) emit('cerrar')
}

onBeforeUnmount(() => {
  if (elementoDialogo.value?.open) elementoDialogo.value.close()
})
</script>

<template>
  <dialog
    ref="elementoDialogo"
    class="modal-base"
    :aria-labelledby="idTitulo"
    @cancel="manejarCancelacion"
    @keydown.esc.prevent="emit('cerrar')"
    @close="restaurarFoco"
    @click="manejarClicFondo"
  >
    <div v-if="abierto" class="modal-base__contenido">
      <header class="modal-base__encabezado">
        <h2 :id="idTitulo" class="modal-base__titulo">{{ titulo }}</h2>
        <button
          type="button"
          class="modal-base__cerrar"
          aria-label="Cerrar ventana"
          @click="emit('cerrar')"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <slot />
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.modal-base {
  width: min(100% - #{$espaciado-lg}, 36rem);
  max-height: calc(100dvh - #{$espaciado-lg});
  margin: auto; // El reset global elimina el centrado nativo de <dialog>.
  padding: 0;
  border: 1px solid var(--color-borde);
  border-radius: $radio-borde-lg;
  background: var(--color-superficie);
  color: var(--color-texto);

  &::backdrop {
    background: var(--color-fondo-modal);
  }

  &__contenido {
    padding: $espaciado-md;

    @include desde-pantalla(tablet) {
      padding: $espaciado-lg;
    }
  }

  &__encabezado {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $espaciado-md;
    margin-block-end: $espaciado-md;
  }

  &__cerrar {
    @include boton-base;
    min-width: 2.75rem;
    padding: 0;
    background: transparent;
    color: var(--color-texto);
    font-size: $tamano-texto-xl;

    &:hover {
      background: var(--color-superficie-hover);
    }
  }
}
</style>
