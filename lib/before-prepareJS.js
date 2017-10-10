const utils = require("./utils");
const { spawn } = require("child_process");
const { join } = require("path");

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

function prepareJSWebpack(platform, env, bundle, $mobileHelper, $projectData) {
	return new Promise(function (resolve, reject) {
		console.log(`Running webpack for ${platform}...`);

		const args = [
			$projectData.projectDir,
			"node",
			"--preserve-symlinks",
			join($projectData.projectDir, "node_modules", "webpack", "bin", "webpack.js"),
			"--config=webpack.config.js",
			"--progress",
			`--env.${platform}`,
			...env.map(item => `--${item}`),
			shouldUglify() && `--env.uglify`,
			utils.shouldSnapshot($mobileHelper, platform, bundle) && `--env.snapshot`
		].filter(a => !!a);

		spawnChildProcess(...args)
			.then(resolve)
			.catch(throwError);
	});
}

module.exports = function ($mobileHelper, $projectData) {
	const platform = "android";
	const bundle = true;
	const env = [];

	return prepareJSWebpack.bind(prepareJSWebpack, platform, env, bundle, $mobileHelper, $projectData);
}
