import { computed, reactive, ref } from 'vue'
import { LARGO_MAXIMO_DESCRIPCION_MOVIMIENTO, TIPO_MOVIMIENTO } from '@/config/constantes'
import type { DatosNuevoMovimiento, Movimiento } from '@/models/entidades/Movimiento'
import { obtenerFechaIsoLocal } from '@/models/reglas/fechas'
import {
  esFormularioValido,
  validarDatosMovimiento,
  type ErroresFormularioMovimiento,
} from '@/models/reglas/validacionesMovimiento'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'

/** Estado editable del formulario; el monto admite vacío mientras el usuario escribe. */
type DatosFormularioMovimiento = Omit<DatosNuevoMovimiento, 'monto'> & { monto: number | '' }

/**
 * Crea el estado inicial del formulario, vacío o con los datos del movimiento a editar.
 *
 * @param movimientoAEditar Movimiento existente, si el formulario es de edición.
 * @returns Datos iniciales del formulario.
 */
function crearDatosIniciales(movimientoAEditar?: Movimiento): DatosFormularioMovimiento {
  if (movimientoAEditar) {
    const { identificador: _identificador, ...datosMovimiento } = movimientoAEditar
    return { ...datosMovimiento }
  }
  return {
    tipo: TIPO_MOVIMIENTO.GASTO,
    monto: '',
    fecha: obtenerFechaIsoLocal(),
    identificadorCategoria: '',
    descripcion: '',
  }
}

/**
 * Gestiona el estado, la validación y el guardado del formulario de movimientos.
 * Sirve para registrar (RF-01) y, si recibe un movimiento, para editarlo (RF-03).
 *
 * @param movimientoAEditar Movimiento existente que se desea editar.
 * @returns Estado del formulario, errores por campo, indicadores y comandos.
 */
export function useFormularioMovimiento(movimientoAEditar?: Movimiento) {
  const storeMovimientos = useStoreMovimientos()

  const datosFormulario = reactive<DatosFormularioMovimiento>(
    crearDatosIniciales(movimientoAEditar),
  )
  const erroresFormulario = ref<ErroresFormularioMovimiento>({})
  const mensajeErrorGuardado = ref('')
  const estaGuardandoMovimiento = ref(false)
  const esModoEdicion = Boolean(movimientoAEditar)
  const fechaMaximaPermitida = obtenerFechaIsoLocal()
  const caracteresRestantesDescripcion = computed(
    () => LARGO_MAXIMO_DESCRIPCION_MOVIMIENTO - datosFormulario.descripcion.length,
  )

  /**
   * Convierte el estado del formulario a datos de movimiento.
   *
   * @returns Datos con el monto como número y la descripción sin espacios sobrantes.
   */
  function obtenerDatosNormalizados(): DatosNuevoMovimiento {
    return {
      ...datosFormulario,
      monto: datosFormulario.monto === '' ? Number.NaN : Number(datosFormulario.monto),
      descripcion: datosFormulario.descripcion.trim(),
    }
  }

  /**
   * Valida el formulario y, si es correcto, registra o actualiza el movimiento en el store.
   *
   * @returns true si el movimiento se guardó; false si hubo errores.
   */
  async function enviarFormularioMovimiento(): Promise<boolean> {
    mensajeErrorGuardado.value = ''
    const datosMovimiento = obtenerDatosNormalizados()
    erroresFormulario.value = validarDatosMovimiento(datosMovimiento)
    if (!esFormularioValido(erroresFormulario.value)) return false

    estaGuardandoMovimiento.value = true
    try {
      if (movimientoAEditar) {
        await storeMovimientos.actualizarMovimientoExistente({
          identificador: movimientoAEditar.identificador,
          ...datosMovimiento,
        })
      } else {
        await storeMovimientos.registrarNuevoMovimiento(datosMovimiento)
        Object.assign(datosFormulario, crearDatosIniciales())
      }
      return true
    } catch {
      mensajeErrorGuardado.value = 'No se pudo guardar el movimiento. Inténtalo nuevamente.'
      return false
    } finally {
      estaGuardandoMovimiento.value = false
    }
  }

  return {
    datosFormulario,
    erroresFormulario,
    mensajeErrorGuardado,
    estaGuardandoMovimiento,
    esModoEdicion,
    fechaMaximaPermitida,
    caracteresRestantesDescripcion,
    largoMaximoDescripcion: LARGO_MAXIMO_DESCRIPCION_MOVIMIENTO,
    enviarFormularioMovimiento,
  }
}
