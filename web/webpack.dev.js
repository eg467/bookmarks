const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = merge(common, {
   mode: "development",
   devtool: 'inline-source-map',
   plugins: [
      new BrowserSyncPlugin({
         server: {
            baseDir: ['dist']
         },
         //https: true,
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
      })
   ]
});