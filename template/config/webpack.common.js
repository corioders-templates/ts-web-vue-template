const path = require('path');

const config = require('./config.js');

const { DefinePlugin } = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const WebpackBar = require('webpackbar');

const browserSyncReloadPlugin = require(path.resolve(config.MORE.BROWSER_SYNC_PLUGINS_PATH, 'reloadPlugin'));

const paths = {
	src: path.resolve(config.ROOT_PATH, 'src'),
	out: path.resolve(config.ROOT_PATH, 'out'),
	cache: path.resolve(config.ROOT_PATH, 'node_modules/.cache/webpack'),

	eslintConfig: path.resolve(config.ROOT_PATH, '.eslintrc.js'),
	tsConfig: path.resolve(config.ROOT_PATH, 'tsconfig.json'),
	babelConfig: path.resolve(config.CONFIG_PATH, 'babel.config.js'),
};

const loaderOptions = {};
loaderOptions.babel = {
	configFile: paths.babelConfig,
	cacheDirectory: true,
};

const aliases = require(path.resolve(config.CONFIG_PATH, 'alias.json'));
for (const key in aliases) aliases[key] = path.resolve(config.ROOT_PATH, aliases[key]);

const webpackConfig = {
	context: config.ROOT_PATH,
	entry: path.resolve(paths.src, 'index.ts'),

	// target: (see webpack.js.org/configuration/target),
	output: {
		clean: true,
		path: paths.out,
		filename: `${config.IS_PRODUCTION && !config.IS_ANALYZE ? '[contenthash]' : '[name]'}.js`,
		publicPath: '/',
	},

	resolve: {
		alias: {
			...aliases,
		},
		extensions: ['.ts', '.js'],
	},

	cache: {
		type: 'memory',
		// type: 'filesystem',
		// name: `${config.IS_PRODUCTION ? 'production' : 'development'}-${config.IS_FAST ? 'fast' : 'nonFast'}-${config.IS_DEBUG ? 'debug' : 'nonDebug'}`,
		// cacheDirectory: paths.cache,
	},

	module: {
		rules: [
			// =========================================================================
			// loaders
			{
				test: /\.ts$/,
				use: [
					{
						loader: 'babel-loader',
						options: loaderOptions.babel,
					},
				],
			},
		],
	},

	plugins: [
		...(config.IS_ANALYZE ? [new BundleAnalyzerPlugin()] : []),

		new DefinePlugin({
			__IS_PRODUCTION__: config.IS_PRODUCTION,
		}),

		new ForkTsCheckerWebpackPlugin({
			typescript: {
				memoryLimit: 4096,
				context: config.ROOT_PATH,
			},
		}),

		new ESLintPlugin({
			extensions: ['js', 'ts'],
			lintDirtyModulesOnly: true,
		}),

		new BrowserSyncPlugin(
			{
				host: config.ENV.HOST,
				port: 8080,
				proxy: `http://${config.ENV.HOST}:8081/`,
				open: false,
				logLevel: 'silent',
				ui: { port: 8082 },
				plugins: [browserSyncReloadPlugin],
			},
			{ reload: false },
		),

		{
			PLUGIN_NAME: 'logging',
			/**
			 *
			 * @param {import('webpack').Compiler} compiler
			 */
			apply(compiler) {
				let chalk;
        
				// Disable webpack-dev-server output.
				compiler.hooks.infrastructureLog.tap(this.PLUGIN_NAME, (name, type, args) => {
					if (name == 'webpack-dev-server') return true;
				});

				const friendlyErrorsOutput = require('@soda/friendly-errors-webpack-plugin/src/output');
				class FriendlyErrorsWebpackPluginModified extends FriendlyErrorsWebpackPlugin {
					constructor() {
						super(...arguments);
					}
					displayDevServerInfo() {
						friendlyErrorsOutput.info(
							`Browser sync running at: ${chalk.cyan(`http://${config.ENV.HOST}:8080/`)} and ui: ${chalk.cyan(`http://${config.ENV.HOST}:8082/`)}`,
						);
						friendlyErrorsOutput.info(`Main app running at: ${chalk.cyan(`http://${config.ENV.HOST}:8081/`)}`);
					}
					displayErrors() {
						this.displayDevServerInfo();
						super.displayErrors.apply(this, arguments);
					}
					displaySuccess() {
						this.displayDevServerInfo();
						super.displaySuccess.apply(this, arguments);
					}
				}

				class WebpackBarModified extends WebpackBar {
					constructor() {
						super(...arguments);
					}

					updateProgress() {
						if (!this.state.done) super.updateProgress.apply(this, arguments);
					}
				}

				let once = false;
				const addLogging = async (isWatching) => {
					if (once) return;
					once = true;

					// Load chalk.
					const chalkESM = await import('chalk');
					chalk = chalkESM.default;

					const webpackBar = new WebpackBarModified();
					webpackBar._ensureState();
					webpackBar.apply(compiler);

					if (isWatching) {
						const friendlyErrors = new FriendlyErrorsWebpackPluginModified();
						friendlyErrors.apply(compiler);
					}
				};

				compiler.hooks.watchRun.tapPromise(this.PLUGIN_NAME, addLogging.bind(undefined, true));
				compiler.hooks.beforeRun.tapPromise(this.PLUGIN_NAME, addLogging.bind(undefined, false));
			},
		},
	],

	devServer: {
		host: config.ENV.HOST,
		port: 8081,
		hot: 'only',
		client: {
			logging: 'none',
		},
		devMiddleware: {
			writeToDisk: config.IS_DEBUG,
		},
		static: {
			publicPath: '/',
		},
	},
};

module.exports = {
	webpackConfig,
	paths,
};
