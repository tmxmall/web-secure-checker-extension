<template>
  <div v-if="config && config.enabled" class="extension-context" :class="[fold ? 'fold' : '', 'level-' + errorLevel]">
    <!-- 由于本组件是content注入模式，该组件内的事件响应会失效，需要借用inject模式注入组件 -->
    <!-- https://www.bookstack.cn/read/chrome-plugin-develop/spilt.6.spilt.4.8bdb1aac68bbdc44.md -->
    <span class="fold-toggle" @click="fold = !fold"></span>
    <div class="checked-result-range" v-if="!fold">
      <!-- 如果开启了密码强度计算且当前页面有密码输入框 -->
      <div v-if="config.pwdCheckEnabeld && hasPasswordInput">
        密码强度：<span :class="'strong-' + passWordLevel">{{ passWordLevel }}</span>
      </div>
      <!-- 其他五六类的统计结果展示 -->
    </div>
  </div>
</template>
<script>
import util from '../biz/util'
import * as message from '../biz/message'
import { CONTENT_MSG_BIZ_GET_CONFIG, CONTENT_MSG_BIZ_NEW_DATA_DETECTED, CONTENT_MSG_BIZ_SAVE_CONFIG } from '../biz/common'

/**
 * 插件支持配置多个contentjs脚本，可以在文档加载之前就注入一段脚本，对xmlHttpRequest类进行覆盖重构
 * 重构中
 *  需自定义requestId
 *  对send方法尽心重写，实现将所有数据参数发送到background
 *  对responseText响应进行拦截并将数据发送到background
 */

export default {
  data () {
    return {
      hasPasswordInput: false,
      fold: true, // 控制右上角的数据提示栏的收起和展开的方式,默认折叠收起
      passWordLevel: 0,
      config: null,
      // 收集到的触发了某些规则的数据，由于配置里允许做大的时间就是7天
      // 所以可以在初始化的时候，直接查询7天内的数据，然后根据配置过滤出要求时间段内的数据
      // 最后分析目标周期内的数据进行分类统计，将统计结果进行展示到结果区
      // 对分类后的统计结果进行分别级别计算显示不一样的颜色样式
      // 需要监听消息，对新命中的规则的记录数据获取并添加到数组
      collectedData: []
    }
  },
  computed: {
    errorLevel () {
      return 3 // 3,2,1
    },
    // 其他五大类数据统计
    requestCount () { return this.collectedData.filter(item => item.cate === 1).length },
    responseCount () { return this.collectedData.filter(item => item.cate === 2).length },
    croseSiteCount () { return this.collectedData.filter(item => item.cate === 3).length },
  },
  created () {
    message.initMsg((bizType, msg) => {
      if (bizType === CONTENT_MSG_BIZ_SAVE_CONFIG) {
        // 插件配置有更新
        console.log(msg)
        this.config = msg // config更新后如果enabled从关闭到打开，需要进行初始化
      } else if (bizType === CONTENT_MSG_BIZ_NEW_DATA_DETECTED) {
        this.collectedData.push(msg)
      }
    })
    // 获取插件配置
    message.sendMsgToBackground(CONTENT_MSG_BIZ_GET_CONFIG)
      .then(config => {
        this.config = config
        // 如果插件开启则渲染显示
        if (config && config.enabled) {
          // TODO: match location.host
          console.warn('插件已开启')
          this.listenInputNode()
        } else {
          // TODO: 需要注销卸载此节点，没啥用了
        }
      })
  },
  methods: {
    initWhenEnable () {
      // 初始化绑定监听事件
    },
    destoryWhenDisable () {
      // 卸载取消监听事件
    },
    getPluginConfig () {
      // 获取插件配置
    },
    getDetectedData () {
      // 初次加载是获取已经匹配检测到的数据信息
    },
    listenInputNode () {
      const inputNode = util.scanOnePasswordInput()
      this.hasPasswordInput = !!inputNode
      if (inputNode) {
        inputNode.addEventListener('input', () => {
          const pwd = inputNode.value
          const level = util.checkPasswordLevel(pwd)
          this.passWordLevel = level
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.extension-context {
  position: fixed;
  z-index: 999;
  right: 10px;
  top: 10px;
  min-width: 200px;
  padding: 10px;
  border: 1px dashed rgb(163, 163, 163);
  opacity: 0.5;
  transition: all .5s;
  &.fold {
    width: 40px;
    height: 40px;
    min-width: inherit;
    min-height: inherit;
    overflow: hidden;
  }
  .fold-toggle {
    display: inline-block;
    width: 30px;
    height: 30px;
    background: gray;
    cursor: pointer;
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
</style>