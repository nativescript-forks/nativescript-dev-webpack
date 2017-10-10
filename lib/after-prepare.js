const snapshotGenerator = require("../snapshot/android/project-snapshot-generator");
const utils = require("./utils");

module.exports = function ($mobileHelper, $projectData) {
	const platform = "android";
	const bundle = true;
	if (utils.shouldSnapshot($mobileHelper, platform, bundle)) {
		snapshotGenerator.installSnapshotArtefacts($projectData.projectDir);
	}
}
