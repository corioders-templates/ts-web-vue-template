const config = require('./config');
if (config.IS_PRODUCTION) console.warn('Waring: using webpack dev config in production env');

const common = require('./webpack.common.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackConfig = {
	...common.webpackConfig,
	mode: 'development',
	devtool: 'source-map',
};

if (config.IS_WATCH) {
	webpackConfig.plugins.push(new HtmlWebpackPlugin());
}

module.exports = webpackConfig;
