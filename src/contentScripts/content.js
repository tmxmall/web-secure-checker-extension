import Vue from 'vue'
import ElementUI from 'element-ui'
// 但是这个样式会影响到主体页面，需要增加范围
import './content.scss'
import Content from './Content.vue'
import util from '../biz/util'

Vue.use(ElementUI)

const node = util.ensureTipNode()
node.classList.add('extension-context')
console.log(node)

// eslint-disable-next-line
new Vue({
  el: node,
  render: (h) => h(Content),
})
// const appInstance = app.$mount()
// node.appendChild(appInstance.$el)
