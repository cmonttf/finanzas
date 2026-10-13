<script setup lang="ts">
import { computed, ref } from 'vue'
import BotonBase from '@/components/comunes/BotonBase.vue'
import EstadoCarga from '@/components/comunes/EstadoCarga.vue'
import ModalBase from '@/components/comunes/ModalBase.vue'
import ModalConfirmacion from '@/components/comunes/ModalConfirmacion.vue'
import PaginacionLista from '@/components/comunes/PaginacionLista.vue'
import FiltrosMovimientos from '@/components/movimientos/FiltrosMovimientos.vue'
import FormularioMovimiento from '@/components/movimientos/FormularioMovimiento.vue'
import TarjetaMovimiento from '@/components/movimientos/TarjetaMovimiento.vue'
import { useFiltrosMovimientos } from '@/viewmodels/composables/useFiltrosMovimientos'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'
import type { Movimiento } from '@/viewmodels/tipos'

const storeMovimientos = useStoreMovimientos()
const storeCategorias = useStoreCategorias()
const {
  filtros,
  paginaActual,
  totalPaginas,
  movimientosFiltrados,
  movimientosPaginaActual,
  hayRangoFechasInvalido,
  hayFiltrosActivos,
  irAPagina,
  limpiarFiltros,
  exportarMovimientosFiltradosCsv,
} = useFiltrosMovimientos()

const estaFormularioAbierto = ref(false)
const movimientoEnEdicion = ref<Movimiento | undefined>()
const movimientoPorEliminar = ref<Movimiento | null>(null)
const estaEliminando = ref(false)
const mensajeErrorEliminacion = ref('')
const mensajeAnuncio = ref('')

const tituloFormulario = computed(() =>
  movimientoEnEdicion.value ? 'Editar movimiento' : 'Nuevo movimiento',
)
const textoResultados = computed(() => {
  const cantidad = movimientosFiltrados.value.length
  return cantidad === 1 ? '1 movimiento' : `${cantidad} movimientos`
})

/**
 * Abre el formulario para registrar o editar un movimiento.
 *
 * @param movimiento Movimiento a editar; si se omite, se registra uno nuevo.
 * @returns No retorna valor.
 */
function abrirFormulario(movimiento?: Movimiento): void {
  movimientoEnEdicion.value = movimiento
  estaFormularioAbierto.value = true
}

/**
 * Cierra el formulario y anuncia el resultado a lectores de pantalla.
 *
 * @param seGuardo Indica si el movimiento se guardó.
 * @returns No retorna valor.
 */
function cerrarFormulario(seGuardo = false): void {
  if (seGuardo) {
    mensajeAnuncio.value = movimientoEnEdicion.value
      ? 'Movimiento actualizado.'
      : 'Movimiento registrado.'
  }
  estaFormularioAbierto.value = false
  movimientoEnEdicion.value = undefined
}

/**
 * Elimina el movimiento confirmado en el modal.
 *
 * @returns Promesa que se resuelve al terminar la eliminación.
 */
async function confirmarEliminacion(): Promise<void> {
  if (!movimientoPorEliminar.value) return
  estaEliminando.value = true
  mensajeErrorEliminacion.value = ''
  try {
    await storeMovimientos.eliminarMovimiento(movimientoPorEliminar.value.identificador)
    movimientoPorEliminar.value = null
    mensajeAnuncio.value = 'Movimiento eliminado.'
  } catch {
    mensajeErrorEliminacion.value = 'No se pudo eliminar el movimiento. Inténtalo nuevamente.'
  } finally {
    estaEliminando.value = false
  }
}

/**
 * Cierra el modal de eliminación sin eliminar.
 *
 * @returns No retorna valor.
 */
function cancelarEliminacion(): void {
  movimientoPorEliminar.value = null
  mensajeErrorEliminacion.value = ''
}
</script>

<template>
  <div class="vista-movimientos">
    <header class="encabezado-pagina">
      <div>
        <h1>Movimientos</h1>
        <p class="encabezado-pagina__subtitulo">Ingresos y gastos ordenados por fecha</p>
      </div>
      <div class="encabezado-pagina__acciones">
        <BotonBase
          variante="secundario"
          :deshabilitado="movimientosFiltrados.length === 0"
          @click="exportarMovimientosFiltradosCsv"
        >
          Exportar CSV
        </BotonBase>
        <BotonBase @click="abrirFormulario()">
          <span aria-hidden="true">+</span> Nuevo movimiento
        </BotonBase>
      </div>
    </header>

    <FiltrosMovimientos
      v-model:tipo="filtros.tipo"
      v-model:identificador-categoria="filtros.identificadorCategoria"
      v-model:fecha-desde="filtros.fechaDesde"
      v-model:fecha-hasta="filtros.fechaHasta"
      :hay-rango-fechas-invalido="hayRangoFechasInvalido"
      :hay-filtros-activos="hayFiltrosActivos"
      @limpiar="limpiarFiltros"
    />

    <p class="visualmente-oculto" role="status">{{ mensajeAnuncio }}</p>

    <EstadoCarga
      :esta-cargando="storeMovimientos.estaCargandoMovimientos"
      texto-carga="Cargando movimientos…"
    />

    <template v-if="!storeMovimientos.estaCargandoMovimientos">
      <p class="vista-movimientos__resultados" aria-live="polite">{{ textoResultados }}</p>

      <ul v-if="movimientosPaginaActual.length > 0" class="vista-movimientos__lista" role="list">
        <li v-for="movimiento in movimientosPaginaActual" :key="movimiento.identificador">
          <TarjetaMovimiento
            :movimiento="movimiento"
            :nombre-categoria="
              storeCategorias.obtenerNombreCategoria(movimiento.identificadorCategoria)
            "
            @editar="abrirFormulario"
            @eliminar="movimientoPorEliminar = $event"
          />
        </li>
      </ul>
      <div v-else class="vista-movimientos__vacio">
        <p v-if="hayFiltrosActivos">Ningún movimiento coincide con los filtros.</p>
        <p v-else>Todavía no registras movimientos. ¡Comienza con el primero!</p>
      </div>

      <PaginacionLista
        :pagina-actual="paginaActual"
        :total-paginas="totalPaginas"
        @cambiar-pagina="irAPagina"
      />
    </template>

    <ModalBase
      :abierto="estaFormularioAbierto"
      :titulo="tituloFormulario"
      @cerrar="cerrarFormulario()"
    >
      <FormularioMovimiento
        :key="movimientoEnEdicion?.identificador ?? 'nuevo'"
        :movimiento="movimientoEnEdicion"
        @movimiento-guardado="cerrarFormulario(true)"
        @cancelar="cerrarFormulario()"
      />
    </ModalBase>

    <ModalConfirmacion
      :abierto="Boolean(movimientoPorEliminar)"
      titulo="Eliminar movimiento"
      mensaje="¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer."
      :esta-procesando="estaEliminando"
      @confirmar="confirmarEliminacion"
      @cancelar="cancelarEliminacion"
    >
      <p v-if="mensajeErrorEliminacion" class="mensaje-estado mensaje-estado--error" role="alert">
        {{ mensajeErrorEliminacion }}
      </p>
    </ModalConfirmacion>
  </div>
</template>

<style scoped lang="scss">
.vista-movimientos {
  &__resultados {
    margin-block-end: $espaciado-sm;
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }

  &__lista {
    display: grid;
    gap: $espaciado-sm;
  }

  &__vacio {
    @include tarjeta;
    color: var(--color-texto-secundario);
    text-align: center;
  }
}
</style>
