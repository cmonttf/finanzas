# Mis Finanzas

Aplicación web para registrar ingresos y gastos personales, visualizarlos en un dashboard y convertir el saldo a dólar, euro y UF con datos de mindicador.cl.

[![CI](https://github.com/[tu-usuario]/mis-finanzas/actions/workflows/ci.yml/badge.svg)](https://github.com/[tu-usuario]/mis-finanzas/actions)

**Demo:** [https://[tu-sitio].netlify.app](https://[tu-sitio].netlify.app)

![Dashboard de Mis Finanzas](docs/captura-dashboard.png)

## Funcionalidades

- Registro, edición y eliminación de ingresos y gastos con validaciones.
- Listado paginado con filtros combinables por tipo, categoría y rango de fechas.
- Exportación de los movimientos filtrados a CSV.
- Gestión de categorías (crear, renombrar y eliminar sin movimientos asociados).
- Dashboard con saldo, totales mensuales y gráficos de ingresos vs. gastos y gastos por categoría.
- Conversión del saldo a dólar, euro y UF con los valores del día.
- Tema claro y oscuro, inicio de sesión simulado, diseño adaptable y accesibilidad WCAG 2.2 AA.

## Tecnologías

Vue 3 (Composition API) · TypeScript · Pinia · Vue Router · SASS · Axios · Chart.js · date-fns · Vitest · Vite · GitHub Actions · Netlify

## Arquitectura

El proyecto sigue el patrón **MVVM**:

| Capa | Carpeta | Responsabilidad |
| --- | --- | --- |
| Model | `src/models` | Entidades, reglas de negocio, repositorios y servicios externos |
| ViewModel | `src/viewmodels` | Stores de Pinia y composables con estado y lógica de presentación |
| View | `src/views`, `src/components` | Plantillas Vue y estilos SASS, sin lógica de negocio |

Las vistas nunca acceden directamente al Model: ESLint (`no-restricted-imports`) impide que `views/` y `components/` importen desde `src/models`, y que `models/` importe Vue o Pinia. Los repositorios son interfaces, por lo que `localStorage` puede reemplazarse por una API sin modificar vistas ni ViewModels.

## Instalación

Requisitos: Node.js 22.18 o superior.

```bash
git clone https://github.com/[tu-usuario]/mis-finanzas.git
cd mis-finanzas
npm install
cp .env.example .env
npm run dev
```

Con `VITE_REQUIERE_INICIO_SESION=true`, la app pide un inicio de sesión simulado: sirve cualquier nombre y una contraseña de al menos 4 caracteres.

## Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_NOMBRE_APLICACION` | Nombre mostrado en la interfaz | `Mis Finanzas` |
| `VITE_URL_API_INDICADORES` | URL base de la API de indicadores | `https://mindicador.cl/api` |
| `VITE_TIEMPO_ESPERA_API_MS` | Tiempo máximo de espera de la API en milisegundos | `8000` |
| `VITE_REQUIERE_INICIO_SESION` | Activa el inicio de sesión simulado y el guard de rutas | `true` |

## Scripts

| Comando | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisión de tipos y build de producción en `dist/` |
| `npm run test:unit` | Pruebas unitarias |
| `npx vitest run --coverage` | Pruebas con reporte de cobertura |
| `npm run lint` | Revisión de estilo con oxlint y ESLint |

## Calidad

- Pruebas: 61 pruebas unitarias; cobertura del 97 % en Model y ViewModel (umbral 70 %).
- Lighthouse: Rendimiento [XX] · Accesibilidad [XX] · Buenas prácticas [XX].
- axe DevTools: sin errores críticos.

## Decisiones técnicas

- **Pinia en lugar de Vuex:** es el gestor de estado oficial de Vue 3 y se integra mejor con TypeScript.
- **Repositorio como interfaz:** permite cambiar el almacenamiento y facilita las pruebas con dobles en memoria.
- **Variables CSS para temas:** permiten alternar tema en tiempo de ejecución; SASS se usa para tokens y mixins.
- **Fechas en hora local:** se usa date-fns en lugar de `toISOString()`, que trabaja en UTC y en Chile adelanta el día durante la noche.
- **Gráficos accesibles:** cada gráfico tiene descripción para lectores de pantalla y una tabla con los mismos datos.

## Próximos pasos

- [ ] API propia en Laravel para persistencia en servidor.
- [ ] Presupuestos mensuales por categoría.
- [ ] Pruebas E2E con Playwright.

## Autor

Camilo Montt Fierro · [LinkedIn](https://www.linkedin.com/in/camilomonttfierro/) · [GitHub](https://github.com/cmonttf) · [Portafolio](https://cmonttf.github.io/portafolio-profesional/)
