const config = require('./config');
if (!config.IS_PRODUCTION) console.warn('Waring: using webpack prod config not in production env');

const common = require('./webpack.common.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const JsMinimizerPlugin = require('terser-webpack-plugin');

const webpackConfig = {
	...common.webpackConfig,
	mode: 'production',
	devtool: config.IS_DEBUG ? 'source-map' : false,

	optimization: {
		minimizer: [new JsMinimizerPlugin({ extractComments: false, terserOptions: { toplevel: true, compress: { passes: 10 } } })],
	},

	devServer: common.webpackConfig.devServer,
};

webpackConfig.plugins.push(
	new HtmlWebpackPlugin({
		...common.pluginsOptions.htmlWebpackPlugin,
		minify: {
			caseSensitive: false,
			removeComments: true,
			collapseWhitespace: true,
			removeRedundantAttributes: true,
			useShortDoctype: false,
			minifyJS: true,
			minifyCSS: true,
			minifyURLs: true,
			sortAttributes: true,
			sortClassName: true,
		},
	}),
);

module.exports = webpackConfig;
