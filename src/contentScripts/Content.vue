<template>
  <div v-if="config && config.enabled" class="extension-context">
    <div v-if="hasPasswordInput && config.pwdCheckEnabeld">
      密码强度：<span :class="'strong-' + passWordLevel">{{ passWordLevel }}</span>
    </div>
  </div>
</template>
<script>
import util from '../biz/util'
import * as message from '../biz/message'
import { CONTENT_MSG_BIZ_GET_CONFIG, CONTENT_MSG_BIZ_SAVE_CONFIG } from '../biz/common'

export default {
  data () {
    return {
      hasPasswordInput: false,
      passWordLevel: 0,
      config: null
    }
  },
  created () {
    message.initMsg((bizType, msg) => {
      if (bizType === CONTENT_MSG_BIZ_SAVE_CONFIG) {
        // 插件配置有更新
        console.log(msg)
        this.config = msg
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
          // 需要注销卸载此节点
        }
      })
  },
  methods: {
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