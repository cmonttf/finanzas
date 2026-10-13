<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { configuracionAplicacion } from '@/config/configuracionAplicacion'
import BotonBase from '@/components/comunes/BotonBase.vue'
import CampoFormulario from '@/components/comunes/CampoFormulario.vue'
import { useFormularioIngreso } from '@/viewmodels/composables/useFormularioIngreso'

const route = useRoute()
const router = useRouter()
const { datosIngreso, erroresIngreso, largoMinimoContrasena, enviarFormularioIngreso } =
  useFormularioIngreso()
const elementoFormulario = ref<HTMLFormElement | null>(null)

/**
 * Inicia la sesión y vuelve a la ruta solicitada originalmente.
 *
 * @returns Promesa que se resuelve al navegar o al enfocar el primer error.
 */
async function manejarEnvio(): Promise<void> {
  if (enviarFormularioIngreso()) {
    const rutaDestino = typeof route.query.redireccion === 'string' ? route.query.redireccion : '/'
    // Solo se aceptan rutas internas para evitar redirecciones abiertas.
    await router.replace(
      rutaDestino.startsWith('/') && !rutaDestino.startsWith('//') ? rutaDestino : '/',
    )
    return
  }
  await nextTick()
  elementoFormulario.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
</script>

<template>
  <div class="vista-ingresar">
    <form
      ref="elementoFormulario"
      class="vista-ingresar__tarjeta"
      novalidate
      @submit.prevent="manejarEnvio"
    >
      <h1 class="vista-ingresar__titulo">{{ configuracionAplicacion.nombreAplicacion }}</h1>
      <p class="vista-ingresar__descripcion">
        Inicio de sesión simulado: usa cualquier nombre y una contraseña de al menos
        {{ largoMinimoContrasena }} caracteres. Tus datos se guardan solo en este navegador.
      </p>

      <CampoFormulario
        v-slot="{ atributos }"
        etiqueta="Nombre de usuario"
        :mensaje-error="erroresIngreso.nombreUsuario"
      >
        <input
          v-bind="atributos"
          v-model="datosIngreso.nombreUsuario"
          type="text"
          autocomplete="username"
        />
      </CampoFormulario>

      <CampoFormulario
        v-slot="{ atributos }"
        etiqueta="Contraseña"
        :mensaje-error="erroresIngreso.contrasena"
      >
        <input
          v-bind="atributos"
          v-model="datosIngreso.contrasena"
          type="password"
          autocomplete="current-password"
        />
      </CampoFormulario>

      <BotonBase tipo="submit">Ingresar</BotonBase>
    </form>
  </div>
</template>

<style scoped lang="scss">
.vista-ingresar {
  display: grid;
  place-items: center;
  min-height: 70vh;

  &__tarjeta {
    @include tarjeta;
    display: grid;
    gap: $espaciado-md;
    width: min(100%, 26rem);
  }

  &__titulo {
    font-size: $tamano-texto-xl;
  }

  &__descripcion {
    color: var(--color-texto-secundario);
    font-size: $tamano-texto-sm;
  }
}
</style>
