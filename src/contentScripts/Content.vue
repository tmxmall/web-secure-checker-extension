<template>
  <div v-if="isSiteEnabled" class="extension-context" :class="[fold ? 'fold' : '', 'level-' + passWordLevel]">
    <!-- 由于本组件是content注入模式，该组件内的事件响应会失效，需要借用inject模式注入组件 -->
    <!-- https://www.bookstack.cn/read/chrome-plugin-develop/spilt.6.spilt.4.8bdb1aac68bbdc44.md -->
    <span class="fold-toggle" :class="{even: changeCount % 5 == 0}" @click="toggle">
      {{ fold ? '展开':'收起' }}
    </span>
    <div class="checked-result-range" :class="{fold}">
      <!-- 如果开启了密码强度计算且当前页面有密码输入框 -->
      <div v-if="config.pwdCheckEnabeld && hasPasswordInput" class="cate-item">
        密码强度：<span :class="'strong-' + passWordLevel">{{ passWordLevelLabel }}</span>
      </div>
      <!-- 其他五六类的统计结果展示 -->
      <el-alert type="warning" :show-icon="false" :closable="false">存在安全隐患的API数量统计：</el-alert>
      <div v-if="config.requestDataCheckEnabeld" class="cate-item">
        <span class="text-label">请求安全： </span>
        <animation-number :value="requestCount" class="count-number"></animation-number>
      </div>
      <div v-if="config.responseDataCheckEnabeld" class="cate-item">
        <span class="text-label">敏感数据： </span>
        <animation-number :value="responseCount" class="count-number"></animation-number>
      </div>
      <div v-if="config.crossSiteCheckEnabeld" class="cate-item">
        <span class="text-label">跨域访问： </span>
        <animation-number :value="crossSiteCount" class="count-number"></animation-number>
      </div>
      <div v-if="config.siteCheckEnabeld" class="cate-item">
        <span class="text-label">站点安全： </span>
        <animation-number :value="siteSecureCount" class="count-number"></animation-number>
      </div>
      <div v-if="config.performanceCheckEnabeld" class="cate-item">
        <span class="text-label">加载性能： </span>
        <animation-number :value="performanceCount" class="count-number"></animation-number>
      </div>
    </div>
  </div>
</template>
<script>
import util from '../biz/util'
import * as message from '../biz/message'
import { CONTENT_MSG_BIZ_GET_CONFIG, CONTENT_MSG_BIZ_LOAD_ALL_DATA, CONTENT_MSG_BIZ_NEW_DATA_RECEVIED, CONTENT_MSG_BIZ_SAVE_CONFIG, HIT_TYPE_CROSS_SITE, HIT_TYPE_DELETE_WITHOUT_PARAM, HIT_TYPE_DELETE_WITH_GET, HIT_TYPE_FREQUENCE, HIT_TYPE_HTTP_ONLY, HIT_TYPE_MAX_PAGE_SIZE, HIT_TYPE_NON_HTTPS, HIT_TYPE_PERFORMANCE_1, HIT_TYPE_RES_KEY_PASSWORD, HIT_TYPE_RES_KEY_SECURE, HIT_TYPE_RES_KEY_USERINFO, HIT_TYPE_RES_KEY_VCODE, HIT_TYPE_RES_TIME_TOO_LONG, HIT_TYPE_RES_VALUE_BANKCARD, HIT_TYPE_RES_VALUE_BODY_TOO_LARGE, HIT_TYPE_RES_VALUE_EMAIL, HIT_TYPE_RES_VALUE_ID, HIT_TYPE_RES_VALUE_PHONE, HIT_TYPE_RES_VALUE_VCODE, HIT_TYPE_SAME_SITE, UNIQUE_INJECT_ID } from '../biz/common'

/**
 * 插件支持配置多个contentjs脚本，可以在文档加载之前就注入一段脚本，对xmlHttpRequest类进行覆盖重构
 * 重构中
 *  需自定义requestId
 *  对send方法尽心重写，实现将所有数据参数发送到background
 *  对responseText响应进行拦截并将数据发送到background
 */
