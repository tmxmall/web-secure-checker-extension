const { UNIQUE_INJECT_ID } = require("../biz/common")

/* eslint-disable */
;(function(xhr) {
  // 对异步请求进行数据劫持用于数据分析，数据近在插件之间本地通信存储，不会联网发布到任何第三方，请放心运行
  const XHR = xhr.prototype
  var open = XHR.open
  var send = XHR.send
  var setRequestHeader = XHR.setRequestHeader

  XHR.open = function (method, url) {
    // 对需要分析的数据进行拦截设置
    this._method = method
    this._url = url
    this._requestHeaders = {}
    this._requestBody = null
    this._startTime = new Date().toISOString()

    // 调用原生方法
    return open.apply(this, arguments)
  }

  XHR.setRequestHeader = function(header, value) {
    // 只能获取有权限获取的字段，不能识别cookie等各种其他信息
    // 不能获取referer，host.cookie
    // 由于这边不能获取完整的信息，所以在请求参数里增加自定义的uniqueId，在background进行数据拦截并存储
    this._requestHeaders[header] = value
    return setRequestHeader.apply(this, arguments)
  }

  XHR.send = function (postData) {
    // 如何自定义一个全局唯一的uniqueId
    const customUniqueRequestId = new Date().getTime()
    this.setRequestHeader('customUniqueRequestId', customUniqueRequestId)
    const startTime = new Date().getTime()
    this.addEventListener('load', function() {
      var endTime = new Date().getTime()
      var myUrl = this._url ? this._url.toLowerCase() : this._url
      if (myUrl) {
        // 提交的参数
        if (postData) {
          if (typeof postData === 'string') {
            try {
              // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
              this._requestBody = postData
            } catch (err) {
              console.log('Request Header JSON decode failed, transfer_encoding field could be base64')
              console.log(err)
            }
          } else if (
            typeof postData === 'object' ||
            typeof postData === 'array' ||
            typeof postData === 'number' ||
            typeof postData === 'boolean'
          ) {
            // do something if you need
            this._requestBody = postData
          }
        }

        // here you get the RESPONSE HEADERS
        // 解析处理为json对象
        const responseHeaders = this.getAllResponseHeaders()
        const resHeaders = {}
        responseHeaders.split('\n').forEach((current) => {
          if (!current) return
          const key = (current.split(':')[0] || '').trim()
          if (!key) return
          const value = (current.split(':')[1] || '').trim()
          resHeaders[key] = value
        })

        if (this.responseType != 'blob' && this.responseText) {
          // responseText is string or null
          try {
            // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
            let responseBody = this.responseText
            try {
              responseBody = JSON.parse(responseBody)
            } catch (error) {}
            
            // printing url, request headers, response headers, response body, to console
            const interceptData = {
              from: UNIQUE_INJECT_ID,
              msg: {
                url: this._url,
                method: this._method,
                time: endTime - startTime,
                // reqHeaders: this._requestHeaders,
                // resHeaders: resHeaders,
                reqBody: this._requestBody,
                resBody: responseBody,
                customUniqueRequestId: customUniqueRequestId
              }
            }
            // console.log(interceptData)
            window.postMessage(interceptData)
          } catch (err) {
            console.log('Error in responseType try catch')
            console.log(err)
          }
        }
      }
    })

    return send.apply(this, arguments)
  }
})(XMLHttpRequest)
