console.log("Here: " + __dirname);

const parse = require("tns-core-modules/css").parse;

const nl = "\n";

function escape(string) {
    return JSON.stringify(string);
}

function importsFrom(ast) {
    if (!ast || ast.type !== "stylesheet" || !ast.stylesheet) {
        return [];
    }
    return ast.stylesheet.rules
        .filter(rule => rule.type === "import")
        .map(importRule => importRule.import.replace(/[\'\"]/gm, ""));
}

// Identity loader
module.exports = function(content) {
    this.cacheable && this.cacheable();
    this.value = content;
    const ast = parse(content);

    let dependencies = "";

    importsFrom(ast).forEach(uri => {
        if (uri[0] === "~" && uri[1] !== "/") {
            // Require form node modules from `~nativescript-theme` like imports.
            dependencies += `global.registerModule(${escape(uri)}, () => require(${escape(uri.substr(1))}));${nl}`;
        } else {
            dependencies += `global.registerModule(${escape(uri)}, () => require(${escape(uri)});${nl}`;
        }
    });

    const str = JSON.stringify(ast, (k, v) => k === "position" ? undefined : v);
    return `${dependencies}module.exports = ${str};`;
}
module.exports.seperable = true;

