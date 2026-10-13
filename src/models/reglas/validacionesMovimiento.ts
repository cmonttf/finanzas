import { LARGO_MAXIMO_DESCRIPCION_MOVIMIENTO, TIPO_MOVIMIENTO } from '@/config/constantes'
import type { DatosNuevoMovimiento } from '@/models/entidades/Movimiento'
import { obtenerFechaIsoLocal } from './fechas'

/** Mensajes de error por campo; un campo ausente significa que es válido. */
export type ErroresFormularioMovimiento = Partial<Record<keyof DatosNuevoMovimiento, string>>

/**
 * Valida los datos de un movimiento según RF-02.
 *
 * @param datosMovimiento Datos ingresados en el formulario.
 * @param fechaActual Fecha de referencia para rechazar fechas futuras (inyectable en pruebas).
 * @returns Objeto con un mensaje por cada campo inválido; vacío si todo es válido.
 */
export function validarDatosMovimiento(
  datosMovimiento: DatosNuevoMovimiento,
  fechaActual: Date = new Date(),
): ErroresFormularioMovimiento {
  const erroresEncontrados: ErroresFormularioMovimiento = {}
  const fechaActualIso = obtenerFechaIsoLocal(fechaActual)
  const tiposValidos: string[] = Object.values(TIPO_MOVIMIENTO)

  if (!tiposValidos.includes(datosMovimiento.tipo)) {
    erroresEncontrados.tipo = 'Selecciona si es ingreso o gasto.'
  }
  if (!Number.isInteger(datosMovimiento.monto) || datosMovimiento.monto <= 0) {
    erroresEncontrados.monto = 'Ingresa un monto entero mayor que cero.'
  }
  if (!datosMovimiento.fecha) {
    erroresEncontrados.fecha = 'Selecciona una fecha.'
  } else if (datosMovimiento.fecha > fechaActualIso) {
    erroresEncontrados.fecha = 'La fecha no puede ser futura.'
  }
  if (!datosMovimiento.identificadorCategoria) {
    erroresEncontrados.identificadorCategoria = 'Selecciona una categoría.'
  }
  if (datosMovimiento.descripcion.length > LARGO_MAXIMO_DESCRIPCION_MOVIMIENTO) {
    erroresEncontrados.descripcion = `Máximo ${LARGO_MAXIMO_DESCRIPCION_MOVIMIENTO} caracteres.`
  }
  return erroresEncontrados
}

/**
 * Indica si un objeto de errores por campo no contiene mensajes.
 *
 * @param errores Errores por campo.
 * @returns true cuando no hay errores.
 */
export function esFormularioValido(errores: object): boolean {
  return Object.keys(errores).length === 0
}
