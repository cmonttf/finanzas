import { LARGO_MINIMO_CONTRASENA } from '@/config/constantes'

/** Datos del formulario de inicio de sesión simulado. */
export interface DatosIngreso {
  nombreUsuario: string
  contrasena: string
}

/** Mensajes de error por campo del formulario de ingreso. */
export type ErroresFormularioIngreso = Partial<Record<keyof DatosIngreso, string>>

/**
 * Valida el formulario de inicio de sesión simulado (RF-14).
 *
 * @param datosIngreso Nombre de usuario y contraseña.
 * @returns Mensaje por cada campo inválido; vacío si todo es válido.
 */
export function validarDatosIngreso(datosIngreso: DatosIngreso): ErroresFormularioIngreso {
  const erroresEncontrados: ErroresFormularioIngreso = {}
  if (!datosIngreso.nombreUsuario.trim()) {
    erroresEncontrados.nombreUsuario = 'Ingresa tu nombre de usuario.'
  }
  if (datosIngreso.contrasena.length < LARGO_MINIMO_CONTRASENA) {
    erroresEncontrados.contrasena = `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`
  }
  return erroresEncontrados
}
