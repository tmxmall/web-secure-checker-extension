import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 但是这个样式会影响到主体页面，需要增加范围
// import './content.scss'
import Option from './Option.vue'

Vue.use(ElementUI)

// eslint-disable-next-line
new Vue({
  el: '#app',
  render: (h) => h(Option),
})
