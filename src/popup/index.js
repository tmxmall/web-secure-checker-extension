import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Popup from './Popup.vue'

Vue.use(ElementUI)

// eslint-disable-next-line
new Vue({
  el: '#app',
  render: (h) => h(Popup),
})
