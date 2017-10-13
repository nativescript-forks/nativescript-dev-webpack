const utils = require("./utils");
const { spawn } = require("child_process");
const { join } = require("path");
let hasBeenInvoked = false;

function escapeWithQuotes(arg) {
	return `"${arg}"`;
}

function spawnChildProcess(projectDir, command, ...args) {
	return new Promise((resolve, reject) => {
		const escapedArgs = args.map(escapeWithQuotes)

		const childProcess = spawn(command, escapedArgs, {
			stdio: "inherit",
			pwd: projectDir,
			shell: true,
		});

		childProcess.on("close", code => {
			if (code === 0) {
				resolve();
			} else {
				reject({
					code,
					message: `child process exited with code ${code}`,
				});
			}
		});
	});
}


function shouldUglify() {
	return true;
}

function throwError(error) {
	console.error(error.message);
	process.exit(error.code || 1);
}

function prepareJSWebpack(config, $mobileHelper, $projectData, originalArgs, originalMethod) {
	if (!hasBeenInvoked && config.bundle && config.release) {
		hasBeenInvoked = true;
		return new Promise(function (resolve, reject) {
			console.log(`Running webpack for ${config.platform}...`);

			const args = [
				$projectData.projectDir,
				"node",
				"--preserve-symlinks",
				join($projectData.projectDir, "node_modules", "webpack", "bin", "webpack.js"),
				"--config=webpack.config.js",
				"--progress",
				`--env.${config.platform.toLowerCase()}`,
				...config.env.map(item => `--${item}`),
				shouldUglify() && `--env.uglify`,
				utils.shouldSnapshot($mobileHelper, config.platform, config.bundle) && `--env.snapshot`
			].filter(a => !!a);

			spawnChildProcess(...args)
				.then(resolve)
				.catch(throwError);
		});
	}
}

module.exports = function ($mobileHelper, $projectData, hookArgs) {
	const env = [];
	const platform = hookArgs.jsNodeModulesData && hookArgs.jsNodeModulesData.platform || hookArgs.copyAppFilesData.platformData.normalizedPlatformName;
	const appFilesUpdaterOptions = (hookArgs.jsNodeModulesData || hookArgs.copyAppFilesData).appFilesUpdaterOptions;
	const config = {
		env,
		platform,
		release: appFilesUpdaterOptions.release,
		bundle: appFilesUpdaterOptions.bundle
	};

	return config.release && config.bundle && prepareJSWebpack.bind(prepareJSWebpack, config, $mobileHelper, $projectData);
}
