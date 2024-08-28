import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '../components/bbrf/App.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App
  },
  {
    path: '/:program/:tab',
    name: 'ProgramTab',
    component: App
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router