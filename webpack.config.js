var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    lib: "./lib/index",
  },
  output: {
    path: 'dist',
    filename: "index.js",
    libraryTarget: 'commonjs2'
  },
  externals: {
    mongoose: true,
    lodash: true
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        include: [path.resolve('lib')], 
        loaders: ['babel-loader'] 
      }
    ]
  }
}