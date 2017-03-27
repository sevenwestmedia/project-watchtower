"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var build_1 = require("../lib/bin/build");
var args = process.argv.slice(2);
var command = args[0];
var commandArgs = args.slice(1);
switch (command) {
    case 'build':
        build_1.default(commandArgs);
        break;
    default:
        console.error('No or invalid script specified!');
}
//# sourceMappingURL=project-watchtower.js.map