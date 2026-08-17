"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
function cleanup() {
    let directory;
    try {
        const main = require.resolve("uWebSockets.js");
        directory = (0, path_1.dirname)(main);
    }
    catch {
        return;
    }
    const keep = "uws_" + process.platform + "_" + process.arch + "_" + process.versions.modules + ".node";
    if (!(0, fs_1.existsSync)((0, path_1.join)(directory, keep))) {
        return;
    }
    const files = (0, fs_1.readdirSync)(directory);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.startsWith("uws_") && file.endsWith(".node")) {
            if (file !== keep) {
                const path = (0, path_1.join)(directory, file);
                try {
                    (0, fs_1.unlinkSync)(path);
                }
                catch {
                }
            }
        }
    }
}
cleanup();
