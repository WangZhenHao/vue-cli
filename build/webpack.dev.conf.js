'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
//合并配置
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
//在webpack中拷贝文件和文件夹
const CopyWebpackPlugin = require('copy-webpack-plugin')

/**
 * 为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题
 * 可以生成创建html入口文件，比如单页面可以生成一个html文件入口，配置N个html-webpack-plugin可以生成N个页面入口
 * @type {[type]}
 */
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 * 能够更好在终端看到webapck运行的警告和错误
 * @type {[type]}
 */
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

/**
 * A simple tool to find an open port on the current machine
 * 一个寻找当前机器开放端口的简单工具
 * @type {[type]}
 */
const portfinder = require('portfinder')

/**
 *  process.env向当前shell的环境变量
 * @type {[type]}
 */
const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    // 为了从 JavaScript 模块中 import 一个 CSS 文件
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development

  /**
   * 控制是否生成，以及如何生成 source map。
   * @type {[type]}
   */
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  /**
   * 通过来自 webpack-dev-server 的这些选项，能够用多种方式改变其行为
   * @type {Object}
   */
  devServer: {
    /**
     * 当使用内联模式(inline mode)时，会在开发工具(DevTools)的控制台(console)显示消息
     * @type {String}
     */
    clientLogLevel: 'warning',
    /**
     * 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html
     * rewrites 这个选项，此行为可进一步地控制
     * @type {Object}
     */
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    /**
     * 启用 webpack 的模块热替换特性：
     * @type {Boolean}
     */
    hot: true,
    /**
     * 告诉服务器从哪个目录中提供内容。只有在你想要提供静态文件时才需要
     * contentBase: path.join(__dirname, 'public'),推荐使用绝对路径
     *
     * contentBase：false  禁用contentBase
     * @type {Boolean}
     */
    contentBase: false, // since we use CopyWebpackPlugin.
    /**
     * 一切服务都启用 gzip 压缩：
     * @type {Boolean}
     */
    compress: true,
    /**
     * 指定使用一个 host。默认是 localhost。如果你希望服务器外部可访问
     * host: '0.0.0.0'
     * @type {[type]}
     */
    host: HOST || config.dev.host,
    /**
     * 指定要监听请求的端口号：
     * @type {[type]}
     */
    port: PORT || config.dev.port,
    /**
     * 启用 open 后，dev server 会打开浏览器。
     * @type {[type]}
     */
    open: config.dev.autoOpenBrowser,
    /**
     * 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层。默认禁用。如果你想要只显示编译器错误
     * @type {[type]}
     */
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    /**
     * 此路径下的打包文件可在浏览器中访问。
     * 
     * 假设服务器运行在 http://localhost:8080 并且 output.filename 被设置为 bundle.js。默认 publicPath 是 "/"，所以你的包(bundle)可以通过 http://localhost:8080/bundle.js 访问。
     * @type {[type]}
     */
    publicPath: config.dev.assetsPublicPath,
    /**
     * 如果你有单独的后端开发服务器 API，并且希望在同域名下发送 API 请求 ，
     * 那么代理某些 URL 会很有用。
     * @type {[type]}
     */
    proxy: config.dev.proxyTable,

    /**
     * 启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见。
     * @type {Boolean}
     */
    quiet: true, // necessary for FriendlyErrorsPlugin
    /**
     * 与监视文件相关的控制选项。
     * webpack 使用文件系统(file system)获取文件改动的通知。在某些情况下，不会正常工作。例如，当使用 Network File System (NFS) 时。Vagrant 也有很多问题。在这些情况下，请使用轮询：
     * @type {Object}
     */
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    /**
     * 注入当前环境标识，可以工具不同的环境执行不同的行为
     * 多用于切换基础配置
     */
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    /**
     * 启用热替换模块(Hot Module Replacement)，也被称为 HMR。
     */
    new webpack.HotModuleReplacementPlugin(),
    /**
     * This plugin will cause the relative path of the module to be displayed when HMR is enabled. Suggested for use in development.
     */
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    /**
     * 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
     */
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin

    //开启一个本地服务需要添加指定的文件名
    new HtmlWebpackPlugin({
      /**
       * 就是html文件的文件名，默认是index.html
       * @type {String}
       */
      filename: 'index.html',

      /**
       * 指定你生成的文件所依赖哪一个html文件模板
       * @type {String}
       */
      template: 'index.html',
      /**
       * 模板的html文件的标题
       * @type {String}
       */
      title: 'test',
      /**
       * inject有四个值： true body head false

          true 默认值，script标签位于html文件的 body 底部
          body script标签位于html文件的 body 底部
          head script标签位于html文件的 head中
          false 不插入生成的js文件，这个几乎不会用到
       */
      inject: true,
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        // 定义要拷贝的源目录 
        from: path.resolve(__dirname, '../static'),
        // 定义要拷贝到的目标目录
        to: config.dev.assetsSubDirectory,
        // 忽略拷贝指定的文件 
        ignore: ['.*']
        // flatten 只拷贝文件不管文件夹      默认是false
        // toType  file 或者 dir         可选，默认是文件
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  /**
   * 这个应该就是端口号了
   * @param  {[type]} (err, port          [description]
   * @return {[type]}       [description]
   */
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`您的应用运行在: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
