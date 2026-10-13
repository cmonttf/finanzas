import { reactive, ref } from 'vue'
import { LARGO_MINIMO_CONTRASENA } from '@/config/constantes'
import { esFormularioValido } from '@/models/reglas/validacionesMovimiento'
import {
  validarDatosIngreso,
  type DatosIngreso,
  type ErroresFormularioIngreso,
} from '@/models/reglas/validacionesIngreso'
import { useStoreSesion } from '@/viewmodels/stores/storeSesion'

/**
 * Gestiona el formulario de inicio de sesión simulado (RF-14).
 *
 * @returns Datos, errores y comando de envío del formulario.
 */
export function useFormularioIngreso() {
  const storeSesion = useStoreSesion()
  const datosIngreso = reactive<DatosIngreso>({ nombreUsuario: '', contrasena: '' })
  const erroresIngreso = ref<ErroresFormularioIngreso>({})

  /**
   * Valida los datos e inicia la sesión simulada.
   *
   * @returns true si la sesión se inició; false si hubo errores.
   */
  function enviarFormularioIngreso(): boolean {
    erroresIngreso.value = validarDatosIngreso(datosIngreso)
    if (!esFormularioValido(erroresIngreso.value)) return false
    storeSesion.iniciarSesion(datosIngreso.nombreUsuario)
    datosIngreso.contrasena = ''
    return true
  }

  return {
    datosIngreso,
    erroresIngreso,
    largoMinimoContrasena: LARGO_MINIMO_CONTRASENA,
    enviarFormularioIngreso,
  }
}
