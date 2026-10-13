<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { configuracionAplicacion } from '@/config/configuracionAplicacion'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'
import { useStorePreferencias } from '@/viewmodels/stores/storePreferencias'
import { useStoreSesion } from '@/viewmodels/stores/storeSesion'

const route = useRoute()
const router = useRouter()
const storeMovimientos = useStoreMovimientos()
const storeCategorias = useStoreCategorias()
const storePreferencias = useStorePreferencias()
const storeSesion = useStoreSesion()

const contenidoPrincipal = ref<HTMLElement | null>(null)
const mostrarNavegacion = computed(
  () =>
    route.name !== 'ingresar' &&
    (storeSesion.tieneSesionActiva || !configuracionAplicacion.requiereInicioSesion),
)
const enlacesNavegacion = [
  { nombreRuta: 'dashboard', etiqueta: 'Resumen' },
  { nombreRuta: 'movimientos', etiqueta: 'Movimientos' },
  { nombreRuta: 'categorias', etiqueta: 'Categorías' },
]

/**
 * Cierra la sesión simulada y vuelve a la pantalla de ingreso.
 *
 * @returns Promesa que se resuelve al navegar.
 */
async function manejarCierreSesion(): Promise<void> {
  storeSesion.cerrarSesion()
  await router.push({ name: 'ingresar' })
}

// Tras cada navegación se mueve el foco al contenido para lectores de pantalla.
router.afterEach(async (rutaDestino, rutaOrigen) => {
  if (rutaDestino.path === rutaOrigen.path) return
  await nextTick()
  contenidoPrincipal.value?.focus()
})

onMounted(() => {
  void storeMovimientos.asegurarMovimientosCargados()
  void storeCategorias.cargarCategorias()
})
</script>

<template>
  <a class="enlace-salto" href="#contenido-principal">Saltar al contenido</a>

  <header class="barra-superior">
    <div class="contenedor barra-superior__contenido">
      <RouterLink :to="{ name: 'dashboard' }" class="barra-superior__marca">
        <span class="barra-superior__logo" aria-hidden="true">$</span>
        {{ configuracionAplicacion.nombreAplicacion }}
      </RouterLink>

      <nav v-if="mostrarNavegacion" class="barra-superior__navegacion" aria-label="Principal">
        <ul role="list" class="barra-superior__enlaces">
          <li v-for="enlace in enlacesNavegacion" :key="enlace.nombreRuta">
            <RouterLink
              :to="{ name: enlace.nombreRuta }"
              class="barra-superior__enlace"
              :exact-active-class="
                enlace.nombreRuta === 'dashboard' ? 'barra-superior__enlace--activo' : ''
              "
              :active-class="
                enlace.nombreRuta === 'dashboard' ? '' : 'barra-superior__enlace--activo'
              "
            >
              {{ enlace.etiqueta }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="barra-superior__acciones">
        <button
          type="button"
          class="barra-superior__boton"
          :aria-pressed="storePreferencias.esTemaOscuro"
          @click="storePreferencias.alternarTema"
        >
          <span aria-hidden="true">{{ storePreferencias.esTemaOscuro ? '☀' : '☾' }}</span>
          <span class="visualmente-oculto">Tema oscuro</span>
        </button>
        <button
          v-if="storeSesion.tieneSesionActiva && configuracionAplicacion.requiereInicioSesion"
          type="button"
          class="barra-superior__boton"
          @click="manejarCierreSesion"
        >
          Salir<span class="visualmente-oculto">
            de la sesión de {{ storeSesion.nombreUsuario }}</span
          >
        </button>
      </div>
    </div>
  </header>

  <main
    id="contenido-principal"
    ref="contenidoPrincipal"
    class="contenedor contenido-principal"
    tabindex="-1"
  >
    <RouterView />
  </main>

  <footer class="pie-pagina">
    <p class="contenedor">
      Indicadores económicos provistos por
      <a href="https://mindicador.cl" target="_blank" rel="noopener noreferrer">mindicador.cl</a>
    </p>
  </footer>
</template>

<style scoped lang="scss">
.enlace-salto {
  position: absolute;
  top: $espaciado-sm;
  left: $espaciado-sm;
  z-index: 10;
  padding: $espaciado-sm $espaciado-md;
  border-radius: $radio-borde;
  background: var(--color-primario);
  color: var(--color-texto-sobre-primario);
  transform: translateY(-200%);

  &:focus {
    transform: none;
  }
}

.barra-superior {
  border-bottom: 1px solid var(--color-borde);
  background: var(--color-superficie);

  &__contenido {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $espaciado-sm $espaciado-md;
    padding-block: $espaciado-sm;
  }

  &__marca {
    display: inline-flex;
    align-items: center;
    gap: $espaciado-sm;
    color: var(--color-texto);
    font-weight: $peso-negrita;
    text-decoration: none;
  }

  &__logo {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: $radio-borde;
    background: var(--color-primario);
    color: var(--color-texto-sobre-primario);
  }

  &__navegacion {
    order: 3;
    width: 100%;
    overflow-x: auto;

    @include desde-pantalla(tablet) {
      order: 0;
      width: auto;
    }
  }

  &__enlaces {
    display: flex;
    gap: $espaciado-xs;
  }

  &__enlace {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    padding-inline: $espaciado-md;
    border-radius: $radio-borde;
    color: var(--color-texto-secundario);
    font-weight: $peso-medio;
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      background: var(--color-superficie-hover);
      color: var(--color-texto);
    }

    &--activo {
      background: var(--color-superficie-hover);
      color: var(--color-texto);
      box-shadow: inset 0 -3px 0 var(--color-primario);
    }
  }

  &__acciones {
    display: flex;
    gap: $espaciado-sm;
    margin-inline-start: auto;
  }

  &__boton {
    @include boton-secundario;
    min-width: 2.75rem;
  }
}

.contenido-principal {
  padding-block: $espaciado-lg $espaciado-xl;
  outline: none;
}

.pie-pagina {
  padding-block: $espaciado-lg;
  border-top: 1px solid var(--color-borde);
  color: var(--color-texto-secundario);
  font-size: $tamano-texto-sm;
}
</style>
