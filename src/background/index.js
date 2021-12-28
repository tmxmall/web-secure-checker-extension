import { CONTENT_MSG_TYPE, CONTENT_MSG_BIZ_GET_CONFIG, CONTENT_MSG_BIZ_SAVE_CONFIG } from '../biz/common'
import { sendMsgToTab } from '../biz/message'
import util from '../biz/util'

if (process.env.NODE_ENV === 'development') {
  console.log('development')
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('plugin installed')
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg, sender, sendResponse)
  if (msg && msg.type === CONTENT_MSG_TYPE) {
    const bizType = msg.biz
    const { body } = msg
    console.log(bizType)
    if (bizType) {
      if (bizType === CONTENT_MSG_BIZ_GET_CONFIG) {
        // 客户端content处理获取插件配置信息
        util.getPluginConfig()
          .then(config => {
            sendMsgToTab(config, msg.msgId, bizType, sender.tab.id)
          })
      } else if (bizType === CONTENT_MSG_BIZ_SAVE_CONFIG) {
        // 保存更新插件配置
        chrome.storage.sync.set({ plugin_config: body })
        // 跟新配置后，需要将消息发送到tab页面内，将插件
        sendMsgToTab(body, '', CONTENT_MSG_BIZ_SAVE_CONFIG, '')
      }
    } else {
      // send msg back(为了确保回复消息可能有偶异步或同步，所以不用sendResponse进行回复，统一使用向指定tab发送消息)
      const newMsg = {cmd:'test', value:'你好，我是background！'}
      // sendMessageToContentScript(newMsg, sender.tab.id)
      sendMsgToTab(newMsg, msg.msgId, '', sender.tab.id)
    }
  }
})

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const {initiator, method, url, type, tabId} = details
    // console.log(details)
    // console.log(initiator, method, type, tabId, url)
    return {}
  },
  {urls: ["<all_urls>"]}
)

// 对请求和响应的数据机型获取并输送到util进行分析，将分析的结果输送到系统存储
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log('before request')
    console.log({details})
  },
  {urls: ["<all_urls>"]} // TODO: match the configured urls
)
chrome.webRequest.onCompleted.addListener(
  e => {
    console.log('compelted')
    console.log(e)
  },
  {urls: ["<all_urls>"]}
)

chrome.webRequest.onHeadersReceived.addListener(detail => {
  console.log('response header')
  console.log(detail)
}, {urls: ["<all_urls>"]})
