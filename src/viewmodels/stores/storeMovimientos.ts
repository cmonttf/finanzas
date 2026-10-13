import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { TIPO_MOVIMIENTO } from '@/config/constantes'
import type { DatosNuevoMovimiento, Movimiento } from '@/models/entidades/Movimiento'
import { contarMovimientosPorCategoria } from '@/models/reglas/agrupacionesMovimientos'
import {
  calcularSaldoMovimientos,
  calcularTotalPorTipoMovimiento,
} from '@/models/reglas/calculosFinancieros'
import { ordenarMovimientosPorFechaDescendente } from '@/models/reglas/filtrosMovimientos'
import type { RepositorioMovimientos } from '@/models/repositorios/RepositorioMovimientos'
import { RepositorioMovimientosLocal } from '@/models/repositorios/RepositorioMovimientosLocal'

let repositorioMovimientos: RepositorioMovimientos = new RepositorioMovimientosLocal()

/**
 * Reemplaza el repositorio usado por el store. Pensado para pruebas o para la v2.0 con API.
 *
 * @param nuevoRepositorio Implementación del repositorio a utilizar.
 * @returns No retorna valor.
 */
export function configurarRepositorioMovimientos(nuevoRepositorio: RepositorioMovimientos): void {
  repositorioMovimientos = nuevoRepositorio
}

export const useStoreMovimientos = defineStore('movimientos', () => {
  const movimientos = ref<Movimiento[]>([])
  const estaCargandoMovimientos = ref(false)
  const movimientosCargados = ref(false)
  let cargaEnCurso: Promise<void> | null = null

  const movimientosOrdenadosPorFecha = computed(() =>
    ordenarMovimientosPorFechaDescendente(movimientos.value),
  )
  const totalIngresos = computed(() =>
    calcularTotalPorTipoMovimiento(movimientos.value, TIPO_MOVIMIENTO.INGRESO),
  )
  const totalGastos = computed(() =>
    calcularTotalPorTipoMovimiento(movimientos.value, TIPO_MOVIMIENTO.GASTO),
  )
  const saldoActual = computed(() => calcularSaldoMovimientos(movimientos.value))
  const cantidadMovimientosPorCategoria = computed(() =>
    contarMovimientosPorCategoria(movimientos.value),
  )

  /**
   * Carga desde el repositorio todos los movimientos registrados.
   * Llamadas simultáneas comparten la misma carga.
   *
   * @returns Promesa que se resuelve cuando los movimientos quedan en el estado.
   */
  function cargarMovimientosRegistrados(): Promise<void> {
    if (cargaEnCurso) return cargaEnCurso
    estaCargandoMovimientos.value = true
    cargaEnCurso = repositorioMovimientos
      .obtenerTodosLosMovimientos()
      .then((movimientosObtenidos) => {
        movimientos.value = movimientosObtenidos
        movimientosCargados.value = true
      })
      .finally(() => {
        estaCargandoMovimientos.value = false
        cargaEnCurso = null
      })
    return cargaEnCurso
  }

  /**
   * Carga los movimientos solo si aún no se han cargado.
   *
   * @returns Promesa que se resuelve cuando los movimientos están disponibles.
   */
  async function asegurarMovimientosCargados(): Promise<void> {
    if (!movimientosCargados.value) await cargarMovimientosRegistrados()
  }

  /**
   * Busca un movimiento por su identificador.
   *
   * @param identificador Identificador del movimiento.
   * @returns Movimiento encontrado o undefined.
   */
  function obtenerMovimientoPorIdentificador(identificador: string): Movimiento | undefined {
    return movimientos.value.find((movimiento) => movimiento.identificador === identificador)
  }

  /**
   * Registra un movimiento nuevo y lo agrega al estado.
   *
   * @param datosMovimiento Datos validados del movimiento.
   * @returns Movimiento creado con su identificador.
   */
  async function registrarNuevoMovimiento(
    datosMovimiento: DatosNuevoMovimiento,
  ): Promise<Movimiento> {
    const movimientoCreado = await repositorioMovimientos.guardarNuevoMovimiento(datosMovimiento)
    movimientos.value.push(movimientoCreado)
    return movimientoCreado
  }

  /**
   * Actualiza un movimiento existente en el repositorio y en el estado (RF-03).
   *
   * @param movimientoModificado Movimiento con los cambios aplicados.
   * @returns Promesa que se resuelve al completar la actualización.
   */
  async function actualizarMovimientoExistente(movimientoModificado: Movimiento): Promise<void> {
    await repositorioMovimientos.actualizarMovimiento(movimientoModificado)
    movimientos.value = movimientos.value.map((movimiento) =>
      movimiento.identificador === movimientoModificado.identificador
        ? movimientoModificado
        : movimiento,
    )
  }

  /**
   * Elimina un movimiento del repositorio y del estado (RF-04).
   *
   * @param identificador Identificador del movimiento a eliminar.
   * @returns Promesa que se resuelve al completar la eliminación.
   */
  async function eliminarMovimiento(identificador: string): Promise<void> {
    await repositorioMovimientos.eliminarMovimientoPorIdentificador(identificador)
    movimientos.value = movimientos.value.filter(
      (movimiento) => movimiento.identificador !== identificador,
    )
  }

  return {
    movimientos,
    estaCargandoMovimientos,
    movimientosCargados,
    movimientosOrdenadosPorFecha,
    totalIngresos,
    totalGastos,
    saldoActual,
    cantidadMovimientosPorCategoria,
    cargarMovimientosRegistrados,
    asegurarMovimientosCargados,
    obtenerMovimientoPorIdentificador,
    registrarNuevoMovimiento,
    actualizarMovimientoExistente,
    eliminarMovimiento,
  }
})