const isEnabled = config => config && config.enabled && config.sites && config.sites.length && config.sites.find(i => i.site === window.location.origin)
const isPwdEnabled = config => isEnabled(config) && config.pwdCheckEnabeld
const kind1Types = [
  HIT_TYPE_DELETE_WITH_GET,
  HIT_TYPE_DELETE_WITHOUT_PARAM,
  HIT_TYPE_MAX_PAGE_SIZE
]
const kind2Types = [
  HIT_TYPE_RES_KEY_PASSWORD,
  HIT_TYPE_RES_KEY_SECURE,
  HIT_TYPE_RES_KEY_USERINFO,
  HIT_TYPE_RES_KEY_VCODE,
  HIT_TYPE_RES_VALUE_PHONE,
  HIT_TYPE_RES_VALUE_EMAIL,
  HIT_TYPE_RES_VALUE_ID,
  HIT_TYPE_RES_VALUE_BANKCARD,
  HIT_TYPE_RES_VALUE_VCODE,
  HIT_TYPE_RES_VALUE_BODY_TOO_LARGE,
  HIT_TYPE_RES_TIME_TOO_LONG
]
const kind3Types = [
  HIT_TYPE_CROSS_SITE
]
const kind4Types = [
  HIT_TYPE_FREQUENCE,
  HIT_TYPE_NON_HTTPS,
  HIT_TYPE_HTTP_ONLY,
  HIT_TYPE_SAME_SITE
]
const kind5Types = [
  HIT_TYPE_PERFORMANCE_1
]
export default {
  data () {
    return {
      hasPasswordInput: false,
      fold: false, // 控制右上角的数据提示栏的收起和展开的方式,默认折叠收起
      passWordLevel: 0,
      config: null,
      // 收集到的触发了某些规则的数据，由于配置里允许做大的时间就是7天
      // 所以可以在初始化的时候，直接查询7天内的数据，然后根据配置过滤出要求时间段内的数据
      // 最后分析目标周期内的数据进行分类统计，将统计结果进行展示到结果区
      // 对分类后的统计结果进行分别级别计算显示不一样的颜色样式
      // 需要监听消息，对新命中的规则的记录数据获取并添加到数组
      collectedData: [],
      changeCount: 1
    }
  },
  computed: {
    passWordLevelLabel () {
      return ['-','简单',  '中等', '安全'][this.passWordLevel]
    },
    // 其他五大类数据统计
    isSiteEnabled () { return isEnabled(this.config) },
    // 应该去重统计
    requestCount () { return this.collectedData.filter(item => item.hitTypes.find(type => kind1Types.includes(type))).length },
    responseCount () { return this.collectedData.filter(item => item.hitTypes.find(type => kind2Types.includes(type))).length },
    crossSiteCount () { return this.collectedData.filter(item => item.hitTypes.find(type => kind3Types.includes(type))).length },
    siteSecureCount () { return this.collectedData.filter(item => item.hitTypes.find(type => kind4Types.includes(type))).length },
    performanceCount () { return this.collectedData.filter(item => item.hitTypes.find(type => kind5Types.includes(type))).length },
    totalCount () {
      return this.requestCount + this.requestCount + this.crossSiteCount + this.siteSecureCount + this.performanceCount
    }
  },
  created () {
    message.initMsg((bizType, msg) => {
      if (bizType === CONTENT_MSG_BIZ_SAVE_CONFIG) {
        // 插件配置有更新
        const oldConfig = this.config
        this.config = msg
        // config更新后如果enabled从关闭到打开，需要进行初始化
        // 1. 开启到关闭,还要考虑
        if (isPwdEnabled(oldConfig) && !isPwdEnabled(this.config)) {
          this.endInputNodeListen()
        }
        // 2. 关闭到开启
        if (!isPwdEnabled(oldConfig) && isPwdEnabled(this.config)) {
          this.startInputNodeListen()
        }
        if (!isEnabled(oldConfig) && isEnabled(this.config)) {
          this.initWhenEnable()
        }
      }
    })
    this.getPluginConfig()
    this.getDetectedData()
    // 由于injectjs拦截到数据后，是不能对拦截到的数据内容直接传输到插件中心，所以只能在特定dom元素上进行数据存储
    // 然后由content脚本定时去获取该内容(太土)
    // 可以尝试contentjs轮询localstorage（不行）
    // postMessage监听injectjs发送的消息内容
    window.addEventListener('message', event => {
      if (!isEnabled(this.config)) { // 插件为启用，无需处理监听数据
        return
      }
      const data = event.data || {}
      // 表明是来自自己的injectjs发送的内容
      if (data.from === UNIQUE_INJECT_ID) {
        // 将数据推送至background处理分析
        message.sendMsgToBackground(CONTENT_MSG_BIZ_NEW_DATA_RECEVIED, data.msg)
          .then(requestRecord => {
            if (requestRecord && requestRecord.hitTypes && requestRecord.hitTypes.length) {
              this.collectedData.push(requestRecord)
              this.notify(requestRecord)
            }
          })
      }
    })
  },
  methods: {
    initWhenEnable () {
      // 初始化绑定监听事件
      // 注入一个inject.js
      /**
       * code in inject.js
       * added "web_accessible_resources": ["injected.js"] to manifest.json
       * 一旦注入了，就没办法取消了
       */
      const s = document.createElement('script')
      s.src = chrome.extension.getURL('inject.js')
      s.onload = () => { s.remove() }
      let headNode = document.head || document.documentElement
      if (headNode) {
        headNode.appendChild(s)
      } else {
        const timer = setInterval(() => {
          headNode = document.head || document.documentElement
          if (headNode) {
            headNode.appendChild(s)
            clearInterval(timer)
          }
        }, 10)
      }
    },
    destoryWhenDisable () {
      // 卸载取消监听事件
    },
    getPluginConfig () {
      // 获取插件配置
      // 获取插件配置
      message.sendMsgToBackground(CONTENT_MSG_BIZ_GET_CONFIG)
        .then(config => {
          this.config = config
          // 如果插件开启则渲染显示
          if (config && config.enabled) {
            this.initWhenEnable()
            if (config.pwdCheckEnabeld) {
              this.startInputNodeListen()
            }
          } else {
            // TODO: 需要注销卸载此节点，没啥用了（暂时不卸载，因为config可以能再次变化回来）
          }
        })
    },
    getDetectedData () {
      // 初次加载是获取已经匹配检测到的数据信息
      message.sendMsgToBackground(CONTENT_MSG_BIZ_LOAD_ALL_DATA)
        .then(list => {
          this.collectedData = list
        })
    },
    startInputNodeListen () {
      const inputNode = util.scanOnePasswordInput()
      this.hasPasswordInput = !!inputNode
      if (inputNode) {
        inputNode.addEventListener('input', () => {
          const pwd = inputNode.value
          const level = util.checkPasswordLevel(pwd)
          this.passWordLevel = level
        })
      }
    },
    endInputNodeListen () {

    },
    toggle () {
      this.fold = !this.fold
    },
    // eslint-disable-next-line
    notify (newDetectedRequestRecord) {
      this.changeCount++
      // console.log('命中新数据', newDetectedRequestRecord)
      // TODO: 如何让图标闪烁
    }
  }
}
</script>
<style lang="scss" scoped>
.extension-context {
  position: fixed;
  z-index: 99999;
  right: 10px;
  top: 10px;
  width: 300px;
  min-height: 30px;
  padding: 10px;
  border: 1px dashed rgb(163, 163, 163);
  // opacity: 0.5;
  transition: all .5s;
  background: white;
  color: #333;
  &.fold {
    width: 30px;
    height: 30px;
    overflow: hidden;
    border-radius: 10%;
  }
  .fold-toggle {
    display: inline-block;
    width: 30px;
    height: 30px;
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 12px;
    color: red;
    text-align: center;
    line-height: 30px;
    transition: all .5s;
  }
  .checked-result-range {
    transition: all 3s;
    min-width: 200px;
    overflow: hidden;
    margin-top: 30px;
    &.fold {
      height: 0;
    }
  }
  .cate-item {
    padding: 10px;
    line-height: 30px;
    .text-label {
      display: inline-block;
      vertical-align: middle;
    }
    .count-number {
      font-size: 30px;
      vertical-align: middle;
      margin-left: 20px;
      color: red;
    }
  }
  .strong-0 {
    color: red;

  }
  .strong-1 {
    color: orange;

  }
  .strong-2 {
    color: purple;
  }
  .strong-3 {
    color: green;
  }
}
</style>