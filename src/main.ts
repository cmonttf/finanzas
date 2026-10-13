import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useStorePreferencias } from './viewmodels/stores/storePreferencias'
import './styles/main.scss'

const app = createApp(App)

app.use(createPinia())

// El tema se aplica antes de montar para evitar un destello del tema incorrecto.
useStorePreferencias().aplicarTemaEnDocumento()

app.use(router)

app.mount('#app')
