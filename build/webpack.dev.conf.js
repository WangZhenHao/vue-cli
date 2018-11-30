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
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
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
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
