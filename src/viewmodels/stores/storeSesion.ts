import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { RepositorioPreferenciasLocal } from '@/models/repositorios/RepositorioPreferenciasLocal'

const repositorioPreferencias = new RepositorioPreferenciasLocal()

/** Sesión simulada del usuario (RF-14). No reemplaza una autenticación real. */
export const useStoreSesion = defineStore('sesion', () => {
  const nombreUsuario = ref<string | null>(repositorioPreferencias.obtenerUsuarioSesion())
  const tieneSesionActiva = computed(() => Boolean(nombreUsuario.value))

  /**
   * Inicia la sesión simulada y la conserva al recargar.
   *
   * @param nombreUsuarioIngresado Nombre del usuario validado.
   * @returns No retorna valor.
   */
  function iniciarSesion(nombreUsuarioIngresado: string): void {
    nombreUsuario.value = nombreUsuarioIngresado.trim()
    repositorioPreferencias.guardarUsuarioSesion(nombreUsuario.value)
  }

  /**
   * Cierra la sesión simulada.
   *
   * @returns No retorna valor.
   */
  function cerrarSesion(): void {
    nombreUsuario.value = null
    repositorioPreferencias.eliminarUsuarioSesion()
  }

  return { nombreUsuario, tieneSesionActiva, iniciarSesion, cerrarSesion }
})
