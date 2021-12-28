import { CONTENT_MSG_TYPE, MSG_ID_SEED } from "./common"

/**
 * 用于content,popup和background之间的通讯
 * 实现消息通讯并返回promise
 */
const msgWaitMap = {}

const genMsgId = () => { return MSG_ID_SEED + 1 }

export const initMsg = (listener) => {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    sendResponse('ok')
    if (!msg) return
    const {msgId, body, type, biz } = msg
    if (type !== CONTENT_MSG_TYPE) {
      return // 非content msg不处理
    }
    if (msgId) {
      // 有promise在等
      const promiseHandlers = msgWaitMap[msgId]
      const resolver = promiseHandlers && promiseHandlers[0]
      if (resolver) {
        // 处理回调并结束流程
        // 清空回调函数
        resolver(body)
        msgWaitMap[msgId] = null
        return
      }
    }
    // 没有msgId或resolver的消息继续走以下流程
    if (listener && body) {
      // 如果有注册回调，则通知调用
      listener(biz, body)
    }
    // 没有回调的页面，不需要通知
  })
}

// 发送消息后后台，需要明确业务场景和消息内容
export const sendMsgToBackground = (bizType, msg) => {
  return new Promise((resolve, reject) => {
    const newMsgId = genMsgId()
    msgWaitMap[newMsgId] = [resolve, reject]
    // 由于返回消息可能是异步，所以不能直接等响应，需要对msg进行增加msgId属性进行监听
    chrome.runtime.sendMessage({body: msg, biz: bizType, msgId: newMsgId, type: CONTENT_MSG_TYPE})
  })
}

// 仅background使用(popup也可以使用)
export const sendMsgToTab = (msg, msgId, bizType, tabId)  => {
  console.log('send msg to tab')
  let isResolved = false
  return new Promise((resolve, reject) => {
    // 如果有tabId，则定向发送
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {body: msg, msgId, biz: bizType, type: CONTENT_MSG_TYPE}, (responseMsg) => {
        if (!isResolved) {
          resolve(responseMsg)
        }
        isResolved = true
      })
    } else {
      // 如果没有，则所有页面都发送
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>{
        tabs.forEach(tab => {
          // 每个页面都会收到消息
          // TODO: 需要定制一个32位的唯一id保证相关组件只处理自己扩展收到的消息
          chrome.tabs.sendMessage(tab.id, {body: msg, biz: bizType, msgId, type: CONTENT_MSG_TYPE})
        })
      })
    }
    setTimeout(() => {
      if (!isResolved) {
        reject(new Error('timeout'))
      }
    }, 10* 1000)
  })
}
