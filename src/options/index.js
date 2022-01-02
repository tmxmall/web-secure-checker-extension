import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import Option from './Option.vue'

Vue.use(ElementUI)

// eslint-disable-next-line
new Vue({
  el: '#app',
  render: (h) => h(Option),
})
