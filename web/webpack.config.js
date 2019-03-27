const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
   mode: "development",
   devtool: 'inline-source-map',
   entry: ['./src/js/index.ts'],
   plugins: [
      new webpack.ProvidePlugin({
         $: 'jquery',
         jQuery: 'jquery',
         'windows.jQuery': 'jquery',
      }),
      new CopyPlugin([{
         from: 'src/*.json',
         to: '[name].json'
      }]),
      new HtmlWebpackPlugin({
         title: "Bookmarks",
         template: "src/index.html",
         inject: true,
         minify: {
            removeComments: true,
            collapseWhitespace: true
         }
      }),
      new BrowserSyncPlugin({
         server: {
            baseDir: ['dist']
         },

         host: 'localhost',
         port: 3000,
         files: ["./dist/*"]
         // proxy the Webpack Dev Server endpoint
         // (which should be serving on http://localhost:8080/)
         // through BrowserSync
         // proxy: 'http://localhost:8080/'
      }, {
         // prevent BrowserSync from reloading the page
         // and let Webpack Dev Server take care of this
         reload: false
      }),

   ],
   output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
   },
   module: {
      rules: [{
            test: /\.(ico|svg|jpe?g|gif|png|ttf|eot|woff|otf)$/,
            use: [{
               loader: 'file-loader',
               options: {
                  name: '[name].[ext]',
                  outputPath: '/'
               }
            }]
         }, {
            // https://webpack.js.org/loaders/postcss-loader/
            test: /\.css$/,

            use: ['style-loader', {
                  loader: 'css-loader',
                  // options: {
                  //    importLoaders: 1
                  // }
               },
               {
                  loader: 'postcss-loader'
               }
            ]
         },

         {
            test: /\.(ts|js)$/,
            use: 'babel-loader',
            exclude: /node_modules/

         },
         {
            test: /\.html$/,
            use: [{
               loader: 'html-loader',
               options: {
                  minimize: true
               },
            }],
         },
      ]
   },
   resolve: {
      extensions: ['.ts', '.js']
   }

};