const path = require("path");
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

var Visualizer = require('webpack-visualizer-plugin');

module.exports = {
   entry: ['./src/js/index.ts'],
   plugins: [
      new Visualizer(),
      new webpack.ProvidePlugin({
         $: 'jquery',
         jQuery: 'jquery',
         'windows.jQuery': 'jquery',
      }),
      new CopyPlugin([{
            from: 'src/*.json',
            to: 'json/[name].json'
         },
         {
            from: "src/favicon.ico",
            to: "favicon.ico"
         }
      ]),
      new HtmlWebpackPlugin({
         title: "Bookmarks",
         template: "src/index.html",
         inject: true,
         minify: {
            removeComments: true,
            collapseWhitespace: true
         }
      })
   ],
   output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
   },
   module: {
      rules: [{
            test: /\.(ico|json|svg|jpe?g|gif|png|ttf|eot|woff|otf)$/,
            use: [{
               loader: 'file-loader',
               options: {
                  name: 'assets/[name].[ext]'
               }
            }]
         },
         {
            // https://webpack.js.org/loaders/postcss-loader/
            test: /\.css$/,

            use: ['style-loader', {
                  loader: 'css-loader',
                  options: {
                     importLoaders: 1
                  }
               },
               {
                  loader: 'postcss-loader'
               }
            ]
         },
         {
            test: /\.(ts|js)$/,
            use: {
               loader: 'babel-loader',
               options: {
                  "presets": [
                     "@babel/env",
                     "@babel/preset-typescript"
                  ],
                  "plugins": [
                     "@babel/proposal-class-properties",
                     "@babel/proposal-object-rest-spread"
                  ],
                  cacheDirectory: true
               }
            },
            exclude: /node_modules/,

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