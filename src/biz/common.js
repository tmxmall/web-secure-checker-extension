export const CONTENT_MSG_TYPE = 'content_msg_type'
export const MSG_ID_SEED = new Date().getTime()
export const UNIQUE_INJECT_ID = '416628ab-add4-51f6-8740-52fae8bcd54c'
export const CONTENT_MSG_BIZ_GET_CONFIG = 'CONTENT_MSG_BIZ_GET_CONFIG'
export const CONTENT_MSG_BIZ_SAVE_CONFIG = 'CONTENT_MSG_BIZ_SAVE_CONFIG'
export const CONTENT_MSG_BIZ_NEW_DATA_DETECTED = 'CONTENT_MSG_BIZ_NEW_DATA_DETECTED'
export const CONTENT_MSG_BIZ_NEW_DATA_RECEVIED = 'CONTENT_MSG_BIZ_NEW_DATA_RECEVIED'
export const CONTENT_MSG_BIZ_LOAD_ALL_DATA = 'CONTENT_MSG_BIZ_LOAD_ALL_DATA'

// 第一类密码强度
export const HIT_TYPE_PADDWORD = '1'
// 其他五类
// 请求类
export const HIT_TYPE_DELETE_WITH_GET = '2'
export const HIT_TYPE_DELETE_WITHOUT_PARAM = '3' // 如果是restful请求你？
export const HIT_TYPE_MAX_PAGE_SIZE = '4'
// 响应类敏感数据
export const HIT_TYPE_RES_KEY_PASSWORD = '5' // 密码字段
export const HIT_TYPE_RES_KEY_SECURE = '6' // 安全性字段
export const HIT_TYPE_RES_KEY_USERINFO = '7' // 用户信息字段
export const HIT_TYPE_RES_KEY_VCODE = '8' // 验证码激活码字段
export const HIT_TYPE_RES_VALUE_PHONE = '9'
export const HIT_TYPE_RES_VALUE_EMAIL = '10'
export const HIT_TYPE_RES_VALUE_ID = '11'
export const HIT_TYPE_RES_VALUE_BANKCARD = '12'
export const HIT_TYPE_RES_VALUE_VCODE = '13'
export const HIT_TYPE_RES_VALUE_BODY_TOO_LARGE = '14'
export const HIT_TYPE_RES_TIME_TOO_LONG = '15'
// 跨域访问
export const HIT_TYPE_CROSS_SITE = '16'
// 站点安全
export const HIT_TYPE_FREQUENCE = '18'
export const HIT_TYPE_UNHANDLED_EXCEPTION = '18.1'
export const HIT_TYPE_NON_HTTPS = '19'
export const HIT_TYPE_HTTP_ONLY = '20'
export const HIT_TYPE_SAME_SITE = '21'
// 性能检测
// TODO：性能检测单独实现
export const HIT_TYPE_PERFORMANCE_1 = '17'
