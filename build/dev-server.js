require('./check-versions')()

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.build.config')

// 监听的端口
var port = process.env.PORT || 8099;
// 自动打开浏览器
var autoOpenBrowser = true;
// 预览地址
var uri = 'http://localhost:' + port + '/dist/index.html';

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: '/dist/',
  inline: true,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    console.log('cb', cb)
    cb && cb()
  })
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> 启动开发服务器...')
devMiddleware.waitUntilValid(() => {
  console.log('> 浏览 ' + uri + '\n> 当前路径 ' + process.cwd() + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
