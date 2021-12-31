import { CONTENT_MSG_TYPE, CONTENT_MSG_BIZ_GET_CONFIG, CONTENT_MSG_BIZ_SAVE_CONFIG, CONTENT_MSG_BIZ_NEW_DATA_RECEVIED, CONTENT_MSG_BIZ_NEW_DATA_DETECTED, CONTENT_MSG_BIZ_LOAD_ALL_DATA } from '../biz/common'
import { sendMsgToTab } from '../biz/message'
import util from '../biz/util'
import rule from '../biz/rule'
import localdb from '../biz/db'

if (process.env.NODE_ENV === 'development') {
  console.log('development')
}

// 注意常驻时的内存消耗和溢出,所以需要限制一个最大数组长度
const globalRequestCacheList = []
const globalRequestRecordCacheList = []
let pluginConfig = {}

const transformHeaderList2Map = headers => {
  const headerMap = {}
  headers.forEach(i => {
    headerMap[i.name] = i.value
  })
  return headerMap
}

const checkRequestSiteEnabled = (initiator) => {
  return pluginConfig.enabled && pluginConfig.sites && pluginConfig.sites.length && pluginConfig.sites.find(i => i.site === initiator)
}

chrome.runtime.onInstalled.addListener(() => {
  console.warn('wsc plugin installed')
})

// 第三个参数暂时不用sendResponse
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === CONTENT_MSG_TYPE) {
    const bizType = msg.biz
    const { body } = msg
    if (bizType) {
      // console.log(bizType, body)
    }
    if (bizType === CONTENT_MSG_BIZ_GET_CONFIG) {
      // 客户端content处理获取插件配置信息
      util.getPluginConfig()
        .then(config => {
          pluginConfig = config
          sendMsgToTab(config, msg.msgId, bizType, sender.tab.id)
        })
        return
    }
    if (bizType === CONTENT_MSG_BIZ_SAVE_CONFIG) {
      // 保存更新插件配置
      pluginConfig = body
      chrome.storage.sync.set({ plugin_config: body })
      // 跟新配置后，需要将消息发送到tab页面内，将插件
      sendMsgToTab(body, '', CONTENT_MSG_BIZ_SAVE_CONFIG, '')
      return
    }
    if (bizType === CONTENT_MSG_BIZ_NEW_DATA_RECEVIED) {
      // merge the headers data
      // 由于background拦截信息是在onHeadersReceived，所以信息一定会先经过本文件事件处理后，才会收到来自前端的响应结果的消息通知
      // 所以此处是完全可以使用requestRecord信息的
      // 需通过customUniqueRequestId进行记录匹配识别
      // 对body进行分析并入库
      const requestRecord = globalRequestRecordCacheList.find(i => i.customUniqueRequestId === body.customUniqueRequestId)
      if (!requestRecord) {
        return
      }
      Object.assign(body, requestRecord.content)
      // 所有规则执行和数据存储都交给rulejs
      const newRequestRecord = rule.checkRequest(body)
      // 如果识别命中了，则通知content显示
      if (newRequestRecord.hitTypes && newRequestRecord.hitTypes.length) {
        sendMsgToTab(newRequestRecord, msg.msgId, CONTENT_MSG_BIZ_NEW_DATA_DETECTED, sender.tab.id)
      }
      return
    }
    if (bizType === CONTENT_MSG_BIZ_LOAD_ALL_DATA) {
      // 查询数据，这里需要根据当前页面的host匹配只查询对应网站的统计数据
      localdb.query(sender.origin, 7).then(records => {
        sendMsgToTab(records, msg.msgId, CONTENT_MSG_BIZ_LOAD_ALL_DATA, sender.tab.id)
      })
      return
    }
    // send msg back(为了确保回复消息可能有偶异步或同步，所以不用sendResponse进行回复，统一使用向指定tab发送消息)
    const newMsg = {text: '已收到您的消息，但没有被正确处理'}
    // sendMessageToContentScript(newMsg, sender.tab.id)
    sendMsgToTab(newMsg, msg.msgId, '', sender.tab.id)
  }
})

// 对请求和响应的数据机型获取并输送到util进行分析，将分析的结果输送到系统存储
// 处理所有请求的header信息收集
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const {type, tabId, requestId, initiator} = details
    // 仅处理插件配置中需要的域名信息，需对initiator进行体检识别和拦截
    // TODO: inject和contentjs注入时机较晚，不能完全获取所有拦截信息
    if (!checkRequestSiteEnabled(initiator)) {
      return
    }
    // console.log(details)
    // 仅处理ajax异步请求
    if (type === 'xmlhttprequest') {
      const headerMap = transformHeaderList2Map(details.requestHeaders)
      if (!headerMap.customUniqueRequestId) {
        return
      }
      headerMap.tabId = tabId
      headerMap.requestId = requestId // 用于与response中信息关联配对
      // console.warn('request headers', requestId, headerMap)
      // 对这一条header信息进行临时缓存
      globalRequestCacheList.unshift({id: `${tabId}-${requestId}`, content: headerMap})
      // 限制个数, 直接每次都从第500个地方删除2个，多删除一个是防止意外删除失败后一直多余一个会越积越多
      globalRequestCacheList.splice(500, 2)
    }
  },
  {urls: ["<all_urls>"]},
  ['extraHeaders', 'requestHeaders']
)

chrome.webRequest.onHeadersReceived.addListener(details => {
  const {type, tabId, requestId, initiator, url, statusCode, statusLine, timeStamp} = details
  if (!checkRequestSiteEnabled(initiator)) {
    return
  }
  if (type === 'xmlhttprequest') {
    // console.log(details)
    const relatedRequestInfo = globalRequestCacheList.find(i => i.id === `${tabId}-${requestId}`)
    if (!relatedRequestInfo) {
      return
    }
    const headerMap = transformHeaderList2Map(details.responseHeaders)
    // 定义一个完整的请求和响应数据
    const requestRecord = {
      customUniqueRequestId: relatedRequestInfo.content.customUniqueRequestId,
      initiator,
      url,
      statusCode,
      statusLine,
      timeStamp,
      reqHeaders: relatedRequestInfo.content,
      resHeaders: headerMap,
    }
    // console.warn('requestRecord', requestRecord)
    globalRequestRecordCacheList.unshift({customUniqueRequestId: requestRecord.customUniqueRequestId, content: requestRecord})
    globalRequestRecordCacheList.splice(500, 2)
  }
},
{urls: ["<all_urls>"]},
['extraHeaders', 'responseHeaders']
)
