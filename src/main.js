import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)

new Vue({
  render: h => h(App)
}).$mount('#app')