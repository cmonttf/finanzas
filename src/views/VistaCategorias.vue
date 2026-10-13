<script setup lang="ts">
import { nextTick, ref } from 'vue'
import BotonBase from '@/components/comunes/BotonBase.vue'
import CampoFormulario from '@/components/comunes/CampoFormulario.vue'
import ModalConfirmacion from '@/components/comunes/ModalConfirmacion.vue'
import {
  useGestionCategorias,
  type CategoriaConUso,
} from '@/viewmodels/composables/useGestionCategorias'

const {
  categoriasConUso,
  nombreNuevaCategoria,
  errorNuevaCategoria,
  identificadorEnEdicion,
  nombreEnEdicion,
  errorEdicion,
  mensajeErrorEliminacion,
  mensajeEstado,
  largoMaximoNombre,
  crearCategoria,
  comenzarEdicion,
  cancelarEdicion,
  guardarEdicion,
  eliminarCategoria,
} = useGestionCategorias()

const categoriaPorEliminar = ref<CategoriaConUso | null>(null)
const campoEdicion = ref<HTMLInputElement[]>([])

/**
 * Activa la edición en línea y enfoca el campo.
 *
 * @param categoria Categoría a renombrar.
 * @returns Promesa que se resuelve al enfocar el campo.
 */
async function manejarComienzoEdicion(categoria: CategoriaConUso): Promise<void> {
  comenzarEdicion(categoria)
  await nextTick()
  campoEdicion.value[0]?.focus()
}

/**
 * Elimina la categoría confirmada; si falla, mantiene el modal con el error.
 *
 * @returns Promesa que se resuelve al terminar.
 */
async function confirmarEliminacion(): Promise<void> {
  if (!categoriaPorEliminar.value) return
  const seElimino = await eliminarCategoria(categoriaPorEliminar.value)
  if (seElimino) categoriaPorEliminar.value = null
}

/**
 * Cierra el modal de eliminación.
 *
 * @returns No retorna valor.
 */
function cancelarEliminacion(): void {
  categoriaPorEliminar.value = null
  mensajeErrorEliminacion.value = ''
}
</script>

<template>
  <div class="vista-categorias">
    <header class="encabezado-pagina">
      <div>
        <h1>Categorías</h1>
        <p class="encabezado-pagina__subtitulo">Organiza tus movimientos a tu manera</p>
      </div>
    </header>

    <p class="visualmente-oculto" role="status">{{ mensajeEstado }}</p>

    <form class="vista-categorias__crear" novalidate @submit.prevent="crearCategoria">
      <CampoFormulario
        v-slot="{ atributos }"
        etiqueta="Nueva categoría"
        :mensaje-error="errorNuevaCategoria"
      >
        <input
          v-bind="atributos"
          v-model="nombreNuevaCategoria"
          type="text"
          :maxlength="largoMaximoNombre"
          autocomplete="off"
        />
      </CampoFormulario>
      <BotonBase tipo="submit" class="vista-categorias__boton-crear">Agregar</BotonBase>
    </form>

    <ul class="vista-categorias__lista" role="list">
      <li
        v-for="categoria in categoriasConUso"
        :key="categoria.identificador"
        class="vista-categorias__item"
      >
        <form
          v-if="identificadorEnEdicion === categoria.identificador"
          class="vista-categorias__edicion"
          novalidate
          @submit.prevent="guardarEdicion"
          @keydown.esc="cancelarEdicion"
        >
          <CampoFormulario
            v-slot="{ atributos }"
            :etiqueta="`Nuevo nombre para ${categoria.nombre}`"
            :mensaje-error="errorEdicion"
          >
            <input
              v-bind="atributos"
              ref="campoEdicion"
              v-model="nombreEnEdicion"
              type="text"
              :maxlength="largoMaximoNombre"
              autocomplete="off"
            />
          </CampoFormulario>
          <div class="vista-categorias__acciones">
            <BotonBase tipo="submit">Guardar</BotonBase>
            <BotonBase variante="secundario" @click="cancelarEdicion">Cancelar</BotonBase>
          </div>
        </form>

        <template v-else>
          <div>
            <p class="vista-categorias__nombre">{{ categoria.nombre }}</p>
            <p class="vista-categorias__uso">
              {{
                categoria.cantidadMovimientos === 1
                  ? '1 movimiento'
                  : `${categoria.cantidadMovimientos} movimientos`
              }}
            </p>
          </div>
          <div class="vista-categorias__acciones">
            <button
              type="button"
              class="vista-categorias__accion"
              @click="manejarComienzoEdicion(categoria)"
            >
              Renombrar<span class="visualmente-oculto"> {{ categoria.nombre }}</span>
            </button>
            <button
              type="button"
              class="vista-categorias__accion vista-categorias__accion--peligro"
              @click="categoriaPorEliminar = categoria"
            >
              Eliminar<span class="visualmente-oculto"> {{ categoria.nombre }}</span>
            </button>
          </div>
        </template>
      </li>
    </ul>

    <ModalConfirmacion
      :abierto="Boolean(categoriaPorEliminar)"
      titulo="Eliminar categoría"
      :mensaje="`¿Seguro que deseas eliminar «${categoriaPorEliminar?.nombre ?? ''}»?`"
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
.vista-categorias {
  &__crear {
    @include tarjeta;
    display: grid;
    gap: $espaciado-md;
    align-items: end;
    margin-block-end: $espaciado-lg;

    @include desde-pantalla(tablet) {
      grid-template-columns: 1fr auto;
    }
  }

  &__boton-crear {
    @include desde-pantalla(tablet) {
      align-self: end;
    }
  }

  &__lista {
    display: grid;
    gap: $espaciado-sm;
  }

  &__item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $espaciado-md;
    padding: $espaciado-md;
    border: 1px solid var(--color-borde);
    border-radius: $radio-borde-lg;
    background: var(--color-superficie);
  }

  &__edicion {
    display: grid;
    flex: 1;
    gap: $espaciado-sm;
  }

  &__nombre {
    font-weight: $peso-medio;
  }

  &__uso {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }

  &__acciones {
    display: flex;
    flex-wrap: wrap;
    gap: $espaciado-sm;
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
