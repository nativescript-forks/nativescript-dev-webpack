const parseFile = require("path").parse;

function PlatformSuffixPlugin(platform, platforms) {
    this.platform = platform;
    this.platforms = platforms || ["ios", "android"];
}
module.exports = PlatformSuffixPlugin;

PlatformSuffixPlugin.prototype.apply = function(resolver) {
    var platform = this.platform;
    var platforms = this.platforms;

    resolver.plugin("file", function(request, callback) {
        const fs = this.fileSystem;
        const file = this.join(request.path, request.request);
        const query = request.query;
        const pFile = parseFile(file);
        const platformFile = this.join(pFile.dir, pFile.name + ("." + platform) + pFile.ext);
        fs.stat(platformFile, (err, stat) => {
            if (!err && stat && stat.isFile()) {
                const err = undefined;
                const path = platformFile;
                callback(err, { file: true, path, query });
            } else {
                fs.stat(file, (err, stat) => {
                    if (!err && stat && stat.isFile()) {
                        const err = undefined;
                        const path = file;
                        callback(err, { file: true, path, query });
                    } else {
                        callback();
                    }
                });
            }
        });
    });
}
