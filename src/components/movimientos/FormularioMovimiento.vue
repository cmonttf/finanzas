<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import BotonBase from '@/components/comunes/BotonBase.vue'
import CampoFormulario from '@/components/comunes/CampoFormulario.vue'
import { useFormularioMovimiento } from '@/viewmodels/composables/useFormularioMovimiento'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'
import type { Movimiento } from '@/viewmodels/tipos'

const props = defineProps<{ movimiento?: Movimiento }>()
const emit = defineEmits<{ movimientoGuardado: []; cancelar: [] }>()

const storeCategorias = useStoreCategorias()
const {
  datosFormulario,
  erroresFormulario,
  mensajeErrorGuardado,
  estaGuardandoMovimiento,
  esModoEdicion,
  fechaMaximaPermitida,
  caracteresRestantesDescripcion,
  largoMaximoDescripcion,
  enviarFormularioMovimiento,
} = useFormularioMovimiento(props.movimiento)

const elementoFormulario = ref<HTMLFormElement | null>(null)

/**
 * Envía el formulario; si hay errores, mueve el foco al primer campo inválido.
 *
 * @returns Promesa que se resuelve al terminar el envío.
 */
async function manejarEnvioFormulario(): Promise<void> {
  const seGuardoMovimiento = await enviarFormularioMovimiento()
  if (seGuardoMovimiento) {
    emit('movimientoGuardado')
    return
  }
  await nextTick()
  elementoFormulario.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
</script>

<template>
  <form
    ref="elementoFormulario"
    class="formulario-movimiento"
    novalidate
    @submit.prevent="manejarEnvioFormulario"
  >
    <fieldset class="formulario-movimiento__grupo">
      <legend class="formulario-movimiento__leyenda">Tipo de movimiento</legend>
      <div class="formulario-movimiento__opciones">
        <label class="formulario-movimiento__opcion">
          <input v-model="datosFormulario.tipo" type="radio" :value="TIPO_MOVIMIENTO.INGRESO" />
          Ingreso
        </label>
        <label class="formulario-movimiento__opcion">
          <input v-model="datosFormulario.tipo" type="radio" :value="TIPO_MOVIMIENTO.GASTO" />
          Gasto
        </label>
      </div>
    </fieldset>

    <div class="formulario-movimiento__fila">
      <CampoFormulario
        v-slot="{ atributos }"
        etiqueta="Monto (CLP)"
        :mensaje-error="erroresFormulario.monto"
      >
        <input
          v-bind="atributos"
          v-model.number="datosFormulario.monto"
          type="number"
          inputmode="numeric"
          min="1"
          step="1"
          autocomplete="off"
        />
      </CampoFormulario>

      <CampoFormulario
        v-slot="{ atributos }"
        etiqueta="Fecha"
        :mensaje-error="erroresFormulario.fecha"
      >
        <input
          v-bind="atributos"
          v-model="datosFormulario.fecha"
          type="date"
          :max="fechaMaximaPermitida"
        />
      </CampoFormulario>
    </div>

    <CampoFormulario
      v-slot="{ atributos }"
      etiqueta="Categoría"
      :mensaje-error="erroresFormulario.identificadorCategoria"
    >
      <select v-bind="atributos" v-model="datosFormulario.identificadorCategoria">
        <option value="" disabled>Selecciona una categoría</option>
        <option
          v-for="categoria in storeCategorias.categoriasOrdenadasPorNombre"
          :key="categoria.identificador"
          :value="categoria.identificador"
        >
          {{ categoria.nombre }}
        </option>
      </select>
    </CampoFormulario>

    <CampoFormulario
      v-slot="{ atributos }"
      etiqueta="Descripción (opcional)"
      :mensaje-error="erroresFormulario.descripcion"
      :ayuda="`Te quedan ${caracteresRestantesDescripcion} de ${largoMaximoDescripcion} caracteres.`"
    >
      <textarea v-bind="atributos" v-model="datosFormulario.descripcion" rows="2"></textarea>
    </CampoFormulario>

    <p v-if="mensajeErrorGuardado" class="mensaje-estado mensaje-estado--error" role="alert">
      {{ mensajeErrorGuardado }}
    </p>

    <div class="formulario-movimiento__acciones">
      <BotonBase tipo="submit" :deshabilitado="estaGuardandoMovimiento">
        {{
          estaGuardandoMovimiento
            ? 'Guardando…'
            : esModoEdicion
              ? 'Guardar cambios'
              : 'Guardar movimiento'
        }}
      </BotonBase>
      <BotonBase variante="secundario" @click="emit('cancelar')">Cancelar</BotonBase>
    </div>
  </form>
</template>

<style scoped lang="scss">
.formulario-movimiento {
  display: grid;
  gap: $espaciado-md;

  &__leyenda {
    margin-block-end: $espaciado-xs;
    font-weight: $peso-medio;
  }

  &__opciones {
    display: flex;
    flex-wrap: wrap;
    gap: $espaciado-sm;
  }

  &__opcion {
    display: inline-flex;
    align-items: center;
    gap: $espaciado-sm;
    min-height: 2.75rem;
    padding-inline: $espaciado-md;
    border: 1px solid var(--color-borde-fuerte);
    border-radius: $radio-borde;
    cursor: pointer;

    &:has(input:checked) {
      border-color: var(--color-primario);
      border-width: 2px;
      font-weight: $peso-medio;
    }

    &:has(input:focus-visible) {
      outline: 3px solid var(--color-foco);
      outline-offset: 2px;
    }

    input {
      accent-color: var(--color-primario);
    }
  }

  &__fila {
    display: grid;
    align-items: start;
    gap: $espaciado-md;

    @include desde-pantalla(tablet) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__acciones {
    display: flex;
    flex-wrap: wrap;
    gap: $espaciado-sm;
    margin-block-start: $espaciado-sm;
  }
}
</style>
