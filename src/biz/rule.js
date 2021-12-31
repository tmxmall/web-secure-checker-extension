/* eslint-disable */
import { HIT_TYPE_CROSS_SITE, HIT_TYPE_DELETE_WITHOUT_PARAM, HIT_TYPE_DELETE_WITH_GET, HIT_TYPE_FREQUENCE, HIT_TYPE_HTTP_ONLY, HIT_TYPE_MAX_PAGE_SIZE, HIT_TYPE_NON_HTTPS, HIT_TYPE_PERFORMANCE_1, HIT_TYPE_RES_KEY_PASSWORD, HIT_TYPE_RES_KEY_SECURE, HIT_TYPE_RES_KEY_USERINFO, HIT_TYPE_RES_KEY_VCODE, HIT_TYPE_RES_TIME_TOO_LONG, HIT_TYPE_RES_VALUE_BODY_TOO_LARGE, HIT_TYPE_RES_VALUE_EMAIL, HIT_TYPE_RES_VALUE_ID, HIT_TYPE_RES_VALUE_MAXBODY, HIT_TYPE_RES_VALUE_PHONE, HIT_TYPE_RES_VALUE_VCODE, HIT_TYPE_SAME_SITE } from "./common"
import localdb from "./db"

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
    return Math.random() * 10 > 5
  },
  checkIsDeleteWithoutParam (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkIsMaxPageSize (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasPwdField (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasSecureField (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasUserinfoField (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasVCodeField (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasPhoneValue (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasEmailValue (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasVcodeValue (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasIdcardValue (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkHasBankcardValue (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkIsResBodyTooLong (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkIsResTimeTooLong (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkIsCrossSite (requestRecord) {
    return Math.random() * 10 > 5
  },
  // 站点安全
  checkHasUnhandledException (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkReqFrequence (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkIsHttps (requestRecord) {
    return Math.random() * 10 > 5
  },
  checkCookieSafe (requestRecord) {
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