import { unlinkSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";

function cleanup(): void {
    let directory: string;
    try {
        const main = require.resolve("uWebSockets.js");
        directory = dirname(main);
    } catch {
        return;
    }
    const keep = "uws_" + process.platform + "_" + process.arch + "_" + process.versions.modules + ".node";
    if (!existsSync(join(directory, keep))) {
        return;
    }
    const files = readdirSync(directory);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.startsWith("uws_") && file.endsWith(".node")) {
            if (file !== keep) {
                const path = join(directory, file);
                try {
                    unlinkSync(path);
                } catch {
                }
            }
        }
    }
}

cleanup();
