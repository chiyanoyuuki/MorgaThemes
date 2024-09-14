const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  plugins: [
    new NodePolyfillPlugin()
  ],
  resolve: {
    fallback: {
      "fs": require.resolve("fs"),
      "path": require.resolve("path-browserify"),
      "buffer": require.resolve("buffer/")
    }
  }
};