// Babel configs for js files needs to be in another file so eslint can use them, and then NODE_ENV is not specified.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('./config.js');

module.exports = {
	sourceType: 'unambiguous',

	plugins: [['@babel/plugin-transform-typescript', { optimizeConstEnums: true }], '@babel/plugin-transform-runtime'],
};
