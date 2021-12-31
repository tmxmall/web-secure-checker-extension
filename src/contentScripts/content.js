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


// 注入一个inject.js

/**
 * code in inject.js
 * added "web_accessible_resources": ["injected.js"] to manifest.json
 */
const s = document.createElement('script')
s.src = chrome.extension.getURL('inject.js')
s.onload = () => {
  s.remove()
}
(document.head || document.documentElement).appendChild(s)
