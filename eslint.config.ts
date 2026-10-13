import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    name: 'app/convenciones',
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },

  // RNF-01: la View solo depende de viewmodels/ y config/, nunca del Model.
  {
    name: 'app/arquitectura-mvvm-view',
    files: ['src/views/**', 'src/components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/models/*', '@/models/**', '../models/*', '../../models/*'],
              message: 'La View debe usar el ViewModel (src/viewmodels), no el Model.',
            },
          ],
        },
      ],
    },
  },

  // El Model es TypeScript puro: no conoce Vue, Pinia ni la View.
  {
    name: 'app/arquitectura-mvvm-model',
    files: ['src/models/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['vue', 'pinia', 'vue-router'],
          patterns: [{ group: ['@/viewmodels/*', '@/views/*', '@/components/*', '*.vue'] }],
        },
      ],
    },
  },

  // El ViewModel no importa componentes .vue.
  {
    name: 'app/arquitectura-mvvm-viewmodel',
    files: ['src/viewmodels/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['*.vue', '@/views/*', '@/components/*'] }] },
      ],
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/tests/**/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
