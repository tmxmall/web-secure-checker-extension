/* eslint-disable */
;(function(xhr) {
  // 对异步请求进行数据劫持用于数据分析，数据近在插件之间本地通信存储，不会联网发布到任何第三方，请放心运行
  console.log('inject')
  const XHR = xhr.prototype
  console.log(XHR)
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
    this._requestHeaders[header] = value
    return setRequestHeader.apply(this, arguments)
  }

  XHR.send = function (postData) {
    this.addEventListener('load', function() {
      var endTime = new Date().toISOString()
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
        const responseHeaders = this.getAllResponseHeaders()

        if (this.responseType != 'blob' && this.responseText) {
          // responseText is string or null
          try {
            // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
            const responseBody = this.responseText
            this._responseBody = responseBody

            // printing url, request headers, response headers, response body, to console
            console.log(this._url)
            console.log(this._requestHeaders)
            console.log(responseHeaders)
            console.log(this._responseBody)
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
