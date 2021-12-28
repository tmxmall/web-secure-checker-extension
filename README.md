# vue-chrome-extension-boilerplate

在浏览器运行环境中，对指定网页的网络请求进行拦截和分析，对用户注册登录等页面的密码输入框进行监听分析密码强度


1. 登录注册页面的密码强度识别
2. 删除接口没有参数
3. 删除接口是get请求
4. 响应结果中包含md5结果
5. 响应结果中包含未加密的phone结果
6. 响应结果中包含未加密的邮箱
7. 响应结果中包含密码字段等关键词
8. 响应结果包含身份证号
9. 响应结果体积太大，数据太多
10. 出现跨域请求
11. 单位时间的请求频次问题
12. 存在图片资源未压缩问题
13. 非Https网站服务
14. cookie未设置httpOnly
15. same-site配置

## Scripts

Install dependencies:

`npm install`

Build extension and watch for changes:

`npm run dev`

Build extension zip:

`npm run build`

Lint all source files:

`npm run lint`