// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const isProduction = process.env.NODE_ENV == 'development';
/**
 * @type {import('webpack').Configuration}
 */
const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../../dist/preload'),
    filename: 'bundle.js'
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
  target: 'electron-preload',
  context: __dirname,
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'development';
  } else {
    config.mode = 'production';
  }
  return config;
};
