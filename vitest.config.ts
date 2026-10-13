import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/tests/unit/**/*.spec.ts'],
      exclude: [...configDefaults.exclude, 'src/tests/e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      env: {
        VITE_URL_API_INDICADORES: 'https://api-de-prueba.local',
      },
      coverage: {
        provider: 'v8',
        include: ['src/models/**', 'src/viewmodels/**'],
        exclude: ['src/viewmodels/tipos.ts', 'src/models/entidades/**'],
        reporter: ['text', 'html'],
        thresholds: { lines: 70, functions: 70, branches: 70 },
      },
    },
  }),
)
