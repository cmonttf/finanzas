<script setup lang="ts">
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import CampoFormulario from '@/components/comunes/CampoFormulario.vue'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'

/** Controles de filtro combinables (RF-06); el estado vive en el ViewModel de la vista. */
defineProps<{ hayRangoFechasInvalido: boolean; hayFiltrosActivos: boolean }>()
const emit = defineEmits<{ limpiar: [] }>()

const tipo = defineModel<string>('tipo', { required: true })
const identificadorCategoria = defineModel<string>('identificadorCategoria', { required: true })
const fechaDesde = defineModel<string>('fechaDesde', { required: true })
const fechaHasta = defineModel<string>('fechaHasta', { required: true })

const storeCategorias = useStoreCategorias()
</script>

<template>
  <section class="filtros-movimientos" aria-labelledby="titulo-filtros">
    <h2 id="titulo-filtros" class="visualmente-oculto">Filtros</h2>
    <div class="filtros-movimientos__campos">
      <CampoFormulario v-slot="{ atributos }" etiqueta="Tipo">
        <select v-bind="atributos" v-model="tipo">
          <option value="">Todos</option>
          <option :value="TIPO_MOVIMIENTO.INGRESO">Ingresos</option>
          <option :value="TIPO_MOVIMIENTO.GASTO">Gastos</option>
        </select>
      </CampoFormulario>

      <CampoFormulario v-slot="{ atributos }" etiqueta="Categoría">
        <select v-bind="atributos" v-model="identificadorCategoria">
          <option value="">Todas</option>
          <option
            v-for="categoria in storeCategorias.categoriasOrdenadasPorNombre"
            :key="categoria.identificador"
            :value="categoria.identificador"
          >
            {{ categoria.nombre }}
          </option>
        </select>
      </CampoFormulario>

      <CampoFormulario v-slot="{ atributos }" etiqueta="Desde">
        <input v-bind="atributos" v-model="fechaDesde" type="date" />
      </CampoFormulario>

      <CampoFormulario
        v-slot="{ atributos }"
        etiqueta="Hasta"
        :mensaje-error="
          hayRangoFechasInvalido ? 'La fecha final debe ser posterior a la inicial.' : undefined
        "
      >
        <input v-bind="atributos" v-model="fechaHasta" type="date" :min="fechaDesde || undefined" />
      </CampoFormulario>
    </div>
    <button
      v-if="hayFiltrosActivos"
      type="button"
      class="filtros-movimientos__limpiar"
      @click="emit('limpiar')"
    >
      Limpiar filtros
    </button>
  </section>
</template>

<style scoped lang="scss">
.filtros-movimientos {
  @include tarjeta;
  display: grid;
  gap: $espaciado-md;
  margin-block-end: $espaciado-lg;

  &__campos {
    display: grid;
    gap: $espaciado-md;

    @include desde-pantalla(tablet) {
      grid-template-columns: repeat(2, 1fr);
    }

    @include desde-pantalla(escritorio) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__limpiar {
    @include boton-secundario;
    justify-self: start;
  }
}
</style>
