<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import BotonBase from '@/components/comunes/BotonBase.vue'
import ModalBase from '@/components/comunes/ModalBase.vue'
import ModalConfirmacion from '@/components/comunes/ModalConfirmacion.vue'
import FormularioMovimiento from '@/components/movimientos/FormularioMovimiento.vue'
import { useFormateadores } from '@/viewmodels/composables/useFormateadores'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'

/** Detalle de un movimiento (RF-07). El guard de la ruta garantiza que existe. */
const props = defineProps<{ id: string }>()

const router = useRouter()
const storeMovimientos = useStoreMovimientos()
const storeCategorias = useStoreCategorias()
const { formatearPesos, formatearFechaLarga, formatearTipoMovimiento } = useFormateadores()

const movimiento = computed(() => storeMovimientos.obtenerMovimientoPorIdentificador(props.id))
const esIngreso = computed(() => movimiento.value?.tipo === TIPO_MOVIMIENTO.INGRESO)
const estaEditando = ref(false)
const estaConfirmandoEliminacion = ref(false)
const estaEliminando = ref(false)
const mensajeErrorEliminacion = ref('')

/**
 * Elimina el movimiento y vuelve al listado.
 *
 * @returns Promesa que se resuelve al terminar la eliminación.
 */
async function confirmarEliminacion(): Promise<void> {
  estaEliminando.value = true
  mensajeErrorEliminacion.value = ''
  try {
    await storeMovimientos.eliminarMovimiento(props.id)
    estaConfirmandoEliminacion.value = false
    await router.replace({ name: 'movimientos' })
  } catch {
    mensajeErrorEliminacion.value = 'No se pudo eliminar el movimiento. Inténtalo nuevamente.'
  } finally {
    estaEliminando.value = false
  }
}
</script>

<template>
  <div v-if="movimiento" class="vista-detalle">
    <RouterLink :to="{ name: 'movimientos' }" class="vista-detalle__volver">
      <span aria-hidden="true">←</span> Volver a movimientos
    </RouterLink>

    <header class="encabezado-pagina">
      <div>
        <h1>{{ movimiento.descripcion || 'Movimiento sin descripción' }}</h1>
        <p class="encabezado-pagina__subtitulo">
          {{ formatearTipoMovimiento(movimiento.tipo) }} ·
          {{ storeCategorias.obtenerNombreCategoria(movimiento.identificadorCategoria) }}
        </p>
      </div>
      <div class="encabezado-pagina__acciones">
        <BotonBase variante="secundario" @click="estaEditando = true">Editar</BotonBase>
        <BotonBase variante="peligro" @click="estaConfirmandoEliminacion = true"
          >Eliminar</BotonBase
        >
      </div>
    </header>

    <dl class="vista-detalle__datos">
      <div class="vista-detalle__dato">
        <dt>Monto</dt>
        <dd
          class="vista-detalle__monto numero-tabular"
          :class="esIngreso ? 'vista-detalle__monto--ingreso' : 'vista-detalle__monto--gasto'"
        >
          {{ esIngreso ? '+' : '−' }}{{ formatearPesos(movimiento.monto) }}
        </dd>
      </div>
      <div class="vista-detalle__dato">
        <dt>Tipo</dt>
        <dd>{{ formatearTipoMovimiento(movimiento.tipo) }}</dd>
      </div>
      <div class="vista-detalle__dato">
        <dt>Fecha</dt>
        <dd>
          <time :datetime="movimiento.fecha">{{ formatearFechaLarga(movimiento.fecha) }}</time>
        </dd>
      </div>
      <div class="vista-detalle__dato">
        <dt>Categoría</dt>
        <dd>{{ storeCategorias.obtenerNombreCategoria(movimiento.identificadorCategoria) }}</dd>
      </div>
      <div class="vista-detalle__dato vista-detalle__dato--ancho">
        <dt>Descripción</dt>
        <dd>{{ movimiento.descripcion || 'Sin descripción' }}</dd>
      </div>
    </dl>

    <ModalBase :abierto="estaEditando" titulo="Editar movimiento" @cerrar="estaEditando = false">
      <FormularioMovimiento
        :movimiento="movimiento"
        @movimiento-guardado="estaEditando = false"
        @cancelar="estaEditando = false"
      />
    </ModalBase>

    <ModalConfirmacion
      :abierto="estaConfirmandoEliminacion"
      titulo="Eliminar movimiento"
      mensaje="¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer."
      :esta-procesando="estaEliminando"
      @confirmar="confirmarEliminacion"
      @cancelar="estaConfirmandoEliminacion = false"
    >
      <p v-if="mensajeErrorEliminacion" class="mensaje-estado mensaje-estado--error" role="alert">
        {{ mensajeErrorEliminacion }}
      </p>
    </ModalConfirmacion>
  </div>
</template>

<style scoped lang="scss">
.vista-detalle {
  &__volver {
    display: inline-block;
    margin-block-end: $espaciado-md;
  }

  &__datos {
    @include tarjeta;
    display: grid;
    gap: $espaciado-md;

    @include desde-pantalla(tablet) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__dato {
    dt {
      color: var(--color-texto-secundario);
      font-size: $tamano-texto-sm;
    }

    dd {
      margin: 0;
      font-weight: $peso-medio;
      overflow-wrap: anywhere;
    }

    &--ancho {
      grid-column: 1 / -1;
    }
  }

  &__monto {
    font-size: $tamano-texto-xl;

    &--ingreso {
      color: var(--color-ingreso);
    }

    &--gasto {
      color: var(--color-gasto);
    }
  }
}
</style>
