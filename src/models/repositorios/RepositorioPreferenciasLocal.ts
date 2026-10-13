import {
  CLAVE_ALMACENAMIENTO_SESION,
  CLAVE_ALMACENAMIENTO_TEMA,
  TEMA_VISUAL,
  type TemaVisual,
} from '@/config/constantes'

/**
 * Persistencia síncrona de preferencias y sesión simulada en localStorage.
 * Es síncrona porque el tema debe aplicarse antes del primer renderizado.
 */
export class RepositorioPreferenciasLocal {
  /**
   * Obtiene el tema guardado por el usuario.
   *
   * @returns Tema guardado o null si nunca eligió uno.
   */
  obtenerTemaGuardado(): TemaVisual | null {
    const temaAlmacenado = this.leerSeguro(CLAVE_ALMACENAMIENTO_TEMA)
    const temasValidos: string[] = Object.values(TEMA_VISUAL)
    return temaAlmacenado && temasValidos.includes(temaAlmacenado)
      ? (temaAlmacenado as TemaVisual)
      : null
  }

  /**
   * Guarda el tema elegido (RF-13).
   *
   * @param tema Tema visual a conservar.
   * @returns No retorna valor.
   */
  guardarTema(tema: TemaVisual): void {
    this.escribirSeguro(CLAVE_ALMACENAMIENTO_TEMA, tema)
  }

  /**
   * Obtiene el nombre del usuario con sesión simulada activa.
   *
   * @returns Nombre de usuario o null si no hay sesión.
   */
  obtenerUsuarioSesion(): string | null {
    return this.leerSeguro(CLAVE_ALMACENAMIENTO_SESION)
  }

  /**
   * Guarda la sesión simulada del usuario (RF-14).
   *
   * @param nombreUsuario Nombre del usuario que ingresó.
   * @returns No retorna valor.
   */
  guardarUsuarioSesion(nombreUsuario: string): void {
    this.escribirSeguro(CLAVE_ALMACENAMIENTO_SESION, nombreUsuario)
  }

  /**
   * Elimina la sesión simulada.
   *
   * @returns No retorna valor.
   */
  eliminarUsuarioSesion(): void {
    try {
      localStorage.removeItem(CLAVE_ALMACENAMIENTO_SESION)
    } catch {
      // Almacenamiento no disponible: no hay sesión que borrar.
    }
  }

  /**
   * Lee una clave tolerando navegadores que bloquean localStorage.
   *
   * @param clave Clave a leer.
   * @returns Valor almacenado o null.
   */
  private leerSeguro(clave: string): string | null {
    try {
      return localStorage.getItem(clave)
    } catch {
      return null
    }
  }

  /**
   * Escribe una clave tolerando navegadores que bloquean localStorage.
   *
   * @param clave Clave a escribir.
   * @param valor Valor a guardar.
   * @returns No retorna valor.
   */
  private escribirSeguro(clave: string, valor: string): void {
    try {
      localStorage.setItem(clave, valor)
    } catch {
      // La preferencia solo dura la sesión actual.
    }
  }
}
