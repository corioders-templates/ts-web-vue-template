const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

class OnlyWebpackErrorsInForkTsCheckerWebpackPlugin {
	apply(compiler) {
		const hooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);

		hooks.issues.tap('OnlyWebpackErrorsInForkTsCheckerWebpackPlugin', (issues, compilation) => {
			const files = new Set();
			for (const module of compilation.modules) {
				if (module.resource) {
					files.add(module.resource);
				}
			}

			// Display errors only for files that are managed by webpack.
			return issues.filter((issue) => {
				if (issue.file === undefined) return false;
				else return files.has(issue.file);
			});
		});
	}
}

module.exports = OnlyWebpackErrorsInForkTsCheckerWebpackPlugin;
