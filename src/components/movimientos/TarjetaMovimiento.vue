<script setup lang="ts">
import { computed } from 'vue'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import { useFormateadores } from '@/viewmodels/composables/useFormateadores'
import type { Movimiento } from '@/viewmodels/tipos'

const props = defineProps<{ movimiento: Movimiento; nombreCategoria: string }>()
const emit = defineEmits<{ editar: [movimiento: Movimiento]; eliminar: [movimiento: Movimiento] }>()

const { formatearPesos, formatearFechaCorta, formatearTipoMovimiento } = useFormateadores()
const esIngreso = computed(() => props.movimiento.tipo === TIPO_MOVIMIENTO.INGRESO)
const tituloMovimiento = computed(() => props.movimiento.descripcion || props.nombreCategoria)
</script>

<template>
  <article class="tarjeta-movimiento">
    <div class="tarjeta-movimiento__principal">
      <h3 class="tarjeta-movimiento__titulo">
        <RouterLink
          :to="{ name: 'detalle-movimiento', params: { id: movimiento.identificador } }"
          class="tarjeta-movimiento__enlace"
        >
          {{ tituloMovimiento }}
        </RouterLink>
      </h3>
      <p class="tarjeta-movimiento__meta">
        <time :datetime="movimiento.fecha">{{ formatearFechaCorta(movimiento.fecha) }}</time>
        · {{ nombreCategoria }}
      </p>
    </div>
    <p
      class="tarjeta-movimiento__monto numero-tabular"
      :class="esIngreso ? 'tarjeta-movimiento__monto--ingreso' : 'tarjeta-movimiento__monto--gasto'"
    >
      <span class="visualmente-oculto">{{ formatearTipoMovimiento(movimiento.tipo) }}:</span>
      <span aria-hidden="true">{{ esIngreso ? '+' : '−' }}</span
      >{{ formatearPesos(movimiento.monto) }}
    </p>
    <div class="tarjeta-movimiento__acciones">
      <button type="button" class="tarjeta-movimiento__accion" @click="emit('editar', movimiento)">
        Editar<span class="visualmente-oculto"> {{ tituloMovimiento }}</span>
      </button>
      <button
        type="button"
        class="tarjeta-movimiento__accion tarjeta-movimiento__accion--peligro"
        @click="emit('eliminar', movimiento)"
      >
        Eliminar<span class="visualmente-oculto"> {{ tituloMovimiento }}</span>
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
.tarjeta-movimiento {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: $espaciado-sm $espaciado-md;
  align-items: center;
  padding: $espaciado-md;
  border: 1px solid var(--color-borde);
  border-radius: $radio-borde-lg;
  background: var(--color-superficie);

  @include desde-pantalla(tablet) {
    grid-template-columns: 1fr auto auto;
  }

  &__principal {
    min-width: 0;
  }

  &__titulo {
    overflow: hidden;
    font-size: $tamano-texto-md;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__enlace {
    color: var(--color-texto);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__meta {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }

  &__monto {
    font-weight: $peso-negrita;
    text-align: end;

    &--ingreso {
      color: var(--color-ingreso);
    }

    &--gasto {
      color: var(--color-gasto);
    }
  }

  &__acciones {
    display: flex;
    grid-column: 1 / -1;
    gap: $espaciado-sm;

    @include desde-pantalla(tablet) {
      grid-column: auto;
    }
  }

  &__accion {
    @include boton-secundario;
    min-height: 2.5rem;
    padding-block: $espaciado-xs;
    font-size: $tamano-texto-sm;

    &--peligro {
      color: var(--color-error);
    }
  }
}
</style>
