const WEB_SECURE_CHECKER_EX_NODE_ID = new Date().getTime()

export default {
  scanOnePasswordInput () {
    return document.querySelector('input[type=password]')
  },
  checkPasswordLevel (pwd) {
    // 根据不同级别的正则，提示用户该密码强度级别，需要定义不同的级别
    /**
     * 纯数字
     * 纯字母
     * 位数不够6位
     * 仅字母和数字
     * 数组字母组合
     * 无大小写的纯字母
     */
    const regPureNum = /^((\d)+)$/
    if (pwd.length < 6) {
      return 1 // 最低级别
    }
    if (regPureNum.test(pwd)) {
      return 1 // 最低级别
    }
    return 3
  },
  ensureTipNode () {
    let node = document.getElementById(WEB_SECURE_CHECKER_EX_NODE_ID)
    if (node) {
      return node
    }
    node = document.createElement('div')
    node.setAttribute('id', WEB_SECURE_CHECKER_EX_NODE_ID)
    document.body.appendChild(node)
    return node
  },
  getUniqId () {
    return WEB_SECURE_CHECKER_EX_NODE_ID
  },
  getPluginConfig () {
    return new Promise((resolve) => {
      chrome.storage.sync.get((items) => {
        resolve(JSON.parse(JSON.stringify(items.plugin_config)))
      })
    })
  }
}