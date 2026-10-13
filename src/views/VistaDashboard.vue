<script setup lang="ts">
import { ref } from 'vue'
import BotonBase from '@/components/comunes/BotonBase.vue'
import ModalBase from '@/components/comunes/ModalBase.vue'
import GraficoGastosCategoria from '@/components/dashboard/GraficoGastosCategoria.vue'
import GraficoIngresosGastos from '@/components/dashboard/GraficoIngresosGastos.vue'
import PanelIndicadores from '@/components/dashboard/PanelIndicadores.vue'
import TarjetaResumen from '@/components/dashboard/TarjetaResumen.vue'
import FormularioMovimiento from '@/components/movimientos/FormularioMovimiento.vue'
import { useFormateadores } from '@/viewmodels/composables/useFormateadores'
import { useResumenDashboard } from '@/viewmodels/composables/useResumenDashboard'

const {
  nombreMesActual,
  saldoActual,
  totalIngresosMes,
  totalGastosMes,
  gastosPorCategoriaMes,
  historialMensual,
  hayMovimientosEnHistorial,
  mesesHistorial,
} = useResumenDashboard()
const { formatearPesos } = useFormateadores()

const estaModalRegistroAbierto = ref(false)
</script>

<template>
  <div class="vista-dashboard">
    <header class="encabezado-pagina">
      <div>
        <h1>Resumen</h1>
        <p class="encabezado-pagina__subtitulo vista-dashboard__mes">{{ nombreMesActual }}</p>
      </div>
      <BotonBase @click="estaModalRegistroAbierto = true">
        <span aria-hidden="true">+</span> Nuevo movimiento
      </BotonBase>
    </header>

    <div class="vista-dashboard__tarjetas">
      <TarjetaResumen
        titulo="Saldo actual"
        :valor="formatearPesos(saldoActual)"
        detalle="Ingresos menos gastos de todos tus movimientos"
        :variante="saldoActual < 0 ? 'gasto' : 'neutra'"
      />
      <TarjetaResumen
        titulo="Ingresos del mes"
        :valor="formatearPesos(totalIngresosMes)"
        variante="ingreso"
      />
      <TarjetaResumen
        titulo="Gastos del mes"
        :valor="formatearPesos(totalGastosMes)"
        variante="gasto"
      />
    </div>

    <PanelIndicadores class="vista-dashboard__bloque" />

    <div class="vista-dashboard__graficos">
      <GraficoIngresosGastos
        :historial-mensual="historialMensual"
        :cantidad-meses="mesesHistorial"
        :hay-movimientos="hayMovimientosEnHistorial"
      />
      <GraficoGastosCategoria
        :gastos-por-categoria="gastosPorCategoriaMes"
        :nombre-mes="nombreMesActual"
      />
    </div>

    <ModalBase
      :abierto="estaModalRegistroAbierto"
      titulo="Nuevo movimiento"
      @cerrar="estaModalRegistroAbierto = false"
    >
      <FormularioMovimiento
        @movimiento-guardado="estaModalRegistroAbierto = false"
        @cancelar="estaModalRegistroAbierto = false"
      />
    </ModalBase>
  </div>
</template>

<style scoped lang="scss">
.vista-dashboard {
  &__mes::first-letter {
    text-transform: uppercase;
  }

  &__tarjetas {
    display: grid;
    gap: $espaciado-md;

    @include desde-pantalla(tablet) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__bloque {
    margin-block-start: $espaciado-lg;
  }

  &__graficos {
    display: grid;
    gap: $espaciado-lg;
    margin-block-start: $espaciado-lg;

    @include desde-pantalla(escritorio) {
      grid-template-columns: 3fr 2fr;
    }
  }
}
</style>
