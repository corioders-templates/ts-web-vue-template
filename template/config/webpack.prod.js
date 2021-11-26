const config = require('./config');
if (!config.IS_PRODUCTION) console.warn('Waring: using webpack prod config not in production env');

const common = require('./webpack.common.js');

const JsMinimizerPlugin = require('terser-webpack-plugin');

module.exports = {
	...common.webpack,
	mode: 'production',
	devtool: config.IS_DEBUG ? 'source-map' : false,

	optimization: {
		minimizer: [new JsMinimizerPlugin({ extractComments: false, terserOptions: { toplevel: true, compress: { passes: 10 } } })],
	},

	devServer: common.webpack.devServer,
};
