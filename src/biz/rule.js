export default {
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
  }
}