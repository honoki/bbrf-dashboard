import Vue from 'vue'
import App from './components/bbrf/App.vue'
import router from './router'
import VueMoment from 'vue-moment'
import moment from 'moment'
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';

import VueClipboard from 'vue-clipboard2'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

hljs.registerLanguage('json', json);
import 'highlight.js/styles/github.css';

Vue.prototype.$highlight = (code) => {
  return hljs.highlight(code, { language: 'json' }).value;
};

Vue.config.productionTip = false

Vue.use(VueClipboard)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

Vue.use(VueMoment, { moment })

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')