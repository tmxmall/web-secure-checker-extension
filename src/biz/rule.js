/* eslint-disable */
import { HIT_TYPE_CROSS_SITE, HIT_TYPE_DELETE_WITHOUT_PARAM, HIT_TYPE_DELETE_WITH_GET, HIT_TYPE_FREQUENCE, HIT_TYPE_HTTP_ONLY, HIT_TYPE_MAX_PAGE_SIZE, HIT_TYPE_NON_HTTPS, HIT_TYPE_PERFORMANCE_1, HIT_TYPE_RES_KEY_PASSWORD, HIT_TYPE_RES_KEY_SECURE, HIT_TYPE_RES_KEY_USERINFO, HIT_TYPE_RES_KEY_VCODE, HIT_TYPE_RES_TIME_TOO_LONG, HIT_TYPE_RES_VALUE_BODY_TOO_LARGE, HIT_TYPE_RES_VALUE_EMAIL, HIT_TYPE_RES_VALUE_ID, HIT_TYPE_RES_VALUE_MAXBODY, HIT_TYPE_RES_VALUE_PHONE, HIT_TYPE_RES_VALUE_VCODE, HIT_TYPE_SAME_SITE, HIT_TYPE_UNHANDLED_EXCEPTION } from "./common"
import localdb from "./db"
import util from "./util"
const isStringHasOneWord = (str, keywords) => {
  return !!keywords.find(key => { str.indexOf(key) > -1 })
}
const isPhone = str => str && str.length === 11 && !isNaN(str)
const isEmail = str => /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(str)
const isDemo = true
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
  },
  checkIsDeleteWithGet (requestRecord) {
    return requestRecord.method === 'GET' && isStringHasOneWord(requestRecord.url, ['del', 'delete', 'remove'])
  },
  checkIsDeleteWithoutParam (requestRecord) {
    // url的query参数和reqBody中json参数
    return requestRecord.method === 'GET' && isStringHasOneWord(requestRecord.url, ['del', 'delete', 'remove'])
  },
  checkIsMaxPageSize (requestRecord) {
    // 解析url参数，reqHeader参数，reqBody参数中是否有size等参数，如果有，取出来检查是否超限
    return Math.random() * 10 > 5
  },
  checkHasPwdField (requestRecord) {
    // 检查响应结果里是否有密码等字段
    let have = false
    util.travalsJsonField(requestRecord.resBody, field => {
      if (isStringHasOneWord(field, ['pwd', 'password', 'passwd', 'pd'])) {
        have = true
      }
    })
    return have
  },
  checkHasSecureField (requestRecord) {
    // 检查响应结果里是否有密码等字段
    let have = false
    util.travalsJsonField(requestRecord.resBody, field => {
      if (isStringHasOneWord(field, ['api', 'key', 'secret', 'salt', 'sign', 'pay'])) {
        have = true
      }
    })
    return have
  },
  checkHasUserinfoField (requestRecord) {
    // 检查响应结果里是否有密码等字段
    let have = false
    util.travalsJsonField(requestRecord.resBody, field => {
      if (isStringHasOneWord(field, ['username', 'nickname', 'email', 'phone', 'account'])) {
        have = true
      }
    })
    return have
  },
  checkHasVCodeField (requestRecord) {
    // 检查响应结果里是否有密码等字段
    let have = false
    util.travalsJsonField(requestRecord.resBody, field => {
      if (isStringHasOneWord(field, ['code', 'vcode', 'activecode'])) {
        have = true
      }
    })
    return have
  },
  checkHasPhoneValue (requestRecord) {
    let have = false
    util.travalsJsonValue(requestRecord.resBody, value => {
      if (isPhone(value)) {
        have = true
      }
    })
    return have
  },
  checkHasEmailValue (requestRecord) {
    let have = false
    util.travalsJsonValue(requestRecord.resBody, value => {
      if (isEmail(value)) {
        have = true
      }
    })
    return have
  },
  checkHasVcodeValue (requestRecord) {
    // 不能检查
    return false
  },
  checkHasIdcardValue (requestRecord) {
    let have = false
    util.travalsJsonValue(requestRecord.resBody, value => {
      if (value.length === 18) {
        have = true
      }
    })
    return have
  },
  checkHasBankcardValue (requestRecord) {
    return false
  },
  checkIsResBodyTooLong (requestRecord) {
    return JSON.stringify(requestRecord.resBody).length > 2 * 1024 * 1024 // 2Mb
  },
  checkIsResTimeTooLong (requestRecord) {
    requestRecord.timeUsed > 5000 // 5秒钟
  },
  checkIsCrossSite (requestRecord) {
    return requestRecord.url.indexOf(requestRecord.initiator) === -1
  },
  // 站点安全
  checkHasUnhandledException (requestRecord) {
    // 基于单独的事件汇报
    return Math.random() * 10 > 5
  },
  checkReqFrequence (requestRecord) {
    // 基于统计
    return Math.random() * 10 > 5
  },
  checkIsHttps (requestRecord) {
    return requestRecord.initiator.indexOf('https') === -1
  },
  checkCookieSafe (requestRecord) {
    // 只有js异步登录的才能统计
    return Math.random() * 10 > 5
  },
  checkSameSite (requestRecord) {
    return Math.random() * 10 > 5
  },
  // 网站加载性能
  checkPerformance (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkRequest (requestRecord) {
    const hitTypes = []
    if (isDemo) {
      // 演示模式随机添加一些匹配的规则
      const list = [
        HIT_TYPE_CROSS_SITE,
        HIT_TYPE_DELETE_WITHOUT_PARAM,
        HIT_TYPE_DELETE_WITH_GET,
        HIT_TYPE_FREQUENCE,
        HIT_TYPE_HTTP_ONLY,
        HIT_TYPE_MAX_PAGE_SIZE,
        HIT_TYPE_NON_HTTPS,
        HIT_TYPE_PERFORMANCE_1,
        HIT_TYPE_RES_KEY_PASSWORD,
        HIT_TYPE_RES_KEY_SECURE,
        HIT_TYPE_RES_KEY_USERINFO,
        HIT_TYPE_RES_KEY_VCODE,
        HIT_TYPE_RES_TIME_TOO_LONG,
        HIT_TYPE_RES_VALUE_BODY_TOO_LARGE,
        HIT_TYPE_RES_VALUE_EMAIL,
        HIT_TYPE_RES_VALUE_ID,
        HIT_TYPE_RES_VALUE_MAXBODY,
        HIT_TYPE_RES_VALUE_PHONE,
        HIT_TYPE_RES_VALUE_VCODE,
        HIT_TYPE_SAME_SITE,
        HIT_TYPE_UNHANDLED_EXCEPTION
      ]
      const count = parseInt(Math.random() * 5)
      for (let i = 0; i < count; i++) {
        hitTypes.push(list[Math.ceil(Math.random() * 20)])
      }
    }
    // 请求
    if (this.checkIsDeleteWithGet(requestRecord)) {
      hitTypes.push(HIT_TYPE_DELETE_WITH_GET)
    }
    if (this.checkIsDeleteWithoutParam(requestRecord)) {
      hitTypes.push(HIT_TYPE_DELETE_WITHOUT_PARAM)
    }
    if (this.checkIsMaxPageSize(requestRecord)) {
      hitTypes.push(HIT_TYPE_MAX_PAGE_SIZE)
    }
    // 响应
    if (this.checkHasPwdField(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_KEY_PASSWORD)
    }
    if (this.checkHasSecureField(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_KEY_SECURE)
    }
    if (this.checkHasUserinfoField(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_KEY_USERINFO)
    }
    if (this.checkHasVcodeValue(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_KEY_VCODE)
    }
    if (this.checkHasPhoneValue(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_VALUE_PHONE)
    }
    if (this.checkHasEmailValue(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_VALUE_EMAIL)
    }
    if (this.checkHasVcodeValue(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_VALUE_VCODE)
    }
    if (this.checkHasIdcardValue(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_VALUE_ID)
    }
    if (this.checkIsResBodyTooLong(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_VALUE_BODY_TOO_LARGE)
    }
    if (this.checkIsResTimeTooLong(requestRecord)) {
      hitTypes.push(HIT_TYPE_RES_TIME_TOO_LONG)
    }
    // 跨域
    if (this.checkIsCrossSite(requestRecord)) {
      hitTypes.push(HIT_TYPE_CROSS_SITE)
    }
    // 站点安全
    if (this.checkHasUnhandledException(requestRecord)) {
      hitTypes.push(HIT_TYPE_UNHANDLED_EXCEPTION)
    }
    if (this.checkReqFrequence(requestRecord)) {
      hitTypes.push(HIT_TYPE_FREQUENCE)
    }
    if (this.checkIsHttps(requestRecord)) {
      hitTypes.push(HIT_TYPE_NON_HTTPS)
    }
    if (this.checkCookieSafe(requestRecord)) {
      hitTypes.push(HIT_TYPE_HTTP_ONLY)
    }
    if (this.checkSameSite(requestRecord)) {
      hitTypes.push(HIT_TYPE_SAME_SITE)
    }
    // 网站性能
    if (this.checkPerformance(requestRecord)) {
      hitTypes.push(HIT_TYPE_PERFORMANCE_1)
    }
    requestRecord.hitTypes = hitTypes
    
    if (hitTypes.length) {
      // 存库，并通知前端显示
      localdb.add(requestRecord)
    }
    return requestRecord
  }
}