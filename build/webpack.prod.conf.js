'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
//在webpack中拷贝文件和文件夹
const CopyWebpackPlugin = require('copy-webpack-plugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')

//将样式文件单独打包输出的文件由配置文件中的output属性指定
const ExtractTextPlugin = require('extract-text-webpack-plugin')

// 用于优化或者压缩css资源
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

//压缩js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    /**
     * 输出文件
     * filename： '[name].js'  用于多个入口点
     * filename: '[chunkhash].js' 用于长效缓存
       utils.assetsPath()方法用于输出文件到指定位置
    */
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    /**
     * 此选项决定了非入口(non-entry) chunk 文件的名称
     * 这些文件名需要在 runtime 根据 chunk 发送的请求去生成, 如按需加载的模块
     * @type {[type]}
     */
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),

    new UglifyJsPlugin({
      /**
       * UglifyJS 压缩选项。
       * @type {Object}
       */
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      /**
       * 使用sourceMap将错误消息位置映射到模块(这会减慢编译速度)
       * @type {[type]}
       */
      sourceMap: config.build.productionSourceMap,
      /**
       * 使用多进程并行运行来提高构建速度
       * @type {Boolean}
       */
      parallel: true
    }),
    // extract css into its own file
    /**
     * extract-text-webpack-plugin该插件的主要是为了抽离css样式,
     * 防止将样式打包在js中引起页面样式加载错乱的现象。
     * @type {[type]}
     */
    new ExtractTextPlugin({
      /**
       * 定义文件的名称。
       * 如果有多个入口文件时，应该定义为：[name].css。
       * @type {[type]}
       */
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      /**
       * 当使用 `CommonsChunkPlugin` 并且在公共 chunk 中有提取的 chunk（来自`ExtractTextPlugin.extract`）时，`allChunks` **必须设置为 `true`。
       * @type {Boolean}
       */
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    /**
     * 压缩提取出的css，
     * 并解决ExtractTextPlugin分离出的js重复问题(多个文件引入同一css文件)
     * @type {[type]}
     */
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      /**
       * 生成的html文档的标题。配置该项，它并不会替换指定模板文件中的title元素的内容，除非html模板文件中使用了模板引擎语法来获取该配置项值，如下ejs模板语法形式
       * <title><%= htmlWebpackPlugin.options.title %></title>
       * @type {String}
       */
      title: 'test',
      /**
       * 注入的js文件将会被放在body标签中,当值为'head'时，将被放在head标签中
       * @type {Boolean}
       */
      inject: true,
      minify: {
        /**
         * 删除注释
         * @type {Boolean}
         */
        removeComments: true,
        /**
         * 去除空格
         * @type {Boolean}
         */
        collapseWhitespace: false,
        /**
         * 移除属性的引号
         * @type {Boolean}
         */
        removeAttributeQuotes: false,
        /**
         * minifyCSS: 压缩html里面的css
         * minifyJS: 压缩html里面的js
         */
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      /**
       * chunksSortMode

        script的顺序，默认四个选项： none auto dependency {function}

        'dependency' 不用说，按照不同文件的依赖关系来排序。

        'auto' 默认值，插件的内置的排序方式，具体顺序....

        'none' 无序？

        {function} 提供一个函数？
       * @type {String}
       */
      chunksSortMode: 'dependency',
      /**
       * chunks: ['main', 'index']
       * chunks主要用于多入口文件，当你有多个入口文件，那就回编译后生成多个打包后的文件，那么chunks 就能选择你要使用那些js文件
       * 编译:<script type=text/javascript src="index.js"></script>
              <script type=text/javascript src="main.js"></script>
       */
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    /**
     * 分离公共js到vendor中
     * @param {[type]}
     */
    new webpack.optimize.CommonsChunkPlugin({
      /**
       * //文件名
       * @type {String}
       */
      name: 'vendor',
      /**
       * 声明公共的模块来自node_modules文件夹
       * 抽离第三方库
       * @param  {[type]} module [description]
       * @return {[type]}        [description]
       */
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    /**
     * 上面虽然已经分离了第三方库,每次修改编译都会改变vendor的hash值，导致浏览器缓存失效。原因是vendor包含了webpack在打包过程中会产生一些运行时代码，运行时代码中实际上保存了打包后的文件名。当修改业务代码时,业务代码的js文件的hash值必然会改变。一旦改变必然会导致vendor变化。vendor变化会导致其hash值变化。
     *
     * 下面主要是将运行时代码提取到单独的manifest文件中，防止其影响vendor.js
     * @type {String}
     */
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    // 自定义公共模块
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
    // 即解决children:true时合并到entry chunks自身时初始加载时间过长的问题。async设为true时，commons chunk 将不会合并到自身，而是使用一个新的异步的commons chunk。当这个children chunk 被下载时，自动并行下载该commons chunk
      async: 'vendor-async',
      /**
       * children
         指定为true的时候，就代表source chunks是通过entry chunks（入口文件）进行code split出来的children chunks
         children和chunks不能同时设置，因为它们都是指定source chunks的
         children 可以用来把 entry chunk 创建的 children chunks 的共用模块合并到自身，但这会导致初始加载时间较长
       * @type {Boolean}
       */
      children: true,
      minChunks: 3
    }),

    /**
     * 复制静态资源,将static文件内的内容复制到指定文件夹
     * @type {[type]}
     */
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})
/**
 * 配置文件开启了gzip压缩
 * @param  {[type]} config.build.productionGzip [description]
 * @return {[type]}                             [description]
 */
if (config.build.productionGzip) {
  /**
   * 引入压缩文件的组件,该插件会对生成的文件进行压缩，生成一个.gz文件
   * @type {[type]}
   */
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      //目标文件名
      asset: '[path].gz[query]',
      // 使用gzip压缩
      algorithm: 'gzip',
      //满足正则表达式的文件会被压缩
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      //资源文件大于10240B=10kB时会被压缩
      threshold: 10240,
      //最小压缩比达到0.8时才会被压缩
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  /**
   * webpack打包体积优化，详细分布查看插件 
   * @type {[type]}
   */
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
