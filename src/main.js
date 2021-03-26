import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import VueClipboard from 'vue-clipboard2'
import { BootstrapVueIcons } from 'bootstrap-vue'

Vue.use(VueClipboard)
Vue.use(BootstrapVueIcons)

new Vue({
  render: h => h(App)
}).$mount('#app')