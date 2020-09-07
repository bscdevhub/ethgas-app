/* eslint-disable */
const path = require('path')
const webpack = require('webpack')
const shared = require('./shared')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

let dist = process.env.DIST
if (!dist || dist === '') {
  dist = 'local'
}

// use same local development values as game client/server
process.env.GITCOMMIT = 'dev'

// if (dist === 'local') {
//   process.env.GITCOMMIT = require('child_process').execSync(
//     'git log -1 --date=iso --pretty=format:%H'
//   )
// }

const appConfig = require(`../webapp.${dist}.json`)

const main = [
  'react-hot-loader/patch',
  'webpack-dev-server/client?http://0.0.0.0:5555',
  'webpack/hot/only-dev-server',
  'whatwg-fetch',
  './src/index.tsx'
]
// const vendor = shared.vendorEntry({
//   mainModules: main,
//   modulesToExclude: ['']
// })

module.exports = {
  context: process.cwd(), // to automatically find tsconfig.json
  entry: {
    main: main,
    // vendor: vendor
  },
  node: {
    fs: 'empty',
    net: 'empty',
    child_process: 'empty'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/'
  },
  optimization: {
    namedModules: true,
    namedChunks: true,
    // removeAvailableModules: false,
    // removeEmptyChunks: false,
    // splitChunks: false
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin({
      // eslint: {
      //   files: './src/**/*.{ts,tsx}'
      // }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.GITCOMMIT': JSON.stringify(process.env.GITCOMMIT),
      'process.env.APP_CONFIG': `'${JSON.stringify(appConfig)}'`
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: 'src/index.html',
      templateParameters: {
        gitcommit: ''
      }
    })
    // new BundleAnalyzerPlugin(),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ],
        exclude: path.resolve(process.cwd(), 'node_modules'),
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192000
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.png', '.jpg'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
      '~': path.join(process.cwd(), 'src'),
      '#': path.join(process.cwd(), 'src', 'components')
    },
    plugins: [new TsconfigPathsPlugin()]
  },
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 5555,
    open: false,
    hot: true,
    historyApiFallback: true,
    stats: 'errors-only',
    disableHostCheck: true,
    contentBase: path.resolve(process.cwd(), 'src/public'),
    publicPath: '/'
  }
}
