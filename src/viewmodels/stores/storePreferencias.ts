import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { TEMA_VISUAL, type TemaVisual } from '@/config/constantes'
import { RepositorioPreferenciasLocal } from '@/models/repositorios/RepositorioPreferenciasLocal'

const repositorioPreferencias = new RepositorioPreferenciasLocal()

/**
 * Determina el tema inicial: el guardado o, si no existe, el preferido por el sistema.
 *
 * @returns Tema visual a aplicar al iniciar.
 */
function obtenerTemaInicial(): TemaVisual {
  const temaGuardado = repositorioPreferencias.obtenerTemaGuardado()
  if (temaGuardado) return temaGuardado
  const prefiereOscuro =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefiereOscuro ? TEMA_VISUAL.OSCURO : TEMA_VISUAL.CLARO
}

export const useStorePreferencias = defineStore('preferencias', () => {
  const temaActual = ref<TemaVisual>(obtenerTemaInicial())
  const esTemaOscuro = computed(() => temaActual.value === TEMA_VISUAL.OSCURO)

  /**
   * Refleja el tema en el atributo data-tema del elemento html.
   *
   * @returns No retorna valor.
   */
  function aplicarTemaEnDocumento(): void {
    document.documentElement.dataset.tema = temaActual.value
  }

  /**
   * Cambia el tema, lo aplica y lo conserva para la próxima visita (RF-13).
   *
   * @param nuevoTema Tema a aplicar.
   * @returns No retorna valor.
   */
  function establecerTema(nuevoTema: TemaVisual): void {
    temaActual.value = nuevoTema
    aplicarTemaEnDocumento()
    repositorioPreferencias.guardarTema(nuevoTema)
  }

  /**
   * Alterna entre tema claro y oscuro.
   *
   * @returns No retorna valor.
   */
  function alternarTema(): void {
    establecerTema(esTemaOscuro.value ? TEMA_VISUAL.CLARO : TEMA_VISUAL.OSCURO)
  }

  return { temaActual, esTemaOscuro, aplicarTemaEnDocumento, establecerTema, alternarTema }
})
