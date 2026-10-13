import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { configuracionAplicacion } from '@/config/configuracionAplicacion'
import { useStoreMovimientos } from '@/viewmodels/stores/storeMovimientos'
import { useStoreSesion } from '@/viewmodels/stores/storeSesion'

declare module 'vue-router' {
  interface RouteMeta {
    titulo: string
    requiereSesion?: boolean
  }
}

/**
 * Redirige a la vista 404 si el movimiento de la ruta no existe (RF-07).
 *
 * @param rutaDestino Ruta a la que se intenta navegar.
 * @returns true para continuar o la ubicación de la vista 404.
 */
async function verificarMovimientoExistente(rutaDestino: RouteLocationNormalized) {
  const storeMovimientos = useStoreMovimientos()
  await storeMovimientos.asegurarMovimientosCargados()
  const existeMovimiento = storeMovimientos.obtenerMovimientoPorIdentificador(
    String(rutaDestino.params.id),
  )
  if (existeMovimiento) return true
  return {
    name: 'no-encontrada',
    params: { rutaNoEncontrada: rutaDestino.path.slice(1).split('/') },
    replace: true,
  }
}

const router = createRouter({
  history: createWebHistory(configuracionAplicacion.urlBaseEnrutador),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/VistaDashboard.vue'),
      meta: { titulo: 'Resumen', requiereSesion: true },
    },
    {
      path: '/movimientos',
      name: 'movimientos',
      component: () => import('@/views/VistaMovimientos.vue'),
      meta: { titulo: 'Movimientos', requiereSesion: true },
    },
    {
      path: '/movimientos/:id',
      name: 'detalle-movimiento',
      component: () => import('@/views/VistaDetalleMovimiento.vue'),
      props: true,
      beforeEnter: verificarMovimientoExistente,
      meta: { titulo: 'Detalle de movimiento', requiereSesion: true },
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: () => import('@/views/VistaCategorias.vue'),
      meta: { titulo: 'Categorías', requiereSesion: true },
    },
    {
      path: '/ingresar',
      name: 'ingresar',
      component: () => import('@/views/VistaIngresar.vue'),
      meta: { titulo: 'Ingresar' },
    },
    {
      path: '/:rutaNoEncontrada(.*)*',
      name: 'no-encontrada',
      component: () => import('@/views/VistaNoEncontrada.vue'),
      meta: { titulo: 'Página no encontrada' },
    },
  ],
})

// Guard de sesión simulada (RF-14).
router.beforeEach((rutaDestino) => {
  if (!configuracionAplicacion.requiereInicioSesion) {
    return rutaDestino.name === 'ingresar' ? { name: 'dashboard' } : true
  }
  const storeSesion = useStoreSesion()
  if (rutaDestino.meta.requiereSesion && !storeSesion.tieneSesionActiva) {
    return { name: 'ingresar', query: { redireccion: rutaDestino.fullPath } }
  }
  if (rutaDestino.name === 'ingresar' && storeSesion.tieneSesionActiva) {
    return { name: 'dashboard' }
  }
  return true
})

router.afterEach((rutaDestino) => {
  document.title = `${rutaDestino.meta.titulo} · ${configuracionAplicacion.nombreAplicacion}`
})

export default router
