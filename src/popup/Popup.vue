<template>
  <div class="popup-page">
    <div class="title">
      插件设置
      <span v-if="configSaved" class="saving-text">已保存</span>
    </div>
    <el-form label-width="80px" label-position="left" size="mini">
      <!-- 是否全局启用 -->
      <el-form-item label="插件状态:">
        <el-switch v-model="config.enabled" @change="change"></el-switch> 启用
      </el-form-item>
      <el-form-item label="数据统计:">
        <el-select v-model="config.showDataRangeHours" size="mini" @change="change">
          <el-option :value="1" label="1小时内"></el-option>
          <el-option :value="3" label="3小时内"></el-option>
          <el-option :value="8" label="8小时内"></el-option>
          <el-option :value="24" label="24小时内"></el-option>
          <el-option :value="72" label="3天内"></el-option>
          <el-option :value="168" label="7天内"></el-option>
        </el-select>
      </el-form-item>
      <!-- 仅对配置的网址有效，后期可实现正则 -->
      <el-form-item label="网址:">
        <div :key="config.sites.length" style="display: inline-block;">
          <i v-if="!config.sites.length" class="icon el-icon-plus" @click="addNewOne"></i>
          <div v-for="(site, index) in config.sites" :key="site.id">
            <el-input v-model="site.site" size="mini" style="width: 200px;" @change="change"></el-input>
            <el-switch v-model="site.enabled" size="mini" @change="change"></el-switch>
            <el-tooltip content="删除一条" placement="top">
              <i class="icon el-icon-delete" @click="deleteOne(index)"></i>
            </el-tooltip>
            <el-tooltip content="添加一条" placement="top">
              <i v-if="index == config.sites.length - 1" class="icon el-icon-plus" @click="addNewOne"></i>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      <!-- 核心规则是否开启 -->
      <el-form-item label="密码强度:">
        <el-switch v-model="config.pwdCheckEnabeld" @change="change"></el-switch> 启用
      </el-form-item>
      <!-- 删除操作，请求体过大 -->
      <el-form-item label="请求安全:">
        <el-switch v-model="config.requestDataCheckEnabeld" @change="change"></el-switch> 启用
      </el-form-item>
      <!-- 响应结果包含md5，手机号，邮箱，身份证号等 -->
      <el-form-item label="敏感数据:">
        <el-switch v-model="config.responseDataCheckEnabeld" @change="change"></el-switch> 启用
      </el-form-item>
      <!-- 跨域资源访问，same-site防套壳访问 -->
      <el-form-item label="跨域访问:">
        <el-switch v-model="config.crossSiteCheckEnabeld" @change="change"></el-switch> 启用
      </el-form-item>
      <el-form-item label="站点安全:">
        <el-switch v-model="config.siteCheckEnabeld" @change="change"></el-switch> 启用
      </el-form-item>
      <el-form-item label="加载性能:">
        <el-switch v-model="config.performanceCheckEnabeld" @change="change"></el-switch> 启用
      </el-form-item>
    </el-form>
    <el-button type="primary" size="small" @click="gotoOptions">查看统计</el-button>
  </div>
</template>

<script>
import { CONTENT_MSG_BIZ_SAVE_CONFIG } from '../biz/common'
import * as message from '../biz/message'
import util from '../biz/util'
// popup可以直接访问background，不需要消息渠道，否则不能收到消息
const defaultConfig = {
    enabled: false,
    pwdCheckEnabeld: false,
    sites: [
      {site: '', enabled: false, id: new Date().getTime()}
    ]
  }
export default {
  data() {
    return {
      configSaved: false,
      config: JSON.parse(JSON.stringify(defaultConfig))
    }
  },
  created () {
    util.getPluginConfig().then(config => {
      this.config = config || JSON.parse(JSON.stringify(defaultConfig))
    })
  },
  methods: {
    addNewOne () {
      this.config.sites.push({site: '', enabled: false, id: new Date().getTime()})
      this.change()
    },
    deleteOne (index) {
      this.config.sites.splice(index, 1)
      this.change()
    },
    change () {
      this.saveConfig()
    },
    saveConfig () {
      this.configSaved = true
      setTimeout(() => {
        this.configSaved = false
      }, 1000)
      this.$emit('config-update', this.config)
      message.sendMsgToBackground(CONTENT_MSG_BIZ_SAVE_CONFIG, this.config)
    },
    gotoOptions () {
      // chrome.runtime.openOptionsPage()
      const optionsUrl = chrome.extension.getURL('options.html')
      chrome.tabs.query({url: optionsUrl}, (tabs) => {
        if (tabs.length) {
          chrome.tabs.update(tabs[0].id, {active: true})
        } else {
          chrome.tabs.create({url: optionsUrl})
        }
        window.close()
      })
    }
  }
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
}
.popup-page {
  min-height: 200px;
  min-width: 400px;
  color: gray;
  padding: 10px;
  .icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .title {
    line-height: 30px;
    font-weight: bold;
    font-size: 15px;
    margin-bottom: 10px;
    border-bottom: 1px solid rgb(218, 218, 218);
    .saving-text {
      color: #18dd39;
      font-size: 12px;
      float: right;
    }
  }
}

</style>
