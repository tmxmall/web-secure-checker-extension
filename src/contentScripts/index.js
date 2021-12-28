import './index.sass'
import util from  '../biz/util'
import { sendMsgToBackground } from '../biz/message'

console.error('我是Content S 1')
// 与bg通信
console.log('客户端发送一个消息')
sendMsgToBackground({text: 'hello'}).then(msg => {
  console.log('收到回执', msg)
})
// 创建一个用于展示插件信息的提示窗元素节点，后期可以通过在popup配置器层级
const tipNode = util.ensureTipNode()
// TODO: 需要集成vue动态渲染节点
// 对tipNode设置样式
const tipNodeStyle = [
  'position: fixed;',
  'top: 5px;',
  'right: 5px;',
  'width: 200px;',
  'text-align: right;',
  'padding: 20px;'
]
tipNode.style = tipNodeStyle.join('')
// 由于当前的一些操作本身也会操作节点，会一直触发节点变更更新，所以mutation不适用，会一直相互循环触发

const inputNode = util.scanOnePasswordInput()
inputNode.addEventListener('input', () => {
  const pwd = inputNode.value
  // check the pwd
  const level = util.checkPasswordLevel(pwd)
  console.log('password:', pwd, level)
  const p = document.createElement('p')
  p.textContent = `pwd: ${pwd}, Level: ${level}`
  tipNode.appendChild(p)
})