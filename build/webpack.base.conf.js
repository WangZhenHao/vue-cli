'use strict'
/**
 * path 模块提供了一些用于处理文件路径的小工具
 * @type {[type]}
 */
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
   // path.join([path1][, path2][, ...])
   //   用于连接路径。该方法的主要用途在于，会正确使用当前系统的路径分隔符，Unix系统是"/"，Windows系统是"\"。
   //   
   //  __dirname在 Node.js 环境中运行时，输出文件的目录名。
   //  __dirname在 是node.js一个全局变量，指向当前执行的脚本所在文件目录。
  return path.join(__dirname, '..', dir)
}



module.exports = {
  /**
   * 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
   *
   * path.resolve([from ...], to)
   * 将 to 参数解析为绝对路径，给定的路径的序列是从右往左被处理的，后面每个 path 被依次解析，直到构造完成一个绝对路径
   * 
   * path.resolve('/foo/bar', './baz');
     返回: '/foo/bar/baz'
      
     path.resolve('/foo/bar', '/tmp/file/');
     返回: '/tmp/file'


     path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
     如果当前工作目录为 /home/myself/node，
     则返回 '/home/myself/node/wwwroot/static_files/gif/image.gif'

    
   */
  context: path.resolve(__dirname, '../'),

  /**
   * 起点或是应用程序的起点入口
   * 每个 HTML 页面都有一个入口起点。单页应用(SPA)：一个入口起点，多页应用(MPA)：多个入口起点。
   * @type {Object}
   */
  entry: {
    //会输出app.[hash].js
    app: './src/main.js'
  },
  output: {
    /**
     * 路径 __dirname表示/
     *所有输出文件的目标路径，必须是绝对路径
     * @type {[type]}
     */
    path: config.build.assetsRoot,
    /**
     * 输出文件
     * filename： '[name].js'  用于多个入口点
     * filename: '[chunkhash].js' 用于长效缓存
     */
    filename: '[name].js',
    /**
     * 输出已经解析文件的目录，url 相对于 HTML 页面
     * publicPath: 'https://cdn.example.com'
     */
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },

  /**
   * resolve配置模块如何解析
   * @type {Object}
   */
  resolve: {
    /**
     * 自动解析确定的扩展
     * 能够使用户在引入模块时不带扩展：
     * import fire from './page/home/home'
     */
    extensions: ['.js', '.vue', '.json'],
    /**
     * resolve.alias
     * 创建 import 或 require 的别名，来确保模块引入变得更简单
     * 给定对象的键后的末尾添加 $，以表示精准匹配
     * import vue form 'vue' 精准匹配，所以vue/dist/vue.esm.js被解析导入
     *
     * import test from '@/config.js'  //非精准匹配，触发普通解析
     */
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  /**
   * test 和 include 具有相同的作用，都是必须匹配选项
   * exclude 是必不匹配选项（优先于 test 和 include）
   * @type {Object}
   */
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {

        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
