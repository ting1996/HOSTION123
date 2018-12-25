const webpack = require('webpack');

module.exports = {
  entry: './app/app.js',
  watch: true,
  output: {
    path: __dirname,
    filename: './public/bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin()
  ],
  resolve: {
    modules: [__dirname, 'node_modules'],
    alias: {
      reducer: 'app/reducer/reducer.js',
      store: 'app/storeConfig.js'
    }
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-0']
        },
        test: /\.jsx?$/,
        exclude: /node_modules/
      },
      {
        loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
        test: /\.css$/
      }
    ]
  },
  node: {
    fs: 'empty',
  }
};
