const path = require('path');

const config = require('./config.js');

const { DefinePlugin } = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const WebpackBar = require('webpackbar');

const browserSyncReloadPlugin = require(path.resolve(config.MORE.BROWSER_SYNC_PATH, 'reloadPlugin'));
const OnlyWebpackErrorsInForkTsCheckerWebpackPlugin = require(path.resolve(config.MORE.WEBPACK_PATH, 'onlyWebpackErrorsInForkTsCheckerWebpackPlugin.js'));

const paths = {
	src: path.resolve(config.ROOT_PATH, 'src'),
	out: path.resolve(config.ROOT_PATH, 'out'),
	cache: path.resolve(config.ROOT_PATH, 'node_modules/.cache/webpack'),

	eslintConfig: path.resolve(config.ROOT_PATH, '.eslintrc.js'),
	tsConfig: path.resolve(config.ROOT_PATH, 'tsconfig.json'),
	babelConfig: path.resolve(config.CONFIG_PATH, 'babel.config.js'),
};

const pluginsOptions = {};
pluginsOptions.htmlWebpackPlugin = {
	favicon: path.resolve(config.ROOT_PATH, 'src/public/favicon.ico'),
	template: path.resolve(config.ROOT_PATH, 'src/public/index.html'),
};

const loaderOptions = {};
loaderOptions.babel = {
	configFile: paths.babelConfig,
	cacheDirectory: true,
};
loaderOptions.postcss = {
	postcssOptions: {
		syntax: 'postcss-scss',
		plugins: ['stylelint', 'postcss-preset-env'],
	},
};
loaderOptions.sass = {
	webpackImporter: true,
};
loaderOptions.vue = {
	exposeFilename: config.IS_DEBUG || !config.IS_PRODUCTION,
};

const aliases = require(path.resolve(config.CONFIG_PATH, 'alias.json'));
for (const key in aliases) aliases[key] = path.resolve(config.ROOT_PATH, aliases[key]);

const filename = `${config.IS_PRODUCTION && !config.IS_ANALYZE ? '[contenthash]' : '[name]'}.js`;
const webpackConfig = {
	context: config.ROOT_PATH,
	entry: path.resolve(paths.src, 'index.ts'),

	// target: (see webpack.js.org/configuration/target),
	output: {
		clean: true,
		path: paths.out,
		filename,
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
			// asset
			{
				// Include all assets listed in types/assets.d.ts
				test: /assets\/.*(\.txt|\.json|\.apng|\.gif|\.jpg|\.jpeg|\.jfif|\.pjpeg|\.pjp|\.png|\.svg|\.webp|\.bmp|\.ico|\.cur|\.tif|\.tiff|\.wav|\.wave|\.mp3|\.aac|\.caf|\.flac|\.mp4|\.webm|\.3gp|\.dat|\.mpg|\.mpeg|\.mp1|\.mp2|\.mp3|\.m1v|\.m1a|\.m2a|\.mpa|\.mpv|\.mov|\.ogg|\.ogv|\.oga|\.ogx|\.ogm|\.spx|\.opus)/,
				type: 'asset',
			},

			// =========================================================================
			// loaders
			{
				test: /\.(ts|js)$/,
				exclude: /node_modules\/(core-js|css-loader)/,
				use: [
					{
						loader: 'babel-loader',
						options: loaderOptions.babel,
					},
				],
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'sass-loader',
						options: loaderOptions.sass,
					},
					{
						loader: 'postcss-loader',
						options: loaderOptions.postcss,
					},
				],
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: loaderOptions.vue,
			},
		],
	},

	plugins: [
		...(config.IS_ANALYZE ? [new BundleAnalyzerPlugin()] : []),

		new VueLoaderPlugin(),

		new DefinePlugin({
			__IS_PRODUCTION__: config.IS_PRODUCTION,
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
		}),

		new MiniCssExtractPlugin({
			filename: `${filename}.css`,
			chunkFilename: `${filename}.css`,
		}),

		new ForkTsCheckerWebpackPlugin({
			typescript: {
				memoryLimit: 4096,
				context: config.ROOT_PATH,
				extensions: {
					vue: {
						enabled: true,
						compiler: '@vue/compiler-sfc',
					},
				},
			},
		}),
		new OnlyWebpackErrorsInForkTsCheckerWebpackPlugin(),

		new ESLintPlugin({
			extensions: ['js', 'ts', 'vue'],
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

	pluginsOptions,
};
