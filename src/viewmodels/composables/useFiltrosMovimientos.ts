import { computed, reactive, ref, watch } from 'vue'
import { configuracionAplicacion } from '@/config/configuracionAplicacion'
import type { FiltrosMovimientos } from '@/models/entidades/FiltrosMovimientos'
import { generarCsvMovimientos } from '@/models/reglas/exportacionCsv'
import { obtenerFechaIsoLocal } from '@/models/reglas/fechas'
import {
  calcularTotalPaginas,
  filtrarMovimientos,
  obtenerPagina,
  tieneRangoFechasInvalido,
} from '@/models/reglas/filtrosMovimientos'
import { descargarArchivoTexto } from '@/models/servicios/servicioDescargaArchivos'
import { useStoreCategorias } from '@/viewmodels/stores/storeCategorias'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'

/**
 * Crea filtros vacíos, que no excluyen ningún movimiento.
 *
 * @returns Filtros sin criterios.
 */
function crearFiltrosVacios(): FiltrosMovimientos {
  return { tipo: '', identificadorCategoria: '', fechaDesde: '', fechaHasta: '' }
}

/**
 * Gestiona filtros combinables (RF-06), paginación (RF-05) y exportación CSV (RF-12) del listado.
 *
 * @returns Filtros, página actual, movimientos visibles y comandos del listado.
 */
export function useFiltrosMovimientos() {
  const storeMovimientos = useStoreMovimientos()
  const storeCategorias = useStoreCategorias()
  const movimientosPorPagina = configuracionAplicacion.movimientosPorPagina

  const filtros = reactive<FiltrosMovimientos>(crearFiltrosVacios())
  const paginaActual = ref(1)

  const hayRangoFechasInvalido = computed(() => tieneRangoFechasInvalido(filtros))
  const hayFiltrosActivos = computed(() => Object.values(filtros).some(Boolean))
  const movimientosFiltrados = computed(() =>
    hayRangoFechasInvalido.value
      ? []
      : filtrarMovimientos(storeMovimientos.movimientosOrdenadosPorFecha, filtros),
  )
  const totalPaginas = computed(() =>
    calcularTotalPaginas(movimientosFiltrados.value.length, movimientosPorPagina),
  )
  const movimientosPaginaActual = computed(() =>
    obtenerPagina(movimientosFiltrados.value, paginaActual.value, movimientosPorPagina),
  )

  // Al cambiar un filtro se vuelve a la primera página.
  watch(filtros, () => {
    paginaActual.value = 1
  })

  // Si se eliminan movimientos y la página queda vacía, se retrocede.
  watch(totalPaginas, (nuevoTotalPaginas) => {
    if (paginaActual.value > nuevoTotalPaginas) paginaActual.value = nuevoTotalPaginas
  })

  /**
   * Cambia a la página indicada, dentro de los límites válidos.
   *
   * @param numeroPagina Página destino, comenzando en 1.
   * @returns No retorna valor.
   */
  function irAPagina(numeroPagina: number): void {
    paginaActual.value = Math.min(Math.max(1, numeroPagina), totalPaginas.value)
  }

  /**
   * Quita todos los filtros.
   *
   * @returns No retorna valor.
   */
  function limpiarFiltros(): void {
    Object.assign(filtros, crearFiltrosVacios())
  }

  /**
   * Descarga los movimientos filtrados como archivo CSV.
   *
   * @returns No retorna valor.
   */
  function exportarMovimientosFiltradosCsv(): void {
    const contenidoCsv = generarCsvMovimientos(
      movimientosFiltrados.value,
      storeCategorias.obtenerNombreCategoria,
    )
    descargarArchivoTexto(`movimientos-${obtenerFechaIsoLocal()}.csv`, contenidoCsv)
  }

  return {
    filtros,
    paginaActual,
    totalPaginas,
    movimientosFiltrados,
    movimientosPaginaActual,
    hayRangoFechasInvalido,
    hayFiltrosActivos,
    irAPagina,
    limpiarFiltros,
    exportarMovimientosFiltradosCsv,
  }
}
